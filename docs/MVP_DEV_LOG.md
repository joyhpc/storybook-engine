# MVP 开发日志

**分支**: `mvp`  
**最后更新**: 2026-03-03 21:00 GMT+8

---

## 当前状态

### ✅ 已完成

1.  **项目结构搭建**
    - 基于 `kids-book-engine` v3 的 `engine.js`
    - 新增 `js/book-data.js` (3 个场景的示例数据)
    - 修改 `index.html` 引入 `book-data.js`
    - 新增导航按钮 CSS 样式

2.  **NavigationEngine 模块**
    - `init(stageEl, bookData, onSceneChange)`: 初始化导航引擎
    - `goToScene(index)`: 跳转到指定场景
    - `goToNextScene()`: 跳转到下一个场景
    - `goToPrevScene()`: 跳转到上一个场景
    - `restartBook()`: 重新开始
    - `getCurrentScene()`: 获取当前场景

3.  **App 模块重构**
    - `boot()`: 从 `window.__BOOK_DATA__` 加载整本书数据
    - `renderScene(sceneData)`: 渲染指定场景
    - `_handleInteractionSuccess()`: 处理交互成功后的逻辑
    - `_setupNavButtons()`: 设置导航按钮
    - `_updateNavButtonsVisibility()`: 更新导航按钮可见性

4.  **SceneLoader 模块修改**
    - `render(stageEl, scene, dialogues, ui)`: 接收场景数据作为参数
    - `switchDialogue(dialogueId)`: 切换对话
    - `getDialogues()`: 获取当前场景的 dialogues 数据

5.  **示例数据 (book-data.js)**
    - 场景 1: 喂狐狸 (拖拽苹果给狐狸)
    - 场景 2: 驯服狐狸 (拖拽玫瑰给狐狸)
    - 场景 3: 告别 (点击狐狸听秘密)

---

## 🔧 待修复的问题

### 1. 场景切换时的清理问题
**问题**: 当前 `renderScene` 函数使用 `_stageEl.innerHTML = ''` 清空舞台，这会导致 Canvas 元素被删除，需要重新创建。

**解决方案**: 
- 保留 Canvas 元素，只清理其他场景元素
- 或者在清空后立即重新创建 Canvas

### 2. DragDropEngine 的事件监听清理
**问题**: `DragDropEngine.destroy()` 需要正确清理旧场景的事件监听，避免内存泄漏。

**解决方案**: 
- 确保 `destroy()` 函数正确移除所有事件监听器
- 在场景切换前调用 `destroy()`

### 3. AudioSyncEngine 的状态管理
**问题**: 场景切换时，如果音频正在播放，需要停止旧场景的音频。

**解决方案**: 
- 在 `renderScene` 开始时调用 `AudioSyncEngine.stop()`

### 4. 导航按钮的显示逻辑
**问题**: 当前导航按钮的显示逻辑依赖于 `ui.nav_button.show_after_interaction`，但在某些场景中可能需要立即显示。

**解决方案**: 
- 完善 `_updateNavButtonsVisibility()` 函数的逻辑
- 支持更灵活的显示条件

---

## 📋 下一步计划

### Phase 1: 修复核心问题 (优先级: 高)

1.  **测试多场景导航**
    - 在浏览器中打开 `index.html`
    - 测试场景 1 → 场景 2 → 场景 3 的切换
    - 测试"重新开始"功能

2.  **修复场景切换时的清理问题**
    - 确保 Canvas 元素不被删除
    - 确保 ParticleSystem 正确销毁和重新初始化
    - 确保 DragDropEngine 正确销毁和重新初始化

3.  **修复音频同步问题**
    - 确保场景切换时停止旧场景的音频
    - 确保新场景的音频正常播放

### Phase 2: 优化与打磨 (优先级: 中)

1.  **场景切换动画**
    - 添加淡入淡出效果
    - 添加滑动效果

2.  **移动端适配**
    - 测试触摸手势
    - 测试响应式布局

3.  **性能优化**
    - 资源懒加载
    - Canvas 优化

### Phase 3: AIGC 集成 (优先级: 中)

1.  **接入 build_book.py**
    - 修改 `build_book.py` 以生成 `book-data.js` 格式的数据
    - 测试 AIGC 生成的图片和音频

2.  **部署到 GitHub Pages**
    - 配置 GitHub Pages
    - 测试在线访问

---

## 🐛 已知问题

1.  **场景切换时 Canvas 被删除**: 需要修复 `renderScene` 函数的清理逻辑
2.  **导航按钮可能不显示**: 需要完善 `_updateNavButtonsVisibility()` 函数
3.  **音频可能不停止**: 需要在场景切换时调用 `AudioSyncEngine.stop()`

---

## 📝 技术债务

1.  **SceneLoader 的 `_data` 变量**: 当前 `SceneLoader` 仍然保留了 `_data` 变量，但在 MVP 中已不再使用。可以考虑在后续版本中移除。
2.  **导航按钮的 UI**: 当前导航按钮的 UI 比较简单，可以考虑在后续版本中增强。
3.  **错误处理**: 当前代码中缺少完善的错误处理机制，需要在后续版本中补充。

---

## 🎯 MVP 验收标准

1.  ✅ 可以在浏览器中打开并运行
2.  ⏳ 可以通过点击或滑动切换场景
3.  ⏳ 每个场景的交互和字音同步正常工作
4.  ⏳ AIGC 生成的图片和音频正常加载
5.  ⏳ 部署到 GitHub Pages 并可在线访问

---

*本文档由 Nova 维护，记录 MVP 开发的进展和问题。*
