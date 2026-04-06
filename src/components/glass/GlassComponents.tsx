/**
 * GlassComponents.tsx — 玻璃拟态共享组件库
 *
 * 包含:
 * - GlassCard: 亚克力毛玻璃卡片
 * - GlassPill: 胶囊标签
 * - GlassButton: 玻璃拟态按钮
 * - FAB: 悬浮操作按钮
 * - GlassHeader: 玻璃导航栏
 *
 * 设计原则（遵循 impeccable Skill）:
 * - 相同元素全程使用相同样式（字号/圆角/间距）
 * - 所有交互元素有 hover/active 反馈
 * - 文字层级清晰（主/次/辅助三级）
 * - 留白充足，节奏分明
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../../constants/theme';

// ============================================================
//  GlassCard — 亚克力毛玻璃卡片
// ============================================================
export interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: keyof typeof SPACING | 'none';
  onPress?: () => void;
  activeOpacity?: number;
}

export const GlassCard = ({
  children,
  style,
  padding = 'lg',
  onPress,
  activeOpacity = 0.85,
}: GlassCardProps) => {
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
      <TouchableOpacity
        activeOpacity={activeOpacity}
        onPress={onPress}
        style={[cardStyle, style]}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={[cardStyle, style]}>{children}</View>;
};

// ============================================================
//  GlassPill — 胶囊标签
// ============================================================
export interface GlassPillProps {
  label: string;
  active?: boolean;
  icon?: string;
  onPress?: () => void;
  size?: 'sm' | 'md';
}

export const GlassPill = ({
  label,
  active = false,
  icon,
  onPress,
  size = 'md',
}: GlassPillProps) => {
  const isSm = size === 'sm';
  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={onPress}
      style={[
        styles.pill,
        isSm && styles.pillSm,
        active ? styles.pillActive : styles.pillInactive,
      ]}
    >
      {icon && (
        <Icon
          name={icon}
          size={isSm ? 12 : 14}
          color={active ? '#fff' : COLORS.textSecondary}
          style={styles.pillIcon}
        />
      )}
      <Text
        style={[
          styles.pillText,
          isSm && styles.pillTextSm,
          active ? styles.pillTextActive : styles.pillTextInactive,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};

// ============================================================
//  FAB — 悬浮操作按钮
// ============================================================
export interface FABProps {
  icon?: string;
  onPress?: () => void;
  style?: ViewStyle;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

export const FAB = ({
  icon = 'plus',
  onPress,
  style,
  size = 'md',
  color = COLORS.primary,
}: FABProps) => {
  const sizeMap = { sm: 44, md: 52, lg: 60 };
  const iconSizeMap = { sm: 20, md: 24, lg: 28 };
  const fabSize = sizeMap[size];

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[
        styles.fab,
        {
          width: fabSize,
          height: fabSize,
          borderRadius: fabSize / 2,
          backgroundColor: color,
        },
        SHADOWS.fab,
        style,
      ]}
    >
      <Icon name={icon} size={iconSizeMap[size]} color="#fff" />
    </TouchableOpacity>
  );
};

// ============================================================
//  GlassNavBar — 玻璃导航栏（顶部）
// ============================================================
export interface GlassNavBarProps {
  title: string;
  leftIcon?: string;
  rightIcon?: string;
  onLeftPress?: () => void;
  onRightPress?: () => void;
  subtitle?: string;
}

export const GlassNavBar = ({
  title,
  leftIcon,
  rightIcon,
  onLeftPress,
  onRightPress,
  subtitle,
}: GlassNavBarProps) => (
  <View style={styles.navBar}>
    {leftIcon ? (
      <TouchableOpacity activeOpacity={0.75} onPress={onLeftPress} style={styles.navBtn}>
        <Icon name={leftIcon} size={24} color={COLORS.textPrimary} />
      </TouchableOpacity>
    ) : (
      <View style={styles.navBtnPlaceholder} />
    )}
    <View style={styles.navTitle}>
      <Text style={styles.navTitleText}>{title}</Text>
      {subtitle && <Text style={styles.navSubtitle}>{subtitle}</Text>}
    </View>
    {rightIcon ? (
      <TouchableOpacity activeOpacity={0.75} onPress={onRightPress} style={styles.navBtn}>
        <Icon name={rightIcon} size={24} color={COLORS.textPrimary} />
      </TouchableOpacity>
    ) : (
      <View style={styles.navBtnPlaceholder} />
    )}
  </View>
);

// ============================================================
//  SectionHeader — 区域标题
// ============================================================
export const SectionHeader = ({
  title,
  actionLabel,
  onAction,
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
  icon,
  title,
  subtitle,
  actionLabel,
  onAction,
}: {
  icon?: string;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
}) => (
  <View style={styles.emptyState}>
    {icon && <Icon name={icon} size={64} color={COLORS.textMuted} />}
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
//  Styles — 共享玻璃拟态样式
// ============================================================
const styles = StyleSheet.create({
  // --- Pill ---
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    gap: 4,
  },
  pillSm: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  pillInactive: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderColor: COLORS.border,
  },
  pillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  pillText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  pillTextSm: {
    fontSize: FONT_SIZES.xs,
  },
  pillTextInactive: {
    color: COLORS.textSecondary,
  },
  pillTextActive: {
    color: '#fff',
  },
  pillIcon: {
    marginRight: 2,
  },

  // --- FAB ---
  fab: {
    position: 'absolute',
    bottom: 100,
    right: SPACING.xl,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },

  // --- NavBar ---
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.glass,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  navTitle: {
    flex: 1,
    alignItems: 'center',
  },
  navTitleText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  navSubtitle: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  navBtn: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navBtnPlaceholder: {
    width: 40,
    height: 40,
  },

  // --- SectionHeader ---
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  sectionAction: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: '600',
  },

  // --- EmptyState ---
  emptyState: {
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
    marginTop: SPACING.lg,
    marginBottom: SPACING.xs,
  },
  emptySubtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textMuted,
    marginBottom: SPACING.xl,
    textAlign: 'center',
  },
  emptyBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.full,
    ...SHADOWS.subtle,
  },
  emptyBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: FONT_SIZES.md,
  },

  // --- Badge ---
  badge: {
    backgroundColor: 'rgba(0,0,0,0.06)',
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: COLORS.border,
    minWidth: 24,
    alignItems: 'center',
  },
  badgeText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
});
