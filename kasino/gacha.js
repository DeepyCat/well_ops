(() => {
  "use strict";
  const _secureRng = (() => {
    const rawCrypto = (typeof window !== 'undefined' && window.crypto) ? window.crypto : null;
    const rawGetRandomValues = rawCrypto && typeof rawCrypto.getRandomValues === 'function' ? rawCrypto.getRandomValues.bind(rawCrypto) : null;
    const rawMathRandom = Math.random.bind(Math);
    const U32 = typeof Uint32Array !== 'undefined' ? Uint32Array : null;
    try { Object.freeze(Math); } catch (e) {}
    try { if (rawCrypto) Object.freeze(rawCrypto); } catch (e) {}
    function randomFloat() {
      if (rawGetRandomValues && U32) {
        try {
          const buf = new U32(1);
          rawGetRandomValues(buf);
          return buf[0] / 4294967296;
        } catch (e) {}
      }
      return rawMathRandom();
    }
    return Object.freeze({
      random: randomFloat,
      int: (min, max) => Math.floor(randomFloat() * (max - min + 1)) + min
    });
  })();

  const _nativeFetch = (typeof window !== 'undefined' && window.fetch) ? window.fetch.bind(window) : null;
  try { if (typeof window !== 'undefined' && window.fetch) Object.freeze(window.fetch); } catch (e) {}

  const IMG_DIR = "img/";
  const COST = 160, Z_HARD = 200, Z_SOFT = 150, S_HARD = 90, S_SOFT = 75, A_HARD = 10, HISTORY_MAX = 200;
  const agents = Object.freeze([
    Object.freeze({id:"reditel",name:"Ředitel",file:"Reditel",rank:"Z",symbol:"[Z]",type:"Ředitel školy"}),
    Object.freeze({id:"rybar",name:"Rybář",file:"Rybar",rank:"Z",symbol:"[Z]",type:"Zástupce ředitele"}),
    Object.freeze({id:"nova",name:"Chobot",file:"Nova",rank:"S",symbol:"[S]",type:"Třídní"}),
    Object.freeze({id:"riven",name:"Juchelka",file:"Riven",rank:"S",symbol:"[S]",type:"Matikář/OPS"}),
    Object.freeze({id:"vesper",name:"Jašík",file:"Vesper",rank:"S",symbol:"[S]",type:"POS"}),
    Object.freeze({id:"mira",name:"Bařina",file:"Mira",rank:"A",symbol:"[A]",type:"Češtinář"}),
    Object.freeze({id:"kairo",name:"Bizoň",file:"Kairo",rank:"A",symbol:"[A]",type:"Tělocvik"}),
    Object.freeze({id:"lyra",name:"Otahalík",file:"Lyra",rank:"A",symbol:"[A]",type:"MIT"}),
    Object.freeze({id:"rook",name:"Kytková",file:"Rook",rank:"A",symbol:"[A]",type:"PRV/DBS"}),
    Object.freeze({id:"echo",name:"Kubačáková",file:"Echo",rank:"A",symbol:"[A]",type:"Angličtina"}),
    Object.freeze({id:"pixel",name:"Petrová",file:"Pixel",rank:"B",symbol:"[B]",type:"Angličtina"}),
    Object.freeze({id:"drift",name:"Romanovský",file:"Drift",rank:"B",symbol:"[B]",type:"DBS"}),
    Object.freeze({id:"lahvac",name:"Lahváč",file:"Lahvac",rank:"B",symbol:"[B]",type:"Robotika"}),
    Object.freeze({id:"Huvarova",name:"Huvarová",file:"Huvarova",rank:"B",symbol:"[B]",type:"Elektronika"})
  ]);

  /* =====================================================================
     BANNERY  -  SEM SE PŘIDÁVAJÍ NOVÉ BANNERY
     ---------------------------------------------------------------------
     JAK PŘIDAT NOVÝ BANNER (3 kroky):
       1) Zkopíruj celý jeden blok { ... }, (od složené závorky po složenou
          závorku včetně čárky na konci) a vlož ho pod poslední banner.
       2) V novém bloku změň texty, barvu a hlavně "featured".
       3) Ulož soubor a obnov stránku (Ctrl+F5). Záložka se objeví sama,
          nic dalšího (HTML, CSS) upravovat nemusíš.

     CO KTERÁ ŘÁDKA ZNAMENÁ:
       id        unikátní jméno banneru, malá písmena bez mezer a diakritiky
       name      krátký nápis na záložce
       tag       malý štítek nad nadpisem
       title     velký nadpis, <br> udělá nový řádek
       text      popisek banneru
       featured  KDO JE FEATURED. Musí to být "id" učitele S-ranku z pole
                 agents výše (teď: nova, riven, vesper). Špatné id banner
                 vypne a do konzole (F12) napíše, co je špatně.
       accent    barva banneru (hex, například "#ff5263")
       letter    velké písmeno v pozadí (nepovinné, bez něj je to Z)
       pills     nepovinné: vlastní štítky dole, například ["S-Rank · 0,6 %"]

     NOVÝ UČITEL JAKO FEATURED:
       a) přidej ho do pole agents s rank:"S" (a dej obrázek do složky img/
          ve tvaru S-Soubor.png, podle hodnoty "file")
       b) jeho "id" napiš do "featured" u nového banneru

     PRAVIDLA, ABYS NEBYL PŘEKVAPENÝ:
       - šance (Z 0,1 %, S 0,6 %), pity i záruka 50/50 jsou SPOLEČNÉ pro
         všechny bannery, banner mění jen to, kdo je při výhře 50/50 featured
       - první banner v seznamu je ten, který se zobrazí jako výchozí
       - hráč si poslední vybraný banner pamatuje v prohlížeči
     ===================================================================== */
  const BANNERS = [
    {
      id: "zvoneni",
      name: "Zvonění začíná",
      tag: "LIMITED NÁBOR · FEATURED TŘÍDNÍ",
      title: "Zvonění<br>začíná.",
      text: "Další S-rank učitel může být jen jeden pull daleko – a někde nahoře čeká ještě vzácnější Z-rank. Hlídej pity a rozhodni se, kdy zvolit deset zápisů najednou.",
      featured: "nova",
      accent: "#ff5263",
      letter: "Z"
    },
    {
      id: "hodina-matiky",
      name: "Hodina matiky",
      tag: "LIMITED NÁBOR · FEATURED MATIKÁŘ",
      title: "Hodina<br>matiky.",
      text: "Na tabuli čeká příklad a ve sborovně nová posila. Tohle je banner, kde je při výhře 50/50 featured Juchelka, matikář a OPS v jedné osobě. Pity zůstává společné s ostatními bannery.",
      featured: "riven",
      accent: "#c084fc",
      letter: "S"
    }

    // ,{ ...tady začíná další banner, nezapomeň na čárku před ním... }
  ];

  const DEFAULT_BANNER = { id: "default", name: "Nábor", tag: "NÁBOR UČITELŮ", title: "Nábor<br>učitelů.", text: "Vytáhni si učitele do sborovny a sbírej celý pedagogický sbor.", featured: "nova", accent: "#ff5263", letter: "Z" };
  const DEFAULT_PILLS = [{ t: "Z-Rank · 0,1 %", z: true }, { t: "S-Rank · 0,6 %" }, { t: "50/50 systém" }, { t: "Cloud sync aktivní" }];
  const BANNER_KEY = "ops_gacha_banner";

  // Zkontroluje bannery. Špatný banner se přeskočí (a řekne proč), hra se tím nerozbije.
  const BANNER_LIST = (() => {
    const seen = new Set(), ok = [];
    BANNERS.forEach((b, i) => {
      const a = agents.find(x => x.id === b.featured);
      if (!b.id || seen.has(b.id)) { console.warn("[Banner #" + (i + 1) + "] přeskočen: chybí id nebo se opakuje.", b); return; }
      if (!a || a.rank !== "S") { console.warn("[Banner " + b.id + "] přeskočen: featured \"" + b.featured + "\" není id učitele S-ranku z pole agents.", b); return; }
      seen.add(b.id); ok.push(b);
    });
    return ok.length ? ok : [DEFAULT_BANNER];
  })();
  let activeBannerId = BANNER_LIST[0].id;
  function activeBanner() { return BANNER_LIST.find(b => b.id === activeBannerId) || BANNER_LIST[0]; }

  let sessionHistory = [];

  function getGameState() {
    const stats = window.OPS_STATS ? window.OPS_STATS.getStats() : null;
    const g = (stats && stats.gacha) || {};
    const t = Number(g.tokens);
    const p = Number(g.totalPulls);
    return {
      tokens: Number.isFinite(t) ? Math.max(0, Math.floor(t)) : 1600,
      zPity: Math.max(0, Math.floor(Number(g.zPity) || 0)),
      sPity: Math.max(0, Math.floor(Number(g.sPity) || 0)),
      aPity: Math.max(0, Math.floor(Number(g.aPity) || 0)),
      guaranteed: !!g.guaranteed,
      totalPulls: Number.isFinite(p) ? Math.max(0, Math.floor(p)) : 0,
      inventory: { ...(g.inventory || {}) }
    };
  }

  function saveGameState(s) {
    if (!window.OPS_STATS) return;
    const stats = window.OPS_STATS.getStats();
    stats.gacha = {
      tokens: Math.max(0, Math.floor(Number(s.tokens) || 0)),
      zPity: Math.max(0, Math.floor(Number(s.zPity) || 0)),
      sPity: Math.max(0, Math.floor(Number(s.sPity) || 0)),
      aPity: Math.max(0, Math.floor(Number(s.aPity) || 0)),
      guaranteed: !!s.guaranteed,
      totalPulls: Math.max(0, Math.floor(Number(s.totalPulls) || 0)),
      inventory: s.inventory
    };
    window.OPS_STATS.saveStats(stats);
  }

  const sfx = (() => {
    let ctx = null, muted = false;
    try { muted = localStorage.getItem("ops_gacha_muted") === "1"; } catch (e) {}
    function ac() {
      if (muted) return null;
      try {
        if (!ctx) { const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null; ctx = new AC(); }
        if (ctx.state === "suspended") ctx.resume();
        return ctx;
      } catch (e) { return null; }
    }
    function tone(f, t0, dur, type = "sine", vol = .12, f2) {
      const c = ac(); if (!c) return;
      const t = c.currentTime + t0;
      const o = c.createOscillator(), g = c.createGain();
      o.type = type; o.frequency.setValueAtTime(f, t);
      if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + dur);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(vol, t + .015);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g); g.connect(c.destination);
      o.start(t); o.stop(t + dur + .05);
    }
    function noise(t0, dur, vol = .25) {
      const c = ac(); if (!c) return;
      const t = c.currentTime + t0, len = Math.floor(c.sampleRate * dur);
      const buf = c.createBuffer(1, len, c.sampleRate), d = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = (_secureRng.random() * 2 - 1) * (1 - i / len);
      const src = c.createBufferSource(); src.buffer = buf;
      const lp = c.createBiquadFilter(); lp.type = "lowpass";
      lp.frequency.setValueAtTime(1800, t); lp.frequency.exponentialRampToValueAtTime(100, t + dur);
      const g = c.createGain(); g.gain.value = vol;
      src.connect(lp); lp.connect(g); g.connect(c.destination);
      src.start(t);
    }
    const arp = (notes, step, type, vol, dur = .3) => notes.forEach((n, i) => tone(n, i * step, dur, type, vol));
    return {
      isMuted: () => muted,
      setMuted(v) { muted = !!v; try { localStorage.setItem("ops_gacha_muted", muted ? "1" : "0"); } catch (e) {} },
      tick()  { tone(900, 0, .05, "square", .04); },
      error() { tone(180, 0, .2, "sawtooth", .07, 110); },
      coin()  { tone(988, 0, .08, "square", .06); tone(1319, .07, .2, "square", .06); },
      jingle(){ arp([523, 659, 784, 1047, 1319], .09, "triangle", .1, .35); },
      riser() { tone(120, 0, 1.3, "sawtooth", .05, 900); tone(240, 0, 1.3, "triangle", .05, 1800); },
      impact(rank) {
        noise(0, .55, rank === "Z" ? .4 : rank === "S" ? .32 : .22);
        tone(90, 0, .55, "sine", .3, 38);
      },
      sting(rank) {
        if (rank === "Z") { arp([392, 523, 659, 784, 1047, 1319], .07, "sawtooth", .06, .6); }
        else if (rank === "S") { arp([523, 659, 784, 1047], .08, "triangle", .11, .45); }
        else if (rank === "A") { arp([660, 880], .09, "triangle", .1, .3); }
        else { tone(660, 0, .2, "triangle", .09); }
      },
      card(rank) {
        if (rank === "Z") { [262, 392, 523, 659, 784].forEach(f => tone(f, 0, 1.4, "triangle", .08)); tone(1047, .25, 1.2, "sine", .1); }
        else if (rank === "S") { [330, 494, 659].forEach(f => tone(f, 0, .9, "triangle", .09)); tone(988, .15, .7, "sine", .09); }
        else if (rank === "A") { tone(587, 0, .25, "triangle", .08); tone(784, .1, .3, "triangle", .08); }
        else { tone(520, 0, .15, "triangle", .06); }
      },
      results(z, sCount) {
        if (z) arp([523, 659, 784, 1047, 1319, 1568], .08, "triangle", .1, .5);
        else if (sCount) arp([523, 659, 784, 1047], .09, "triangle", .09, .4);
        else tone(440, 0, .12, "triangle", .06);
      }
    };
  })();

  let busy = false;
  let lastFocus = null;
  let mouseX = 0, mouseY = 0;
  let isSZAnimation = false;

  const $ = id => document.getElementById(id);
  function toast(message) {
    const el = $("toast"); el.textContent = message; el.classList.add("show");
    clearTimeout(toast.timer); toast.timer = setTimeout(() => el.classList.remove("show"), 2600);
  }
  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  }
  function agentById(id) { return agents.find(a => a.id === id) || agents[agents.length - 1]; }
  function art(a) {
    return `<div class="art"><span class="sym">${a.symbol}</span><img src="${IMG_DIR}${a.rank}-${a.file}.png" alt="" draggable="false"></div>`;
  }
  document.addEventListener("load", e => {
    if (e.target.tagName === "IMG" && e.target.closest(".art")) e.target.closest(".art").parentElement.classList.add("has-img");
  }, true);
  document.addEventListener("error", e => {
    if (e.target.tagName === "IMG" && e.target.closest(".art")) e.target.classList.add("gone");
  }, true);

  document.addEventListener("mousemove", e => {
    mouseX = e.clientX; mouseY = e.clientY;
    if ($("reveal").classList.contains("open")) {
      const card = $("rvCard");
      if (card) {
        const rect = card.getBoundingClientRect();
        const cx = rect.left + rect.width / 2, cy = rect.top + rect.height / 2;
        const tiltX = ((mouseY - cy) / (rect.height / 2 || 1)) * -18;
        const tiltY = ((mouseX - cx) / (rect.width / 2 || 1)) * 18;
        card.style.setProperty("--tiltX", `${tiltX.toFixed(2)}deg`);
        card.style.setProperty("--tiltY", `${tiltY.toFixed(2)}deg`);
      }
    }
  });

  /* ---------- vykreslení banneru a záložek ---------- */
  function renderBanner() {
    const box = $("bannerBox"), tabs = $("bannerTabs");
    if (!box) return;
    const b = activeBanner(), f = agentById(b.featured);
    const title = escapeHtml(b.title || "").replace(/&lt;br\s*\/?&gt;/gi, "<br>");
    const pills = [{ t: "Featured: " + f.name }].concat(b.pills ? b.pills.map(t => ({ t })) : DEFAULT_PILLS);
    box.style.setProperty("--bn", b.accent || "#ff5263");
    box.dataset.letter = b.letter || "Z";
    box.innerHTML = `<span class="banner-tag">${escapeHtml(b.tag || "")}</span><h2>${title}</h2><p>${escapeHtml(b.text || "")}</p>` +
      `<div class="banner-foot">${pills.map(p => `<span class="pill${p.z ? " z" : ""}">${escapeHtml(p.t)}</span>`).join("")}</div>` +
      `<img class="banner-portrait" src="${IMG_DIR}${f.rank}-${f.file}.png" alt="" draggable="false" onerror="this.style.display='none'">`;
    if (tabs) {
      tabs.innerHTML = BANNER_LIST.length > 1 ? BANNER_LIST.map(x =>
        `<button type="button" class="banner-tab${x.id === b.id ? " active" : ""}" data-banner="${escapeHtml(x.id)}" aria-pressed="${x.id === b.id}"><i style="background:${escapeHtml(x.accent || "#ff5263")}"></i>${escapeHtml(x.name || agentById(x.featured).name)}</button>`).join("") : "";
    }
  }
  function setBanner(id) {
    if (busy || id === activeBannerId || !BANNER_LIST.some(b => b.id === id)) return;
    activeBannerId = id;
    try { localStorage.setItem(BANNER_KEY, id); } catch (e) {}
    sfx.tick();
    renderBanner();
    render();
  }
  function initBanners() {
    let saved = null;
    try { saved = localStorage.getItem(BANNER_KEY); } catch (e) {}
    if (saved && BANNER_LIST.some(b => b.id === saved)) activeBannerId = saved;
    const tabs = $("bannerTabs");
    if (tabs) tabs.addEventListener("click", e => { const t = e.target.closest(".banner-tab"); if (t) setBanner(t.dataset.banner); });
    renderBanner();
  }

  function rollOne(state) {
    state.zPity++;
    state.sPity++;
    state.aPity++;
    state.totalPulls = state.totalPulls + 1;
    const zChance = state.zPity >= Z_SOFT ? Math.min(.1 + (state.zPity - Z_SOFT + 1) * 2, 100) : .1;
    const sChance = state.sPity >= S_SOFT ? Math.min(.6 + (state.sPity - S_SOFT + 1) * 6, 100) : .6;
    let rank;
    const randZ = _secureRng.random() * 100;
    const randS = _secureRng.random() * 100;
    const randA = _secureRng.random();
    if (state.zPity >= Z_HARD || randZ < zChance) rank = "Z";
    else if (state.sPity >= S_HARD || randS < sChance) rank = "S";
    else if (state.aPity >= A_HARD || randA < .07) rank = "A";
    else rank = "B";

    let agent, featured = false;
    if (rank === "Z") {
      agent = pick(agents.filter(a => a.rank === "Z"));
      state.zPity = 0; state.sPity = 0; state.aPity = 0;
    } else if (rank === "S") {
      const featuredId = activeBanner().featured;   // featured učitel právě zvoleného banneru
      featured = state.guaranteed || (_secureRng.random() < .5);
      agent = featured ? agentById(featuredId) : pick(agents.filter(a => a.rank === "S" && a.id !== featuredId));
      state.guaranteed = !featured;
      state.sPity = 0; state.aPity = 0;
    } else if (rank === "A") {
      agent = pick(agents.filter(a => a.rank === "A"));
      state.aPity = 0;
    } else {
      agent = pick(agents.filter(a => a.rank === "B"));
    }
    state.inventory[agent.id] = (state.inventory[agent.id] || 0) + 1;
    const entry = {id:agent.id, rank:agent.rank, pull:state.totalPulls, time:Date.now(), featured};
    sessionHistory.unshift(entry);
    if (sessionHistory.length > HISTORY_MAX) sessionHistory.length = HISTORY_MAX;
    return entry;
  }
  function pick(list) { return list[_secureRng.int(0, list.length - 1)]; }

  const RANK_COLOR = {Z:"#7ff0ff",S:"#ffd477",A:"#c084fc",B:"#8cbbff"};
  const RANK_ORDER = ["Z","S","A","B"];
  const RANK_STARS = {B:3,A:4,S:5,Z:6};
  const STAGES = ["t-boot","t-streak","t-beam","t-reveal","t-out"];
  const REDUCE = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  const fx = (() => {
    const cv = $("fx"), ctx = cv.getContext("2d");
    const NEUTRAL = [159,179,209];
    let w = 0, h = 0, raf = 0, last = 0, alive = false, keep = false;
    let warp = 0, warpT = 0, mix = 0, mixT = 0, embers = false, emberAcc = 0, col = [140,187,255];
    let lines = [], parts = [];
    const rgb = hex => [1,3,5].map(i => parseInt(hex.slice(i,i+2),16));
    function resize() {
      const d = Math.min(window.devicePixelRatio || 1, 2);
      w = innerWidth; h = innerHeight;
      cv.width = w * d; cv.height = h * d;
      ctx.setTransform(d,0,0,d,0,0);
    }
    function frame(t) {
      const dt = Math.min(.05, (t - last) / 1000 || .016); last = t;
      warp += (warpT - warp) * Math.min(1, dt * (warpT > warp ? 2.2 : 9));
      mix += (mixT - mix) * Math.min(1, dt * 5);
      ctx.clearRect(0,0,w,h);
      ctx.globalCompositeOperation = "lighter";
      const cx = w/2, cy = h/2, maxR = Math.hypot(w,h) / 2 * 1.05;
      if (warp > .01) {
        const c = NEUTRAL.map((n,i) => Math.round(n + (col[i]-n) * mix));
        ctx.lineCap = "round";
        for (const l of lines) {
          l.r += (.02 + l.r * 1.6) * l.v * warp * dt * 2.2;
          if (l.r > 1.05) { l.r = _secureRng.random() * .05; l.a = _secureRng.random() * Math.PI * 2; }
          const r0 = l.r * maxR, r1 = Math.max(0, r0 - (4 + l.r * 240 * warp));
          const al = Math.min(1, l.r * 1.8) * warp;
          ctx.strokeStyle = `rgba(${c[0]},${c[1]},${c[2]},${al.toFixed(3)})`;
          ctx.lineWidth = 1 + l.r * 2;
          ctx.beginPath();
          ctx.moveTo(cx + Math.cos(l.a) * r1, cy + Math.sin(l.a) * r1);
          ctx.lineTo(cx + Math.cos(l.a) * r0, cy + Math.sin(l.a) * r0);
          ctx.stroke();
        }
      }
      if (embers) {
        emberAcc += dt * 55;
        while (emberAcc >= 1) {
          emberAcc--;
          parts.push({x:_secureRng.random()*w,y:h+8,vx:(_secureRng.random()-.5)*30,vy:-(60+_secureRng.random()*130),g:0,drag:1,life:2.4+_secureRng.random()*2,max:4,size:1+_secureRng.random()*2.2,col});
        }
      }
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        p.life -= dt;
        if (p.life <= 0 || parts.length > 700) { parts.splice(i,1); continue; }
        const k = Math.pow(p.drag, dt * 60);
        p.vx *= k; p.vy = p.vy * k + p.g * dt;
        p.x += p.vx * dt; p.y += p.vy * dt;
        const a = Math.min(1, p.life / Math.min(p.max, 1));
        ctx.fillStyle = `rgba(${p.col[0]},${p.col[1]},${p.col[2]},${a.toFixed(3)})`;
        ctx.beginPath(); ctx.arc(p.x, p.y, Math.max(.3, p.size * (.4 + a * .6)), 0, 6.283); ctx.fill();
      }
      if (!keep && !embers && warp < .01 && !parts.length) { stop(); return; }
      raf = requestAnimationFrame(frame);
    }
    function start() {
      if (REDUCE) return;
      keep = true;
      if (alive) return;
      alive = true; warp = warpT = mix = mixT = 0; parts = []; emberAcc = 0;
      resize();
      lines = Array.from({length:150}, () => ({a:_secureRng.random()*Math.PI*2, r:_secureRng.random(), v:.4+_secureRng.random()*.9}));
      cv.style.display = "block";
      last = performance.now();
      raf = requestAnimationFrame(frame);
    }
    function stop() { alive = false; cancelAnimationFrame(raf); ctx.clearRect(0,0,w,h); cv.style.display = "none"; }
    window.addEventListener("resize", () => { if (alive) resize(); });
    return {
      start,
      release() { keep = false; warpT = 0; embers = false; },
      setColor(hex) { col = rgb(hex); },
      setWarp(v) { warpT = v; },
      setMix(v) { mixT = v; },
      embers(on) { embers = on; },
      burst(n, speed) {
        if (!alive) return;
        for (let i = 0; i < n; i++) {
          const a = _secureRng.random() * 6.283, sp = speed * (.3 + _secureRng.random() * .9);
          parts.push({x:w/2,y:h/2,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,g:140,drag:.965,life:.8+_secureRng.random()*1.1,max:1.4,size:1.5+_secureRng.random()*2.8,col});
        }
      }
    };
  })();

  const rv = {q:[], i:0, results:[], ready:0};

  function showReveal(i) {
    const r = rv.q[i], a = agentById(r.id), ov = $("reveal");
    const isHighRank = (a.rank === "Z" || a.rank === "S");
    isSZAnimation = isHighRank;
    const skipBtn = $("rvSkip");
    skipBtn.classList.toggle("disabled", isHighRank);

    ov.style.setProperty("--c", RANK_COLOR[a.rank]);
    ov.classList.toggle("hi", isHighRank);
    $("rvBig").textContent = a.rank;
    $("rvCard").innerHTML = art(a) + `<span class="rk">${a.rank}</span>`;
    $("rvName").innerHTML = [...a.name].map((c,k) => `<span style="--i:${k}">${c === " " ? "&nbsp;" : escapeHtml(c)}</span>`).join("");
    $("rvRole").textContent = a.type;
    $("rvTags").innerHTML = `<span class="rv-tag">${a.rank}-RANK</span>` + (r.featured ? '<span class="rv-tag">FEATURED</span>' : "") + (r.isNew ? '<span class="rv-tag">NOVÝ</span>' : "");
    $("rvPips").innerHTML = Array.from({length:6}, (_,k) => `<i style="--i:${k}" class="${k < RANK_STARS[a.rank] ? "on" : ""}"></i>`).join("");
    $("rvNext").textContent = rv.q.length > 1 ? `klepni pro pokračování · ${i+1} / ${rv.q.length}` : "klepni pro pokračování";
    ov.classList.remove("in"); void ov.offsetWidth; ov.classList.add("in");
    fx.start(); fx.setColor(RANK_COLOR[a.rank]); fx.embers(true);
    sfx.card(a.rank);
    fx.burst(a.rank === "Z" ? 220 : a.rank === "S" ? 150 : 80, 480);
    rv.ready = Date.now() + (isHighRank ? 2500 : 650);
  }

  function finishReveal() {
    if (isSZAnimation && Date.now() < rv.ready) return;
    $("reveal").classList.remove("open","in");
    isSZAnimation = false;
    showResults(rv.results);
  }

  $("reveal").addEventListener("click", () => {
    if (isSZAnimation && Date.now() < rv.ready) return;
    if (Date.now() < rv.ready) return;
    if (rv.i + 1 < rv.q.length) { rv.i++; showReveal(rv.i); } else finishReveal();
  });

  $("rvSkip").addEventListener("click", e => {
    e.stopPropagation();
    if (!isSZAnimation) finishReveal();
  });

  window.inspectAgent = function(agentId) {
    const agent = agentById(agentId);
    if (!agent) return;
    rv.q = [{ id: agent.id, featured: false, isNew: false }];
    rv.i = 0; rv.results = []; isSZAnimation = false;
    $("rvSkip").classList.remove("disabled");
    const ov = $("reveal");
    ov.style.setProperty("--c", RANK_COLOR[agent.rank]);
    ov.classList.toggle("hi", agent.rank === "Z" || agent.rank === "S");
    $("rvBig").textContent = agent.rank;
    $("rvCard").innerHTML = art(agent) + `<span class="rk">${agent.rank}</span>`;
    $("rvName").innerHTML = [...agent.name].map((c,k) => `<span style="--i:${k}">${c === " " ? "&nbsp;" : escapeHtml(c)}</span>`).join("");
    $("rvRole").textContent = agent.type;
    $("rvTags").innerHTML = `<span class="rv-tag">${agent.rank}-RANK</span>`;
    $("rvPips").innerHTML = Array.from({length:6}, (_,k) => `<i style="--i:${k}" class="${k < RANK_STARS[agent.rank] ? "on" : ""}"></i>`).join("");
    $("rvNext").textContent = "klepni pro zavření";
    ov.classList.remove("in"); void ov.offsetWidth; ov.classList.add("in");
    ov.classList.add("open");
    fx.start(); fx.setColor(RANK_COLOR[agent.rank]); fx.embers(true);
    rv.ready = Date.now() + 200;
    sfx.tick();
  };

  let spinTimers = [];
  function endSpin(results) {
    spinTimers.forEach(clearTimeout); spinTimers = [];
    const sc = $("scan");
    sc.onclick = null;
    sc.classList.remove("show", ...STAGES);
    const q = results.length === 1 ? results.slice() : results.filter(r => r.rank === "Z" || r.rank === "S");
    if (q.length) {
      rv.q = q; rv.i = 0; rv.results = results;
      $("reveal").classList.add("open");
      showReveal(0);
    } else {
      showResults(results);
    }
  }

  function doPull(count) {
    if (busy) return;
    const cost = count * COST;
    const state = getGameState();
    if (state.tokens < cost) { sfx.error(); toast("Nemáš dost školních bodů. Koupit je můžeš v obchodě."); return; }

    lastFocus = document.activeElement;
    if (lastFocus && lastFocus.blur) lastFocus.blur();

    state.tokens -= cost;
    busy = true;
    sfx.riser();
    const owned = {...state.inventory}, raw = [];
    for (let i = 0; i < count; i++) raw.push(rollOne(state));
    const seen = new Set();
    const results = raw.map(r => { const nw = !owned[r.id] && !seen.has(r.id); seen.add(r.id); return {...r, isNew:nw}; });

    saveGameState(state);
    render();

    const best = RANK_ORDER.find(r => results.some(x => x.rank === r)) || "B";
    const sc = $("scan"), status = $("scanStatus");
    sc.classList.remove(...STAGES);
    sc.style.setProperty("--c", RANK_COLOR[best]);
    $("scanRank").textContent = best;
    $("scanCh").textContent = "CH " + String(_secureRng.int(1000, 9999));
    status.textContent = "ANALYZING SIGNAL"; status.classList.add("dots");
    $("scanPips").querySelectorAll("i").forEach((p, i) => p.classList.toggle("on", i < RANK_STARS[best]));
    sc.classList.add("show");
    fx.start(); fx.setColor(RANK_COLOR[best]);
    const total = count === 1 ? 3100 : 3600;
    const at = (ms, fn) => spinTimers.push(setTimeout(fn, ms));
    at(30,   () => { sc.classList.add("t-boot"); fx.setWarp(1); });
    at(600,  () => { sc.classList.add("t-streak"); fx.setMix(1); });
    at(1050, () => sc.classList.add("t-beam"));
    at(1330, () => { sfx.impact(best); fx.setWarp(0); fx.burst(110 + RANK_STARS[best] * 28, 420 + RANK_STARS[best] * 40); });
    at(1650, () => {
      sfx.sting(best);
      sc.classList.add("t-reveal");
      fx.embers(true);
      status.classList.remove("dots");
      status.textContent = count > 1 ? `BEST · ${best}-RANK` : `${best}-RANK · SIGNAL CONFIRMED`;
    });
    at(total - 380, () => sc.classList.add("t-out"));
    at(total, () => endSpin(results));
    sc.onclick = () => endSpin(results);
  }

  function showResults(results) {
    busy = false; render();
    fx.release(); fx.embers(false);
    const zCount = results.filter(r => r.rank === "Z").length;
    const sCount = results.filter(r => r.rank === "S").length;
    let title = "VÝSLEDKY ZÁPISU";
    if (zCount) {
      const zr = results.find(r => r.rank === "Z");
      title = `Z-RANK – ${agentById(zr.id).name.toUpperCase()} NASTOUPIL!`;
    }
    else if (sCount) title = sCount === 1 ? "S-RANK UČITEL!" : `${sCount}× S-RANK UČITEL!`;
    $("resultTitle").textContent = title;
    $("overlay").classList.toggle("zwin", zCount > 0);
    $("resultSub").textContent = `${results.length} ${results.length === 1 ? "zápis" : "zápisy"} · ${zCount ? "Mimořádně vzácný zásah!" : sCount ? "Sbor je silnější." : "Další zvonění čeká."}`;
    $("resultGrid").innerHTML = results.map((r,i) => {
      const a = agentById(r.id);
      return `<div class="result-card ${a.rank}" style="animation-delay:${i*65}ms">${art(a)}<span class="rk">${a.rank}</span><b>${escapeHtml(a.name)}</b><small>${escapeHtml(a.type)}${r.featured ? " · FEATURED" : ""}</small></div>`;
    }).join("");
    $("overlay").classList.add("open");
    $("closeResults").focus();
    sfx.results(zCount, sCount);
    setTimeout(loadLeaderboard, 1500);
  }

  function render() {
    const state = getGameState();
    $("tokens").textContent = state.tokens.toLocaleString("cs-CZ");
    $("zPity").textContent = `${state.zPity} / ${Z_HARD}`;
    $("sPity").textContent = `${state.sPity} / ${S_HARD}`;
    $("aPity").textContent = `${state.aPity} / ${A_HARD}`;
    $("zMeter").style.width = `${Math.min(100,state.zPity/Z_HARD*100)}%`;
    $("sMeter").style.width = `${Math.min(100,state.sPity/S_HARD*100)}%`;
    $("aMeter").style.width = `${Math.min(100,state.aPity/A_HARD*100)}%`;
    $("guarantee").textContent = state.guaranteed ? "FEATURED" : "50/50";
    $("totalPulls").textContent = state.totalPulls.toLocaleString("cs-CZ");
    $("shopCookies").textContent = Math.floor(readCookies().available).toLocaleString("cs-CZ") + " sušenek";
    $("singleBtn").disabled = busy || state.tokens < COST;
    $("tenBtn").disabled = busy || state.tokens < COST*10;
    $("roster").innerHTML = agents.map(a => `<div class="char ${a.rank.toLowerCase()}${state.inventory[a.id] ? "" : " locked"}" onclick="inspectAgent('${a.id}')">${art(a)}<span class="rk">${a.rank}</span><b>${escapeHtml(a.name)}</b><small>${escapeHtml(a.type)}${a.id === activeBanner().featured ? " · Featured" : ""}</small><small>× ${state.inventory[a.id] || 0}</small></div>`).join("");
    const collected = agents.filter(a => state.inventory[a.id]).length;
    $("rosterCount").textContent = `${collected} / ${agents.length} získáno`;
    $("history").innerHTML = sessionHistory.length ? sessionHistory.slice(0,8).map(h => {
      const a = agentById(h.id);
      const date = new Date(h.time).toLocaleString("cs-CZ",{dateStyle:"short",timeStyle:"short"});
      return `<div class="history-item"><div class="rarity-dot ${a.rank}">${a.rank}</div><div><b>${escapeHtml(a.name)}${h.featured ? " *" : ""}</b><small>${escapeHtml(a.type)} · #${h.pull} · ${date}</small></div></div>`;
    }).join("") : '<div class="empty">Zatím žádné zápisy.<br>První zvonění čeká.</div>';
  }

  $("singleBtn").addEventListener("click", () => doPull(1));
  $("tenBtn").addEventListener("click", () => doPull(10));

  // ---------- OBCHOD ----------
  const RICKROLL_URL = "https://www.youtube.com/watch?v=Aq5WXmQQooo";

  function readCookies() {
    let save = null;
    try { save = JSON.parse(localStorage.getItem("cookieClickerSave")); } catch (e) {}
    const stats = window.OPS_STATS ? window.OPS_STATS.getStats() : null;
    const saveCookies = save && Number.isFinite(Number(save.cookies)) ? Math.max(0, Number(save.cookies)) : 0;
    const statCookies = stats && stats.clicker && Number.isFinite(Number(stats.clicker.cookies)) ? Math.max(0, Number(stats.clicker.cookies)) : 0;
    const available = Math.max(saveCookies, statCookies);
    return { save, saveCookies, statCookies, available };
  }

  function addTokens(gain, cookieCost) {
    const c = readCookies();
    const stats = window.OPS_STATS ? window.OPS_STATS.getStats() : null;

    if (cookieCost > 0) {
      const remainingCookies = Math.max(0, c.available - cookieCost);
      if (c.save) {
        c.save.cookies = remainingCookies;
        try { localStorage.setItem("cookieClickerSave", JSON.stringify(c.save)); } catch (e) {}
      }
      if (stats && stats.clicker) {
        stats.clicker.cookies = remainingCookies;
      }
    }
    if (stats) {
      stats.gacha = stats.gacha || {};
      const cur = Number.isFinite(Number(stats.gacha.tokens)) ? Number(stats.gacha.tokens) : 2000;
      stats.gacha.tokens = Math.max(0, cur + gain);
      window.OPS_STATS.saveStats(stats);
    }
  }

  function buyWithCookies(cookieCost, gain) {
    if (window.OPS_STATS && typeof window.OPS_STATS.exchangeCookies === "function") {
      const res = window.OPS_STATS.exchangeCookies(cookieCost, gain);
      if (!res.success) {
        sfx.error();
        toast(`Nemáš dost sušenek (vidím ${Math.floor(res.available || 0).toLocaleString("cs-CZ")}, potřeba ${cookieCost.toLocaleString("cs-CZ")}).`);
        return;
      }
      sfx.coin();
      render();
      toast(`Nakoupeno ${gain.toLocaleString("cs-CZ")} bodů za ${cookieCost.toLocaleString("cs-CZ")} sušenek! Zbývá: ${Math.floor(res.cookies || 0).toLocaleString("cs-CZ")}`);
      return;
    }
    const c = readCookies();
    if (c.available < cookieCost) {
      sfx.error();
      toast(`Nemáš dost sušenek (vidím ${Math.floor(c.available).toLocaleString("cs-CZ")}, potřeba ${cookieCost.toLocaleString("cs-CZ")}).`);
      return;
    }
    addTokens(gain, cookieCost);
    sfx.coin();
    render();
    toast(`Nakoupeno ${gain.toLocaleString("cs-CZ")} bodů za ${cookieCost.toLocaleString("cs-CZ")} sušenek! Zbývá: ${Math.floor(Math.max(0, c.available - cookieCost)).toLocaleString("cs-CZ")}`);
  }

  $("shopBuy1").addEventListener("click", () => buyWithCookies(1000, 160));
  $("shopBuy2").addEventListener("click", () => {
    buyWithCookies(10000, 1600);
  });
  $("shopBuy3").addEventListener("click", () => {
    addTokens(1600, 0);
    sfx.jingle();
    render();
    toast("+1 600 bodů! Užij si speciální nabídku.");
    window.open(RICKROLL_URL, "_blank", "noopener");
  });

  $("resetBtn").addEventListener("click", () => {
    if (busy) return;
    if (!confirm("Opravdu resetovat body, pity a sbor?")) return;
    sessionHistory = [];
    saveGameState({ tokens: 1600, zPity: 0, sPity: 0, aPity: 0, guaranteed: false, totalPulls: 0, inventory: {} });
    render();
    toast("Účet gachy byl resetován.");
  });

  $("clearHistory").addEventListener("click", () => {
    if (!sessionHistory.length) return;
    if (!confirm("Vymazat historii? Sbor a pity zůstanou zachovány.")) return;
    sessionHistory = [];
    render();
  });

  function closeOverlay() {
    $("overlay").classList.remove("open");
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  $("closeResults").addEventListener("click", closeOverlay);
  $("overlay").addEventListener("click", e => { if (e.target === $("overlay")) closeOverlay(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape" && $("overlay").classList.contains("open")) closeOverlay(); });

  // ---------- ŽEBŘÍČEK ----------
  let lbMode = "pulls", lbRows = [];
  const Z_IDS = agents.filter(a => a.rank === "Z").map(a => a.id);
  const S_IDS = agents.filter(a => a.rank === "S").map(a => a.id);

  async function loadLeaderboard() {
    const box = $("lbList");
    const cfg = window.OPS_STATS && window.OPS_STATS.config;
    if (!cfg || !cfg.url || !cfg.anonKey) { box.innerHTML = '<div class="empty">Žebříček není dostupný.</div>'; return; }
    if (!lbRows.length) box.innerHTML = '<div class="empty">Načítám žebříček…</div>';
    try {
      const fetchFn = _nativeFetch || fetch;
      const url = `${cfg.url}/rest/v1/${cfg.table}?select=username,totalPulls:stats->gacha->totalPulls,inventory:stats->gacha->inventory&order=stats->gacha->totalPulls.desc.nullslast&limit=100`;
      const res = await fetchFn(url, { headers: { apikey: cfg.anonKey, Authorization: `Bearer ${cfg.anonKey}` } });
      if (!res.ok) throw new Error("HTTP " + res.status);
      lbRows = await res.json();
      renderLeaderboard();
    } catch (e) {
      console.warn("[Gacha] Žebříček selhal:", e);
      box.innerHTML = '<div class="empty">Žebříček se nepodařilo načíst.</div>';
    }
  }

  function renderLeaderboard() {
    const box = $("lbList");
    const me = window.OPS_STATS ? window.OPS_STATS.getUsername() : "";
    let rows = (Array.isArray(lbRows) ? lbRows : []).map(r => {
      const inv = (r.inventory && typeof r.inventory === "object") ? r.inventory : {};
      return {
        name: r.username || "?",
        pulls: Number(r.totalPulls) || 0,
        collected: agents.filter(a => (Number(inv[a.id]) || 0) > 0).length,
        z: Z_IDS.reduce((n, id) => n + (Number(inv[id]) || 0), 0),
        s: S_IDS.reduce((n, id) => n + (Number(inv[id]) || 0), 0)
      };
    }).filter(r => r.pulls > 0);

    rows.sort(lbMode === "pulls"
      ? (a, b) => b.pulls - a.pulls
      : (a, b) => (b.collected - a.collected) || ((b.z * 10 + b.s) - (a.z * 10 + a.s)) || (b.pulls - a.pulls));

    if (!rows.length) { box.innerHTML = '<div class="empty">Zatím nikdo netáhl. Buď první!</div>'; return; }

    const medal = i => "#" + (i + 1);
    const rowHtml = (r, i) => `<div class="lb-row${r.name === me ? " me" : ""}">
      <span class="lb-pos">${medal(i)}</span>
      <span class="lb-name">${escapeHtml(r.name)}</span>
      <span class="lb-stats"><b>${r.pulls.toLocaleString("cs-CZ")}</b> zápisů · ${r.collected}/${agents.length} učitelů · <span class="lz">Z ${r.z}</span> · <span class="ls">S ${r.s}</span></span>
    </div>`;

    let html = rows.slice(0, 10).map(rowHtml).join("");
    const myIdx = rows.findIndex(r => r.name === me);
    if (myIdx >= 10) html += '<div class="lb-gap">···</div>' + rowHtml(rows[myIdx], myIdx);
    box.innerHTML = html;
  }

  document.querySelectorAll(".lb-tab").forEach(btn => btn.addEventListener("click", () => {
    lbMode = btn.dataset.mode;
    document.querySelectorAll(".lb-tab").forEach(b => b.classList.toggle("active", b === btn));
    sfx.tick();
    renderLeaderboard();
  }));
  $("lbRefresh").addEventListener("click", () => { sfx.tick(); loadLeaderboard(); });

  // ---------- Tlačítko ztlumení ----------
  function updateMuteBtn() {
    const b = $("muteBtn");
    b.textContent = sfx.isMuted() ? "Zvuk: VYP" : "Zvuk: ZAP";
    b.title = sfx.isMuted() ? "Zapnout zvuky" : "Ztlumit zvuky";
  }
  $("muteBtn").addEventListener("click", () => {
    sfx.setMuted(!sfx.isMuted());
    updateMuteBtn();
    if (!sfx.isMuted()) sfx.tick();
  });
  window.addEventListener("ops:stats-updated", () => { if (!busy) render(); });
  window.addEventListener("ops:tokens-changed", () => { if (!busy) render(); });
  updateMuteBtn();

  initBanners();
  render();
  loadLeaderboard();
})();