import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  Modal,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useStore } from '../store/useStore';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { Season, LocationType, CustomAttribute } from '../types';

const SEASONS: Season[] = ['春', '夏', '秋', '冬'];
const LOCATION_TYPES: LocationType[] = ['家', '学校'];

const AddClothingScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { addClothingItem, categories } = useStore();

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
  const [customAttributes, setCustomAttributes] = useState<CustomAttribute[]>([]);
  const [showAttrModal, setShowAttrModal] = useState(false);
  const [showYearModal, setShowYearModal] = useState(false);
  const [attrName, setAttrName] = useState('');
  const [attrValue, setAttrValue] = useState('');
  const [editingAttrIndex, setEditingAttrIndex] = useState<number | null>(null);

  const pickImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: 9,
    });

    if (!result.canceled && result.assets) {
      const uris = result.assets.map(a => a.uri);
      setImages(prev => [...prev, ...uris].slice(0, 9));
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('权限不足', '需要相机权限才能拍照');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
    });

    if (!result.canceled && result.assets) {
      setImages(prev => [...prev, result.assets![0].uri].slice(0, 9));
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const toggleSeason = (season: Season) => {
    setSelectedSeasons(prev =>
      prev.includes(season)
        ? prev.filter(s => s !== season)
        : [...prev, season]
    );
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setPurchaseDate(selectedDate);
    }
  };

  const handleYearConfirm = () => {
    const date = new Date(yearPickerValue, 0, 1);
    setPurchaseDate(date);
    setShowYearModal(false);
  };

  const addCustomAttribute = () => {
    if (!attrName.trim() || !attrValue.trim()) {
      Alert.alert('请填写属性名和属性值');
      return;
    }
    if (editingAttrIndex !== null) {
      setCustomAttributes(prev => prev.map((attr, i) =>
        i === editingAttrIndex ? { ...attr, name: attrName.trim(), value: attrValue.trim() } : attr
      ));
    } else {
      const newAttr: CustomAttribute = {
        id: Math.random().toString(36).substring(2, 9),
        name: attrName.trim(),
        value: attrValue.trim(),
        type: 'text',
      };
      setCustomAttributes(prev => [...prev, newAttr]);
    }
    setAttrName('');
    setAttrValue('');
    setEditingAttrIndex(null);
    setShowAttrModal(false);
  };

  const editCustomAttribute = (index: number) => {
    const attr = customAttributes[index];
    setAttrName(attr.name);
    setAttrValue(attr.value);
    setEditingAttrIndex(index);
    setShowAttrModal(true);
  };

  const deleteCustomAttribute = (index: number) => {
    setCustomAttributes(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('请输入名称');
      return;
    }
    if (!categoryId) {
      Alert.alert('请选择品类');
      return;
    }
    if (images.length === 0) {
      Alert.alert('请添加至少一张图片');
      return;
    }

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
      { text: '确定', onPress: () => navigation.goBack() }
    ]);
  };

  const formatPurchaseDate = () => {
    if (!purchaseDate) return '未设置';
    if (purchaseDateMode === 'year') {
      return `${purchaseDate.getFullYear()}年`;
    }
    return `${purchaseDate.getFullYear()}-${String(purchaseDate.getMonth() + 1).padStart(2, '0')}-${String(purchaseDate.getDate()).padStart(2, '0')}`;
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i + 10);

  return (
    <ScrollView style={[styles.container, { paddingBottom: insets.bottom + 80 }]}>
      <View style={{ height: insets.top > 0 ? 0 : SPACING.md }} />
      {/* 图片选择 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>图片（{images.length}/9）</Text>
        <View style={styles.imageGrid}>
          {images.map((uri, index) => (
            <View key={index} style={styles.imageThumbContainer}>
              <Image source={{ uri }} style={styles.imageThumb} />
              <TouchableOpacity
                style={styles.removeImageBtn}
                onPress={() => removeImage(index)}
              >
                <Text style={styles.removeImageText}>×</Text>
              </TouchableOpacity>
              {index === 0 && (
                <View style={styles.defaultBadge}>
                  <Text style={styles.defaultBadgeText}>首图</Text>
                </View>
              )}
            </View>
          ))}
          {images.length < 9 && (
            <View style={styles.imageAddButtons}>
              <TouchableOpacity style={styles.imageAddBtn} onPress={pickImages}>
                <Text style={styles.imageAddText}>📷 相册</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.imageAddBtn} onPress={takePhoto}>
                <Text style={styles.imageAddText}>📸 拍照</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
        <Text style={styles.hint}>点击 × 删除图片，第一张为主图</Text>
      </View>

      {/* 名称 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>名称 *</Text>
        <TextInput
          style={styles.input}
          placeholder="如：黑色蝴蝶结西装"
          value={name}
          onChangeText={setName}
          placeholderTextColor={COLORS.textSecondary}
        />
      </View>

      {/* 品类 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>品类 *</Text>
        <View style={styles.chipGroup}>
          {categories.map(cat => (
            <TouchableOpacity
              key={cat.id}
              style={[styles.chip, categoryId === cat.id && styles.chipActive]}
              onPress={() => setCategoryId(cat.id)}
            >
              <Text style={[styles.chipText, categoryId === cat.id && styles.chipTextActive]}>
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* 季节 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>季节（可多选）</Text>
        <View style={styles.chipGroup}>
          {SEASONS.map(season => (
            <TouchableOpacity
              key={season}
              style={[styles.chip, selectedSeasons.includes(season) && styles.chipActive]}
              onPress={() => toggleSeason(season)}
            >
              <Text style={[styles.chipText, selectedSeasons.includes(season) && styles.chipTextActive]}>
                {season}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* 存放位置 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📍 存放位置</Text>
        <View style={styles.chipGroup}>
          {LOCATION_TYPES.map(loc => (
            <TouchableOpacity
              key={loc}
              style={[styles.chip, locationType === loc && styles.chipActive]}
              onPress={() => setLocationType(loc)}
            >
              <Text style={[styles.chipText, locationType === loc && styles.chipTextActive]}>
                {loc}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <TextInput
          style={[styles.input, styles.locationDetailInput]}
          placeholder="具体位置备注（选填），如：卧室衣柜第二层"
          value={locationDetail}
          onChangeText={setLocationDetail}
          placeholderTextColor={COLORS.textSecondary}
        />
      </View>

      {/* 品牌 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>品牌</Text>
        <TextInput
          style={styles.input}
          placeholder="可选"
          value={brand}
          onChangeText={setBrand}
          placeholderTextColor={COLORS.textSecondary}
        />
      </View>

      {/* 价格 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>价格</Text>
        <TextInput
          style={styles.input}
          placeholder="可选"
          value={price}
          onChangeText={setPrice}
          keyboardType="decimal-pad"
          placeholderTextColor={COLORS.textSecondary}
        />
      </View>

      {/* 购买日期 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🗓️ 购买日期</Text>
        <View style={styles.dateModeRow}>
          <TouchableOpacity
            style={[styles.dateModeBtn, purchaseDateMode === 'full' && styles.dateModeBtnActive]}
            onPress={() => setPurchaseDateMode('full')}
          >
            <Text style={[styles.dateModeBtnText, purchaseDateMode === 'full' && styles.dateModeBtnTextActive]}>
              完整日期
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.dateModeBtn, purchaseDateMode === 'year' && styles.dateModeBtnActive]}
            onPress={() => setPurchaseDateMode('year')}
          >
            <Text style={[styles.dateModeBtnText, purchaseDateMode === 'year' && styles.dateModeBtnTextActive]}>
              仅年份
            </Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={styles.dateDisplay}
          onPress={() => {
            if (purchaseDateMode === 'full') {
              setShowDatePicker(true);
            } else {
              setYearPickerValue(purchaseDate?.getFullYear() || currentYear);
              setShowYearModal(true);
            }
          }}
        >
          <Text style={styles.dateDisplayText}>{formatPurchaseDate()}</Text>
          <Text style={styles.dateHint}>点击选择</Text>
        </TouchableOpacity>
        {purchaseDate && (
          <TouchableOpacity
            style={styles.clearDateBtn}
            onPress={() => setPurchaseDate(null)}
          >
            <Text style={styles.clearDateBtnText}>清除日期</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* 自定义属性 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>✨ 自定义属性</Text>
        {customAttributes.length > 0 && (
          <View style={styles.attrList}>
            {customAttributes.map((attr, index) => (
              <View key={attr.id} style={styles.attrItem}>
                <View style={styles.attrContent}>
                  <Text style={styles.attrName}>{attr.name}</Text>
                  <Text style={styles.attrValue}>{attr.value}</Text>
                </View>
                <View style={styles.attrActions}>
                  <TouchableOpacity
                    style={styles.attrEditBtn}
                    onPress={() => editCustomAttribute(index)}
                  >
                    <Text style={styles.attrEditText}>编辑</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.attrDeleteBtn}
                    onPress={() => deleteCustomAttribute(index)}
                  >
                    <Text style={styles.attrDeleteText}>删除</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
        <TouchableOpacity
          style={styles.addAttrBtn}
          onPress={() => {
            setAttrName('');
            setAttrValue('');
            setEditingAttrIndex(null);
            setShowAttrModal(true);
          }}
        >
          <Text style={styles.addAttrBtnText}>+ 添加自定义属性</Text>
        </TouchableOpacity>
        <Text style={styles.attrHint}>例如：颜色（蓝色）、材质（棉）、尺码（M）</Text>
      </View>

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
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalCancelBtn]}
                onPress={() => setShowYearModal(false)}
              >
                <Text style={styles.modalCancelText}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalConfirmBtn]}
                onPress={handleYearConfirm}
              >
                <Text style={styles.modalConfirmText}>确定</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 自定义属性编辑弹窗 */}
      <Modal visible={showAttrModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.attrModal}>
            <Text style={styles.attrModalTitle}>
              {editingAttrIndex !== null ? '编辑属性' : '添加属性'}
            </Text>
            <TextInput
              style={styles.attrInput}
              placeholder="属性名，如：颜色"
              value={attrName}
              onChangeText={setAttrName}
              placeholderTextColor={COLORS.textSecondary}
            />
            <TextInput
              style={styles.attrInput}
              placeholder="属性值，如：蓝色"
              value={attrValue}
              onChangeText={setAttrValue}
              placeholderTextColor={COLORS.textSecondary}
            />
            <View style={styles.modalBtns}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalCancelBtn]}
                onPress={() => setShowAttrModal(false)}
              >
                <Text style={styles.modalCancelText}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalConfirmBtn]}
                onPress={addCustomAttribute}
              >
                <Text style={styles.modalConfirmText}>确定</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  section: {
    padding: SPACING.lg,
    backgroundColor: COLORS.glass,
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  imageThumbContainer: {
    position: 'relative',
  },
  imageThumb: {
    width: 80,
    height: 80,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.glassLight,
  },
  removeImageBtn: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.error,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeImageText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  defaultBadge: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    backgroundColor: COLORS.primary,
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  defaultBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  imageAddButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  imageAddBtn: {
    width: 80,
    height: 80,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageAddText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  hint: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
  },
  input: {
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.sm,
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
  },
  locationDetailInput: {
    marginTop: SPACING.sm,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  chipGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  chip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  chipTextActive: {
    color: '#fff',
  },
  dateModeRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  dateModeBtn: {
    flex: 1,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  dateModeBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  dateModeBtnText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  dateModeBtnTextActive: {
    color: '#fff',
  },
  dateDisplay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.sm,
  },
  dateDisplayText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
  },
  dateHint: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  clearDateBtn: {
    marginTop: SPACING.sm,
    alignItems: 'center',
  },
  clearDateBtnText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.error,
  },
  attrList: {
    marginBottom: SPACING.md,
  },
  attrItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    marginBottom: SPACING.sm,
  },
  attrContent: {
    flex: 1,
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  attrName: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
  attrValue: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  attrActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  attrEditBtn: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  attrEditText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
  },
  attrDeleteBtn: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  attrDeleteText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.error,
  },
  addAttrBtn: {
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  addAttrBtnText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.primary,
  },
  attrHint: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
  },
  saveButton: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    ...SHADOWS.card,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  // Modal 样式
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  yearPickerModal: {
    width: 280,
    maxHeight: 400,
    backgroundColor: COLORS.glass,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
  },
  yearPickerTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  yearScrollView: {
    maxHeight: 280,
  },
  yearItem: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.sm,
  },
  yearItemSelected: {
    backgroundColor: COLORS.primary,
  },
  yearItemText: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  yearItemTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
  attrModal: {
    width: 300,
    backgroundColor: COLORS.glass,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
  },
  attrModalTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  attrInput: {
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.sm,
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  modalBtns: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.sm,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.sm,
    alignItems: 'center',
  },
  modalCancelBtn: {
    backgroundColor: COLORS.background,
  },
  modalConfirmBtn: {
    backgroundColor: COLORS.primary,
  },
  modalCancelText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
  modalConfirmText: {
    fontSize: FONT_SIZES.md,
    color: '#fff',
    fontWeight: '600',
  },
});

export default AddClothingScreen;
