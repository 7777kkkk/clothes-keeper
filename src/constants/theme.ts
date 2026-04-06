// ============================================================
//  Theme — Modern Flix UI (玻璃拟态冷色系)
// ============================================================

export const COLORS = {
  // 主背景（深邃冷色调）
  background: 'rgba(14, 20, 30, 0.96)',

  // 玻璃卡片（半透明）
  glass: 'rgba(30, 42, 62, 0.72)',
  glassLight: 'rgba(50, 70, 100, 0.55)',
  glassBorder: 'rgba(255, 255, 255, 0.10)',
  glassBorderLight: 'rgba(255, 255, 255, 0.06)',

  // 主强调色（柔和冰蓝）
  primary: 'rgba(100, 180, 255, 1)',
  primarySoft: 'rgba(100, 180, 255, 0.18)',
  primaryGlow: 'rgba(100, 180, 255, 0.35)',

  // 次要色（墨绿/青灰）
  accent: 'rgba(80, 200, 180, 1)',
  accentSoft: 'rgba(80, 200, 180, 0.15)',

  // 文字（低饱和度白）
  textPrimary: 'rgba(240, 245, 255, 0.95)',
  textSecondary: 'rgba(180, 200, 220, 0.65)',
  textMuted: 'rgba(140, 165, 195, 0.45)',

  // 边框
  border: 'rgba(255, 255, 255, 0.08)',
  borderBright: 'rgba(255, 255, 255, 0.15)',

  // 状态色
  error: 'rgba(255, 100, 110, 1)',
  success: 'rgba(80, 220, 160, 1)',
  warning: 'rgba(255, 200, 100, 1)',

  // Tab Bar（玻璃效果）
  tabBar: 'rgba(10, 15, 25, 0.88)',
  tabBarBorder: 'rgba(255, 255, 255, 0.06)',

  // 覆盖层
  overlay: 'rgba(0, 0, 0, 0.55)',

  // 阴影（带冷色调）
  shadowColor: 'rgba(0, 80, 160, 0.35)',
  shadowColorLight: 'rgba(0, 40, 100, 0.20)',

  // ========================================
  // 兼容别名（供旧页面使用，逐步迁移）
  // ========================================
  card: 'rgba(30, 42, 62, 0.72)',       // 玻璃卡片
  secondary: 'rgba(50, 70, 100, 0.55)', // 玻璃浅色
};

// ============================================================
//  Spacing — 4pt 基准，语义化命名
// ============================================================
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
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
//  Border Radius — 大圆角是玻璃拟态核心
// ============================================================
export const BORDER_RADIUS = {
  sm: 10,
  md: 16,
  lg: 20,
  xl: 28,
  full: 9999,
};

// ============================================================
//  Shadows — 柔和冷色阴影
// ============================================================
export const SHADOWS = {
  // 玻璃卡片悬浮感
  glass: {
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 12,
  },

  // 按钮/标签微阴影
  subtle: {
    shadowColor: COLORS.shadowColorLight,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  },

  // Tab Bar 阴影
  tabBar: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 20,
  },

  // 兼容旧页面（逐步迁移到 glass/subtle）
  card: {
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
};

// ============================================================
//  Glass Mixins — 可复用的玻璃效果
// ============================================================
export const GLASS = {
  // 基础玻璃卡片
  card: {
    backgroundColor: COLORS.glass,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.glass,
  },

  // 轻质玻璃
  cardLight: {
    backgroundColor: COLORS.glassLight,
    borderWidth: 1,
    borderColor: COLORS.glassBorderLight,
    borderRadius: BORDER_RADIUS.md,
    ...SHADOWS.subtle,
  },

  // 胶囊标签
  pill: {
    backgroundColor: COLORS.primarySoft,
    borderWidth: 1,
    borderColor: 'rgba(100, 180, 255, 0.25)',
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
  },

  // 选中胶囊
  pillActive: {
    backgroundColor: COLORS.primary,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.30)',
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
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
  { id: '2', name: '裤子', parentId: null, order: 1 },
  { id: '3', name: '裙子', parentId: null, order: 2 },
  { id: '4', name: '鞋子', parentId: null, order: 3 },
  { id: '5', name: '配饰', parentId: null, order: 4 },
];
