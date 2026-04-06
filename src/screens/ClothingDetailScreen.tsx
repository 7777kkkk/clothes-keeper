import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { useStore } from '../store/useStore';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { GradientBackground } from '../components/glass/GradientBackground';
import { RootStackParamList, Season, LocationType, CustomAttribute } from '../types';

type RouteProps = RouteProp<RootStackParamList, 'ClothingDetail'>;

const SEASONS: Season[] = ['春', '夏', '秋', '冬'];
const LOCATION_TYPES: LocationType[] = ['家', '学校'];

const ClothingDetailScreen = () => {
  const insets = useSafeAreaInsets();
  const route = useRoute<RouteProps>();
  const navigation = useNavigation();
  const { itemId } = route.params;
  const { clothingItems, categories, updateClothingItem, deleteClothingItem } = useStore();

  const item = clothingItems.find(c => c.id === itemId);
  if (!item) {
    return (
      <View style={[styles.notFound, { paddingTop: insets.top + SPACING.lg }]}>
        <Text style={styles.notFoundText}>未找到该衣物</Text>
      </View>
    );
  }

  const [isEditMode, setIsEditMode] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // 编辑状态
  const [editName, setEditName] = useState(item.name);
  const [editImages, setEditImages] = useState<string[]>(item.images);
  const [editCategoryId, setEditCategoryId] = useState(item.categoryId);
  const [editSeasons, setEditSeasons] = useState<Season[]>(item.seasons);
  const [editLocationType, setEditLocationType] = useState<LocationType>(item.locationType);
  const [editLocationDetail, setEditLocationDetail] = useState(item.locationDetail);
  const [editBrand, setEditBrand] = useState(item.brand);
  const [editPrice, setEditPrice] = useState(item.price.toString());
  const [editPurchaseDate, setEditPurchaseDate] = useState<Date | null>(item.purchaseDate);
  const [editPurchaseDateMode, setEditPurchaseDateMode] = useState<'full' | 'year'>(item.purchaseDateMode || 'full');
  const [editNotes, setEditNotes] = useState(item.notes);
  const [editCustomAttributes, setEditCustomAttributes] = useState<CustomAttribute[]>(item.customAttributes || []);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showYearModal, setShowYearModal] = useState(false);
  const [showAttrModal, setShowAttrModal] = useState(false);
  const [attrName, setAttrName] = useState('');
  const [attrValue, setAttrValue] = useState('');
  const [editingAttrIndex, setEditingAttrIndex] = useState<number | null>(null);
  const [yearPickerValue, setYearPickerValue] = useState(item.purchaseDate?.getFullYear() || new Date().getFullYear());

  const category = categories.find(c => c.id === item.categoryId);

  useEffect(() => {
    if (isEditMode) {
      // 重置编辑状态
      setEditName(item.name);
      setEditImages(item.images);
      setEditCategoryId(item.categoryId);
      setEditSeasons(item.seasons);
      setEditLocationType(item.locationType);
      setEditLocationDetail(item.locationDetail);
      setEditBrand(item.brand);
      setEditPrice(item.price.toString());
      setEditPurchaseDate(item.purchaseDate);
      setEditPurchaseDateMode(item.purchaseDateMode || 'full');
      setEditNotes(item.notes);
      setEditCustomAttributes(item.customAttributes || []);
    }
  }, [isEditMode, item]);

  const handleDelete = () => {
    Alert.alert('确认删除', '确定要删除这件衣物吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '删除',
        style: 'destructive',
        onPress: () => {
          deleteClothingItem(itemId);
          navigation.goBack();
        },
      },
    ]);
  };

  const handleSaveEdit = () => {
    if (!editName.trim()) {
      Alert.alert('请输入名称');
      return;
    }
    if (editImages.length === 0) {
      Alert.alert('请添加至少一张图片');
      return;
    }

    updateClothingItem(itemId, {
      name: editName.trim(),
      images: editImages,
      categoryId: editCategoryId,
      seasons: editSeasons,
      locationType: editLocationType,
      locationDetail: editLocationDetail.trim(),
      brand: editBrand.trim(),
      price: parseFloat(editPrice) || 0,
      purchaseDate: editPurchaseDate,
      purchaseDateMode: editPurchaseDateMode,
      notes: editNotes.trim(),
      customAttributes: editCustomAttributes,
    });

    setIsEditMode(false);
    Alert.alert('保存成功');
  };

  const toggleSeason = (season: Season) => {
    setEditSeasons(prev =>
      prev.includes(season)
        ? prev.filter(s => s !== season)
        : [...prev, season]
    );
  };

  const removeImage = (index: number) => {
    setEditImages(prev => prev.filter((_, i) => i !== index));
  };

  const pickImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: 9,
    });

    if (!result.canceled && result.assets) {
      const uris = result.assets.map(a => a.uri);
      setEditImages(prev => [...prev, ...uris].slice(0, 9));
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setEditPurchaseDate(selectedDate);
    }
  };

  const handleYearConfirm = () => {
    const date = new Date(yearPickerValue, 0, 1);
    setEditPurchaseDate(date);
    setShowYearModal(false);
  };

  const addEditCustomAttribute = () => {
    if (!attrName.trim() || !attrValue.trim()) {
      Alert.alert('请填写属性名和属性值');
      return;
    }
    if (editingAttrIndex !== null) {
      setEditCustomAttributes(prev => prev.map((attr, i) =>
        i === editingAttrIndex ? { ...attr, name: attrName.trim(), value: attrValue.trim() } : attr
      ));
    } else {
      const newAttr: CustomAttribute = {
        id: Math.random().toString(36).substring(2, 9),
        name: attrName.trim(),
        value: attrValue.trim(),
        type: 'text',
      };
      setEditCustomAttributes(prev => [...prev, newAttr]);
    }
    setAttrName('');
    setAttrValue('');
    setEditingAttrIndex(null);
    setShowAttrModal(false);
  };

  const editEditCustomAttribute = (index: number) => {
    const attr = editCustomAttributes[index];
    setAttrName(attr.name);
    setAttrValue(attr.value);
    setEditingAttrIndex(index);
    setShowAttrModal(true);
  };

  const deleteEditCustomAttribute = (index: number) => {
    setEditCustomAttributes(prev => prev.filter((_, i) => i !== index));
  };

  const getLocationText = () => {
    if (item.locationDetail) {
      return `${item.locationType} - ${item.locationDetail}`;
    }
    return item.locationType;
  };

  const formatPurchaseDate = () => {
    if (!item.purchaseDate) return '未设置';
    if (item.purchaseDateMode === 'year') {
      return `${item.purchaseDate.getFullYear()}年`;
    }
    return `${item.purchaseDate.getFullYear()}-${String(item.purchaseDate.getMonth() + 1).padStart(2, '0')}-${String(item.purchaseDate.getDate()).padStart(2, '0')}`;
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i + 10);

  // ============ 编辑模式 ============
  if (isEditMode) {
    return (
      <GradientBackground>
      <SafeAreaView style={{flex:1}}>
      <ScrollView style={[styles.container, { paddingBottom: insets.bottom + 80 }]}>
        <View style={{ height: insets.top > 0 ? 0 : SPACING.md }} />
        {/* 图片选择 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>图片（{editImages.length}/9）</Text>
          <View style={styles.imageGrid}>
            {editImages.map((uri, index) => (
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
            {editImages.length < 9 && (
              <TouchableOpacity style={styles.imageAddBtn} onPress={pickImages}>
                <Text style={styles.imageAddText}>+ 添加</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* 名称 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>名称 *</Text>
          <TextInput
            style={styles.input}
            value={editName}
            onChangeText={setEditName}
            placeholderTextColor={COLORS.textSecondary}
          />
        </View>

        {/* 品类 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>品类</Text>
          <View style={styles.chipGroup}>
            {categories.map(cat => (
              <TouchableOpacity
                key={cat.id}
                style={[styles.chip, editCategoryId === cat.id && styles.chipActive]}
                onPress={() => setEditCategoryId(cat.id)}
              >
                <Text style={[styles.chipText, editCategoryId === cat.id && styles.chipTextActive]}>
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 季节 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>季节</Text>
          <View style={styles.chipGroup}>
            {SEASONS.map(season => (
              <TouchableOpacity
                key={season}
                style={[styles.chip, editSeasons.includes(season) && styles.chipActive]}
                onPress={() => toggleSeason(season)}
              >
                <Text style={[styles.chipText, editSeasons.includes(season) && styles.chipTextActive]}>
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
                style={[styles.chip, editLocationType === loc && styles.chipActive]}
                onPress={() => setEditLocationType(loc)}
              >
                <Text style={[styles.chipText, editLocationType === loc && styles.chipTextActive]}>
                  {loc}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <TextInput
            style={[styles.input, styles.marginTop]}
            placeholder="具体位置备注"
            value={editLocationDetail}
            onChangeText={setEditLocationDetail}
            placeholderTextColor={COLORS.textSecondary}
          />
        </View>

        {/* 品牌 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>品牌</Text>
          <TextInput
            style={styles.input}
            value={editBrand}
            onChangeText={setEditBrand}
            placeholderTextColor={COLORS.textSecondary}
          />
        </View>

        {/* 价格 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>价格</Text>
          <TextInput
            style={styles.input}
            value={editPrice}
            onChangeText={setEditPrice}
            keyboardType="decimal-pad"
            placeholderTextColor={COLORS.textSecondary}
          />
        </View>

        {/* 购买日期 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🗓️ 购买日期</Text>
          <View style={styles.dateModeRow}>
            <TouchableOpacity
              style={[styles.dateModeBtn, editPurchaseDateMode === 'full' && styles.dateModeBtnActive]}
              onPress={() => setEditPurchaseDateMode('full')}
            >
              <Text style={[styles.dateModeBtnText, editPurchaseDateMode === 'full' && styles.dateModeBtnTextActive]}>
                完整日期
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.dateModeBtn, editPurchaseDateMode === 'year' && styles.dateModeBtnActive]}
              onPress={() => setEditPurchaseDateMode('year')}
            >
              <Text style={[styles.dateModeBtnText, editPurchaseDateMode === 'year' && styles.dateModeBtnTextActive]}>
                仅年份
              </Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.dateDisplay}
            onPress={() => {
              if (editPurchaseDateMode === 'full') {
                setShowDatePicker(true);
              } else {
                setYearPickerValue(editPurchaseDate?.getFullYear() || currentYear);
                setShowYearModal(true);
              }
            }}
          >
            <Text style={styles.dateDisplayText}>
              {editPurchaseDate ? (editPurchaseDateMode === 'year'
                ? `${editPurchaseDate.getFullYear()}年`
                : `${editPurchaseDate.getFullYear()}-${String(editPurchaseDate.getMonth() + 1).padStart(2, '0')}-${String(editPurchaseDate.getDate()).padStart(2, '0')}`)
              : '未设置'}
            </Text>
            <Text style={styles.dateHint}>点击选择</Text>
          </TouchableOpacity>
        </View>

        {/* 自定义属性 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>✨ 自定义属性</Text>
          {editCustomAttributes.length > 0 && (
            <View style={styles.attrList}>
              {editCustomAttributes.map((attr, index) => (
                <View key={attr.id} style={styles.attrItem}>
                  <View style={styles.attrContent}>
                    <Text style={styles.attrName}>{attr.name}</Text>
                    <Text style={styles.attrValue}>{attr.value}</Text>
                  </View>
                  <View style={styles.attrActions}>
                    <TouchableOpacity onPress={() => editEditCustomAttribute(index)}>
                      <Text style={styles.attrEditText}>编辑</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => deleteEditCustomAttribute(index)}>
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
        </View>

        {/* 备注 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>备注</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={editNotes}
            onChangeText={setEditNotes}
            multiline
            numberOfLines={3}
            placeholderTextColor={COLORS.textSecondary}
          />
        </View>

        {/* 保存/取消按钮 */}
        <View style={styles.editActions}>
          <TouchableOpacity
            style={[styles.editBtn, styles.cancelBtn]}
            onPress={() => setIsEditMode(false)}
          >
            <Text style={styles.cancelBtnText}>取消</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.editBtn, styles.saveBtn]}
            onPress={handleSaveEdit}
          >
            <Text style={styles.saveBtnText}>保存</Text>
          </TouchableOpacity>
        </View>

        {/* 日期选择器 */}
        {showDatePicker && (
          <DateTimePicker
            value={editPurchaseDate || new Date()}
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
                <TouchableOpacity style={styles.modalBtn} onPress={() => setShowYearModal(false)}>
                  <Text style={styles.modalCancelText}>取消</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalBtn, styles.modalConfirmBtn]} onPress={handleYearConfirm}>
                  <Text style={styles.modalConfirmText}>确定</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* 自定义属性弹窗 */}
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
                <TouchableOpacity style={styles.modalBtn} onPress={() => setShowAttrModal(false)}>
                  <Text style={styles.modalCancelText}>取消</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalBtn, styles.modalConfirmBtn]} onPress={addEditCustomAttribute}>
                  <Text style={styles.modalConfirmText}>确定</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
    </ScrollView>
  </SafeAreaView>
</GradientBackground>
);
  }

  // ============ 浏览模式 ============
  return (
    <GradientBackground>
    <SafeAreaView style={{flex:1}}>
    <ScrollView style={[styles.container, { paddingBottom: insets.bottom + 80 }]}>
      <View style={{ height: insets.top > 0 ? 0 : SPACING.md }} />
      {/* 图片轮播 */}
      <View style={styles.imageSection}>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(e) => {
            const index = Math.round(e.nativeEvent.contentOffset.x / 350);
            setCurrentImageIndex(index);
          }}
        >
          {item.images.map((uri, index) => (
            <Image key={index} source={{ uri }} style={styles.mainImage} />
          ))}
        </ScrollView>
        {item.images.length > 1 && (
          <View style={styles.imageIndicator}>
            <Text style={styles.imageIndicatorText}>
              {currentImageIndex + 1} / {item.images.length}
            </Text>
          </View>
        )}
      </View>

      {/* 基本信息 */}
      <View style={styles.section}>
        <Text style={styles.name}>{item.name}</Text>
        <View style={styles.tagRow}>
          <View style={styles.tag}>
            <Text style={styles.tagText}>{category?.name || '未分类'}</Text>
          </View>
          {item.seasons.map(s => (
            <View key={s} style={styles.tag}>
              <Text style={styles.tagText}>{s}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* 详细信息 */}
      <View style={styles.section}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>📍 存放位置</Text>
          <Text style={styles.infoValue}>{getLocationText()}</Text>
        </View>
        {item.brand && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>🏷️ 品牌</Text>
            <Text style={styles.infoValue}>{item.brand}</Text>
          </View>
        )}
        {item.price > 0 && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>💰 价格</Text>
            <Text style={styles.infoValue}>¥{item.price.toFixed(2)}</Text>
          </View>
        )}
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>🗓️ 购买日期</Text>
          <Text style={styles.infoValue}>{formatPurchaseDate()}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>👕 穿搭次数</Text>
          <Text style={styles.infoValue}>{item.wearCount || 0} 次</Text>
        </View>
      </View>

      {/* 自定义属性 */}
      {item.customAttributes && item.customAttributes.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>✨ 自定义属性</Text>
          {item.customAttributes.map(attr => (
            <View key={attr.id} style={styles.infoRow}>
              <Text style={styles.infoLabel}>{attr.name}</Text>
              <Text style={styles.infoValue}>{attr.value}</Text>
            </View>
          ))}
        </View>
      )}

      {/* 备注 */}
      {item.notes && (
        <View style={styles.section}>
          <Text style={styles.infoLabel}>📝 备注</Text>
          <Text style={styles.notes}>{item.notes}</Text>
        </View>
      )}

      {/* 操作按钮 */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionBtn, styles.editButton]}
          onPress={() => setIsEditMode(true)}
        >
          <Text style={styles.editButtonText}>编辑</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, styles.deleteButton]}
          onPress={handleDelete}
        >
          <Text style={styles.deleteButtonText}>删除</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  </SafeAreaView>
</GradientBackground>
);
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.card,
  },
  notFound: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notFoundText: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.textSecondary,
  },
  // 图片
  imageSection: {
    position: 'relative',
  },
  mainImage: {
    width: 350,
    height: 350,
    backgroundColor: 'rgba(255,255,255,0.65)',
  },
  imageIndicator: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  imageIndicatorText: {
    color: '#fff',
    fontSize: FONT_SIZES.sm,
  },
  // 基础信息
  section: {
    padding: SPACING.lg,
    backgroundColor: 'rgba(255,255,255,0.85)',
    marginBottom: SPACING.sm,
  },
  sectionHeader: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  name: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  tag: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.card,
  },
  tagText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.12)',
  },
  infoLabel: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
  infoValue: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  notes: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
    marginTop: SPACING.sm,
    lineHeight: 22,
  },
  // 操作按钮
  actions: {
    flexDirection: 'row',
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: COLORS.primary,
  },
  editButtonText: {
    color: '#fff',
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  deleteButton: {
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  deleteButtonText: {
    color: COLORS.error,
    fontSize: FONT_SIZES.md,
  },
  // ============ 编辑模式样式 ============
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
    backgroundColor: 'rgba(255,255,255,0.65)',
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
  imageAddBtn: {
    width: 80,
    height: 80,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.12)',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageAddText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  input: {
    backgroundColor: COLORS.card,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.sm,
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
  },
  marginTop: {
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
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.12)',
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
    borderColor: 'rgba(0,0,0,0.12)',
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
    backgroundColor: COLORS.card,
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
  attrList: {
    marginBottom: SPACING.md,
  },
  attrItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.card,
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
    gap: SPACING.md,
  },
  attrEditText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
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
  editActions: {
    flexDirection: 'row',
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  editBtn: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  cancelBtn: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.12)',
  },
  cancelBtnText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.md,
  },
  saveBtn: {
    backgroundColor: COLORS.primary,
  },
  saveBtnText: {
    color: '#fff',
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  yearPickerModal: {
    width: 280,
    maxHeight: 400,
    backgroundColor: 'rgba(255,255,255,0.85)',
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
    backgroundColor: 'rgba(255,255,255,0.85)',
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
    backgroundColor: COLORS.card,
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
    backgroundColor: COLORS.card,
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

export default ClothingDetailScreen;
