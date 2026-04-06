export const COLORS = {
  primary: '#1A1A2E',
  secondary: '#E8E8E8',
  accent: '#C9A959',
  background: '#FAFAFA',
  card: '#FFFFFF',
  textPrimary: '#1A1A2E',
  textSecondary: '#666666',
  border: '#E0E0E0',
  error: '#E53935',
  success: '#43A047',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const FONT_SIZES = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
};

export const BORDER_RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  full: 999,
};

export const SHADOWS = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
};

// 默认场合
export const DEFAULT_OCCASIONS = [
  { id: '1', name: '日常通勤', order: 0 },
  { id: '2', name: '约会', order: 1 },
  { id: '3', name: '正式场合', order: 2 },
  { id: '4', name: '运动', order: 3 },
  { id: '5', name: '在家', order: 4 },
];

// 默认品类
export const DEFAULT_CATEGORIES = [
  { id: '1', name: '上衣', parentId: null, order: 0 },
  { id: '2', name: '裤子', parentId: null, order: 1 },
  { id: '3', name: '裙子', parentId: null, order: 2 },
  { id: '4', name: '鞋子', parentId: null, order: 3 },
  { id: '5', name: '配饰', parentId: null, order: 4 },
];
