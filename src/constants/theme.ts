// ============================================================
//  Theme — Modern Flix UI (玻璃拟态冷色系)
// ============================================================

export const COLORS = {
  // 主背景（白色纯净底色）
  background: '#FFFFFF',

  // 玻璃卡片（亚克力半透明效果）
  glass: 'rgba(240, 244, 250, 0.82)',
  glassLight: 'rgba(248, 250, 255, 0.65)',
  glassBorder: 'rgba(0, 0, 0, 0.08)',
  glassBorderLight: 'rgba(0, 0, 0, 0.04)',

  // 主强调色（纯净冰蓝）
  primary: '#3B82F6',
  primarySoft: 'rgba(59, 130, 246, 0.12)',
  primaryGlow: 'rgba(59, 130, 246, 0.25)',

  // 次要色（薄荷绿）
  accent: '#10B981',
  accentSoft: 'rgba(16, 185, 129, 0.12)',

  // 文字（深色系，适合白色底）
  textPrimary: 'rgba(15, 23, 42, 0.95)',
  textSecondary: 'rgba(100, 116, 139, 0.70)',
  textMuted: 'rgba(148, 163, 184, 0.55)',

  // 边框
  border: 'rgba(0, 0, 0, 0.08)',
  borderBright: 'rgba(0, 0, 0, 0.14)',

  // 状态色
  error: 'rgba(255, 100, 110, 1)',
  success: 'rgba(80, 220, 160, 1)',
  warning: 'rgba(255, 200, 100, 1)',

  // Tab Bar（玻璃亚克力）
  tabBar: 'rgba(255, 255, 255, 0.92)',
  tabBarBorder: 'rgba(0, 0, 0, 0.06)',

  // 覆盖层
  overlay: 'rgba(0, 0, 0, 0.40)',

  // 阴影（柔和蓝灰色调）
  shadowColor: 'rgba(59, 130, 246, 0.18)',
  shadowColorLight: 'rgba(0, 0, 0, 0.08)',

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
//  Shadows — 玻璃拟态柔和阴影
// ============================================================
export const SHADOWS = {
  // 玻璃卡片悬浮感（柔和发散）
  glass: {
    shadowColor: 'rgba(59, 130, 246, 0.12)',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 8,
  },

  // 玻璃卡片（更轻量）
  glassSm: {
    shadowColor: 'rgba(59, 130, 246, 0.08)',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 4,
  },

  // 按钮/标签微阴影
  subtle: {
    shadowColor: 'rgba(0, 0, 0, 0.06)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 3,
  },

  // FAB 悬浮阴影
  fab: {
    shadowColor: 'rgba(59, 130, 246, 0.30)',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 12,
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
