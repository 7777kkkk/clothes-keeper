# ClothesKeeper - 电子衣柜 APP

## 1. Project Overview

- **Name**: ClothesKeeper
- **Type**: Cross-platform mobile app (iOS & Android)
- **Core functionality**: A personal digital wardrobe management app that helps users organize clothing items, create outfits, and track daily穿搭
- **Target users**: Fashion-conscious individuals who want to manage their wardrobe digitally

## 2. Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Frontend | React Native (Expo) | 跨平台，支持 iOS/Android |
| State Management | Zustand | 轻量级状态管理 |
| Navigation | React Navigation 6 | 底部 Tab + Stack 导航 |
| Backend/Storage | LeanCloud | 云数据库 + 文件存储（免服务器） |
| Image Storage | LeanCloud File | 衣物图片存储 |
| Push Notifications | Expo Notifications | 重要更新推送 |
| CI/CD | GitHub Actions | 每次 push 自动通知 |

## 3. Core Features

### 3.1 品类分类管理
-路径：设置 → 管理选项 → 品类分类
-功能：
  - CRUD 品类名称（例：上衣、裤子、裙子、鞋子、配饰）
  - 支持二级分类（例：上衣 → T恤、衬衫、卫衣）
  - 默认品类预设
-数据模型：
  ```
  Category {
    id: string
    name: string
    parentId: string | null
    order: number
    createdAt: Date
  }
  ```

### 3.2 添加单品
-路径：衣橱 Tab → 右下角 +
-创建方式：
  - 拍照
  - 从相册添加（单张）
  - 批量添加（多张）
-字段：
  - 图片（必填，最多9张）
  - 名称（必填，用户描述，如"黑色蝴蝶结西装"）
  - 品类（必填，单选）
  - 季节（多选：春/夏/秋/冬）
  - 收纳位置（文本，如"卧室衣柜第二层"）
  - 品牌（可选）
  - 价格（可选）
  - 购买日期（可选）
  - 备注（可选）
-数据模型：
  ```
  ClothingItem {
    id: string
    name: string
    images: string[]（图片URL数组）
    categoryId: string
    seasons: string[]
    storageLocation: string
    brand: string
    price: number
    purchaseDate: Date
    notes: string
    createdAt: Date
    updatedAt: Date
  }
  ```

### 3.3 建立搭配
-路径：搭配 Tab
-默认场合：
  - 日常通勤
  - 约会
  - 正式场合
  - 运动
  - 在家
-自定义场合：同品类分类的管理方式
-功能：
  - 创建搭配，选择衣物单品组成
  - 给搭配命名
  - 选择适用场合（可多选）
  - 搭配封面图
-数据模型：
  ```
  Outfit {
    id: string
    name: string
    coverImage: string
    itemIds: string[]（关联的 ClothingItem IDs）
    occasions: string[]
    notes: string
    createdAt: Date
  }
  Occasion {
    id: string
    name: string
    order: number
  }
  ```

### 3.4 日历穿搭记录
-路径：日历 Tab
-功能：
  - 每日穿搭记录
  - 可选择已有搭配或手动选单品
  - 查看历史某天的穿搭
  - 统计：每月穿搭次数、常用单品
-数据模型：
  ```
  CalendarRecord {
    id: string
    date: string（YYYY-MM-DD）
    outfitId: string | null
    itemIds: string[]
    notes: string
    createdAt: Date
  }
  ```

### 3.5 便捷添加功能（悬浮窗）
-类似菜鸟裹裹的快速添加
-实现方式：
  - Android：悬浮窗 Service + AccessibilityService
  - iOS：Share Extension
-流程：
  1. 用户在目标App（如淘宝）复制商品链接
  2. 打开悬浮窗按钮
  3. 自动提取：标题、图片、价格、链接
  4. 用户确认品类和季节
  5. 自动保存到衣橱
-注意：此功能在 v2.0 实现

## 4. UI/UX Design

### 4.1 导航结构
```
底部 Tab 导航（5个）：
├── 衣橱（Home） - 衣物列表/Grid视图
├── 搭配 - 搭配管理
├── 日历 - 穿搭记录
├── 统计 - 穿着统计（未来版本）
└辙 我的 - 设置/管理选项
```

### 4.2 配色方案
- Primary: #1A1A2E（深藏青）
- Secondary: #E8E8E8（浅灰）
- Accent: #C9A959（香槟金）
- Background: #FAFAFA
- Card: #FFFFFF
- Text Primary: #1A1A2E
- Text Secondary: #666666

### 4.3 字体
- 主字体：System Default（iOS: SF Pro, Android: Roboto）
- 标题：Bold, 18-24px
- 正文：Regular, 14-16px

### 4.4 间距系统
- 基础单位：4px
- 常用间距：8px, 12px, 16px, 24px, 32px
- 卡片圆角：12px
- 卡片阴影：0 2px 8px rgba(0,0,0,0.08)

## 5. Data Storage (LeanCloud)

### 5.1 Class Design
- `Category` - 品类表
- `ClothingItem` - 衣物单品表
- `Outfit` - 搭配表
- `Occasion` - 场合表
- `CalendarRecord` - 日历记录表

### 5.2 ACL Policy
- 所有数据 owner 为当前用户
- 默认私有，只对当前用户可见

## 6. CI/CD & Auto Report

### 6.1 GitHub Actions
- 每次 push 到 main 分支触发
- 自动部署（可选）
- 重要功能更新发送通知

### 6.2 进度汇报
- 每10分钟向用户汇报一次（cron job）
- 包含：完成的功能、代码改动、遇到的问题、下一步计划

## 7. Milestones

### v0.1 - 基础框架 ✅ (目标：今天完成)
- [x] SPEC.md 编写
- [x] 项目初始化（Expo + React Native）
- [x] 导航框架
- [x] LeanCloud 初始化

### v0.2 - 衣橱核心功能 🔄 (进行中)
- [ ] 品类分类管理页面
- [ ] 单品列表页面
- [ ] 添加单品页面
- [ ] 单品详情页面

### v0.3 - 搭配功能
- [ ] 搭配列表页面
- [ ] 创建/编辑搭配页面
- [ ] 场合自定义管理

### v0.4 - 日历功能
- [ ] 日历页面
- [ ] 每日记录功能
- [ ] 历史查看

### v0.5 - 悬浮窗功能 (v2.0)
- [ ] Android 悬浮窗
- [ ] iOS Share Extension
- [ ] 自动提取商品信息

## 8. Project Structure

```
clothes-keeper/
├── SPEC.md
├── README.md
├── package.json
├── app.json
├── src/
│   ├── components/       # 可复用组件
│   │   ├── CategoryPicker.tsx
│   │   ├── ImagePicker.tsx
│   │   ├── OutfitCard.tsx
│   │   └── ClothingCard.tsx
│   ├── screens/          # 页面
│   │   ├── HomeScreen.tsx
│   │   ├── AddClothingScreen.tsx
│   │   ├── ClothingDetailScreen.tsx
│   │   ├── OutfitScreen.tsx
│   │   ├── CreateOutfitScreen.tsx
│   │   ├── CalendarScreen.tsx
│   │   ├── SettingsScreen.tsx
│   │   ├── CategoryManageScreen.tsx
│   │   └── OccasionManageScreen.tsx
│   ├── navigation/       # 导航配置
│   │   └── AppNavigator.tsx
│   ├── store/            # 状态管理
│   │   └── useStore.ts
│   ├── services/         # LeanCloud 服务
│   │   ├── api.ts
│   │   └── models.ts
│   ├── utils/            # 工具函数
│   │   └── helpers.ts
│   ├── constants/        # 常量配置
│   │   └── theme.ts
│   └── types/            # TypeScript 类型
│       └── index.ts
├── assets/              # 静态资源
│   └── images/
└── .github/
    └── workflows/
        └── notify.yml
```
