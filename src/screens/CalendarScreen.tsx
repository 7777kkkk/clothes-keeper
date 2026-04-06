import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useStore } from '../store/useStore';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../constants/theme';

const CalendarScreen = () => {
  const { calendarRecords, outfits, clothingItems } = useStore();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // 获取当前月份的日期
  const getDaysInMonth = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];

    // 添加空白填充
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push({ date: null, day: '' });
    }

    // 添加日期
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const record = calendarRecords.find(r => r.date === dateStr);
      days.push({ date: dateStr, day: i, hasRecord: !!record });
    }

    return days;
  };

  const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月',
    '七月', '八月', '九月', '十月', '十一月', '十二月'];
  const now = new Date();
  const currentMonth = monthNames[now.getMonth()];
  const days = getDaysInMonth();

  const getRecordForDate = (date: string | null) => {
    if (!date) return null;
    return calendarRecords.find(r => r.date === date);
  };

  const selectedRecord = selectedDate ? getRecordForDate(selectedDate) : null;
  const selectedOutfit = selectedRecord?.outfitId
    ? outfits.find(o => o.id === selectedRecord.outfitId)
    : null;
  const selectedItems = selectedRecord?.itemIds
    ? clothingItems.filter(c => selectedRecord.itemIds.includes(c.id))
    : [];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{currentMonth} 穿搭记录</Text>
      </View>

      {/* 日历网格 */}
      <View style={styles.calendar}>
        <View style={styles.weekRow}>
          {['日', '一', '二', '三', '四', '五', '六'].map((d, i) => (
            <Text key={i} style={styles.weekDay}>{d}</Text>
          ))}
        </View>
        <View style={styles.daysGrid}>
          {days.map((d, i) => (
            <TouchableOpacity
              key={i}
              style={[
                styles.dayCell,
                d.hasRecord && styles.dayCellHasRecord,
                selectedDate === d.date && styles.dayCellSelected,
              ]}
              onPress={() => d.date && setSelectedDate(d.date)}
              disabled={!d.date}
            >
              {d.day ? (
                <>
                  <Text style={[
                    styles.dayText,
                    d.hasRecord && styles.dayTextHasRecord,
                    selectedDate === d.date && styles.dayTextSelected,
                  ]}>
                    {d.day}
                  </Text>
                  {d.hasRecord && <View style={styles.dot} />}
                </>
              ) : null}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* 选中日期详情 */}
      {selectedDate && (
        <View style={styles.detailSection}>
          <Text style={styles.detailDate}>{selectedDate}</Text>
          {selectedRecord ? (
            <View>
              {selectedOutfit && (
                <View style={styles.recordCard}>
                  <Text style={styles.recordLabel}>✨ 搭配</Text>
                  <Text style={styles.recordValue}>{selectedOutfit.name}</Text>
                </View>
              )}
              {selectedItems.length > 0 && (
                <View style={styles.recordCard}>
                  <Text style={styles.recordLabel}>👔 单品</Text>
                  <Text style={styles.recordValue}>
                    {selectedItems.map(i => i.name).join('、')}
                  </Text>
                </View>
              )}
              {selectedRecord.notes && (
                <View style={styles.recordCard}>
                  <Text style={styles.recordLabel}>📝 备注</Text>
                  <Text style={styles.recordValue}>{selectedRecord.notes}</Text>
                </View>
              )}
            </View>
          ) : (
            <View style={styles.emptyRecord}>
              <Text style={styles.emptyRecordText}>这天没有穿搭记录</Text>
            </View>
          )}
        </View>
      )}

      {/* 提示 */}
      <View style={styles.tip}>
        <Text style={styles.tipText}>💡 点击日期可查看/添加当日穿搭记录</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: SPACING.lg,
    backgroundColor: COLORS.card,
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  calendar: {
    backgroundColor: COLORS.card,
    padding: SPACING.md,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    ...SHADOWS.card,
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: SPACING.sm,
  },
  weekDay: {
    flex: 1,
    textAlign: 'center',
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.sm,
  },
  dayCellHasRecord: {
    backgroundColor: COLORS.accent + '20',
  },
  dayCellSelected: {
    backgroundColor: COLORS.primary,
  },
  dayText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
  },
  dayTextHasRecord: {
    fontWeight: 'bold',
    color: COLORS.accent,
  },
  dayTextSelected: {
    color: '#fff',
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.accent,
    marginTop: 2,
  },
  detailSection: {
    margin: SPACING.lg,
    padding: SPACING.lg,
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.md,
    ...SHADOWS.card,
  },
  detailDate: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  recordCard: {
    marginBottom: SPACING.md,
  },
  recordLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  recordValue: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
  },
  emptyRecord: {
    padding: SPACING.lg,
    alignItems: 'center',
  },
  emptyRecordText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
  tip: {
    marginHorizontal: SPACING.lg,
    padding: SPACING.md,
    backgroundColor: COLORS.accent + '10',
    borderRadius: BORDER_RADIUS.sm,
  },
  tipText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});

export default CalendarScreen;
