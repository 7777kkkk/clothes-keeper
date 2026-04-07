/**
 * AttributeManageScreen — 衣服属性管理
 * 支持6种字段类型，像 Notion 一样编辑属性模板
 */
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Modal, Alert, Switch,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons as Icon } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useStore } from '../store/useStore';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';
import { LiquidGlassCard, LiquidGlassPill } from '../components/glass/LiquidGlassCard';
import { GradientBackground } from '../components/glass/GradientBackground';
import { AttributeTemplate, AttributeFieldType } from '../types';

// 字段类型定义
const FIELD_TYPES: { value: AttributeFieldType; label: string; icon: string }[] = [
  { value: 'text',     label: '文本',   icon: 'text-outline' },
  { value: 'number',   label: '数字',   icon: 'calculator-outline' },
  { value: 'select',   label: '单选',   icon: 'list-outline' },
  { value: 'multi_select', label: '多选', icon: 'checkbox-outline' },
  { value: 'date',     label: '日期',   icon: 'calendar-outline' },
  { value: 'checkbox', label: '开关',   icon: 'toggle-outline' },
  { value: 'images',   label: '相册',   icon: 'images-outline' },
];

const TYPE_LABELS: Record<AttributeFieldType, string> = {
  text: '文本',
  number: '数字',
  select: '单选',
  multi_select: '多选',
  date: '日期',
  checkbox: '开关',
  images: '相册',
};

const AttributeManageScreen = () => {
  const insets = useSafeAreaInsets();
  const nav = useNavigation<any>();
  const { attributeTemplates = [], addAttributeTemplate, updateAttributeTemplate, deleteAttributeTemplate } = useStore();

  // 隐藏 React Navigation 默认 header
  useEffect(() => {
    nav.setOptions({ headerShown: false });
  }, []);

  const toggleVisible = (id: string) => {
    const tpl = attributeTemplates.find(t => t.id === id);
    if (!tpl) return;
    updateAttributeTemplate(id, { visible: !tpl.visible });
  };

  // 新建/编辑弹窗
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [fieldName, setFieldName] = useState('');
  const [fieldType, setFieldType] = useState<AttributeFieldType>('text');
  const [options, setOptions] = useState<{ id: string; label: string }[]>([]);
  const [newOptionText, setNewOptionText] = useState('');

  const openAdd = () => {
    setEditingId(null);
    setFieldName('');
    setFieldType('text');
    setOptions([]);
    setNewOptionText('');
    setModalVisible(true);
  };

  const openEdit = (tpl: AttributeTemplate) => {
    setEditingId(tpl.id);
    setFieldName(tpl.name);
    setFieldType(tpl.fieldType || 'text');
    setOptions(tpl.options || []);
    setNewOptionText('');
    setModalVisible(true);
  };

  const handleSave = () => {
    const name = fieldName.trim();
    if (!name) { Alert.alert('请输入属性名称'); return; }
    const template = {
      name,
      fieldType,
      options: fieldType === 'select' || fieldType === 'multi_select' ? options : [],
    };
    if (editingId) {
      updateAttributeTemplate(editingId, template);
    } else {
      addAttributeTemplate(template);
    }
    setModalVisible(false);
  };

  const handleDelete = (id: string) => {
    Alert.alert('删除属性', '该操作不可恢复？', [
      { text: '取消', style: 'cancel' },
      { text: '删除', style: 'destructive', onPress: () => deleteAttributeTemplate(id) },
    ]);
  };

  const addOption = () => {
    const label = newOptionText.trim();
    if (!label) return;
    setOptions(prev => [...prev, { id: Date.now().toString(), label }]);
    setNewOptionText('');
  };

  const removeOption = (id: string) => {
    setOptions(prev => prev.filter(o => o.id !== id));
  };

  const hasOptions = fieldType === 'select' || fieldType === 'multi_select';

  return (
    <GradientBackground>
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* 顶部导航 */}
        <View style={[styles.topNav, { paddingTop: insets.top + SPACING.sm }]}>
          <TouchableOpacity onPress={() => nav.goBack()} style={styles.backBtn}>
            <Icon name="chevron-back" size={22} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.navTitle}>属性管理</Text>
          <View style={{ width: 34 }} />
        </View>

        {/* 说明 */}
        <View style={styles.tipRow}>
          <Icon name="information-circle-outline" size={16} color={COLORS.textSecondary} />
          <Text style={styles.tipText}>
            管理衣服的字段类型，支持6种类型；单选/多选可编辑选项列表
          </Text>
        </View>

        {/* 属性列表 */}
        <ScrollView
          contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 100 }]}
          showsVerticalScrollIndicator={false}
        >
          {attributeTemplates.length === 0 && (
            <View style={styles.empty}>
              <Icon name="list-outline" size={48} color="rgba(0,0,0,0.15)" />
              <Text style={styles.emptyText}>暂无属性，点击右上角添加</Text>
            </View>
          )}

          {attributeTemplates.map(tpl => (
            <LiquidGlassCard key={tpl.id} style={styles.itemCard} intensity="light">
              <View style={styles.itemRow}>
                {!tpl.isSystem && (
                  <View style={styles.orderBadge}>
                    <Text style={styles.orderText}>{tpl.order + 1}</Text>
                  </View>
                )}
                <View style={styles.itemInfo}>
                  <View style={styles.nameRow}>
                    <Text style={styles.itemName}>{tpl.name}</Text>
                    {tpl.isSystem && (
                      <View style={styles.systemBadge}>
                        <Text style={styles.systemBadgeText}>固定</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.metaRow}>
                    <View style={styles.typeTag}>
                      <Text style={styles.typeTagText}>{TYPE_LABELS[tpl.fieldType]}</Text>
                    </View>
                    {(tpl.options || []).length > 0 && (
                      <Text style={styles.optionsCount}>{(tpl.options || []).length} 个选项</Text>
                    )}
                  </View>
                </View>

                {/* 自定义字段：显示开关 + 编辑 + 删除 */}
                {!tpl.isSystem ? (
                  <>
                    <View style={styles.switchWrap}>
                      <Switch
                        value={tpl.visible}
                        onValueChange={() => toggleVisible(tpl.id)}
                        trackColor={{ false: 'rgba(0,0,0,0.15)', true: '#A2BDEA88' }}
                        thumbColor={tpl.visible ? COLORS.primary : '#fff'}
                      />
                    </View>
                    <TouchableOpacity onPress={() => openEdit(tpl)} style={styles.actionBtn}>
                      <Icon name="pencil-outline" size={18} color={COLORS.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDelete(tpl.id)} style={styles.actionBtn}>
                      <Icon name="trash-bin-outline" size={18} color={COLORS.error} />
                    </TouchableOpacity>
                  </>
                ) : (
                  <View style={styles.alwaysOn}>
                    <Text style={styles.alwaysOnText}>始终显示</Text>
                  </View>
                )}
              </View>

              {/* 选项预览（如果是 select/multi_select） */}
              {(tpl.options || []).length > 0 && (
                <View style={styles.optionsPreview}>
                  {tpl.options.slice(0, 5).map(opt => (
                    <View key={opt.id} style={styles.optionChip}>
                      <Text style={styles.optionChipText}>{opt.label}</Text>
                    </View>
                  ))}
                  {(tpl.options || []).length > 5 && (
                    <Text style={styles.moreOptions}>+{(tpl.options || []).length - 5}</Text>
                  )}
                </View>
              )}
            </LiquidGlassCard>
          ))}
        </ScrollView>

        {/* FAB */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={openAdd}
          style={[styles.fab, { bottom: insets.bottom + 84 }]}
        >
          <Icon name="add" size={24} color="#fff" />
        </TouchableOpacity>

        {/* 添加/编辑弹窗 */}
        <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              {/* 顶部栏 */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{editingId ? '编辑属性' : '新建属性'}</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Icon name="close" size={20} color={COLORS.textSecondary} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                {/* 属性名称 */}
                <Text style={styles.fieldLabel}>属性名称</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="如：颜色、尺码、面料"
                  placeholderTextColor={COLORS.textSecondary}
                  value={fieldName}
                  onChangeText={setFieldName}
                />

                {/* 字段类型 */}
                <Text style={styles.fieldLabel}>字段类型</Text>
                <View style={styles.typeGrid}>
                  {FIELD_TYPES.map(ft => (
                    <TouchableOpacity
                      key={ft.value}
                      style={[styles.typeBtn, fieldType === ft.value && styles.typeBtnActive]}
                      onPress={() => {
                        setFieldType(ft.value);
                        if (ft.value !== 'select' && ft.value !== 'multi_select') {
                          setOptions([]);
                        }
                      }}
                    >
                      <Icon
                        name={ft.icon as any}
                        size={18}
                        color={fieldType === ft.value ? COLORS.primary : COLORS.textSecondary}
                      />
                      <Text style={[styles.typeBtnText, fieldType === ft.value && styles.typeBtnTextActive]}>
                        {ft.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* 选项编辑（仅 select / multi_select） */}
                {hasOptions && (
                  <>
                    <Text style={styles.fieldLabel}>选项列表</Text>
                    <View style={styles.optionsList}>
                      {options.map(opt => (
                        <View key={opt.id} style={styles.optionItem}>
                          <Text style={styles.optionItemText}>{opt.label}</Text>
                          <TouchableOpacity onPress={() => removeOption(opt.id)}>
                            <Icon name="close-circle" size={16} color={COLORS.textSecondary} />
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>
                    <View style={styles.addOptionRow}>
                      <TextInput
                        style={styles.optionInput}
                        placeholder="输入选项名称"
                        placeholderTextColor={COLORS.textSecondary}
                        value={newOptionText}
                        onChangeText={setNewOptionText}
                        onSubmitEditing={addOption}
                      />
                      <TouchableOpacity style={styles.addOptionBtn} onPress={addOption}>
                        <Icon name="add-circle" size={22} color={COLORS.primary} />
                      </TouchableOpacity>
                    </View>
                  </>
                )}
              </ScrollView>

              {/* 底部按钮 */}
              <View style={styles.modalFooter}>
                <TouchableOpacity style={styles.modalCancel} onPress={() => setModalVisible(false)}>
                  <Text style={styles.modalCancelText}>取消</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalSave} onPress={handleSave}>
                  <Text style={styles.modalSaveText}>保存</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  topNav: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm,
    backgroundColor: 'rgba(255,255,255,0.60)',
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.4)',
    gap: SPACING.md,
  },
  backBtn: { width: 34, height: 34, borderRadius: BORDER_RADIUS.md, justifyContent: 'center', alignItems: 'center' },
  navTitle: { flex: 1, textAlign: 'center', fontSize: FONT_SIZES.lg, fontWeight: '800', color: COLORS.textPrimary },

  tipRow: {
    flexDirection: 'row', alignItems: 'flex-start',
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, gap: SPACING.xs,
  },
  tipText: { flex: 1, fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, lineHeight: 18 },

  list: { padding: SPACING.lg, gap: SPACING.sm },
  itemCard: { padding: SPACING.md },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  orderBadge: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.08)',
    justifyContent: 'center', alignItems: 'center',
  },
  orderText: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: 'rgba(0,0,0,0.4)' },
  itemInfo: { flex: 1 },
  itemName: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.textPrimary },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, marginTop: 3 },
  typeTag: {
    backgroundColor: 'rgba(0,0,0,0.06)', borderRadius: 4,
    paddingHorizontal: 6, paddingVertical: 1,
  },
  typeTagText: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary, fontWeight: '500' },
  optionsCount: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary },
  optionsPreview: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: SPACING.sm, paddingTop: SPACING.sm, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.06)' },
  optionChip: {
    backgroundColor: 'rgba(0,0,0,0.07)', borderRadius: 4,
    paddingHorizontal: 6, paddingVertical: 2,
  },
  optionChipText: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary },
  moreOptions: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary, fontWeight: '600' },
  switchWrap: { marginHorizontal: 4 },
  actionBtn: { width: 32, height: 32, borderRadius: BORDER_RADIUS.sm, justifyContent: 'center', alignItems: 'center' },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  systemBadge: {
    backgroundColor: 'rgba(0,0,0,0.06)', borderRadius: 4,
    paddingHorizontal: 6, paddingVertical: 1,
  },
  systemBadgeText: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary, fontWeight: '500' },
  alwaysOn: {
    backgroundColor: 'rgba(162,189,234,0.2)', borderRadius: 6,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  alwaysOnText: { fontSize: FONT_SIZES.xs, color: COLORS.primary, fontWeight: '600' },

  empty: { alignItems: 'center', paddingTop: 80, gap: SPACING.sm },
  emptyText: { fontSize: FONT_SIZES.sm, color: 'rgba(0,0,0,0.25)', marginTop: SPACING.sm },

  fab: {
    position: 'absolute', right: 20,
    width: 50, height: 50, borderRadius: 25,
    backgroundColor: COLORS.fab,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: 'rgba(0,0,0,0.18)', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1, shadowRadius: 10, elevation: 6,
  },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalCard: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: SPACING.xl, paddingTop: SPACING.xl, paddingBottom: SPACING.md,
    borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.08)',
  },
  modalTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.textPrimary },
  modalBody: { paddingHorizontal: SPACING.xl, paddingVertical: SPACING.lg },
  modalFooter: {
    flexDirection: 'row', gap: SPACING.md, paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.08)',
  },

  fieldLabel: {
    fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.textPrimary,
    marginBottom: SPACING.sm, marginTop: SPACING.md,
  },
  modalInput: {
    fontSize: FONT_SIZES.md, color: COLORS.textPrimary,
    borderBottomWidth: 1.5, borderBottomColor: 'rgba(0,0,0,0.2)',
    paddingVertical: SPACING.sm,
  },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  typeBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: 'rgba(0,0,0,0.06)',
    borderWidth: 1, borderColor: 'transparent',
  },
  typeBtnActive: {
    backgroundColor: 'rgba(162,189,234,0.15)',
    borderColor: COLORS.primary,
  },
  typeBtnText: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.textSecondary },
  typeBtnTextActive: { color: COLORS.primary },

  optionsList: { gap: 4, marginBottom: SPACING.sm },
  optionItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
    backgroundColor: 'rgba(0,0,0,0.04)', borderRadius: BORDER_RADIUS.sm,
  },
  optionItemText: { fontSize: FONT_SIZES.sm, color: COLORS.textPrimary },
  addOptionRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  optionInput: {
    flex: 1, fontSize: FONT_SIZES.sm, color: COLORS.textPrimary,
    borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.15)',
    paddingVertical: SPACING.xs,
  },
  addOptionBtn: { padding: 4 },

  modalCancel: {
    flex: 1, paddingVertical: SPACING.sm + 2, borderRadius: BORDER_RADIUS.md,
    backgroundColor: 'rgba(0,0,0,0.08)', alignItems: 'center',
  },
  modalCancelText: { fontSize: FONT_SIZES.md, fontWeight: '600', color: COLORS.textSecondary },
  modalSave: {
    flex: 1, paddingVertical: SPACING.sm + 2, borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.primary, alignItems: 'center',
  },
  modalSaveText: { fontSize: FONT_SIZES.md, fontWeight: '700', color: '#fff' },
});

export default AttributeManageScreen;
