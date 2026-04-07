import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert,
  Modal, TextInput, KeyboardAvoidingView, Platform,
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
    homeFilterCategory, homeFilterSeason, bodyData, settings, updateSetting,
    loadData, clearAllData } = useStore();
  const [restoreVisible, setRestoreVisible] = useState(false);

  // 主题显示文字
  const themeLabels = { light: '浅色', dark: '深色', system: '跟随系统' };
  const seasonLabels: Record<string, string> = {
    '春': '春季', '夏': '夏季', '秋': '秋季', '冬': '冬季', '全年': '全年',
  };
  const currencySymbols: Record<string, string> = {
    CNY: 'CNY (¥)', USD: 'USD ($)', EUR: 'EUR (€)', JPY: 'JPY (¥)', GBP: 'GBP (£)', KRW: 'KRW (₩)',
  };

  // 外观模式选择
  const handleThemePress = () => {
    Alert.alert('外观模式', '选择主题', [
      { text: '浅色', onPress: () => updateSetting('theme', 'light') },
      { text: '深色', onPress: () => updateSetting('theme', 'dark') },
      { text: '跟随系统', onPress: () => updateSetting('theme', 'system') },
    ]);
  };

  // 衣橱季节选择
  const handleSeasonPress = () => {
    Alert.alert('衣橱季节', '选择当前季节', [
      { text: '春季', onPress: () => updateSetting('season', '春') },
      { text: '夏季', onPress: () => updateSetting('season', '夏') },
      { text: '秋季', onPress: () => updateSetting('season', '秋') },
      { text: '冬季', onPress: () => updateSetting('season', '冬') },
      { text: '全年', onPress: () => updateSetting('season', '全年') },
    ]);
  };

  // 货币单位选择
  const handleCurrencyPress = () => {
    const options: Array<{ text: string; value: 'CNY' | 'USD' | 'EUR' | 'JPY' | 'GBP' | 'KRW' }> = [
      { text: 'CNY (¥) 人民币', value: 'CNY' },
      { text: 'USD ($) 美元', value: 'USD' },
      { text: 'EUR (€) 欧元', value: 'EUR' },
      { text: 'JPY (¥) 日元', value: 'JPY' },
      { text: 'GBP (£) 英镑', value: 'GBP' },
      { text: 'KRW (₩) 韩元', value: 'KRW' },
    ];
    Alert.alert('货币单位', '选择货币单位', [
      ...options.map(o => ({ text: o.text, onPress: () => updateSetting('currency', o.value) })),
    ]);
  };

  // 清除所有数据
  const handleClearAllData = () => {
    Alert.alert('⚠️ 警告', '确定要清除所有数据吗？此操作不可恢复！', [
      { text: '取消' },
      {
        text: '确定',
        style: 'destructive',
        onPress: () => {
          Alert.prompt(
            '最终确认',
            '此操作不可恢复，请在输入框输入「确认」',
            [
              { text: '取消', style: 'cancel' },
              {
                text: '确认',
                style: 'destructive',
                onPress: async (input) => {
                  if (input === '确认') {
                    await clearAllData();
                    Alert.alert('已清除', '所有数据已清除，App 将重新加载。');
                  }
                },
              },
            ],
            'plain-text',
            '',
            'default'
          );
        },
      },
    ]);
  };

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
            <SettingRow icon="sunny-outline" title="外观模式" value={themeLabels[settings.theme]} onPress={handleThemePress} />
            <SettingRow icon="leaf-outline" title="衣橱季节" value={seasonLabels[settings.season]} onPress={handleSeasonPress} />
            <SettingRow icon="body-outline" title="身材数据" onPress={() => nav.navigate('BodyData')} />
            <SettingRow icon="cash-outline" title="货币单位" value={currencySymbols[settings.currency]} onPress={handleCurrencyPress} />
          </GlassCard>

          <SectionHeader title="数据" />
          <GlassCard style={styles.settingsGroup} padding="none">
            <SettingRow icon="cloud-upload" title="数据备份" subtitle="复制到剪贴板" onPress={handleBackup} />
            <SettingRow icon="cloud-download" title="恢复数据" subtitle="从备份恢复" onPress={() => setRestoreVisible(true)} />
            <SettingRow icon="trash-bin-outline" title="回收站" subtitle="已删除衣物" danger onPress={() => nav.navigate('RecycleBin')} />
            <SettingRow icon="nuclear-outline" title="清除所有数据" subtitle="不可恢复" danger onPress={handleClearAllData} />
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
