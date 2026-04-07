import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Category, ClothingItem, Outfit, Occasion, CalendarRecord, LocationType, Season, AttributeTemplate, AttributeFieldType, BodyData } from '../types';
import { DEFAULT_CATEGORIES, DEFAULT_OCCASIONS } from '../constants/theme';

const STORAGE_KEY = '@clothes_keeper_data';

type HomeMode = 'default' | 'custom';
type HomeSortBy = 'name' | 'purchaseDate' | 'wearCount' | 'createdAt';
type HomeSortOrder = 'asc' | 'desc';

interface AppState {
  // 数据
  categories: Category[];
  clothingItems: ClothingItem[];
  outfits: Outfit[];
  occasions: Occasion[];
  calendarRecords: CalendarRecord[];
  attributeTemplates: AttributeTemplate[];
  bodyData: BodyData;

  // 主页模式（自主模式筛选/排序）
  homeMode: HomeMode;
  homeSortBy: HomeSortBy;
  homeSortOrder: HomeSortOrder;
  homeFilterCategory: string | null;
  homeFilterSeason: Season | null;

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

  // 属性模板操作
  addAttributeTemplate: (template: Omit<AttributeTemplate, 'id' | 'order' | 'visible' | 'isSystem'>) => void;
  updateAttributeTemplate: (id: string, template: Partial<AttributeTemplate>) => void;
  deleteAttributeTemplate: (id: string) => void;

  // 日历操作
  addCalendarRecord: (record: Omit<CalendarRecord, 'id' | 'createdAt'>) => void;
  updateCalendarRecord: (id: string, record: Partial<CalendarRecord>) => void;
  deleteCalendarRecord: (id: string) => void;

  // 主页模式操作
  setHomeMode: (mode: HomeMode) => void;
  setHomeSort: (sortBy: HomeSortBy, order?: HomeSortOrder) => void;
  setHomeFilter: (categoryId: string | null, season: Season | null) => void;

  // 身材数据操作
  setBodyData: (data: Partial<BodyData>) => void;

  // 穿搭次数操作
  incrementWearCount: (itemIds: string[]) => void;

  // 初始化（从本地存储加载）
  loadData: () => Promise<void>;

  // 保存到本地存储
  saveData: () => Promise<void>;
}

const generateId = () => Math.random().toString(36).substring(2, 15);

// 系统内置字段模板（始终存在）
const SYSTEM_TEMPLATES: AttributeTemplate[] = [
  { id: 'sys_name', name: '名称', fieldType: 'text', options: [], order: 0, visible: true, isSystem: true },
  { id: 'sys_images', name: '照片', fieldType: 'images', options: [], order: 1, visible: true, isSystem: true },
  { id: 'sys_category', name: '分类', fieldType: 'select', options: [], order: 2, visible: true, isSystem: true },
  { id: 'sys_seasons', name: '季节', fieldType: 'multi_select', options: [{ id: '1', label: '春' }, { id: '2', label: '夏' }, { id: '3', label: '秋' }, { id: '4', label: '冬' }], order: 3, visible: true, isSystem: true },
  { id: 'sys_location', name: '存放位置', fieldType: 'select', options: [{ id: '1', label: '家' }, { id: '2', label: '学校' }], order: 4, visible: true, isSystem: true },
  { id: 'sys_location_detail', name: '具体位置', fieldType: 'text', options: [], order: 5, visible: true, isSystem: true },
  { id: 'sys_brand', name: '品牌', fieldType: 'text', options: [], order: 6, visible: true, isSystem: true },
  { id: 'sys_price', name: '价格', fieldType: 'number', options: [], order: 7, visible: true, isSystem: true },
  { id: 'sys_purchase_date', name: '购买日期', fieldType: 'date', options: [], order: 8, visible: true, isSystem: true },
  { id: 'sys_notes', name: '备注', fieldType: 'text', options: [], order: 9, visible: true, isSystem: true },
];

/**
 * 迁移旧格式的 attributeTemplates 到新格式
 * 旧格式：{ id, name, order }[]
 * 新格式：{ id, name, fieldType, options, order, visible, isSystem }[]
 */
function migrateAttributeTemplates(stored: AttributeTemplate[] | undefined): AttributeTemplate[] {
  // 如果没有存储数据，使用完整的默认模板（含系统字段）
  if (!stored || stored.length === 0) {
    return [
      ...SYSTEM_TEMPLATES,
      { id: '1', name: '颜色', fieldType: 'select', options: [{ id: '1', label: '红' }, { id: '2', label: '蓝' }, { id: '3', label: '白' }, { id: '4', label: '黑' }], order: 10, visible: true, isSystem: false },
      { id: '2', name: '材质', fieldType: 'select', options: [{ id: '1', label: '棉' }, { id: '2', label: '麻' }, { id: '3', label: '涤纶' }], order: 11, visible: true, isSystem: false },
      { id: '3', name: '尺码', fieldType: 'select', options: [{ id: '1', label: 'S' }, { id: '2', label: 'M' }, { id: '3', label: 'L' }, { id: '4', label: 'XL' }], order: 12, visible: true, isSystem: false },
    ];
  }

  // 检查是否已经是新格式（有 isSystem 字段）
  if (stored[0] && 'isSystem' in stored[0]) {
    // 已经是新格式，直接返回（同时确保系统字段存在）
    const hasSystemFields = stored.some(t => t.isSystem === true);
    if (hasSystemFields) return stored;
    // 缺少系统字段，补上
    const customTemplates = stored.filter((t: any) => t.isSystem !== true);
    return [...SYSTEM_TEMPLATES, ...customTemplates];
  }

  // 旧格式迁移：把旧的自定义字段（颜色/材质/尺码）转换，追加系统字段
  const customTemplates: AttributeTemplate[] = stored.map((t: any, idx: number) => ({
    id: t.id || String(idx),
    name: t.name,
    fieldType: (t.fieldType as AttributeFieldType) || 'text',
    options: (t.options as any[]) || [],
    order: t.order ?? idx,
    visible: true,
    isSystem: false,
  }));

  return [...SYSTEM_TEMPLATES, ...customTemplates];
}


// 演示数据
const SAMPLE_CLOTHING_ITEMS: Omit<ClothingItem, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: '黑色休闲西装外套',
    images: ['https://picsum.photos/400/600?random=1'],
    categoryId: '1',
    seasons: ['春', '秋'],
    locationType: '家',
    locationDetail: '卧室衣柜第二层',
    brand: 'UNIQLO',
    price: 599,
    purchaseDate: new Date('2025-03-15'),
    purchaseDateMode: 'full',
    notes: '春秋百搭款，搭配白色T恤很好看',
    wearCount: 5,
    customAttributes: [],
  },
  {
    name: '白色纯棉T恤',
    images: ['https://picsum.photos/400/600?random=2'],
    categoryId: '1',
    seasons: ['春', '夏', '秋'],
    locationType: '家',
    locationDetail: '卧室衣柜第一层',
    brand: 'UNIQLO',
    price: 79,
    purchaseDate: new Date('2025-04-20'),
    purchaseDateMode: 'full',
    notes: '基础款，万能内搭',
    wearCount: 12,
    customAttributes: [],
  },
  {
    name: '深蓝色牛仔裤',
    images: ['https://picsum.photos/400/600?random=3'],
    categoryId: '2',
    seasons: ['春', '秋', '冬'],
    locationType: '家',
    locationDetail: '卧室衣柜下层',
    brand: "Levi's",
    price: 699,
    purchaseDate: new Date('2025-01-10'),
    purchaseDateMode: 'full',
    notes: '经典款版型很好',
    wearCount: 8,
    customAttributes: [],
  },
  {
    name: '黑色帆布鞋',
    images: ['https://picsum.photos/400/600?random=4'],
    categoryId: '4',
    seasons: ['春', '夏', '秋'],
    locationType: '家',
    locationDetail: '鞋柜第一层',
    brand: 'Converse',
    price: 469,
    purchaseDate: new Date('2025-02-14'),
    purchaseDateMode: 'full',
    notes: '万年经典款',
    wearCount: 15,
    customAttributes: [],
  },
  {
    name: '灰色卫衣',
    images: ['https://picsum.photos/400/600?random=5'],
    categoryId: '1',
    seasons: ['秋', '冬'],
    locationType: '学校',
    locationDetail: '宿舍衣柜',
    brand: 'Nike',
    price: 399,
    purchaseDate: new Date('2025-11-05'),
    purchaseDateMode: 'full',
    notes: '冬天必备，舒适百搭',
    wearCount: 3,
    customAttributes: [],
  },
  {
    name: '黑色双肩包',
    images: ['https://picsum.photos/400/600?random=6'],
    categoryId: '5',
    seasons: ['春', '夏', '秋', '冬'],
    locationType: '学校',
    locationDetail: '宿舍书桌旁',
    brand: '小米',
    price: 169,
    purchaseDate: new Date('2025-08-20'),
    purchaseDateMode: 'full',
    notes: '日常上课用，容量很大',
    wearCount: 20,
    customAttributes: [],
  },
  {
    name: '碎花连衣裙',
    images: ['https://picsum.photos/400/600?random=7'],
    categoryId: '3',
    seasons: ['夏'],
    locationType: '家',
    locationDetail: '卧室衣柜第三层',
    brand: 'ZARA',
    price: 299,
    purchaseDate: new Date('2025-06-18'),
    purchaseDateMode: 'full',
    notes: '约会穿很好看',
    wearCount: 2,
    customAttributes: [],
  },
  {
    name: '运动短裤',
    images: ['https://picsum.photos/400/600?random=8'],
    categoryId: '2',
    seasons: ['夏'],
    locationType: '学校',
    locationDetail: '宿舍衣柜',
    brand: 'Nike',
    price: 199,
    purchaseDate: new Date('2025-05-01'),
    purchaseDateMode: 'full',
    notes: '跑步健身穿',
    wearCount: 10,
    customAttributes: [],
  },
];

export const useStore = create<AppState>((set, get) => ({
  // 初始数据
  categories: DEFAULT_CATEGORIES.map(c => ({ ...c, createdAt: new Date() })),
  clothingItems: [],
  outfits: [],
  occasions: DEFAULT_OCCASIONS.map(o => ({ ...o })),
  calendarRecords: [],
  attributeTemplates: [
    // 系统内置字段（不可删除）
    { id: 'sys_name', name: '名称', fieldType: 'text', options: [], order: 0, visible: true, isSystem: true },
    { id: 'sys_images', name: '照片', fieldType: 'images', options: [], order: 1, visible: true, isSystem: true },
    { id: 'sys_category', name: '分类', fieldType: 'select', options: [], order: 2, visible: true, isSystem: true },
    { id: 'sys_seasons', name: '季节', fieldType: 'multi_select', options: [{ id: '1', label: '春' }, { id: '2', label: '夏' }, { id: '3', label: '秋' }, { id: '4', label: '冬' }], order: 3, visible: true, isSystem: true },
    { id: 'sys_location', name: '存放位置', fieldType: 'select', options: [{ id: '1', label: '家' }, { id: '2', label: '学校' }], order: 4, visible: true, isSystem: true },
    { id: 'sys_location_detail', name: '具体位置', fieldType: 'text', options: [], order: 5, visible: true, isSystem: true },
    { id: 'sys_brand', name: '品牌', fieldType: 'text', options: [], order: 6, visible: true, isSystem: true },
    { id: 'sys_price', name: '价格', fieldType: 'number', options: [], order: 7, visible: true, isSystem: true },
    { id: 'sys_purchase_date', name: '购买日期', fieldType: 'date', options: [], order: 8, visible: true, isSystem: true },
    { id: 'sys_notes', name: '备注', fieldType: 'text', options: [], order: 9, visible: true, isSystem: true },
    // 自定义字段
    { id: '1', name: '颜色', fieldType: 'select', options: [{ id: '1', label: '红' }, { id: '2', label: '蓝' }, { id: '3', label: '白' }, { id: '4', label: '黑' }], order: 10, visible: true, isSystem: false },
    { id: '2', name: '材质', fieldType: 'select', options: [{ id: '1', label: '棉' }, { id: '2', label: '麻' }, { id: '3', label: '涤纶' }, { id: '4', label: '羊毛' }], order: 11, visible: true, isSystem: false },
    { id: '3', name: '尺码', fieldType: 'select', options: [{ id: '1', label: 'XS' }, { id: '2', label: 'S' }, { id: '3', label: 'M' }, { id: '4', label: 'L' }, { id: '5', label: 'XL' }, { id: '6', label: 'XXL' }], order: 12, visible: true, isSystem: false },
  ],
  isLoaded: false,

  // 主页模式默认值
  homeMode: 'default',
  homeSortBy: 'createdAt',
  homeSortOrder: 'desc',
  homeFilterCategory: null,
  homeFilterSeason: null,

  // 身材数据
  bodyData: {
    height: null,
    weight: null,
    headCircumference: null,
    neckCircumference: null,
    shoulderWidth: null,
    chestCircumference: null,
    underBust: null,
    waistCircumference: null,
    abdomenCircumference: null,
    hipCircumference: null,
    upperArmCircumference: null,
    forearmCircumference: null,
    sleeveLength: null,
    wristCircumference: null,
    palmCircumference: null,
    thighCircumference: null,
    calfCircumference: null,
    ankleCircumference: null,
  },

  // 保存到本地存储
  saveData: async () => {
    const state = get();
    const data = {
      categories: state.categories,
      clothingItems: state.clothingItems,
      outfits: state.outfits,
      occasions: state.occasions,
      calendarRecords: state.calendarRecords,
      attributeTemplates: state.attributeTemplates,
      homeMode: state.homeMode,
      homeSortBy: state.homeSortBy,
      homeSortOrder: state.homeSortOrder,
      homeFilterCategory: state.homeFilterCategory,
      homeFilterSeason: state.homeFilterSeason,
      bodyData: state.bodyData,
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
        // 数据迁移：旧格式 → 新格式
        const migratedTemplates = migrateAttributeTemplates(data.attributeTemplates);
        set({
          categories: data.categories || DEFAULT_CATEGORIES.map(c => ({ ...c, createdAt: new Date() })),
          clothingItems: data.clothingItems || [],
          outfits: data.outfits || [],
          occasions: data.occasions || DEFAULT_OCCASIONS.map(o => ({ ...o })),
          calendarRecords: data.calendarRecords || [],
          attributeTemplates: migratedTemplates,
          homeMode: data.homeMode || 'default',
          homeSortBy: data.homeSortBy || 'createdAt',
          homeSortOrder: data.homeSortOrder || 'desc',
          homeFilterCategory: data.homeFilterCategory || null,
          homeFilterSeason: data.homeFilterSeason || null,
          bodyData: data.bodyData || {
            height: null, weight: null, headCircumference: null, neckCircumference: null,
            shoulderWidth: null, chestCircumference: null, underBust: null,
            waistCircumference: null, abdomenCircumference: null, hipCircumference: null,
            upperArmCircumference: null, forearmCircumference: null, sleeveLength: null,
            wristCircumference: null, palmCircumference: null, thighCircumference: null,
            calfCircumference: null, ankleCircumference: null,
          },
          isLoaded: true,
        });
      } else {
        // 首次使用，添加演示数据
        const sampleItems = SAMPLE_CLOTHING_ITEMS.map(item => ({
          ...item,
          id: generateId(),
          createdAt: new Date(),
          updatedAt: new Date(),
        }));
        set({
          clothingItems: sampleItems,
          isLoaded: true,
        });
        // 保存演示数据
        const initialData = {
          categories: DEFAULT_CATEGORIES.map(c => ({ ...c, createdAt: new Date() })),
          clothingItems: sampleItems,
          outfits: [],
          occasions: DEFAULT_OCCASIONS.map(o => ({ ...o })),
          calendarRecords: [],
          homeMode: 'default',
          homeSortBy: 'createdAt',
          homeSortOrder: 'desc',
          homeFilterCategory: null,
          homeFilterSeason: null,
          bodyData: {
            height: null, weight: null, headCircumference: null, neckCircumference: null,
            shoulderWidth: null, chestCircumference: null, underBust: null,
            waistCircumference: null, abdomenCircumference: null, hipCircumference: null,
            upperArmCircumference: null, forearmCircumference: null, sleeveLength: null,
            wristCircumference: null, palmCircumference: null, thighCircumference: null,
            calfCircumference: null, ankleCircumference: null,
          },
        };
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
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

  // 属性模板操作
  addAttributeTemplate: (template) => {
    const { attributeTemplates, saveData } = get();
    const newTemplate: AttributeTemplate = {
      id: generateId(),
      ...template,
      order: attributeTemplates.length,
      visible: true,
      isSystem: false,
    };
    set({ attributeTemplates: [...attributeTemplates, newTemplate] });
    saveData();
  },

  updateAttributeTemplate: (id, template) => {
    const { saveData } = get();
    set({
      attributeTemplates: get().attributeTemplates.map(t =>
        t.id === id ? { ...t, ...template } : t
      ),
    });
    saveData();
  },

  deleteAttributeTemplate: (id) => {
    const tpl = get().attributeTemplates.find(t => t.id === id);
    if (tpl?.isSystem) return; // 不能删除系统字段
    const { saveData } = get();
    set({
      attributeTemplates: get().attributeTemplates.filter(t => t.id !== id),
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

  // 主页模式操作
  setHomeMode: (mode) => {
    set({ homeMode: mode });
    get().saveData();
  },

  setHomeSort: (sortBy, order) => {
    set(state => ({
      homeSortBy: sortBy,
      homeSortOrder: order || (state.homeSortBy === sortBy && state.homeSortOrder === 'asc' ? 'desc' : 'asc'),
    }));
    get().saveData();
  },

  setHomeFilter: (categoryId, season) => {
    set({ homeFilterCategory: categoryId, homeFilterSeason: season });
    get().saveData();
  },

  // 身材数据操作
  setBodyData: (data) => {
    set(state => ({ bodyData: { ...state.bodyData, ...data } }));
    get().saveData();
  },

  // 穿搭次数 +1
  incrementWearCount: (itemIds) => {
    const { clothingItems, saveData } = get();
    const updatedItems = clothingItems.map(item => {
      if (itemIds.includes(item.id)) {
        return { ...item, wearCount: (item.wearCount || 0) + 1, updatedAt: new Date() };
      }
      return item;
    });
    set({ clothingItems: updatedItems });
    saveData();
  },
}));
