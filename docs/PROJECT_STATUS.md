# Storybook Engine 项目综合说明

**最后更新**: 2026-03-03 16:15 GMT+8

## 一、项目定位与目标

**项目名称**: Storybook Engine (沉浸式双语互动绘本量产引擎)  
**GitHub**: https://github.com/joyhpc/storybook-engine  
**核心目标**: 建立一个基于 JSON 驱动的、支持 AIGC 批量生产的互动故事播放引擎

**商业模式**: 短视频引流 + 免费试玩 + 付费解锁，AI 批量生产 100+ 本

**技术栈**: 纯原生 HTML5/CSS3/ES6，Gemini Imagen 3 (生图)，ElevenLabs (TTS)

---

## 二、架构演进历程（V1 → V5）

### **V1: 单场景引擎** ✅
- 基础的 DragEngine、AudioSyncEngine、SceneRenderer、ParticleSystem
- 代码量: 679 行
- 状态: 已验证可行

### **V2: Component & Event-Driven DSL** ✅
- 删除 `scenes[].type`，所有场景为 `stage`
- 引入 `scenes[].elements` 和 `scenes[].events`
- 实现 ECA (Event-Condition-Action) 架构

### **V3: AIGC Ready - Two-Stage Compilation & Late-Binding** ✅
- 引入 `global_context` 支持变量插值 `{{variable.path}}`
- 语义化资产寻址 (URN: `urn:asset:magical_forest?mood={{user.mood}}`)
- JIT Provider 机制 (provider 字段 + 安全兜底)

### **V4: Narrative Engine - Global Blackboard & Dynamic Routing** ✅
**核心突破**: 从"单向幻灯片播放器"升维至"图灵完备的互动叙事/RPG游戏引擎"

**关键特性**:
1. **全局记忆黑板 (`initial_state`)**: 
   - `inventory` (集合型): 玩家收集的物品
   - `metrics` (数值型): 勇气值、答题分数等
   - `flags` (布尔型): 关键剧情开关

2. **动态路由网络 (`transitions`)**:
   - 彻底废弃 `next_scene_id`
   - 通过瀑布流评估 `condition` (基于 `$story_state`) 动态决定下一页
   - 必须包含无条件兜底路由，防止死锁

3. **状态突变 (`mutate_state` action)**:
   - 支持 `SET`, `ADD`, `SUBTRACT`, `ARRAY_PUSH`, `ARRAY_REMOVE`
   - 状态只能通过 ECA 架构修改，UI 组件不能私自修改

4. **时光倒流机制**:
   - 引擎底层维护状态快照历史栈
   - 支持"上一页"时恢复状态，防止状态污染

**GitHub Commit**: 0b53cd6

### **V5: Localization Engine - Three-Tier Override Architecture** ✅
**核心突破**: "One Schema to Rule Them All + Late-Binding Context"

**关键特性**:
1. **资产级本地化 (`locale_manifests`)**:
   - `elements[].src` 使用语义 URN (`urn:asset:npc_muddy_animal`)
   - 引擎根据当前 locale 和 `locale_manifests` 解析为实际 URL
   - 可覆写 `url`, `hitbox`, `config_overrides`

2. **结构级本地化 (`elements[].variants`)**:
   - 针对特定 locale (如 `locale:ar-SA`) 进行深度覆写
   - 可覆写 `elements`, `validation`, `config`, `layout` (ltr/rtl)
   - 支持 `text_variants` 和 `word_timings_variants`

3. **情节级本地化 (`scenes[].render_conditions`)**:
   - `exclude_locales`: 跳过某些文化不适合的场景
   - `include_locales`: 只在特定 locale 渲染

4. **时间轴事件支持**:
   - 新增事件: `on_word_start`, `on_word_end`, `on_audio_segment_elapsed`
   - 新增动作: `stop_audio`, `pause_audio`, `clear_timeline_events`
   - `trigger.params` 支持时间相关过滤

**GitHub Commit**: 7d48622

---

## 三、四大护城河（架构核心竞争力）

通过 Super LLM 对 Q1-Q4 的深度回复，我们确立了量产引擎的四大护城河：

### 1. **行为维度 (Q1 - ECA事件框架)**
- 打破枚举，支撑 AIGC 无限扩展的玩法
- 能力注册表 + 声明式连线
- Schema 不定义"页面是什么"，只定义"页面有什么，以及它们怎么联动"

### 2. **空间维度 (Q2 - URN动态插槽)**
- 隔离 AI 风险，实现千人千面的极速渲染
- 三层插槽架构：
  - 数据模板层 (变量插值)
  - 语义化资产寻址 (URN)
  - 即时生成插槽 (JIT Provider)

### 3. **逻辑维度 (Q3 - 全局状态与路由)**
- 沉淀记忆，支撑网状多分支叙事
- 极细粒度的数据埋点，支持自适应学习
- 时光倒流机制，防止状态污染

### 4. **文化维度 (Q4 - 资产清单与变体)**
- 母体与皮肤分离，零代码发版通杀全球市场
- 避免算力成本、存储成本和维护成本的指数级爆炸
- AIGC 工作流：通用母带 → 文化审查智能体 → 局部变异与打包

**结论**: Schema 不再是一份死板的配置文件，而是一种**用于描述多模态互动叙事的图灵完备 DSL（领域特定语言）**。

---

## 四、终极技术壁垒（待攻克）

### **主时间轴与毫秒级音字同步**

**核心挑战**: 在三个"未知动态变量"的夹击下，实现精准的时序控制
1. 交互随时会被用户打断 (ECA 事件驱动)
2. 文本和音频长度是 AIGC 动态生成的，无法提前预知时长 (动态插槽)
3. 场景随时会因状态变化而跳转 (动态路由)

**毁灭性多米诺骨牌效应**:
- 英语版: "Look at the pig." (2.5秒，读到 pig 是 1.5秒)
- 德语版: "Schau dir das Schwein an." (4.0秒，读到 Schwein 是 3.2秒)
- 如果用绝对时间硬编码 `delay: 1500ms`，卡拉OK同步将彻底崩溃

**架构方向**:
- 抛弃绝对时间，引入基于"声纹锚点 (Phoneme/Word Markers)"和"事件驱动"的弹性调度器 (Elastic Scheduler)
- `AudioSyncEngine` 作为事件发布者，发布 `on_word_start`, `on_word_end`, `on_audio_segment_elapsed` 等时间事件
- ECA 引擎订阅时间事件，实现动态的时间协调
- 优先级与中断机制：高优先级（用户交互）> 中优先级（关键叙事驱动的音频事件）> 低优先级（环境音效）

**相关文档**: `docs/issues/TIMELINE_AUDIOSYNC_QUESTIONS.md`

---

## 五、当前项目状态

### **已完成** ✅
- book_schema.json V5 (20093 bytes)
- v1 单场景引擎 (679 lines)
- AIGC 流水线基础框架 (build_book.py)
- 需求分析与技术架构文档
- Q1-Q4 关键问题的 Super LLM 回复学习

### **进行中** 🔄
- 等待决策：是否开始深入探讨 Render Loop 和弹性调度器的设计

### **待完成** ⏳
- 时间轴与毫秒级音字同步的引擎实现
- 多场景引擎 (multi_scene)
- AIGC Pipeline 完善
- 移动端优化
- UX 打磨
- 部署

**项目进度**: 11/22 节点完成 (50%)，总工期 7 天

---

## 六、关键文件清单

```
storybook-engine/
├── book_schema.json (V5 - 20KB)
├── js/engine.js (v1 单场景引擎 - 679 lines)
├── tools/build_book.py (AIGC 流水线)
├── docs/
│   ├── REQUIREMENTS.md (需求分析)
│   ├── TECH_ARCH.md (技术架构)
│   ├── issues/
│   │   ├── BOOK_SCHEMA_QUESTIONS.md (Q1-Q4)
│   │   └── TIMELINE_AUDIOSYNC_QUESTIONS.md (Q1-Q3)
│   ├── PROJECT_MAP.md (项目地图)
│   └── PROJECT_STATUS.md (本文件)
└── project-map.html (可视化项目地图)
```

---

## 七、核心架构原则

1. **Schema 是引擎的"宪法"**: 引擎是"基于 JSON 的图灵完备互动叙事虚拟机"
2. **前端引擎只负责"无脑极速渲染"**: AIGC 的不确定性全部封锁在后端生产管线
3. **严禁在客户端动态执行 AIGC 生成的脚本**: 合规+安全红线
4. **两阶段编译 + 延迟绑定**: 前端极速渲染，AIGC 不确定性封锁在后端
5. **One Schema to Rule Them All**: 单一逻辑母体 + 运行时延迟绑定文化补丁

---

## 八、下一步决策点

**关键问题**: 是否开始深入探讨"主时间轴与毫秒级音字同步"的 Render Loop 和弹性调度器设计？

**备选方案**:
1. 继续深入时间轴架构设计
2. 先推进 `aigc_pipeline` 或 `multi_scene` 的开发
3. 其他优先事项

**等待 pengzi 决策**。

---

*本文档由 Nova 整理，基于 2026-03-03 的项目进展和 Super LLM 的架构回复。*
