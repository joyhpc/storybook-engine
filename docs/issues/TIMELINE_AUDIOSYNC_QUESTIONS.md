# TIMELINE_AUDIOSYNC_QUESTIONS.md - Questions for Super LLM

Based on the proposed "Event-Driven Timeline Orchestrator" architecture for achieving millisecond-level audio-sync and interactive event scheduling in an AIGC-driven dynamic content environment, these are the most critical questions to guide its design. These questions address the complexities of concurrent time-based events, state synchronization, and cross-scene coordination.

---

## **Q1: 事件调度与并发冲突 (Event Scheduling & Concurrency)**

*   **当前架构**: 将时间事件 (audio-driven, timer-driven) 和用户交互事件都纳入 ECA 引擎。
*   **核心问题**:
    *   **当多个时间事件（例如：单词高亮、背景动画、粒子效果）和用户交互事件在同一毫秒发生时，引擎如何保证事件处理的确定性和顺序？**
    *   **是否存在“临界区”问题，即一个动作的执行会改变另一个动作的前提条件？Schema 如何预设或引擎如何智能处理这种冲突？** (例如：用户快速滑动跳过，在滑动完成前，某个单词高亮事件被触发，如何避免视觉上的闪烁或不连贯？)
    *   **对于需要持续状态更新的动画（例如：一个跟随手指移动的拖拽物，其位置需要在每一帧更新），ECA 架构是否需要引入一个更高频的“帧事件”，还是 `requestAnimationFrame` 本身就足够集成？** (如果足够，如何确保帧事件与常规 ECA 事件的优先级和调度？)

---

## **Q2: 时间事件与叙事状态的同步 (Timeline & Narrative State Sync)**

*   **当前架构**: 引入了 `scene_state`，且动作可以 `change_state`。时间事件作为触发器的一部分，可以改变 `scene_state`。
*   **核心问题**:
    *   **当用户“回放”或“快进”某个场景时，`AudioSyncEngine` 调整了 `audio.currentTime`，如何确保所有时间事件（包括已触发的和未触发的）的 `story_state` 与新的时间点完全同步？** (例如：如果音频快进到某个单词已说过的时间点，相关联的元素状态（如已显示）是否需要自动更新？)
    *   **Schema 中是否需要引入“时间检查点”或“快照”机制，来记录某个时间点或某个关键事件发生后的场景完整状态，以便在时间轴回溯时能够快速恢复？** 如何在 AIGC 生成时优化这些检查点的粒度（例如：每 5 秒一个检查点，或在每个关键互动前后设置检查点）？
    *   **如果某个 `action` 的执行需要等待一段时间（例如 `delay_ms`），而在此期间用户又触发了另一个中断性事件，这些延迟动作应该如何被取消或调整？** (例如：引入一个“任务调度器”来管理这些异步延迟动作的生命周期？)

---

## **Q3: 跨场景时间协调与预加载 (Cross-Scene Timeline & Preloading)**

*   **当前架构**: 专注于单场景内的事件和状态管理。
*   **核心问题**:
    *   **在多场景的绘本中，如何实现跨场景的时间事件协调？** (例如：某个全局背景音乐在多场景间平滑过渡，或者一个长期任务（如作物生长动画）需要跨场景继续进行，而不被重置？)
    *   **为了保证流畅的用户体验（尤其是掩盖 AIGC 后端生成延迟），Schema 如何指导引擎进行智能的“时间感知预加载”？** (例如：当用户停留在场景 A 时，引擎根据关键路径时间预估，静默加载场景 B 的音频、图片和 AIGC 资产。) 如何在 Schema 中表达预加载的优先级和策略？
    *   **如果 AIGC 生成的场景导致某个任务的工期显著增加（例如：某个 AIGC 生成的实时交互任务需要 10 秒，而下一场景的关键事件在 5 秒后），引擎如何识别并给出警告，甚至在 Schema 中提供“时间弹性”机制**（例如：允许调整场景间过渡时间以适应 AIGC 生成延迟，或在 Schema 中定义一个“最小等待时间”直到关键 AIGC 资产就绪）？
