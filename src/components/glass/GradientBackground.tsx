/**
 * GradientBackground — 全局背景组件
 * 全局背景色
 */
import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { COLORS } from '../../constants/theme';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
}

export const GradientBackground = ({ children, style }: Props) => (
  <View style={[styles.bg, style]}>
    {children}
  </View>
);

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
});
