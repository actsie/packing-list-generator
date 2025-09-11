import { PackingItem, PackingPhase, PhasedPackingConfig, DEFAULT_PHASED_PACKING_PHASES } from './types'

export function initializePhasedPacking(items: PackingItem[]): PhasedPackingConfig {
  if (!items || items.length === 0) {
    const emptyPhases: PackingPhase[] = DEFAULT_PHASED_PACKING_PHASES.map((phaseTemplate, index) => ({
      id: `phase-${index + 1}`,
      ...phaseTemplate,
      items: [],
      isCompleted: false
    }))

    return {
      enabled: true,
      phases: emptyPhases,
      currentPhaseId: emptyPhases[0]?.id
    }
  }

  const phases: PackingPhase[] = DEFAULT_PHASED_PACKING_PHASES.map((phaseTemplate, index) => ({
    id: `phase-${index + 1}`,
    ...phaseTemplate,
    items: [],
    isCompleted: false
  }))

  try {
    const categorizedItems = categorizeItemsIntoPhases(items)
    
    phases.forEach((phase, index) => {
      phase.items = categorizedItems[index] || []
    })
  } catch (error) {
    console.warn('Error categorizing items into phases:', error)
    phases[phases.length - 1].items = items
  }

  return {
    enabled: true,
    phases,
    currentPhaseId: phases[0]?.id
  }
}

function categorizeItemsIntoPhases(items: PackingItem[]): PackingItem[][] {
  const phaseItems: PackingItem[][] = [[], [], [], [], []]
  
  if (!items || items.length === 0) {
    return phaseItems
  }
  
  items.forEach(item => {
    try {
      if (!item || !item.category || !item.name) {
        phaseItems[4].push(item)
        return
      }

      const category = item.category.toLowerCase()
      const name = item.name.toLowerCase()
      
      if (isDocumentOrValuable(category, name)) {
        phaseItems[0].push(item)
      } else if (isEssentialClothingOrToiletry(category, name, item.essential)) {
        phaseItems[1].push(item) 
      } else if (isElectronicsOrCharger(category, name)) {
        phaseItems[2].push(item)
      } else if (isClothingOrShoes(category)) {
        phaseItems[3].push(item)
      } else {
        phaseItems[4].push(item)
      }
    } catch (error) {
      console.warn('Error categorizing item:', item, error)
      phaseItems[4].push(item)
    }
  })
  
  return phaseItems
}

function isDocumentOrValuable(category: string, name: string): boolean {
  const documentCategories = ['documents', 'travel documents', 'papers']
  const documentKeywords = ['passport', 'id', 'license', 'ticket', 'visa', 'insurance', 'itinerary', 
                           'wallet', 'cash', 'card', 'credit', 'debit', 'currency', 'money',
                           'jewelry', 'watch', 'valuables']
  
  return documentCategories.includes(category) || 
         documentKeywords.some(keyword => name.includes(keyword))
}

function isEssentialClothingOrToiletry(category: string, name: string, essential: boolean): boolean {
  const toiletryCategories = ['toiletries', 'personal care', 'hygiene', 'bathroom']
  const essentialClothing = ['underwear', 'socks', 'bra', 'undergarments']
  
  if (toiletryCategories.includes(category)) {
    return true
  }
  
  if (essential && (category.includes('clothes') || category.includes('tops') || category.includes('bottoms'))) {
    return true
  }
  
  return essentialClothing.some(keyword => name.includes(keyword) || category.includes(keyword))
}

function isElectronicsOrCharger(category: string, name: string): boolean {
  const techCategories = ['tech', 'electronics', 'technology', 'devices']
  const techKeywords = ['charger', 'cable', 'phone', 'laptop', 'tablet', 'camera', 'headphones', 
                       'earbuds', 'battery', 'adapter', 'power', 'usb', 'cord']
  
  return techCategories.includes(category) || 
         techKeywords.some(keyword => name.includes(keyword))
}

function isClothingOrShoes(category: string): boolean {
  const clothingCategories = ['tops', 'bottoms', 'outerwear', 'shoes', 'accessories', 'clothes', 'clothing']
  return clothingCategories.includes(category)
}

export function markPhaseCompleted(config: PhasedPackingConfig, phaseId: string): PhasedPackingConfig {
  if (!config || !config.phases || !phaseId) {
    console.warn('Invalid config or phaseId provided to markPhaseCompleted')
    return config
  }

  try {
    const updatedPhases = config.phases.map(phase => {
      if (phase.id === phaseId) {
        return { ...phase, isCompleted: true }
      }
      return phase
    })

    const currentPhaseIndex = config.phases.findIndex(p => p.id === phaseId)
    const nextPhase = config.phases[currentPhaseIndex + 1]
    
    return {
      ...config,
      phases: updatedPhases,
      currentPhaseId: nextPhase?.id || phaseId
    }
  } catch (error) {
    console.error('Error marking phase as completed:', error)
    return config
  }
}

export function moveItemBetweenPhases(
  config: PhasedPackingConfig, 
  itemId: string, 
  fromPhaseId: string, 
  toPhaseId: string
): PhasedPackingConfig {
  const updatedPhases = config.phases.map(phase => {
    if (phase.id === fromPhaseId) {
      return {
        ...phase,
        items: phase.items.filter(item => item.id !== itemId)
      }
    }
    if (phase.id === toPhaseId) {
      const itemToMove = config.phases
        .find(p => p.id === fromPhaseId)
        ?.items.find(item => item.id === itemId)
      
      if (itemToMove) {
        return {
          ...phase,
          items: [...phase.items, itemToMove]
        }
      }
    }
    return phase
  })

  return {
    ...config,
    phases: updatedPhases
  }
}

export function isPhaseComplete(phase: PackingPhase): boolean {
  return phase.items.every(item => item.packed)
}

export function getPhaseProgress(phase: PackingPhase): number {
  if (phase.items.length === 0) return 100
  const packedCount = phase.items.filter(item => item.packed).length
  return Math.round((packedCount / phase.items.length) * 100)
}

export function getOverallProgress(config: PhasedPackingConfig): number {
  if (config.phases.length === 0) return 0
  
  const totalItems = config.phases.reduce((sum, phase) => sum + phase.items.length, 0)
  if (totalItems === 0) return 100
  
  const packedItems = config.phases.reduce((sum, phase) => 
    sum + phase.items.filter(item => item.packed).length, 0)
  
  return Math.round((packedItems / totalItems) * 100)
}

export function getCurrentPhase(config: PhasedPackingConfig): PackingPhase | null {
  if (!config.currentPhaseId) return null
  return config.phases.find(phase => phase.id === config.currentPhaseId) || null
}

export function getNextIncompletePhase(config: PhasedPackingConfig): PackingPhase | null {
  return config.phases.find(phase => !isPhaseComplete(phase)) || null
}