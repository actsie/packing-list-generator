import { Trip, PackingItem, Category, Priority, DEFAULT_HEURISTICS, HeuristicConfig } from './types';

export class PackingHeuristics {
  private config: HeuristicConfig;

  constructor(config: HeuristicConfig = DEFAULT_HEURISTICS) {
    this.config = config;
  }

  generateSuggestions(trip: Trip): PackingItem[] {
    const suggestions: PackingItem[] = [];
    const now = new Date().toISOString();

    // Apply heuristics based on trip parameters
    suggestions.push(...this.generateClothingSuggestions(trip, now));
    suggestions.push(...this.generateToiletriesSuggestions(trip, now));
    suggestions.push(...this.generateTechSuggestions(trip, now));
    suggestions.push(...this.generateDocumentSuggestions(trip, now));
    suggestions.push(...this.generateActivitySuggestions(trip, now));

    return suggestions;
  }

  applyHeuristicsToItems(trip: Trip, items: PackingItem[]): PackingItem[] {
    return items.map(item => {
      const quantity = this.calculateQuantityForItem(trip, item);
      return { ...item, quantity };
    });
  }

  calculateQuantityForItem(trip: Trip, item: PackingItem): number {
    if (!trip || !item) return item.quantity || 1;
    
    const itemNameLower = item.name.toLowerCase();
    const categoryLower = item.category.toLowerCase();
    const tripDays = Math.max(1, trip.days || 1);

    // Clothing calculations
    if (categoryLower === 'tops' || itemNameLower.includes('shirt') || itemNameLower.includes('top')) {
      return trip.laundry 
        ? Math.min(tripDays, this.config.tops.withLaundry)
        : Math.min(tripDays, Math.ceil(this.config.tops.withoutLaundry * tripDays));
    }

    if (categoryLower === 'bottoms' || itemNameLower.includes('pants') || itemNameLower.includes('shorts')) {
      return Math.max(1, Math.ceil(tripDays / this.config.bottoms.ratio));
    }

    if (categoryLower === 'underwear' || itemNameLower.includes('underwear') || itemNameLower.includes('socks')) {
      return Math.max(1, tripDays + this.config.underwear.extra);
    }

    if (itemNameLower.includes('sleepwear') || itemNameLower.includes('pajama') || itemNameLower.includes('sleep')) {
      return Math.max(1, Math.ceil(tripDays / this.config.sleepwear.per));
    }

    // Activity-based calculations
    if (trip.activities?.includes('Beach/Swimming') || trip.destinationType === 'beach') {
      if (itemNameLower.includes('swimwear') || itemNameLower.includes('bikini') || itemNameLower.includes('swim')) {
        return tripDays >= this.config.swim.minDays ? this.config.swim.qty : 1;
      }
    }

    if (trip.activities?.includes('Gym/Fitness')) {
      if (itemNameLower.includes('gym') || itemNameLower.includes('workout') || itemNameLower.includes('athletic')) {
        return tripDays >= this.config.gym.longThreshold ? this.config.gym.long : this.config.gym.short;
      }
    }

    // Default quantity
    return item.quantity || 1;
  }

  getHeuristicExplanation(trip: Trip, item: PackingItem): string {
    const itemNameLower = item.name.toLowerCase();
    const categoryLower = item.category.toLowerCase();
    const quantity = this.calculateQuantityForItem(trip, item);

    if (categoryLower === 'tops' || itemNameLower.includes('shirt') || itemNameLower.includes('top')) {
      return trip.laundry 
        ? `${quantity} tops suggested (laundry available, max ${this.config.tops.withLaundry} per trip)`
        : `${quantity} tops suggested (${trip.days} days, 1 per day)`;
    }

    if (categoryLower === 'bottoms' || itemNameLower.includes('pants') || itemNameLower.includes('shorts')) {
      return `${quantity} bottoms suggested (${trip.days} days ÷ ${this.config.bottoms.ratio} = ${quantity})`;
    }

    if (categoryLower === 'underwear' || itemNameLower.includes('underwear') || itemNameLower.includes('socks')) {
      return `${quantity} suggested (${trip.days} days + ${this.config.underwear.extra} extra)`;
    }

    if (itemNameLower.includes('sleepwear') || itemNameLower.includes('pajama') || itemNameLower.includes('sleep')) {
      return `${quantity} suggested (1 per ${this.config.sleepwear.per} days)`;
    }

    if (trip.activities.includes('Beach/Swimming') && 
        (itemNameLower.includes('swimwear') || itemNameLower.includes('swim'))) {
      return trip.days >= this.config.swim.minDays 
        ? `${quantity} suggested for beach trips ${this.config.swim.minDays}+ days`
        : `${quantity} sufficient for short beach trip`;
    }

    if (trip.activities.includes('Gym/Fitness') && 
        (itemNameLower.includes('gym') || itemNameLower.includes('workout'))) {
      return trip.days >= this.config.gym.longThreshold 
        ? `${quantity} suggested for trips ${this.config.gym.longThreshold}+ days`
        : `${quantity} sufficient for trips under ${this.config.gym.longThreshold} days`;
    }

    return `${quantity} suggested based on trip parameters`;
  }

  private generateClothingSuggestions(trip: Trip, timestamp: string): PackingItem[] {
    const items: PackingItem[] = [];
    
    // Tops calculation
    const topsQty = trip.laundry 
      ? Math.min(trip.days, this.config.tops.withLaundry)
      : Math.min(trip.days, this.config.tops.withoutLaundry * trip.days);
    
    items.push(this.createItem('tops', 'T-shirts/Shirts', topsQty, false, trip.id, timestamp));
    
    // Bottoms calculation
    const bottomsQty = Math.ceil(trip.days / this.config.bottoms.ratio);
    items.push(this.createItem('bottoms', 'Pants/Shorts', bottomsQty, false, trip.id, timestamp));
    
    // Underwear calculation
    const underwearQty = trip.days + this.config.underwear.extra;
    items.push(this.createItem('underwear', 'Underwear', underwearQty, false, trip.id, timestamp));
    items.push(this.createItem('underwear', 'Socks', underwearQty, false, trip.id, timestamp));
    
    // Sleepwear
    const sleepwearQty = Math.max(1, Math.ceil(trip.days / this.config.sleepwear.per));
    items.push(this.createItem('underwear', 'Sleepwear', sleepwearQty, false, trip.id, timestamp));
    
    // Shoes
    items.push(this.createItem('shoes', 'Walking shoes', 1, false, trip.id, timestamp));
    
    if (trip.destinationType === 'beach') {
      items.push(this.createItem('shoes', 'Sandals', 1, false, trip.id, timestamp));
    }
    
    // Season-specific outerwear
    if (trip.season === 'winter' || trip.destinationType === 'mountain') {
      items.push(this.createItem('outerwear', 'Warm jacket', 1, false, trip.id, timestamp));
    }
    
    if (trip.season === 'fall' || trip.season === 'spring') {
      items.push(this.createItem('outerwear', 'Light jacket', 1, false, trip.id, timestamp));
    }
    
    return items;
  }

  private generateToiletriesSuggestions(trip: Trip, timestamp: string): PackingItem[] {
    const items: PackingItem[] = [];
    
    // Basic toiletries
    const basicToiletries = [
      'Toothbrush',
      'Toothpaste',
      'Shampoo',
      'Body wash',
      'Deodorant',
      'Skincare',
    ];
    
    basicToiletries.forEach(item => {
      items.push(this.createItem('toiletries', item, 1, false, trip.id, timestamp));
    });
    
    // Destination-specific
    if (trip.destinationType === 'beach') {
      items.push(this.createItem('toiletries', 'Sunscreen', 1, false, trip.id, timestamp));
      items.push(this.createItem('toiletries', 'After-sun lotion', 1, false, trip.id, timestamp));
    }
    
    return items;
  }

  private generateTechSuggestions(trip: Trip, timestamp: string): PackingItem[] {
    const items: PackingItem[] = [];
    
    // Essential tech items
    items.push(this.createItem('tech', 'Phone charger', 1, true, trip.id, timestamp));
    items.push(this.createItem('tech', 'Power bank', 1, true, trip.id, timestamp));
    
    // Optional tech
    items.push(this.createItem('tech', 'Camera', 1, false, trip.id, timestamp));
    items.push(this.createItem('tech', 'Headphones', 1, false, trip.id, timestamp));
    
    // International travel
    if (trip.activities.includes('international')) {
      items.push(this.createItem('tech', 'Travel adapter', 1, true, trip.id, timestamp));
    }
    
    return items;
  }

  private generateDocumentSuggestions(trip: Trip, timestamp: string): PackingItem[] {
    const items: PackingItem[] = [];
    
    // Essential documents
    items.push(this.createItem('documents', 'ID/Passport', 1, true, trip.id, timestamp));
    items.push(this.createItem('documents', 'Credit cards', 1, true, trip.id, timestamp));
    items.push(this.createItem('documents', 'Travel insurance', 1, false, trip.id, timestamp));
    
    if (trip.activities.includes('international')) {
      items.push(this.createItem('documents', 'Visa (if needed)', 1, true, trip.id, timestamp));
    }
    
    return items;
  }

  private generateActivitySuggestions(trip: Trip, timestamp: string): PackingItem[] {
    const items: PackingItem[] = [];
    
    // Activity-specific items
    if (trip.activities.includes('hiking')) {
      items.push(this.createItem('shoes', 'Hiking boots', 1, false, trip.id, timestamp));
      items.push(this.createItem('accessories', 'Hiking backpack', 1, false, trip.id, timestamp));
      items.push(this.createItem('accessories', 'Water bottle', 1, false, trip.id, timestamp));
    }
    
    if (trip.activities.includes('beach') || trip.destinationType === 'beach') {
      if (trip.days >= this.config.swim.minDays) {
        items.push(this.createItem('misc', 'Swimwear', this.config.swim.qty, false, trip.id, timestamp));
        items.push(this.createItem('accessories', 'Beach towel', 1, false, trip.id, timestamp));
      }
    }
    
    if (trip.activities.includes('gym') || trip.activities.includes('fitness')) {
      const gymQty = trip.days >= this.config.gym.longThreshold ? this.config.gym.long : this.config.gym.short;
      items.push(this.createItem('misc', 'Gym clothes', gymQty, false, trip.id, timestamp));
      items.push(this.createItem('shoes', 'Athletic shoes', 1, false, trip.id, timestamp));
    }
    
    if (trip.activities.includes('formal')) {
      items.push(this.createItem('tops', 'Formal shirt', 1, false, trip.id, timestamp));
      items.push(this.createItem('bottoms', 'Dress pants', 1, false, trip.id, timestamp));
      items.push(this.createItem('shoes', 'Dress shoes', 1, false, trip.id, timestamp));
    }
    
    return items;
  }

  private createItem(
    category: string,
    name: string,
    qty: number,
    essential: boolean,
    tripId: string,
    timestamp: string
  ): PackingItem {
    return {
      id: `item-${Date.now()}-${Math.random()}`,
      category,
      name,
      quantity: qty,
      essential,
      packed: false,
      notes: ''
    };
  }

  updateConfig(newConfig: Partial<HeuristicConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  getConfig(): HeuristicConfig {
    return { ...this.config };
  }

  resetConfig(): void {
    this.config = { ...DEFAULT_HEURISTICS };
  }
}