# 更新日志

> 每次功能修改必须记录。格式：日期 + 改动内容 + 问题修复。

---

## 2026-04-07

### 🔧 功能更新

- **Liquid Glass 效果**
  - 新增 `LiquidGlassCard.tsx` 组件，支持 blur 模糊 + 白色折射 + 触控回弹动画
  - 实现了 WWDC 2025 Liquid Glass 风格的玻璃效果
  - 后续移除了 shimmer 流动高光动画，保持简洁

- **属性管理系统**
  - 新增 `AttributeTemplate` 类型定义，支持 7 种字段类型（text/number/select/multi_select/date/checkbox/images）
  - 新增 `AttributeManageScreen.tsx` 属性管理页面，支持：
    - 新建/编辑/删除自定义属性
    - 选择字段类型（文本/数字/单选/多选/日期/开关）
    - 单选/多选可编辑选项列表（Notion 风格）
    - ON/OFF 开关控制字段是否在添加/详情页显示
  - 系统内置字段（名称/照片/分类/季节/位置/品牌/价格/日期/备注）不可删除，始终存在

- **数据迁移**
  - 实现 `migrateAttributeTemplates()` 函数，自动将旧格式 `[{id, name, order}]` 迁移到新格式
  - 迁移时自动补全系统内置字段

### 🐛 Bug 修复

- `react-native-linear-gradient` → 换成 `expo-linear-gradient`（Expo SDK 54 新架构兼容）
- `react-native-vector-icons` → 换成 `@expo/vector-icons`（字体加载问题）
- 图标名修正：`plus`→`add`，`check-circle`→`checkmark-circle`，`body`→`layers` 等
- `babel-preset-expo` 缺失 → 已安装
- `npx expo start` 报 `fetch failed` → Node.js v24 兼容性问题，用 `--offline` 绕过
- 首页统计概览（三个数字卡片）已删除
- 日历格子数字位置修复（左上角）
- FAB 居中问题：CalendarScreen/OutfitScreen 补上 `position: absolute, right: 20`
- 背景色：多个页面根容器硬编码 `COLORS.card` 覆盖背景，已统一改为 `COLORS.background`
- 顶栏透明度：`rgba(255,255,255,0.75)` → `rgba(255,255,255,0.60)`

### 🎨 UI 调整

- 全局背景色：`#E2DEDE` → `#EAE9FC` → `#FBFAFF`
- 主文字色：`#FFFFFF` → `#1e3a5f` → `#43665a`
- 主色调：`#4A90D9` → `#A2BDEA`
- 辅助文字色：`#CCE1FF` → `#4a6fa5` → `#889fa5`
- 分割线色：`#dadde2`
- 卡片透明度提高（blur 强度降低叠加层加实）
- 首页分类模块加玻璃底框（LiquidGlassCard 包裹）
- 首页添加按钮移至每个分类末尾（之前只在空分类显示）
- "我的"页面删除「衣橱统计」和「季节分布」整块内容

### 📄 文件变更

| 文件 | 变更 |
|---|---|
| `src/components/glass/LiquidGlassCard.tsx` | 新增，玻璃卡片组件 |
| `src/screens/LiquidGlassDemoScreen.tsx` | 新增，Liquid Glass 效果演示 |
| `src/screens/AttributeManageScreen.tsx` | 新增，属性管理页面 |
| `src/types/index.ts` | 新增 `AttributeTemplate` 等类型 |
| `src/store/useStore.ts` | 新增属性管理状态和迁移函数 |
| `babel.config.js` | 新增，配置 reanimated 插件 |
| `src/constants/theme.ts` | 配色多次调整 |

---

## 2026-04-06

### 首次协作

- 与 alluki 开始开发 React Native 衣橱 App
- 项目初始化（Expo SDK 54 + TypeScript）
- 配置 `@expo/vector-icons`、`expo-linear-gradient`、`expo-blur`
- 构建首页、详情页、添加衣服页面等基础功能
