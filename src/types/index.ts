// 品类
export interface Category {
  id: string;
  name: string;
  parentId: string | null;
  order: number;
  createdAt: Date;
}

// 衣物单品
export interface ClothingItem {
  id: string;
  name: string;
  images: string[];
  categoryId: string;
  seasons: Season[];
  storageLocation: string;
  brand: string;
  price: number;
  purchaseDate: Date | null;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

// 季节
export type Season = '春' | '夏' | '秋' | '冬';

// 搭配
export interface Outfit {
  id: string;
  name: string;
  coverImage: string;
  itemIds: string[];
  occasions: string[];
  notes: string;
  createdAt: Date;
}

// 场合
export interface Occasion {
  id: string;
  name: string;
  order: number;
}

// 日历记录
export interface CalendarRecord {
  id: string;
  date: string; // YYYY-MM-DD
  outfitId: string | null;
  itemIds: string[];
  notes: string;
  createdAt: Date;
}

// 导航类型
export type RootTabParamList = {
  Home: undefined;
  Outfit: undefined;
  Calendar: undefined;
  Stats: undefined;
  My: undefined;
};

export type RootStackParamList = {
  MainTabs: undefined;
  AddClothing: undefined;
  ClothingDetail: { itemId: string };
  CreateOutfit: { outfitId?: string };
  CategoryManage: undefined;
  OccasionManage: undefined;
};
