/**
 * 多场景绘本数据 - MVP 示例
 * 包含 3 个场景：喂狐狸 → 驯服狐狸 → 告别
 */
window.__BOOK_DATA__ = {
  "meta": {
    "book_id": "little_prince_fox_mvp",
    "title": "小王子与狐狸 | The Little Prince and the Fox",
    "version": "1.0.0-mvp",
    "language": ["en", "zh"],
    "target_age": "4-8"
  },
  "scenes": [
    // ========== 场景 1: 喂狐狸 ==========
    {
      "scene_id": "scene_1_feed",
      "scene_index": 0,
      "background": {
        "type": "canvas",
        "gradient": "linear-gradient(180deg, #05080F 0%, #0B1026 12%, #111D4A 28%, #162458 45%, #0f2040 65%, #0a1830 82%, #060e20 100%)",
        "particles": true
      },
      "characters": [
        {
          "id": "fox",
          "img_src": "https://cdn-icons-png.flaticon.com/512/4322/4322691.png",
          "label": "Fox",
          "position": { "x": "72%", "y": "58%" },
          "width": "150px",
          "height": "150px",
          "states": {
            "hungry": {
              "filter": "grayscale(1) brightness(0.5)",
              "animation": "fox-idle",
              "label_zh": "饥饿的狐狸"
            },
            "happy": {
              "filter": "saturate(1.3) brightness(1.15) drop-shadow(0 0 20px rgba(255,165,0,0.5))",
              "animation": "fox-jump",
              "label_zh": "开心的狐狸"
            }
          },
          "initial_state": "hungry"
        }
      ],
      "items": [
        {
          "id": "apple",
          "img_src": "https://cdn-icons-png.flaticon.com/512/415/415682.png",
          "label": "Apple",
          "position": { "x": "20%", "y": "62%" },
          "width": "90px",
          "height": "90px",
          "draggable": true,
          "animation": "item-bounce"
        }
      ],
      "interaction": {
        "type": "drag_and_drop",
        "draggable_id": "apple",
        "target_id": "fox",
        "hit_tolerance": 60,
        "on_fail": { "action": "spring_back", "duration_ms": 400, "easing": "cubic-bezier(0.34, 1.56, 0.64, 1)" },
        "on_success": {
          "actions": [
            { "type": "hide_item", "target": "apple", "animation": "pop-vanish" },
            { "type": "change_state", "target": "fox", "to_state": "happy" },
            { "type": "play_dialogue", "dialogue_id": "after_feed" },
            { "type": "show_particles", "emoji": "✨", "count": 8, "duration_ms": 1200 }
          ]
        }
      },
      "dialogues": {
        "intro": {
          "id": "intro",
          "text_en": "The fox is hungry. Feed him!",
          "text_zh": "狐狸饿了，喂喂它吧！",
          "words": [
            { "word": "The", "start_time": 0.0, "end_time": 0.25 },
            { "word": "fox", "start_time": 0.25, "end_time": 0.55 },
            { "word": "is", "start_time": 0.55, "end_time": 0.70 },
            { "word": "hungry.", "start_time": 0.70, "end_time": 1.15 },
            { "word": "Feed", "start_time": 1.25, "end_time": 1.55 },
            { "word": "him!", "start_time": 1.55, "end_time": 1.90 }
          ],
          "auto_play": true,
          "display_on": "scene_ready"
        },
        "after_feed": {
          "id": "after_feed",
          "text_en": "Yum! Please tame me!",
          "text_zh": "好吃！请驯服我吧！",
          "words": [
            { "word": "Yum!", "start_time": 0.0, "end_time": 0.45 },
            { "word": "Please", "start_time": 0.55, "end_time": 0.95 },
            { "word": "tame", "start_time": 0.95, "end_time": 1.30 },
            { "word": "me!", "start_time": 1.30, "end_time": 1.70 }
          ],
          "auto_play": true,
          "display_on": "interaction_success"
        }
      },
      "ui": {
        "subtitle_panel": {
          "position": "top",
          "height": "auto",
          "padding": "1.2rem",
          "font_size": "1.6rem",
          "highlight_color": "#d4af37",
          "highlight_scale": 1.15,
          "normal_color": "#FFFFFF",
          "bg_color": "rgba(15,20,30,0.4)",
          "border_radius": "20px"
        },
        "hint": {
          "text_en": "Drag the apple to the fox!",
          "text_zh": "✨ 把苹果拖给小狐狸吧！",
          "show_after_ms": 2500,
          "position": "bottom",
          "font_size": "1.1rem"
        },
        "nav_button": {
          "show": true,
          "text": "下一页 →",
          "position": "bottom-right",
          "show_after_interaction": true
        }
      },
      "next_scene": "scene_2_tame"
    },

    // ========== 场景 2: 驯服狐狸 ==========
    {
      "scene_id": "scene_2_tame",
      "scene_index": 1,
      "background": {
        "type": "css_gradient",
        "value": "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
      },
      "characters": [
        {
          "id": "fox",
          "img_src": "https://cdn-icons-png.flaticon.com/512/4322/4322691.png",
          "label": "Fox",
          "position": { "x": "50%", "y": "55%" },
          "width": "180px",
          "height": "180px",
          "states": {
            "waiting": {
              "filter": "brightness(1.0)",
              "animation": "fox-idle",
              "label_zh": "等待的狐狸"
            },
            "tamed": {
              "filter": "saturate(1.5) brightness(1.2) drop-shadow(0 0 30px rgba(255,215,0,0.8))",
              "animation": "fox-spin",
              "label_zh": "被驯服的狐狸"
            }
          },
          "initial_state": "waiting"
        },
        {
          "id": "prince",
          "img_src": "https://cdn-icons-png.flaticon.com/512/3940/3940403.png",
          "label": "Little Prince",
          "position": { "x": "25%", "y": "55%" },
          "width": "120px",
          "height": "120px",
          "states": {
            "normal": {
              "filter": "brightness(1.0)",
              "animation": "idle"
            }
          },
          "initial_state": "normal"
        }
      ],
      "items": [
        {
          "id": "rose",
          "img_src": "https://cdn-icons-png.flaticon.com/512/2909/2909937.png",
          "label": "Rose",
          "position": { "x": "75%", "y": "60%" },
          "width": "80px",
          "height": "80px",
          "draggable": true,
          "animation": "item-bounce"
        }
      ],
      "interaction": {
        "type": "drag_and_drop",
        "draggable_id": "rose",
        "target_id": "fox",
        "hit_tolerance": 70,
        "on_fail": { "action": "spring_back", "duration_ms": 400 },
        "on_success": {
          "actions": [
            { "type": "hide_item", "target": "rose", "animation": "pop-vanish" },
            { "type": "change_state", "target": "fox", "to_state": "tamed" },
            { "type": "play_dialogue", "dialogue_id": "tamed" },
            { "type": "show_particles", "emoji": "🌟", "count": 12, "duration_ms": 1500 }
          ]
        }
      },
      "dialogues": {
        "intro": {
          "id": "intro",
          "text_en": "Give the fox a rose to tame him.",
          "text_zh": "送一朵玫瑰给狐狸，驯服它。",
          "words": [
            { "word": "Give", "start_time": 0.0, "end_time": 0.30 },
            { "word": "the", "start_time": 0.30, "end_time": 0.45 },
            { "word": "fox", "start_time": 0.45, "end_time": 0.75 },
            { "word": "a", "start_time": 0.75, "end_time": 0.85 },
            { "word": "rose", "start_time": 0.85, "end_time": 1.20 },
            { "word": "to", "start_time": 1.20, "end_time": 1.35 },
            { "word": "tame", "start_time": 1.35, "end_time": 1.70 },
            { "word": "him.", "start_time": 1.70, "end_time": 2.00 }
          ],
          "auto_play": true
        },
        "tamed": {
          "id": "tamed",
          "text_en": "You are now my friend forever!",
          "text_zh": "你现在是我永远的朋友了！",
          "words": [
            { "word": "You", "start_time": 0.0, "end_time": 0.25 },
            { "word": "are", "start_time": 0.25, "end_time": 0.45 },
            { "word": "now", "start_time": 0.45, "end_time": 0.75 },
            { "word": "my", "start_time": 0.75, "end_time": 0.95 },
            { "word": "friend", "start_time": 0.95, "end_time": 1.35 },
            { "word": "forever!", "start_time": 1.35, "end_time": 1.85 }
          ],
          "auto_play": true
        }
      },
      "ui": {
        "hint": {
          "text_en": "Drag the rose to the fox!",
          "text_zh": "✨ 把玫瑰拖给狐狸！",
          "show_after_ms": 2500
        },
        "nav_button": {
          "show": true,
          "text": "下一页 →",
          "show_after_interaction": true
        }
      },
      "next_scene": "scene_3_goodbye"
    },

    // ========== 场景 3: 告别 ==========
    {
      "scene_id": "scene_3_goodbye",
      "scene_index": 2,
      "background": {
        "type": "css_gradient",
        "value": "linear-gradient(to bottom, #ffecd2 0%, #fcb69f 100%)"
      },
      "characters": [
        {
          "id": "fox",
          "img_src": "https://cdn-icons-png.flaticon.com/512/4322/4322691.png",
          "label": "Fox",
          "position": { "x": "65%", "y": "55%" },
          "width": "150px",
          "height": "150px",
          "states": {
            "sad": {
              "filter": "brightness(0.9) saturate(0.8)",
              "animation": "fox-idle",
              "label_zh": "伤心的狐狸"
            }
          },
          "initial_state": "sad"
        },
        {
          "id": "prince",
          "img_src": "https://cdn-icons-png.flaticon.com/512/3940/3940403.png",
          "label": "Little Prince",
          "position": { "x": "30%", "y": "55%" },
          "width": "120px",
          "height": "120px",
          "states": {
            "waving": {
              "filter": "brightness(1.0)",
              "animation": "wave"
            }
          },
          "initial_state": "waving"
        }
      ],
      "items": [],
      "interaction": {
        "type": "click",
        "target_id": "fox",
        "on_success": {
          "actions": [
            { "type": "play_dialogue", "dialogue_id": "secret" },
            { "type": "show_particles", "emoji": "💫", "count": 10, "duration_ms": 2000 }
          ]
        }
      },
      "dialogues": {
        "intro": {
          "id": "intro",
          "text_en": "It's time to say goodbye.",
          "text_zh": "是时候说再见了。",
          "words": [
            { "word": "It's", "start_time": 0.0, "end_time": 0.30 },
            { "word": "time", "start_time": 0.30, "end_time": 0.65 },
            { "word": "to", "start_time": 0.65, "end_time": 0.80 },
            { "word": "say", "start_time": 0.80, "end_time": 1.10 },
            { "word": "goodbye.", "start_time": 1.10, "end_time": 1.70 }
          ],
          "auto_play": true
        },
        "secret": {
          "id": "secret",
          "text_en": "Here is my secret: One sees clearly only with the heart.",
          "text_zh": "这是我的秘密：只有用心才能看清事物的本质。",
          "words": [
            { "word": "Here", "start_time": 0.0, "end_time": 0.30 },
            { "word": "is", "start_time": 0.30, "end_time": 0.45 },
            { "word": "my", "start_time": 0.45, "end_time": 0.65 },
            { "word": "secret:", "start_time": 0.65, "end_time": 1.15 },
            { "word": "One", "start_time": 1.25, "end_time": 1.50 },
            { "word": "sees", "start_time": 1.50, "end_time": 1.80 },
            { "word": "clearly", "start_time": 1.80, "end_time": 2.25 },
            { "word": "only", "start_time": 2.25, "end_time": 2.55 },
            { "word": "with", "start_time": 2.55, "end_time": 2.75 },
            { "word": "the", "start_time": 2.75, "end_time": 2.90 },
            { "word": "heart.", "start_time": 2.90, "end_time": 3.40 }
          ],
          "auto_play": false
        }
      },
      "ui": {
        "hint": {
          "text_en": "Click the fox to hear his secret!",
          "text_zh": "✨ 点击狐狸听听它的秘密！",
          "show_after_ms": 2500
        },
        "nav_button": {
          "show": true,
          "text": "重新开始",
          "show_after_interaction": true,
          "action": "restart"
        }
      },
      "next_scene": null
    }
  ]
};
