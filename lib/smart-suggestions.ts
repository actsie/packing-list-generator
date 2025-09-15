import { Trip, TripSuggestion, PackingItem } from './types'

export function generateSmartSuggestions(trip: Trip): TripSuggestion[] {
  const suggestions: TripSuggestion[] = []
  let suggestionId = 0

  // Calculate trip duration
  const days = trip.days

  // Clothing quantity suggestions based on laundry access
  if (trip.laundry) {
    // With laundry, suggest fewer quantities
    const topsItem = trip.checklistItems.find(item => item.category === 'tops' && item.name.includes('T-shirt'))
    if (topsItem && topsItem.quantity > 5) {
      suggestions.push({
        id: `sug-${suggestionId++}`,
        type: 'update',
        targetItemId: topsItem.id,
        item: { ...topsItem, quantity: 5 },
        originalQuantity: topsItem.quantity,
        reason: `With laundry access, reduce from ${topsItem.quantity} to 5 tops (you can wash mid-trip)`,
        category: 'clothing',
        applied: false
      })
    }

    // Suggest reducing other clothing items with laundry
    const clothingCategories = ['bottoms', 'underwear', 'socks']
    clothingCategories.forEach(category => {
      const items = trip.checklistItems.filter(item => item.category === category)
      items.forEach(item => {
        const suggestedQty = Math.min(item.quantity, Math.ceil(days / 2) + 1)
        if (item.quantity > suggestedQty) {
          suggestions.push({
            id: `sug-${suggestionId++}`,
            type: 'update',
            targetItemId: item.id,
            item: { ...item, quantity: suggestedQty },
            originalQuantity: item.quantity,
            reason: `With laundry access, reduce ${item.name} from ${item.quantity} to ${suggestedQty}`,
            category: 'clothing',
            applied: false
          })
        }
      })
    })
  } else {
    // Without laundry, suggest more quantities
    const underwearItem = trip.checklistItems.find(item => item.category === 'underwear')
    if (underwearItem && underwearItem.quantity < days + 1) {
      suggestions.push({
        id: `sug-${suggestionId++}`,
        type: 'update',
        targetItemId: underwearItem.id,
        item: { ...underwearItem, quantity: days + 1 },
        originalQuantity: underwearItem.quantity,
        reason: `Without laundry, increase underwear from ${underwearItem.quantity} to ${days + 1} pairs (1 per day + 1 spare)`,
        category: 'clothing',
        applied: false
      })
    }

    // Suggest quantities for other essentials
    const socksItem = trip.checklistItems.find(item => item.category === 'socks' || item.name.toLowerCase().includes('socks'))
    if (socksItem && socksItem.quantity < days + 1) {
      suggestions.push({
        id: `sug-${suggestionId++}`,
        type: 'update',
        targetItemId: socksItem.id,
        item: { ...socksItem, quantity: days + 1 },
        originalQuantity: socksItem.quantity,
        reason: `Without laundry, increase socks from ${socksItem.quantity} to ${days + 1} pairs`,
        category: 'clothing',
        applied: false
      })
    }

    const topsItem = trip.checklistItems.find(item => item.category === 'tops')
    if (topsItem && topsItem.quantity < days) {
      suggestions.push({
        id: `sug-${suggestionId++}`,
        type: 'update',
        targetItemId: topsItem.id,
        item: { ...topsItem, quantity: days },
        originalQuantity: topsItem.quantity,
        reason: `Without laundry, increase tops from ${topsItem.quantity} to ${days} (1 per day)`,
        category: 'clothing',
        applied: false
      })
    }
  }

  // Beach-specific suggestions
  if (trip.destinationType === 'beach' || trip.activities?.includes('swimming')) {
    const hasSwimsuit = trip.checklistItems.some(item => 
      item.name.toLowerCase().includes('swimsuit') || 
      item.name.toLowerCase().includes('swim')
    )
    
    if (!hasSwimsuit) {
      suggestions.push({
        id: `sug-${suggestionId++}`,
        type: 'add',
        item: {
          id: `item-swim-${Date.now()}`,
          name: 'Swimsuit',
          category: 'clothing',
          quantity: 2,
          packed: false,
          essential: true
        },
        reason: 'Essential for beach destination',
        category: 'clothing',
        applied: false
      })
    }

    // Suggest beach-specific items
    const beachItems = [
      { name: 'Sunscreen', category: 'toiletries', reason: 'Protect skin at the beach' },
      { name: 'Beach Towel', category: 'misc', reason: 'Regular towels may not be suitable' },
      { name: 'Flip Flops', category: 'shoes', reason: 'Easy on/off for beach' },
      { name: 'Sunglasses', category: 'accessories', reason: 'Eye protection in bright sun' }
    ]

    beachItems.forEach(beachItem => {
      const hasItem = trip.checklistItems.some(item => 
        item.name.toLowerCase().includes(beachItem.name.toLowerCase())
      )
      
      if (!hasItem) {
        suggestions.push({
          id: `sug-${suggestionId++}`,
          type: 'add',
          item: {
            id: `item-beach-${Date.now()}-${suggestionId}`,
            name: beachItem.name,
            category: beachItem.category,
            quantity: 1,
            packed: false,
            essential: false
          },
          reason: beachItem.reason,
          category: beachItem.category,
          applied: false
        })
      }
    })
  }

  // Mountain/hiking suggestions
  if (trip.destinationType === 'mountain' || trip.activities?.includes('hiking')) {
    const hikingItems = [
      { name: 'Hiking Boots', category: 'shoes', reason: 'Proper footwear for trails' },
      { name: 'Rain Jacket', category: 'outerwear', reason: 'Weather can change quickly in mountains' },
      { name: 'Water Bottle', category: 'misc', reason: 'Stay hydrated on hikes' },
      { name: 'First Aid Kit', category: 'meds', reason: 'Safety essential for outdoor activities' }
    ]

    hikingItems.forEach(hikingItem => {
      const hasItem = trip.checklistItems.some(item => 
        item.name.toLowerCase().includes(hikingItem.name.toLowerCase())
      )
      
      if (!hasItem) {
        suggestions.push({
          id: `sug-${suggestionId++}`,
          type: 'add',
          item: {
            id: `item-hike-${Date.now()}-${suggestionId}`,
            name: hikingItem.name,
            category: hikingItem.category,
            quantity: 1,
            packed: false,
            essential: hikingItem.name === 'First Aid Kit'
          },
          reason: hikingItem.reason,
          category: hikingItem.category,
          applied: false
        })
      }
    })
  }

  // Business/work suggestions
  if (trip.activities?.includes('business')) {
    const businessItems = [
      { name: 'Business Cards', category: 'documents', reason: 'Networking at business events' },
      { name: 'Laptop Charger', category: 'tech', reason: 'Keep devices powered for work' },
      { name: 'Dress Shoes', category: 'shoes', reason: 'Professional appearance' },
      { name: 'Iron/Steamer', category: 'misc', reason: 'Keep clothes wrinkle-free' }
    ]

    businessItems.forEach(businessItem => {
      const hasItem = trip.checklistItems.some(item => 
        item.name.toLowerCase().includes(businessItem.name.toLowerCase())
      )
      
      if (!hasItem) {
        suggestions.push({
          id: `sug-${suggestionId++}`,
          type: 'add',
          item: {
            id: `item-biz-${Date.now()}-${suggestionId}`,
            name: businessItem.name,
            category: businessItem.category,
            quantity: 1,
            packed: false,
            essential: businessItem.category === 'tech'
          },
          reason: businessItem.reason,
          category: businessItem.category,
          applied: false
        })
      }
    })
  }

  // Luggage-specific suggestions
  if (trip.luggage === 'carryOn') {
    // Suggest travel-sized toiletries
    const toiletries = trip.checklistItems.filter(item => item.category === 'toiletries')
    toiletries.forEach(item => {
      if (!item.name.toLowerCase().includes('travel') && !item.name.toLowerCase().includes('mini')) {
        suggestions.push({
          id: `sug-${suggestionId++}`,
          type: 'update',
          targetItemId: item.id,
          item: { ...item, name: `Travel-size ${item.name}` },
          reason: 'TSA regulations for carry-on luggage',
          category: 'toiletries',
          applied: false
        })
      }
    })
  }

  // Season-specific suggestions
  if (trip.season === 'winter') {
    const winterItems = [
      { name: 'Warm Coat', category: 'outerwear', reason: 'Essential for cold weather' },
      { name: 'Gloves', category: 'accessories', reason: 'Keep hands warm' },
      { name: 'Scarf', category: 'accessories', reason: 'Extra warmth and style' },
      { name: 'Thermal Underwear', category: 'underwear', reason: 'Base layer for cold weather' }
    ]

    winterItems.forEach(winterItem => {
      const hasItem = trip.checklistItems.some(item => 
        item.name.toLowerCase().includes(winterItem.name.toLowerCase())
      )
      
      if (!hasItem) {
        suggestions.push({
          id: `sug-${suggestionId++}`,
          type: 'add',
          item: {
            id: `item-winter-${Date.now()}-${suggestionId}`,
            name: winterItem.name,
            category: winterItem.category,
            quantity: winterItem.name === 'Thermal Underwear' ? 2 : 1,
            packed: false,
            essential: winterItem.name === 'Warm Coat'
          },
          reason: winterItem.reason,
          category: winterItem.category,
          applied: false
        })
      }
    })
  }

  // Summer-specific suggestions
  if (trip.season === 'summer') {
    const summerItems = [
      { name: 'Shorts', category: 'bottoms', reason: 'Stay cool in hot weather', quantity: 3 },
      { name: 'Sandals', category: 'shoes', reason: 'Breathable footwear' },
      { name: 'Sun Hat', category: 'accessories', reason: 'Sun protection' }
    ]

    summerItems.forEach(summerItem => {
      const hasItem = trip.checklistItems.some(item => 
        item.name.toLowerCase().includes(summerItem.name.toLowerCase())
      )
      
      if (!hasItem) {
        suggestions.push({
          id: `sug-${suggestionId++}`,
          type: 'add',
          item: {
            id: `item-summer-${Date.now()}-${suggestionId}`,
            name: summerItem.name,
            category: summerItem.category,
            quantity: summerItem.quantity || 1,
            packed: false,
            essential: false
          },
          reason: summerItem.reason,
          category: summerItem.category,
          applied: false
        })
      }
    })
  }

  return suggestions
}