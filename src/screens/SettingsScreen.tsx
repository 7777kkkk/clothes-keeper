/**
 * SettingsScreen — 个人中心 / 设置页
 * 深色玻璃拟态，白色文字
 */
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert,
  Modal, TextInput, KeyboardAvoidingView, Platform, Share,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons as Icon } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as Clipboard from 'expo-clipboard';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useStore } from '../store/useStore';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { GlassCard, SectionHeader } from '../components/glass/GlassComponents';
import { GradientBackground } from '../components/glass/GradientBackground';

const STORAGE_KEY = '@clothes_keeper_data';

// ============================================================
//  SettingRow
// ============================================================
const SettingRow = ({
  icon, title, subtitle, value, onPress, danger = false,
}: {
  icon: string; title: string; subtitle?: string; value?: string;
  onPress?: () => void; danger?: boolean;
}) => (
  <TouchableOpacity activeOpacity={0.75} onPress={onPress} style={styles.settingRow}>
    <View style={[styles.settingIconBg, danger && { backgroundColor: 'rgba(239,83,80,0.15)' }]}>
      <Icon name={icon as any} size={18} color={danger ? COLORS.error : COLORS.primary} />
    </View>
    <View style={styles.settingText}>
      <Text style={[styles.settingTitle, danger && { color: COLORS.error }]}>{title}</Text>
      {subtitle && <Text style={styles.settingSub}>{subtitle}</Text>}
    </View>
    <View style={styles.settingRight}>
      {value && <Text style={styles.settingValue}>{value}</Text>}
      <Icon name="chevron-forward" size={18} color={'rgba(0,0,0,0.35)'} />
    </View>
  </TouchableOpacity>
);

// ============================================================
//  RestoreModal — 恢复数据弹窗
// ============================================================
const RestoreModal = ({
  visible, onClose, onRestore,
}: {
  visible: boolean;
  onClose: () => void;
  onRestore: (json: string) => void;
}) => {
  const [input, setInput] = useState('');
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>恢复数据</Text>
          <Text style={styles.modalSubtitle}>
            请粘贴之前备份的 JSON 数据，导入后将覆盖当前所有数据。
          </Text>
          <TextInput
            style={styles.modalInput}
            value={input}
            onChangeText={setInput}
            placeholder="粘贴 JSON 数据..."
            placeholderTextColor={COLORS.textSecondary}
            multiline
            autoCapitalize="none"
            autoCorrect={false}
          />
          <View style={styles.modalBtns}>
            <TouchableOpacity style={styles.modalBtnCancel} onPress={onClose} activeOpacity={0.8}>
              <Text style={styles.modalBtnCancelText}>取消</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalBtnRestore, !input.trim() && styles.modalBtnDisabled]}
              onPress={() => input.trim() && onRestore(input.trim())}
              activeOpacity={0.8}
              disabled={!input.trim()}
            >
              <Text style={styles.modalBtnRestoreText}>恢复</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

// ============================================================
//  SettingsScreen
// ============================================================
const SettingsScreen = () => {
  const insets = useSafeAreaInsets();
  const nav = useNavigation<any>();
  const { categories, clothingItems, outfits, occasions, calendarRecords,
    attributeTemplates, homeMode, homeSortBy, homeSortOrder,
    homeFilterCategory, homeFilterSeason, bodyData, loadData } = useStore();
  const [restoreVisible, setRestoreVisible] = useState(false);

  // 数据备份
  const handleBackup = async () => {
    try {
      const data = {
        categories,
        clothingItems,
        outfits,
        occasions,
        calendarRecords,
        attributeTemplates,
        homeMode,
        homeSortBy,
        homeSortOrder,
        homeFilterCategory,
        homeFilterSeason,
        bodyData,
      };
      const json = JSON.stringify(data, null, 2);
      await Clipboard.setStringAsync(json);
      Alert.alert(
        '备份成功 ✓',
        '数据已复制到剪贴板，请妥善保存。\n\n注意：数据中包含图片 URL 等信息，建议仅在换设备时使用。',
        [{ text: '确定' }]
      );
    } catch (e) {
      Alert.alert('备份失败', '请稍后重试');
    }
  };

  // 数据恢复
  const handleRestore = async (json: string) => {
    try {
      const data = JSON.parse(json);
      // 简单校验
      if (!data.categories && !data.clothingItems) {
        Alert.alert('格式错误', '数据格式不正确，请确认粘贴的内容来自本应用的备份。');
        return;
      }
      await AsyncStorage.setItem(STORAGE_KEY, json);
      await loadData();
      setRestoreVisible(false);
      Alert.alert('恢复成功 ✓', '数据已成功恢复，App 将重新加载。');
    } catch (e) {
      Alert.alert('恢复失败', 'JSON 解析失败，请确认数据格式正确。');
    }
  };

  return (
    <GradientBackground>
      <RestoreModal
        visible={restoreVisible}
        onClose={() => setRestoreVisible(false)}
        onRestore={handleRestore}
      />

      <SafeAreaView style={[styles.container, { paddingTop: insets.top }]} edges={['top']}>
        <View style={styles.topNav}>
          <Text style={styles.topNavTitle}>我的</Text>
        </View>

        <ScrollView
          style={styles.mainScroll}
          contentContainerStyle={[styles.mainContent, { paddingBottom: insets.bottom + 100 }]}
          showsVerticalScrollIndicator={false}
        >
          {/* 设置项 */}
          <SectionHeader title="衣橱管理" />
          <GlassCard style={styles.settingsGroup} padding="none">
            <SettingRow icon="grid-outline" title="品类管理" subtitle={`${categories.length} 个分类`} onPress={() => nav.navigate('CategoryManage')} />
            <SettingRow icon="calendar-outline" title="场合管理" onPress={() => nav.navigate('OccasionManage')} />
            <SettingRow icon="pricetag" title="属性管理" onPress={() => nav.navigate('AttributeManage')} />
          </GlassCard>

          <SectionHeader title="通用设置" />
          <GlassCard style={styles.settingsGroup} padding="none">
            <SettingRow icon="sunny-outline" title="外观模式" value="浅色" onPress={() => Alert.alert('提示', '功能开发中')} />
            <SettingRow icon="leaf-outline" title="衣橱季节" value="全年" onPress={() => Alert.alert('提示', '功能开发中')} />
            <SettingRow icon="body-outline" title="身材数据" onPress={() => nav.navigate('BodyData')} />
            <SettingRow icon="cash-outline" title="货币单位" value="CNY" onPress={() => Alert.alert('提示', '功能开发中')} />
          </GlassCard>

          <SectionHeader title="数据" />
          <GlassCard style={styles.settingsGroup} padding="none">
            <SettingRow icon="cloud-upload" title="数据备份" subtitle="复制到剪贴板" onPress={handleBackup} />
            <SettingRow icon="cloud-download" title="恢复数据" subtitle="从备份恢复" onPress={() => setRestoreVisible(true)} />
            <SettingRow icon="trash-bin-outline" title="回收站" subtitle="已删除衣物" danger onPress={() => Alert.alert('提示', '功能开发中')} />
          </GlassCard>

          <SectionHeader title="其他" />
          <GlassCard style={styles.settingsGroup} padding="none">
            <SettingRow icon="water" title="Liquid Glass 演示" subtitle="WWDC 2025 特效" onPress={() => nav.navigate('LiquidGlassDemo')} />
            <SettingRow icon="information-circle-outline" title="关于衣橱" subtitle="版本 1.0.0" onPress={() => Alert.alert('提示', '功能开发中')} />
            <SettingRow icon="star-outline" title="给 App 评分" onPress={() => Alert.alert('提示', '功能开发中')} />
            <SettingRow icon="share-social-outline" title="分享给好友" onPress={() => Alert.alert('提示', '功能开发中')} />
          </GlassCard>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Clothes Keeper v1.0</Text>
            <Text style={styles.footerSub}>Made with ❤️</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
};

// ============================================================
//  Styles
// ============================================================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  topNav: {
    paddingHorizontal: SPACING.xl, paddingVertical: SPACING.sm,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.12)',
  },
  topNavTitle: {
    fontSize: FONT_SIZES.xxl, fontWeight: '800',
    color: COLORS.textPrimary, letterSpacing: -0.5,
  },

  mainScroll: { flex: 1 },
  mainContent: { paddingTop: SPACING.lg },

  // Settings
  settingsGroup: { marginHorizontal: SPACING.lg, marginBottom: SPACING.lg, overflow: 'hidden' },
  settingRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
    borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.12)',
    gap: SPACING.md,
  },
  settingIconBg: {
    width: 34, height: 34, borderRadius: BORDER_RADIUS.md,
    backgroundColor: 'rgba(74,144,217,0.2)', justifyContent: 'center', alignItems: 'center',
  },
  settingText: { flex: 1 },
  settingTitle: { fontSize: FONT_SIZES.md, fontWeight: '600', color: COLORS.textPrimary },
  settingSub: { fontSize: FONT_SIZES.xs, color: 'rgba(0,0,0,0.35)', marginTop: 1 },
  settingRight: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
  settingValue: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary },

  // Footer
  footer: { alignItems: 'center', paddingVertical: SPACING.xl, gap: SPACING.xs },
  footerText: { fontSize: FONT_SIZES.sm, color: 'rgba(0,0,0,0.35)', fontWeight: '600' },
  footerSub: { fontSize: FONT_SIZES.xs, color: 'rgba(0,0,0,0.35)' },

  // Restore Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  modalContent: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
  },
  modalTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  modalSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
    lineHeight: 20,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.15)',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textPrimary,
    minHeight: 120,
    textAlignVertical: 'top',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    marginBottom: SPACING.lg,
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  modalBtns: { flexDirection: 'row', gap: SPACING.md },
  modalBtnCancel: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.2)',
    alignItems: 'center',
  },
  modalBtnCancelText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  modalBtnRestore: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.xl,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
  },
  modalBtnDisabled: {
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  modalBtnRestoreText: {
    fontSize: FONT_SIZES.md,
    color: '#fff',
    fontWeight: '700',
  },
});

export default SettingsScreen;
