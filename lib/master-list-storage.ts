import { MasterList } from './types'

const MASTER_LISTS_STORAGE_KEY = 'master-lists'

export class MasterListStorage {
  static getAllMasterLists(): MasterList[] {
    if (typeof window === 'undefined') return []
    const stored = localStorage.getItem(MASTER_LISTS_STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  }

  static getMasterList(id: string): MasterList | null {
    const lists = this.getAllMasterLists()
    return lists.find(list => list.id === id) || null
  }

  static saveMasterList(masterList: MasterList): void {
    const lists = this.getAllMasterLists()
    const index = lists.findIndex(l => l.id === masterList.id)
    
    if (index >= 0) {
      lists[index] = { ...masterList, updatedAt: new Date() }
    } else {
      lists.push({ ...masterList, createdAt: new Date(), updatedAt: new Date() })
    }
    
    localStorage.setItem(MASTER_LISTS_STORAGE_KEY, JSON.stringify(lists))
  }

  static deleteMasterList(id: string): void {
    const lists = this.getAllMasterLists()
    const filtered = lists.filter(list => list.id !== id)
    localStorage.setItem(MASTER_LISTS_STORAGE_KEY, JSON.stringify(filtered))
  }

  static updateMasterList(id: string, updates: Partial<MasterList>): void {
    const list = this.getMasterList(id)
    if (!list) return
    
    const updatedList = {
      ...list,
      ...updates,
      updatedAt: new Date()
    }
    
    this.saveMasterList(updatedList)
  }
}