/**
 * GlassComponents — 强制规范版（白色卡片 + Ionicons）
 */
import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ViewStyle,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../../constants/theme';

// ============================================================
//  GlassCard — 半透明白色卡片
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
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
    borderRadius: BORDER_RADIUS.lg,
    padding: padding === 'none' ? 0 : SPACING[padding as keyof typeof SPACING],
    ...SHADOWS.card,
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
        color={active ? '#fff' : 'rgba(0,0,0,0.5)'}
        style={styles.pillIcon}
      />
    )}
    <Text style={[styles.pillText, size === 'sm' && styles.pillTextSm, active ? styles.pillTextActive : styles.pillTextInactive]}>
      {label}
    </Text>
  </TouchableOpacity>
);

// ============================================================
//  FAB — 悬浮操作按钮（固定右下角 #A2BDEA）
// ============================================================
export const FAB = ({
  icon = 'add', onPress, style, size = 'md', color = COLORS.fab,
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
  icon = 'shirt-outline', title, subtitle, actionLabel, onAction,
}: {
  icon?: string;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
}) => (
  <View style={styles.emptyState}>
    <Icon name={icon} size={52} color="rgba(0,0,0,0.2)" />
    <Text style={styles.emptyTitle}>{title}</Text>
    {subtitle && <Text style={styles.emptySubtitle}>{subtitle}</Text>}
    {actionLabel && onAction && (
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
  pill: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs + 1,
    borderRadius: BORDER_RADIUS.full, borderWidth: 1, gap: 4,
  },
  pillSm: {
    paddingHorizontal: SPACING.sm, paddingVertical: SPACING.xs,
  },
  pillInactive: {
    backgroundColor: 'rgba(0,0,0,0.06)', borderColor: 'rgba(0,0,0,0.12)',
  },
  pillActive: {
    backgroundColor: COLORS.primary, borderColor: COLORS.primary,
  },
  pillText: { fontSize: FONT_SIZES.sm, fontWeight: '600' },
  pillTextSm: { fontSize: FONT_SIZES.xs },
  pillTextInactive: { color: 'rgba(0,0,0,0.55)' },
  pillTextActive: { color: '#fff' },
  pillIcon: { marginRight: 2 },

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

  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyTitle: {
    fontSize: FONT_SIZES.lg, fontWeight: 'bold', color: 'rgba(0,0,0,0.4)',
    marginTop: SPACING.lg, marginBottom: SPACING.xs,
  },
  emptySubtitle: {
    fontSize: FONT_SIZES.sm, color: 'rgba(0,0,0,0.3)',
    marginBottom: SPACING.xl, textAlign: 'center',
  },
  emptyBtn: {
    backgroundColor: COLORS.primary, paddingHorizontal: SPACING.xl, paddingVertical: SPACING.sm + 2,
    borderRadius: BORDER_RADIUS.full, ...SHADOWS.subtle,
  },
  emptyBtnText: { color: '#fff', fontWeight: '700', fontSize: FONT_SIZES.sm },

  badge: {
    backgroundColor: 'rgba(0,0,0,0.07)', borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: SPACING.sm, paddingVertical: 2,
    borderWidth: 1, borderColor: 'rgba(0,0,0,0.1)', minWidth: 22, alignItems: 'center',
  },
  badgeText: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: 'rgba(0,0,0,0.55)' },
});
