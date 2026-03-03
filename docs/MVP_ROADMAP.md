# Storybook Engine MVP 项目地图

**最后更新**: 2026-03-03 20:30 GMT+8  
**状态**: 架构修正，回归务实路线

---

## 一、批判性反思

### **严重问题诊断**

1.  **Schema 与实现的断裂 (致命)**:
    - V2-V5 的架构改进停留在纸面上，未能及时转化为可运行的代码。
    - 设计与实现的 gap 已经大到无法弥合。

2.  **过度架构 (Over-Engineering)**:
    - 追求"图灵完备 DSL"、"三级本地化覆写架构"、"全局黑板 + 状态突变 + 时光倒流"等高级特性。
    - 这些设计在 MVP 阶段显得过于复杂和不切实际，像是问 LLM "能设计多复杂就设计多复杂"的产物。

3.  **文档驱动开发的陷阱**:
    - 项目 50% 的"完成度"主要来自文档和设计，实际可运行功能只有 v1 单场景引擎和 AIGC 流水线基础。
    - 关键路径上的所有功能都未开始：多场景引擎、移动端适配、动效打磨、部署。

### **修正方向**

1.  **MVP First**: 快速做出一个可运行的多场景绘本，验证核心价值。
2.  **继承优势**: 以 `kids-book-engine` 的 `engine.js` (v3) 为基础，保留其核心状态机和渲染逻辑。
3.  **AIGC 赋能**: 快速接入 `build_book.py`，实现 JSON 驱动的批量内容生产。
4.  **逐步演化**: 只有在 MVP 成功运行并验证了核心价值后，才考虑逐步引入更复杂的特性。

---

## 二、MVP 目标

一个包含 **3-5 个场景** 的互动绘本，支持：
- ✅ 场景切换（翻页）
- ✅ 基础交互（拖拽、点击）
- ✅ 字音同步（卡拉OK高亮，支持真实音频文件）
- ✅ AIGC 生成的图片和音频

**商业验证**: 短视频引流 + 免费试玩 + 付费解锁

---

## 三、系统架构 (MVP)

### **目录结构**

```
storybook-engine-mvp/
├── index.html (入口)
├── css/style.css (样式)
├── js/
│   ├── engine.js (核心引擎，基于 kids-book-engine v3)
│   │   ├── SceneLoader (场景加载与渲染)
│   │   ├── DragDropEngine (拖拽交互)
│   │   ├── AudioSyncEngine (字音同步，支持真实音频)
│   │   ├── ParticleSystem (粒子效果)
│   │   └── NavigationEngine (新增：多场景导航)
│   └── book-data.js (整本书的数据，包含多个场景)
├── tools/
│   └── build_book.py (AIGC 流水线，生成 book-data.js)
└── assets/ (AIGC 生成的图片和音频)
```

### **核心模块**

#### **1. SceneLoader (继承自 kids-book-engine)**
- 加载 JSON 数据并渲染场景（背景、角色、物品、字幕）
- 支持 CSS 渐变、图片背景、Canvas 粒子背景

#### **2. DragDropEngine (继承自 kids-book-engine)**
- 拖拽交互核心状态机（拖拽、碰撞检测、回弹、成功链）
- 支持触摸和鼠标事件

#### **3. AudioSyncEngine (继承自 kids-book-engine v3)**
- 基于 `requestAnimationFrame` 的逐词卡拉OK高亮
- **支持真实音频文件同步** (`_audio.currentTime`)
- 支持无音频的模拟时间 (`performance.now()`)

#### **4. ParticleSystem (继承自 kids-book-engine)**
- Canvas 粒子引擎（环境粒子 + 爆炸效果）
- 支持超新星爆炸、冲击波、环境粒子

#### **5. NavigationEngine (新增)**
- 多场景导航（上一页、下一页、跳转到指定场景）
- 场景切换动画（淡入淡出、滑动）
- 场景历史栈（支持"返回"）

---

## 四、MVP Schema (简化版)

**核心原则**: 简洁实用，避免过度设计。

```json
{
  "meta": {
    "book_id": "little_prince_fox",
    "title": "小王子与狐狸",
    "language": ["en", "zh"],
    "target_age": "4-8"
  },
  "scenes": [
    {
      "scene_id": "scene_1",
      "background": {
        "type": "image",
        "src": "assets/bg_1.jpg"
      },
      "characters": [
        {
          "id": "fox",
          "img_src": "assets/fox.png",
          "position": { "x": "70%", "y": "60%" },
          "width": "150px",
          "height": "150px",
          "states": {
            "hungry": { "filter": "grayscale(1)", "animation": "idle" },
            "happy": { "filter": "saturate(1.3)", "animation": "jump" }
          },
          "initial_state": "hungry"
        }
      ],
      "items": [
        {
          "id": "apple",
          "img_src": "assets/apple.png",
          "position": { "x": "20%", "y": "60%" },
          "width": "90px",
          "height": "90px",
          "draggable": true,
          "animation": "bounce"
        }
      ],
      "interaction": {
        "type": "drag_and_drop",
        "draggable_id": "apple",
        "target_id": "fox",
        "hit_tolerance": 60,
        "on_success": {
          "actions": [
            { "type": "hide_item", "target": "apple" },
            { "type": "change_state", "target": "fox", "to_state": "happy" },
            { "type": "play_dialogue", "dialogue_id": "after_feed" },
            { "type": "show_particles", "emoji": "✨", "count": 8 }
          ]
        }
      },
      "dialogues": {
        "intro": {
          "text_en": "The fox is hungry. Feed him!",
          "text_zh": "狐狸饿了，喂喂它吧！",
          "audio": "assets/scene_1_intro.mp3",
          "words": [
            { "word": "The", "start_time": 0.0, "end_time": 0.25 },
            { "word": "fox", "start_time": 0.25, "end_time": 0.55 },
            ...
          ],
          "auto_play": true
        },
        "after_feed": {
          "text_en": "Yum! Please tame me!",
          "text_zh": "好吃！请驯服我吧！",
          "audio": "assets/scene_1_after_feed.mp3",
          "words": [ ... ],
          "auto_play": true
        }
      },
      "ui": {
        "hint": {
          "text_en": "Drag the apple to the fox!",
          "text_zh": "✨ 把苹果拖给小狐狸吧！",
          "show_after_ms": 2500
        }
      },
      "next_scene": "scene_2"
    },
    {
      "scene_id": "scene_2",
      ...
      "next_scene": "scene_3"
    },
    ...
  ]
}
```

**关键字段说明**:
- `meta`: 书籍元数据
- `scenes`: 场景数组，每个场景包含：
  - `scene_id`: 场景唯一标识
  - `background`: 背景配置
  - `characters`: 角色数组
  - `items`: 可交互物品数组
  - `interaction`: 交互配置（拖拽、点击等）
  - `dialogues`: 对话字典
  - `ui`: UI 配置（提示、按钮等）
  - `next_scene`: 下一个场景的 ID

---

## 五、演化路径

### **Phase 1: MVP (1-2 天)** 🎯

**目标**: 快速做出一个可运行的多场景绘本

**任务**:
1.  ✅ 继承 `kids-book-engine` 的 `engine.js` (v3)
2.  ✅ 新增 `NavigationEngine` 模块，支持多场景导航
3.  ✅ 简化 Schema，回归到简洁实用的数据结构
4.  ✅ 创建 3-5 个场景的示例数据 (`book-data.js`)
5.  ✅ 接入 `build_book.py`，实现 AIGC 生成图片和音频
6.  ✅ 部署到 GitHub Pages，验证核心价值

**验收标准**:
- 可以在浏览器中打开并运行
- 可以通过点击或滑动切换场景
- 每个场景的交互和字音同步正常工作
- AIGC 生成的图片和音频正常加载

---

### **Phase 2: 优化与打磨 (1-2 天)** 🔧

**目标**: 提升用户体验和性能

**任务**:
1.  移动端适配（触摸手势、响应式布局）
2.  动效打磨（场景切换动画、角色动画）
3.  音频优化（预加载、错误处理）
4.  性能优化（资源懒加载、Canvas 优化）
5.  UI 打磨（按钮样式、提示动画）

**验收标准**:
- 在移动设备上流畅运行
- 场景切换动画自然流畅
- 音频加载和播放无卡顿
- 首屏加载时间 < 3 秒

---

### **Phase 3: 高级特性 (按需)** 🚀

**目标**: 根据用户反馈和商业需求，逐步引入高级特性

**可选任务**:
1.  简单的状态管理（记录用户进度，支持"继续阅读"）
2.  基础的本地化（中英双语切换）
3.  更多交互类型（点击、选择题、语音输入）
4.  数据埋点（用户行为分析，A/B 测试）
5.  社交分享（分享到微信、朋友圈）

**验收标准**:
- 每个新特性都有明确的商业价值
- 每个新特性都经过代码实现和验证
- 不引入不必要的复杂性

---

## 六、关键决策

### **1. 为什么抛弃 V2-V5 的架构？**

V2-V5 的架构设计过于复杂，追求"图灵完备"、"通用性"，导致：
- 设计与实现的 gap 过大，无法快速交付
- 在 MVP 阶段引入了不必要的复杂性
- 偏离了"快速验证核心价值"的目标

### **2. 为什么继承 kids-book-engine 的 engine.js？**

`kids-book-engine` 的 `engine.js` (v3) 是一个**务实的、可运行的单场景引擎**，包含：
- 完整的拖拽交互状态机
- 支持真实音频文件同步的 AudioSyncEngine
- Canvas 粒子引擎
- 简洁实用的数据结构

继承它可以：
- 快速获得一个可运行的基础
- 避免重复造轮子
- 专注于多场景导航和 AIGC 集成

### **3. 为什么简化 Schema？**

对于 MVP 阶段的儿童绘本引擎：
- **不需要** "图灵完备 DSL" — 绘本的交互逻辑是有限且可枚举的
- **不需要** 三级本地化覆写架构 — MVP 阶段只需中英双语
- **不需要** 全局黑板 + 状态突变 + 时光倒流 — 这是 RPG 游戏引擎的需求
- **不需要** JIT AIGC Provider + 语义 URN — 所有资产都应在构建时生成

简化 Schema 可以：
- 降低实现难度
- 加快开发速度
- 更容易理解和维护

---

## 七、下一步行动

**立即开始 Phase 1: MVP 开发**

1.  创建 `storybook-engine-mvp` 目录
2.  复制 `kids-book-engine` 的 `engine.js` (v3) 到 `js/engine.js`
3.  新增 `NavigationEngine` 模块
4.  创建 3-5 个场景的示例数据 (`book-data.js`)
5.  测试多场景导航和交互
6.  接入 `build_book.py`，生成 AIGC 内容
7.  部署到 GitHub Pages

**预计时间**: 1-2 天

---

*本文档由 Nova 整理，基于对 kids-book-engine 的深入分析和对过度架构的批判性反思。*
