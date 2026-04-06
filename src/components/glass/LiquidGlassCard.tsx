/**
 * LiquidGlassCard — 玻璃卡片组件（无动画版）
 *
 * 效果：Backdrop blur + 白色折射层 + 触控回弹
 */
import React from 'react';
import { View, StyleSheet, Pressable, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { COLORS, BORDER_RADIUS, SHADOWS } from '../../constants/theme';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  intensity?: 'light' | 'medium' | 'heavy';
}

export const LiquidGlassCard = ({
  children,
  style,
  onPress,
  intensity = 'medium',
}: Props) => {
  const pressed = useSharedValue(0);
  const blurIntensity = intensity === 'heavy' ? 20 : intensity === 'medium' ? 12 : 8;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(pressed.value, [0, 1], [1, 0.97]) }],
    opacity: interpolate(pressed.value, [0, 1], [1, 0.9]),
  }));

  const handlePressIn = () => { pressed.value = withTiming(1, { duration: 100 }); };
  const handlePressOut = () => { pressed.value = withTiming(0, { duration: 200 }); };

  const card = (
    <Animated.View style={[styles.card, animatedStyle, style]}>
      <BlurView intensity={blurIntensity} tint="light" style={StyleSheet.absoluteFill} />
      <LinearGradient
        colors={['rgba(255,255,255,0.40)', 'rgba(255,255,255,0.20)', 'rgba(255,255,255,0.05)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.content}>{children}</View>
      <View style={styles.border} />
    </Animated.View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut}>
        {card}
      </Pressable>
    );
  }
  return card;
};

// ============================================================
//  LiquidGlassPill — 玻璃胶囊
// ============================================================
export const LiquidGlassPill = ({
  children,
  onPress,
  active = false,
  style,
}: {
  children: React.ReactNode;
  onPress?: () => void;
  active?: boolean;
  style?: ViewStyle;
}) => (
  <Pressable onPress={onPress}>
    <View style={[styles.pill, active && styles.pillActive, style]}>
      {children}
    </View>
  </Pressable>
);

const styles = StyleSheet.create({
  card: {
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.glass,
  },
  content: { zIndex: 2 },
  border: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 0.8,
    borderColor: 'rgba(255,255,255,0.4)',
    zIndex: 3,
    pointerEvents: 'none',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: 'rgba(255,255,255,0.30)',
    borderWidth: 0.8,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  pillActive: {
    backgroundColor: 'rgba(162,189,234,0.25)',
    borderColor: 'rgba(162,189,234,0.5)',
  },
});
