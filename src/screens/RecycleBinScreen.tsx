import React from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons as Icon } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useStore } from '../store/useStore';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { GlassCard } from '../components/glass/GlassComponents';
import { GradientBackground } from '../components/glass/GradientBackground';
import { ClothingItem } from '../types';

const RecycleBinScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { clothingItems, categories, restoreClothingItem, permanentDeleteClothingItem, restoreAllClothingItems, permanentDeleteAllClothingItems } = useStore();

  const deletedItems = clothingItems.filter(item => item.isDeleted);

  const getCategoryName = (categoryId: string) => {
    const cat = categories.find(c => c.id === categoryId);
    return cat?.name || '未知分类';
  };

  const handleRestore = (item: ClothingItem) => {
    Alert.alert(
      '恢复衣物',
      `确定要恢复「${item.name}」吗？`,
      [
        { text: '取消' },
        { text: '恢复', onPress: () => restoreClothingItem(item.id) },
      ]
    );
  };

  const handlePermanentDelete = (item: ClothingItem) => {
    Alert.alert(
      '彻底删除',
      `确定要彻底删除「${item.name}」吗？此操作不可恢复！`,
      [
        { text: '取消' },
        {
          text: '彻底删除',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              '再次确认',
              '请输入"确认"以执行彻底删除',
              [
                { text: '取消' },
                { text: '确认', style: 'destructive', onPress: () => permanentDeleteClothingItem(item.id) },
              ]
            );
          },
        },
      ]
    );
  };

  const handleEmptyRestore = () => {
    Alert.alert(
      '恢复全部',
      `确定要恢复全部 ${deletedItems.length} 件衣物吗？`,
      [
        { text: '取消' },
        { text: '全部恢复', onPress: () => restoreAllClothingItems() },
      ]
    );
  };

  const handleEmptyPermanentDelete = () => {
    Alert.alert(
      '清空回收站',
      `确定要彻底删除全部 ${deletedItems.length} 件衣物吗？此操作不可恢复！`,
      [
        { text: '取消' },
        {
          text: '彻底删除全部',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              '再次确认',
              '请输入"确认"以执行彻底删除',
              [
                { text: '取消' },
                { text: '确认', style: 'destructive', onPress: () => permanentDeleteAllClothingItems() },
              ]
            );
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: ClothingItem }) => (
    <GlassCard style={styles.itemCard} padding="md">
      <View style={styles.itemRow}>
        {item.images && item.images.length > 0 ? (
          <Image source={{ uri: item.images[0] }} style={styles.itemImage} />
        ) : (
          <View style={[styles.itemImage, styles.itemImagePlaceholder]}>
            <Icon name="image-outline" size={24} color={COLORS.textSecondary} />
          </View>
        )}
        <View style={styles.itemInfo}>
          <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.itemCategory}>{getCategoryName(item.categoryId)}</Text>
          {item.brand ? (
            <Text style={styles.itemBrand}>{item.brand}</Text>
          ) : null}
        </View>
        <View style={styles.itemActions}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => handleRestore(item)}
            activeOpacity={0.7}
          >
            <Icon name="arrow-undo-outline" size={18} color={COLORS.success} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, styles.actionBtnDanger]}
            onPress={() => handlePermanentDelete(item)}
            activeOpacity={0.7}
          >
            <Icon name="trash-outline" size={18} color={COLORS.error} />
          </TouchableOpacity>
        </View>
      </View>
    </GlassCard>
  );

  return (
    <GradientBackground>
      <SafeAreaView style={[styles.container, { paddingTop: insets.top }]} edges={['top']}>
        <View style={styles.topNav}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Icon name="chevron-back" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.topNavTitle}>回收站</Text>
          {deletedItems.length > 0 ? (
            <Text style={styles.topNavCount}>{deletedItems.length} 件</Text>
          ) : (
            <View style={styles.backBtn} />
          )}
        </View>

        {deletedItems.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="trash-bin-outline" size={64} color="rgba(0,0,0,0.15)" />
            <Text style={styles.emptyText}>回收站为空</Text>
            <Text style={styles.emptySub}>已删除的衣物将显示在这里</Text>
          </View>
        ) : (
          <>
            <View style={styles.batchActions}>
              <TouchableOpacity
                style={styles.batchBtn}
                onPress={handleEmptyRestore}
                activeOpacity={0.7}
              >
                <Icon name="arrow-undo" size={16} color={COLORS.success} />
                <Text style={[styles.batchBtnText, { color: COLORS.success }]}>恢复全部</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.batchBtn, styles.batchBtnDanger]}
                onPress={handleEmptyPermanentDelete}
                activeOpacity={0.7}
              >
                <Icon name="trash" size={16} color={COLORS.error} />
                <Text style={[styles.batchBtnText, { color: COLORS.error }]}>清空回收站</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={deletedItems}
              keyExtractor={item => item.id}
              renderItem={renderItem}
              contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 100 }]}
              showsVerticalScrollIndicator={false}
            />
          </>
        )}
      </SafeAreaView>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.12)',
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  topNavTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
    letterSpacing: -0.3,
  },
  topNavCount: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  listContent: { paddingTop: SPACING.lg, paddingHorizontal: SPACING.lg },
  itemCard: { marginBottom: SPACING.md },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  itemImage: {
    width: 64,
    height: 80,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  itemImagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemInfo: { flex: 1 },
  itemName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  itemCategory: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  itemBrand: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  itemActions: { flexDirection: 'row', gap: SPACING.sm },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionBtnDanger: {
    backgroundColor: 'rgba(224,92,92,0.1)',
  },
  batchActions: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    gap: SPACING.md,
  },
  batchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.xl,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  batchBtnDanger: {
    backgroundColor: 'rgba(224,92,92,0.1)',
  },
  batchBtnText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.md,
  },
  emptyText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  emptySub: {
    fontSize: FONT_SIZES.sm,
    color: 'rgba(0,0,0,0.3)',
  },
});

export default RecycleBinScreen;
