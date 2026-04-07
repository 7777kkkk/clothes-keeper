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
  locationType: LocationType;  // 存放位置类型：家/学校
  locationDetail: string;      // 具体位置备注，如"卧室衣柜第二层"
  brand: string;
  price: number;
  purchaseDate: Date | null;
  purchaseDateMode: 'full' | 'year'; // 购买日期模式：完整日期或仅年份
  notes: string;
  wearCount: number; // 穿搭次数
  customAttributes: CustomAttribute[]; // 自定义属性
  createdAt: Date;
  updatedAt: Date;
}

// 自定义属性
export interface CustomAttribute {
  id: string;
  name: string;       // 属性名，如"颜色"、"材质"
  value: string;     // 属性值，如"蓝色"、"棉"
  type: 'text' | 'category'; // 类型：文本或分类选项
  templateId?: string; // 关联的 AttributeTemplate ID，便于精确匹配
}

// 存放位置类型
export type LocationType = '家' | '学校';

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

// 自定义属性模板（全局属性名定义）
export type AttributeFieldType = 'text' | 'number' | 'select' | 'multi_select' | 'date' | 'checkbox' | 'images';

export interface AttributeOption {
  id: string;
  label: string;      // 显示名称
}

export interface AttributeTemplate {
  id: string;
  name: string;        // 属性显示名，如"颜色"
  fieldType: AttributeFieldType;  // 字段类型
  options: AttributeOption[];      // select/multi_select 的选项列表
  order: number;
  visible: boolean;    // 是否在添加衣服时显示
  isSystem: boolean;   // 是否系统内置字段（不可删除）
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
  AddClothing: { itemId?: string } | undefined;
  ClothingDetail: { itemId: string };
  CreateOutfit: { outfitId?: string };
  CategoryManage: undefined;
  OccasionManage: undefined;
  LiquidGlassDemo: undefined;
  AttributeManage: undefined;
};
