import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { useStore } from '../store/useStore';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { RootStackParamList } from '../types';

type RouteProps = RouteProp<RootStackParamList, 'ClothingDetail'>;

const ClothingDetailScreen = () => {
  const route = useRoute<RouteProps>();
  const navigation = useNavigation();
  const { itemId } = route.params;
  const { clothingItems, categories, deleteClothingItem } = useStore();

  const item = clothingItems.find(c => c.id === itemId);
  if (!item) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>未找到该衣物</Text>
      </View>
    );
  }

  const category = categories.find(c => c.id === item.categoryId);

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

  const getLocationText = () => {
    if (item.locationDetail) {
      return `${item.locationType} - ${item.locationDetail}`;
    }
    return item.locationType;
  };

  return (
    <ScrollView style={styles.container}>
      {/* 图片轮播 */}
      <ScrollView horizontal pagingEnabled style={styles.imageContainer}>
        {item.images.map((uri, index) => (
          <Image key={index} source={{ uri }} style={styles.mainImage} />
        ))}
      </ScrollView>

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
      </View>

      {/* 备注 */}
      {item.notes && (
        <View style={styles.section}>
          <Text style={styles.infoLabel}>📝 备注</Text>
          <Text style={styles.notes}>{item.notes}</Text>
        </View>
      )}

      {/* 删除按钮 */}
      <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
        <Text style={styles.deleteButtonText}>删除此衣物</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  imageContainer: {
    height: 350,
  },
  mainImage: {
    width: 350,
    height: 350,
    backgroundColor: COLORS.secondary,
  },
  section: {
    padding: SPACING.lg,
    backgroundColor: COLORS.card,
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
    backgroundColor: COLORS.background,
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
    borderBottomColor: COLORS.border,
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
  deleteButton: {
    margin: SPACING.lg,
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
  notFound: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notFoundText: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.textSecondary,
  },
});

export default ClothingDetailScreen;
