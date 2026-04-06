import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStore } from '../store/useStore';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { Category } from '../types';

const CategoryManageScreen = () => {
  const insets = useSafeAreaInsets();
  const { categories, addCategory, updateCategory, deleteCategory } = useStore();
  const [newName, setNewName] = useState('');

  const handleAdd = () => {
    if (!newName.trim()) {
      Alert.alert('请输入品类名称');
      return;
    }
    addCategory(newName.trim());
    setNewName('');
  };

  const handleDelete = (cat: Category) => {
    Alert.alert('确认删除', `确定要删除"${cat.name}"吗？`, [
      { text: '取消', style: 'cancel' },
      {
        text: '删除',
        style: 'destructive',
        onPress: () => deleteCategory(cat.id),
      },
    ]);
  };

  const renderItem = ({ item }: { item: Category }) => (
    <View style={styles.item}>
      <Text style={styles.itemName}>{item.name}</Text>
      <TouchableOpacity onPress={() => handleDelete(item)}>
        <Text style={styles.deleteBtn}>删除</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top > 0 ? 0 : SPACING.md, paddingBottom: insets.bottom + 80 }]}>
      <View style={{ height: insets.top }} />
      {/* 添加新品类 */}
      <View style={styles.addSection}>
        <TextInput
          style={styles.input}
          placeholder="输入新品类名称"
          value={newName}
          onChangeText={setNewName}
          placeholderTextColor={COLORS.textSecondary}
        />
        <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
          <Text style={styles.addButtonText}>添加</Text>
        </TouchableOpacity>
      </View>

      {/* 品类列表 */}
      <FlatList
        data={categories}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.emptyText}>还没有品类</Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  addSection: {
    flexDirection: 'row',
    padding: SPACING.lg,
    backgroundColor: COLORS.card,
    gap: SPACING.md,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
  },
  addButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS.sm,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: FONT_SIZES.sm,
  },
  list: {
    padding: SPACING.lg,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.card,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.sm,
    marginBottom: SPACING.sm,
    ...SHADOWS.card,
  },
  itemName: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  deleteBtn: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.error,
  },
  emptyText: {
    textAlign: 'center',
    color: COLORS.textSecondary,
    marginTop: 40,
    fontSize: FONT_SIZES.md,
  },
});

export default CategoryManageScreen;
