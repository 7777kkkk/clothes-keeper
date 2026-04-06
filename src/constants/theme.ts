/**
 * Theme — 强制规范版
 * 渐变背景 + 白色卡片 + Ionicons
 */

// 强制渐变背景色
export const GRADIENT_COLORS = ['#dbeaff', '#d8f2fc', '#e1f8f6', '#f0fcf3', '#fefff7'];

// ============================================================
//  COLORS
// ============================================================
export const COLORS = {
  // ---- 强制背景（纯白） ----
  background: '#FBFAFF',

  // ---- 强制卡片 ----
  card: 'rgba(255,255,255,0.92)',

  // ---- 强制主文字 / 辅助文字 ----
  textPrimary: '#43655a',
  textSecondary: '#889fa5',

  // ---- Tab Bar ----
  tabBar: 'rgba(255,255,255,0.96)',

  // ---- 悬浮按钮 ----
  fab: '#628281',

  // ---- 强调色 ----
  primary: '#628281',
  accent: '#43655a',

  // ---- 兼容别名 ----
  glass: 'rgba(255,255,255,0.92)',
  glassLight: 'rgba(255,255,255,0.80)',
  glassBorder: 'rgba(255,255,255,0.55)',
  secondary: 'rgba(255,255,255,0.60)',

  // ---- 状态 ----
  error: '#e05c5c',
  success: '#4CAF50',
  warning: '#FFB74D',
};

// ============================================================
//  Spacing
// ============================================================
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 14,
  lg: 20,
  xl: 28,
  xxl: 36,
  xxxl: 48,
};

// ============================================================
//  Font Sizes
// ============================================================
export const FONT_SIZES = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  xxxl: 30,
};

// ============================================================
//  Border Radius — 强制大圆角 18px
// ============================================================
export const BORDER_RADIUS = {
  sm: 10,
  md: 14,
  lg: 18,   // 强制大圆角
  xl: 24,
  full: 9999,
};

// ============================================================
//  Shadows — 轻微阴影
// ============================================================
export const SHADOWS = {
  card: {
    shadowColor: 'rgba(0,0,0,0.10)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
  },
  glass: {
    shadowColor: 'rgba(0,0,0,0.08)',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 4,
  },
  glassSm: {
    shadowColor: 'rgba(0,0,0,0.06)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
  },
  fab: {
    shadowColor: 'rgba(0,0,0,0.18)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 6,
  },
  subtle: {
    shadowColor: 'rgba(0,0,0,0.08)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
};

// ============================================================
//  默认品类 & 场合
// ============================================================
export const DEFAULT_OCCASIONS = [
  { id: '1', name: '日常通勤', order: 0 },
  { id: '2', name: '约会', order: 1 },
  { id: '3', name: '正式场合', order: 2 },
  { id: '4', name: '运动', order: 3 },
  { id: '5', name: '在家', order: 4 },
];

export const LOCATION_TYPES = ['家', '学校'] as const;

export const DEFAULT_CATEGORIES = [
  { id: '1', name: '上衣', parentId: null, order: 0 },
  { id: '2', name: '下装', parentId: null, order: 1 },
  { id: '3', name: '连衣裙', parentId: null, order: 2 },
  { id: '4', name: '外套', parentId: null, order: 3 },
  { id: '5', name: '鞋子', parentId: null, order: 4 },
  { id: '6', name: '配饰', parentId: null, order: 5 },
];
