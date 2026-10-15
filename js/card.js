// 畫出一張卡片。收卡片頁和做卡片的「預覽」都用這一支。
// 用法:const card = CardRenderer.render(放卡片的盒子, 卡片資料, { preview: true });
//       card.skip()    → 預覽時一次全部顯示
//       card.destroy() → 關掉(停音樂、停計時器)
(function () {
  const OPT = window.CARD_OPTIONS;
  const CFG = window.CARD_CONFIG;

  function pick(list, id) { return list.find(o => o.id === id) || list[0]; }

  function el(tag, cls, text) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  // 一段文字裡的換行 → <br>(用 textContent,不會被塞奇怪的程式碼)
  function para(text) {
    const p = el('p');
    text.split('\n').forEach((line, i) => {
      if (i) p.appendChild(document.createElement('br'));
      p.appendChild(document.createTextNode(line));
    });
    return p;
  }

  // 內容 → 段落:空一行 = 新的一段
  function splitMessage(msg) {
    return String(msg || '').replace(/\r/g, '').split(/\n\s*\n/).map(s => s.trim()).filter(Boolean);
  }

  function buildCover(tpl, data) {
    const c = el('button', 'cv-cover cover-' + tpl);
    c.type = 'button';
    c.setAttribute('aria-label', '點一下打開卡片');
    if (tpl === 'lavender') {
      [[70, -18, 40, null, null], [26, null, 70, 38, null], [110, null, null, -40, -30], [16, 60, null, null, 90]]
        .forEach(([s, l, t, r, b]) => {
          const d = el('span', 'dot');
          Object.assign(d.style, { width: s + 'px', height: s + 'px' });
          if (l != null) d.style.left = l + 'px';
          if (t != null) d.style.top = t + 'px';
          if (r != null) d.style.right = r + 'px';
          if (b != null) d.style.bottom = b + 'px';
          c.appendChild(d);
        });
    } else if (tpl === 'envelope') {
      c.appendChild(el('span', 'seal', '♥'));
    } else if (tpl === 'starry') {
      c.appendChild(el('span', 'moon'));
      for (let i = 0; i < 26; i++) {
        const s = el('span', 'star');
        s.style.left = (Math.random() * 96 + 2) + '%';
        s.style.top = (Math.random() * 96 + 2) + '%';
        s.style.animationDelay = (Math.random() * 2.6).toFixed(2) + 's';
        c.appendChild(s);
      }
    }
    c.appendChild(el('span', 'c-title', data.title || '給你'));
    if (data.to) c.appendChild(el('span', 'c-to', '給 ' + data.to));
    c.appendChild(el('span', 'c-hint', '點一下，打開卡片 ✨'));
    return c;
  }

  // 結尾動畫:把零件疊起來,照 options.js 的軸心轉動
  function buildEnding(endingId) {
    const e = pick(OPT.endings, endingId);
    const box = el('div', 'cv-ending' + (e.canvas[0] > e.canvas[1] ? ' wide' : ''));
    box.style.aspectRatio = e.canvas[0] + ' / ' + e.canvas[1];
    e.parts.forEach(p => {
      const img = el('img');
      img.src = p.file;
      img.alt = '';
      img.onerror = () => img.remove();            // 圖還沒畫好就先不顯示
      if (p.move) img.classList.add('mv-' + p.move);
      if (p.pivot) img.style.transformOrigin = (p.pivot[0] / e.canvas[0] * 100) + '% ' + (p.pivot[1] / e.canvas[1] * 100) + '%';
      if (p.delay) img.style.animationDelay = p.delay + 's';
      box.appendChild(img);
    });
    return box;
  }

  function render(host, data, opts) {
    opts = opts || {};
    const tpl = pick(OPT.templates, data.template).id;
    const painting = pick(OPT.paintings, data.painting);
    const music = pick(OPT.music, data.music);
    const timers = [];
    const later = (fn, ms) => timers.push(setTimeout(fn, ms));

    const root = el('div', 'cv-root tpl-' + tpl);
    if (painting.url) {
      root.classList.add('has-painting');
      const bg = el('div', 'cv-bg');
      const img = new Image();
      img.onload = () => { bg.style.backgroundImage = 'url("' + painting.url + '")'; bg.classList.add('ready'); };
      img.src = painting.url;
      root.appendChild(bg);
    } else if (tpl === 'starry') {
      const sky = el('div', 'cv-sky');
      for (let i = 0; i < 60; i++) {
        const s = el('i');
        s.style.left = (Math.random() * 100) + '%';
        s.style.top = (Math.random() * 100) + '%';
        s.style.animationDelay = (Math.random() * 3).toFixed(2) + 's';
        sky.appendChild(s);
      }
      root.appendChild(sky);
    }

    const stage = el('div', 'cv-stage');
    const card = el('div', 'cv-card');
    const inside = el('div', 'cv-inside');
    inside.appendChild(el('h1', 'cv-title', data.title || ''));

    // 要飄出來的段落:給誰 → 內容 → 署名
    const blocks = [];
    if (data.to) blocks.push({ text: '親愛的' + String(data.to).replace(/^親愛的\s*/, ''), cls: '' });
    splitMessage(data.message).forEach(t => blocks.push({ text: t, cls: '' }));
    if (data.from) blocks.push({ text: data.from, cls: 'sign' });
    const lines = blocks.map(b => {
      const wrap = el('div', 'cv-line' + (b.cls ? ' ' + b.cls : ''));
      wrap.appendChild(para(b.text));
      inside.appendChild(wrap);
      return wrap;
    });

    const ending = buildEnding(data.ending);
    inside.appendChild(ending);

    const cta = el('p', 'cv-cta');
    cta.appendChild(document.createTextNode('想送一張專屬的卡片嗎？'));
    const a = el('a', null, '讓小麻糬幫你寫 ✉️');
    a.href = CFG.threadsUrl; a.target = '_blank'; a.rel = 'noopener';
    cta.appendChild(a);
    const make = el('a', 'cv-make', '我也要做一張免費的卡片');
    make.href = 'make.html';
    if (opts.preview) make.removeAttribute('href');
    cta.appendChild(make);
    inside.appendChild(cta);

    card.appendChild(inside);
    const cover = buildCover(tpl, data);
    card.appendChild(cover);
    stage.appendChild(card);
    if (painting.credit) stage.appendChild(el('p', 'cv-credit', '背景：' + painting.credit));
    root.appendChild(stage);

    const audio = el('audio');
    audio.src = music.src;
    audio.loop = true;
    audio.preload = 'auto';
    root.appendChild(audio);
    const mute = el('button', 'cv-mute', '🔊');
    mute.type = 'button';
    mute.setAttribute('aria-label', '音樂開關');
    mute.onclick = () => { audio.muted = !audio.muted; mute.textContent = audio.muted ? '🔇' : '🔊'; };
    root.appendChild(mute);

    host.appendChild(root);

    function reveal(node, delay) {
      later(() => {
        node.classList.add('show');
        later(() => {
          const r = node.getBoundingClientRect();
          if (r.bottom > window.innerHeight - 20) root.scrollBy({ top: r.bottom - window.innerHeight + 90, behavior: 'smooth' });
        }, 600);
      }, delay);
    }

    function fadeInMusic() {
      audio.volume = 0;
      audio.play().catch(() => {});
      let v = 0;
      const t = setInterval(() => {
        v = Math.min(0.85, v + 0.05);
        audio.volume = v;
        if (v >= 0.85) clearInterval(t);
      }, 120);
      timers.push(t);
    }

    let opened = false;
    function open() {
      if (opened) return;
      opened = true;
      root.classList.add('opened');
      fadeInMusic();
      let wait = 1800;                                        // 卡片翻開後再開始
      let lastAt = wait;
      lines.forEach(line => {
        reveal(line, wait);
        lastAt = wait;
        const len = line.textContent.trim().length;
        wait += Math.max(2600, 1400 + len * 110);             // 字越多,停越久(一秒大約讀 9 個字)
      });
      reveal(ending, lastAt + 1600);                          // 最後一段出來後,結尾動畫才跳出來
      reveal(cta, lastAt + 4600);
    }
    cover.addEventListener('click', open);

    return {
      root,
      open,
      skip() {                                                // 預覽用:一次全部顯示
        open();
        timers.forEach(t => { clearTimeout(t); clearInterval(t); });
        timers.length = 0;
        audio.volume = 0.85;
        lines.forEach(l => l.classList.add('show'));
        ending.classList.add('show');
        cta.classList.add('show');
      },
      destroy() {
        timers.forEach(t => { clearTimeout(t); clearInterval(t); });
        audio.pause();
        audio.removeAttribute('src');
        root.remove();
      },
    };
  }

  window.CardRenderer = { render, splitMessage, buildCover, buildEnding };
})();
