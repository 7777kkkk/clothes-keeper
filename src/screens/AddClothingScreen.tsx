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
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { useStore } from '../store/useStore';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';
import { Season } from '../types';

const SEASONS: Season[] = ['春', '夏', '秋', '冬'];

const AddClothingScreen = () => {
  const navigation = useNavigation();
  const { addClothingItem, categories } = useStore();

  const [images, setImages] = useState<string[]>([]);
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [selectedSeasons, setSelectedSeasons] = useState<Season[]>([]);
  const [storageLocation, setStorageLocation] = useState('');
  const [brand, setBrand] = useState('');
  const [price, setPrice] = useState('');
  const [notes, setNotes] = useState('');

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

  const toggleSeason = (season: Season) => {
    setSelectedSeasons(prev =>
      prev.includes(season)
        ? prev.filter(s => s !== season)
        : [...prev, season]
    );
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
      storageLocation: storageLocation.trim(),
      brand: brand.trim(),
      price: parseFloat(price) || 0,
      purchaseDate: null,
      notes: notes.trim(),
    });

    Alert.alert('添加成功', '衣物已添加到衣橱', [
      { text: '确定', onPress: () => navigation.goBack() }
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      {/* 图片选择 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>图片（{images.length}/9）</Text>
        <View style={styles.imageGrid}>
          {images.map((uri, index) => (
            <Image key={index} source={{ uri }} style={styles.imageThumb} />
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

      {/* 收纳位置 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>收纳位置</Text>
        <TextInput
          style={styles.input}
          placeholder="如：卧室衣柜第二层"
          value={storageLocation}
          onChangeText={setStorageLocation}
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
    backgroundColor: COLORS.card,
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
  imageThumb: {
    width: 80,
    height: 80,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.secondary,
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
  input: {
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.sm,
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
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
  saveButton: {
    margin: SPACING.lg,
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
});

export default AddClothingScreen;
