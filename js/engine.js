/**
 * ============================================================
 *  《沉浸式双语互动绘本》通用播放引擎 v3
 *  纯 Vanilla JS · JSON 驱动 · 图片占位符体系 · Canvas 粒子
 *
 *  核心状态机（绝对不动）：DragDropEngine / AudioSyncEngine
 *  渲染层 v3：img 占位符 + ParticleSystem（Canvas 超新星）
 * ============================================================
 */

/* ==================== SceneLoader 模块 ==================== */
const SceneLoader = (() => {
  let _data = null;
  let _stageEl = null;
  let _dialogues = null; // 新增：当前场景的 dialogues 数据

  async function load(url) {
    try {
      const resp = await fetch(url);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      _data = await resp.json();
    } catch (e) {
      console.warn('fetch 加载失败，使用内嵌数据降级:', e.message);
      if (window.__SCENE_DATA__) {
        _data = window.__SCENE_DATA__;
      } else {
        throw new Error('场景数据加载失败，请使用本地服务器运行');
      }
    }
    return _data;
  }

  function render(stageEl, scene, dialogues, ui) {
    _stageEl = stageEl;
    _dialogues = dialogues; // 保存当前场景的 dialogues 数据
    if (!scene) throw new Error('场景数据为空');

    // 不再依赖 _data，直接使用传入的参数

    // —— 渲染背景 ——
    if (scene.background.type === 'css_gradient') {
      _stageEl.style.background = scene.background.value;
    } else if (scene.background.type === 'image') {
      _stageEl.style.background = `url('${scene.background.src}') center/cover no-repeat`;
    } else if (scene.background.type === 'canvas') {
      if (scene.background.gradient) {
        _stageEl.style.background = scene.background.gradient;
      }
    }

    // —— 渲染角色 ——
    scene.characters.forEach(ch => {
      const el = document.createElement('div');
      el.id = ch.id;
      el.className = 'scene-character';

      if (ch.img_src) {
        const img = document.createElement('img');
        img.src = ch.img_src;
        img.alt = ch.label || '';
        img.draggable = false;
        el.appendChild(img);
      }

      if (ch.width) el.style.width = ch.width;
      if (ch.height) el.style.height = ch.height;
      el.style.left = ch.position.x;
      el.style.top = ch.position.y;

      const initState = ch.states[ch.initial_state];
      if (initState) {
        el.style.filter = initState.filter;
        if (initState.animation) el.classList.add('anim-' + initState.animation);
      }

      el.dataset.states = JSON.stringify(ch.states);
      _stageEl.appendChild(el);
    });

    // —— 渲染可拖拽物品 ——
    scene.items.forEach(item => {
      const el = document.createElement('div');
      el.id = item.id;
      el.className = 'scene-item';

      if (item.img_src) {
        const img = document.createElement('img');
        img.src = item.img_src;
        img.alt = item.label || '';
        img.draggable = false;
        el.appendChild(img);
      }

      if (item.width) el.style.width = item.width;
      if (item.height) el.style.height = item.height;
      el.style.left = item.position.x;
      el.style.top = item.position.y;

      if (item.draggable) el.dataset.draggable = 'true';
      if (item.animation) el.classList.add('anim-' + item.animation);

      _stageEl.appendChild(el);
    });

    // —— 渲染字幕面板 ——
    _renderSubtitle(dialogues.intro);

    // —— 渲染底部提示 ——
    if (ui && ui.hint) {
      const hintBar = document.getElementById('hint-bar');
      if (hintBar) {
        hintBar.textContent = ui.hint.text_zh;
        setTimeout(() => hintBar.classList.add('visible'), ui.hint.show_after_ms || 2000);
      }
    }
  }

  function _renderSubtitle(dialogue) {
    const panel = document.getElementById('subtitle-panel');
    if (!panel || !dialogue) return;
    panel.innerHTML = '';

    const wordContainer = document.createElement('div');
    wordContainer.id = 'subtitle-words';
    wordContainer.style.display = 'flex';
    wordContainer.style.flexWrap = 'wrap';
    wordContainer.style.justifyContent = 'center';
    wordContainer.style.gap = '0.35em';
    wordContainer.style.width = '100%';

    dialogue.words.forEach((w, i) => {
      const span = document.createElement('span');
      span.className = 'word-span';
      span.textContent = w.word;
      span.dataset.index = i;
      span.dataset.start = w.start_time;
      span.dataset.end = w.end_time;
      wordContainer.appendChild(span);
    });
    panel.appendChild(wordContainer);

    if (dialogue.text_zh) {
      const zhLine = document.createElement('div');
      zhLine.id = 'subtitle-zh';
      zhLine.textContent = dialogue.text_zh;
      panel.appendChild(zhLine);
    }

    if (dialogue.auto_play) {
      setTimeout(() => AudioSyncEngine.play(dialogue), 600);
    }
  }

  function switchDialogue(dialogueId) {
    if (!_dialogues) return;
    const dlg = _dialogues[dialogueId];
    if (dlg) _renderSubtitle(dlg);
  }

  function getData() { return _data; }
  function getDialogues() { return _dialogues; } // 新增：获取当前场景的 dialogues 数据

  return { load, render, switchDialogue, getData, getDialogues };
})();


/* ==================== DragDropEngine 模块 ==================== */
/* ▼▼▼ 核心状态机：拖拽/碰撞/回弹/成功链 —— 一行不动 ▼▼▼ */
const DragDropEngine = (() => {
  let _dragging = null;
  let _offsetX = 0;
  let _offsetY = 0;
  let _startX = 0;
  let _startY = 0;
  let _interactionCfg = null;
  let _stageEl = null;
  let _onSuccessCallback = null;

  function init(stageEl, interactionCfg, onSuccess) {
    _stageEl = stageEl;
    _interactionCfg = interactionCfg;
    _onSuccessCallback = onSuccess;

    _stageEl.addEventListener('mousedown', _onStart, { passive: false });
    _stageEl.addEventListener('touchstart', _onStart, { passive: false });
    document.addEventListener('mousemove', _onMove, { passive: false });
    document.addEventListener('touchmove', _onMove, { passive: false });
    document.addEventListener('mouseup', _onEnd);
    document.addEventListener('touchend', _onEnd);
    document.addEventListener('touchcancel', _onEnd);
  }

  function _getPointer(e) {
    if (e.touches && e.touches.length > 0) {
      return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
    return { x: e.clientX, y: e.clientY };
  }

  function _onStart(e) {
    const target = e.target.closest('.scene-item[data-draggable="true"]');
    if (!target) return;
    e.preventDefault();

    _dragging = target;
    const rect = target.getBoundingClientRect();
    const ptr = _getPointer(e);

    _offsetX = ptr.x - rect.left - rect.width / 2;
    _offsetY = ptr.y - rect.top - rect.height / 2;

    _startX = rect.left + rect.width / 2;
    _startY = rect.top + rect.height / 2;

    target.classList.add('dragging');
    target.classList.remove('anim-item-bounce');
  }

  function _onMove(e) {
    if (!_dragging) return;
    e.preventDefault();

    const ptr = _getPointer(e);
    const stageRect = _stageEl.getBoundingClientRect();

    let x = ptr.x - _offsetX - stageRect.left;
    let y = ptr.y - _offsetY - stageRect.top;
    x = Math.max(0, Math.min(stageRect.width, x));
    y = Math.max(0, Math.min(stageRect.height, y));

    _dragging.style.left = x + 'px';
    _dragging.style.top = y + 'px';

    if (_interactionCfg) {
      const targetEl = document.getElementById(_interactionCfg.target_id);
      if (targetEl) {
        const hit = _checkCollision(_dragging, targetEl, _interactionCfg.hit_tolerance);
        targetEl.classList.toggle('drop-hover', hit);
      }
    }
  }

  function _onEnd(e) {
    if (!_dragging) return;

    _dragging.classList.remove('dragging');

    if (_interactionCfg) {
      const targetEl = document.getElementById(_interactionCfg.target_id);
      if (targetEl) {
        targetEl.classList.remove('drop-hover');
        const hit = _checkCollision(_dragging, targetEl, _interactionCfg.hit_tolerance);
        if (hit) {
          _handleSuccess(_dragging, targetEl);
          _dragging = null;
          return;
        }
      }
    }

    _springBack(_dragging);
    _dragging = null;
  }

  function _checkCollision(elA, elB, tolerance) {
    const a = elA.getBoundingClientRect();
    const b = elB.getBoundingClientRect();
    const t = tolerance || 0;

    return !(
      a.right  < b.left - t ||
      a.left   > b.right + t ||
      a.bottom < b.top - t ||
      a.top    > b.bottom + t
    );
  }

  function _springBack(el) {
    const cfg = _interactionCfg ? _interactionCfg.on_fail : {};
    const duration = cfg.duration_ms || 400;
    const easing = cfg.easing || 'cubic-bezier(0.34, 1.56, 0.64, 1)';

    el.style.transition = `left ${duration}ms ${easing}, top ${duration}ms ${easing}`;

    const sceneData = SceneLoader.getData();
    if (sceneData) {
      const itemCfg = sceneData.scene.items.find(i => i.id === el.id);
      if (itemCfg) {
        el.style.left = itemCfg.position.x;
        el.style.top = itemCfg.position.y;
      }
    }

    setTimeout(() => {
      el.style.transition = '';
      el.classList.add('anim-item-bounce');
    }, duration + 50);
  }

  function _handleSuccess(itemEl, targetEl) {
    itemEl.dataset.draggable = 'false';

    const actions = _interactionCfg.on_success.actions || [];
    actions.forEach(action => {
      switch (action.type) {
        case 'hide_item':
          _hideItem(action);
          break;
        case 'change_state':
          _changeState(action);
          break;
        case 'play_dialogue':
          setTimeout(() => SceneLoader.switchDialogue(action.dialogue_id), 500);
          break;
        case 'show_particles':
          _showParticles(action, targetEl);
          break;
      }
    });

    if (_onSuccessCallback) _onSuccessCallback();
  }

  function _hideItem(action) {
    const el = document.getElementById(action.target);
    if (!el) return;
    if (action.animation) el.classList.add('anim-' + action.animation);
    setTimeout(() => el.style.display = 'none', 500);
  }

  function _changeState(action) {
    const el = document.getElementById(action.target);
    if (!el) return;
    let states;
    try { states = JSON.parse(el.dataset.states); } catch { return; }

    const newState = states[action.to_state];
    if (!newState) return;

    el.className = el.className.replace(/anim-[\w-]+/g, '').trim();
    el.classList.add('scene-character');

    el.style.filter = newState.filter;
    if (newState.animation) el.classList.add('anim-' + newState.animation);
  }

  /**
   * Canvas 超新星爆炸 + DOM 粒子双层叠加
   */
  function _showParticles(action, anchorEl) {
    const rect = anchorEl.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    if (typeof ParticleSystem !== 'undefined' && ParticleSystem.burst) {
      ParticleSystem.burst(cx, cy);
    }

    for (let i = 0; i < (action.count || 6); i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      p.textContent = action.emoji || '✨';
      p.style.left = cx + 'px';
      p.style.top = cy + 'px';

      const angle = (Math.PI * 2 / action.count) * i + Math.random() * 0.5;
      const dist = 60 + Math.random() * 80;
      p.style.setProperty('--px', Math.cos(angle) * dist + 'px');
      p.style.setProperty('--py', Math.sin(angle) * dist - 40 + 'px');

      document.body.appendChild(p);
      setTimeout(() => p.remove(), action.duration_ms || 1200);
    }
  }

  function destroy() {
    _stageEl?.removeEventListener('mousedown', _onStart);
    _stageEl?.removeEventListener('touchstart', _onStart);
    document.removeEventListener('mousemove', _onMove);
    document.removeEventListener('touchmove', _onMove);
    document.removeEventListener('mouseup', _onEnd);
    document.removeEventListener('touchend', _onEnd);
    document.removeEventListener('touchcancel', _onEnd);
  }

  return { init, destroy };
})();
/* ▲▲▲ DragDropEngine 核心状态机结束 ▲▲▲ */


/* ==================== AudioSyncEngine 模块 ==================== */
/* requestAnimationFrame 驱动逐词卡拉OK高亮，支持真实音频文件同步 */
const AudioSyncEngine = (() => {
  let _playing = false;
  let _startTs = 0;
  let _words = [];
  let _rafId = null;
  let _audio = null;

  function play(dialogue) {
    if (_playing) stop();

    _words = dialogue.words || [];
    if (_words.length === 0) return;

    _playing = true;

    if (dialogue.audio) {
      _audio = new Audio(dialogue.audio);
      _audio.play().then(() => {
        _startTs = performance.now();
        _rafId = requestAnimationFrame(_tick);
      }).catch(() => {
        _startTs = performance.now();
        _rafId = requestAnimationFrame(_tick);
      });
    } else {
      _startTs = performance.now();
      _rafId = requestAnimationFrame(_tick);
    }
  }

  function _tick(now) {
    if (!_playing) return;

    const elapsed = _audio
      ? _audio.currentTime
      : (now - _startTs) / 1000;
    const spans = document.querySelectorAll('#subtitle-words .word-span');

    let allDone = true;

    spans.forEach((span, i) => {
      const start = parseFloat(span.dataset.start);
      const end = parseFloat(span.dataset.end);

      if (elapsed >= start && elapsed < end) {
        span.classList.add('highlight');
        span.classList.remove('spoken');
        allDone = false;
      } else if (elapsed >= end) {
        span.classList.remove('highlight');
        span.classList.add('spoken');
      } else {
        span.classList.remove('highlight', 'spoken');
        allDone = false;
      }
    });

    if (allDone) {
      _playing = false;
      return;
    }

    _rafId = requestAnimationFrame(_tick);
  }

  function stop() {
    _playing = false;
    if (_rafId) {
      cancelAnimationFrame(_rafId);
      _rafId = null;
    }
    if (_audio) {
      _audio.pause();
      _audio = null;
    }
  }

  function isPlaying() { return _playing; }

  return { play, stop, isPlaying };
})();


/* ==================== ParticleSystem（Canvas 粒子引擎） ==================== */
const ParticleSystem = (() => {
  let _canvas, _ctx;
  let _w = 0, _h = 0, _dpr = 1;
  let _ambients = [];
  let _bursts = [];
  let _shockwaves = [];
  let _running = false;
  let _rafId = null;

  function init(canvas) {
    _canvas = canvas;
    _ctx = canvas.getContext('2d');
    _dpr = Math.min(window.devicePixelRatio || 1, 2);
    _resize();
    window.addEventListener('resize', _resize);

    for (let i = 0; i < 70; i++) {
      _ambients.push(_makeAmbient());
    }

    _running = true;
    _rafId = requestAnimationFrame(_loop);
  }

  function _resize() {
    const rect = _canvas.getBoundingClientRect();
    _w = rect.width;
    _h = rect.height;
    _canvas.width = _w * _dpr;
    _canvas.height = _h * _dpr;
    _ctx.setTransform(_dpr, 0, 0, _dpr, 0, 0);
  }

  function _makeAmbient() {
    return {
      x: Math.random() * (_w || 400),
      y: Math.random() * (_h || 800),
      r: Math.random() * 2.0 + 0.5,
      vx: (Math.random() - 0.5) * 0.2,
      vy: -(Math.random() * 0.35 + 0.06),
      alpha: Math.random(),
      dAlpha: (Math.random() * 0.012 + 0.004) * (Math.random() > 0.5 ? 1 : -1),
      color: Math.random() > 0.3 ? '#d4af37' : '#ffffff'
    };
  }

  function burst(vx, vy) {
    const rect = _canvas.getBoundingClientRect();
    const cx = vx - rect.left;
    const cy = vy - rect.top;

    const colors = ['#FFD700', '#FFA500', '#FF6347', '#FFFFFF', '#d4af37',
                    '#FFE4B5', '#FF8C00', '#FFFACD'];

    for (let i = 0; i < 130; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 8 + 1.5;
      _bursts.push({
        x: cx, y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        r: Math.random() * 5.5 + 1.5,
        life: 1,
        decay: 0.006 + Math.random() * 0.011,
        gravity: 0.035 + Math.random() * 0.03,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }

    _shockwaves.push(
      { x: cx, y: cy, radius: 0, maxR: 200, speed: 5.5, alpha: 0.75, color: '#FFD700', width: 3 },
      { x: cx, y: cy, radius: 0, maxR: 280, speed: 3.5, alpha: 0.35, color: '#d4af37', width: 2 }
    );
  }

  function _loop() {
    if (!_running) return;
    _ctx.clearRect(0, 0, _w, _h);
    _drawAmbients();
    _drawBursts();
    _drawShockwaves();
    _rafId = requestAnimationFrame(_loop);
  }

  function _drawAmbients() {
    _ambients.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.alpha += p.dAlpha;
      if (p.alpha >= 1 || p.alpha <= 0.08) p.dAlpha *= -1;
      p.alpha = Math.max(0.08, Math.min(1, p.alpha));

      if (p.y < -10) { p.y = _h + 10; p.x = Math.random() * _w; }
      if (p.x < -10) p.x = _w + 10;
      if (p.x > _w + 10) p.x = -10;

      _ctx.save();
      _ctx.globalAlpha = p.alpha * 0.5;
      _ctx.fillStyle = p.color;
      _ctx.shadowColor = p.color;
      _ctx.shadowBlur = p.r * 4;
      _ctx.beginPath();
      _ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      _ctx.fill();
      _ctx.restore();
    });
  }

  function _drawBursts() {
    for (let i = _bursts.length - 1; i >= 0; i--) {
      const p = _bursts[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.vx *= 0.985;
      p.life -= p.decay;

      if (p.life <= 0) { _bursts.splice(i, 1); continue; }

      _ctx.save();
      _ctx.globalAlpha = p.life * p.life;
      _ctx.fillStyle = p.color;
      _ctx.shadowColor = p.color;
      _ctx.shadowBlur = p.r * 5 * p.life;
      _ctx.beginPath();
      _ctx.arc(p.x, p.y, p.r * (0.3 + p.life * 0.7), 0, Math.PI * 2);
      _ctx.fill();
      _ctx.restore();
    }
  }

  function _drawShockwaves() {
    for (let i = _shockwaves.length - 1; i >= 0; i--) {
      const sw = _shockwaves[i];
      sw.radius += sw.speed;
      const progress = sw.radius / sw.maxR;

      if (progress >= 1) { _shockwaves.splice(i, 1); continue; }

      _ctx.save();
      _ctx.globalAlpha = sw.alpha * (1 - progress);
      _ctx.strokeStyle = sw.color;
      _ctx.lineWidth = sw.width * (1 - progress * 0.5);
      _ctx.shadowColor = sw.color;
      _ctx.shadowBlur = 18 * (1 - progress);
      _ctx.beginPath();
      _ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
      _ctx.stroke();
      _ctx.restore();
    }
  }

  function destroy() {
    _running = false;
    if (_rafId) cancelAnimationFrame(_rafId);
    window.removeEventListener('resize', _resize);
  }

  return { init, burst, destroy };
})();



/* ==================== NavigationEngine 模块 ==================== */
const NavigationEngine = (() => {
  let _bookData = null;
  let _currentSceneIndex = 0;
  let _stageEl = null;
  let _onSceneChangeCallback = null;

  function init(stageEl, bookData, onSceneChange) {
    _stageEl = stageEl;
    _bookData = bookData;
    _onSceneChangeCallback = onSceneChange;

    _renderNavButtons();
  }

  function _renderNavButtons() {
    // 渲染导航按钮（暂时不实现具体UI，只提供骨架）
    // 实际的按钮将在 App.boot 阶段统一渲染
  }

  function goToScene(index) {
    if (index < 0 || index >= _bookData.scenes.length) {
      console.warn('场景索引超出范围:', index);
      return;
    }
    _currentSceneIndex = index;
    if (_onSceneChangeCallback) {
      _onSceneChangeCallback(_bookData.scenes[_currentSceneIndex]);
    }
  }

  function goToNextScene() {
    const currentScene = _bookData.scenes[_currentSceneIndex];
    if (currentScene && currentScene.next_scene) {
      const nextSceneId = currentScene.next_scene;
      const nextIndex = _bookData.scenes.findIndex(s => s.scene_id === nextSceneId);
      if (nextIndex !== -1) {
        goToScene(nextIndex);
        return;
      }
    }
    // 如果没有 next_scene 或 next_scene 找不到，尝试直接去下一个索引
    if (_currentSceneIndex + 1 < _bookData.scenes.length) {
      goToScene(_currentSceneIndex + 1);
    } else {
      console.log('已经是最后一页了，或没有明确的下一页');
      if (_onSceneChangeCallback) _onSceneChangeCallback(null); // 告知App已经结束
    }
  }

  function goToPrevScene() {
    if (_currentSceneIndex > 0) {
      goToScene(_currentSceneIndex - 1);
    } else {
      console.log('已经是第一页了');
    }
  }

  function restartBook() {
    goToScene(0);
  }

  function getCurrentScene() {
    return _bookData.scenes[_currentSceneIndex];
  }

  return { init, goToScene, goToNextScene, goToPrevScene, restartBook, getCurrentScene };
})();


/* ==================== App 入口 ==================== */
const App = (() => {
  let _bookData = null;
  let _stageEl = null;
  let _currentSceneIndex = 0;
  let _currentScene = null;

  async function boot() {
    const loadingScreen = document.getElementById('loading-screen');
    _stageEl = document.getElementById('stage');
    if (!_stageEl) {
      console.error('找不到 #stage 元素');
      return;
    }

    try {
      // 直接从 window.__BOOK_DATA__ 加载数据
      _bookData = window.__BOOK_DATA__;
      if (!_bookData || !_bookData.scenes || _bookData.scenes.length === 0) {
        throw new Error('未找到绘本数据 (window.__BOOK_DATA__) 或数据为空');
      }

      // 初始化 NavigationEngine
      NavigationEngine.init(_stageEl, _bookData, renderScene);

      // 渲染初始场景
      renderScene(_bookData.scenes[_currentSceneIndex]);

      if (loadingScreen) {
        loadingScreen.classList.add('fade-out');
        setTimeout(() => loadingScreen.remove(), 800);
      }

      _setupNavButtons();

    } catch (err) {
      console.error('引擎启动失败:', err);
      if (loadingScreen) {
        const ring = loadingScreen.querySelector('.loader-ring');
        const text = loadingScreen.querySelector('.loading-text');
        if (ring) ring.style.borderTopColor = '#ff4444';
        if (text) text.textContent = '加载失败，请刷新重试';
      }
    }
  }

  // 渲染场景的公共逻辑
  function renderScene(sceneData) {
    if (!sceneData) {
      console.log("没有更多场景可渲染，可能已是书的结尾。");
      _stageEl.innerHTML = '<div style="text-align: center; padding-top: 20vh; color: white; font-size: 3em;">全书完！</div>';
      _updateNavButtonsVisibility(false, false);
      return;
    }

    _currentScene = sceneData;
    _currentSceneIndex = _bookData.scenes.findIndex(s => s.scene_id === sceneData.scene_id); // 更新当前场景索引

    // 清理旧场景元素
    _stageEl.innerHTML = ''; // 清空舞台，只保留 canvas
    const bgCanvas = document.getElementById('bg-canvas');
    if (bgCanvas) {
      _stageEl.appendChild(bgCanvas); // 确保 Canvas 在最底层
      ParticleSystem.destroy(); // 销毁旧场景粒子系统
    } else {
      // 如果canvas被清空，重新创建
      const newBgCanvas = document.createElement('canvas');
      newBgCanvas.id = 'bg-canvas';
      _stageEl.appendChild(newBgCanvas);
    }
    // 重建 subtitle-panel 和 hint-bar
    const subtitlePanel = document.createElement('div');
    subtitlePanel.id = 'subtitle-panel';
    _stageEl.appendChild(subtitlePanel);
    const hintBar = document.createElement('div');
    hintBar.id = 'hint-bar';
    _stageEl.appendChild(hintBar);

    SceneLoader.render(_stageEl, sceneData.scene, sceneData.dialogues, sceneData.ui); // 传递当前场景数据

    // 重新初始化 DragDropEngine 和 ParticleSystem
    if (sceneData.interaction) {
      DragDropEngine.destroy(); // 销毁旧的DragDropEngine事件监听
      DragDropEngine.init(_stageEl, sceneData.interaction, () => {
        const hintBarEl = document.getElementById('hint-bar');
        if (hintBarEl) hintBarEl.classList.remove('visible');
        _handleInteractionSuccess(); // 交互成功后可能显示导航按钮
      });
    } else {
      DragDropEngine.destroy(); // 如果当前场景没有交互，则确保销毁
    }

    if (bgCanvas && sceneData.background.particles) {
      ParticleSystem.init(bgCanvas);
    }

    _updateNavButtonsVisibility(); // 更新导航按钮状态
  }

  // 处理交互成功后的逻辑，例如显示导航按钮
  function _handleInteractionSuccess() {
    const currentSceneUI = _currentScene.ui || {};
    const navButtonConfig = currentSceneUI.nav_button || {};
    if (navButtonConfig.show_after_interaction) {
      const navButton = document.getElementById('nav-button');
      if (navButton) {
        navButton.style.display = 'block';
        navButton.textContent = navButtonConfig.text || '下一页 →';
        // 如果是 restart 按钮，则绑定 restartBook 事件
        if (navButtonConfig.action === 'restart') {
          navButton.onclick = () => NavigationEngine.restartBook();
        } else {
          navButton.onclick = () => NavigationEngine.goToNextScene();
        }
      }
    }
  }

  // 设置导航按钮的 UI 和事件监听
  function _setupNavButtons() {
    // 创建全局的导航按钮容器
    let navButton = document.getElementById('nav-button');
    if (!navButton) {
      navButton = document.createElement('button');
      navButton.id = 'nav-button';
      navButton.className = 'nav-button';
      _stageEl.appendChild(navButton);
    }
    navButton.style.display = 'none'; // 默认隐藏

    // TODO: 增加 prev 按钮和左右滑动事件
  }

  // 更新导航按钮的可见性
  function _updateNavButtonsVisibility() {
    const currentSceneUI = _currentScene.ui || {};
    const navButtonConfig = currentSceneUI.nav_button || {};
    const navButton = document.getElementById('nav-button');

    if (navButton) {
      if (navButtonConfig.show) {
        // 如果配置了 show_after_interaction，则默认隐藏，等待交互成功
        navButton.style.display = navButtonConfig.show_after_interaction ? 'none' : 'block';
        navButton.textContent = navButtonConfig.text || '下一页 →';
        // 绑定事件
        if (navButtonConfig.action === 'restart') {
          navButton.onclick = () => NavigationEngine.restartBook();
        } else {
          navButton.onclick = () => NavigationEngine.goToNextScene();
        }
      } else {
        navButton.style.display = 'none';
      }
    }
  }

  return { boot };
})();

document.addEventListener('DOMContentLoaded', App.boot);
