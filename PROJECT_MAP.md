# Storybook Engine - 项目地图

## 当前状态

**GitHub**: https://github.com/joyhpc/storybook-engine  
**进度**: 11/22 (50%)  
**总工期**: 7 天  
**关键路径**: 7 个节点

---

## 已完成 ✅ (11/22)

### 设计阶段 (6/6) ✅
1. ✅ **需求分析与商业逻辑验证** — 单页 MVP vs 量产引擎路径评估
2. ✅ **内容选择** — 《小王子》与狐狸片段
3. ✅ **JSON Schema 设计** — scene_schema.json (background/dialogue/interactions)
4. ✅ **技术架构设计** — DragEngine/AudioSyncEngine/SceneRenderer
5. ✅ **设计评审** — 里程碑
6. ✅ **量产 Book Schema 设计** — 多场景 JSON 规范（当前进行中）

### 开发阶段 (5/8) ✅
7. ✅ **拖拽交互引擎** — Touch Events + Transform (GPU 加速)
8. ✅ **字音同步引擎** — HTML5 Audio + requestAnimationFrame (60fps)
9. ✅ **场景渲染器** — JSON 驱动的动态渲染
10. ✅ **素材 Mock** — 占位符图片 + 示例音频
11. ✅ **引擎集成** — v1 单场景引擎完成

---

## 待完成 ⏳ (11/22)

### 开发阶段 (3/8)
12. ⏳ **多场景/翻页引擎** 🔴 (关键路径, 2天)
   - 场景切换逻辑
   - 翻页动画 (swipe/fade)
   - 进度条/导航
   - **依赖**: 量产 Book Schema

13. ⏳ **AIGC 流水线** 🔴 (关键路径, 2天)
   - Imagen 3 生图集成
   - ElevenLabs TTS + 字符级时间戳
   - Whisper Forced Alignment
   - 自动化脚本 (build_book.py 已有基础)
   - **依赖**: 量产 Book Schema

14. ⏳ **开发完成里程碑** (slack=2天)

### 测试与优化 (0/4)
15. ⏳ **移动端适配与防误触** 🔴 (关键路径, 2天)
   - iOS Safari / Android Chrome 兼容
   - 微信内置浏览器测试
   - 防误触优化 (下拉刷新/长按/双击)
   - **依赖**: 多场景引擎 + AIGC 流水线

16. ⏳ **性能测试** (1天, slack=3天)
   - 低端机测试 (iPhone 8 / 安卓中端机)
   - 弱网测试 (3G 网络)
   - 加载时间优化

17. ⏳ **动效与音效打磨** 🔴 (关键路径, 2天)
   - 拖拽回弹动画
   - 成功/失败音效
   - 粒子特效优化
   - **依赖**: 移动端适配 + 性能测试

18. ⏳ **测试通过里程碑** 🔴 (关键路径)

### 发布与验证 (0/4)
19. ⏳ **短视频录制** 🔴 (关键路径, 1天, pengzi 负责)
   - 15 秒 Aha Moment 惊艳时刻
   - 小红书/抖音引流素材
   - **依赖**: 测试通过

20. ⏳ **H5 部署** 🔴 (关键路径, 1天)
   - 微信可访问
   - CDN 加速
   - **依赖**: 测试通过

21. ⏳ **GitHub Pages 部署** 🔴 (关键路径, 1天)
   - 免费托管
   - 自定义域名（可选）
   - **依赖**: 测试通过

22. ⏳ **MVP 发布里程碑** 🔴 (关键路径)

---

## 关键路径 (7 天)

```
book_schema (1d) 
  → aigc_pipeline (2d) 
  → multi_scene (2d) 
  → mobile_optimize (2d) 
  → ux_polish (2d) 
  → deploy/github_pages/video_capture (1d) 
  → ms_launch
```

---

## 下一步行动

### 立即可做 (关键路径 slack=0)
1. **完成 book_schema 设计** (当前进行中)
   - 定义多场景 JSON 结构
   - 场景间跳转逻辑
   - 全局配置 (书籍元数据/主题色/字体)

### 然后并行开发
2. **multi_scene 翻页引擎** (2天)
3. **aigc_pipeline 完善** (2天)

### 最后集成测试
4. **移动端适配** → **动效打磨** → **部署发布**

---

## 技术栈

- **前端**: 纯原生 HTML5/CSS3/ES6 (零依赖)
- **引擎**: DragEngine / AudioSyncEngine / SceneRenderer / ParticleSystem
- **AIGC**: Gemini Imagen 3 (生图) + ElevenLabs (TTS) + Whisper (时间戳)
- **部署**: GitHub Pages (免费) + 微信 H5
- **工具**: Python 3.10+ (build_book.py)

---

## 商业目标

1. **流量**: 短视频引流 (完播率 >60%, 点击率 >5%)
2. **转化**: 试玩→付费 >3% (单本 ¥9.9 或 VIP ¥99/年)
3. **规模化**: AI 批量生产 100+ 本 (单本成本 <¥50)

---

**最后更新**: 2026-03-01 19:30
