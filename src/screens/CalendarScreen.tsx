/**
 * CalendarScreen — 日历穿搭计划页
 * 深色玻璃拟态，白色文字
 */
import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Image,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
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
            <TouchableOpacity key={c.dateStr} activeOpacity={0.7} onPress={() => onSelect(c.dateStr)} style={calStyles.dayCell}>
              <View style={[
                calStyles.dayInner,
                c.isSelected && calStyles.dayInnerSelected,
                c.isToday && !c.isSelected && calStyles.dayInnerToday,
              ]}>
                <Text style={[
                  calStyles.dayText,
                  c.isSelected && calStyles.dayTextSelected,
                  c.isToday && !c.isSelected && { color: COLORS.primary, fontWeight: '700' },
                ]}>{c.d}</Text>
              </View>
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
          <Icon name="hanger" size={36} color={'rgba(0,0,0,0.35)'} />
          <Text style={calStyles.detailEmptyTitle}>暂无穿搭记录</Text>
          <Text style={calStyles.detailEmptySub}>添加今日穿搭</Text>
          <TouchableOpacity style={calStyles.addBtn} onPress={onAdd}>
            <Icon name="plus" size={16} color="#fff" />
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
  const { calendarRecords, clothingItems } = useStore();

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selected, setSelected] = useState<string | null>(
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  );

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
          <Icon name="chevron-left" size={22} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={0.75} onPress={goToday}>
          <Text style={calStyles.monthTitle}>{year}年 {MONTHS[month]}</Text>
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={0.75} onPress={nextMonth} style={calStyles.navBtn}>
          <Icon name="chevron-right" size={22} color={COLORS.textPrimary} />
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
            onAdd={() => nav.navigate('CreateOutfit', {})}
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
                  {r.date === selected && <Icon name="check-circle" size={18} color={COLORS.primary} />}
                </View>
              </GlassCard>
            ))}
          </View>
        )}
      </ScrollView>

      {/* FAB */}
      <FAB
        icon="plus" onPress={() => nav.navigate('CreateOutfit', {})}
        style={{ bottom: insets.bottom + 84 }}
      />
        </SafeAreaView>
    </GradientBackground>
  );
};

// ============================================================
//  Styles
// ============================================================
const calStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.card },
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
  weekRow: { flexDirection: 'row', marginBottom: SPACING.sm },
  weekCell: { flex: 1, alignItems: 'center', paddingVertical: SPACING.xs },
  weekText: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.textSecondary },
  daysGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: {
    width: '14.28%', aspectRatio: 1,
    alignItems: 'center', justifyContent: 'center', position: 'relative',
  },
  dayInner: {
    width: 32, height: 32, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
  },
  dayInnerSelected: { backgroundColor: COLORS.primary },
  dayInnerToday: { borderWidth: 2, borderColor: COLORS.primary },
  dayText: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.textPrimary },
  dayTextSelected: { color: '#fff' },
  recordDot: {
    position: 'absolute', bottom: 3, width: 5, height: 5,
    borderRadius: 3, backgroundColor: COLORS.error,
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
});

export default CalendarScreen;
