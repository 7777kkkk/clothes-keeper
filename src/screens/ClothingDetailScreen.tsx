import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { useStore } from '../store/useStore';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';
import { GradientBackground } from '../components/glass/GradientBackground';
import { RootStackParamList, Season, LocationType, CustomAttribute } from '../types';

type RouteProps = RouteProp<RootStackParamList, 'ClothingDetail'>;

const ClothingDetailScreen = () => {
  const insets = useSafeAreaInsets();
  const route = useRoute<RouteProps>();
  const navigation = useNavigation();
  const { itemId } = route.params;
  const {
    clothingItems,
    categories,
    updateClothingItem,
    deleteClothingItem,
    attributeTemplates = [],
    isLoaded,
  } = useStore();

  // 数据未加载完成时显示 loading
  if (!isLoaded) {
    return (
      <GradientBackground>
        <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: COLORS.textSecondary, fontSize: FONT_SIZES.md }}>加载中...</Text>
        </SafeAreaView>
      </GradientBackground>
    );
  }

  const item = clothingItems.find(c => c.id === itemId);

  // 只显示 visible=true 的字段
  const visibleTemplates = attributeTemplates.filter(t => t.visible !== false);
  const visibleIds = new Set(visibleTemplates.map(t => t.id));

  if (!item) {
    return (
      <GradientBackground>
        <SafeAreaView style={{ flex: 1 }}>
          <View style={[styles.topNav, { paddingTop: insets.top + SPACING.sm }]}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Text style={styles.backBtnText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.navTitle}>衣物详情</Text>
            <View style={{ width: 34 }} />
          </View>
          <View style={[styles.notFound, { flex: 1, justifyContent: 'center', alignItems: 'center' }]}>
            <Text style={styles.notFoundText}>未找到该衣物</Text>
          </View>
        </SafeAreaView>
      </GradientBackground>
    );
  }

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

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

  // 工具函数：从 AsyncStorage 反序列化后，purchaseDate 可能是字符串需要转换
  const toDate = (v: Date | string | null | undefined): Date | null => {
    if (!v) return null;
    if (v instanceof Date) return v;
    if (typeof v === 'string') {
      const d = new Date(v);
      return isNaN(d.getTime()) ? null : d;
    }
    return null;
  };

  const formatPurchaseDate = () => {
    const date = toDate(item.purchaseDate);
    if (!date) return '未设置';
    if (item.purchaseDateMode === 'year') {
      return `${date.getFullYear()}年`;
    }
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  // ============ 浏览模式 ============
  return (
    <GradientBackground>
      <SafeAreaView style={{ flex: 1 }}>
        {/* 顶部导航 */}
        <View style={[styles.topNav, { paddingTop: insets.top + SPACING.sm }]}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
          >
            <Text style={styles.backBtnText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.navTitle}>衣物详情</Text>
          <View style={{ width: 34 }} />
        </View>

        <ScrollView
          style={[styles.container, { paddingBottom: insets.bottom + 80 }]}
          showsVerticalScrollIndicator={false}
        >
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
              {visibleIds.has('sys_category') && (
                <View style={styles.tag}>
                  <Text style={styles.tagText}>{category?.name || '未分类'}</Text>
                </View>
              )}
              {visibleIds.has('sys_seasons') && item.seasons.map(s => (
                <View key={s} style={styles.tag}>
                  <Text style={styles.tagText}>{s}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* 详细信息 — 根据 visible 过滤 */}
          <View style={styles.section}>
            {visibleIds.has('sys_location') && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>📍 存放位置</Text>
                <Text style={styles.infoValue}>{getLocationText()}</Text>
              </View>
            )}
            {visibleIds.has('sys_brand') && item.brand && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>🏷️ 品牌</Text>
                <Text style={styles.infoValue}>{item.brand}</Text>
              </View>
            )}
            {visibleIds.has('sys_price') && item.price > 0 && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>💰 价格</Text>
                <Text style={styles.infoValue}>¥{item.price.toFixed(2)}</Text>
              </View>
            )}
            {visibleIds.has('sys_purchase_date') && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>🗓️ 购买日期</Text>
                <Text style={styles.infoValue}>{formatPurchaseDate()}</Text>
              </View>
            )}
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>👕 穿搭次数</Text>
              <Text style={styles.infoValue}>{item.wearCount || 0} 次</Text>
            </View>
          </View>

          {/* 自定义属性 — 根据 visible 过滤（优先用 templateId，兼容旧 name 匹配） */}
          {(() => {
            const visibleCustomAttrs = (item.customAttributes || [])
              .filter(attr => attr && typeof attr.name === 'string' && attr.name.trim() !== '')
              .filter(attr => attr.type === 'text' || attr.type === 'category')
              .filter(attr => {
                // 优先通过 templateId 精确匹配
                let tpl = attr.templateId
                  ? attributeTemplates.find(t => t.id === attr.templateId)
                  : undefined;
                // 兼容旧数据：通过 name 匹配
                if (!tpl && attr.name) {
                  tpl = attributeTemplates.find(t => t.name === attr.name);
                }
                return tpl && tpl.visible;
              });
            if (visibleCustomAttrs.length === 0) return null;
            return (
              <View style={styles.section}>
                <Text style={styles.sectionHeader}>✨ 自定义属性</Text>
                {visibleCustomAttrs.map(attr => (
                  <View key={attr.id} style={styles.infoRow}>
                    <Text style={styles.infoLabel}>{attr.name}</Text>
                    <Text style={styles.infoValue}>{attr.value}</Text>
                  </View>
                ))}
              </View>
            );
          })()}

          {/* 备注 — 根据 visible 过滤 */}
          {visibleIds.has('sys_notes') && item.notes && (
            <View style={styles.section}>
              <Text style={styles.infoLabel}>📝 备注</Text>
              <Text style={styles.notes}>{item.notes}</Text>
            </View>
          )}

          {/* 操作按钮 */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.editButton]}
              onPress={() => (navigation as any).navigate('AddClothing', { itemId })}
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
    backgroundColor: COLORS.background,
  },
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.sm,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.08)',
    gap: SPACING.md,
  },
  backBtn: {
    width: 34,
    height: 34,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backBtnText: {
    fontSize: 22,
    color: COLORS.textPrimary,
  },
  navTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: FONT_SIZES.lg,
    fontWeight: '800',
    color: COLORS.textPrimary,
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
});

export default ClothingDetailScreen;
