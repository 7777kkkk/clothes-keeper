# ClothesKeeper 需求快照

> 基于 2026-04-06 对话生成。覆盖所有核心需求、UI 规范、功能要求、代码约束。

---

## 1. 项目基础

| 项目 | 内容 |
|------|------|
| 名称 | ClothesKeeper 电子衣柜 App |
| 平台 | React Native (Expo)，iOS & Android |
| 目录 | `/home/alluki/clothes-keeper` |
| 仓库 | `https://github.com/7777kkkk/clothes-keeper` |

### 技术栈
- **框架**: Expo + React Native + TypeScript
- **状态管理**: Zustand
- **本地存储**: AsyncStorage
- **导航**: React Navigation 6（底部 Tab + Stack）

### 已完成
10 个核心功能均已实现（衣橱/搭配/日历/统计/设置 + CRUD + Zustand + AsyncStorage）

### 待完成（待办清单）
1. Empty State 样式优化
2. 日历添加穿搭记录功能（目前仅展示）
3. 图片存储方案（当前用 URI）
4. 悬浮窗快捷添加（v2.0，暂不列入）

---

## 2. UI 规范

### 2.1 配色（Glassmorphism 风格）
```
背景渐变: #dbeaff → #d8f2fc → #e1f8f6 → #f0fcf3 → #fefff7
卡片:      rgba(255,255,255,0.85)
主文字:    #FFFFFF
次文字:    #CCE1FF
悬浮按钮:  #A2BDEA
强调色:    #4A90D9（primary）、#5AC8FA（accent）
错误:      #FF6B6B、成功: #4CAF50、警告: #FFB74D
```

### 2.2 间距系统
```
基础单位: 4px
常用:     8 / 14 / 20 / 28 / 36 / 48
```

### 2.3 圆角
```
强制大圆角: 18px（lg）
其他:       10 / 14 / 24 / 9999
```

### 2.4 阴影
```
卡片: rgba(0,0,0,0.10), height:2, radius:8, elevation:3
玻璃: rgba(0,0,0,0.08), height:3, radius:10, elevation:4
FAB:  rgba(0,0,0,0.18), height:4, radius:10, elevation:6
```

### 2.5 字体
```
系统默认（iOS: SF Pro, Android: Roboto）
标题: Bold, 18-24px / 正文: Regular, 14-16px
```

### 2.6 导航结构
```
5 Tab: 衣橱(Home) | 搭配(Outfit) | 日历(Calendar) | 统计(Stats) | 我的(My)
Stack: AddClothing / ClothingDetail / CreateOutfit / CategoryManage / OccasionManage
```

---

## 3. 数据模型

### 3.1 ClothingItem（衣物单品）
```
必填: name, images(最多9张), categoryId
选填: seasons(多选:春夏秋冬), locationType(家/学校), locationDetail,
      brand, price, purchaseDate(支持仅年份模式), notes, customAttributes
自动: id, wearCount(穿搭次数), createdAt, updatedAt
```

### 3.2 Category（品类）
```
字段: id, name, parentId(null=一级), order, createdAt
支持二级分类，预设6个: 上衣/下装/连衣裙/外套/鞋子/配饰
```

### 3.3 Outfit（搭配）
```
字段: id, name, coverImage, itemIds[], occasions[], notes, createdAt
```

### 3.4 Occasion（场合）
```
预设5个: 日常通勤/约会/正式场合/运动/在家
支持自定义 CRUD
```

### 3.5 CalendarRecord（日历穿搭）
```
字段: id, date(YYYY-MM-DD), outfitId|null, itemIds[], notes, createdAt
```

---

## 4. 核心功能规格

### 4.1 衣橱首页
- Grid 列表展示
- 分类筛选（CategoryPicker）
- 季节筛选（多选）
- 排序：名称/购买日期/穿搭次数/创建时间（支持升序/降序切换）
- 搜索功能
- FAB 悬浮添加按钮

### 4.2 添加单品
- 拍照 / 相册（单张） / 批量添加
- 字段：名称/品类/季节/位置类型/位置详情/品牌/价格/购买日期/备注
- 支持购买日期仅填年份模式
- 自定义属性（名称+值，支持文本/分类类型）

### 4.3 单品详情
- 图片轮播
- 完整信息展示
- 删除功能

### 4.4 搭配管理
- 场合筛选
- 创建搭配：选衣物+命名+场合+封面
- 支持编辑/删除

### 4.5 日历
- 月份视图
- 每日穿搭记录（选搭配 或 手动选单品）
- 穿搭后自动 +1 wearCount

### 4.6 统计页面
- 品类分布
- 季节分布

### 4.7 设置 + 管理
- 品类管理（CRUD，支持二级）
- 场合管理（CRUD）

---

## 5. 代码约束

- 组件放在 `src/components/`（有 glass 子目录）
- 页面放在 `src/screens/`（10个页面）
- 状态管理：`src/store/useStore.ts`（Zustand + AsyncStorage）
- 主题常量：`src/constants/theme.ts`
- 类型定义：`src/types/index.ts`
- 导航配置：`src/navigation/AppNavigator.tsx`
- 使用 Ionicons 图标
- 所有数据通过 `saveData()` 持久化到 AsyncStorage
- 新增 ClothingItem 时 `wearCount` 初始为 0

---

## 6. 存储方案（当前）

- 全部数据存 AsyncStorage（key: `@clothes_keeper_data`）
- 图片存 URI（测试环境正常，生产环境待优化）
- 首次加载自动插入 8 条演示数据

---

## 7. 下一步（优先级从高到低）

1. **日历添加穿搭**：点击日期 → 选择搭配或单品 → 记录保存
2. **Empty State 优化**：衣橱为空 / 搭配为空 / 日历无记录时的引导样式
3. **图片存储方案**：评估 AsyncStorage 限制，考虑 filePath 或其他方案

> 悬浮窗快捷添加（v2.0）暂不列入当前开发计划。
