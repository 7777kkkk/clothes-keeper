import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Image, Alert, Modal,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons as Icon } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useStore } from '../store/useStore';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { GradientBackground } from '../components/glass/GradientBackground';
import { Season, LocationType, AttributeTemplate, CustomAttribute } from '../types';

const SEASONS: Season[] = ['春', '夏', '秋', '冬'];
const LOCATION_TYPES: LocationType[] = ['家', '学校'];

const AddClothingScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { addClothingItem, categories, attributeTemplates = [] } = useStore();

  // 筛选出 visible=true 且非系统内置的字段，按 order 排序
  const visibleCustomFields = useMemo(() => {
    return attributeTemplates
      .filter(t => t.visible && !t.isSystem)
      .sort((a, b) => a.order - b.order);
  }, [attributeTemplates]);

  const [images, setImages] = useState<string[]>([]);
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [selectedSeasons, setSelectedSeasons] = useState<Season[]>([]);
  const [locationType, setLocationType] = useState<LocationType>('家');
  const [locationDetail, setLocationDetail] = useState('');
  const [brand, setBrand] = useState('');
  const [price, setPrice] = useState('');
  const [purchaseDate, setPurchaseDate] = useState<Date | null>(null);
  const [purchaseDateMode, setPurchaseDateMode] = useState<'full' | 'year'>('full');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [yearPickerValue, setYearPickerValue] = useState(new Date().getFullYear());
  const [notes, setNotes] = useState('');
  const [showYearModal, setShowYearModal] = useState(false);

  // 动态自定义字段值，key = templateId
  const [customValues, setCustomValues] = useState<Record<string, string>>({});
  // 多选字段值，key = templateId, value = string[]
  const [customMultiValues, setCustomMultiValues] = useState<Record<string, string[]>>({});
  // 开关字段值，key = templateId
  const [customCheckboxValues, setCustomCheckboxValues] = useState<Record<string, boolean>>({});

  const pickImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });
    if (!result.canceled) {
      setImages(result.assets.map(a => a.uri));
    }
  };

  const removeImage = (idx: number) => {
    setImages(prev => prev.filter((_, i) => i !== idx));
  };

  const toggleSeason = (s: Season) => {
    setSelectedSeasons(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  };

  const formatPurchaseDate = () => {
    if (!purchaseDate) return '点击选择';
    if (purchaseDateMode === 'year') return `${purchaseDate.getFullYear()}年`;
    return purchaseDate.toLocaleDateString('zh-CN');
  };

  const handleDateChange = (_: any, date?: Date) => {
    setShowDatePicker(false);
    if (date) {
      setPurchaseDate(date);
      setPurchaseDateMode('full');
    }
  };

  const handleYearConfirm = () => {
    const d = new Date(yearPickerValue, 0, 1);
    setPurchaseDate(d);
    setPurchaseDateMode('year');
    setShowYearModal(false);
  };

  const setCustomValue = (templateId: string, value: string) => {
    setCustomValues(prev => ({ ...prev, [templateId]: value }));
  };

  const toggleCustomMultiValue = (templateId: string, optionLabel: string) => {
    setCustomMultiValues(prev => {
      const current = prev[templateId] || [];
      const updated = current.includes(optionLabel)
        ? current.filter(v => v !== optionLabel)
        : [...current, optionLabel];
      return { ...prev, [templateId]: updated };
    });
  };

  const setCustomCheckboxValue = (templateId: string, value: boolean) => {
    setCustomCheckboxValues(prev => ({ ...prev, [templateId]: value }));
  };

  // 动态渲染单个自定义字段
  const renderCustomField = (tpl: AttributeTemplate) => {
    const { fieldType, id: tplId, name: tplName, options = [] } = tpl;

    if (fieldType === 'select') {
      return (
        <View key={tplId} style={styles.section}>
          <Text style={styles.sectionTitle}>{tplName}</Text>
          <View style={styles.pillsRow}>
            {options.map(opt => (
              <TouchableOpacity
                key={opt.id}
                style={[styles.pill, customValues[tplId] === opt.label && styles.pillActive]}
                onPress={() => setCustomValue(tplId, opt.label)}
              >
                <Text style={[styles.pillText, customValues[tplId] === opt.label && styles.pillTextActive]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      );
    }

    if (fieldType === 'multi_select') {
      const selected = customMultiValues[tplId] || [];
      return (
        <View key={tplId} style={styles.section}>
          <Text style={styles.sectionTitle}>{tplName}</Text>
          <View style={styles.pillsRow}>
            {options.map(opt => (
              <TouchableOpacity
                key={opt.id}
                style={[styles.pill, selected.includes(opt.label) && styles.pillActive]}
                onPress={() => toggleCustomMultiValue(tplId, opt.label)}
              >
                <Text style={[styles.pillText, selected.includes(opt.label) && styles.pillTextActive]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      );
    }

    if (fieldType === 'checkbox') {
      const checked = customCheckboxValues[tplId] ?? false;
      return (
        <View key={tplId} style={styles.section}>
          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() => setCustomCheckboxValue(tplId, !checked)}
          >
            <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
              {checked && <Icon name="checkmark" size={12} color="#fff" />}
            </View>
            <Text style={styles.checkboxLabel}>{tplName}</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (fieldType === 'number') {
      return (
        <View key={tplId} style={styles.section}>
          <Text style={styles.sectionTitle}>{tplName}</Text>
          <TextInput
            style={styles.input}
            placeholder={tplName}
            placeholderTextColor={COLORS.textSecondary}
            keyboardType="numeric"
            value={customValues[tplId] || ''}
            onChangeText={v => setCustomValue(tplId, v)}
          />
        </View>
      );
    }

    if (fieldType === 'date') {
      return (
        <View key={tplId} style={styles.section}>
          <Text style={styles.sectionTitle}>{tplName}</Text>
          <TouchableOpacity
            style={styles.dateDisplay}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateDisplayText}>{customValues[tplId] || '点击选择'}</Text>
          </TouchableOpacity>
        </View>
      );
    }

    // 默认 text
    return (
      <View key={tplId} style={styles.section}>
        <Text style={styles.sectionTitle}>{tplName}</Text>
        <TextInput
          style={styles.input}
          placeholder={tplName}
          placeholderTextColor={COLORS.textSecondary}
          value={customValues[tplId] || ''}
          onChangeText={v => setCustomValue(tplId, v)}
        />
      </View>
    );
  };

  const handleSave = () => {
    if (!name.trim()) { Alert.alert('请输入名称'); return; }
    if (!categoryId) { Alert.alert('请选择分类'); return; }
    if (images.length === 0) { Alert.alert('请添加至少一张图片'); return; }

    // 构建 customAttributes：只包含有值的自定义字段
    const customAttributes: CustomAttribute[] = [];

    visibleCustomFields.forEach(tpl => {
      const { fieldType, id: tplId, name: tplName } = tpl;

      if (fieldType === 'multi_select') {
        const values = customMultiValues[tplId];
        if (values && values.length > 0) {
          customAttributes.push({
            id: Math.random().toString(36).substring(2, 9),
            name: tplName,
            value: values.join('、'),
            type: 'text',
            templateId: tplId,
          });
        }
      } else if (fieldType === 'checkbox') {
        const checked = customCheckboxValues[tplId] ?? false;
        customAttributes.push({
          id: Math.random().toString(36).substring(2, 9),
          name: tplName,
          value: checked ? '是' : '否',
          type: 'text',
          templateId: tplId,
        });
      } else {
        const val = customValues[tplId];
        if (val && val.trim()) {
          customAttributes.push({
            id: Math.random().toString(36).substring(2, 9),
            name: tplName,
            value: val.trim(),
            type: 'text',
            templateId: tplId,
          });
        }
      }
    });

    addClothingItem({
      name: name.trim(),
      images,
      categoryId,
      seasons: selectedSeasons,
      locationType,
      locationDetail: locationDetail.trim(),
      brand: brand.trim(),
      price: parseFloat(price) || 0,
      purchaseDate,
      purchaseDateMode,
      notes: notes.trim(),
      wearCount: 0,
      customAttributes,
    });

    Alert.alert('添加成功', '衣物已添加到衣橱', [
      { text: '确定', onPress: () => navigation.goBack() },
    ]);
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 30 }, (_, k) => currentYear - k);

  const selectedCategory = categories.find(c => c.id === categoryId);

  return (
    <GradientBackground>
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* 顶部导航 */}
        <View style={[styles.topNav, { paddingTop: insets.top + SPACING.sm }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Icon name="chevron-back" size={22} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.navTitle}>添加衣物</Text>
          <View style={{ width: 34 }} />
        </View>

        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
          showsVerticalScrollIndicator={false}
        >
          {/* 照片 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>照片</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.imagesRow}>
              {images.map((uri, idx) => (
                <View key={idx} style={styles.imageWrap}>
                  <Image source={{ uri }} style={styles.imagePreview} />
                  <TouchableOpacity style={styles.removeImgBtn} onPress={() => removeImage(idx)}>
                    <Icon name="close-circle" size={20} color={COLORS.error} />
                  </TouchableOpacity>
                </View>
              ))}
              <TouchableOpacity style={styles.addImageBtn} onPress={pickImages}>
                <Icon name="add" size={28} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </ScrollView>
          </View>

          {/* 名称 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>名称 *</Text>
            <TextInput
              style={styles.input}
              placeholder="例如：黑色休闲西装外套"
              placeholderTextColor={COLORS.textSecondary}
              value={name}
              onChangeText={setName}
            />
          </View>

          {/* 分类 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>分类 *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillsRow}>
              {categories.map(cat => (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.pill, categoryId === cat.id && styles.pillActive]}
                  onPress={() => setCategoryId(cat.id)}
                >
                  <Text style={[styles.pillText, categoryId === cat.id && styles.pillTextActive]}>
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* 季节 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>季节</Text>
            <View style={styles.pillsRow}>
              {SEASONS.map(s => (
                <TouchableOpacity
                  key={s}
                  style={[styles.pill, selectedSeasons.includes(s) && styles.pillActive]}
                  onPress={() => toggleSeason(s)}
                >
                  <Text style={[styles.pillText, selectedSeasons.includes(s) && styles.pillTextActive]}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* 存放位置 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>存放位置</Text>
            <View style={styles.pillsRow}>
              {LOCATION_TYPES.map(lt => (
                <TouchableOpacity
                  key={lt}
                  style={[styles.pill, locationType === lt && styles.pillActive]}
                  onPress={() => setLocationType(lt)}
                >
                  <Text style={[styles.pillText, locationType === lt && styles.pillTextActive]}>{lt}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* 具体位置 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>具体位置</Text>
            <TextInput
              style={styles.input}
              placeholder="如：卧室衣柜第二层"
              placeholderTextColor={COLORS.textSecondary}
              value={locationDetail}
              onChangeText={setLocationDetail}
            />
          </View>

          {/* 品牌 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>品牌</Text>
            <TextInput
              style={styles.input}
              placeholder="例如：UNIQLO、Nike"
              placeholderTextColor={COLORS.textSecondary}
              value={brand}
              onChangeText={setBrand}
            />
          </View>

          {/* 价格 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>价格</Text>
            <TextInput
              style={styles.input}
              placeholder="例如：299"
              placeholderTextColor={COLORS.textSecondary}
              keyboardType="numeric"
              value={price}
              onChangeText={setPrice}
            />
          </View>

          {/* 购买日期 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>购买日期</Text>
            <View style={styles.dateRow}>
              <TouchableOpacity style={styles.dateDisplay} onPress={() => setShowDatePicker(true)}>
                <Text style={styles.dateDisplayText}>{formatPurchaseDate()}</Text>
                <Text style={styles.dateHint}>点击选择</Text>
              </TouchableOpacity>
              {purchaseDate && (
                <TouchableOpacity style={styles.clearDateBtn} onPress={() => setPurchaseDate(null)}>
                  <Text style={styles.clearDateBtnText}>清除日期</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.dateModeBtn, purchaseDateMode === 'year' && styles.dateModeBtnActive]}
                onPress={() => setShowYearModal(true)}
              >
                <Text style={styles.dateModeBtnText}>
                  {purchaseDateMode === 'year' ? '按年' : '按年月'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 动态自定义属性字段（来自 attributeTemplates） */}
          {visibleCustomFields.map(renderCustomField)}

          {/* 备注 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>备注</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="可选"
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
              placeholderTextColor={COLORS.textSecondary}
            />
          </View>

          {/* 保存按钮 */}
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>保存到衣橱</Text>
          </TouchableOpacity>

          {/* 日期选择器 */}
          {showDatePicker && (
            <DateTimePicker
              value={purchaseDate || new Date()}
              mode="date"
              display="default"
              onChange={handleDateChange}
            />
          )}

          {/* 年份选择弹窗 */}
          <Modal visible={showYearModal} transparent animationType="fade">
            <View style={styles.modalOverlay}>
              <View style={styles.yearPickerModal}>
                <Text style={styles.yearPickerTitle}>选择年份</Text>
                <ScrollView style={styles.yearScrollView}>
                  {years.map(year => (
                    <TouchableOpacity
                      key={year}
                      style={[styles.yearItem, yearPickerValue === year && styles.yearItemSelected]}
                      onPress={() => setYearPickerValue(year)}
                    >
                      <Text style={[styles.yearItemText, yearPickerValue === year && styles.yearItemTextSelected]}>
                        {year}年
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <View style={styles.modalBtns}>
                  <TouchableOpacity style={styles.modalCancel} onPress={() => setShowYearModal(false)}>
                    <Text style={styles.modalCancelText}>取消</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.modalSave} onPress={handleYearConfirm}>
                    <Text style={styles.modalSaveText}>确定</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  topNav: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: SPACING.lg, paddingBottom: SPACING.sm,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.08)',
    gap: SPACING.md,
  },
  backBtn: { width: 34, height: 34, borderRadius: BORDER_RADIUS.md, justifyContent: 'center', alignItems: 'center' },
  navTitle: { flex: 1, textAlign: 'center', fontSize: FONT_SIZES.lg, fontWeight: '800', color: COLORS.textPrimary },

  scrollContent: { padding: SPACING.lg, gap: SPACING.xs },

  section: { marginBottom: SPACING.lg },
  sectionTitle: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.textSecondary, marginBottom: SPACING.sm, textTransform: 'uppercase', letterSpacing: 0.5 },

  imagesRow: { gap: SPACING.sm, paddingVertical: 2 },
  imageWrap: { position: 'relative' },
  imagePreview: { width: 80, height: 80, borderRadius: BORDER_RADIUS.md },
  removeImgBtn: { position: 'absolute', top: -8, right: -8 },
  addImageBtn: {
    width: 80, height: 80, borderRadius: BORDER_RADIUS.md,
    borderWidth: 2, borderColor: 'rgba(0,0,0,0.12)', borderStyle: 'dashed',
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.6)',
  },

  pillsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  pill: {
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: 'rgba(0,0,0,0.07)',
    borderWidth: 1, borderColor: 'transparent',
  },
  pillActive: { backgroundColor: 'rgba(162,189,234,0.2)', borderColor: COLORS.primary },
  pillText: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.textSecondary },
  pillTextActive: { color: COLORS.primary },

  input: {
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
    borderWidth: 1, borderColor: 'rgba(0,0,0,0.08)',
  },
  textArea: { minHeight: 80, textAlignVertical: 'top', paddingTop: SPACING.md },

  dateRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, flexWrap: 'wrap' },
  dateDisplay: {
    flex: 1, minWidth: 120,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
    borderWidth: 1, borderColor: 'rgba(0,0,0,0.08)',
  },
  dateDisplayText: { fontSize: FONT_SIZES.md, color: COLORS.textPrimary, fontWeight: '600' },
  dateHint: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary, marginTop: 2 },
  clearDateBtn: { paddingHorizontal: SPACING.sm, paddingVertical: SPACING.xs },
  clearDateBtnText: { fontSize: FONT_SIZES.sm, color: COLORS.error, fontWeight: '500' },
  dateModeBtn: {
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: 'rgba(0,0,0,0.06)',
  },
  dateModeBtnActive: { backgroundColor: COLORS.primary },
  dateModeBtnText: { fontSize: FONT_SIZES.xs, fontWeight: '600', color: COLORS.textSecondary },

  // Checkbox field
  checkboxRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  checkbox: {
    width: 20, height: 20, borderRadius: 4,
    borderWidth: 1.5, borderColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  checkboxLabel: { fontSize: FONT_SIZES.md, color: COLORS.textPrimary, fontWeight: '500' },

  saveButton: {
    marginTop: SPACING.md,
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md + 2,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    ...SHADOWS.card,
  },
  saveButtonText: { color: '#fff', fontSize: FONT_SIZES.md, fontWeight: '700' },

  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center', alignItems: 'center',
  },
  yearPickerModal: {
    width: 280, maxHeight: 400,
    backgroundColor: '#fff',
    borderRadius: BORDER_RADIUS.md, padding: SPACING.lg,
  },
  yearPickerTitle: {
    fontSize: FONT_SIZES.lg, fontWeight: 'bold',
    color: COLORS.textPrimary, textAlign: 'center', marginBottom: SPACING.md,
  },
  yearScrollView: { maxHeight: 280 },
  yearItem: { paddingVertical: SPACING.md, paddingHorizontal: SPACING.lg, borderRadius: BORDER_RADIUS.sm },
  yearItemSelected: { backgroundColor: COLORS.primary },
  yearItemText: { fontSize: FONT_SIZES.lg, color: COLORS.textPrimary, textAlign: 'center' },
  yearItemTextSelected: { color: '#fff', fontWeight: 'bold' },
  modalBtns: { flexDirection: 'row', gap: SPACING.md, marginTop: SPACING.lg },
  modalCancel: {
    flex: 1, paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm, backgroundColor: 'rgba(0,0,0,0.08)', alignItems: 'center',
  },
  modalCancelText: { fontSize: FONT_SIZES.md, fontWeight: '600', color: COLORS.textSecondary },
  modalSave: {
    flex: 1, paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm, backgroundColor: COLORS.primary, alignItems: 'center',
  },
  modalSaveText: { fontSize: FONT_SIZES.md, fontWeight: '700', color: '#fff' },
});

export default AddClothingScreen;
