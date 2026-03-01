# kids-book-engine

沉浸式双语互动绘本 — 量产引擎

## 架构

- `js/engine.js` — 通用播放引擎（SceneLoader / DragDropEngine / AudioSyncEngine / ParticleSystem）
- `data/scene.json` — JSON 驱动的场景数据（内容与代码完全分离）
- `tools/build_book.py` — AIGC 流水线（Imagen3 生图 + ElevenLabs TTS + 字符级时间戳）
- `css/style.css` — 移动端优先样式

## 快速开始

```bash
# 本地预览
python3 -m http.server 8080

# AIGC 批量生产
export GEMINI_API_KEY=xxx
export ELEVENLABS_API_KEY=xxx
python3 tools/build_book.py \
  --text "The fox is hungry. Feed him!" \
  --scene "A small fox sitting alone in a magical forest at night"
```

## 路线图

- [x] v1: 单场景引擎（DragDrop + AudioSync + Particle）
- [ ] v2: 多场景/翻页引擎 + 量产 Book Schema
- [ ] v3: AIGC 流水线完整闭环
