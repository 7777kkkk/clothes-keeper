/**
 * QuickAddModal — 便捷添加弹窗
 *
 * 通过剪贴板快速提取商品信息，支持：
 * - 自动读取剪贴板内容（商品链接/标题）
 * - 简化表单（名称+图片+品类+快速确认）
 * - 自动聚焦剪贴板内容
 */
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, Modal, TouchableOpacity,
  TextInput, Image, ScrollView, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons as Icon } from '@expo/vector-icons';
import { useStore } from '../store/useStore';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';
import { LiquidGlassCard } from './glass/LiquidGlassCard';
import { Season } from '../types';

const SEASONS: Season[] = ['春', '夏', '秋', '冬'];

interface Props {
  visible: boolean;
  onClose: () => void;
}

export const QuickAddModal = ({ visible, onClose }: Props) => {
  const { addClothingItem, categories } = useStore();
  const [name, setName] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [categoryId, setCategoryId] = useState('');
  const [brand, setBrand] = useState('');
  const [price, setPrice] = useState('');
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [clipboardText, setClipboardText] = useState('');

  // 每次打开时尝试读取剪贴板
  useEffect(() => {
    if (visible) {
      setName(''); setImages([]); setCategoryId(''); setBrand(''); setPrice(''); setSeasons([]);
      checkClipboard();
    }
  }, [visible]);

  const checkClipboard = async () => {
    try {
      const text = await Clipboard.getStringAsync();
      if (text && text.length > 3) {
        setClipboardText(text);
        // 如果剪贴板看起来像商品链接，尝试提取名称
        const urlMatch = text.match(/https?:\/\/[^\s]+/);
        if (urlMatch) {
          // 有URL，尝试解析
          setName(extractNameFromUrl(urlMatch[0]) || text.substring(0, 30));
        } else if (text.length < 100) {
          // 纯文本，假设是商品标题
          setName(text);
        }
      }
    } catch { /* ignore */ }
  };

  const extractNameFromUrl = (url: string): string => {
    // 简单提取URL中的关键词作为名称
    try {
      const u = new URL(url);
      const path = u.pathname.replace(/\//g, ' ').replace(/-/g, ' ');
      return path.trim().substring(0, 50) || url;
    } catch {
      return url.substring(0, 30);
    }
  };

  const pasteClipboard = async () => {
    const text = await Clipboard.getStringAsync();
    if (text) setName(text.substring(0, 100));
  };

  const pickImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });
    if (!result.canceled) {
      setImages(prev => [...prev, ...result.assets.map(a => a.uri)]);
    }
  };

  const removeImage = (idx: number) => setImages(prev => prev.filter((_, i) => i !== idx));
  const toggleSeason = (s: Season) =>
    setSeasons(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  const handleSave = () => {
    if (!name.trim()) { Alert.alert('请输入名称'); return; }
    if (images.length === 0) { Alert.alert('请添加至少一张图片'); return; }

    addClothingItem({
      name: name.trim(),
      images,
      categoryId: categoryId || categories[0]?.id || '',
      seasons,
      locationType: '家',
      locationDetail: '',
      brand: brand.trim(),
      price: parseFloat(price) || 0,
      purchaseDate: null,
      purchaseDateMode: 'full',
      notes: `快捷添加 | 剪贴板: ${clipboardText.substring(0, 50)}`,
      wearCount: 0,
      customAttributes: [],
    });

    Alert.alert('添加成功', '衣物已添加到衣橱', [{ text: '确定', onPress: onClose }]);
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView style={styles.modal} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* 顶部栏 */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Icon name="close" size={22} color={COLORS.textSecondary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>便捷添加</Text>
          <TouchableOpacity onPress={handleSave} style={styles.saveBtn}>
            <Text style={styles.saveBtnText}>保存</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
          {/* 剪贴板信息 */}
          {clipboardText.length > 0 && (
            <TouchableOpacity style={styles.clipboardBanner} onPress={pasteClipboard}>
              <Icon name="clipboard-outline" size={16} color={COLORS.primary} />
              <Text style={styles.clipboardText} numberOfLines={2}>
                检测到内容：{clipboardText.substring(0, 80)}
              </Text>
              <Text style={styles.clipboardAction}>点击填入</Text>
            </TouchableOpacity>
          )}

          {/* 名称 */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>名称 *</Text>
            <View style={styles.nameRow}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="自动从剪贴板填充或手动输入"
                placeholderTextColor={COLORS.textSecondary}
                value={name}
                onChangeText={setName}
              />
              <TouchableOpacity style={styles.pasteBtn} onPress={pasteClipboard}>
                <Icon name="clipboard-outline" size={20} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* 图片 */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>照片 *（{images.length}张）</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: SPACING.sm }}>
              {images.map((uri, idx) => (
                <View key={idx} style={styles.imgWrap}>
                  <Image source={{ uri }} style={styles.img} />
                  <TouchableOpacity style={styles.imgRemove} onPress={() => removeImage(idx)}>
                    <Icon name="close-circle" size={18} color={COLORS.error} />
                  </TouchableOpacity>
                </View>
              ))}
              <TouchableOpacity style={styles.addImg} onPress={pickImages}>
                <Icon name="add" size={24} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </ScrollView>
          </View>

          {/* 分类 */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>分类</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: SPACING.sm }}>
              {categories.map(cat => (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.catPill, categoryId === cat.id && styles.catPillActive]}
                  onPress={() => setCategoryId(cat.id)}
                >
                  <Text style={[styles.catPillText, categoryId === cat.id && styles.catPillTextActive]}>
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* 品牌 */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>品牌</Text>
            <TextInput
              style={styles.input}
              placeholder="可选，如：UNIQLO、Nike"
              placeholderTextColor={COLORS.textSecondary}
              value={brand}
              onChangeText={setBrand}
            />
          </View>

          {/* 价格 */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>价格</Text>
            <TextInput
              style={styles.input}
              placeholder="可选"
              placeholderTextColor={COLORS.textSecondary}
              keyboardType="numeric"
              value={price}
              onChangeText={setPrice}
            />
          </View>

          {/* 季节 */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>季节</Text>
            <View style={{ flexDirection: 'row', gap: SPACING.sm }}>
              {SEASONS.map(s => (
                <TouchableOpacity
                  key={s}
                  style={[styles.seasonPill, seasons.includes(s) && styles.seasonPillActive]}
                  onPress={() => toggleSeason(s)}
                >
                  <Text style={[styles.seasonPillText, seasons.includes(s) && styles.seasonPillTextActive]}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: SPACING.lg, paddingTop: SPACING.xl, paddingBottom: SPACING.md,
    borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.08)',
    gap: SPACING.md,
  },
  closeBtn: { width: 34, height: 34, borderRadius: BORDER_RADIUS.md, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: FONT_SIZES.lg, fontWeight: '800', color: COLORS.textPrimary },
  saveBtn: {
    backgroundColor: COLORS.primary, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.xs + 2,
    borderRadius: BORDER_RADIUS.md,
  },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: FONT_SIZES.sm },

  body: { padding: SPACING.lg, gap: SPACING.lg },

  clipboardBanner: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    backgroundColor: 'rgba(162,189,234,0.15)', borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md, borderWidth: 1, borderColor: COLORS.primary,
  },
  clipboardText: { flex: 1, fontSize: FONT_SIZES.xs, color: COLORS.textSecondary, numberOfLines: 2 },
  clipboardAction: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.primary },

  field: { gap: SPACING.sm },
  fieldLabel: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.textSecondary },
  nameRow: { flexDirection: 'row', gap: SPACING.sm },
  input: {
    backgroundColor: 'rgba(0,0,0,0.04)', borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
    fontSize: FONT_SIZES.md, color: COLORS.textPrimary,
    borderWidth: 1, borderColor: 'rgba(0,0,0,0.08)',
  },
  pasteBtn: {
    width: 48, height: 48, borderRadius: BORDER_RADIUS.md,
    backgroundColor: 'rgba(162,189,234,0.15)', justifyContent: 'center', alignItems: 'center',
  },

  imgWrap: { position: 'relative' },
  img: { width: 80, height: 80, borderRadius: BORDER_RADIUS.md },
  imgRemove: { position: 'absolute', top: -8, right: -8 },
  addImg: {
    width: 80, height: 80, borderRadius: BORDER_RADIUS.md,
    borderWidth: 2, borderColor: 'rgba(0,0,0,0.12)', borderStyle: 'dashed',
    justifyContent: 'center', alignItems: 'center',
  },

  catPill: {
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full, backgroundColor: 'rgba(0,0,0,0.07)',
  },
  catPillActive: { backgroundColor: 'rgba(162,189,234,0.2)', borderWidth: 1, borderColor: COLORS.primary },
  catPillText: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.textSecondary },
  catPillTextActive: { color: COLORS.primary },

  seasonPill: {
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full, backgroundColor: 'rgba(0,0,0,0.07)',
  },
  seasonPillActive: { backgroundColor: 'rgba(162,189,234,0.2)', borderWidth: 1, borderColor: COLORS.primary },
  seasonPillText: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.textSecondary },
  seasonPillTextActive: { color: COLORS.primary },
});
