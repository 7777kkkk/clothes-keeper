/**
 * CalendarScreen — 日历穿搭计划页
 *
 * 设计规范（遵循 impeccable Skill）:
 * - 玻璃拟态：亚克力毛玻璃卡片 + 柔和蓝调阴影
 * - 布局节奏：大间距通透，日历格子清晰不拥挤
 * - 交互反馈：选中日期高亮，操作有反馈
 * - 空状态：友好引导，非空白
 */
import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, Modal,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, CalendarRecord } from '../types';
import { useStore } from '../store/useStore';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { GlassCard, FAB, GlassPill } from '../components/glass/GlassComponents';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// 月份数据
const MONTH_NAMES = ['一月', '二月', '三月', '四月', '五月', '六月',
  '七月', '八月', '九月', '十月', '十一月', '十二月'];
const WEEKDAY_NAMES = ['日', '一', '二', '三', '四', '五', '六'];

// 模拟天气数据（实际项目中可接入天气API）
const MOCK_WEATHER: Record<string, { temp: string; icon: string }> = {
  'sunny': { temp: '26°C', icon: 'weather-sunny' },
  'cloudy': { temp: '22°C', icon: 'weather-cloudy' },
  'rainy': { temp: '18°C', icon: 'weather-rainy' },
  'windy': { temp: '20°C', icon: 'weather-windy' },
};

// ============================================================
//  CalendarGrid — 月份日历网格
// ============================================================
interface CalendarGridProps {
  year: number;
  month: number; // 0-indexed
  records: CalendarRecord[];
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
}

const CalendarGrid = ({
  year, month, records, selectedDate, onSelectDate,
}: CalendarGridProps) => {
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  // 获取当月天数
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // 构建日历格子
  const cells: Array<{
    dateStr: string | null;
    day: number | null;
    isToday: boolean;
    isSelected: boolean;
    hasRecord: boolean;
    outfitId: string | null;
  }> = [];

  // 空白填充
  for (let i = 0; i < firstDay; i++) {
    cells.push({ dateStr: null, day: null, isToday: false, isSelected: false, hasRecord: false, outfitId: null });
  }

  // 日期
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const record = records.find(r => r.date === dateStr);
    cells.push({
      dateStr,
      day: d,
      isToday: dateStr === todayStr,
      isSelected: dateStr === selectedDate,
      hasRecord: !!record,
      outfitId: record?.outfitId || null,
    });
  }

  return (
    <View style={calendarStyles.grid}>
      {/* 星期标题 */}
      <View style={calendarStyles.weekdayRow}>
        {WEEKDAY_NAMES.map((name, i) => (
          <View key={i} style={calendarStyles.weekdayCell}>
            <Text style={[calendarStyles.weekdayText, i === 0 && { color: COLORS.error }, i === 6 && { color: COLORS.accent }]}>
              {name}
            </Text>
          </View>
        ))}
      </View>

      {/* 日期网格 */}
      <View style={calendarStyles.daysGrid}>
        {cells.map((cell, idx) => {
          if (!cell.day) {
            return <View key={`empty-${idx}`} style={calendarStyles.dayCell} />;
          }
          return (
            <TouchableOpacity
              key={cell.dateStr!}
              activeOpacity={0.75}
              onPress={() => onSelectDate(cell.dateStr!)}
              style={[
                calendarStyles.dayCell,
                cell.isSelected && calendarStyles.dayCellSelected,
                cell.isToday && !cell.isSelected && calendarStyles.dayCellToday,
              ]}
            >
              <View style={[
                calendarStyles.dayInner,
                cell.isSelected && calendarStyles.dayInnerSelected,
                cell.isToday && !cell.isSelected && calendarStyles.dayInnerToday,
              ]}>
                <Text style={[
                  calendarStyles.dayText,
                  cell.isSelected && calendarStyles.dayTextSelected,
                  cell.isToday && !cell.isSelected && calendarStyles.dayTextToday,
                ]}>
                  {cell.day}
                </Text>
              </View>
              {/* 有穿搭记录小红点 */}
              {cell.hasRecord && !cell.isSelected && (
                <View style={calendarStyles.recordDot} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

// ============================================================
//  OutfitDetailCard — 穿搭详情卡片
// ============================================================
const OutfitDetailCard = ({
  record,
  clothingItems,
  weather,
  onAddOutfit,
  onViewOutfit,
}: {
  record: CalendarRecord | null;
  clothingItems: any[];
  weather: { temp: string; icon: string };
  onAddOutfit: () => void;
  onViewOutfit: () => void;
}) => {
  const outfitItems = record?.itemIds
    ?.map(id => clothingItems.find(i => i.id === id))
    .filter(Boolean) || [];

  if (!record || !record.itemIds?.length) {
    return (
      <GlassCard style={calendarStyles.detailCard}>
        <View style={calendarStyles.detailEmpty}>
          <Icon name="hanger" size={40} color={COLORS.textMuted} />
          <Text style={calendarStyles.detailEmptyTitle}>今日暂无穿搭记录</Text>
          <Text style={calendarStyles.detailEmptySub}>添加今日穿搭，开启穿搭计划</Text>
          <TouchableOpacity
            style={calendarStyles.addOutfitBtn}
            onPress={onAddOutfit}
          >
            <Icon name="plus" size={18} color="#fff" />
            <Text style={calendarStyles.addOutfitBtnText}>添加穿搭</Text>
          </TouchableOpacity>
        </View>
      </GlassCard>
    );
  }

  return (
    <GlassCard style={calendarStyles.detailCard}>
      {/* 日期标题 */}
      <View style={calendarStyles.detailHeader}>
        <View>
          <Text style={calendarStyles.detailDate}>{record.date}</Text>
          <View style={calendarStyles.weatherRow}>
            <Icon name={weather.icon as any} size={16} color={COLORS.textSecondary} />
            <Text style={calendarStyles.weatherTemp}>{weather.temp}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={onViewOutfit}>
          <Text style={calendarStyles.viewDetail}>查看详情</Text>
        </TouchableOpacity>
      </View>

      {/* 衣物缩略图网格 */}
      <View style={calendarStyles.thumbsGrid}>
        {outfitItems.slice(0, 6).map((item: any) => (
          <View key={item.id} style={calendarStyles.thumbItem}>
            <Image
              source={{ uri: item.images[0] }}
              style={calendarStyles.thumbImg}
              resizeMode="cover"
            />
            <Text style={calendarStyles.thumbName} numberOfLines={1}>{item.name}</Text>
          </View>
        ))}
      </View>

      {/* 穿搭次数标签 */}
      <View style={calendarStyles.detailFooter}>
        <GlassPill label={`${outfitItems.length} 件单品`} size="sm" />
        <TouchableOpacity
          style={calendarStyles.editOutfitBtn}
          onPress={onAddOutfit}
        >
          <Icon name="pencil-outline" size={14} color={COLORS.primary} />
          <Text style={calendarStyles.editOutfitText}>编辑</Text>
        </TouchableOpacity>
      </View>
    </GlassCard>
  );
};

// ============================================================
//  CalendarScreen — 主页面
// ============================================================
const CalendarScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { calendarRecords, clothingItems } = useStore();

  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  );

  const selectedRecord = useMemo(() =>
    selectedDate ? calendarRecords.find(r => r.date === selectedDate) || null : null,
    [selectedDate, calendarRecords]
  );

  // 月份切换
  const goToPrevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  };
  const goToNextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  };
  const goToToday = () => {
    const t = new Date();
    setViewYear(t.getFullYear());
    setViewMonth(t.getMonth());
    setSelectedDate(`${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`);
  };

  // 模拟天气（根据日期随机）
  const weatherKey = ['sunny', 'cloudy', 'rainy', 'windy'][Math.floor(Math.random() * 4)];
  const weather = MOCK_WEATHER[weatherKey];

  return (
    <SafeAreaView style={calendarStyles.container} edges={['top']}>
      {/* ===== 顶部导航栏 ===== */}
      <View style={calendarStyles.topNav}>
        <TouchableOpacity activeOpacity={0.75} onPress={goToPrevMonth} style={calendarStyles.navBtn}>
          <Icon name="chevron-left" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={0.75} onPress={goToToday}>
          <Text style={calendarStyles.monthTitle}>
            {viewYear}年 {MONTH_NAMES[viewMonth]}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={0.75} onPress={goToNextMonth} style={calendarStyles.navBtn}>
          <Icon name="chevron-right" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* ===== 主体内容 ===== */}
      <ScrollView
        style={calendarStyles.mainScroll}
        contentContainerStyle={[calendarStyles.mainContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ===== 日历玻璃卡片 ===== */}
        <GlassCard style={calendarStyles.calendarCard}>
          <CalendarGrid
            year={viewYear}
            month={viewMonth}
            records={calendarRecords}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
          />
        </GlassCard>

        {/* ===== 选中日期穿搭详情 ===== */}
        {selectedDate && (
          <OutfitDetailCard
            record={selectedRecord}
            clothingItems={clothingItems}
            weather={weather}
            onAddOutfit={() => navigation.navigate('CreateOutfit' as any)}
            onViewOutfit={() => {
              if (selectedRecord?.outfitId) {
                navigation.navigate('CreateOutfit' as any, { outfitId: selectedRecord.outfitId } as any);
              } else {
                navigation.navigate('CreateOutfit' as any);
              }
            }}
          />
        )}

        {/* ===== 历史穿搭记录列表 ===== */}
        {calendarRecords.length > 0 && (
          <View style={calendarStyles.historySection}>
            <Text style={calendarStyles.historyTitle}>最近穿搭</Text>
            {calendarRecords
              .slice(-7)
              .reverse()
              .map(record => (
                <GlassCard
                  key={record.id}
                  style={calendarStyles.historyItem}
                  padding="md"
                  onPress={() => setSelectedDate(record.date)}
                >
                  <View style={calendarStyles.historyItemRow}>
                    <View>
                      <Text style={calendarStyles.historyDate}>{record.date}</Text>
                      <Text style={calendarStyles.historyCount}>
                        {record.itemIds?.length || 0} 件单品
                      </Text>
                    </View>
                    {record.date === selectedDate && (
                      <Icon name="check-circle" size={20} color={COLORS.primary} />
                    )}
                  </View>
                </GlassCard>
              ))}
          </View>
        )}
      </ScrollView>

      {/* ===== 右下角 FAB ===== */}
      <FAB
        icon="plus"
        onPress={() => navigation.navigate('CreateOutfit', {})}
        style={{ bottom: insets.bottom + 90 }}
      />
    </SafeAreaView>
  );
};

// ============================================================
//  Styles — 玻璃拟态日历
// ============================================================
const calendarStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // ---- 顶部导航 ----
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.glass,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: SPACING.md,
  },
  monthTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  navBtn: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ---- 主体 ----
  mainScroll: { flex: 1 },
  mainContent: {
    padding: SPACING.lg,
    gap: SPACING.lg,
  },

  // ---- 日历玻璃卡片 ----
  calendarCard: {
    padding: SPACING.lg,
  },

  // ---- 日历网格 ----
  grid: {},
  weekdayRow: {
    flexDirection: 'row',
    marginBottom: SPACING.sm,
  },
  weekdayCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  weekdayText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  dayCellSelected: {},
  dayCellToday: {},
  dayInner: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayInnerSelected: {
    backgroundColor: COLORS.primary,
  },
  dayInnerToday: {
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  dayText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  dayTextSelected: {
    color: '#fff',
  },
  dayTextToday: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  recordDot: {
    position: 'absolute',
    bottom: 4,
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: COLORS.error,
  },

  // ---- 穿搭详情卡片 ----
  detailCard: {
    padding: SPACING.lg,
  },
  detailEmpty: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  detailEmptyTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
  },
  detailEmptySub: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
    marginBottom: SPACING.xl,
  },
  addOutfitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.full,
    gap: 6,
    ...SHADOWS.subtle,
  },
  addOutfitBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: FONT_SIZES.md,
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.lg,
  },
  detailDate: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  weatherRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  weatherTemp: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  viewDetail: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: '600',
  },
  thumbsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  thumbItem: {
    width: 72,
    alignItems: 'center',
  },
  thumbImg: {
    width: 60,
    height: 60,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  thumbName: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 3,
    textAlign: 'center',
  },
  detailFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.lg,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  editOutfitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  editOutfitText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: '600',
  },

  // ---- 历史记录 ----
  historySection: {
    gap: SPACING.sm,
  },
  historyTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  historyItem: {},
  historyItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyDate: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  historyCount: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
});

export default CalendarScreen;
