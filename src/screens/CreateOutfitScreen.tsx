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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { useStore } from '../store/useStore';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { RootStackParamList } from '../types';

type RouteProps = RouteProp<RootStackParamList, 'CreateOutfit'>;

const CreateOutfitScreen = () => {
  const insets = useSafeAreaInsets();
  const route = useRoute<RouteProps>();
  const navigation = useNavigation();
  const { outfitId } = route.params || {};

  const { outfits, occasions, clothingItems, addOutfit, updateOutfit, deleteOutfit, incrementWearCount } = useStore();
  const existingOutfit = outfitId ? outfits.find(o => o.id === outfitId) : null;

  const [name, setName] = useState(existingOutfit?.name || '');
  const [selectedOccasions, setSelectedOccasions] = useState<string[]>(
    existingOutfit?.occasions || []
  );
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>(
    existingOutfit?.itemIds || []
  );
  const [notes, setNotes] = useState(existingOutfit?.notes || '');
  const [didIncrementCount, setDidIncrementCount] = useState(false);

  const isEdit = !!existingOutfit;

  const toggleOccasion = (id: string) => {
    setSelectedOccasions(prev =>
      prev.includes(id) ? prev.filter(o => o !== id) : [...prev, id]
    );
  };

  const toggleItem = (id: string) => {
    setSelectedItemIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('请输入搭配名称');
      return;
    }
    if (selectedItemIds.length === 0) {
      Alert.alert('请选择至少一件衣物');
      return;
    }

    const outfitData = {
      name: name.trim(),
      coverImage: clothingItems.find(c => c.id === selectedItemIds[0])?.images[0] || '',
      itemIds: selectedItemIds,
      occasions: selectedOccasions,
      notes: notes.trim(),
    };

    if (isEdit) {
      updateOutfit(outfitId!, outfitData);
    } else {
      addOutfit(outfitData);
      // 新增搭配时，给所选单品的穿搭次数 +1
      incrementWearCount(selectedItemIds);
    }

    Alert.alert(isEdit ? '更新成功' : '创建成功', '', [
      { text: '确定', onPress: () => navigation.goBack() }
    ]);
  };

  const handleDelete = () => {
    Alert.alert('确认删除', '确定要删除这个搭配吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '删除',
        style: 'destructive',
        onPress: () => {
          deleteOutfit(outfitId!);
          navigation.goBack();
        },
      },
    ]);
  };

  return (
    <ScrollView style={[styles.container, { paddingBottom: insets.bottom + 80 }]}>
      <View style={{ height: insets.top > 0 ? 0 : SPACING.md }} />
      {/* 名称 */}
      <View style={styles.section}>
        <Text style={styles.label}>搭配名称 *</Text>
        <TextInput
          style={styles.input}
          placeholder="如：上班通勤穿搭"
          value={name}
          onChangeText={setName}
          placeholderTextColor={COLORS.textSecondary}
        />
      </View>

      {/* 场合 */}
      <View style={styles.section}>
        <Text style={styles.label}>适用场合</Text>
        <View style={styles.chipGroup}>
          {occasions.map(occ => (
            <TouchableOpacity
              key={occ.id}
              style={[styles.chip, selectedOccasions.includes(occ.id) && styles.chipActive]}
              onPress={() => toggleOccasion(occ.id)}
            >
              <Text style={[styles.chipText, selectedOccasions.includes(occ.id) && styles.chipTextActive]}>
                {occ.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* 选择衣物 */}
      <View style={styles.section}>
        <Text style={styles.label}>选择衣物（{selectedItemIds.length}件）</Text>
        <View style={styles.itemGrid}>
          {clothingItems.map(item => (
            <TouchableOpacity
              key={item.id}
              style={[styles.itemCard, selectedItemIds.includes(item.id) && styles.itemCardSelected]}
              onPress={() => toggleItem(item.id)}
            >
              <Image source={{ uri: item.images[0] }} style={styles.itemImage} />
              {selectedItemIds.includes(item.id) && (
                <View style={styles.checkmark}>
                  <Text style={styles.checkmarkText}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* 备注 */}
      <View style={styles.section}>
        <Text style={styles.label}>备注</Text>
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
        <Text style={styles.saveButtonText}>{isEdit ? '保存更改' : '创建搭配'}</Text>
      </TouchableOpacity>

      {/* 删除按钮 */}
      {isEdit && (
        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Text style={styles.deleteButtonText}>删除此搭配</Text>
        </TouchableOpacity>
      )}
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
  label: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
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
  itemGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  itemCard: {
    width: 100,
    height: 130,
    borderRadius: BORDER_RADIUS.sm,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  itemCardSelected: {
    borderColor: COLORS.accent,
  },
  itemImage: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.secondary,
  },
  checkmark: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
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
  deleteButton: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  deleteButtonText: {
    color: COLORS.error,
    fontSize: FONT_SIZES.md,
  },
});

export default CreateOutfitScreen;
