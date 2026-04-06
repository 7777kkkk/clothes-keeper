/**
 * GlassComponents — 玻璃拟态共享组件库
 * 深色毛玻璃风格，白色文字，缩小尺寸
 */
import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ViewStyle,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../../constants/theme';

// ============================================================
//  GlassCard — 亚克力毛玻璃卡片
// ============================================================
export const GlassCard = ({
  children, style, padding = 'lg', onPress, activeOpacity = 0.85,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: keyof typeof SPACING | 'none';
  onPress?: () => void;
  activeOpacity?: number;
}) => {
  const cardStyle: ViewStyle = {
    backgroundColor: COLORS.glass,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    borderRadius: BORDER_RADIUS.xl,
    padding: padding === 'none' ? 0 : SPACING[padding as keyof typeof SPACING],
    ...SHADOWS.glass,
  };
  if (onPress) {
    return (
      <TouchableOpacity activeOpacity={activeOpacity} onPress={onPress} style={[cardStyle, style]}>
        {children}
      </TouchableOpacity>
    );
  }
  return <View style={[cardStyle, style]}>{children}</View>;
};

// ============================================================
//  GlassPill — 胶囊标签
// ============================================================
export const GlassPill = ({
  label, active = false, icon, onPress, size = 'md',
}: {
  label: string;
  active?: boolean;
  icon?: string;
  onPress?: () => void;
  size?: 'sm' | 'md';
}) => (
  <TouchableOpacity activeOpacity={0.75} onPress={onPress} style={[
    styles.pill, size === 'sm' && styles.pillSm,
    active ? styles.pillActive : styles.pillInactive,
  ]}>
    {icon && (
      <Icon
        name={icon}
        size={size === 'sm' ? 11 : 13}
        color={active ? '#fff' : COLORS.textSecondary}
        style={styles.pillIcon}
      />
    )}
    <Text style={[styles.pillText, size === 'sm' && styles.pillTextSm, active ? styles.pillTextActive : styles.pillTextInactive]}>
      {label}
    </Text>
  </TouchableOpacity>
);

// ============================================================
//  FAB — 悬浮操作按钮
// ============================================================
export const FAB = ({
  icon = 'plus', onPress, style, size = 'md', color = COLORS.primary,
}: {
  icon?: string;
  onPress?: () => void;
  style?: ViewStyle;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}) => {
  const sizes = { sm: 42, md: 50, lg: 58 };
  const iconSizes = { sm: 20, md: 24, lg: 28 };
  const s = sizes[size];
  return (
    <TouchableOpacity
      activeOpacity={0.8} onPress={onPress}
      style={[{ width: s, height: s, borderRadius: s / 2, backgroundColor: color }, SHADOWS.fab, style as any]}
    >
      <Icon name={icon} size={iconSizes[size]} color="#fff" />
    </TouchableOpacity>
  );
};

// ============================================================
//  SectionHeader — 区域标题
// ============================================================
export const SectionHeader = ({
  title, actionLabel, onAction,
}: {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {actionLabel && (
      <TouchableOpacity onPress={onAction}>
        <Text style={styles.sectionAction}>{actionLabel}</Text>
      </TouchableOpacity>
    )}
  </View>
);

// ============================================================
//  EmptyState — 空状态
// ============================================================
export const EmptyState = ({
  icon, title, subtitle, actionLabel, onAction,
}: {
  icon?: string;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
}) => (
  <View style={styles.emptyState}>
    {icon && <Icon name={icon} size={56} color={COLORS.textMuted} />}
    <Text style={styles.emptyTitle}>{title}</Text>
    {subtitle && <Text style={styles.emptySubtitle}>{subtitle}</Text>}
    {actionLabel && (
      <TouchableOpacity style={styles.emptyBtn} onPress={onAction}>
        <Text style={styles.emptyBtnText}>{actionLabel}</Text>
      </TouchableOpacity>
    )}
  </View>
);

// ============================================================
//  Badge — 数量徽章
// ============================================================
export const Badge = ({ count, style }: { count: number; style?: ViewStyle }) => (
  <View style={[styles.badge, style]}>
    <Text style={styles.badgeText}>{count}</Text>
  </View>
);

// ============================================================
//  Styles
// ============================================================
const styles = StyleSheet.create({
  // --- Pill ---
  pill: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs + 1,
    borderRadius: BORDER_RADIUS.full, borderWidth: 1, gap: 4,
  },
  pillSm: {
    paddingHorizontal: SPACING.sm, paddingVertical: SPACING.xs,
  },
  pillInactive: {
    backgroundColor: 'rgba(255,255,255,0.05)', borderColor: COLORS.border,
  },
  pillActive: {
    backgroundColor: COLORS.primary, borderColor: COLORS.primary,
  },
  pillText: { fontSize: FONT_SIZES.sm, fontWeight: '600' },
  pillTextSm: { fontSize: FONT_SIZES.xs },
  pillTextInactive: { color: COLORS.textSecondary },
  pillTextActive: { color: '#fff' },
  pillIcon: { marginRight: 2 },

  // --- FAB ---
  // (defined inline above for dynamic sizing)

  // --- SectionHeader ---
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: SPACING.xl, marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.textPrimary,
  },
  sectionAction: {
    fontSize: FONT_SIZES.sm, color: COLORS.primary, fontWeight: '600',
  },

  // --- EmptyState ---
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyTitle: {
    fontSize: FONT_SIZES.lg, fontWeight: 'bold', color: COLORS.textSecondary,
    marginTop: SPACING.lg, marginBottom: SPACING.xs,
  },
  emptySubtitle: {
    fontSize: FONT_SIZES.sm, color: COLORS.textMuted,
    marginBottom: SPACING.xl, textAlign: 'center',
  },
  emptyBtn: {
    backgroundColor: COLORS.primary, paddingHorizontal: SPACING.xl, paddingVertical: SPACING.sm + 2,
    borderRadius: BORDER_RADIUS.full, ...SHADOWS.subtle,
  },
  emptyBtnText: { color: '#fff', fontWeight: '700', fontSize: FONT_SIZES.sm },

  // --- Badge ---
  badge: {
    backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: SPACING.sm, paddingVertical: 2,
    borderWidth: 1, borderColor: COLORS.border, minWidth: 22, alignItems: 'center',
  },
  badgeText: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.textSecondary },
});
