/**
 * GradientBackground — 全局渐变背景组件
 * 所有页面根容器使用此组件替代 View
 */
import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { GRADIENT_COLORS } from '../../constants/theme';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
}

export const GradientBackground = ({ children, style }: Props) => (
  <LinearGradient
    colors={GRADIENT_COLORS}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
    style={[styles.gradient, style]}
  >
    {children}
  </LinearGradient>
);

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
});
