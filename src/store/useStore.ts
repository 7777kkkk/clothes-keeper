import { create } from 'zustand';
import { Category, ClothingItem, Outfit, Occasion, CalendarRecord } from '../types';
import { DEFAULT_CATEGORIES, DEFAULT_OCCASIONS } from '../constants/theme';

interface AppState {
  // 数据
  categories: Category[];
  clothingItems: ClothingItem[];
  outfits: Outfit[];
  occasions: Occasion[];
  calendarRecords: CalendarRecord[];

  // 品类操作
  addCategory: (name: string, parentId?: string | null) => void;
  updateCategory: (id: string, name: string) => void;
  deleteCategory: (id: string) => void;

  // 单品操作
  addClothingItem: (item: Omit<ClothingItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateClothingItem: (id: string, item: Partial<ClothingItem>) => void;
  deleteClothingItem: (id: string) => void;

  // 搭配操作
  addOutfit: (outfit: Omit<Outfit, 'id' | 'createdAt'>) => void;
  updateOutfit: (id: string, outfit: Partial<Outfit>) => void;
  deleteOutfit: (id: string) => void;

  // 场合操作
  addOccasion: (name: string) => void;
  updateOccasion: (id: string, name: string) => void;
  deleteOccasion: (id: string) => void;

  // 日历操作
  addCalendarRecord: (record: Omit<CalendarRecord, 'id' | 'createdAt'>) => void;
  updateCalendarRecord: (id: string, record: Partial<CalendarRecord>) => void;
  deleteCalendarRecord: (id: string) => void;

  // 初始化（从存储加载）
  loadData: () => void;
}

const generateId = () => Math.random().toString(36).substring(2, 15);

export const useStore = create<AppState>((set, get) => ({
  // 初始数据
  categories: DEFAULT_CATEGORIES.map(c => ({ ...c, createdAt: new Date() })),
  clothingItems: [],
  outfits: [],
  occasions: DEFAULT_OCCASIONS.map(o => ({ ...o })),
  calendarRecords: [],

  // 品类操作
  addCategory: (name, parentId = null) => {
    const { categories } = get();
    const newCategory: Category = {
      id: generateId(),
      name,
      parentId,
      order: categories.length,
      createdAt: new Date(),
    };
    set({ categories: [...categories, newCategory] });
  },

  updateCategory: (id, name) => {
    set({
      categories: get().categories.map(c =>
        c.id === id ? { ...c, name } : c
      ),
    });
  },

  deleteCategory: (id) => {
    set({
      categories: get().categories.filter(c => c.id !== id),
    });
  },

  // 单品操作
  addClothingItem: (item) => {
    const newItem: ClothingItem = {
      ...item,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    set({ clothingItems: [...get().clothingItems, newItem] });
  },

  updateClothingItem: (id, item) => {
    set({
      clothingItems: get().clothingItems.map(c =>
        c.id === id ? { ...c, ...item, updatedAt: new Date() } : c
      ),
    });
  },

  deleteClothingItem: (id) => {
    set({
      clothingItems: get().clothingItems.filter(c => c.id !== id),
    });
  },

  // 搭配操作
  addOutfit: (outfit) => {
    const newOutfit: Outfit = {
      ...outfit,
      id: generateId(),
      createdAt: new Date(),
    };
    set({ outfits: [...get().outfits, newOutfit] });
  },

  updateOutfit: (id, outfit) => {
    set({
      outfits: get().outfits.map(o =>
        o.id === id ? { ...o, ...outfit } : o
      ),
    });
  },

  deleteOutfit: (id) => {
    set({
      outfits: get().outfits.filter(o => o.id !== id),
    });
  },

  // 场合操作
  addOccasion: (name) => {
    const { occasions } = get();
    const newOccasion: Occasion = {
      id: generateId(),
      name,
      order: occasions.length,
    };
    set({ occasions: [...occasions, newOccasion] });
  },

  updateOccasion: (id, name) => {
    set({
      occasions: get().occasions.map(o =>
        o.id === id ? { ...o, name } : o
      ),
    });
  },

  deleteOccasion: (id) => {
    set({
      occasions: get().occasions.filter(o => o.id !== id),
    });
  },

  // 日历操作
  addCalendarRecord: (record) => {
    const newRecord: CalendarRecord = {
      ...record,
      id: generateId(),
      createdAt: new Date(),
    };
    set({ calendarRecords: [...get().calendarRecords, newRecord] });
  },

  updateCalendarRecord: (id, record) => {
    set({
      calendarRecords: get().calendarRecords.map(r =>
        r.id === id ? { ...r, ...record } : r
      ),
    });
  },

  deleteCalendarRecord: (id) => {
    set({
      calendarRecords: get().calendarRecords.filter(r => r.id !== id),
    });
  },

  // 初始化（这里后续会从 AsyncStorage 或 LeanCloud 加载）
  loadData: () => {
    // TODO: 从持久化存储加载数据
  },
}));
