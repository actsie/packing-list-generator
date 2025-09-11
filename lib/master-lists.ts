import { MasterList, PackingItem } from './types'

export const defaultMasterLists: MasterList[] = [
  {
    id: 'business-travel',
    name: 'Business Travel',
    description: 'Professional attire and work essentials for business trips',
    category: 'Professional',
    isTemplate: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    items: [
      {
        id: 'b1',
        name: 'Business suits',
        category: 'tops',
        quantity: 2,
        packed: false,
        essential: true,
        notes: 'Dark colors preferred'
      },
      {
        id: 'b2',
        name: 'Dress shirts',
        category: 'tops',
        quantity: 3,
        packed: false,
        essential: true
      },
      {
        id: 'b3',
        name: 'Business shoes',
        category: 'shoes',
        quantity: 2,
        packed: false,
        essential: true
      },
      {
        id: 'b4',
        name: 'Laptop',
        category: 'tech',
        quantity: 1,
        packed: false,
        essential: true
      },
      {
        id: 'b5',
        name: 'Phone charger',
        category: 'tech',
        quantity: 1,
        packed: false,
        essential: true
      },
      {
        id: 'b6',
        name: 'Business cards',
        category: 'documents',
        quantity: 1,
        packed: false,
        essential: true
      },
      {
        id: 'b7',
        name: 'Presentation materials',
        category: 'documents',
        quantity: 1,
        packed: false,
        essential: false
      },
      {
        id: 'b8',
        name: 'Dress pants',
        category: 'bottoms',
        quantity: 2,
        packed: false,
        essential: true
      },
      {
        id: 'b9',
        name: 'Business jacket',
        category: 'outerwear',
        quantity: 1,
        packed: false,
        essential: true
      }
    ]
  },
  {
    id: 'beach-vacation',
    name: 'Beach Vacation',
    description: 'Everything you need for a relaxing beach getaway',
    category: 'Leisure',
    isTemplate: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    items: [
      {
        id: 'v1',
        name: 'Swimwear',
        category: 'tops',
        quantity: 3,
        packed: false,
        essential: true
      },
      {
        id: 'v2',
        name: 'Sunscreen',
        category: 'toiletries',
        quantity: 1,
        packed: false,
        essential: true,
        notes: 'SPF 30 or higher'
      },
      {
        id: 'v3',
        name: 'Beach towels',
        category: 'misc',
        quantity: 2,
        packed: false,
        essential: true
      },
      {
        id: 'v4',
        name: 'Flip flops',
        category: 'shoes',
        quantity: 1,
        packed: false,
        essential: true
      },
      {
        id: 'v5',
        name: 'Sunglasses',
        category: 'accessories',
        quantity: 1,
        packed: false,
        essential: true
      },
      {
        id: 'v6',
        name: 'Beach bag',
        category: 'accessories',
        quantity: 1,
        packed: false,
        essential: false
      },
      {
        id: 'v7',
        name: 'Snorkel gear',
        category: 'misc',
        quantity: 1,
        packed: false,
        essential: false
      },
      {
        id: 'v8',
        name: 'Water bottle',
        category: 'misc',
        quantity: 1,
        packed: false,
        essential: true
      },
      {
        id: 'v9',
        name: 'Beach shorts',
        category: 'bottoms',
        quantity: 2,
        packed: false,
        essential: true
      },
      {
        id: 'v10',
        name: 'Sun hat',
        category: 'accessories',
        quantity: 1,
        packed: false,
        essential: false
      },
      {
        id: 'v11',
        name: 'Light cover-up',
        category: 'outerwear',
        quantity: 1,
        packed: false,
        essential: false
      }
    ]
  },
  {
    id: 'camping-adventure',
    name: 'Camping Adventure',
    description: 'Outdoor essentials for camping and hiking trips',
    category: 'Outdoor',
    isTemplate: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    items: [
      {
        id: 'c1',
        name: 'Tent',
        category: 'misc',
        quantity: 1,
        packed: false,
        essential: true
      },
      {
        id: 'c2',
        name: 'Sleeping bag',
        category: 'misc',
        quantity: 1,
        packed: false,
        essential: true
      },
      {
        id: 'c3',
        name: 'Sleeping pad',
        category: 'misc',
        quantity: 1,
        packed: false,
        essential: true
      },
      {
        id: 'c4',
        name: 'Hiking boots',
        category: 'shoes',
        quantity: 1,
        packed: false,
        essential: true
      },
      {
        id: 'c5',
        name: 'Backpack',
        category: 'accessories',
        quantity: 1,
        packed: false,
        essential: true
      },
      {
        id: 'c6',
        name: 'Headlamp',
        category: 'tech',
        quantity: 1,
        packed: false,
        essential: true
      },
      {
        id: 'c7',
        name: 'First aid kit',
        category: 'meds',
        quantity: 1,
        packed: false,
        essential: true
      },
      {
        id: 'c8',
        name: 'Water filter',
        category: 'misc',
        quantity: 1,
        packed: false,
        essential: true
      },
      {
        id: 'c9',
        name: 'Camping stove',
        category: 'misc',
        quantity: 1,
        packed: false,
        essential: false
      },
      {
        id: 'c10',
        name: 'Cookware set',
        category: 'misc',
        quantity: 1,
        packed: false,
        essential: false
      }
    ]
  },
  {
    id: 'city-break',
    name: 'City Break',
    description: 'Urban exploration essentials for short city trips',
    category: 'Travel',
    isTemplate: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    items: [
      {
        id: 'u1',
        name: 'Comfortable walking shoes',
        category: 'shoes',
        quantity: 1,
        packed: false,
        essential: true
      },
      {
        id: 'u2',
        name: 'Daypack',
        category: 'accessories',
        quantity: 1,
        packed: false,
        essential: true
      },
      {
        id: 'u3',
        name: 'Camera',
        category: 'tech',
        quantity: 1,
        packed: false,
        essential: false
      },
      {
        id: 'u4',
        name: 'Portable charger',
        category: 'tech',
        quantity: 1,
        packed: false,
        essential: true
      },
      {
        id: 'u5',
        name: 'City map/guidebook',
        category: 'documents',
        quantity: 1,
        packed: false,
        essential: false
      },
      {
        id: 'u6',
        name: 'Umbrella',
        category: 'misc',
        quantity: 1,
        packed: false,
        essential: false
      },
      {
        id: 'u7',
        name: 'Casual clothes',
        category: 'tops',
        quantity: 3,
        packed: false,
        essential: true
      }
    ]
  }
]

export const categories = [
  'Clothing',
  'Footwear',
  'Electronics',
  'Personal Care',
  'Documents',
  'Accessories',
  'Beach Gear',
  'Outdoor Gear',
  'Safety',
  'Cooking',
  'Shelter',
  'Weather',
  'Entertainment'
]