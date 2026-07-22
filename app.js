const app = document.querySelector("#app");
const toastEl = document.querySelector("#toast");

const STORAGE = {
  onboarded: "moodMixerOnboarded",
  drinks: "moodMixerDrinks"
};

const moods = [
  { id:"happy", label:"开心", emoji:"☺", color:"rgba(255,180,92,.22)", c1:"#ffb45c", c2:"#f37c9b", flavors:["蜂蜜","橙花","气泡"] },
  { id:"calm", label:"平静", emoji:"≈", color:"rgba(120,217,196,.2)", c1:"#78d9c4", c2:"#79a8d8", flavors:["薄荷","月光","青柠"] },
  { id:"tired", label:"疲惫", emoji:"☾", color:"rgba(126,94,76,.28)", c1:"#65483b", c2:"#9f6d5b", flavors:["冷萃","可可","微苦"] },
  { id:"anxious", label:"焦虑", emoji:"⌁", color:"rgba(255,180,92,.2)", c1:"#f6b34c", c2:"#d96f56", flavors:["柚皮","海盐","碎冰"] },
  { id:"wronged", label:"委屈", emoji:"◔", color:"rgba(243,124,155,.2)", c1:"#e986a6", c2:"#8d7fd0", flavors:["浆果","雨水","奶泡"] },
  { id:"excited", label:"兴奋", emoji:"✦", color:"rgba(168,140,255,.22)", c1:"#a88cff", c2:"#f37c9b", flavors:["葡萄","气泡","跳跳糖"] },
  { id:"lonely", label:"孤独", emoji:"○", color:"rgba(93,115,158,.24)", c1:"#506b99", c2:"#6e5e92", flavors:["蓝莓","晚风","冰块"] },
  { id:"irritable", label:"烦躁", emoji:"∿", color:"rgba(220,93,82,.22)", c1:"#db5e55", c2:"#e89b59", flavors:["姜","柠檬皮","辛香"] },
  { id:"blank", label:"空白", emoji:"□", color:"rgba(255,255,255,.1)", c1:"#d4d8dd", c2:"#8ba0b5", flavors:["苏打","白桃","空气"] },
  { id:"hopeful", label:"期待", emoji:"↗", color:"rgba(120,217,196,.2)", c1:"#74d1b8", c2:"#f1b85d", flavors:["青提","罗勒","晨光"] },
  { id:"romantic", label:"心动", emoji:"♡", color:"rgba(243,124,155,.24)", c1:"#f37c9b", c2:"#ca88d6", flavors:["覆盆子","玫瑰","柔光"] },
  { id:"chaotic", label:"混乱", emoji:"✺", color:"rgba(168,140,255,.24)", c1:"#7f68d4", c2:"#df785f", flavors:["不规则碎冰","黑莓","胡椒"] }
];

const contexts = ["学习或工作","人际关系","独处","恋爱","家庭","身体状态","天气","没有具体原因"];
const weathers = ["晴天","阴天","小雨","暴雨","大雾","晚风","雷阵雨","日落"];
const desiredStates = ["放松一点","勇敢一点","清醒一点","开心一点","被安慰","不再内耗","保持现在","什么都不需要改变"];
const glassOptions = [
  { id:"hurricane", label:"飓风杯" },
  { id:"goblet", label:"圆肚杯" },
  { id:"highball", label:"高球杯" }
];

const sampleDrinks = [
  {name:"会议结束后的自由", subtitle:"献给关掉摄像头之后的第一口空气。", emotions:["疲惫","开心"], flavors:["柠檬","气泡","晚风"], c1:"#f0a45b", c2:"#876fd5", glassShape:"highball"},
  {name:"已读不回莫吉托", subtitle:"消息留在屏幕里，薄荷先替你降温。", emotions:["焦虑","烦躁"], flavors:["薄荷","青柠","微苦"], c1:"#7bd2ae", c2:"#d7c86a", glassShape:"highball"},
  {name:"DDL 前夜浓缩", subtitle:"黑咖啡般的清醒，以及尚未保存的勇气。", emotions:["疲惫","焦虑"], flavors:["冷萃","可可","海盐"], c1:"#4b302e", c2:"#9a6350", glassShape:"hurricane"},
  {name:"周五下班第一口空气", subtitle:"气泡很满，待办事项已经沉底。", emotions:["开心","期待"], flavors:["青提","气泡","橙花"], c1:"#79d2b8", c2:"#f6b85f", glassShape:"hurricane"},
  {name:"暧昧期气泡水", subtitle:"甜度不明，气泡很多，答案暂时保密。", emotions:["心动","期待"], flavors:["覆盆子","玫瑰","气泡"], c1:"#ee7fa1", c2:"#ad83df", glassShape:"goblet"},
  {name:"社交电量不足冰茶", subtitle:"适合静音饮用，不建议同时回复八条消息。", emotions:["疲惫","孤独"], flavors:["乌龙","冰块","晚风"], c1:"#6b5543", c2:"#6e739d", glassShape:"goblet"}
];

let state = {
  view: localStorage.getItem(STORAGE.onboarded) ? "home" : "onboarding",
  onboardingStep: 0,
  activeTab: "home",
  mixStep: 1,
  form: {
    emotions: [],
    customMood: "",
    intensity: 58,
    contexts: [],
    note: "",
    energy: 50,
    weather: "晚风",
    desired: "放松一点",
    glassShape: "hurricane"
  },
  currentDrink: null,
  detailDrink: null,
  shareOpen: false,
  shareTemplate: "midnight",
  mixingIndex: 0,
  installPrompt: null
};

window.addEventListener("beforeinstallprompt", e => {
  e.preventDefault();
  state.installPrompt = e;
});

function getSavedDrinks() {
  try { return JSON.parse(localStorage.getItem(STORAGE.drinks) || "[]"); }
  catch { return []; }
}
function setSavedDrinks(list) {
  localStorage.setItem(STORAGE.drinks, JSON.stringify(list));
}
function showToast(message) {
  toastEl.textContent = message;
  toastEl.classList.add("show");
  setTimeout(() => toastEl.classList.remove("show"), 1900);
}
function escapeHTML(value="") {
  return value.replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));
}
function primaryMood() {
  return moods.find(m => m.id === state.form.emotions[0]) || moods.find(m => m.id === "blank");
}
function moodById(id) { return moods.find(m => m.id === id); }
function getGreeting() {
  const h = new Date().getHours();
  if (h < 11) return "早上好";
  if (h < 18) return "下午好";
  return "晚上好";
}

function tinyDrink(drink) {
  return `<div class="tiny-wrap">${drinkVisual({
    c1: drink.c1,
    c2: drink.c2,
    garnishColor: drink.garnishColor || "#ffb45c",
    glassShape: drink.glassShape || "hurricane"
  })}</div>`;
}

function glassOptionCard(shape, label, active) {
  return `<button class="option-card glass-option ${active ? "active" : ""}" data-glass-shape="${shape}">
    <div>
      <div class="glass-mini shape-${shape}"></div>
      <div class="glass-mini-base"></div>
    </div>
    <span>${label}</span>
  </button>`;
}

function drinkVisual(drink, size="large") {
  const shape = drink.glassShape || "hurricane";
  const bubbles = Array.from({length: 9}, (_,i) =>
    `<i class="bubble" style="--left:${12 + (i*19)%78}%;--delay:-${(i*.67).toFixed(1)}s;--duration:${4 + (i%4)}s"></i>`
  ).join("");
  return `
    <div class="drink-wrap ${size} shape-${shape}" style="--c1:${drink.c1};--c2:${drink.c2};--garnish:${drink.garnishColor || "#ffb45c"}">
      <div class="drink-glass">
        <div class="drink-liquid">
          ${bubbles}
          <i class="ice" style="--left:18%;--top:27%;--rot:18deg"></i>
          <i class="ice" style="--left:52%;--top:44%;--rot:-11deg"></i>
          <i class="ice" style="--left:30%;--top:63%;--rot:34deg"></i>
        </div>
      </div>
      <div class="leaf leaf-a"></div><div class="leaf leaf-b"></div>
      <div class="straw"></div>
      <div class="garnish"></div>
      <div class="stem"></div><div class="base"></div>
    </div>`;
}

function nav(active) {
  return `
    <nav class="bottom-nav" aria-label="主导航">
      <div class="nav-inner">
        ${[
          ["home","⌂","调一杯"],
          ["cellar","◫","酒窖"],
          ["discover","✦","酒单"],
          ["profile","○","我的"]
        ].map(([id,icon,label]) => `
          <button class="nav-btn ${active===id?"active":""}" data-nav="${id}">
            <span>${icon}</span><span>${label}</span>
          </button>`).join("")}
      </div>
    </nav>`;
}

function render() {
  app.innerHTML = "";
  if (state.view === "onboarding") return renderOnboarding();
  if (state.view === "mix") return renderMix();
  if (state.view === "mixing") return renderMixing();
  if (state.view === "result") return renderResult(state.currentDrink, false);
  renderMain();
}

function renderOnboarding() {
  const pages = [
    {
      title:"把今天的情绪，调成一杯酒。",
      text:"无需解释得很完整。选择一些感受，我们会为你调制一杯只属于今天的饮品。",
      visual: drinkVisual({c1:"#f6a299", c2:"#5fcde1", garnishColor:"#ffb45c", glassShape:"hurricane"})
    },
    {
      title:"每一种情绪，都是一种风味。",
      text:"疲惫可以是冷萃，心动可以是覆盆子气泡，复杂也可以是一种配方。",
      visual:`<div class="flavor-list">
        <div class="flavor-item">疲惫<br><b>冷萃咖啡</b></div>
        <div class="flavor-item">心动<br><b>覆盆子气泡</b></div>
        <div class="flavor-item">焦虑<br><b>微苦柚皮</b></div>
        <div class="flavor-item">平静<br><b>薄荷与月光</b></div>
      </div>`
    },
    {
      title:"收藏每一个版本的自己。",
      text:"你的每一杯饮品，都会被保存在情绪酒窖里，变成一份只属于你的情绪酒单。",
      visual:`<div class="card month-card" style="width:90%;text-align:left">
        <span class="eyebrow">本月特调</span>
        <h2 style="margin-top:8px">七月情绪酒单</h2>
        <p class="muted">大部分时间像一杯慢慢融化的薄荷冰，偶尔想逃跑，但仍然保留着很轻的甜。</p>
      </div>`
    }
  ];
  const p = pages[state.onboardingStep];
  app.innerHTML = `
    <main class="app-shell no-nav onboarding">
      <div class="onboarding-visual">
        <span class="orb one"></span><span class="orb two"></span>
        ${p.visual}
      </div>
      <section class="onboarding-copy">
        <div class="dots">${pages.map((_,i)=>`<span class="dot ${i===state.onboardingStep?"active":""}"></span>`).join("")}</div>
        <h1>${p.title}</h1>
        <p class="muted" style="line-height:1.8">${p.text}</p>
        <div class="btn-row" style="margin-top:24px">
          <button class="primary-btn" id="onboardNext">${state.onboardingStep===2?"开始调制":"继续"}</button>
          ${state.onboardingStep<2?`<button class="text-link" id="skipOnboarding">跳过</button>`:""}
        </div>
      </section>
    </main>`;
  document.querySelector("#onboardNext").onclick = () => {
    if (state.onboardingStep < 2) { state.onboardingStep++; render(); }
    else finishOnboarding();
  };
  document.querySelector("#skipOnboarding")?.addEventListener("click", finishOnboarding);
}
function finishOnboarding() {
  localStorage.setItem(STORAGE.onboarded, "true");
  state.view = "home"; state.activeTab = "home"; render();
}

function renderMain() {
  let content = "";
  if (state.activeTab === "home") content = homeView();
  if (state.activeTab === "cellar") content = cellarView();
  if (state.activeTab === "discover") content = discoverView();
  if (state.activeTab === "profile") content = profileView();

  app.innerHTML = `<main class="app-shell"><div class="screen">${content}</div></main>${nav(state.activeTab)}`;
  bindMainEvents();
  if (state.detailDrink) renderDetailOverlay();
}

function homeView() {
  const saved = getSavedDrinks();
  const recent = saved[0];
  return `
    <header class="topbar">
      <div><span class="eyebrow">${getGreeting()}</span></div>
      <button class="icon-btn avatar" data-nav="profile">M</button>
    </header>
    <section class="hero">
      <div class="hero-heading">
        <h1>今天想调一杯什么？</h1>
      </div>
      <div class="hero-drink">
        <div class="hero-halo"></div>
        ${drinkVisual({c1:"#f6a099",c2:"#59d0df",garnishColor:"#ffb45c",glassShape:"hurricane"})}
      </div>
      <button class="primary-btn" id="startMix">开始调制</button>
    </section>
    <section class="section">
      <div class="section-title"><h3>此刻更像</h3><span class="small muted">轻点即可开始</span></div>
      <div class="quick-chips">
        ${["tired","happy","anxious","calm","blank","chaotic"].map(id=>{
          const m=moodById(id); return `<button class="chip quick-mood" data-mood="${id}">${m.label}</button>`;
        }).join("")}
      </div>
    </section>
    <section class="section">
      <div class="section-title"><h3>最近一杯</h3>${recent?`<button class="text-link" data-nav="cellar">查看酒窖</button>`:""}</div>
      ${recent ? `
        <article class="card recent-card" data-open-drink="${recent.id}">
          <div class="mini-liquid" style="--c1:${recent.c1};--c2:${recent.c2}"></div>
          <div><h3>${escapeHTML(recent.name)}</h3><p class="muted small">${escapeHTML(recent.tastingNote.slice(0,42))}…</p></div>
          <span>›</span>
        </article>` : `
        <article class="card prompt-card"><p class="quote">第一杯还没有出现。今天的情绪，好像有一点难命名。</p></article>`}
    </section>
    <section class="section">
      <div class="section-title"><h3>今日小问</h3></div>
      <article class="card prompt-card">
        <span class="eyebrow">DAILY PROMPT</span>
        <p class="quote" style="margin-top:10px">今天有什么瞬间，让你的情绪突然发生了变化？</p>
      </article>
    </section>`;
}

function cellarView() {
  const saved = getSavedDrinks();
  return `
    <header class="topbar"><div><span class="eyebrow">MOOD CELLAR</span><h2 style="margin:4px 0 0">我的情绪酒窖</h2></div></header>
    <div class="quick-chips filter-row">
      ${["全部","本周","开心","疲惫","焦虑","平静","复杂"].map((x,i)=>`<button class="chip ${i===0?"active":""}">${x}</button>`).join("")}
    </div>
    ${saved.length ? `<div class="list-grid">${saved.map(drinkCard).join("")}</div>` :
      `<div class="empty"><div class="empty-icon">◌</div><h3>酒窖还是空的</h3><p class="muted">先调制一杯，让今天留下味道。</p><button class="primary-btn" id="emptyStart" style="margin-top:12px">调制第一杯</button></div>`}`;
}
function drinkCard(d) {
  return `<article class="card drink-card" data-open-drink="${d.id}">
    <div class="drink-preview">${tinyDrink(d)}</div>
    <h3>${escapeHTML(d.name)}</h3>
    <p>${new Date(d.createdAt).toLocaleDateString("zh-CN")} · ${escapeHTML(d.emotions.map(x=>x.label).join(" / "))}</p>
  </article>`;
}

function discoverView() {
  return `
    <header class="topbar"><div><span class="eyebrow">DISCOVER</span><h2 style="margin:4px 0 0">情绪酒单</h2></div></header>
    <div class="quick-chips filter-row">
      ${["今日特调","打工人专区","失眠酒单","恋爱限定","学生特调","社恐友好"].map((x,i)=>`<button class="chip ${i===0?"active":""}">${x}</button>`).join("")}
    </div>
    ${sampleDrinks.map((d,i)=>`
      <article class="card discover-card">
        <div class="drink-preview">${tinyDrink(d)}</div>
        <div><h3>${d.name}</h3><p>${d.subtitle}</p><button class="mini-btn use-recipe" data-sample="${i}">用这个配方调制</button></div>
      </article>`).join("")}`;
}

function profileView() {
  const saved = getSavedDrinks();
  const emotionCounts = {};
  saved.forEach(d=>d.emotions.forEach(e=>emotionCounts[e.label]=(emotionCounts[e.label]||0)+1));
  const topEmotion = Object.entries(emotionCounts).sort((a,b)=>b[1]-a[1])[0]?.[0] || "尚未出现";
  const avgEnergy = saved.length ? Math.round(saved.reduce((s,d)=>s+(d.input?.energy||50),0)/saved.length) : 0;
  return `
    <header class="topbar"><span class="eyebrow">PROFILE</span></header>
    <section class="profile-head">
      <div class="profile-avatar">M</div><h2 style="margin-bottom:4px">今晚也在营业</h2>
      <p class="muted small">私人情绪调酒师</p>
    </section>
    <div class="stats">
      <div class="card stat"><strong>${saved.length}</strong><span class="small muted">已调饮品</span></div>
      <div class="card stat"><strong>${topEmotion}</strong><span class="small muted">常见情绪</span></div>
      <div class="card stat"><strong>${avgEnergy}%</strong><span class="small muted">平均电量</span></div>
    </div>
    <section class="section">
      <article class="card month-card">
        <span class="eyebrow">你的七月情绪酒单</span>
        <h2 style="margin-top:9px">慢慢融化的薄荷冰</h2>
        <p class="muted">${saved.length ? "这个月的你偶尔疲惫，偶尔想逃跑，但每一次记录都留下了很轻的回甘。" : "还没有足够的配方。调制几杯之后，这里会长出属于你的月度风味。"}</p>
      </article>
    </section>
    <section class="section">
      <div class="card setting-row"><span>安装到桌面</span><button class="mini-btn" id="installApp">${state.installPrompt?"安装":"查看方法"}</button></div>
      <div class="card setting-row"><span>清空本地数据</span><button class="mini-btn" id="clearData">清空</button></div>
    </section>`;
}

function bindMainEvents() {
  document.querySelectorAll("[data-nav]").forEach(btn => btn.onclick = () => {
    state.activeTab = btn.dataset.nav; state.view = "home"; state.detailDrink = null; render();
  });
  document.querySelector("#startMix")?.addEventListener("click", startMix);
  document.querySelector("#emptyStart")?.addEventListener("click", startMix);
  document.querySelectorAll(".quick-mood").forEach(btn => btn.onclick = () => {
    resetForm(); state.form.emotions=[btn.dataset.mood]; startMix();
  });
  document.querySelectorAll("[data-open-drink]").forEach(el => el.onclick = () => {
    state.detailDrink = getSavedDrinks().find(d=>String(d.id)===el.dataset.openDrink); renderDetailOverlay();
  });
  document.querySelectorAll(".use-recipe").forEach(btn => btn.onclick = () => {
    const sample = sampleDrinks[Number(btn.dataset.sample)];
    resetForm();
    state.form.emotions = sample.emotions.map(label=>moods.find(m=>m.label===label)?.id).filter(Boolean);
    state.form.intensity = 68;
    state.form.desired = "保持现在";
    state.form.glassShape = sample.glassShape || "hurricane";
    startMix();
  });
  document.querySelector("#clearData")?.addEventListener("click", () => {
    if (confirm("确定清空全部本地饮品记录吗？")) { setSavedDrinks([]); showToast("酒窖已清空"); render(); }
  });
  document.querySelector("#installApp")?.addEventListener("click", async () => {
    if (state.installPrompt) {
      state.installPrompt.prompt();
      await state.installPrompt.userChoice;
      state.installPrompt = null;
    } else {
      showToast("请使用浏览器菜单中的“添加到主屏幕”");
    }
  });
}

function resetForm() {
  state.mixStep = 1;
  state.form = { emotions:[], customMood:"", intensity:58, contexts:[], note:"", energy:50, weather:"晚风", desired:"放松一点", glassShape:"hurricane" };
}
function startMix() { state.view="mix"; state.mixStep=1; render(); }

function renderMix() {
  app.innerHTML = `
    <main class="app-shell no-nav">
      <header class="topbar"><button class="back-btn" id="mixBack">‹</button><span class="eyebrow">MOOD MIXER</span><span style="width:44px"></span></header>
      <div class="progress-wrap">
        <div class="progress-meta"><span>调制中</span><span>${state.mixStep} / 5</span></div>
        <div class="progress"><div style="width:${state.mixStep*20}%"></div></div>
      </div>
      <section class="screen">${mixStepContent()}</section>
    </main>`;
  bindMixEvents();
}

function mixStepContent() {
  if (state.mixStep === 1) return `
    <div class="question-copy"><h2>此刻的你，更接近哪种状态？</h2><p class="muted">最多选择三种。没关系，复杂也可以是一种配方。</p></div>
    <div class="mood-grid">${moods.map(m=>`
      <button class="mood-card ${state.form.emotions.includes(m.id)?"active":""}" data-mood="${m.id}" style="--mood-bg:${m.color}" ${!state.form.emotions.includes(m.id)&&state.form.emotions.length>=3?"disabled":""}>
        <span class="emoji">${m.emoji}</span><span>${m.label}</span>
      </button>`).join("")}</div>
    <div class="card input-card"><input id="customMood" value="${escapeHTML(state.form.customMood)}" placeholder="自己描述：例如，有一点说不清楚" /></div>
    ${stepFooter(state.form.emotions.length>0 || state.form.customMood.trim())}`;
  if (state.mixStep === 2) return `
    <div class="question-copy"><h2>这种感觉有多浓？</h2><p class="muted">不需要准确，只要靠近你的感觉。</p></div>
    <div class="liquid-meter"><div class="meter-glass"><div class="meter-liquid" id="meterLiquid" style="height:${Math.max(8,state.form.intensity*0.92)}%"></div></div></div>
    <div class="range-wrap"><div class="range-value"><span id="rangeNumber">${state.form.intensity}</span><small>%</small></div>
      <input id="intensityRange" type="range" min="0" max="100" value="${state.form.intensity}" />
      <div class="range-labels"><span>淡淡的</span><span>刚刚好</span><span>很强烈</span><span>快溢出来</span></div>
    </div>${stepFooter(true)}`;
  if (state.mixStep === 3) return `
    <div class="question-copy"><h2>今天发生了什么？</h2><p class="muted">可选，也可以只留下几个词。</p></div>
    <div class="selection-grid">${contexts.map(x=>`<button class="option-card ${state.form.contexts.includes(x)?"active":""}" data-context="${x}">${x}</button>`).join("")}</div>
    <div class="card input-card"><textarea id="eventNote" placeholder="例如：方案又被打回来了，但下班时看到了很好看的晚霞。">${escapeHTML(state.form.note)}</textarea></div>
    ${stepFooter(true)}`;
  if (state.mixStep === 4) return `
    <div class="question-copy"><h2>现在还有多少电量？</h2><p class="muted">以及，今天更像什么天气？</p></div>
    <h3>当前电量</h3>
    <div class="energy-grid">${[10,30,50,70,100].map(v=>`<button class="energy-btn ${state.form.energy===v?"active":""}" data-energy="${v}">${v}%</button>`).join("")}</div>
    <h3>今日天气</h3>
    <div class="selection-grid">${weathers.map(x=>`<button class="option-card ${state.form.weather===x?"active":""}" data-weather="${x}">${x}</button>`).join("")}</div>
    ${stepFooter(true)}`;
  return `
    <div class="question-copy"><h2>喝完这杯之后，你希望自己变得……</h2><p class="muted">也可以什么都不改变，只陪自己坐一会儿。</p></div>
    <div class="selection-grid">${desiredStates.map(x=>`<button class="option-card ${state.form.desired===x?"active":""}" data-desired="${x}">${x}</button>`).join("")}</div>
    <h3 style="margin-top:22px">想用什么杯型装住今天？</h3>
    <div class="glass-option-grid">${glassOptions.map(o=>glassOptionCard(o.id,o.label,state.form.glassShape===o.id)).join("")}</div>
    <div class="step-footer"><button class="primary-btn" id="generateDrink">开始调制</button></div>`;
}
function stepFooter(enabled) { return `<div class="step-footer"><button class="primary-btn" id="nextStep" ${enabled?"":"disabled"}>继续</button></div>`; }

function bindMixEvents() {
  document.querySelector("#mixBack").onclick = () => {
    if (state.mixStep > 1) { state.mixStep--; render(); }
    else { state.view="home"; state.activeTab="home"; render(); }
  };

  document.querySelectorAll("[data-mood]").forEach(btn => btn.onclick = () => {
    const id = btn.dataset.mood;
    if (state.form.emotions.includes(id)) state.form.emotions = state.form.emotions.filter(x => x !== id);
    else if (state.form.emotions.length < 3) state.form.emotions = [...state.form.emotions, id];
    updateMoodSelectionUI();
  });

  document.querySelector("#customMood")?.addEventListener("input", e => {
    state.form.customMood = e.target.value;
    const next = document.querySelector("#nextStep");
    if (next) next.disabled = !(state.form.emotions.length > 0 || state.form.customMood.trim());
  });

  document.querySelector("#intensityRange")?.addEventListener("input", e => {
    state.form.intensity = Number(e.target.value);
    document.querySelector("#rangeNumber").textContent = e.target.value;
    document.querySelector("#meterLiquid").style.height = Math.max(8, state.form.intensity * .92) + "%";
  });

  document.querySelectorAll("[data-context]").forEach(btn => btn.onclick = () => {
    const x = btn.dataset.context;
    state.form.contexts = state.form.contexts.includes(x) ? state.form.contexts.filter(v => v !== x) : [...state.form.contexts, x];
    btn.classList.toggle("active");
  });

  document.querySelector("#eventNote")?.addEventListener("input", e => state.form.note = e.target.value);

  document.querySelectorAll("[data-energy]").forEach(btn => btn.onclick = () => {
    state.form.energy = Number(btn.dataset.energy);
    document.querySelectorAll("[data-energy]").forEach(el => el.classList.toggle("active", Number(el.dataset.energy) === state.form.energy));
  });

  document.querySelectorAll("[data-weather]").forEach(btn => btn.onclick = () => {
    state.form.weather = btn.dataset.weather;
    document.querySelectorAll("[data-weather]").forEach(el => el.classList.toggle("active", el.dataset.weather === state.form.weather));
  });

  document.querySelectorAll("[data-desired]").forEach(btn => btn.onclick = () => {
    state.form.desired = btn.dataset.desired;
    document.querySelectorAll("[data-desired]").forEach(el => el.classList.toggle("active", el.dataset.desired === state.form.desired));
  });

  document.querySelectorAll("[data-glass-shape]").forEach(btn => btn.onclick = () => {
    state.form.glassShape = btn.dataset.glassShape;
    document.querySelectorAll("[data-glass-shape]").forEach(el => el.classList.toggle("active", el.dataset.glassShape === state.form.glassShape));
  });

  document.querySelector("#nextStep")?.addEventListener("click", () => {
    if (state.mixStep === 3) state.form.note = document.querySelector("#eventNote")?.value || state.form.note;
    state.mixStep++; render();
  });
  document.querySelector("#generateDrink")?.addEventListener("click", beginMixing);
}

function updateMoodSelectionUI() {
  document.querySelectorAll("[data-mood]").forEach(el => {
    const active = state.form.emotions.includes(el.dataset.mood);
    el.classList.toggle("active", active);
    if (!active && state.form.emotions.length >= 3) el.setAttribute("disabled", "disabled");
    else el.removeAttribute("disabled");
  });
  const next = document.querySelector("#nextStep");
  if (next) next.disabled = !(state.form.emotions.length > 0 || state.form.customMood.trim());
}

function beginMixing() {
  state.view="mixing"; state.mixingIndex=0; render();
  const messages=["正在提取今天的情绪……","加入一点尚未说出口的话……","摇匀疲惫与期待……","正在调整余味……","你的饮品即将完成。"];
  const timer=setInterval(()=>{
    state.mixingIndex++;
    const el=document.querySelector("#mixingMessage");
    if(el && messages[state.mixingIndex]) el.textContent=messages[state.mixingIndex];
    if(state.mixingIndex>=messages.length-1){
      clearInterval(timer);
      setTimeout(()=>{state.currentDrink=generateDrink();state.view="result";render();},850);
    }
  },720);
}

function renderMixing() {
  const m=primaryMood();
  app.innerHTML=`
    <main class="app-shell no-nav mixing-screen">
      <section>
        <div class="mixing-wrap">
          <div class="mixing-halo"></div>
          ${drinkVisual({c1:m.c1,c2:m.c2,garnishColor:"#ffb45c", glassShape:state.form.glassShape})}
          <i class="ingredient i1" style="--color:${m.c1}"></i>
          <i class="ingredient i2" style="--color:${m.c2}"></i>
          <i class="ingredient i3" style="--color:#ffb45c"></i>
        </div>
        <h2>正在为你调制</h2>
        <p class="mixing-message" id="mixingMessage">正在提取今天的情绪……</p>
      </section>
    </main>`;
}

function hashSeed(text) {
  let h=2166136261;
  for(let i=0;i<text.length;i++){h^=text.charCodeAt(i);h=Math.imul(h,16777619);} return Math.abs(h);
}
function pick(arr, seed, offset=0) { return arr[(seed+offset)%arr.length]; }

function generateDrink() {
  const selected=state.form.emotions.map(moodById).filter(Boolean);
  if(!selected.length) selected.push(moodById("blank"));
  const labels=selected.map(x=>x.label);
  const seed=hashSeed(JSON.stringify(state.form)+new Date().toDateString());
  const nameSets = {
    tired:["再睡五分钟","低电量缓冲区","今天先这样","下班之后再解释","温柔罢工冰茶"],
    anxious:["未读消息特调","不想解释苏打","脑内会议暂停键","柚子味的过度思考","明天再担心"],
    calm:["月光慢饮","晚风经过这里","安静的薄荷冰","留白苏打","此刻无需回答"],
    romantic:["心动保质期","暧昧气泡层","靠近一点点","覆盆子秘密","消息正在输入"],
    chaotic:["情绪多线程","不规则星期二","脑内标签页过多","先别急着命名","混乱也有配方"],
    happy:["今天值得加冰","小小庆功宴","日落气泡计划","好运正在上浮","甜度刚刚好"],
    blank:["空白也算一种回答","暂未命名","情绪缓冲区","低浓度存在感","今天没有标题"],
    lonely:["一个人的晚风","静音模式冰茶","夜里留一盏灯","独处慢饮","没有回复也没关系"],
    hopeful:["迟到的日落","半杯勇气","下一页正在加载","明天口味待定","尚未发生的好事"],
    irritable:["温柔反击","今天不接受催促","姜味边界感","请勿继续弹窗","烦躁降噪器"],
    wronged:["没说出口的那句","雨水与软糖","先抱抱自己","委屈暂存处","眼泪不计入热量"],
    excited:["气泡超出杯沿","今晚不想早睡","高能量闪光特调","快乐正在冒泡","好运加速器"]
  };
  const name=pick(nameSets[selected[0].id]||nameSets.blank, seed);
  const subtitlePool=[
    `献给今天${labels.join("、")}，却仍然把一天过完的你。`,
    `这杯不解决问题，只负责陪你坐一会儿。`,
    `把${state.form.weather}留在杯口，把没说完的话沉到底部。`,
    `适合在${state.form.contexts[0]||"安静的角落"}之后，慢慢喝完。`
  ];
  const tastingPool=[
    `入口先是${selected[0].flavors[0]}的味道，随后浮起一点${selected[1]?.flavors[1]||"轻微的甜"}。今天并没有被强行变好，但你已经撑过了最难喝的第一口。`,
    `前调带着${state.form.weather}的气息，中段是${selected[0].flavors[1]}，余味停在“${state.form.desired}”。有些感受不必马上解释，先让它们在杯里慢慢沉淀。`,
    `这是一杯浓度为${state.form.intensity}%的今天：不够完美，也没有完全失控。冰块会融化，气泡会消失，而你可以暂时什么都不处理。`
  ];
  const allFlavors=[...new Set(selected.flatMap(m=>m.flavors))].slice(0,5);
  if(state.form.weather==="小雨"||state.form.weather==="暴雨") allFlavors.push("雨水");
  if(state.form.weather==="晚风") allFlavors.push("晚风");
  const weights=selected.map((m,i)=>({label:m.label, value:i===0?Math.max(40,65-selected.length*8):Math.round((100-Math.max(40,65-selected.length*8))/(selected.length-1||1))}));
  let total=weights.reduce((s,x)=>s+x.value,0); weights[0].value+=100-total;
  if(state.form.customMood.trim()) { weights[0].value=Math.max(20,weights[0].value-10); weights.push({label:state.form.customMood.trim().slice(0,10),value:10}); }
  const bubble=Math.max(12, Math.min(96, Math.round((state.form.energy*.65)+(selected.some(m=>["happy","excited","romantic"].includes(m.id))?25:0))));
  const spirit=Math.max(8, Math.min(99, Math.round(state.form.energy*.55+state.form.intensity*.35)));
  const aftertaste=state.form.desired==="保持现在"?"今晚":state.form.desired==="什么都不需要改变"?"不设期限":pick(["明天早上","睡一觉之后","下一阵晚风","周末之前"],seed,9);
  return {
    id:Date.now(),
    name,
    subtitle:pick(subtitlePool,seed,2),
    tastingNote:pick(tastingPool,seed,4),
    flavors:[...new Set(allFlavors)].slice(0,5),
    emotions:selected.map(m=>({id:m.id,label:m.label})),
    recipe:weights,
    metrics:{ intensity:state.form.intensity, spirit, bubble, aftertaste, setting:state.form.energy<=30?"戴上耳机，独自慢慢喝":state.form.desired==="被安慰"?"盖好被子，在暖光里喝":"在晚风经过的时候慢慢喝" },
    c1:selected[0].c1,
    c2:selected[1]?.c2||selected[0].c2,
    garnishColor: state.form.weather==="日落"?"#ff9c67":state.form.weather==="晚风"?"#78d9c4":"#ffb45c",
    glassShape: state.form.glassShape,
    createdAt:new Date().toISOString(),
    input:JSON.parse(JSON.stringify(state.form))
  };
}

function renderResult(drink, isDetail) {
  if(!drink) return "";
  const content=`
    <div class="result-screen screen">
      <header class="topbar">
        <button class="back-btn" id="${isDetail?"closeDetail":"resultHome"}">‹</button>
        <span class="eyebrow">YOUR SPECIAL</span>
        <button class="icon-btn" id="openShare">↗</button>
      </header>
      <section class="result-hero" style="--resultGlow:${drink.c1}44">${drinkVisual(drink)}</section>
      <section class="result-title">
        <span class="eyebrow">今日特调</span>
        <h1>${escapeHTML(drink.name)}</h1>
        <p class="result-subtitle">${escapeHTML(drink.subtitle)}</p>
        <div class="tags">${drink.flavors.map(x=>`<span class="tag">${escapeHTML(x)}</span>`).join("")}</div>
      </section>
      <article class="card recipe-card">
        <span class="eyebrow">情绪配方 · ${glassOptions.find(g=>g.id===drink.glassShape)?.label || "特调杯型"}</span>
        ${drink.recipe.map((x,i)=>`<div class="recipe-row"><div class="recipe-label"><span>${escapeHTML(x.label)}</span><span>${x.value}%</span></div><div class="recipe-bar"><div style="width:${x.value}%;filter:hue-rotate(${i*24}deg)"></div></div></div>`).join("")}
      </article>
      <article class="card note-card"><span class="eyebrow">调酒师品鉴</span><p>${escapeHTML(drink.tastingNote)}</p></article>
      <article class="card metrics-card"><span class="eyebrow">饮品属性</span><div class="metrics-grid">
        <div class="metric"><span class="small muted">情绪浓度</span><strong>${drink.metrics.intensity}%</strong></div>
        <div class="metric"><span class="small muted">精神浓度</span><strong>${drink.metrics.spirit}%</strong></div>
        <div class="metric"><span class="small muted">气泡指数</span><strong>${drink.metrics.bubble}%</strong></div>
        <div class="metric"><span class="small muted">回甘时间</span><strong>${escapeHTML(drink.metrics.aftertaste)}</strong></div>
      </div><div class="metric" style="margin-top:9px"><span class="small muted">建议饮用方式</span><strong>${escapeHTML(drink.metrics.setting)}</strong></div></article>
      <div class="result-actions">
        ${isDetail?``:`<button class="primary-btn" id="saveDrink">收藏这杯</button>`}
        <button class="secondary-btn" id="shareDrink">生成分享卡</button>
        ${isDetail?``:`<button class="text-link" id="remixDrink">重新调制</button>`}
      </div>
    </div>`;
  if(isDetail) return content;
  app.innerHTML=`<main class="app-shell no-nav">${content}</main>`;
  bindResultEvents(false);
}

function bindResultEvents(isDetail) {
  document.querySelector("#resultHome")?.addEventListener("click",()=>{state.view="home";state.activeTab="home";render();});
  document.querySelector("#closeDetail")?.addEventListener("click",()=>{state.detailDrink=null;document.querySelector(".detail-overlay")?.remove();});
  document.querySelector("#saveDrink")?.addEventListener("click",()=>{
    const saved=getSavedDrinks();
    if(!saved.some(d=>d.id===state.currentDrink.id)) {setSavedDrinks([state.currentDrink,...saved]);showToast("已放入你的情绪酒窖");}
    else showToast("这杯已经收藏过了");
  });
  document.querySelector("#remixDrink")?.addEventListener("click",()=>{resetForm();state.view="mix";render();});
  document.querySelector("#shareDrink")?.addEventListener("click",openShare);
  document.querySelector("#openShare")?.addEventListener("click",openShare);
}
function renderDetailOverlay() {
  const old=document.querySelector(".detail-overlay"); if(old) old.remove();
  const overlay=document.createElement("div"); overlay.className="detail-overlay";
  overlay.innerHTML=`<main class="app-shell no-nav">${renderResult(state.detailDrink,true)}</main>`;
  document.body.appendChild(overlay);
  bindResultEvents(true);
}

function openShare() {
  const drink=state.detailDrink||state.currentDrink;
  if(!drink) return;
  const modal=document.createElement("div"); modal.className="modal-backdrop"; modal.id="shareModal";
  modal.innerHTML=`<section class="bottom-sheet"><div class="sheet-handle"></div>
    <div class="section-title"><h3>生成分享卡</h3><button class="ghost-btn" id="closeShare">×</button></div>
    <div class="template-tabs">
      <button class="chip active" data-template="midnight">Midnight Bar</button>
      <button class="chip" data-template="minimal">Minimal Menu</button>
      <button class="chip" data-template="dreamy">Dreamy Poster</button>
    </div>
    <img id="sharePreview" class="share-preview" alt="分享卡预览" />
    <button class="primary-btn" id="downloadShare" style="margin-top:14px">保存为 PNG</button>
  </section>`;
  document.body.appendChild(modal);
  updateSharePreview(drink,"midnight");
  modal.onclick=e=>{if(e.target===modal)modal.remove();};
  document.querySelector("#closeShare").onclick=()=>modal.remove();
  document.querySelectorAll("[data-template]").forEach(btn=>btn.onclick=()=>{
    document.querySelectorAll("[data-template]").forEach(x=>x.classList.remove("active"));btn.classList.add("active");
    updateSharePreview(drink,btn.dataset.template);
  });
  document.querySelector("#downloadShare").onclick=()=>{
    const img=document.querySelector("#sharePreview");
    const a=document.createElement("a");a.href=img.src;a.download=`${drink.name}-情绪特调.png`;a.click();
    showToast("分享卡已生成");
  };
}
function roundRect(ctx,x,y,w,h,r) {
  const rr=Math.min(r,w/2,h/2);ctx.beginPath();ctx.moveTo(x+rr,y);ctx.arcTo(x+w,y,x+w,y+h,rr);ctx.arcTo(x+w,y+h,x,y+h,rr);ctx.arcTo(x,y+h,x,y,rr);ctx.arcTo(x,y,x+w,y,rr);ctx.closePath();
}
function wrapText(ctx,text,x,y,maxWidth,lineHeight,maxLines=4) {
  const chars=[...text];let line="",lines=[];
  chars.forEach(ch=>{const test=line+ch;if(ctx.measureText(test).width>maxWidth&&line){lines.push(line);line=ch;}else line=test;});
  if(line)lines.push(line);lines.slice(0,maxLines).forEach((l,i)=>ctx.fillText(l,x,y+i*lineHeight));
}
function updateSharePreview(drink,template) {
  const c=document.createElement("canvas");c.width=1080;c.height=1920;const ctx=c.getContext("2d");
  const palettes={ midnight:["#110c17","#2b1834","#fff8f2"], minimal:["#eee8df","#d8d0c7","#1c1720"], dreamy:["#2b1740","#8d4f79","#fff8f2"] };
  const [bg1,bg2,text]=palettes[template];
  const grad=ctx.createLinearGradient(0,0,1080,1920);grad.addColorStop(0,bg1);grad.addColorStop(1,bg2);ctx.fillStyle=grad;ctx.fillRect(0,0,1080,1920);
  const glow=ctx.createRadialGradient(540,620,40,540,620,520);glow.addColorStop(0,drink.c1+"99");glow.addColorStop(1,"transparent");ctx.fillStyle=glow;ctx.fillRect(0,0,1080,1300);
  ctx.fillStyle=text;ctx.globalAlpha=.72;ctx.font="500 30px sans-serif";ctx.fillText("MOOD MIXER · 今日特调",86,110);ctx.globalAlpha=1;
  ctx.save();ctx.translate(540,650);
  ctx.strokeStyle="rgba(255,255,255,.5)";ctx.lineWidth=8;
  roundRect(ctx,-190,-270,380,520,48);ctx.stroke();
  const liquid=ctx.createLinearGradient(0,-190,0,230);liquid.addColorStop(0,drink.c1);liquid.addColorStop(1,drink.c2);ctx.fillStyle=liquid;roundRect(ctx,-174,-180,348,414,40);ctx.fill();
  ctx.fillStyle="rgba(255,255,255,.18)";ctx.beginPath();ctx.ellipse(0,-178,174,25,0,0,Math.PI*2);ctx.fill();
  for(let i=0;i<15;i++){ctx.strokeStyle="rgba(255,255,255,.45)";ctx.lineWidth=3;ctx.beginPath();ctx.arc(-130+(i*71)%270,-120+(i*113)%310,7+(i%4)*2,0,Math.PI*2);ctx.stroke();}
  ctx.strokeStyle="rgba(255,255,255,.45)";ctx.lineWidth=8;ctx.beginPath();ctx.moveTo(0,252);ctx.lineTo(0,350);ctx.stroke();ctx.beginPath();ctx.ellipse(0,362,120,20,0,0,Math.PI*2);ctx.stroke();ctx.restore();
  ctx.fillStyle=text;ctx.font="700 76px serif";ctx.textAlign="center";wrapText(ctx,drink.name,540,1120,890,92,2);
  ctx.globalAlpha=.7;ctx.font="400 34px sans-serif";wrapText(ctx,drink.subtitle,540,1305,800,54,3);ctx.globalAlpha=1;
  ctx.textAlign="left";ctx.font="500 28px sans-serif";ctx.fillText("情绪配方",86,1510);
  let y=1575;drink.recipe.slice(0,4).forEach((r,i)=>{ctx.globalAlpha=.75;ctx.fillText(`${r.label}  ${r.value}%`,86,y+i*52);});
  ctx.globalAlpha=.55;ctx.font="400 25px sans-serif";ctx.fillText(new Date(drink.createdAt).toLocaleDateString("zh-CN"),86,1810);ctx.textAlign="right";ctx.fillText("把今天的情绪，调成一杯酒。",994,1810);
  document.querySelector("#sharePreview").src=c.toDataURL("image/png");
}

if ("serviceWorker" in navigator) window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js").catch(()=>{}));
render();
