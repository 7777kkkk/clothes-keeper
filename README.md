# ClothesKeeper 👔

> 你的私人电子衣柜 - 管理衣物、创建搭配、记录每日穿搭

## 功能特性

### 📂 品类分类
在 设置 → 管理选项 → 品类分类 中自定义衣物分类名称，可根据个人习惯灵活分类。

### 👔 添加单品
在衣橱界面右下角点击 **+** 创建单品：
- 📷 拍照添加
- 🖼️ 从相册单张添加
- 📚 批量添加

添加后可设置：
- 名称（如"黑色蝴蝶结西装"）
- 品类（单选）
- 季节（春/夏/秋/冬，可多选）
- 收纳位置 ✨
- 品牌、价格等

### ✨ 建立搭配
在搭配 Tab 管理你的穿搭方案：
- 系统预设多种场合（日常通勤、约会、正式场合等）
- 支持自定义场合
- 选择衣物组合成搭配

### 📅 日历记录
记录每日穿搭，方便查看历史搭配：
- 哪天穿了什么衣服一目了然
- 支持选择已有搭配或手动选单品

## 技术栈

| 技术 | 说明 |
|------|------|
| React Native (Expo) | 跨平台移动开发 |
| TypeScript | 类型安全 |
| Zustand | 轻量状态管理 |
| React Navigation | 导航系统 |
| LeanCloud | 云数据库/存储 |

## 开始使用

```bash
# 安装依赖
npm install

# 启动开发服务器
npx expo start

# 运行 iOS
npm run ios

# 运行 Android
npm run android
```

## 项目结构

```
src/
├── components/     # 可复用组件
├── screens/       # 页面
│   ├── HomeScreen.tsx           # 衣橱首页
│   ├── AddClothingScreen.tsx    # 添加单品
│   ├── ClothingDetailScreen.tsx # 单品详情
│   ├── OutfitScreen.tsx         # 搭配列表
│   ├── CreateOutfitScreen.tsx  # 创建搭配
│   ├── CalendarScreen.tsx       # 日历
│   ├── StatsScreen.tsx         # 统计
│   └── SettingsScreen.tsx      # 设置
├── navigation/    # 导航配置
├── store/          # 状态管理
├── services/       # API服务
├── constants/      # 常量配置
└── types/          # TypeScript类型
```

## 许可证

MIT
