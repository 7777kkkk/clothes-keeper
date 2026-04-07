/**
 * CalendarScreen — 日历穿搭计划页
 * 深色玻璃拟态，白色文字
 */
import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, Modal,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons as Icon } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useStore } from '../store/useStore';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { GlassCard, FAB, GlassPill } from '../components/glass/GlassComponents';
import { GradientBackground } from '../components/glass/GradientBackground';
import { RootStackParamList } from '../types';

const MONTHS = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];
const WEATHER_LIST = [
  { icon: 'weather-sunny', temp: '26°C' },
  { icon: 'weather-partly-cloudy', temp: '23°C' },
  { icon: 'weather-cloudy', temp: '20°C' },
  { icon: 'weather-rainy', temp: '18°C' },
];

// ============================================================
//  CalendarGrid
// ============================================================
const CalendarGrid = ({
  year, month, records, selected, onSelect,
}: {
  year: number; month: number;
  records: any[]; selected: string | null;
  onSelect: (d: string) => void;
}) => {
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: Array<{ d: number; dateStr: string; isToday: boolean; isSelected: boolean; hasRecord: boolean }> = [];
  for (let i = 0; i < firstDay; i++) cells.push({ d: 0, dateStr: '', isToday: false, isSelected: false, hasRecord: false });
  for (let i = 1; i <= daysInMonth; i++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    cells.push({
      d: i, dateStr,
      isToday: dateStr === todayStr,
      isSelected: dateStr === selected,
      hasRecord: !!records.find(r => r.date === dateStr),
    });
  }

  return (
    <View style={calStyles.grid}>
      {/* 星期标题 */}
      <View style={calStyles.weekRow}>
        {WEEKDAYS.map((w, i) => (
          <View key={i} style={calStyles.weekCell}>
            <Text style={[calStyles.weekText, i === 0 && { color: COLORS.error }, i === 6 && { color: COLORS.accent }]}>{w}</Text>
          </View>
        ))}
      </View>
      {/* 日期格子 */}
      <View style={calStyles.daysGrid}>
        {cells.map((c, idx) => {
          if (!c.d) return <View key={`e${idx}`} style={calStyles.dayCell} />;
          return (
            <TouchableOpacity key={c.dateStr} activeOpacity={0.7} onPress={() => onSelect(c.dateStr)} style={[
              calStyles.dayCell,
              c.isSelected && calStyles.dayCellSelected,
              c.isToday && !c.isSelected && calStyles.dayCellToday,
            ]}>
              <Text style={[
                calStyles.dayText,
                c.isSelected && calStyles.dayTextSelected,
                c.isToday && !c.isSelected && { color: COLORS.primary, fontWeight: '700' },
              ]}>{c.d}</Text>
              {c.hasRecord && !c.isSelected && <View style={calStyles.recordDot} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

// ============================================================
//  OutfitDetailCard
// ============================================================
const OutfitDetailCard = ({
  record, clothingItems, weather, onAdd, onEdit,
}: {
  record: any; clothingItems: any[]; weather: { icon: string; temp: string };
  onAdd: () => void; onEdit: () => void;
}) => {
  const outfitItems = record?.itemIds?.map((id: string) => clothingItems.find((i: any) => i.id === id)).filter(Boolean) || [];

  if (!record || !record.itemIds?.length) {
    return (
      <GlassCard style={calStyles.detailCard}>
        <View style={calStyles.detailEmpty}>
          <Icon name="shirt-outline" size={36} color={'rgba(0,0,0,0.35)'} />
          <Text style={calStyles.detailEmptyTitle}>暂无穿搭记录</Text>
          <Text style={calStyles.detailEmptySub}>添加今日穿搭</Text>
          <TouchableOpacity style={calStyles.addBtn} onPress={onAdd}>
            <Icon name="add" size={16} color="#fff" />
            <Text style={calStyles.addBtnText}>添加穿搭</Text>
          </TouchableOpacity>
        </View>
      </GlassCard>
    );
  }

  return (
    <GlassCard style={calStyles.detailCard}>
      <View style={calStyles.detailHeader}>
        <View>
          <Text style={calStyles.detailDate}>{record.date}</Text>
          <View style={calStyles.weatherRow}>
            <Icon name={weather.icon as any} size={15} color={COLORS.textSecondary} />
            <Text style={calStyles.weatherTemp}>{weather.temp}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={onEdit}>
          <Text style={calStyles.editLink}>编辑</Text>
        </TouchableOpacity>
      </View>

      <View style={calStyles.thumbsGrid}>
        {outfitItems.slice(0, 6).map((item: any) => (
          <View key={item.id} style={calStyles.thumbItem}>
            <Image source={{ uri: item.images[0] }} style={calStyles.thumbImg} resizeMode="cover" />
            <Text style={calStyles.thumbName} numberOfLines={1}>{item.name}</Text>
          </View>
        ))}
      </View>

      <View style={calStyles.detailFooter}>
        <GlassPill label={`${outfitItems.length} 件单品`} size="sm" />
        <TouchableOpacity style={calStyles.editBtn} onPress={onAdd}>
          <Icon name="pencil-outline" size={13} color={COLORS.primary} />
          <Text style={calStyles.editBtnText}>编辑</Text>
        </TouchableOpacity>
      </View>
    </GlassCard>
  );
};

// ============================================================
//  CalendarScreen
// ============================================================
const CalendarScreen = () => {
  const insets = useSafeAreaInsets();
  const nav = useNavigation<any>();
  const { calendarRecords, clothingItems, outfits, addCalendarRecord } = useStore();

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selected, setSelected] = useState<string | null>(
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  );

  // 今日穿搭选择 Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [addTab, setAddTab] = useState<'outfits' | 'wardrobe'>('outfits');
  const [wardrobeSelected, setWardrobeSelected] = useState<string[]>([]);

  const record = useMemo(() =>
    selected ? calendarRecords.find(r => r.date === selected) || null : null,
    [selected, calendarRecords]
  );

  const weather = WEATHER_LIST[Math.floor(Math.random() * WEATHER_LIST.length)];

  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
  };
  const goToday = () => {
    const t = new Date();
    setYear(t.getFullYear());
    setMonth(t.getMonth());
    setSelected(`${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`);
  };

  const recentRecords = useMemo(() => calendarRecords.slice(-5).reverse(), [calendarRecords]);

  return (
    <GradientBackground>
    <SafeAreaView style={[calStyles.container, { paddingTop: insets.top }]} edges={['top']}>
      {/* Top Nav */}
      <View style={calStyles.topNav}>
        <TouchableOpacity activeOpacity={0.75} onPress={prevMonth} style={calStyles.navBtn}>
          <Icon name="chevron-back" size={22} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={0.75} onPress={goToday}>
          <Text style={calStyles.monthTitle}>{year}年 {MONTHS[month]}</Text>
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={0.75} onPress={nextMonth} style={calStyles.navBtn}>
          <Icon name="chevron-forward" size={22} color={COLORS.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={calStyles.mainScroll}
        contentContainerStyle={[calStyles.mainContent, { paddingBottom: insets.bottom + 90 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* 日历玻璃卡片 */}
        <GlassCard style={calStyles.calendarCard} padding="lg">
          <CalendarGrid
            year={year} month={month}
            records={calendarRecords}
            selected={selected}
            onSelect={setSelected}
          />
        </GlassCard>

        {/* 穿搭详情 */}
        {selected && (
          <OutfitDetailCard
            record={record}
            clothingItems={clothingItems}
            weather={weather}
            onAdd={() => setShowAddModal(true)}
            onEdit={() => nav.navigate('CreateOutfit', record?.outfitId ? { outfitId: record.outfitId } : {})}
          />
        )}

        {/* 历史记录 */}
        {recentRecords.length > 0 && (
          <View style={calStyles.historySection}>
            <Text style={calStyles.historyTitle}>最近穿搭</Text>
            {recentRecords.map(r => (
              <GlassCard
                key={r.id} style={calStyles.historyItem} padding="md"
                onPress={() => setSelected(r.date)}
              >
                <View style={calStyles.historyRow}>
                  <View>
                    <Text style={calStyles.historyDate}>{r.date}</Text>
                    <Text style={calStyles.historyCount}>{r.itemIds?.length || 0} 件单品</Text>
                  </View>
                  {r.date === selected && <Icon name="checkmark-circle" size={18} color={COLORS.primary} />}
                </View>
              </GlassCard>
            ))}
          </View>
        )}
      </ScrollView>

      {/* FAB */}
      <FAB
        icon="add" onPress={() => setShowAddModal(true)}
        style={{ position: 'absolute', right: 20, bottom: insets.bottom + 84 }}
      />

      {/* 今日穿搭选择 Modal */}
      <Modal visible={showAddModal} transparent animationType="fade" onRequestClose={() => setShowAddModal(false)}>
        <View style={calStyles.addModalOverlay}>
          <View style={calStyles.addModalCard}>
            {/* 顶部 Tab */}
            <View style={calStyles.addModalTabs}>
              <TouchableOpacity
                style={[calStyles.addModalTab, addTab === 'outfits' && calStyles.addModalTabActive]}
                onPress={() => setAddTab('outfits')}
              >
                <Text style={[calStyles.addModalTabText, addTab === 'outfits' && calStyles.addModalTabTextActive]}>选择已有穿搭</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[calStyles.addModalTab, addTab === 'wardrobe' && calStyles.addModalTabActive]}
                onPress={() => setAddTab('wardrobe')}
              >
                <Text style={[calStyles.addModalTabText, addTab === 'wardrobe' && calStyles.addModalTabTextActive]}>从衣柜选择</Text>
              </TouchableOpacity>
            </View>

            {/* 已有穿搭列表 */}
            {addTab === 'outfits' && (
              <ScrollView style={calStyles.addModalScroll} showsVerticalScrollIndicator={false}>
                {outfits.length === 0 ? (
                  <View style={calStyles.addModalEmpty}>
                    <Icon name="layers-outline" size={40} color="rgba(0,0,0,0.15)" />
                    <Text style={calStyles.addModalEmptyText}>暂无穿搭</Text>
                    <TouchableOpacity
                      style={calStyles.addModalActionBtn}
                      onPress={() => { setShowAddModal(false); nav.navigate('CreateOutfit', {}); }}
                    >
                      <Text style={calStyles.addModalActionBtnText}>去创建</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  outfits.map(outfit => (
                    <TouchableOpacity
                      key={outfit.id}
                      style={calStyles.addModalOutfitItem}
                      onPress={() => {
                        setShowAddModal(false);
                        if (selected) {
                          addCalendarRecord({
                            date: selected,
                            outfitId: outfit.id,
                            itemIds: outfit.itemIds,
                            notes: '',
                          });
                        }
                      }}
                    >
                      {outfit.coverImage ? (
                        <Image source={{ uri: outfit.coverImage }} style={calStyles.addModalOutfitImg} />
                      ) : (
                        <View style={calStyles.addModalOutfitImgPlaceholder} />
                      )}
                      <View style={calStyles.addModalOutfitInfo}>
                        <Text style={calStyles.addModalOutfitName}>{outfit.name}</Text>
                        <Text style={calStyles.addModalOutfitCount}>{outfit.itemIds.length} 件单品</Text>
                      </View>
                      <Icon name="add-circle-outline" size={22} color={COLORS.primary} />
                    </TouchableOpacity>
                  ))
                )}
              </ScrollView>
            )}

            {/* 从衣柜选择 */}
            {addTab === 'wardrobe' && (
              <>
                <ScrollView style={calStyles.addModalScroll} showsVerticalScrollIndicator={false}>
                  <Text style={calStyles.addModalWardrobeHint}>选择衣物后，可生成穿搭或直接记录</Text>
                  <View style={calStyles.addModalWardrobeGrid}>
                    {clothingItems.filter(i => !i.isDeleted).map(item => (
                      <TouchableOpacity
                        key={item.id}
                        style={[
                          calStyles.addModalWardrobeItem,
                          wardrobeSelected.includes(item.id) && calStyles.addModalWardrobeItemSelected,
                        ]}
                        onPress={() => {
                          setWardrobeSelected(prev =>
                            prev.includes(item.id) ? prev.filter(id => id !== item.id) : [...prev, item.id]
                          );
                        }}
                      >
                        <Image source={{ uri: item.images[0] }} style={calStyles.addModalWardrobeImg} />
                        {wardrobeSelected.includes(item.id) && (
                          <View style={calStyles.addModalWardrobeCheck}>
                            <Icon name="checkmark" size={12} color="#fff" />
                          </View>
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
                <TouchableOpacity
                  style={[
                    calStyles.addModalConfirmBtn,
                    wardrobeSelected.length === 0 && calStyles.addModalConfirmBtnDisabled,
                  ]}
                  disabled={wardrobeSelected.length === 0}
                  onPress={() => {
                    if (!selected) return;
                    setShowAddModal(false);
                    Alert.alert(
                      '穿搭记录',
                      `已选 ${wardrobeSelected.length} 件衣物，如何处理？`,
                      [
                        {
                          text: '取消',
                          style: 'cancel',
                        },
                        {
                          text: '生成穿搭',
                          onPress: () => {
                            setWardrobeSelected([]);
                            nav.navigate('CreateOutfit', { preselectedItemIds: wardrobeSelected });
                          },
                        },
                        {
                          text: '直接记录',
                          onPress: () => {
                            addCalendarRecord({
                              date: selected,
                              outfitId: null,
                              itemIds: wardrobeSelected,
                              notes: '',
                            });
                            setWardrobeSelected([]);
                          },
                        },
                      ]
                    );
                  }}
                >
                  <Text style={calStyles.addModalConfirmBtnText}>
                    确定{wardrobeSelected.length > 0 ? `（${wardrobeSelected.length}件）` : ''}
                  </Text>
                </TouchableOpacity>
              </>
            )}

            {/* 关闭按钮 */}
            <TouchableOpacity style={calStyles.addModalClose} onPress={() => { setShowAddModal(false); setWardrobeSelected([]); }}>
              <Icon name="close" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
        </SafeAreaView>
    </GradientBackground>
  );
};

// ============================================================
//  Styles
// ============================================================
const calStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  topNav: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.xl, paddingVertical: SPACING.sm,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.12)',
  },
  monthTitle: { fontSize: FONT_SIZES.xl, fontWeight: '700', color: COLORS.textPrimary },
  navBtn: { width: 38, height: 38, borderRadius: BORDER_RADIUS.md, justifyContent: 'center', alignItems: 'center' },

  mainScroll: { flex: 1 },
  mainContent: { padding: SPACING.lg, gap: SPACING.lg },

  calendarCard: { padding: SPACING.lg },
  grid: {},
  weekRow: { flexDirection: 'row', marginBottom: SPACING.xs },
  weekCell: { flex: 1, alignItems: 'center', paddingVertical: SPACING.xs },
  weekText: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.textSecondary },
  daysGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  dayCell: {
    width: '13.5%',
    aspectRatio: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.70)',
    borderRadius: 10,
    position: 'relative',
    paddingTop: 6,
    paddingHorizontal: 4,
  },
  dayCellSelected: { backgroundColor: COLORS.primary },
  dayCellToday: { borderWidth: 2, borderColor: COLORS.primary },
  dayText: {
    fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.textPrimary,
    textAlign: 'center',
    paddingTop: 0,
  },
  dayTextSelected: { color: '#fff' },
  recordDot: {
    position: 'absolute', bottom: 4, right: 4,
    width: 5, height: 5, borderRadius: 3, backgroundColor: COLORS.error,
  },

  // Detail Card
  detailCard: { padding: SPACING.lg },
  detailEmpty: { alignItems: 'center', paddingVertical: SPACING.xl },
  detailEmptyTitle: { fontSize: FONT_SIZES.md, fontWeight: '600', color: COLORS.textSecondary, marginTop: SPACING.md },
  detailEmptySub: { fontSize: FONT_SIZES.xs, color: 'rgba(0,0,0,0.35)', marginTop: 3, marginBottom: SPACING.lg },
  addBtn: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl, paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full, gap: 5, ...SHADOWS.subtle,
  },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: FONT_SIZES.sm },
  detailHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  detailDate: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.textPrimary },
  weatherRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  weatherTemp: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary },
  editLink: { fontSize: FONT_SIZES.sm, color: COLORS.primary, fontWeight: '600' },
  thumbsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  thumbItem: { width: 64, alignItems: 'center' },
  thumbImg: { width: 56, height: 56, borderRadius: BORDER_RADIUS.md, backgroundColor: 'rgba(255,255,255,0.65)' },
  thumbName: { fontSize: 9, color: COLORS.textSecondary, marginTop: 3, textAlign: 'center' },
  detailFooter: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginTop: SPACING.md, paddingTop: SPACING.md, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.12)',
  },
  editBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  editBtnText: { fontSize: FONT_SIZES.sm, color: COLORS.primary, fontWeight: '600' },

  // History
  historySection: { gap: SPACING.sm },
  historyTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.textPrimary, marginBottom: SPACING.xs },
  historyItem: { padding: SPACING.md },
  historyRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  historyDate: { fontSize: FONT_SIZES.md, fontWeight: '600', color: COLORS.textPrimary },
  historyCount: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary, marginTop: 2 },

  // Add Modal
  addModalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  addModalCard: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    maxHeight: '75%',
    paddingTop: SPACING.xl,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  addModalTabs: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.06)',
    borderRadius: BORDER_RADIUS.md,
    padding: 3,
    marginBottom: SPACING.lg,
  },
  addModalTab: {
    flex: 1, paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    alignItems: 'center',
  },
  addModalTabActive: { backgroundColor: '#fff' },
  addModalTabText: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.textSecondary },
  addModalTabTextActive: { color: COLORS.textPrimary },
  addModalScroll: { maxHeight: 360 },
  addModalEmpty: { alignItems: 'center', paddingVertical: SPACING.xl, gap: SPACING.sm },
  addModalEmptyText: { fontSize: FONT_SIZES.sm, color: 'rgba(0,0,0,0.25)', marginTop: SPACING.sm },
  addModalActionBtn: {
    marginTop: SPACING.md,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl, paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
  },
  addModalActionBtnText: { color: '#fff', fontWeight: '700', fontSize: FONT_SIZES.sm },
  addModalOutfitItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.06)',
    gap: SPACING.md,
  },
  addModalOutfitImg: {
    width: 48, height: 48, borderRadius: BORDER_RADIUS.md,
    backgroundColor: 'rgba(0,0,0,0.08)',
  },
  addModalOutfitImgPlaceholder: {
    width: 48, height: 48, borderRadius: BORDER_RADIUS.md,
    backgroundColor: 'rgba(0,0,0,0.08)',
  },
  addModalOutfitInfo: { flex: 1 },
  addModalOutfitName: { fontSize: FONT_SIZES.md, fontWeight: '600', color: COLORS.textPrimary },
  addModalOutfitCount: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary, marginTop: 2 },
  addModalWardrobeHint: {
    fontSize: FONT_SIZES.sm, color: COLORS.textSecondary,
    marginBottom: SPACING.md, textAlign: 'center',
  },
  addModalWardrobeGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm,
  },
  addModalWardrobeItem: {
    width: 72, height: 72,
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
    borderWidth: 2, borderColor: 'transparent',
  },
  addModalWardrobeItemSelected: {
    borderColor: COLORS.primary,
  },
  addModalWardrobeImg: {
    width: 72, height: 72, backgroundColor: 'rgba(0,0,0,0.08)',
  },
  addModalWardrobeCheck: {
    position: 'absolute', top: 4, right: 4,
    width: 18, height: 18, borderRadius: 9,
    backgroundColor: COLORS.primary,
    justifyContent: 'center', alignItems: 'center',
  },
  addModalConfirmBtn: {
    marginTop: SPACING.lg,
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  addModalConfirmBtnDisabled: {
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  addModalConfirmBtnText: {
    color: '#fff', fontSize: FONT_SIZES.md, fontWeight: '700',
  },
  addModalClose: {
    position: 'absolute', top: SPACING.md, right: SPACING.lg,
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.08)',
    justifyContent: 'center', alignItems: 'center',
  },
});

export default CalendarScreen;
