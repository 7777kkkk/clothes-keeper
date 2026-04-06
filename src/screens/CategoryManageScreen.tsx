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
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStore } from '../store/useStore';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { GradientBackground } from '../components/glass/GradientBackground';
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
    <GradientBackground>
    <SafeAreaView style={{ flex: 1 }}>
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom + 80 }]}>
        {/* 添加新品类 */}
        <View style={styles.addSection}>
          <TextInput
            style={styles.input}
            placeholder="输入新品类名称"
            value={newName}
            onChangeText={setNewName}
            placeholderTextColor="rgba(0,0,0,0.35)"
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
    </SafeAreaView>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  addSection: {
    flexDirection: 'row',
    padding: SPACING.lg,
    backgroundColor: COLORS.background,
    gap: SPACING.md,
    ...SHADOWS.card,
  },
  input: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.06)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    fontSize: FONT_SIZES.md,
    color: '#333',
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
    backgroundColor: COLORS.background,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.sm,
    ...SHADOWS.card,
  },
  itemName: {
    fontSize: FONT_SIZES.md,
    color: '#333',
    fontWeight: '500',
  },
  deleteBtn: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.error,
  },
  emptyText: {
    textAlign: 'center',
    color: 'rgba(0,0,0,0.35)',
    marginTop: 40,
    fontSize: FONT_SIZES.md,
  },
});

export default CategoryManageScreen;
