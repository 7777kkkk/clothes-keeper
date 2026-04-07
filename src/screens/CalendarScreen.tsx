/**
 * CalendarScreen — 日历穿搭计划页 v2.0
 * 完全重构：紧凑导航、正方形日历格子、穿搭缩略图展示
 */
import React, { useState, useMemo, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Image,
  Modal, Dimensions, FlatList, Alert, Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons as Icon } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useStore } from '../store/useStore';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { GlassCard, FAB, GlassPill } from '../components/glass/GlassComponents';
import { GradientBackground } from '../components/glass/GradientBackground';
import { RootStackParamList } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MONTHS = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];

// 模拟天气数据（实际项目应对接真实API）
const MOCK_WEATHER = { icon: 'weather-sunny', temp: '26°C', condition: '晴' };

// ============================================================
//  主题色配置（日历v2专用）
// ============================================================
const CAL_COLORS = {
  primary: '#4A90D9',
  primaryDark: '#3A7BC8',
  background: '#F5F7FA',
  card: '#FFFFFF',
  textPrimary: '#333333',
  textSecondary: '#666666',
  textPlaceholder: '#999999',
  border: '#E8E8E8',
  divider: '#F0F0F0',
  error: '#FF6B6B',
  success: '#4CAF50',
  // 日历格子
  cellBg: '#FFFFFF',
  cellTodayBg: 'rgba(74, 144, 217, 0.1)',
  cellSelectedBg: '#4A90D9',
  cellOtherMonth: '#CCCCCC',
  cellText: '#333333',
  cellTextSelected: '#FFFFFF',
  cellTextToday: '#4A90D9',
  cellBorder: '#E8E8E8',
};

// ============================================================
//  MonthPicker Modal
// ============================================================
const MonthPickerModal = ({
  visible, year, month, onSelect, onClose,
}: {
  visible: boolean; year: number; month: number;
  onSelect: (y: number, m: number) => void;
  onClose: () => void;
}) => {
  const [selectedYear, setSelectedYear] = useState(year);
  const [selectedMonth, setSelectedMonth] = useState(month);

  const years = useMemo(() => {
    const current = new Date().getFullYear();
    return Array.from({ length: 10 }, (_, i) => current - 5 + i);
  }, []);

  const handleConfirm = () => {
    onSelect(selectedYear, selectedMonth);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={pickerStyles.overlay} activeOpacity={1} onPress={onClose}>
        <View style={pickerStyles.card} onStartShouldSetResponder={() => true}>
          {/* 标题栏 */}
          <View style={pickerStyles.header}>
            <TouchableOpacity onPress={onClose}>
              <Text style={pickerStyles.cancelText}>取消</Text>
            </TouchableOpacity>
            <Text style={pickerStyles.title}>选择年月</Text>
            <TouchableOpacity onPress={handleConfirm}>
              <Text style={pickerStyles.confirmText}>确定</Text>
            </TouchableOpacity>
          </View>

          {/* 选择器主体 */}
          <View style={pickerStyles.body}>
            {/* 年份选择 */}
            <View style={pickerStyles.pickerCol}>
              <Text style={pickerStyles.pickerLabel}>年</Text>
              <ScrollView style={pickerStyles.pickerScroll} showsVerticalScrollIndicator={false}>
                {years.map(y => (
                  <TouchableOpacity
                    key={y}
                    style={[pickerStyles.pickerItem, y === selectedYear && pickerStyles.pickerItemActive]}
                    onPress={() => setSelectedYear(y)}
                  >
                    <Text style={[pickerStyles.pickerItemText, y === selectedYear && pickerStyles.pickerItemTextActive]}>
                      {y}年
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* 月份选择 */}
            <View style={pickerStyles.pickerCol}>
              <Text style={pickerStyles.pickerLabel}>月</Text>
              <ScrollView style={pickerStyles.pickerScroll} showsVerticalScrollIndicator={false}>
                {MONTHS.map((m, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={[pickerStyles.pickerItem, idx === selectedMonth && pickerStyles.pickerItemActive]}
                    onPress={() => setSelectedMonth(idx)}
                  >
                    <Text style={[pickerStyles.pickerItemText, idx === selectedMonth && pickerStyles.pickerItemTextActive]}>
                      {m}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

// ============================================================
//  CalendarGrid — 核心日历网格
// ============================================================
const CalendarGrid = ({
  year, month, records, selected, onSelect, cellSize,
}: {
  year: number; month: number;
  records: { date: string; thumbnail?: string }[];
  selected: string | null;
  onSelect: (d: string) => void;
  cellSize: number;
}) => {
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  // 计算本月第一天是星期几
  const firstDay = new Date(year, month, 1).getDay();
  // 本月有多少天
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  // 上月有多少天（用于填充开头）
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  // 构建所有格子
  const cells: Array<{
    day: number;
    dateStr: string;
    isCurrentMonth: boolean;
    isToday: boolean;
    isSelected: boolean;
    record: { date: string; thumbnail?: string } | null;
  }> = [];

  // 上月的日期（灰色显示）
  for (let i = firstDay - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i;
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    const dateStr = `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    cells.push({ day: d, dateStr, isCurrentMonth: false, isToday: false, isSelected: false, record: null });
  }

  // 本月日期
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const record = records.find(r => r.date === dateStr) || null;
    cells.push({
      day: d,
      dateStr,
      isCurrentMonth: true,
      isToday: dateStr === todayStr,
      isSelected: dateStr === selected,
      record,
    });
  }

  // 下月的日期（填充到6行）
  const remaining = 42 - cells.length;
  for (let d = 1; d <= remaining; d++) {
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;
    const dateStr = `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    cells.push({ day: d, dateStr, isCurrentMonth: false, isToday: false, isSelected: false, record: null });
  }

  // 分割成6行
  const rows: typeof cells[] = [];
  for (let i = 0; i < cells.length; i += 7) {
    rows.push(cells.slice(i, i + 7));
  }

  const renderCell = (cell: typeof cells[0], colIdx: number) => {
    const isWeekend = colIdx === 0 || colIdx === 6;
    return (
      <TouchableOpacity
        key={cell.dateStr}
        activeOpacity={0.7}
        onPress={() => onSelect(cell.dateStr)}
        style={[
          cellStyles.cell,
          { width: cellSize, height: cellSize },
          cell.isSelected && cellStyles.cellSelected,
          cell.isToday && !cell.isSelected && cellStyles.cellToday,
          !cell.isCurrentMonth && cellStyles.cellOtherMonth,
        ]}
      >
        {/* 日期数字 */}
        <Text style={[
          cellStyles.dayText,
          cell.isSelected && cellStyles.dayTextSelected,
          cell.isToday && !cell.isSelected && cellStyles.dayTextToday,
          !cell.isCurrentMonth && cellStyles.dayTextOther,
          isWeekend && cell.isCurrentMonth && !cell.isSelected && { color: CAL_COLORS.error },
        ]}>
          {cell.day}
        </Text>

        {/* 今日标记 */}
        {cell.isToday && (
          <View style={cellStyles.todayBadge}>
            <Text style={cellStyles.todayBadgeText}>今</Text>
          </View>
        )}

        {/* 穿搭缩略图 */}
        {cell.record?.thumbnail && (
          <View style={cellStyles.thumbnailContainer}>
            <Image
              source={{ uri: cell.record.thumbnail }}
              style={cellStyles.thumbnail}
              resizeMode="cover"
            />
          </View>
        )}

        {/* 有记录但无缩略图时的圆点 */}
        {cell.record && !cell.record.thumbnail && (
          <View style={cellStyles.recordDot} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={cellStyles.grid}>
      {/* 星期标题行 */}
      <View style={[cellStyles.weekRow, { width: cellSize * 7 }]}>
        {WEEKDAYS.map((w, i) => (
          <View key={i} style={[cellStyles.weekCell, { width: cellSize }]}>
            <Text style={[
              cellStyles.weekText,
              (i === 0 || i === 6) && cellStyles.weekTextWeekend,
            ]}>{w}</Text>
          </View>
        ))}
      </View>

      {/* 日期格子 */}
      {rows.map((row, rowIdx) => (
        <View key={rowIdx} style={[cellStyles.row, { width: cellSize * 7 }]}>
          {row.map((cell, colIdx) => renderCell(cell, colIdx))}
        </View>
      ))}
    </View>
  );
};

// ============================================================
//  OutfitDetailCard — 穿搭详情卡片
// ============================================================
const OutfitDetailCard = ({
  record, clothingItems, weather, selectedDate, onAdd, onEdit,
}: {
  record: any;
  clothingItems: any[];
  weather: { icon: string; temp: string; condition: string };
  selectedDate: string;
  onAdd: () => void;
  onEdit: () => void;
}) => {
  const outfitItems = record?.itemIds
    ?.map((id: string) => clothingItems.find((i: any) => i.id === id))
    ?.filter(Boolean) || [];

  // 格式化日期显示
  const formatDate = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-');
    return `${parseInt(y)}年${parseInt(m)}月${parseInt(d)}日`;
  };

  return (
    <GlassCard style={detailStyles.card}>
      {/* 卡片头部 */}
      <View style={detailStyles.header}>
        <View style={detailStyles.headerLeft}>
          <Text style={detailStyles.dateText}>{formatDate(selectedDate)}</Text>
          <View style={detailStyles.weatherInfo}>
            <Icon name={weather.icon as any} size={16} color={CAL_COLORS.textSecondary} />
            <Text style={detailStyles.weatherTemp}>{weather.temp}</Text>
            <Text style={detailStyles.weatherCondition}>{weather.condition}</Text>
          </View>
        </View>
        {/* 只有一个编辑按钮 */}
        {outfitItems.length > 0 && (
          <TouchableOpacity style={detailStyles.editBtn} onPress={onEdit}>
            <Icon name="ellipsis-horizontal" size={20} color={CAL_COLORS.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* 空状态 */}
      {!record || outfitItems.length === 0 ? (
        <View style={detailStyles.empty}>
          <Icon name="shirt-outline" size={40} color={CAL_COLORS.textPlaceholder} />
          <Text style={detailStyles.emptyTitle}>暂无穿搭记录</Text>
          <Text style={detailStyles.emptySub}>添加今日穿搭</Text>
          <TouchableOpacity style={detailStyles.addBtn} onPress={onAdd}>
            <Icon name="add" size={16} color="#fff" />
            <Text style={detailStyles.addBtnText}>添加穿搭</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {/* 穿搭单品横向滚动 */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={detailStyles.itemsScroll}
            style={detailStyles.itemsContainer}
          >
            {outfitItems.map((item: any) => (
              <View key={item.id} style={detailStyles.itemWrap}>
                <Image
                  source={{ uri: item.images[0] }}
                  style={detailStyles.itemImage}
                  resizeMode="cover"
                />
                <Text style={detailStyles.itemName} numberOfLines={1}>
                  {item.name}
                </Text>
              </View>
            ))}
          </ScrollView>

          {/* 底部栏 */}
          <View style={detailStyles.footer}>
            <GlassPill label={`${outfitItems.length} 件单品`} size="sm" />
            <TouchableOpacity style={detailStyles.editLink} onPress={onAdd}>
              <Icon name="pencil-outline" size={14} color={CAL_COLORS.primary} />
              <Text style={detailStyles.editLinkText}>编辑</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </GlassCard>
  );
};

// ============================================================
//  AddOutfitModal — 添加穿搭弹窗
// ============================================================
const AddOutfitModal = ({
  visible, selectedDate, outfits, clothingItems, onSelectOutfit, onSelectItems, onClose,
}: {
  visible: boolean;
  selectedDate: string;
  outfits: any[];
  clothingItems: any[];
  onSelectOutfit: (outfitId: string, itemIds: string[]) => void;
  onSelectItems: (itemIds: string[]) => void;
  onClose: () => void;
}) => {
  const [tab, setTab] = useState<'outfits' | 'wardrobe'>('outfits');
  const [selectedWardrobe, setSelectedWardrobe] = useState<string[]>([]);

  const handleOutfitSelect = (outfit: any) => {
    onSelectOutfit(outfit.id, outfit.itemIds);
  };

  const handleWardrobeConfirm = () => {
    if (selectedWardrobe.length > 0) {
      onSelectItems(selectedWardrobe);
    }
  };

  const toggleWardrobeItem = (id: string) => {
    setSelectedWardrobe(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={addModalStyles.overlay}>
        <View style={addModalStyles.card}>
          {/* 顶部Tab */}
          <View style={addModalStyles.tabBar}>
            <TouchableOpacity
              style={[addModalStyles.tab, tab === 'outfits' && addModalStyles.tabActive]}
              onPress={() => setTab('outfits')}
            >
              <Text style={[addModalStyles.tabText, tab === 'outfits' && addModalStyles.tabTextActive]}>
                选择已有穿搭
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[addModalStyles.tab, tab === 'wardrobe' && addModalStyles.tabActive]}
              onPress={() => setTab('wardrobe')}
            >
              <Text style={[addModalStyles.tabText, tab === 'wardrobe' && addModalStyles.tabTextActive]}>
                从衣柜选择
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={addModalStyles.closeBtn} onPress={onClose}>
              <Icon name="close" size={20} color={CAL_COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* 内容区 */}
          {tab === 'outfits' ? (
            <ScrollView style={addModalStyles.content} showsVerticalScrollIndicator={false}>
              {outfits.length === 0 ? (
                <View style={addModalStyles.emptyState}>
                  <Icon name="layers-outline" size={40} color={CAL_COLORS.textPlaceholder} />
                  <Text style={addModalStyles.emptyText}>暂无穿搭</Text>
                </View>
              ) : (
                outfits.map(outfit => (
                  <TouchableOpacity
                    key={outfit.id}
                    style={addModalStyles.outfitItem}
                    onPress={() => handleOutfitSelect(outfit)}
                  >
                    {outfit.coverImage ? (
                      <Image source={{ uri: outfit.coverImage }} style={addModalStyles.outfitImg} />
                    ) : (
                      <View style={addModalStyles.outfitImgPlaceholder} />
                    )}
                    <View style={addModalStyles.outfitInfo}>
                      <Text style={addModalStyles.outfitName}>{outfit.name}</Text>
                      <Text style={addModalStyles.outfitCount}>{outfit.itemIds.length} 件单品</Text>
                    </View>
                    <Icon name="add-circle-outline" size={22} color={CAL_COLORS.primary} />
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          ) : (
            <>
              <ScrollView style={addModalStyles.content} showsVerticalScrollIndicator={false}>
                <Text style={addModalStyles.wardrobeHint}>
                  选择衣物后，可生成穿搭或直接记录（已选 {selectedWardrobe.length} 件）
                </Text>
                <View style={addModalStyles.wardrobeGrid}>
                  {clothingItems.filter((i: any) => !i.isDeleted).map((item: any) => (
                    <TouchableOpacity
                      key={item.id}
                      style={[
                        addModalStyles.wardrobeItem,
                        selectedWardrobe.includes(item.id) && addModalStyles.wardrobeItemSelected,
                      ]}
                      onPress={() => toggleWardrobeItem(item.id)}
                      activeOpacity={0.8}
                    >
                      <Image source={{ uri: item.images[0] }} style={addModalStyles.wardrobeImg} />
                      {selectedWardrobe.includes(item.id) && (
                        <View style={addModalStyles.wardrobeCheck}>
                          <Icon name="checkmark" size={10} color="#fff" />
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
              <TouchableOpacity
                style={[addModalStyles.confirmBtn, selectedWardrobe.length === 0 && addModalStyles.confirmBtnDisabled]}
                disabled={selectedWardrobe.length === 0}
                onPress={handleWardrobeConfirm}
              >
                <Text style={addModalStyles.confirmBtnText}>
                  确定{selectedWardrobe.length > 0 ? `（${selectedWardrobe.length}件）` : ''}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

// ============================================================
//  CalendarScreen
// ============================================================
const CalendarScreen = () => {
  const insets = useSafeAreaInsets();
  const nav = useNavigation<any>();
  const {
    calendarRecords, clothingItems, outfits,
    addCalendarRecord, incrementWearCount,
  } = useStore();

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selected, setSelected] = useState<string | null>(
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  );
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // 计算格子尺寸（正方形：行高=列宽）
  const PADDING_HORIZONTAL = SPACING.lg; // 页面左右边距
  const GRID_PADDING = SPACING.sm; // 日历网格内边距
  const CELL_GAP = 4; // 格子间距
  const WEEK_ROW_HEIGHT = 32; // 星期栏高度
  const availableWidth = SCREEN_WIDTH - PADDING_HORIZONTAL * 2 - GRID_PADDING * 2;
  const cellSize = (availableWidth - CELL_GAP * 6) / 7;

  // 当前选中日期的记录
  const currentRecord = useMemo(() =>
    selected ? calendarRecords.find(r => r.date === selected) || null : null,
    [selected, calendarRecords]
  );

  // 穿搭记录映射（用于日历格子显示缩略图）
  const recordMap = useMemo(() => {
    return calendarRecords.reduce((acc: any, record) => {
      const outfit = outfits.find(o => o.id === record.outfitId);
      let thumbnail: string | undefined;
      if (outfit?.coverImage) {
        thumbnail = outfit.coverImage;
      } else if (record.itemIds?.length > 0) {
        const firstItem = clothingItems.find(i => i.id === record.itemIds[0]);
        thumbnail = firstItem?.images?.[0];
      }
      acc[record.date] = { date: record.date, thumbnail };
      return acc;
    }, {} as Record<string, { date: string; thumbnail?: string }>);
  }, [calendarRecords, outfits, clothingItems]);

  // 月份切换
  const prevMonth = useCallback(() => {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
  }, [month]);

  const nextMonth = useCallback(() => {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
  }, [month]);

  const goToday = useCallback(() => {
    const t = new Date();
    setYear(t.getFullYear());
    setMonth(t.getMonth());
    const todayStr = `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
    setSelected(todayStr);
  }, []);

  const handleMonthSelect = useCallback((y: number, m: number) => {
    setYear(y);
    setMonth(m);
  }, []);

  // 添加穿搭记录
  const handleSelectOutfit = useCallback((outfitId: string, itemIds: string[]) => {
    if (!selected) return;
    addCalendarRecord({
      date: selected,
      outfitId,
      itemIds,
      notes: '',
    });
    incrementWearCount(itemIds);
    setShowAddModal(false);
  }, [selected, addCalendarRecord, incrementWearCount]);

  const handleSelectItems = useCallback((itemIds: string[]) => {
    if (!selected) return;
    Alert.alert(
      '穿搭记录',
      `已选 ${itemIds.length} 件衣物，如何处理？`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '生成穿搭',
          onPress: () => {
            setShowAddModal(false);
            nav.navigate('CreateOutfit', { preselectedItemIds: itemIds });
          },
        },
        {
          text: '直接记录',
          onPress: () => {
            addCalendarRecord({ date: selected, outfitId: null, itemIds, notes: '' });
            incrementWearCount(itemIds);
            setShowAddModal(false);
          },
        },
      ]
    );
  }, [selected, addCalendarRecord, incrementWearCount, nav]);

  // 最近的穿搭记录
  const recentRecords = useMemo(() =>
    [...calendarRecords].reverse().slice(0, 5),
    [calendarRecords]
  );

  return (
    <GradientBackground>
      <SafeAreaView style={[styles.container, { paddingTop: insets.top }]} edges={['top']}>
        {/* ========== 顶部导航栏 ========== */}
        <View style={styles.topNav}>
          {/* 左右切换箭头 */}
          <TouchableOpacity activeOpacity={0.75} onPress={prevMonth} style={styles.navArrow}>
            <Icon name="chevron-back" size={22} color={CAL_COLORS.textPrimary} />
          </TouchableOpacity>

          {/* 中间：月份+年份（可点击弹出选择器） */}
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => setShowMonthPicker(true)}
            style={styles.monthYearContainer}
          >
            <Text style={styles.monthText}>{MONTHS[month]}</Text>
            <Text style={styles.yearText}>{year}年</Text>
          </TouchableOpacity>

          {/* 右侧：今日按钮 */}
          <TouchableOpacity activeOpacity={0.75} onPress={goToday} style={styles.todayBtn}>
            <Text style={styles.todayBtnText}>今天</Text>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.75} onPress={nextMonth} style={styles.navArrow}>
            <Icon name="chevron-forward" size={22} color={CAL_COLORS.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* ========== 主内容区 ========== */}
        <ScrollView
          style={styles.mainScroll}
          contentContainerStyle={[
            styles.mainContent,
            { paddingBottom: insets.bottom + 100 }
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* 日历玻璃卡片 */}
          <GlassCard style={styles.calendarCard} padding="none">
            <CalendarGrid
              year={year}
              month={month}
              records={Object.values(recordMap)}
              selected={selected}
              onSelect={setSelected}
              cellSize={cellSize}
            />
          </GlassCard>

          {/* 穿搭详情卡片 */}
          {selected && (
            <OutfitDetailCard
              record={currentRecord}
              clothingItems={clothingItems}
              weather={MOCK_WEATHER}
              selectedDate={selected}
              onAdd={() => setShowAddModal(true)}
              onEdit={() => {
                if (currentRecord?.outfitId) {
                  nav.navigate('CreateOutfit', { outfitId: currentRecord.outfitId });
                } else {
                  setShowAddModal(true);
                }
              }}
            />
          )}

          {/* 最近穿搭记录 */}
          {recentRecords.length > 0 && (
            <View style={styles.historySection}>
              <Text style={styles.historyTitle}>最近穿搭</Text>
              {recentRecords.map(r => (
                <TouchableOpacity
                  key={r.id}
                  style={[
                    styles.historyItem,
                    r.date === selected && styles.historyItemActive,
                  ]}
                  onPress={() => setSelected(r.date)}
                  activeOpacity={0.75}
                >
                  <View style={styles.historyLeft}>
                    <Text style={styles.historyDate}>{r.date}</Text>
                    <Text style={styles.historyCount}>{r.itemIds?.length || 0} 件单品</Text>
                  </View>
                  {r.date === selected && (
                    <Icon name="checkmark-circle" size={18} color={CAL_COLORS.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>

        {/* ========== 悬浮添加按钮 ========== */}
        <FAB
          icon="add"
          onPress={() => setShowAddModal(true)}
          style={[styles.fab, { bottom: insets.bottom + 90 }]}
          color={CAL_COLORS.primary}
        />

        {/* ========== 月份选择弹窗 ========== */}
        <MonthPickerModal
          visible={showMonthPicker}
          year={year}
          month={month}
          onSelect={handleMonthSelect}
          onClose={() => setShowMonthPicker(false)}
        />

        {/* ========== 添加穿搭弹窗 ========== */}
        <AddOutfitModal
          visible={showAddModal}
          selectedDate={selected || ''}
          outfits={outfits}
          clothingItems={clothingItems}
          onSelectOutfit={handleSelectOutfit}
          onSelectItems={handleSelectItems}
          onClose={() => setShowAddModal(false)}
        />
      </SafeAreaView>
    </GradientBackground>
  );
};

// ============================================================
//  样式
// ============================================================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  // 顶部导航栏
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: CAL_COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: CAL_COLORS.border,
  },
  navArrow: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthYearContainer: {
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  monthText: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: CAL_COLORS.textPrimary,
    lineHeight: 26,
  },
  yearText: {
    fontSize: FONT_SIZES.xs,
    color: CAL_COLORS.textSecondary,
    lineHeight: 16,
  },
  todayBtn: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: 'rgba(74, 144, 217, 0.1)',
  },
  todayBtnText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: CAL_COLORS.primary,
  },

  // 主内容
  mainScroll: { flex: 1 },
  mainContent: {
    padding: SPACING.lg,
    gap: SPACING.lg,
  },

  // 日历卡片
  calendarCard: {
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
  },

  // 历史记录
  historySection: {
    gap: SPACING.xs,
  },
  historyTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: CAL_COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: CAL_COLORS.card,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: CAL_COLORS.border,
  },
  historyItemActive: {
    borderColor: CAL_COLORS.primary,
    backgroundColor: 'rgba(74, 144, 217, 0.05)',
  },
  historyLeft: {},
  historyDate: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: CAL_COLORS.textPrimary,
  },
  historyCount: {
    fontSize: FONT_SIZES.xs,
    color: CAL_COLORS.textSecondary,
    marginTop: 2,
  },

  // FAB
  fab: {
    position: 'absolute',
    right: SPACING.lg,
  },
});

// 日历格子样式
const cellStyles = StyleSheet.create({
  grid: {
    alignItems: 'center',
  },
  weekRow: {
    flexDirection: 'row',
    height: WEEK_ROW_HEIGHT,
    marginBottom: SPACING.xs,
  },
  weekCell: {
    height: WEEK_ROW_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  weekText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: CAL_COLORS.textSecondary,
  },
  weekTextWeekend: {
    color: CAL_COLORS.error,
  },
  row: {
    flexDirection: 'row',
    gap: CELL_GAP,
    marginBottom: CELL_GAP,
  },
  cell: {
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: CAL_COLORS.cellBg,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  cellSelected: {
    backgroundColor: CAL_COLORS.cellSelectedBg,
    borderColor: CAL_COLORS.primary,
  },
  cellToday: {
    backgroundColor: CAL_COLORS.cellTodayBg,
    borderColor: CAL_COLORS.primary,
  },
  cellOtherMonth: {
    backgroundColor: CAL_COLORS.divider,
  },
  dayText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: CAL_COLORS.cellText,
    marginLeft: 6,
    marginTop: 4,
  },
  dayTextSelected: {
    color: CAL_COLORS.cellTextSelected,
  },
  dayTextToday: {
    color: CAL_COLORS.cellTextToday,
    fontWeight: '700',
  },
  dayTextOther: {
    color: CAL_COLORS.cellOtherMonth,
  },
  todayBadge: {
    position: 'absolute',
    top: 3,
    right: 3,
    backgroundColor: CAL_COLORS.primary,
    borderRadius: 4,
    paddingHorizontal: 3,
    paddingVertical: 1,
  },
  todayBadgeText: {
    fontSize: 8,
    fontWeight: '700',
    color: '#fff',
  },
  thumbnailContainer: {
    position: 'absolute',
    top: 20,
    left: 4,
    right: 4,
    bottom: 4,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    borderRadius: BORDER_RADIUS.sm,
  },
  recordDot: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: CAL_COLORS.success,
  },
});

// 详情卡片样式
const detailStyles = StyleSheet.create({
  card: {
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  headerLeft: {},
  dateText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: CAL_COLORS.textPrimary,
  },
  weatherInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  weatherTemp: {
    fontSize: FONT_SIZES.sm,
    color: CAL_COLORS.textSecondary,
  },
  weatherCondition: {
    fontSize: FONT_SIZES.sm,
    color: CAL_COLORS.textSecondary,
  },
  editBtn: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: CAL_COLORS.divider,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // 空状态
  empty: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  emptyTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: CAL_COLORS.textSecondary,
    marginTop: SPACING.md,
  },
  emptySub: {
    fontSize: FONT_SIZES.xs,
    color: CAL_COLORS.textPlaceholder,
    marginTop: 4,
    marginBottom: SPACING.lg,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CAL_COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    gap: 5,
  },
  addBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: FONT_SIZES.sm,
  },

  // 穿搭单品
  itemsContainer: {
    marginVertical: SPACING.sm,
  },
  itemsScroll: {
    gap: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  itemWrap: {
    width: 80,
    alignItems: 'center',
  },
  itemImage: {
    width: 72,
    height: 72,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: CAL_COLORS.divider,
  },
  itemName: {
    fontSize: FONT_SIZES.xs,
    color: CAL_COLORS.textSecondary,
    marginTop: 4,
    textAlign: 'center',
    maxWidth: 72,
  },

  // 底部栏
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: CAL_COLORS.divider,
    marginTop: SPACING.sm,
  },
  editLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  editLinkText: {
    fontSize: FONT_SIZES.sm,
    color: CAL_COLORS.primary,
    fontWeight: '600',
  },
});

// 月份选择器样式
const pickerStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  card: {
    backgroundColor: CAL_COLORS.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '60%',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: CAL_COLORS.divider,
  },
  title: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: CAL_COLORS.textPrimary,
  },
  cancelText: {
    fontSize: FONT_SIZES.md,
    color: CAL_COLORS.textSecondary,
  },
  confirmText: {
    fontSize: FONT_SIZES.md,
    color: CAL_COLORS.primary,
    fontWeight: '600',
  },
  body: {
    flexDirection: 'row',
    padding: SPACING.lg,
    gap: SPACING.lg,
    maxHeight: 300,
  },
  pickerCol: {
    flex: 1,
  },
  pickerLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: CAL_COLORS.textSecondary,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  pickerScroll: {
    flex: 1,
  },
  pickerItem: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: 2,
  },
  pickerItemActive: {
    backgroundColor: 'rgba(74, 144, 217, 0.1)',
  },
  pickerItemText: {
    fontSize: FONT_SIZES.md,
    color: CAL_COLORS.textSecondary,
    textAlign: 'center',
  },
  pickerItemTextActive: {
    color: CAL_COLORS.primary,
    fontWeight: '600',
  },
});

// 添加穿搭弹窗样式
const addModalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  card: {
    backgroundColor: CAL_COLORS.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '75%',
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    backgroundColor: CAL_COLORS.divider,
  },
  tabActive: {
    backgroundColor: CAL_COLORS.primary,
  },
  tabText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: CAL_COLORS.textSecondary,
  },
  tabTextActive: {
    color: '#fff',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: CAL_COLORS.divider,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: SPACING.lg,
    right: SPACING.lg,
  },
  content: {
    maxHeight: 360,
    paddingHorizontal: SPACING.lg,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    gap: SPACING.sm,
  },
  emptyText: {
    fontSize: FONT_SIZES.sm,
    color: CAL_COLORS.textPlaceholder,
    marginTop: SPACING.sm,
  },
  outfitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: CAL_COLORS.divider,
    gap: SPACING.md,
  },
  outfitImg: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: CAL_COLORS.divider,
  },
  outfitImgPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: CAL_COLORS.divider,
  },
  outfitInfo: {
    flex: 1,
  },
  outfitName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: CAL_COLORS.textPrimary,
  },
  outfitCount: {
    fontSize: FONT_SIZES.xs,
    color: CAL_COLORS.textSecondary,
    marginTop: 2,
  },
  wardrobeHint: {
    fontSize: FONT_SIZES.sm,
    color: CAL_COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  wardrobeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  wardrobeItem: {
    width: 72,
    height: 72,
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  wardrobeItemSelected: {
    borderColor: CAL_COLORS.primary,
  },
  wardrobeImg: {
    width: 72,
    height: 72,
    backgroundColor: CAL_COLORS.divider,
  },
  wardrobeCheck: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: CAL_COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmBtn: {
    marginTop: SPACING.lg,
    marginHorizontal: SPACING.lg,
    backgroundColor: CAL_COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  confirmBtnDisabled: {
    backgroundColor: CAL_COLORS.divider,
  },
  confirmBtnText: {
    color: '#fff',
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
  },
});

export default CalendarScreen;
