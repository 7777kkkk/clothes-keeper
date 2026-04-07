# 更新日志

> 每次功能修改必须记录。格式：日期 + 改动内容 + 问题修复。

---

## 2026-04-07

### ✨ 新功能（本次）

- **身材数据页面（BodyDataScreen）**
  - 新增 `src/screens/BodyDataScreen.tsx`，支持录入和管理 18 项身材数据（身高/体重/头围/颈围/肩宽/胸围/下胸围/腰围/腹围/臀围/上臂围/前臂围/袖长/手腕围/掌围/大腿围/小腿围/踝围）
  - 字段分组显示：基础 / 躯干 / 四肢
  - 使用 GlassCard + 玻璃拟态风格，数字输入自动显示 cm 单位
  - 数据持久化到 store（新增 `bodyData` state，支持 saveData/loadData 迁移）
  - 入口：`SettingsScreen` → 通用设置 → 身材数据

- **数据备份与恢复（SettingsScreen）**
  - 备份：点击后自动复制全量 JSON 数据（含衣橱/搭配/场合/身材数据）到剪贴板
  - 恢复：弹出 TextInput 弹窗，粘贴 JSON 后一键导入，覆盖本地存储并重新加载 App
  - 数据字段包含：`categories / clothingItems / outfits / occasions / calendarRecords / attributeTemplates / homeMode / bodyData` 等

### 🐛 Bug 修复（本次）

- **添加衣服页面白屏（AddClothingScreen）**
  - 根因：`useRoute` 导入但未调用；`route.params` 无空值防御；组件签名 `({ route }: any)` 与 React Navigation 6 不够健壮
  - 修复：改用 `const route = useRoute()` 获取路由对象；`(route.params ?? {})` 添加空值防御

- **日历日期数字未居中（CalendarScreen）**
  - 根因：`dayCell` 样式 `justifyContent: 'flex-start'`、`dayText` 样式 `textAlign: 'left'`
  - 修复：`dayCell` 改为 `justifyContent: 'center' + alignItems: 'center'`，`dayText` 改为 `textAlign: 'center'`

- **设置页图标名称错误（SettingsScreen）**
  - 根因：使用了 Ionicons 不存在的图标名
  - 修复：`umbrella-beach` → `leaf-outline`（衣橱季节）、`ruler-outline` → `body-outline`（身材数据）、`currency-outline` → `cash-outline`（货币单位）

- **设置页 SettingRow 无 onPress 响应**
  - 根因：外观模式/衣橱季节/身材数据/货币单位/数据备份/恢复数据/回收站/关于衣橱/给 App 评分/分享给好友等 SettingRow 缺失 onPress
  - 修复：全部添加 `onPress={() => Alert.alert('提示', '功能开发中')}` 临时处理；`Alert` 已补充导入

### 🐛 Bug 修复

- **ClothingDetailScreen 白屏崩溃（purchaseDate 反序列化）**
  - 根因：`item.purchaseDate` 从 AsyncStorage 反序列化后是字符串，直接调用 `.getFullYear()` 崩溃
  - 修复：新增 `toDate()` 工具函数，将字符串日期转换回 `Date` 对象，格式化函数全部使用 `toDate()` 防御
  - 修复：`customAttributes` 解构增加空值防御 `(item.customAttributes || []).filter(...)`
  - 修复：自定义属性过滤脏数据，跳过 `name/value` 为空或 `type` 不符合 `'text'|'category'` 的记录
  - 修复：`item.purchaseDateMode` 空值防御（用 `toDate` 统一处理）

- **属性管理 ON/OFF 联动未生效**
  - 根因：`AddClothingScreen` 未订阅 `attributeTemplates`，导致开关切换后页面不更新
  - 修复：`AddClothingScreen` 现订阅 `attributeTemplates` 并根据 `visible` 过滤动态渲染字段

- **添加衣服页面字段硬编码**
  - 根因：`AddClothingScreen` 手动渲染品牌/价格/日期等字段，未读取 `attributeTemplates`
  - 修复：改为动态读取 `attributeTemplates.filter(t => t.visible && !t.isSystem)`，按 `order` 排序渲染
  - 新增：自定义字段状态管理（`customValues`、`customMultiValues`、`customCheckboxValues`）

- **属性管理新建属性后添加衣服页面没有该字段**
  - 根因：同 Bug 2，`AddClothingScreen` 未订阅 store 变更
  - 修复：订阅后，新增/删除/开关属性后页面自动重新渲染

### 🔧 功能更新

- **添加衣服页面动态表单（属性管理联动）**
  - 重构 `AddClothingScreen.tsx`，根据 `attributeTemplates` 中 `visible=true` 的字段动态生成表单
  - 支持 7 种字段类型动态渲染：text、number、select、multi_select、date、checkbox、images
  - 添加/编辑衣服复用同一页面，通过 `itemId` 参数区分
  - 导航类型 `AddClothing` 改为 `{ itemId?: string } | undefined`

- **衣服详情页动态字段显示**
  - `ClothingDetailScreen` 根据 `visibleIds` 过滤系统字段（名称/分类/季节/位置/品牌/价格/日期/备注）
  - 自定义属性根据对应模板的 `visible` 字段过滤显示

- **编辑衣服功能**
  - `AddClothingScreen` 支持编辑已有衣服（传入 `itemId`），预填所有字段值
  - `ClothingDetailScreen`「编辑」按钮导航到 `AddClothingScreen`（带 `itemId`）
  - 清理了 `ClothingDetailScreen` 内联编辑模式的冗余代码（原本 ~500 行 → ~280 行）

- **属性管理联动（验证完成）**
  - `AttributeManageScreen` 的 ON/OFF 开关 → `updateAttributeTemplate(id, { visible })` → 全局生效
  - 添加衣服页面和详情页自动响应 `visible` 字段变化

### 🐛 Bug 修复（前日）

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

### 🐛 旧 Bug 修复（前日）

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

### 🐛 Bug 修复

- **AddClothingScreen 编辑模式修复**
  - 问题：`itemId` 参数接收但未使用，标题始终显示"添加衣物"，表单初始值始终为空，`handleSave` 始终调用 `addClothingItem`
  - 修复：新增 `useEffect` 预填表单数据；动态设置导航标题；`handleSave` 区分新建/编辑模式分别调用 `addClothingItem` / `updateClothingItem`

- **visible 过滤逻辑统一**
  - 问题：`AddClothingScreen` 使用 `.filter(t => t.visible && !t.isSystem)`，`ClothingDetailScreen` 使用 `.filter(t => t.visible !== false)`
  - 修复：统一为 `.filter(t => t.visible !== false)`，与 ClothingDetailScreen 保持一致

- **images 字段类型渲染支持**
  - 问题：`AttributeFieldType` 包含 `'images'` 类型，但 `renderCustomField` 中无对应渲染分支
  - 修复：新增 `images` 类型渲染分支（图片选择/预览/删除）；`handleSave` 中对 `images` 类型字段将 `string[]` 序列化为 JSON 存储
