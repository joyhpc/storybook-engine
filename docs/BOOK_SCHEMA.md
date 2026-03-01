# 量产 Book Schema 设计

## 目标

设计一个 JSON 规范，支持：
1. **多场景/多页** — 一本书包含多个场景，支持翻页
2. **AIGC 批量生产** — 每个场景可独立生成（Imagen3 + ElevenLabs）
3. **向后兼容** — 现有单场景 `scene.json` 可无缝升级

## 核心设计原则

1. **场景独立性** — 每个场景是独立的 JSON 对象，可单独生成和测试
2. **渐进式加载** — 首屏只加载第一个场景，后续场景按需加载
3. **状态持久化** — 记录用户进度（已完成的场景）
4. **灵活的导航** — 支持线性翻页、跳转、分支剧情

---

## Schema 设计

### 顶层结构：`book.json`

```json
{
  "meta": {
    "book_id": "little_prince_fox",
    "title": "小王子与狐狸 | The Little Prince and the Fox",
    "version": "1.0.0",
    "language": ["en", "zh"],
    "target_age": "4-8",
    "author": "AIGC Pipeline",
    "created_at": "2026-03-01"
  },
  "config": {
    "navigation": {
      "type": "linear",  // linear | free | branching
      "show_progress": true,
      "allow_skip": false
    },
    "ui": {
      "theme": "night_sky",
      "font_family": "Nunito",
      "subtitle_position": "top"
    }
  },
  "scenes": [
    {
      "id": "scene_01",
      "title": "遇见狐狸",
      "data_url": "data/scenes/scene_01.json",
      "thumbnail": "assets/thumbnails/scene_01.jpg",
      "duration_estimate": 30  // 预估完成时间（秒）
    },
    {
      "id": "scene_02",
      "title": "喂养狐狸",
      "data_url": "data/scenes/scene_02.json",
      "thumbnail": "assets/thumbnails/scene_02.jpg",
      "duration_estimate": 45
    },
    {
      "id": "scene_03",
      "title": "驯养的秘密",
      "data_url": "data/scenes/scene_03.json",
      "thumbnail": "assets/thumbnails/scene_03.jpg",
      "duration_estimate": 60
    }
  ],
  "navigation_rules": {
    "scene_01": {
      "next": "scene_02",
      "unlock_condition": "interaction_success"
    },
    "scene_02": {
      "next": "scene_03",
      "unlock_condition": "interaction_success"
    },
    "scene_03": {
      "next": null,  // 最后一页
      "unlock_condition": null
    }
  }
}
```

### 单场景结构：`scene_XX.json`

**保持现有 `scene.json` 结构不变**，只需确保每个场景是独立的：

```json
{
  "meta": {
    "scene_id": "scene_01",
    "title": "遇见狐狸",
    "version": "1.0.0"
  },
  "scene": {
    "id": "meet_fox",
    "background": { ... },
    "characters": [ ... ],
    "items": [ ... ]
  },
  "interaction": { ... },
  "dialogues": { ... },
  "ui": { ... }
}
```

---

## 翻页引擎设计

### 核心 API

```javascript
class BookEngine {
  constructor(bookJsonUrl) {
    this.bookData = null;
    this.currentSceneIndex = 0;
    this.sceneCache = new Map();  // 缓存已加载的场景
    this.progress = this._loadProgress();  // 从 localStorage 读取进度
  }

  async loadBook() {
    // 加载 book.json
    const resp = await fetch(bookJsonUrl);
    this.bookData = await resp.json();
    
    // 预加载第一个场景
    await this.loadScene(0);
  }

  async loadScene(index) {
    const sceneInfo = this.bookData.scenes[index];
    if (this.sceneCache.has(sceneInfo.id)) {
      return this.sceneCache.get(sceneInfo.id);
    }

    const resp = await fetch(sceneInfo.data_url);
    const sceneData = await resp.json();
    this.sceneCache.set(sceneInfo.id, sceneData);
    return sceneData;
  }

  async nextScene() {
    if (this.currentSceneIndex >= this.bookData.scenes.length - 1) {
      return null;  // 已经是最后一页
    }

    // 检查解锁条件
    const currentSceneId = this.bookData.scenes[this.currentSceneIndex].id;
    const rule = this.bookData.navigation_rules[currentSceneId];
    
    if (rule.unlock_condition && !this._checkCondition(rule.unlock_condition)) {
      return null;  // 未满足解锁条件
    }

    this.currentSceneIndex++;
    const sceneData = await this.loadScene(this.currentSceneIndex);
    
    // 保存进度
    this._saveProgress();
    
    return sceneData;
  }

  async prevScene() {
    if (this.currentSceneIndex <= 0) {
      return null;
    }
    this.currentSceneIndex--;
    return await this.loadScene(this.currentSceneIndex);
  }

  _checkCondition(condition) {
    // 检查解锁条件（如 interaction_success）
    return this.progress.completed_scenes.includes(
      this.bookData.scenes[this.currentSceneIndex].id
    );
  }

  _loadProgress() {
    const saved = localStorage.getItem('book_progress');
    return saved ? JSON.parse(saved) : { completed_scenes: [] };
  }

  _saveProgress() {
    const sceneId = this.bookData.scenes[this.currentSceneIndex].id;
    if (!this.progress.completed_scenes.includes(sceneId)) {
      this.progress.completed_scenes.push(sceneId);
    }
    localStorage.setItem('book_progress', JSON.stringify(this.progress));
  }
}
```

### 翻页动画

```javascript
class PageTransition {
  static async slideLeft(oldStage, newStage) {
    // 旧场景向左滑出
    oldStage.style.transition = 'transform 0.5s ease-out';
    oldStage.style.transform = 'translateX(-100%)';
    
    // 新场景从右侧滑入
    newStage.style.transform = 'translateX(100%)';
    newStage.style.transition = 'transform 0.5s ease-out';
    
    await new Promise(resolve => setTimeout(resolve, 50));
    newStage.style.transform = 'translateX(0)';
    
    await new Promise(resolve => setTimeout(resolve, 500));
    oldStage.remove();
  }

  static async fadeInOut(oldStage, newStage) {
    oldStage.style.transition = 'opacity 0.3s';
    oldStage.style.opacity = '0';
    
    await new Promise(resolve => setTimeout(resolve, 300));
    oldStage.remove();
    
    newStage.style.opacity = '0';
    newStage.style.transition = 'opacity 0.3s';
    await new Promise(resolve => setTimeout(resolve, 50));
    newStage.style.opacity = '1';
  }
}
```

---

## AIGC 流水线升级

### 批量生产��本：`build_book.py`

```python
#!/usr/bin/env python3
"""
批量生成整本书的所有场景

用法:
    python tools/build_book.py --book-config book_config.yaml
"""

import argparse
import yaml
from pathlib import Path

def build_book(config_path: Path):
    """根据 YAML 配置批量生成所有场景"""
    with open(config_path) as f:
        config = yaml.safe_load(f)
    
    book_id = config['book_id']
    scenes = config['scenes']
    
    print(f"开始构建书籍: {book_id}")
    print(f"共 {len(scenes)} 个场景")
    
    for i, scene in enumerate(scenes, 1):
        print(f"\n[{i}/{len(scenes)}] 生成场景: {scene['id']}")
        
        # 生成背景图
        bg_path = generate_image(
            scene_description=scene['scene_description'],
            output_path=Path(f"assets/scenes/{scene['id']}_bg.jpg")
        )
        
        # 生成配音 + 时间戳
        audio_path = Path(f"assets/audio/{scene['id']}.mp3")
        word_timings = generate_speech_with_timestamps(
            text=scene['dialogue_text'],
            voice_id=scene.get('voice_id', DEFAULT_VOICE),
            output_path=audio_path
        )
        
        # 生成 scene_XX.json
        scene_json = build_scene_json(
            scene_id=scene['id'],
            title=scene['title'],
            text_en=scene['dialogue_text'],
            text_zh=scene.get('dialogue_text_zh', ''),
            word_timings=word_timings,
            bg_rel=f"../../assets/scenes/{scene['id']}_bg.jpg",
            audio_rel=f"../../assets/audio/{scene['id']}.mp3",
            characters=scene.get('characters', []),
            items=scene.get('items', []),
            interaction=scene.get('interaction', {})
        )
        
        output_path = Path(f"data/scenes/scene_{i:02d}.json")
        output_path.parent.mkdir(parents=True, exist_ok=True)
        output_path.write_text(json.dumps(scene_json, indent=2, ensure_ascii=False))
        
        print(f"    ✅ {output_path}")
    
    # 生成 book.json
    book_json = build_book_json(config)
    Path("data/book.json").write_text(json.dumps(book_json, indent=2, ensure_ascii=False))
    
    print(f"\n🎉 书籍构建完成: data/book.json")
```

### 配置文件示例：`book_config.yaml`

```yaml
book_id: little_prince_fox
title: 小王子与狐狸
language: [en, zh]
target_age: 4-8

scenes:
  - id: scene_01
    title: 遇见狐狸
    scene_description: "A small golden fox sitting alone in a magical forest clearing at twilight"
    dialogue_text: "Hello, little fox. You look lonely."
    dialogue_text_zh: "你好，小狐狸。你看起来很孤独。"
    characters:
      - id: fox
        img_src: "https://cdn-icons-png.flaticon.com/512/4322/4322691.png"
        position: {x: "70%", y: "60%"}
        states:
          lonely: {filter: "grayscale(0.5)", animation: "idle"}
          happy: {filter: "saturate(1.3)", animation: "jump"}
    items: []
    interaction: {}

  - id: scene_02
    title: 喂养狐狸
    scene_description: "The fox looking hungry, an apple nearby in the forest"
    dialogue_text: "The fox is hungry. Feed him!"
    dialogue_text_zh: "狐狸饿了，喂喂它吧！"
    characters:
      - id: fox
        img_src: "https://cdn-icons-png.flaticon.com/512/4322/4322691.png"
        position: {x: "72%", y: "58%"}
        states:
          hungry: {filter: "grayscale(1)", animation: "idle"}
          happy: {filter: "saturate(1.3)", animation: "jump"}
    items:
      - id: apple
        img_src: "https://cdn-icons-png.flaticon.com/512/415/415682.png"
        position: {x: "20%", y: "62%"}
        draggable: true
    interaction:
      type: drag_drop
      draggable_id: apple
      target_id: fox
      on_success:
        dialogue_text: "Yum! Please tame me!"
        dialogue_text_zh: "真好吃！请驯养我吧！"
```

---

## 实施计划

### Phase 1: BookEngine 核心（2天）
- [ ] `BookEngine` 类实现（加载/缓存/翻页）
- [ ] `PageTransition` 动画库
- [ ] 进度持久化（localStorage）
- [ ] 向后兼容测试（现有 scene.json 可作为单场景书）

### Phase 2: AIGC 流水线升级（2天）
- [ ] `build_book.py` 批量生产脚本
- [ ] `book_config.yaml` 配置规范
- [ ] 缩略图自动生成（从背景图裁剪）
- [ ] 错误处理和重试机制

### Phase 3: UI 增强（1天）
- [ ] 场景导航栏（显示进度）
- [ ] 翻页手势支持（swipe）
- [ ] 场景预览（缩略图网格）

---

## 下一步

1. 完成 `book.json` schema 定义
2. 实现 `BookEngine` 核心类
3. 升级 `build_book.py` 支持批量生产
4. 用《小王子与狐狸》3 个场景验证完整流程
