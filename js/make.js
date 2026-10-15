// 做卡片的步驟頁
(function () {
  const OPT = window.CARD_OPTIONS;
  const CFG = window.CARD_CONFIG;
  const $ = id => document.getElementById(id);
  const LAST = 4;                          // 最後一個選擇步驟(結尾)
  const DONE = 5;                          // 完成畫面

  // ---------- 小工具:瀏覽器記憶(可能被關掉,所以都包起來) ----------
  const store = {
    get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} },
  };
  const today = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Taipei' }).format(new Date());
  function deviceId() {
    let id = store.get('gc_device');
    if (!id) {
      id = (crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2)).replace(/-/g, '');
      store.set('gc_device', id);
    }
    return id;
  }

  // ---------- 卡片資料(會自動存成草稿) ----------
  const card = Object.assign({
    template: OPT.templates[0].id, painting: 'none', music: OPT.music[0].id, ending: OPT.endings[0].id,
    title: '', to: '', message: '', from: '',
  }, store.get('gc_draft') || {});
  const save = () => store.set('gc_draft', card);

  // ---------- 1 封面 ----------
  function drawTemplates() {
    const box = $('tplTiles');
    box.innerHTML = '';
    OPT.templates.forEach(t => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'tile mini' + (card.template === t.id ? ' on' : '');
      const art = document.createElement('span');
      art.className = 'art';
      art.appendChild(CardRenderer.buildCover(t.id, { title: card.title || '生日快樂', to: card.to }));
      b.appendChild(art);
      const n = document.createElement('span');
      n.className = 'name';
      n.textContent = t.name;
      b.appendChild(n);
      b.onclick = () => { card.template = t.id; save(); drawTemplates(); };
      box.appendChild(b);
    });
  }
  $('title').value = card.title;
  $('title').oninput = e => { card.title = e.target.value; save(); drawTemplates(); };
  OPT.titleIdeas.forEach(t => {
    const c = document.createElement('button');
    c.type = 'button'; c.className = 'chip'; c.textContent = t;
    c.onclick = () => { card.title = t; $('title').value = t; save(); drawTemplates(); };
    $('titleChips').appendChild(c);
  });

  // ---------- 2 名畫 ----------
  function drawPaintings() {
    const box = $('paintTiles');
    box.innerHTML = '';
    OPT.paintings.filter(p => p.id === 'none' || p.url).forEach(p => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'tile' + (card.painting === p.id ? ' on' : '');
      const art = document.createElement('span');
      art.className = 'art';
      if (p.url) {
        const img = document.createElement('img');
        img.className = 'paint';
        img.alt = p.name;
        img.loading = 'lazy';
        img.src = p.thumb || p.url;                                  // 縮圖用小張的
        art.appendChild(img);
      } else {
        const s = document.createElement('span');
        s.className = 'none';
        s.textContent = '不用背景畫';
        art.appendChild(s);
      }
      b.appendChild(art);
      const n = document.createElement('span');
      n.className = 'name';
      n.textContent = p.name;
      b.appendChild(n);
      b.onclick = () => { card.painting = p.id; save(); drawPaintings(); };
      box.appendChild(b);
    });
  }

  // ---------- 3 寫字 ----------
  ['to', 'message', 'from'].forEach(k => {
    $(k).value = card[k];
    $(k).oninput = e => { card[k] = e.target.value; save(); count(); };
  });
  function count() {
    const n = [...card.message.trim()].length;
    $('count').textContent = n + ' / ' + CFG.maxMessage;
    $('count').classList.toggle('over', n > CFG.maxMessage);
  }
  $('helpLink').href = CFG.threadsUrl;

  // ---------- 4 音樂 ----------
  const sample = $('sample');
  let playing = null;
  function drawSongs() {
    const box = $('songs');
    box.innerHTML = '';
    OPT.music.forEach(m => {
      const row = document.createElement('div');
      row.className = 'song' + (card.music === m.id ? ' on' : '');
      const play = document.createElement('button');
      play.type = 'button';
      play.className = 'play' + (playing === m.id ? ' playing' : '');
      play.textContent = playing === m.id ? '■' : '▶';
      play.setAttribute('aria-label', '試聽 ' + m.name);
      play.onclick = e => {
        e.stopPropagation();
        if (playing === m.id) { sample.pause(); playing = null; }
        else { sample.src = m.src; sample.currentTime = 0; sample.play().catch(() => {}); playing = m.id; card.music = m.id; save(); }
        drawSongs();
      };
      const txt = document.createElement('div');
      const b = document.createElement('b'); b.textContent = m.name;
      const s = document.createElement('span'); s.textContent = m.note;
      txt.append(b, s);
      row.append(play, txt);
      row.onclick = () => { card.music = m.id; save(); drawSongs(); };
      box.appendChild(row);
    });
  }
  sample.onended = () => { playing = null; drawSongs(); };
  const stopSample = () => { sample.pause(); playing = null; drawSongs(); };

  // ---------- 5 結尾 ----------
  function drawEndings() {
    const box = $('endTiles');
    box.innerHTML = '';
    OPT.endings.forEach(en => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'tile' + (card.ending === en.id ? ' on' : '');
      const art = document.createElement('span');
      art.className = 'art land';
      const st = CardRenderer.buildEnding(en.id);
      st.classList.add('show');
      art.style.display = 'grid';
      art.style.placeItems = 'center';
      art.style.background = '#f6f2ea';
      art.appendChild(st);
      b.appendChild(art);
      const n = document.createElement('span');
      n.className = 'name';
      n.textContent = en.name;
      b.appendChild(n);
      b.onclick = () => { card.ending = en.id; save(); drawEndings(); };
      box.appendChild(b);
    });
  }

  // ---------- 換步驟 ----------
  let step = 0;
  function check(s) {
    if (s === 0 && !card.title.trim()) return '封面上的大字還沒寫喔';
    if (s === 2) {
      const n = [...card.message.trim()].length;
      if (!n) return '內容還沒寫喔';
      if (n > CFG.maxMessage) return '內容超過 ' + CFG.maxMessage + ' 字了，刪短一點點';
    }
    return '';
  }
  function go(s) {
    step = s;
    document.querySelectorAll('.panel').forEach(p => p.classList.toggle('now', +p.dataset.step === s));
    document.querySelectorAll('#steps li').forEach((li, i) => {
      li.className = i === s ? 'now' : (i < s || s === DONE ? 'done' : '');
    });
    $('backBtn').hidden = s === 0 || s === DONE;
    $('previewBtn').hidden = s < 2 || s === DONE;
    $('nextBtn').textContent = s === LAST ? '做好了，給我網址' : '下一步';
    $('bar').hidden = s === DONE;
    $('err').textContent = '';
    if (s !== 3) stopSample();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  $('backBtn').onclick = () => go(Math.max(0, step - 1));
  $('nextBtn').onclick = () => {
    const bad = check(step);
    if (bad) { alertNear(bad); return; }
    if (step < LAST) go(step + 1);
    else submit();
  };
  function alertNear(text) {
    if (step === LAST) { $('err').textContent = text; return; }
    alert(text);
  }

  // ---------- 預覽 ----------
  $('previewBtn').onclick = () => {
    const bad = check(0) || check(2);
    if (bad) { alertNear(bad); return; }
    stopSample();
    const layer = document.createElement('div');
    layer.className = 'preview';
    const bar = document.createElement('div');
    bar.className = 'preview-bar';
    const close = document.createElement('button');
    close.type = 'button'; close.textContent = '✕ 關閉預覽';
    const skip = document.createElement('button');
    skip.type = 'button'; skip.textContent = '直接看全部 ⏩';
    bar.append(close, skip);
    document.body.appendChild(layer);
    const view = CardRenderer.render(layer, card, { preview: true });
    layer.appendChild(bar);
    document.body.style.overflow = 'hidden';
    close.onclick = () => { view.destroy(); layer.remove(); document.body.style.overflow = ''; };
    skip.onclick = () => view.skip();
  };

  // ---------- 送出 ----------
  const madeToday = () => { const m = store.get('gc_made'); return m && m.day === today() ? m : null; };
  async function submit() {
    if (madeToday()) { $('err').innerHTML = ''; showLimit('device_limit'); return; }
    const btn = $('nextBtn');
    btn.disabled = true;
    btn.textContent = '卡片做做中…';
    $('err').textContent = '';
    try {
      const res = await fetch(CFG.supabaseUrl + '/functions/v1/create-greeting-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', apikey: CFG.supabaseKey, Authorization: 'Bearer ' + CFG.supabaseKey },
        body: JSON.stringify(Object.assign({}, card, { device_id: deviceId() })),
      });
      const out = await res.json().catch(() => ({}));
      if (res.ok && out.id) {
        const url = new URL('./?c=' + out.id, location.href).href;
        store.set('gc_made', { day: today(), url });
        try { localStorage.removeItem('gc_draft'); } catch (e) {}
        showDone(url);
        return;
      }
      if (out.error === 'device_limit' || out.error === 'network_limit') showLimit(out.error);
      else if (out.error === 'invalid') $('err').textContent = '有一個地方怪怪的（' + (out.field || '') + '），回去看看再試一次。';
      else $('err').textContent = '送出失敗了，等一下再試一次 🙏';
    } catch (e) {
      $('err').textContent = '網路好像不太順，等一下再試一次 🙏';
    } finally {
      btn.disabled = false;
      btn.textContent = '做好了，給我網址';
    }
  }
  function showLimit(kind) {
    const m = madeToday();
    const err = $('err');
    err.textContent = kind === 'network_limit'
      ? '這個網路今天已經做了 3 張卡片囉，明天再來 🌙'
      : '你今天已經做過一張卡片囉，明天再來做新的 🌙';
    if (m) {
      err.appendChild(document.createElement('br'));
      const a = document.createElement('a');
      a.href = m.url; a.textContent = '看看今天做的那張'; a.target = '_blank';
      err.appendChild(a);
    }
  }

  // ---------- 完成畫面 ----------
  function showDone(url) {
    $('link').value = url;
    $('copyBtn').onclick = async () => {
      try { await navigator.clipboard.writeText(url); }
      catch (e) { $('link').select(); document.execCommand('copy'); }
      $('copyBtn').textContent = '已複製 ✓';
      setTimeout(() => { $('copyBtn').textContent = '複製網址'; }, 1800);
    };
    $('lineBtn').onclick = () => window.open('https://social-plugins.line.me/lineit/share?url=' + encodeURIComponent(url), '_blank', 'noopener');
    if (navigator.share) {
      $('moreBtn').hidden = false;
      $('moreBtn').onclick = () => navigator.share({ title: '有人送你一張卡片 ✉️', url }).catch(() => {});
    }
    $('openBtn').onclick = () => window.open(url, '_blank', 'noopener');
    try {
      const qr = qrcode(0, 'M');
      qr.addData(url);
      qr.make();
      $('qr').innerHTML = qr.createSvgTag({ cellSize: 5, margin: 2, scalable: true });
    } catch (e) { $('qr').hidden = true; }
    go(DONE);
  }

  drawTemplates();
  drawPaintings();
  drawSongs();
  drawEndings();
  count();
  go(0);
})();
