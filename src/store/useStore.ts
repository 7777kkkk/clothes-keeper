import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Category, ClothingItem, Outfit, Occasion, CalendarRecord } from '../types';
import { DEFAULT_CATEGORIES, DEFAULT_OCCASIONS } from '../constants/theme';

const STORAGE_KEY = '@clothes_keeper_data';

interface AppState {
  // 数据
  categories: Category[];
  clothingItems: ClothingItem[];
  outfits: Outfit[];
  occasions: Occasion[];
  calendarRecords: CalendarRecord[];

  // 加载状态
  isLoaded: boolean;

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

  // 初始化（从本地存储加载）
  loadData: () => Promise<void>;

  // 保存到本地存储
  saveData: () => Promise<void>;
}

const generateId = () => Math.random().toString(36).substring(2, 15);

// 序列化时转换 Date 为字符串
const serialize = (state: Omit<AppState, 'isLoaded' | 'loadData' | 'saveData' | 'addCategory' | 'updateCategory' | 'deleteCategory' | 'addClothingItem' | 'updateClothingItem' | 'deleteClothingItem' | 'addOutfit' | 'updateOutfit' | 'deleteOutfit' | 'addOccasion' | 'updateOccasion' | 'deleteOccasion' | 'addCalendarRecord' | 'updateCalendarRecord' | 'deleteCalendarRecord'>) => {
  return JSON.stringify({
    categories: state.categories,
    clothingItems: state.clothingItems,
    outfits: state.outfits,
    occasions: state.occasions,
    calendarRecords: state.calendarRecords,
  });
};

export const useStore = create<AppState>((set, get) => ({
  // 初始数据
  categories: DEFAULT_CATEGORIES.map(c => ({ ...c, createdAt: new Date() })),
  clothingItems: [],
  outfits: [],
  occasions: DEFAULT_OCCASIONS.map(o => ({ ...o })),
  calendarRecords: [],
  isLoaded: false,

  // 保存到本地存储
  saveData: async () => {
    const state = get();
    const data = {
      categories: state.categories,
      clothingItems: state.clothingItems,
      outfits: state.outfits,
      occasions: state.occasions,
      calendarRecords: state.calendarRecords,
    };
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save data:', e);
    }
  },

  // 初始化（从本地存储加载）
  loadData: async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        set({
          categories: data.categories || DEFAULT_CATEGORIES.map(c => ({ ...c, createdAt: new Date() })),
          clothingItems: data.clothingItems || [],
          outfits: data.outfits || [],
          occasions: data.occasions || DEFAULT_OCCASIONS.map(o => ({ ...o })),
          calendarRecords: data.calendarRecords || [],
          isLoaded: true,
        });
      } else {
        set({ isLoaded: true });
      }
    } catch (e) {
      console.error('Failed to load data:', e);
      set({ isLoaded: true });
    }
  },

  // 品类操作
  addCategory: (name, parentId = null) => {
    const { categories, saveData } = get();
    const newCategory: Category = {
      id: generateId(),
      name,
      parentId,
      order: categories.length,
      createdAt: new Date(),
    };
    set({ categories: [...categories, newCategory] });
    saveData();
  },

  updateCategory: (id, name) => {
    const { saveData } = get();
    set({
      categories: get().categories.map(c =>
        c.id === id ? { ...c, name } : c
      ),
    });
    saveData();
  },

  deleteCategory: (id) => {
    const { saveData } = get();
    set({
      categories: get().categories.filter(c => c.id !== id),
    });
    saveData();
  },

  // 单品操作
  addClothingItem: (item) => {
    const { saveData } = get();
    const newItem: ClothingItem = {
      ...item,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    set({ clothingItems: [...get().clothingItems, newItem] });
    saveData();
  },

  updateClothingItem: (id, item) => {
    const { saveData } = get();
    set({
      clothingItems: get().clothingItems.map(c =>
        c.id === id ? { ...c, ...item, updatedAt: new Date() } : c
      ),
    });
    saveData();
  },

  deleteClothingItem: (id) => {
    const { saveData } = get();
    set({
      clothingItems: get().clothingItems.filter(c => c.id !== id),
    });
    saveData();
  },

  // 搭配操作
  addOutfit: (outfit) => {
    const { saveData } = get();
    const newOutfit: Outfit = {
      ...outfit,
      id: generateId(),
      createdAt: new Date(),
    };
    set({ outfits: [...get().outfits, newOutfit] });
    saveData();
  },

  updateOutfit: (id, outfit) => {
    const { saveData } = get();
    set({
      outfits: get().outfits.map(o =>
        o.id === id ? { ...o, ...outfit } : o
      ),
    });
    saveData();
  },

  deleteOutfit: (id) => {
    const { saveData } = get();
    set({
      outfits: get().outfits.filter(o => o.id !== id),
    });
    saveData();
  },

  // 场合操作
  addOccasion: (name) => {
    const { occasions, saveData } = get();
    const newOccasion: Occasion = {
      id: generateId(),
      name,
      order: occasions.length,
    };
    set({ occasions: [...occasions, newOccasion] });
    saveData();
  },

  updateOccasion: (id, name) => {
    const { saveData } = get();
    set({
      occasions: get().occasions.map(o =>
        o.id === id ? { ...o, name } : o
      ),
    });
    saveData();
  },

  deleteOccasion: (id) => {
    const { saveData } = get();
    set({
      occasions: get().occasions.filter(o => o.id !== id),
    });
    saveData();
  },

  // 日历操作
  addCalendarRecord: (record) => {
    const { saveData } = get();
    const newRecord: CalendarRecord = {
      ...record,
      id: generateId(),
      createdAt: new Date(),
    };
    set({ calendarRecords: [...get().calendarRecords, newRecord] });
    saveData();
  },

  updateCalendarRecord: (id, record) => {
    const { saveData } = get();
    set({
      calendarRecords: get().calendarRecords.map(r =>
        r.id === id ? { ...r, ...record } : r
      ),
    });
    saveData();
  },

  deleteCalendarRecord: (id) => {
    const { saveData } = get();
    set({
      calendarRecords: get().calendarRecords.filter(r => r.id !== id),
    });
    saveData();
  },
}));
