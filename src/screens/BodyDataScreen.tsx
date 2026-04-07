/**
 * BodyDataScreen — 身材数据录入与管理
 * 玻璃拟态风格，分组显示 基础/躯干/四肢
 */
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons as Icon } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useStore } from '../store/useStore';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';
import { GlassCard, SectionHeader } from '../components/glass/GlassComponents';
import { GradientBackground } from '../components/glass/GradientBackground';

// ============================================================
//  数据字段定义
// ============================================================
interface FieldDef {
  key: string;
  label: string;
  hint: string;
  group: 'basic' | 'torso' | 'limb';
}

const FIELD_DEFS: FieldDef[] = [
  // 基础
  { key: 'height', label: '身高', hint: '请输入身高', group: 'basic' },
  { key: 'weight', label: '体重', hint: '请输入体重', group: 'basic' },
  // 躯干
  { key: 'headCircumference', label: '头围', hint: '眉毛上方、后脑勺最凸处绕一圈', group: 'torso' },
  { key: 'neckCircumference', label: '颈围', hint: '脖子根部最细处水平一圈', group: 'torso' },
  { key: 'shoulderWidth', label: '肩宽', hint: '左肩峰到右肩峰直线距离', group: 'torso' },
  { key: 'chestCircumference', label: '胸围', hint: '胸部最丰满处水平一圈', group: 'torso' },
  { key: 'underBust', label: '下胸围', hint: '乳房根部水平一圈', group: 'torso' },
  { key: 'waistCircumference', label: '腰围', hint: '腰部最薄处（肚脐上方）一圈', group: 'torso' },
  { key: 'abdomenCircumference', label: '腹围', hint: '肚脐水平一圈', group: 'torso' },
  { key: 'hipCircumference', label: '臀围', hint: '臀部最丰满处一圈', group: 'torso' },
  // 四肢
  { key: 'upperArmCircumference', label: '上臂围', hint: '上臂最粗处一圈', group: 'limb' },
  { key: 'forearmCircumference', label: '前臂围', hint: '小臂最粗处一圈', group: 'limb' },
  { key: 'sleeveLength', label: '袖长', hint: '颈后中点到手腕', group: 'limb' },
  { key: 'wristCircumference', label: '手腕围', hint: '手腕最细处一圈', group: 'limb' },
  { key: 'palmCircumference', label: '掌围', hint: '手掌最宽处一圈', group: 'limb' },
  { key: 'thighCircumference', label: '大腿围', hint: '大腿根部最粗处一圈', group: 'limb' },
  { key: 'calfCircumference', label: '小腿围', hint: '小腿最粗处一圈', group: 'limb' },
  { key: 'ankleCircumference', label: '踝围', hint: '脚踝最细处一圈', group: 'limb' },
];

const GROUPS = [
  { key: 'basic' as const, title: '基础', fields: FIELD_DEFS.filter(f => f.group === 'basic') },
  { key: 'torso' as const, title: '躯干', fields: FIELD_DEFS.filter(f => f.group === 'torso') },
  { key: 'limb' as const, title: '四肢', fields: FIELD_DEFS.filter(f => f.group === 'limb') },
];

// ============================================================
//  NumberInput — 数字输入 + cm 单位
// ============================================================
const NumberInput = ({
  label, value, hint, onChange,
}: {
  label: string;
  value: string;
  hint: string;
  onChange: (v: string) => void;
}) => (
  <View style={styles.fieldRow}>
    <View style={styles.fieldLabel}>
      <Text style={styles.fieldLabelText}>{label}</Text>
      <Text style={styles.fieldHint}>{hint}</Text>
    </View>
    <View style={styles.inputWrap}>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChange}
        placeholder="--"
        placeholderTextColor={COLORS.textSecondary}
        keyboardType="decimal-pad"
      />
      <Text style={styles.unit}>cm</Text>
    </View>
  </View>
);

// ============================================================
//  BodyDataScreen
// ============================================================
const BodyDataScreen = () => {
  const insets = useSafeAreaInsets();
  const nav = useNavigation<any>();
  const { bodyData, setBodyData } = useStore();

  // 本地编辑状态，key 为字段名
  const [localData, setLocalData] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    FIELD_DEFS.forEach(f => {
      const v = (bodyData as any)[f.key];
      init[f.key] = v !== null && v !== undefined ? String(v) : '';
    });
    return init;
  });

  const handleChange = (key: string, val: string) => {
    // 只允许数字和小数点
    const cleaned = val.replace(/[^0-9.]/g, '');
    // 防止多个小数点
    const parts = cleaned.split('.');
    const final = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : cleaned;
    setLocalData(prev => ({ ...prev, [key]: final }));
  };

  const handleSave = () => {
    const updates: Record<string, number | null> = {};
    FIELD_DEFS.forEach(f => {
      const v = localData[f.key];
      updates[f.key] = v === '' ? null : parseFloat(v);
    });
    setBodyData(updates);
    Alert.alert('保存成功', '身材数据已保存', [{ text: '确定' }]);
  };

  const hasData = Object.values(localData).some(v => v !== '');

  return (
    <GradientBackground>
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* 提示文字 */}
            <GlassCard style={styles.tipCard}>
              <Icon name="information-circle" size={16} color={COLORS.primary} style={{ marginRight: 8 }} />
              <Text style={styles.tipText}>
                身材数据用于尺码推荐，测量时保持自然站姿，使用软尺水平绕测。
              </Text>
            </GlassCard>

            {/* 分组渲染 */}
            {GROUPS.map(group => (
              <View key={group.key}>
                <SectionHeader
                  title={group.title}
                />
                <GlassCard style={styles.groupCard} padding="none">
                  {group.fields.map((field, idx) => (
                    <View
                      key={field.key}
                      style={[
                        styles.fieldItem,
                        idx < group.fields.length - 1 && styles.fieldBorder,
                      ]}
                    >
                      <NumberInput
                        label={field.label}
                        value={localData[field.key]}
                        hint={field.hint}
                        onChange={val => handleChange(field.key, val)}
                      />
                    </View>
                  ))}
                </GlassCard>
              </View>
            ))}
          </ScrollView>

          {/* 底部保存按钮 */}
          <View style={[styles.footer, { paddingBottom: insets.bottom + SPACING.md }]}>
            <TouchableOpacity
              style={[styles.saveBtn, !hasData && styles.saveBtnDisabled]}
              onPress={handleSave}
              activeOpacity={0.8}
            >
              <Icon name="checkmark-circle" size={20} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.saveBtnText}>保存数据</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </GradientBackground>
  );
};

// ============================================================
//  Styles
// ============================================================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  content: { paddingTop: SPACING.lg },

  // 提示
  tipCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    backgroundColor: 'rgba(74,144,217,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(74,144,217,0.2)',
  },
  tipText: {
    flex: 1,
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },

  // 分组卡片
  groupCard: { marginHorizontal: SPACING.lg, marginBottom: SPACING.lg, overflow: 'hidden' },
  fieldItem: { paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md },
  fieldBorder: { borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.08)' },

  // 字段行
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fieldLabel: { flex: 1, paddingRight: SPACING.md },
  fieldLabelText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  fieldHint: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    minWidth: 110,
  },
  input: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
    fontWeight: '600',
    paddingVertical: SPACING.sm,
    textAlign: 'right',
  },
  unit: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginLeft: 4,
  },

  // 底部保存
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingTop: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.xl,
    paddingVertical: SPACING.md,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveBtnDisabled: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    shadowOpacity: 0,
    elevation: 0,
  },
  saveBtnText: {
    color: '#fff',
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
  },
});

export default BodyDataScreen;
