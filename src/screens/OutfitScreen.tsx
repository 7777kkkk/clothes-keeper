import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useStore } from '../store/useStore';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { RootStackParamList, Outfit } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const OutfitScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const { outfits, occasions, clothingItems } = useStore();
  const [selectedOccasion, setSelectedOccasion] = useState<string | null>(null);

  const filteredOutfits = outfits.filter(outfit =>
    !selectedOccasion || outfit.occasions.includes(selectedOccasion)
  );

  const getOutfitItems = (itemIds: string[]) => {
    return clothingItems.filter(c => itemIds.includes(c.id));
  };

  const renderOutfit = ({ item }: { item: Outfit }) => {
    const items = getOutfitItems(item.itemIds);
    return (
      <TouchableOpacity
        style={styles.outfitCard}
        onPress={() => navigation.navigate('CreateOutfit', { outfitId: item.id })}
      >
        <View style={styles.outfitCover}>
          {items.slice(0, 4).map((c, i) => (
            <Image
              key={c.id}
              source={{ uri: c.images[0] }}
              style={[
                styles.outfitThumb,
                { position: 'absolute', left: i * 45, zIndex: 4 - i },
              ]}
            />
          ))}
        </View>
        <View style={styles.outfitInfo}>
          <Text style={styles.outfitName}>{item.name}</Text>
          <Text style={styles.outfitOccasions}>
            {item.occasions.map(id => occasions.find(o => o.id === id)?.name).join(', ')}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { paddingBottom: insets.bottom + 80 }]} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>我的搭配</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('CreateOutfit', {})}
        >
          <Text style={styles.addButtonText}>+ 新建</Text>
        </TouchableOpacity>
      </View>

      {/* 场合筛选 */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterChip, !selectedOccasion && styles.filterChipActive]}
          onPress={() => setSelectedOccasion(null)}
        >
          <Text style={[styles.filterText, !selectedOccasion && styles.filterTextActive]}>
            全部
          </Text>
        </TouchableOpacity>
        {occasions.map(occ => (
          <TouchableOpacity
            key={occ.id}
            style={[styles.filterChip, selectedOccasion === occ.id && styles.filterChipActive]}
            onPress={() => setSelectedOccasion(occ.id)}
          >
            <Text style={[styles.filterText, selectedOccasion === occ.id && styles.filterTextActive]}>
              {occ.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredOutfits}
        renderItem={renderOutfit}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>还没有搭配</Text>
            <Text style={styles.emptySubtext}>点击右上角创建你的第一套搭配</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.card,
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  addButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: FONT_SIZES.sm,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  filterChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  filterTextActive: {
    color: '#fff',
  },
  list: {
    padding: SPACING.md,
  },
  outfitCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
    padding: SPACING.md,
    ...SHADOWS.card,
  },
  outfitCover: {
    width: 140,
    height: 80,
    position: 'relative',
  },
  outfitThumb: {
    width: 50,
    height: 70,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.secondary,
  },
  outfitInfo: {
    flex: 1,
    marginLeft: SPACING.md,
    justifyContent: 'center',
  },
  outfitName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  outfitOccasions: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  emptySubtext: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
});

export default OutfitScreen;
