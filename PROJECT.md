# 衣橱 App 项目文档

> 本文档记录项目架构、设计思路、未完成目标和现存问题。

---

## 一、项目概述

**名称**：衣服管家（Clothes Keeper）
**技术栈**：Expo SDK 54 + React Native + TypeScript
**包管理**：npm
**启动命令**：`npx expo start --offline`（Node.js v24 需要加 `--offline`，否则 fetch failed）

---

## 二、技术架构

### 2.1 目录结构

```
src/
├── components/
│   └── glass/
│       ├── GradientBackground.tsx   # 全局背景（目前是纯色）
│       ├── GlassComponents.tsx      # GlassCard/GlassPill/FAB/SectionHeader等封装
│       └── LiquidGlassCard.tsx    # 玻璃卡片（blur + 白色折射 + 触控回弹）
├── constants/
│   └── theme.ts                   # 颜色/字体/圆角/阴影常量
├── navigation/
│   └── AppNavigator.tsx           # 导航（Stack + BottomTabs）
├── screens/
│   ├── HomeScreen.tsx            # 首页（分类浏览）
│   ├── ClothingDetailScreen.tsx  # 衣服详情
│   ├── AddClothingScreen.tsx     # 添加衣服
│   ├── CalendarScreen.tsx        # 日历
│   ├── OutfitScreen.tsx          # 搭配管理
│   ├── StatsScreen.tsx           # 统计
│   ├── SettingsScreen.tsx        # 设置/我的
│   ├── CategoryManageScreen.tsx  # 品类管理
│   ├── OccasionManageScreen.tsx # 场合管理
│   ├── AttributeManageScreen.tsx# 属性管理
│   └── LiquidGlassDemoScreen.tsx# 效果演示
├── store/
│   └── useStore.ts              # Zustand 状态管理 + AsyncStorage 持久化
└── types/
    └── index.ts                 # 所有 TypeScript 类型定义
```

### 2.2 状态管理

- **库**：Zustand
- **持久化**：`@react-native-async-storage/async-storage`
- **数据键**：`@clothes_keeper_data`

### 2.3 依赖库

| 库 | 用途 |
|---|---|
| `expo-linear-gradient` | 渐变背景 |
| `expo-blur` | 玻璃模糊效果 |
| `@expo/vector-icons` | 图标（**不要用** `react-native-vector-icons`） |
| `react-native-reanimated` | 动画 |
| `@react-native-async-storage/async-storage` | 本地存储 |
| `@react-navigation/native` + `native-stack` + `bottom-tabs` | 导航 |
| `expo-image-picker` | 图片选择 |
| `@react-native-community/datetimepicker` | 日期选择 |

---

## 三、UI 设计

### 3.1 配色方案

```typescript
COLORS = {
  background:   '#FBFAFF',  // 全局背景
  card:         '#ffffff',  // 卡片背景
  textPrimary:  '#43665a',  // 主文字（墨蓝绿）
  textSecondary:'#889fa5',  // 辅助文字
  primary:      '#A2BDEA',  // 主色调
  accent:       '#43665a',  // 强调色
  fab:          '#A2BDEA',  // 悬浮按钮
  error:        '#e05c5c',  // 错误色
}
```

### 3.2 玻璃效果（Liquid Glass）

`LiquidGlassCard` 是核心组件：
- **模糊**：`expo-blur`，强度 8/12/20（light/medium/heavy）
- **白色折射层**：`LinearGradient` rgba(255,255,255,0.40/0.20/0.05)
- **触控回弹**：`react-native-reanimated` scale 1→0.97
- **无 shimmer 动画**（已移除流动高光）

### 3.3 图标规则

- **必须用** `@expo/vector-icons`（**不要用** `react-native-vector-icons`）
- Ionicons 图标名注意：
  - `plus` → `add`
  - `check-circle` → `checkmark-circle`
  - `body` → `layers`
  - `trash-can` → `trash-bin`
  - `calendar-clock` → `calendar-outline`
  - `chevron-left` → `chevron-back`

---

## 四、属性管理系统

### 4.1 数据模型

```typescript
// 属性模板（全局定义）
interface AttributeTemplate {
  id: string;                    // 唯一标识
  name: string;                  // 显示名称，如"颜色"
  fieldType: AttributeFieldType;  // 字段类型
  options: AttributeOption[];     // select/multi_select 的选项
  order: number;                 // 排序
  visible: boolean;              // 添加/详情页是否显示
  isSystem: boolean;             // 是否系统内置（不可删除）
}

// 字段类型
type AttributeFieldType =
  | 'text'        // 文本
  | 'number'      // 数字
  | 'select'      // 单选
  | 'multi_select'// 多选
  | 'date'        // 日期
  | 'checkbox'     // 开关
  | 'images';      // 相册
```

### 4.2 系统内置字段（不可删除，始终存在）

| ID | 名称 | 类型 |
|---|---|---|
| `sys_name` | 名称 | text |
| `sys_images` | 照片 | images |
| `sys_category` | 分类 | select |
| `sys_seasons` | 季节 | multi_select |
| `sys_location` | 存放位置 | select |
| `sys_location_detail` | 具体位置 | text |
| `sys_brand` | 品牌 | text |
| `sys_price` | 价格 | number |
| `sys_purchase_date` | 购买日期 | date |
| `sys_notes` | 备注 | text |

### 4.3 联动逻辑（待完成）

- 属性管理页面的 ON/OFF 开关 → 控制 `visible` 字段
- **添加衣服页面**：根据 `attributeTemplates` 中 `visible=true` 的字段动态渲染表单
- **衣服详情页**：根据 `visible=true` 的字段决定显示哪些信息

---

## 五、导航结构

```
RootStack
├── MainTabs (BottomTabs)
│   ├── Home（首页）
│   ├── Outfit（搭配）
│   ├── Calendar（日历）
│   ├── Stats（统计）
│   └── My（我的）
└── Stack（Modal）
    ├── AddClothing（添加衣服）
    ├── ClothingDetail（衣服详情）
    ├── CreateOutfit（创建搭配）
    ├── CategoryManage（品类管理）
    ├── OccasionManage（场合管理）
    ├── AttributeManage（属性管理）
    └── LiquidGlassDemo（效果演示）
```

---

## 六、未完成目标

- [ ] **属性管理联动**：ON/OFF 开关 → `visible` → 添加/详情页动态渲染
- [ ] **添加衣服页面**：根据 `attributeTemplates` 动态生成表单字段
- [ ] **衣服详情页**：根据 `visible` 过滤字段显示（部分代码已实现，需验证）
- [ ] **编辑衣服**：复用添加衣服页面，支持编辑已有衣服

---

## 七、现存问题

| # | 问题 | 状态 |
|---|---|---|
| 1 | ClothingDetailScreen 白屏崩溃（从首页点击进入） | 🔴 未解决，疑似 `CustomAttribute` 类型或 store 初始化时机问题 |
| 2 | 属性管理 ON/OFF 联动未生效 | 🔴 未解决，添加/详情页未读取 `visible` |
| 3 | 添加衣服页面字段硬编码，未动态读取 `attributeTemplates` | 🔴 未解决 |
| 4 | 属性管理新建属性后，添加衣服页面没有该字段 | 🔴 未解决 |

---

## 八、已知踩坑记录

- **Node.js v24**：Expo SDK 54 不兼容，必须用 `--offline`
- **react-native-linear-gradient**：Expo 新架构不兼容，必须换 `expo-linear-gradient`
- **react-native-vector-icons**：字体加载问题，必须换 `@expo/vector-icons`
- **AsyncStorage 数据迁移**：旧数据格式 `[{id, name, order}]` 需要迁移函数 `migrateAttributeTemplates()`
- **babel-preset-expo**：必须安装否则 `npx expo start` 报错

---

## 九、启动和调试

```bash
# 正常启动（Node 18-22）
npx expo start

# Node 24 必须加 offline
npx expo start --offline

# 清除缓存重启
npx expo start --offline --clear
```
