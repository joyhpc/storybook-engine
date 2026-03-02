# BOOK_SCHEMA_QUESTIONS.md - Questions for Super LLM

Based on the preliminary `book_schema.json` design for a mass-producible interactive storybook engine, here are the most critical questions to inform its evolution. These questions aim to ensure the schema can truly support an AI-driven content production pipeline and complex narrative structures.

---

## **Q1: 场景类型 (Scene Types) 的可扩展性与AIGC兼容性**

*   **当前 Schema 设计**: 提供了 `narrative` (纯叙述), `interactive` (带互动), `quiz` (问答), `end_page` (结局页) 等几种场景类型。
*   **核心问题**:
    *   **这种有限的场景类型枚举，是否足以覆盖未来 AIGC 大批量生产时可能出现的、更多样化的互动形式和故事结构？**
    *   **如果 AIGC 创造出新的互动模式（例如：语音输入、手势识别、简单绘画），我们应该如何设计 Schema，使其在不频繁修改底层代码的情况下，能够优雅地扩展和兼容这些新类型？** (例如：通过一个 `custom_interaction_type` 字段指向外部脚本或配置？)
    *   **对于 `quiz` 场景，如何设计其 `content` 结构以支持 AIGC 生成的各种题型（单选、多选、填空、拖拽排序）及其答案验证逻辑，同时保持前端引擎的通用性？**

---

## **Q2: 动态内容注入与AIGC工作流的边界**

*   **当前 Schema 设计**: 假定所有图片、音频路径都在 Schema 中明确指定。
*   **核心问题**:
    *   **在“量产引擎”的 AIGC 工作流中，如果某些内容（例如：背景图的风格、角色的表情、物品的颜色）需要在运行时根据上下文或用户个性化偏好动态生成（例如：根据用户情绪生成暖色调背景），Schema 应该如何预留这种“动态内容插槽”？**
    *   **这是否意味着 Schema 中需要引入“占位符”或“生成指令”，而不是最终的资产路径？如果是，这种指令的粒度应该是什么？** (例如：`"background": {"type": "generate", "prompt": "magical forest with warm sunset"}` 而不是 `"image": "assets/bg.jpg"`)

---

## **Q3: 多场景导航与复杂叙事流的编排**

*   **当前 Schema 设计**: 提供了 `next_scene_id`, `prev_scene_id` 和 `conditional_next_scene`。
*   **核心问题**:
    *   **对于 AIGC 可能会生成的更复杂的“互动小说”或“多结局故事”，Schema 如何支持非线性的、基于用户决策的多路径叙事流？** (例如：引入 `graph_edges` 概念，或一个 `choice_points` 数组，每个选择指向不同的 `next_scene_id` 集合？)
    *   **为了确保故事逻辑的连贯性，Schema 是否应该包含“状态管理”机制？** (例如：记录用户在某个场景中做了什么，这个状态如何影响后续场景的加载或对话？) 如果是，如何设计这个 `story_state` 字段及其更新规则？

---

## **Q4: 本地化 (Localisation) 的精细粒度**

*   **当前 Schema 设计**: 提供了 `language_pairs` 和 `dialogue.lines[].translation`。
*   **核心问题**:
    *   **除了文本和音频（`dialogue.audio`），如果背景图、角色穿着、可交互物品本身也需要根据不同的语言/文化环境进行本地化（例如：某个文化中不能出现猪），Schema 应该如何设计字段来支持这种“资产级别”的本地化？**
    *   **对于 AIGC 批量生成而言，是让 AIGC 直接生成特定语言/文化的资产，还是生成通用资产，再通过 Schema 中的指令进行“本地化变形”？** 这两种策略如何体现在 Schema 的设计中？
