/**
 * Theme — Flix.id Dark Frosted Glass（深色毛玻璃拟态）
 *
 * 背景：深色磨砂底 + 半透明玻璃卡片
 * 文字：白色/浅灰（在高对比度深色背景上清晰可读）
 * 强调：低饱和冰蓝 #64B5F6
 *
 * 遵循 impeccable Skill:
 * - 低饱和度冷色系（不刺眼）
 * - 柔和阴影（不发散）
 * - 充足留白，节奏分明
 */

export const COLORS = {
  // ---- 深色磨砂背景 ----
  background: '#0F1724',

  // ---- 玻璃卡片（半透明深色） ----
  glass: 'rgba(22, 32, 52, 0.78)',
  glassLight: 'rgba(35, 48, 72, 0.55)',
  glassBorder: 'rgba(255, 255, 255, 0.08)',
  glassBorderLight: 'rgba(255, 255, 255, 0.04)',

  // ---- 主强调色（低饱和冰蓝） ----
  primary: '#64B5F6',
  primarySoft: 'rgba(100, 181, 246, 0.15)',
  primaryGlow: 'rgba(100, 181, 246, 0.30)',

  // ---- 次要色（薄荷绿） ----
  accent: '#4DB6AC',
  accentSoft: 'rgba(77, 182, 172, 0.15)',

  // ---- 文字（白色系，在深色背景上清晰） ----
  textPrimary: 'rgba(255, 255, 255, 0.95)',
  textSecondary: 'rgba(180, 200, 220, 0.65)',
  textMuted: 'rgba(140, 165, 190, 0.45)',

  // ---- 边框 ----
  border: 'rgba(255, 255, 255, 0.07)',
  borderBright: 'rgba(255, 255, 255, 0.12)',

  // ---- 状态色 ----
  error: '#EF5350',
  success: '#4DB6AC',
  warning: '#FFB74D',

  // ---- Tab Bar（深色玻璃） ----
  tabBar: 'rgba(10, 16, 28, 0.92)',
  tabBarBorder: 'rgba(255, 255, 255, 0.05)',

  // ---- 覆盖层 ----
  overlay: 'rgba(0, 0, 0, 0.50)',

  // ---- 兼容别名 ----
  card: 'rgba(22, 32, 52, 0.78)',
  secondary: 'rgba(35, 48, 72, 0.55)',
};

// ============================================================
//  Spacing — 4pt 基准，更紧凑
// ============================================================
export const SPACING = {
  xs: 3,
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  xxl: 28,
  xxxl: 40,
};

// ============================================================
//  Font Sizes — 整体缩小一号
// ============================================================
export const FONT_SIZES = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  xxl: 22,
  xxxl: 28,
};

// ============================================================
//  Border Radius — 大圆角玻璃拟态
// ============================================================
export const BORDER_RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 22,
  full: 9999,
};

// ============================================================
//  Shadows — 柔和蓝调阴影
// ============================================================
export const SHADOWS = {
  // 玻璃卡片悬浮感
  glass: {
    shadowColor: 'rgba(100, 181, 246, 0.10)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 6,
  },

  // 玻璃卡片（更轻）
  glassSm: {
    shadowColor: 'rgba(100, 181, 246, 0.07)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
  },

  // 按钮/标签微阴影
  subtle: {
    shadowColor: 'rgba(0, 0, 0, 0.20)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },

  // FAB 悬浮阴影
  fab: {
    shadowColor: 'rgba(100, 181, 246, 0.25)',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 1,
    shadowRadius: 14,
    elevation: 10,
  },

  // 兼容
  card: {
    shadowColor: 'rgba(100, 181, 246, 0.10)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
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
