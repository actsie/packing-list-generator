import { AlwaysPackedKit, PackingItem } from './types'

export const defaultAlwaysPackedKits: AlwaysPackedKit[] = [
  {
    id: 'toiletries-kit',
    name: 'Essential Toiletries',
    description: 'Basic hygiene items you need for every trip',
    category: 'Personal Care',
    icon: '🧴',
    color: 'blue',
    isDefault: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    items: [
      {
        id: 'toothbrush',
        name: 'Toothbrush',
        category: 'Toiletries',
        quantity: 1,
        packed: false,
        essential: true
      },
      {
        id: 'toothpaste',
        name: 'Toothpaste',
        category: 'Toiletries',
        quantity: 1,
        packed: false,
        essential: true
      },
      {
        id: 'shampoo',
        name: 'Shampoo',
        category: 'Toiletries',
        quantity: 1,
        packed: false,
        essential: true
      },
      {
        id: 'soap',
        name: 'Body wash/Soap',
        category: 'Toiletries',
        quantity: 1,
        packed: false,
        essential: true
      },
      {
        id: 'deodorant',
        name: 'Deodorant',
        category: 'Toiletries',
        quantity: 1,
        packed: false,
        essential: true
      },
      {
        id: 'razor',
        name: 'Razor',
        category: 'Toiletries',
        quantity: 1,
        packed: false,
        essential: false
      },
      {
        id: 'towel',
        name: 'Travel towel',
        category: 'Toiletries',
        quantity: 1,
        packed: false,
        essential: false
      }
    ]
  },
  {
    id: 'tech-kit',
    name: 'Tech Essentials',
    description: 'Chargers and tech items you always need',
    category: 'Electronics',
    icon: '🔌',
    color: 'green',
    isDefault: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    items: [
      {
        id: 'phone-charger',
        name: 'Phone charger',
        category: 'Electronics',
        quantity: 1,
        packed: false,
        essential: true
      },
      {
        id: 'portable-charger',
        name: 'Portable charger',
        category: 'Electronics',
        quantity: 1,
        packed: false,
        essential: true
      },
      {
        id: 'charging-cable',
        name: 'USB cables',
        category: 'Electronics',
        quantity: 2,
        packed: false,
        essential: true
      },
      {
        id: 'wall-adapter',
        name: 'Wall adapter',
        category: 'Electronics',
        quantity: 1,
        packed: false,
        essential: true
      },
      {
        id: 'headphones',
        name: 'Headphones',
        category: 'Electronics',
        quantity: 1,
        packed: false,
        essential: false
      },
      {
        id: 'travel-adapter',
        name: 'Travel adapter',
        category: 'Electronics',
        quantity: 1,
        packed: false,
        essential: false,
        notes: 'For international travel'
      }
    ]
  },
  {
    id: 'underwear-kit',
    name: 'Essential Undergarments',
    description: 'Basic undergarments and sleepwear',
    category: 'Clothing',
    icon: '👙',
    color: 'pink',
    isDefault: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    items: [
      {
        id: 'underwear',
        name: 'Underwear',
        category: 'Underwear',
        quantity: 7,
        packed: false,
        essential: true,
        notes: 'Pack extra'
      },
      {
        id: 'socks',
        name: 'Socks',
        category: 'Underwear',
        quantity: 7,
        packed: false,
        essential: true
      },
      {
        id: 'bras',
        name: 'Bras',
        category: 'Underwear',
        quantity: 3,
        packed: false,
        essential: true
      },
      {
        id: 'pajamas',
        name: 'Pajamas/Sleepwear',
        category: 'Sleepwear',
        quantity: 2,
        packed: false,
        essential: true
      },
      {
        id: 'slippers',
        name: 'Slippers',
        category: 'Footwear',
        quantity: 1,
        packed: false,
        essential: false
      }
    ]
  },
  {
    id: 'documents-kit',
    name: 'Travel Documents',
    description: 'Important documents and travel paperwork',
    category: 'Documents',
    icon: '📄',
    color: 'orange',
    isDefault: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    items: [
      {
        id: 'passport',
        name: 'Passport',
        category: 'Documents',
        quantity: 1,
        packed: false,
        essential: true
      },
      {
        id: 'id-card',
        name: 'ID/Driver\'s License',
        category: 'Documents',
        quantity: 1,
        packed: false,
        essential: true
      },
      {
        id: 'tickets',
        name: 'Flight/Travel tickets',
        category: 'Documents',
        quantity: 1,
        packed: false,
        essential: true
      },
      {
        id: 'hotel-confirmation',
        name: 'Hotel confirmations',
        category: 'Documents',
        quantity: 1,
        packed: false,
        essential: true
      },
      {
        id: 'travel-insurance',
        name: 'Travel insurance',
        category: 'Documents',
        quantity: 1,
        packed: false,
        essential: false
      },
      {
        id: 'credit-cards',
        name: 'Credit cards',
        category: 'Documents',
        quantity: 2,
        packed: false,
        essential: true
      },
      {
        id: 'cash',
        name: 'Cash/Emergency money',
        category: 'Documents',
        quantity: 1,
        packed: false,
        essential: true
      }
    ]
  },
  {
    id: 'health-kit',
    name: 'Health & Medicine',
    description: 'Basic medications and health items',
    category: 'Health',
    icon: '💊',
    color: 'red',
    isDefault: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    items: [
      {
        id: 'daily-meds',
        name: 'Daily medications',
        category: 'Medications',
        quantity: 1,
        packed: false,
        essential: true,
        notes: 'Pack extra days'
      },
      {
        id: 'pain-reliever',
        name: 'Pain reliever',
        category: 'Medications',
        quantity: 1,
        packed: false,
        essential: true
      },
      {
        id: 'bandaids',
        name: 'Band-aids',
        category: 'First Aid',
        quantity: 1,
        packed: false,
        essential: false
      },
      {
        id: 'thermometer',
        name: 'Thermometer',
        category: 'First Aid',
        quantity: 1,
        packed: false,
        essential: false
      },
      {
        id: 'hand-sanitizer',
        name: 'Hand sanitizer',
        category: 'Health',
        quantity: 1,
        packed: false,
        essential: true
      },
      {
        id: 'vitamins',
        name: 'Vitamins',
        category: 'Medications',
        quantity: 1,
        packed: false,
        essential: false
      }
    ]
  },
  {
    id: 'comfort-kit',
    name: 'Travel Comfort',
    description: 'Items to make your journey more comfortable',
    category: 'Travel Gear',
    icon: '✈️',
    color: 'purple',
    isDefault: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    items: [
      {
        id: 'neck-pillow',
        name: 'Travel neck pillow',
        category: 'Travel Comfort',
        quantity: 1,
        packed: false,
        essential: false
      },
      {
        id: 'eye-mask',
        name: 'Eye mask',
        category: 'Travel Comfort',
        quantity: 1,
        packed: false,
        essential: false
      },
      {
        id: 'earplugs',
        name: 'Earplugs',
        category: 'Travel Comfort',
        quantity: 1,
        packed: false,
        essential: false
      },
      {
        id: 'water-bottle',
        name: 'Water bottle',
        category: 'Travel Gear',
        quantity: 1,
        packed: false,
        essential: true
      },
      {
        id: 'snacks',
        name: 'Travel snacks',
        category: 'Food',
        quantity: 1,
        packed: false,
        essential: false
      },
      {
        id: 'travel-blanket',
        name: 'Travel blanket',
        category: 'Travel Comfort',
        quantity: 1,
        packed: false,
        essential: false
      }
    ]
  }
]

export const kitCategories = [
  'Personal Care',
  'Electronics', 
  'Clothing',
  'Documents',
  'Health',
  'Travel Gear',
  'Custom'
]