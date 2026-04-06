/**
 * OutfitScreen — 搭配列表页
 * 深色玻璃拟态，白色文字
 */
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Image,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useStore } from '../store/useStore';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { GlassCard, GlassPill, FAB, EmptyState } from '../components/glass/GlassComponents';
import { GradientBackground } from '../components/glass/GradientBackground';
import { RootStackParamList, Outfit } from '../types';

const OutfitScreen = () => {
  const insets = useSafeAreaInsets();
  const nav = useNavigation<any>();
  const { outfits, occasions, clothingItems } = useStore();
  const [selectedOccasion, setSelectedOccasion] = useState<string | null>(null);

  const filtered = outfits.filter(o =>
    !selectedOccasion || o.occasions.includes(selectedOccasion)
  );

  const renderOutfit = ({ item }: { item: Outfit }) => {
    const items = item.itemIds
      .map(id => clothingItems.find(c => c.id === id))
      .filter(Boolean);

    return (
      <GlassCard
        style={outfitStyles.outfitCard}
        padding="md"
        onPress={() => nav.navigate('CreateOutfit', { outfitId: item.id })}
      >
        {/* 搭配封面 */}
        <View style={outfitStyles.coverRow}>
          {items.slice(0, 4).map((c: any, i: number) => (
            <Image
              key={c.id}
              source={{ uri: c.images[0] }}
              style={[
                outfitStyles.thumb,
                { position: 'absolute', left: i * 38, zIndex: 4 - i },
              ]}
              resizeMode="cover"
            />
          ))}
          {items.length === 0 && (
            <View style={[outfitStyles.thumb, { backgroundColor: 'rgba(255,255,255,0.65)' }]}>
              <Icon name="hanger" size={20} color={'rgba(0,0,0,0.35)'} />
            </View>
          )}
        </View>
        {/* 信息 */}
        <View style={outfitStyles.outfitInfo}>
          <Text style={outfitStyles.outfitName} numberOfLines={1}>{item.name}</Text>
          <Text style={outfitStyles.outfitOccasion}>
            {item.occasions
              .map((id: string) => occasions.find((o: any) => o.id === id)?.name)
              .filter(Boolean)
              .join(' · ') || '未分类'}
          </Text>
        </View>
      </GlassCard>
    );
  };

  return (
    <GradientBackground>
    <SafeAreaView style={[outfitStyles.container, { paddingTop: insets.top }]} edges={['top']}>
      {/* Top Nav */}
      <View style={outfitStyles.topNav}>
        <Text style={outfitStyles.topNavTitle}>我的搭配</Text>
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={() => nav.navigate('CreateOutfit', {})}
          style={outfitStyles.addBtn}
        >
          <Icon name="plus" size={20} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* 场合筛选 */}
      <View style={outfitStyles.filterRow}>
        <GlassPill
          label="全部"
          active={!selectedOccasion}
          onPress={() => setSelectedOccasion(null)}
        />
        {occasions.map((occ: any) => (
          <GlassPill
            key={occ.id}
            label={occ.name}
            active={selectedOccasion === occ.id}
            onPress={() => setSelectedOccasion(occ.id)}
          />
        ))}
      </View>

      {/* 列表 */}
      <FlatList
        data={filtered}
        renderItem={renderOutfit}
        keyExtractor={item => item.id}
        numColumns={2}
        columnWrapperStyle={outfitStyles.listRow}
        contentContainerStyle={[outfitStyles.listContent, { paddingBottom: insets.bottom + 90 }]}
        ListEmptyComponent={
          <EmptyState
            icon="body-outline"
            title="还没有搭配"
            subtitle="创建第一个穿搭方案"
            actionLabel="新建搭配"
            onAction={() => nav.navigate('CreateOutfit', {})}
          />
        }
      />

      {/* FAB */}
      <FAB
        icon="plus" onPress={() => nav.navigate('CreateOutfit', {})}
        style={{ bottom: insets.bottom + 84 }}
      />
        </SafeAreaView>
    </GradientBackground>
  );
};

const outfitStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.card },
  topNav: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: SPACING.xl, paddingVertical: SPACING.sm,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.12)',
    gap: SPACING.md,
  },
  topNavTitle: {
    flex: 1, textAlign: 'center',
    fontSize: FONT_SIZES.xxl, fontWeight: '800',
    color: COLORS.textPrimary, letterSpacing: -0.5,
  },
  addBtn: {
    width: 38, height: 38, borderRadius: BORDER_RADIUS.md,
    backgroundColor: 'rgba(74,144,217,0.2)',
    justifyContent: 'center', alignItems: 'center',
  },
  filterRow: {
    flexDirection: 'row', flexWrap: 'wrap',
    padding: SPACING.lg, gap: SPACING.sm,
  },
  listContent: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.sm },
  listRow: { justifyContent: 'space-between', marginBottom: SPACING.md },
  outfitCard: { width: '48%' },
  coverRow: {
    height: 90, position: 'relative',
    borderRadius: BORDER_RADIUS.md, overflow: 'hidden',
    marginBottom: SPACING.sm,
  },
  thumb: {
    width: 80, height: 90,
    backgroundColor: 'rgba(255,255,255,0.65)',
    borderRadius: BORDER_RADIUS.md,
  },
  outfitInfo: {},
  outfitName: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.textPrimary },
  outfitOccasion: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary, marginTop: 2 },
});

export default OutfitScreen;
