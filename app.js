(function () {
  "use strict";

  var app = document.getElementById("app");
  var toastEl = document.getElementById("toast");
  var APP_VERSION = "8.1";

  var memoryStorage = {};

  function safeStorageGet(key) {
    try {
      var value = window.localStorage.getItem(key);
      return value == null ? (memoryStorage[key] || null) : value;
    } catch (error) {
      return memoryStorage[key] || null;
    }
  }

  function safeStorageSet(key, value) {
    memoryStorage[key] = value;
    try { window.localStorage.setItem(key, value); return true; }
    catch (error) { return true; }
  }

  function safeStorageRemove(key) {
    delete memoryStorage[key];
    try { window.localStorage.removeItem(key); return true; }
    catch (error) { return true; }
  }

  var STORAGE = {
    onboarded: "moodMixerOnboarded",
    drinks: "moodMixerDrinks",
    favorites: "moodMixerFavorites",
    preferences: "moodMixerPreferences",
    aiUsage: "moodMixerAIUsage"
  };

  var moods = [
    { id:"happy", label:"开心", emoji:"☺", wash:"rgba(243,161,94,.30)", c1:"#f2a065", c2:"#ed7f9e", flavors:["蜂蜜","橙花","气泡"] },
    { id:"calm", label:"平静", emoji:"≈", wash:"rgba(101,201,216,.28)", c1:"#67cbd6", c2:"#78c79a", flavors:["薄荷","月光","青柠"] },
    { id:"tired", label:"疲惫", emoji:"☾", wash:"rgba(137,94,78,.31)", c1:"#765347", c2:"#a26e5c", flavors:["冷萃","可可","微苦"] },
    { id:"anxious", label:"焦虑", emoji:"⌁", wash:"rgba(243,161,94,.28)", c1:"#efaa55", c2:"#dc705f", flavors:["柚皮","海盐","碎冰"] },
    { id:"wronged", label:"委屈", emoji:"◔", wash:"rgba(239,131,166,.27)", c1:"#e985aa", c2:"#8a7ac7", flavors:["浆果","雨水","奶泡"] },
    { id:"excited", label:"兴奋", emoji:"✦", wash:"rgba(157,130,214,.29)", c1:"#a28bda", c2:"#ed7da5", flavors:["葡萄","气泡","跳跳糖"] },
    { id:"lonely", label:"孤独", emoji:"○", wash:"rgba(95,119,164,.29)", c1:"#5875a3", c2:"#77679a", flavors:["蓝莓","晚风","冰块"] },
    { id:"irritable", label:"烦躁", emoji:"∿", wash:"rgba(220,93,82,.28)", c1:"#d85d58", c2:"#e79557", flavors:["姜","柠檬皮","辛香"] },
    { id:"blank", label:"空白", emoji:"□", wash:"rgba(220,226,231,.20)", c1:"#d6dce1", c2:"#8da5b8", flavors:["苏打","白桃","空气"] },
    { id:"hopeful", label:"期待", emoji:"↗", wash:"rgba(107,201,139,.27)", c1:"#73c99b", c2:"#efb75e", flavors:["青提","罗勒","晨光"] },
    { id:"romantic", label:"心动", emoji:"♡", wash:"rgba(239,131,166,.30)", c1:"#ed7da4", c2:"#c57fcd", flavors:["覆盆子","玫瑰","柔光"] },
    { id:"chaotic", label:"混乱", emoji:"✺", wash:"rgba(157,130,214,.30)", c1:"#816dd0", c2:"#df795d", flavors:["不规则碎冰","黑莓","胡椒"] }
  ];

  var contexts = ["学习或工作","人际关系","独处","恋爱","家庭","身体状态","天气","没有具体原因"];
  var weathers = ["晴天","阴天","小雨","暴雨","大雾","晚风","雷阵雨","日落"];
  var desiredStates = ["放松一点","勇敢一点","清醒一点","开心一点","被安慰","不再内耗","保持现在","什么都不需要改变"];
  var glassOptions = [
    { id:"hurricane", label:"飓风杯" },
    { id:"goblet", label:"圆肚杯" },
    { id:"highball", label:"高球杯" },
    { id:"martini", label:"马天尼杯" }
  ];
  var garnishOptions = [
    { id:"mint", label:"薄荷叶", icon:"❧", wash:"rgba(107,201,139,.34)" },
    { id:"citrus", label:"柑橘片", icon:"◉", wash:"rgba(243,161,94,.38)" },
    { id:"berry", label:"浆果串", icon:"●", wash:"rgba(239,131,166,.36)" },
    { id:"none", label:"不加装饰", icon:"—", wash:"rgba(220,226,231,.16)" }
  ];

  var tasteOptions = ["清爽", "酸感", "微甜", "微苦", "果香", "茶感", "咖啡感"];
  var AI_DAILY_LIMIT = 8;

  var sampleDrinks = [
    { id:"sample-1", category:"今日特调", name:"会议结束后的自由", subtitle:"献给关掉摄像头之后的第一口空气。", emotions:["疲惫","开心"], flavors:["柠檬","气泡","晚风"], c1:"#f0a45b", c2:"#876fd5", glassShape:"highball", garnish:"citrus" },
    { id:"sample-2", category:"打工人专区", name:"已读不回莫吉托", subtitle:"消息留在屏幕里，薄荷先替你降温。", emotions:["焦虑","烦躁"], flavors:["薄荷","青柠","微苦"], c1:"#7bd2ae", c2:"#d7c86a", glassShape:"highball", garnish:"mint" },
    { id:"sample-3", category:"学生特调", name:"DDL 前夜浓缩", subtitle:"黑咖啡般的清醒，以及尚未保存的勇气。", emotions:["疲惫","焦虑"], flavors:["冷萃","可可","海盐"], c1:"#4b302e", c2:"#9a6350", glassShape:"hurricane", garnish:"berry" },
    { id:"sample-4", category:"今日特调", name:"周五下班第一口空气", subtitle:"气泡很满，待办事项已经沉底。", emotions:["开心","期待"], flavors:["青提","气泡","橙花"], c1:"#79d2b8", c2:"#f6b85f", glassShape:"hurricane", garnish:"mint" },
    { id:"sample-5", category:"恋爱限定", name:"暧昧期气泡水", subtitle:"甜度不明，气泡很多，答案暂时保密。", emotions:["心动","期待"], flavors:["覆盆子","玫瑰","气泡"], c1:"#ee7fa1", c2:"#ad83df", glassShape:"martini", garnish:"berry" },
    { id:"sample-6", category:"社恐友好", name:"社交电量不足冰茶", subtitle:"适合静音饮用，不建议同时回复八条消息。", emotions:["疲惫","孤独"], flavors:["乌龙","冰块","晚风"], c1:"#6b5543", c2:"#6e739d", glassShape:"goblet", garnish:"mint" },
    { id:"sample-7", category:"失眠酒单", name:"凌晨两点的清醒", subtitle:"灯已经关了，脑内标签页还没有。", emotions:["焦虑","空白"], flavors:["蓝莓","冷萃","月光"], c1:"#5369a1", c2:"#9a79c5", glassShape:"goblet", garnish:"none" },
    { id:"sample-8", category:"周末微醺", name:"不设闹钟的早晨", subtitle:"没有催促，只有慢慢化开的橙花。", emotions:["平静","开心"], flavors:["橙花","蜂蜜","薄荷"], c1:"#f0b56e", c2:"#75c8b0", glassShape:"hurricane", garnish:"citrus" }
  ];

  var state = {
    view: safeStorageGet(STORAGE.onboarded) ? "main" : "onboarding",
    activeTab: "home",
    onboardingStep: 0,
    mixStep: 1,
    cellarFilter: "全部",
    cellarMode: "grid",
    discoverCategory: "今日特调",
    detailDrink: null,
    currentDrink: null,
    mixingIndex: 0,
    shareTemplate: "midnight",
    recipeMode: "alcohol",
    recipeServings: 1,
    recipeLevel: "beginner",
    installPrompt: null,
    aiStatus: "unknown",
    aiModel: "qwen3.7-plus",
    aiSource: "local",
    preferences: getPreferences(),
    form: defaultForm()
  };

  var glassCounter = 0;

  function defaultForm() {
    return {
      emotions: [],
      customMood: "",
      intensity: 58,
      contexts: [],
      note: "",
      energy: 50,
      weather: "晚风",
      desired: "放松一点",
      glassShape: "hurricane",
      garnish: "mint"
    };
  }

  function defaultPreferences() {
    return { tastes:["清爽"], alcohol:"both", avoid:"" };
  }

  function getPreferences() {
    try {
      var parsed = JSON.parse(safeStorageGet(STORAGE.preferences) || "null");
      if (!parsed || typeof parsed !== "object") return defaultPreferences();
      return {
        tastes:Array.isArray(parsed.tastes) ? parsed.tastes.filter(function (item) { return tasteOptions.indexOf(item) >= 0; }).slice(0,4) : ["清爽"],
        alcohol:["both","low","zero"].indexOf(parsed.alcohol) >= 0 ? parsed.alcohol : "both",
        avoid:String(parsed.avoid || "").slice(0,100)
      };
    } catch (error) {
      return defaultPreferences();
    }
  }

  function savePreferences() {
    safeStorageSet(STORAGE.preferences, JSON.stringify(state.preferences));
  }

  function todayKey() {
    var now = new Date();
    return now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2,"0") + "-" + String(now.getDate()).padStart(2,"0");
  }

  function getAIUsage() {
    try {
      var value = JSON.parse(safeStorageGet(STORAGE.aiUsage) || "null");
      if (!value || value.date !== todayKey()) return {date:todayKey(),count:0};
      return {date:value.date,count:Number(value.count) || 0};
    } catch (error) {
      return {date:todayKey(),count:0};
    }
  }

  function markAIUsage() {
    var usage = getAIUsage();
    usage.count += 1;
    safeStorageSet(STORAGE.aiUsage, JSON.stringify(usage));
    return usage;
  }

  function aiRemaining() {
    return Math.max(0, AI_DAILY_LIMIT - getAIUsage().count);
  }

  function aiCanRun() {
    return state.aiStatus !== "offline" && aiRemaining() > 0 && navigator.onLine !== false;
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function getSavedDrinks() {
    try {
      var value = JSON.parse(safeStorageGet(STORAGE.drinks) || "[]");
      return Array.isArray(value) ? value : [];
    } catch (error) {
      return [];
    }
  }

  function setSavedDrinks(list) {
    safeStorageSet(STORAGE.drinks, JSON.stringify(list));
  }

  function getFavorites() {
    try {
      var value = JSON.parse(safeStorageGet(STORAGE.favorites) || "[]");
      return Array.isArray(value) ? value : [];
    } catch (error) {
      return [];
    }
  }

  function setFavorites(list) {
    safeStorageSet(STORAGE.favorites, JSON.stringify(list));
  }

  function escapeHTML(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (char) {
      return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[char];
    });
  }

  function showToast(message) {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.classList.add("show");
    window.setTimeout(function () { toastEl.classList.remove("show"); }, 1900);
  }

  function moodById(id) {
    return moods.filter(function (mood) { return mood.id === id; })[0] || moods[8];
  }

  function moodByLabel(label) {
    return moods.filter(function (mood) { return mood.label === label; })[0] || moods[8];
  }

  function getGreeting() {
    var hour = new Date().getHours();
    if (hour < 11) return "早上好";
    if (hour < 18) return "下午好";
    return "晚上好";
  }

  function dateText(value) {
    try { return new Date(value).toLocaleDateString("zh-CN", {month:"numeric",day:"numeric"}); }
    catch (error) { return ""; }
  }

  function hashSeed(text) {
    var hash = 2166136261;
    for (var i = 0; i < text.length; i += 1) {
      hash ^= text.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return Math.abs(hash);
  }

  function pick(list, seed, offset) {
    var realOffset = offset || 0;
    return list[(seed + realOffset) % list.length];
  }

  function primaryMood() {
    return moodById(state.form.emotions[0] || "blank");
  }

  function nav(active) {
    var items = [
      ["home","⌂","调一杯"],
      ["cellar","▥","酒窖"],
      ["discover","✦","酒单"],
      ["profile","○","我的"]
    ];
    return '<nav class="bottom-nav" aria-label="主导航"><div class="nav-inner">' +
      items.map(function (item) {
        return '<button class="nav-btn ' + (active === item[0] ? "active" : "") +
          '" data-action="nav" data-tab="' + item[0] + '">' +
          '<span class="nav-icon">' + item[1] + '</span><span>' + item[2] + '</span></button>';
      }).join("") +
      '</div></nav>';
  }

  function garnishSVG(id, config, uid) {
    if (id === "none") return "";
    if (id === "mint") {
      return '<g class="garnish-art" filter="url(#' + uid + '-water)">' +
        '<path d="' + config.leaf1 + '" fill="#65bd74" stroke="rgba(37,87,50,.34)" stroke-width="1.4"/>' +
        '<path d="' + config.leaf2 + '" fill="#4fa867" stroke="rgba(37,87,50,.32)" stroke-width="1.4"/>' +
        '<path d="M216 134 C203 145 193 154 185 170" fill="none" stroke="#4f9861" stroke-width="3" stroke-linecap="round"/>' +
        '</g>';
    }
    if (id === "berry") {
      return '<g class="garnish-art" filter="url(#' + uid + '-water)">' +
        '<circle cx="' + (config.garnishCx - 7) + '" cy="' + (config.garnishCy + 12) + '" r="8" fill="#d84e79"/>' +
        '<circle cx="' + (config.garnishCx + 4) + '" cy="' + (config.garnishCy + 8) + '" r="8" fill="#b94877"/>' +
        '<circle cx="' + (config.garnishCx + 13) + '" cy="' + (config.garnishCy + 17) + '" r="7" fill="#e06e86"/>' +
        '<path d="M' + (config.garnishCx + 2) + ' ' + (config.garnishCy + 2) + ' C' + (config.garnishCx + 3) + ' ' + (config.garnishCy - 5) + ' ' + (config.garnishCx + 8) + ' ' + (config.garnishCy - 10) + ' ' + (config.garnishCx + 14) + ' ' + (config.garnishCy - 13) + '" fill="none" stroke="#5e9d61" stroke-width="2.4"/>' +
        '</g>';
    }
    return '<ellipse cx="' + config.garnishCx + '" cy="' + config.garnishCy + '" rx="21" ry="10" fill="none" stroke="#f0a34f" stroke-width="7" transform="rotate(20 ' + config.garnishCx + ' ' + config.garnishCy + ')" filter="url(#' + uid + '-water)"/>';
  }

  function doodleSVG(shape, uid, seed, displaySize) {
    if (displaySize === "mini") return "";
    var stroke = 'rgba(255,248,242,.62)';
    var accent = 'rgba(241,176,95,.65)';
    return '<g class="doodle-group" filter="url(#' + uid + '-water)">' +
      '<path d="M58 116 C46 106 45 88 58 83 C72 77 83 95 73 108" fill="none" stroke="' + stroke + '" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<path d="M246 128 C259 117 276 121 281 134" fill="none" stroke="' + stroke + '" stroke-width="2.5" stroke-linecap="round"/>' +
      '<path d="M259 148 C268 141 279 143 284 153" fill="none" stroke="' + accent + '" stroke-width="2.2" stroke-linecap="round"/>' +
      '<path d="M69 286 C80 282 92 284 102 292" fill="none" stroke="' + accent + '" stroke-width="2.2" stroke-linecap="round"/>' +
      '<path d="M243 285 q6 -14 12 0 q-12 6 -12 0z" fill="none" stroke="' + stroke + '" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<path d="M86 72 l5 10 l10 5 l-10 5 l-5 10 l-5 -10 l-10 -5 l10 -5 z" fill="none" stroke="' + stroke + '" stroke-width="2" stroke-linejoin="round"/>' +
      '<path d="M236 74 l4 8 l8 4 l-8 4 l-4 8 l-4 -8 l-8 -4 l8 -4 z" fill="none" stroke="' + accent + '" stroke-width="2" stroke-linejoin="round"/>' +
      '</g>';
  }

  function drinkVisual(drink, size) {
    var displaySize = size || "large";
    var shape = drink.glassShape || "hurricane";
    var uid = "paint-glass-" + (++glassCounter);
    var colorA = drink.c1 || "#ef8cab";
    var colorB = drink.c2 || "#65cbd7";
    var garnish = drink.garnish || "mint";

    var shapes = {
      hurricane: {
        bowl:"M112 70 C101 80 98 96 100 113 C102 134 113 151 114 170 C115 187 106 205 104 228 C100 273 121 307 160 323 C199 307 220 273 216 228 C214 205 205 187 206 170 C207 151 218 134 220 113 C222 96 219 80 208 70 C184 61 136 61 112 70 Z",
        liquid:"M116 111 C113 128 118 143 120 160 C122 178 114 196 113 227 C111 266 129 291 160 304 C191 291 209 266 207 227 C206 196 198 178 200 160 C202 143 207 128 204 111 C182 104 138 104 116 111 Z",
        stem:"M158 323 C158 342 158 361 158 381",
        base:"M109 394 C130 386 190 386 211 394 C193 404 127 404 109 394 Z",
        straw:[205,70,179,175],
        leaf1:"M209 119 C225 105 245 106 257 120 C242 139 224 142 209 119 Z",
        leaf2:"M191 136 C205 124 223 127 232 142 C217 154 201 153 191 136 Z",
        garnishCx:227,garnishCy:80
      },
      goblet: {
        bowl:"M100 77 C90 116 89 163 100 220 C110 270 132 304 160 317 C188 304 210 270 220 220 C231 163 230 116 220 77 C188 66 132 66 100 77 Z",
        liquid:"M107 111 C99 144 100 182 109 226 C118 267 136 290 160 299 C184 290 202 267 211 226 C220 182 221 144 213 111 C185 103 135 103 107 111 Z",
        stem:"M157 316 C158 340 158 362 157 385",
        base:"M103 395 C122 387 199 387 217 395 C199 406 121 406 103 395 Z",
        straw:[197,77,174,169],
        leaf1:"M204 116 C221 102 241 104 253 117 C239 137 220 140 204 116 Z",
        leaf2:"M186 132 C201 120 220 124 230 140 C214 153 197 151 186 132 Z",
        garnishCx:222,garnishCy:84
      },
      highball: {
        bowl:"M115 59 C110 119 108 189 114 270 C117 310 129 339 160 349 C191 339 203 310 206 270 C212 189 210 119 205 59 C181 53 139 53 115 59 Z",
        liquid:"M120 101 C116 150 116 206 121 269 C124 299 133 319 160 329 C187 319 196 299 199 269 C204 206 204 150 200 101 C178 96 142 96 120 101 Z",
        stem:"",
        base:"M116 357 C134 352 187 352 204 357 C190 365 130 365 116 357 Z",
        straw:[198,60,178,171],
        leaf1:"M205 120 C220 108 238 109 250 122 C236 139 220 142 205 120 Z",
        leaf2:"M189 135 C202 125 220 128 228 143 C214 154 199 152 189 135 Z",
        garnishCx:219,garnishCy:73
      },
      martini: {
        bowl:"M75 86 C102 132 128 171 160 202 C192 171 218 132 245 86 C196 75 124 75 75 86 Z",
        liquid:"M90 104 C112 137 134 165 160 188 C186 165 208 137 230 104 C191 97 129 97 90 104 Z",
        stem:"M158 202 C158 258 158 330 157 382",
        base:"M102 395 C124 386 198 386 218 395 C199 406 120 406 102 395 Z",
        straw:[213,77,178,154],
        leaf1:"M210 112 C225 99 243 100 254 113 C241 132 224 135 210 112 Z",
        leaf2:"M191 127 C204 117 221 120 230 135 C215 147 200 145 191 127 Z",
        garnishCx:225,garnishCy:80
      }
    };

    var g = shapes[shape] || shapes.hurricane;
    var seed = hashSeed(colorA + colorB + shape + garnish);
    var blotches = "";
    for (var i = 0; i < 17; i += 1) {
      var cx = 104 + ((seed + i * 47) % 112);
      var cy = 116 + ((seed + i * 67) % 168);
      var rx = 13 + ((seed + i * 19) % 26);
      var ry = 11 + ((seed + i * 23) % 31);
      var fill = i % 3 === 0 ? colorA : (i % 3 === 1 ? colorB : "#f4b35f");
      var opacity = (0.15 + ((i % 5) * 0.035)).toFixed(2);
      blotches += '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry +
        '" fill="' + fill + '" opacity="' + opacity + '" transform="rotate(' + ((i * 17) % 48 - 24) +
        ' ' + cx + ' ' + cy + ')"/>';
    }

    var speckles = "";
    for (var j = 0; j < 18; j += 1) {
      var sx = 110 + ((seed + j * 31) % 100);
      var sy = 112 + ((seed + j * 53) % 178);
      var sr = 1 + ((j + seed) % 3);
      speckles += '<circle cx="' + sx + '" cy="' + sy + '" r="' + sr + '" fill="rgba(255,255,255,.28)"/>';
    }

    var stemMarkup = g.stem ? '<path d="' + g.stem + '" fill="none" stroke="rgba(246,241,244,.78)" stroke-width="4.2" stroke-linecap="round"/>' : "";

    return '<div class="watercolor-glass size-' + displaySize + ' shape-' + shape + '">' +
      '<svg viewBox="0 0 320 430" aria-hidden="true">' +
      '<defs>' +
      '<linearGradient id="' + uid + '-liquid" x1="0" x2="0" y1="0" y2="1">' +
      '<stop offset="0%" stop-color="' + colorA + '" stop-opacity=".94"/>' +
      '<stop offset="58%" stop-color="' + colorB + '" stop-opacity=".90"/>' +
      '<stop offset="100%" stop-color="#f2b064" stop-opacity=".72"/>' +
      '</linearGradient>' +
      '<radialGradient id="' + uid + '-halo" cx="50%" cy="45%" r="55%">' +
      '<stop offset="0%" stop-color="' + colorA + '" stop-opacity=".22"/>' +
      '<stop offset="56%" stop-color="' + colorB + '" stop-opacity=".13"/>' +
      '<stop offset="100%" stop-color="#fff" stop-opacity="0"/>' +
      '</radialGradient>' +
      '<filter id="' + uid + '-water" x="-25%" y="-25%" width="150%" height="150%">' +
      '<feTurbulence type="fractalNoise" baseFrequency=".018" numOctaves="3" seed="' + ((seed % 13) + 2) + '" result="noise"/>' +
      '<feDisplacementMap in="SourceGraphic" in2="noise" scale="3.7" xChannelSelector="R" yChannelSelector="G"/>' +
      '</filter>' +
      '<filter id="' + uid + '-blur" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="7"/></filter>' +
      '<clipPath id="' + uid + '-clip"><path d="' + g.liquid + '"/></clipPath>' +
      '<pattern id="' + uid + '-paper" width="44" height="44" patternUnits="userSpaceOnUse">' +
      '<filter id="' + uid + '-grain"><feTurbulence type="fractalNoise" baseFrequency=".55" numOctaves="2"/></filter>' +
      '<rect width="44" height="44" filter="url(#' + uid + '-grain)" opacity=".09"/>' +
      '</pattern>' +
      '</defs>' +
      '<ellipse cx="160" cy="218" rx="104" ry="144" fill="url(#' + uid + '-halo)" filter="url(#' + uid + '-blur)"/>' +
      '<g class="paint-layer" filter="url(#' + uid + '-water)">' +
      '<path d="' + g.bowl + '" fill="rgba(255,255,255,.055)" stroke="rgba(249,244,247,.56)" stroke-width="3.1" stroke-linejoin="round"/>' +
      '<path d="' + g.bowl + '" fill="none" stroke="' + colorA + '" stroke-opacity=".14" stroke-width="8" stroke-linejoin="round" filter="url(#' + uid + '-blur)"/>' +
      '<path d="' + g.liquid + '" fill="' + colorB + '" opacity=".18" filter="url(#' + uid + '-blur)"/>' +
      '<path d="' + g.liquid + '" fill="url(#' + uid + '-liquid)" opacity=".82"/>' +
      '<g clip-path="url(#' + uid + '-clip)">' + blotches +
      '<rect x="85" y="90" width="150" height="240" fill="url(#' + uid + '-paper)" opacity=".34"/>' +
      speckles +
      '<path d="M108 120 C132 104 188 106 214 118" fill="none" stroke="rgba(255,255,255,.31)" stroke-width="7" stroke-linecap="round"/>' +
      '<ellipse cx="135" cy="164" rx="17" ry="22" fill="rgba(255,255,255,.17)" stroke="rgba(255,255,255,.28)" stroke-width="2" transform="rotate(-17 135 164)"/>' +
      '<ellipse cx="181" cy="194" rx="17" ry="22" fill="rgba(255,255,255,.14)" stroke="rgba(255,255,255,.24)" stroke-width="2" transform="rotate(11 181 194)"/>' +
      '<ellipse cx="153" cy="232" rx="19" ry="24" fill="rgba(255,255,255,.14)" stroke="rgba(255,255,255,.24)" stroke-width="2" transform="rotate(-38 153 232)"/>' +
      '</g>' +
      '<path d="M116 90 C138 82 182 82 204 90" fill="none" stroke="rgba(255,255,255,.42)" stroke-width="2.7" stroke-linecap="round"/>' +
      stemMarkup +
      '<path d="' + g.base + '" fill="rgba(255,255,255,.055)" stroke="rgba(246,241,244,.68)" stroke-width="3"/>' +
      '</g>' +
      '<path d="M' + g.straw[0] + ' ' + g.straw[1] + ' L' + g.straw[2] + ' ' + g.straw[3] + '" stroke="url(#' + uid + '-liquid)" stroke-width="8" stroke-linecap="round"/>' +
      '<path d="M' + (g.straw[0] - 24) + ' ' + (g.straw[1] + 5) + ' L' + (g.straw[0] + 3) + ' ' + (g.straw[1] + 2) + '" stroke="#75d2df" stroke-width="7" stroke-linecap="round"/>' +
      garnishSVG(garnish, g, uid) +
      doodleSVG(shape, uid, seed, displaySize) +
      '</svg></div>';
  }

  function tinyDrink(drink) {
    return '<div class="preview-glass">' + drinkVisual(drink, "mini") + '</div>';
  }

  function onboardingView() {
    var pages = [
      {
        title:"把今天的情绪，调成一杯专属特调。",
        text:"无需解释得很完整。选择一些感受，让颜色、冰块和余味替你说话。",
        visual:drinkVisual({c1:"#ef8aa7",c2:"#65ccd7",glassShape:"hurricane",garnish:"mint"},"hero")
      },
      {
        title:"每一种情绪，都是一种风味。",
        text:"疲惫是冷萃，心动是覆盆子气泡，复杂也能成为好看的配方。",
        visual:'<div class="flavor-list">' +
          '<div class="flavor-item" style="--wash:rgba(124,82,68,.32)">疲惫<br><b>冷萃与可可</b></div>' +
          '<div class="flavor-item" style="--wash:rgba(239,131,166,.30)">心动<br><b>覆盆子气泡</b></div>' +
          '<div class="flavor-item" style="--wash:rgba(243,161,94,.29)">焦虑<br><b>微苦柚皮</b></div>' +
          '<div class="flavor-item" style="--wash:rgba(101,201,216,.27)">平静<br><b>薄荷与月光</b></div>' +
          '</div>'
      },
      {
        title:"收藏每一个版本的自己。",
        text:"每一杯都会进入情绪酒窖，慢慢长成你的个人情绪酒单。",
        visual:'<article class="card month-card" style="width:92%;text-align:left">' +
          '<span class="eyebrow">THIS MONTH</span><h2 style="margin-top:9px">慢慢融化的薄荷冰</h2>' +
          '<p class="muted">偶尔焦虑，偶尔想逃跑，但仍然保留着很轻的甜。</p></article>'
      }
    ];
    var page = pages[state.onboardingStep];
    return '<main class="app-shell no-nav onboarding">' +
      '<div class="onboarding-visual">' + page.visual + '</div>' +
      '<section class="onboarding-copy">' +
      '<div class="dots">' + pages.map(function (_, index) {
        return '<span class="dot ' + (index === state.onboardingStep ? "active" : "") + '"></span>';
      }).join("") + '</div>' +
      '<h1>' + page.title + '</h1><p class="muted" style="line-height:1.8">' + page.text + '</p>' +
      '<div class="btn-row" style="margin-top:24px">' +
      '<button class="primary-btn" data-action="onboarding-next">' + (state.onboardingStep === 2 ? "开始调制" : "继续") + '</button>' +
      (state.onboardingStep < 2 ? '<button class="text-link" data-action="onboarding-skip">跳过</button>' : '') +
      '</div></section></main>';
  }

  function homeView() {
    var saved = getSavedDrinks();
    var recent = saved[0];
    return '<header class="topbar"><span class="eyebrow">' + getGreeting() + '</span>' +
      '<button class="icon-btn avatar" data-action="nav" data-tab="profile">M</button></header>' +
      '<section class="hero"><div class="hero-heading"><h1>今天想调一杯什么？</h1></div>' +
      '<div class="hero-drink">' + drinkVisual({c1:"#ef8aa7",c2:"#65ccd7",glassShape:"hurricane",garnish:"mint"},"hero") + '</div>' +
      '<button class="primary-btn" data-action="start-mix">开始调制</button></section>' +
      '<section class="section"><div class="section-title"><h3>此刻更像</h3><span class="small muted">轻点即可开始</span></div>' +
      '<div class="quick-chips">' +
      ["tired","happy","anxious","calm","blank","chaotic"].map(function (id) {
        var mood = moodById(id);
        return '<button class="chip quick-mood" data-action="quick-mood" data-mood="' + id + '">' + mood.label + '</button>';
      }).join("") + '</div></section>' +
      '<section class="section"><div class="section-title"><h3>最近一杯</h3>' +
      (recent ? '<button class="text-link" data-action="nav" data-tab="cellar">查看酒窖</button>' : '') + '</div>' +
      (recent ?
        '<article class="card recent-card" data-action="open-drink" data-id="' + recent.id + '">' +
        tinyDrink(recent) + '<div><h3>' + escapeHTML(recent.name) + '</h3><p class="muted small">' +
        escapeHTML(recent.tastingNote.slice(0,42)) + '…</p></div><span>›</span></article>' :
        '<article class="card prompt-card"><p class="quote">第一杯还没有出现。今天的情绪，好像有一点难命名。</p>' +
        '<div class="prompt-action"><button class="mini-btn" data-action="start-mix">调制第一杯</button></div></article>') +
      '</section>' +
      '<section class="section"><div class="section-title"><h3>今日小问</h3></div>' +
      '<article class="card prompt-card"><span class="eyebrow">DAILY PROMPT</span>' +
      '<p class="quote" style="margin-top:10px">今天有什么瞬间，让你的情绪突然发生了变化？</p>' +
      '<div class="prompt-action"><button class="mini-btn" data-action="daily-prompt">记录这一刻</button></div></article></section>';
  }

  function filterCellar(drinks) {
    var filter = state.cellarFilter;
    if (filter === "全部") return drinks;
    if (filter === "本周") {
      var now = Date.now();
      return drinks.filter(function (drink) {
        return now - new Date(drink.createdAt).getTime() <= 7 * 24 * 60 * 60 * 1000;
      });
    }
    if (filter === "复杂") {
      return drinks.filter(function (drink) { return drink.emotions && drink.emotions.length >= 2; });
    }
    return drinks.filter(function (drink) {
      return (drink.emotions || []).some(function (emotion) { return emotion.label === filter; });
    });
  }

  function drinkCard(drink) {
    return '<article class="card drink-card" data-action="open-drink" data-id="' + drink.id + '">' +
      '<div class="drink-preview">' + tinyDrink(drink) + '</div>' +
      '<h3>' + escapeHTML(drink.name) + '</h3>' +
      '<p>' + dateText(drink.createdAt) + ' · ' + escapeHTML((drink.emotions || []).map(function (e) { return e.label; }).join(" / ")) + '</p>' +
      '</article>';
  }

  function timelineCard(drink) {
    return '<article class="card timeline-card" data-action="open-drink" data-id="' + drink.id + '">' +
      '<div class="drink-preview">' + tinyDrink(drink) + '</div>' +
      '<div><span class="eyebrow">' + dateText(drink.createdAt) + '</span><h3>' + escapeHTML(drink.name) + '</h3>' +
      '<p class="small muted">' + escapeHTML((drink.flavors || []).slice(0,3).join(" · ")) + '</p></div><span>›</span></article>';
  }

  function cellarView() {
    var filters = ["全部","本周","开心","疲惫","焦虑","平静","复杂"];
    var drinks = filterCellar(getSavedDrinks());
    return '<header class="topbar"><div><span class="eyebrow">MOOD CELLAR</span><h2 style="margin:4px 0 0">我的情绪酒窖</h2></div></header>' +
      '<div class="quick-chips filter-row">' + filters.map(function (filter) {
        return '<button class="chip ' + (state.cellarFilter === filter ? "active" : "") +
          '" data-action="cellar-filter" data-filter="' + filter + '">' + filter + '</button>';
      }).join("") + '</div>' +
      '<div class="view-toggle"><button class="mini-btn ' + (state.cellarMode === "grid" ? "active" : "") +
      '" data-action="cellar-mode" data-mode="grid">网格</button>' +
      '<button class="mini-btn ' + (state.cellarMode === "timeline" ? "active" : "") +
      '" data-action="cellar-mode" data-mode="timeline">时间线</button></div>' +
      (drinks.length ?
        (state.cellarMode === "grid" ? '<div class="list-grid">' + drinks.map(drinkCard).join("") + '</div>' :
          '<div class="timeline-list">' + drinks.map(timelineCard).join("") + '</div>') :
        '<div class="empty"><div class="empty-icon">◌</div><h3>这里还没有对应的饮品</h3>' +
        '<p class="muted">换一个筛选，或者调制一杯新的。</p>' +
        '<button class="primary-btn" style="margin-top:12px" data-action="start-mix">调制一杯</button></div>');
  }

  function sampleAsDrink(sample) {
    var emotionObjects = sample.emotions.map(function (label) {
      var mood = moodByLabel(label);
      return {id:mood.id,label:mood.label};
    });
    return {
      id:"fav-" + sample.id,
      name:sample.name,
      subtitle:sample.subtitle,
      tastingNote:"这是一杯来自公共酒单的情绪配方。你可以把它作为起点，再加入属于自己的情绪。",
      flavors:sample.flavors,
      emotions:emotionObjects,
      recipe:emotionObjects.map(function (emotion, index) {
        return {label:emotion.label,value:index === 0 ? 58 : 42};
      }),
      metrics:{intensity:65,spirit:58,bubble:62,aftertaste:"今晚",setting:"在安静的角落慢慢喝"},
      c1:sample.c1,
      c2:sample.c2,
      garnishColor:"#f0a34f",
      glassShape:sample.glassShape,
      garnish:sample.garnish,
      realRecipe:createRealRecipe(emotionObjects, {glassShape:sample.glassShape,garnish:sample.garnish,desired:"保持现在",weather:"晚风"}, hashSeed(sample.name), sample.flavors, sample.name),
      createdAt:new Date().toISOString(),
      input:clone(defaultForm()),
      sourceSampleId:sample.id,
      isPublicSample:true
    };
  }

  function discoverView() {
    var categories = ["今日特调","打工人专区","失眠酒单","恋爱限定","学生特调","社恐友好","周末微醺"];
    var favorites = getFavorites();
    var drinks = sampleDrinks.filter(function (drink) {
      return drink.category === state.discoverCategory;
    });
    return '<header class="topbar"><div><span class="eyebrow">DISCOVER</span><h2 style="margin:4px 0 0">情绪酒单</h2></div></header>' +
      '<div class="quick-chips filter-row">' + categories.map(function (category) {
        return '<button class="chip ' + (state.discoverCategory === category ? "active" : "") +
          '" data-action="discover-filter" data-category="' + category + '">' + category + '</button>';
      }).join("") + '</div>' +
      drinks.map(function (drink) {
        var liked = favorites.indexOf(drink.id) >= 0;
        return '<article class="card discover-card">' +
          '<div class="drink-preview" data-action="open-sample" data-id="' + drink.id + '">' + tinyDrink(drink) + '</div>' +
          '<div><h3 data-action="open-sample" data-id="' + drink.id + '">' + escapeHTML(drink.name) + '</h3>' +
          '<p>' + escapeHTML(drink.subtitle) + '</p><div class="card-actions">' +
          '<button class="mini-btn" data-action="use-sample" data-id="' + drink.id + '">用这个配方</button>' +
          '<button class="mini-btn ' + (liked ? "active" : "") + '" data-action="favorite-sample" data-id="' + drink.id + '">' +
          (liked ? "已收藏" : "收藏酒单") + '</button></div></div></article>';
      }).join("");
  }

  function profileView() {
    var saved = getSavedDrinks();
    var emotionCounts = {};
    saved.forEach(function (drink) {
      (drink.emotions || []).forEach(function (emotion) {
        emotionCounts[emotion.label] = (emotionCounts[emotion.label] || 0) + 1;
      });
    });
    var topEmotion = "尚未出现";
    var sorted = Object.keys(emotionCounts).sort(function (a,b) { return emotionCounts[b] - emotionCounts[a]; });
    if (sorted.length) topEmotion = sorted[0];
    var averageEnergy = saved.length ? Math.round(saved.reduce(function (sum, drink) {
      return sum + ((drink.input && drink.input.energy) || 50);
    }, 0) / saved.length) : 0;

    return '<header class="topbar"><span class="eyebrow">PROFILE · V' + APP_VERSION + '</span></header>' +
      '<section class="profile-head"><div class="profile-avatar">M</div><h2 style="margin-bottom:4px">今晚也在营业</h2>' +
      '<p class="muted small">私人情绪调酒师</p></section>' +
      '<div class="stats"><div class="card stat"><strong>' + saved.length + '</strong><span class="small muted">已调饮品</span></div>' +
      '<div class="card stat"><strong>' + topEmotion + '</strong><span class="small muted">常见情绪</span></div>' +
      '<div class="card stat"><strong>' + averageEnergy + '%</strong><span class="small muted">平均电量</span></div></div>' +
      '<section class="section"><article class="card month-card"><span class="eyebrow">你的本月情绪酒单</span>' +
      '<h2 style="margin-top:9px">慢慢融化的薄荷冰</h2><p class="muted">' +
      (saved.length ? "这个月的你偶尔疲惫，偶尔想逃跑，但每一次记录都留下了很轻的回甘。" :
        "还没有足够的配方。调制几杯之后，这里会长出属于你的月度风味。") +
      '</p></article></section>' +
      aiPreferenceSection() +
      '<section class="section">' +
      settingRow("安装到桌面","把网页作为手机 App 使用","install-app", state.installPrompt ? "安装" : "方法") +
      settingRow("导出情绪酒窖","保存为 JSON 文件，方便备份","export-data","导出") +
      settingRow("重新查看引导","再次浏览产品介绍","reset-onboarding","重看") +
      settingRow("清空本地数据","删除手机上的饮品与收藏","clear-data","清空") +
      '</section>';
  }

  function aiStatusLabel() {
    if (state.aiStatus === "online") return "已连接 · " + state.aiModel;
    if (state.aiStatus === "offline") return "尚未配置 · 使用本地配方";
    if (state.aiStatus === "error") return "连接异常 · 自动回退本地";
    return "正在检测 AI 服务…";
  }

  function alcoholPreferenceLabel(value) {
    return {both:"都可以",low:"低酒精优先",zero:"只生成无酒精"}[value] || "都可以";
  }

  function aiPreferenceSection() {
    return '<section class="section"><article class="card ai-profile-card">' +
      '<div class="section-title"><div><span class="eyebrow">AI BARTENDER</span><h3>千问调酒师</h3></div><span class="ai-status-dot status-' + state.aiStatus + '"></span></div>' +
      '<p class="muted small">' + escapeHTML(aiStatusLabel()) + ' · 今日剩余 ' + aiRemaining() + ' 次 AI 调制</p>' +
      '<div class="preference-block"><span class="eyebrow">偏好风味 · 最多四项</span><div class="quick-chips preference-chips">' +
      tasteOptions.map(function (taste) { return '<button class="chip ' + (state.preferences.tastes.indexOf(taste) >= 0 ? 'active' : '') + '" data-action="toggle-taste" data-value="' + taste + '">' + taste + '</button>'; }).join('') +
      '</div></div>' +
      '<div class="preference-block"><span class="eyebrow">酒精偏好</span><div class="segmented-control preference-segments">' +
      ['both','low','zero'].map(function (value) { return '<button class="segment ' + (state.preferences.alcohol === value ? 'active' : '') + '" data-action="set-alcohol-pref" data-value="' + value + '">' + alcoholPreferenceLabel(value) + '</button>'; }).join('') +
      '</div></div>' +
      '<div class="card input-card preference-input"><input id="avoidIngredients" value="' + escapeHTML(state.preferences.avoid) + '" placeholder="不喜欢或需要避开的材料，例如：咖啡因、乳制品" /></div>' +
      '<p class="small muted">偏好只用于生成配方，不会上传到其他页面公开展示。</p>' +
      '</article></section>';
  }

  function checkAIStatus() {
    if (state.aiStatus === "checking") return;
    state.aiStatus = "checking";
    fetch("./api/generate-drink", {headers:{"Accept":"application/json"}})
      .then(function (response) { return response.json(); })
      .then(function (payload) {
        state.aiStatus = payload && payload.configured ? "online" : "offline";
        state.aiModel = payload && payload.model ? payload.model : "qwen3.7-plus";
      })
      .catch(function () { state.aiStatus = "error"; })
      .finally(function () {
        if (state.view === "main" && state.activeTab === "profile") renderMain();
      });
  }

  function settingRow(title, description, action, buttonText) {
    return '<div class="card setting-row"><div class="setting-copy"><strong>' + title +
      '</strong><span>' + description + '</span></div><button class="mini-btn" data-action="' +
      action + '">' + buttonText + '</button></div>';
  }

  function renderMain() {
    var content = "";
    if (state.activeTab === "home") content = homeView();
    if (state.activeTab === "cellar") content = cellarView();
    if (state.activeTab === "discover") content = discoverView();
    if (state.activeTab === "profile") content = profileView();
    app.innerHTML = '<main class="app-shell"><div class="screen">' + content + '</div></main>' + nav(state.activeTab);
    if (state.detailDrink) renderDetailOverlay();
    if (state.activeTab === "profile" && state.aiStatus === "unknown") window.setTimeout(checkAIStatus, 0);
  }

  function renderMix() {
    app.innerHTML = '<main class="app-shell no-nav"><header class="topbar">' +
      '<button class="back-btn" data-action="mix-back">‹</button><span class="eyebrow">MOOD MIXER</span><span style="width:44px"></span></header>' +
      '<div class="progress-wrap"><div class="progress-meta"><span>调制中</span><span>' + state.mixStep + ' / 5</span></div>' +
      '<div class="progress"><div style="width:' + (state.mixStep * 20) + '%"></div></div></div>' +
      '<section class="screen">' + mixStepContent() + '</section></main>';
  }

  function mixStepContent() {
    if (state.mixStep === 1) {
      return '<div class="question-copy"><h2>此刻的你，更接近哪种状态？</h2>' +
        '<p class="muted">最多选择三种。复杂也可以是一种好看的配方。</p></div>' +
        '<div class="mood-grid">' + moods.map(function (mood) {
          var active = state.form.emotions.indexOf(mood.id) >= 0;
          var disabled = !active && state.form.emotions.length >= 3;
          return '<button class="mood-card ' + (active ? "active" : "") +
            '" data-action="select-mood" data-mood="' + mood.id + '" style="--mood-bg:' + mood.wash + '"' +
            (disabled ? " disabled" : "") + '><span class="emoji">' + mood.emoji + '</span><span>' + mood.label + '</span></button>';
        }).join("") + '</div>' +
        '<div class="card input-card"><input id="customMood" value="' + escapeHTML(state.form.customMood) +
        '" placeholder="自己描述：例如，有一点说不清楚" /></div>' +
        stepFooter(state.form.emotions.length > 0 || state.form.customMood.trim());
    }

    if (state.mixStep === 2) {
      return '<div class="question-copy"><h2>这种感觉有多浓？</h2><p class="muted">不需要准确，只要靠近你的感觉。</p></div>' +
        '<div class="liquid-meter"><div class="meter-glass"><div class="meter-liquid" id="meterLiquid" style="height:' +
        Math.max(8, state.form.intensity * .92) + '%"></div></div></div>' +
        '<div class="range-wrap"><div class="range-value"><span id="rangeNumber">' + state.form.intensity +
        '</span><small>%</small></div><input id="intensityRange" type="range" min="0" max="100" value="' +
        state.form.intensity + '"/><div class="range-labels"><span>淡淡的</span><span>刚刚好</span><span>很强烈</span><span>快溢出来</span></div></div>' +
        stepFooter(true);
    }

    if (state.mixStep === 3) {
      return '<div class="question-copy"><h2>今天发生了什么？</h2><p class="muted">可选，也可以只留下一两个词。</p></div>' +
        '<div class="selection-grid">' + contexts.map(function (context) {
          return '<button class="option-card ' + (state.form.contexts.indexOf(context) >= 0 ? "active" : "") +
            '" data-action="select-context" data-value="' + context + '">' + context + '</button>';
        }).join("") + '</div>' +
        '<div class="card input-card"><textarea id="eventNote" placeholder="例如：方案又被打回来了，但下班时看到了很好看的晚霞。">' +
        escapeHTML(state.form.note) + '</textarea></div>' + stepFooter(true);
    }

    if (state.mixStep === 4) {
      return '<div class="question-copy"><h2>现在还有多少电量？</h2><p class="muted">以及，今天更像什么天气？</p></div>' +
        '<h3>当前电量</h3><div class="energy-grid">' +
        [10,30,50,70,100].map(function (value) {
          return '<button class="energy-btn ' + (state.form.energy === value ? "active" : "") +
            '" data-action="select-energy" data-value="' + value + '">' + value + '%</button>';
        }).join("") + '</div><h3>今日天气</h3><div class="selection-grid">' +
        weathers.map(function (weather) {
          return '<button class="option-card ' + (state.form.weather === weather ? "active" : "") +
            '" data-action="select-weather" data-value="' + weather + '">' + weather + '</button>';
        }).join("") + '</div>' + stepFooter(true);
    }

    return '<div class="question-copy"><h2>最后，为今天选择杯型和装饰。</h2>' +
      '<p class="muted">杯型会保留在最终饮品和分享卡中。</p></div>' +
      '<h3>选择杯型</h3><div class="glass-option-grid">' +
      glassOptions.map(function (option) {
        return '<button class="option-card glass-option ' + (state.form.glassShape === option.id ? "active" : "") +
          '" data-action="select-glass" data-value="' + option.id + '">' +
          drinkVisual({c1:"#ef8aa7",c2:"#65ccd7",glassShape:option.id,garnish:"none"},"option") +
          '<span>' + option.label + '</span></button>';
      }).join("") + '</div><h3 style="margin-top:22px">选择装饰</h3><div class="garnish-option-grid">' +
      garnishOptions.map(function (option) {
        return '<button class="option-card garnish-option ' + (state.form.garnish === option.id ? "active" : "") +
          '" data-action="select-garnish" data-value="' + option.id + '">' +
          '<span class="garnish-swatch" style="--swatch:' + option.wash + '">' + option.icon + '</span><span>' + option.label + '</span></button>';
      }).join("") + '</div><h3 style="margin-top:22px">希望留下的余味</h3><div class="selection-grid">' +
      desiredStates.map(function (desired) {
        return '<button class="option-card ' + (state.form.desired === desired ? "active" : "") +
          '" data-action="select-desired" data-value="' + desired + '">' + desired + '</button>';
      }).join("") + '</div><div class="step-footer"><button class="primary-btn" data-action="generate-drink">开始调制</button></div>';
  }

  function stepFooter(enabled) {
    return '<div class="step-footer"><button class="primary-btn" data-action="next-step"' +
      (enabled ? "" : " disabled") + '>继续</button></div>';
  }

  function renderMixing() {
    var mood = primaryMood();
    app.innerHTML = '<main class="app-shell no-nav mixing-screen"><section>' +
      '<div class="mixing-wrap"><div class="mixing-halo"></div>' +
      drinkVisual({c1:mood.c1,c2:mood.c2,glassShape:state.form.glassShape,garnish:state.form.garnish},"large") +
      '<i class="paint-drop d1" style="--drop:' + mood.c1 + '"></i>' +
      '<i class="paint-drop d2" style="--drop:' + mood.c2 + '"></i>' +
      '<i class="paint-drop d3" style="--drop:#f2b064"></i></div>' +
      '<h2>AI 调酒师正在理解今天</h2><p class="mixing-message" id="mixingMessage">正在提取今天的颜色……</p><p class="ai-mixing-hint">连接异常时会自动使用本地配方，不会中断调制。</p>' +
      '</section></main>';
  }

  function glassLabelById(id) {
    return (glassOptions.filter(function (option) { return option.id === id; })[0] || {label:"特调杯型"}).label;
  }

  function resolveDrinkEmotions(drink) {
    return (drink.emotions || []).map(function (emotion) {
      if (!emotion) return null;
      if (typeof emotion === "string") return moodByLabel(emotion) || moodById(emotion) || null;
      return moodById(emotion.id) || moodByLabel(emotion.label) || null;
    }).filter(function (emotion) { return !!emotion; });
  }

  function recipeProfileForMood(moodId) {
    var profiles = {
      happy:{style:"Citrus Spritz", strength:"低酒精", technique:"加冰直调", ice:"块冰 8 分满", garnish:"橙片 + 薄荷", ingredients:["金酒 35ml","鲜橙汁 35ml","蜂蜜糖浆 10ml","柠檬汁 12ml","苏打水 70ml"], steps:["在杯中加入八分满块冰。","依次倒入金酒、鲜橙汁、蜂蜜糖浆和柠檬汁。","轻轻搅拌 6–8 下后补入苏打水，再轻提一次。","以橙片和薄荷装饰即可。"], pairing:"明亮轻盈，适合下班或周末第一杯。", mocktail:"无酒精版：将金酒换成冷泡伯爵茶 45ml，再补 20ml 苏打水。"},
      hopeful:{style:"Citrus Spritz", strength:"低酒精", technique:"加冰直调", ice:"块冰 8 分满", garnish:"青提 + 薄荷", ingredients:["金酒 35ml","青提汁 30ml","蜂蜜糖浆 10ml","青柠汁 12ml","苏打水 70ml"], steps:["在杯中加入八分满块冰。","依次倒入金酒、青提汁、蜂蜜糖浆和青柠汁。","补入苏打水后轻轻搅拌，让香气保持上扬。","用青提或薄荷做装饰。"], pairing:"清爽偏果香，适合想要一点点勇气的时候。", mocktail:"无酒精版：将金酒换成白葡萄汁 40ml，整体更像轻盈汽泡饮。"},
      calm:{style:"Tea Cooler", strength:"低酒精", technique:"加冰直调", ice:"大块冰 6–8 块", garnish:"薄荷 + 青柠片", ingredients:["金酒 30ml","冷萃茉莉茶 50ml","接骨木糖浆 10ml","青柠汁 10ml","苏打水 50ml"], steps:["在杯中放入大块冰。","加入金酒、冷萃茉莉茶、接骨木糖浆和青柠汁。","轻轻搅拌均匀，最后补入苏打水。","以薄荷和青柠片装饰。"], pairing:"花香和茶感明显，适合需要慢一点的夜晚。", mocktail:"无酒精版：去掉金酒，改为冷萃茉莉茶 80ml。"},
      blank:{style:"Tea Cooler", strength:"无酒精/低酒精都适合", technique:"加冰直调", ice:"大块冰 6–8 块", garnish:"白桃片或薄荷", ingredients:["伏特加 25ml","白桃乌龙茶 60ml","糖浆 8ml","柠檬汁 8ml","苏打水 40ml"], steps:["杯中放满冰块。","加入伏特加、白桃乌龙茶、糖浆和柠檬汁。","补入苏打水，轻搅后即可。","用白桃片或薄荷点缀。"], pairing:"干净轻柔，适合不想要太复杂味道的时候。", mocktail:"无酒精版：去掉伏特加，额外增加 20ml 乌龙茶。"},
      lonely:{style:"Tea Highball", strength:"中低酒精", technique:"加冰直调", ice:"长冰块或块冰", garnish:"柠檬皮", ingredients:["威士忌 35ml","乌龙茶 55ml","蜂蜜糖浆 8ml","柠檬汁 8ml","苏打水 35ml"], steps:["在高杯中装入冰块。","加入威士忌、乌龙茶、蜂蜜糖浆和柠檬汁。","轻轻搅拌，再补入苏打水。","挤一片柠檬皮后放入杯中。"], pairing:"茶感克制、尾韵温和，适合独处慢饮。", mocktail:"无酒精版：用无酒精威士忌替代，或直接改成乌龙苏打。"},
      tired:{style:"Coffee Tonic", strength:"中低酒精", technique:"分层直调", ice:"大块冰 7 分满", garnish:"橙皮", ingredients:["深色朗姆 30ml","冷萃咖啡 45ml","糖浆 10ml","橙汁 12ml","汤力水 60ml"], steps:["杯中加入块冰后先倒入朗姆、糖浆和橙汁。","补入汤力水。","沿勺背缓缓倒入冷萃咖啡做出轻微分层。","挤入橙皮香气即可。"], pairing:"微苦、微甜、带一点醒神感。", mocktail:"无酒精版：去掉朗姆，冷萃咖啡增加到 60ml。"},
      anxious:{style:"Grapefruit Highball", strength:"低酒精", technique:"加冰直调", ice:"块冰 8 分满", garnish:"葡萄柚皮", ingredients:["金酒 35ml","西柚汁 45ml","糖浆 8ml","柠檬汁 10ml","苏打水 50ml"], steps:["杯中装入冰块。","加入金酒、西柚汁、糖浆与柠檬汁。","补入苏打水，轻搅均匀。","用葡萄柚皮轻挤精油后放入杯中。"], pairing:"轻苦清新，适合把节奏慢下来。", mocktail:"无酒精版：用汤力水替代金酒，整体也很好喝。"},
      irritable:{style:"Ginger Mule", strength:"中低酒精", technique:"加冰直调", ice:"块冰 8 分满", garnish:"青柠片 + 姜片", ingredients:["伏特加 35ml","青柠汁 12ml","糖浆 8ml","姜汁啤酒 90ml","黄瓜片 2 片"], steps:["杯中放入冰块和黄瓜片。","加入伏特加、青柠汁与糖浆。","补入姜汁啤酒，轻轻搅拌。","用青柠片和姜片装饰。"], pairing:"辛香明显，适合把烦躁感转成更利落的味道。", mocktail:"无酒精版：去掉伏特加，改成更多姜汁啤酒和一点苏打水。"},
      romantic:{style:"Berry Rose Fizz", strength:"低酒精", technique:"摇和后加气泡", ice:"块冰 7 分满", garnish:"覆盆子 + 玫瑰花瓣", ingredients:["伏特加 30ml","蔓越莓汁 35ml","玫瑰糖浆 10ml","柠檬汁 10ml","苏打水 45ml"], steps:["将伏特加、蔓越莓汁、玫瑰糖浆和柠檬汁与冰块一起摇匀。","滤入装好冰块的杯中。","补入苏打水，轻轻提一次。","放上覆盆子和少量可食用玫瑰花瓣。"], pairing:"果香柔和，适合约会或心情柔软的晚上。", mocktail:"无酒精版：把伏特加换成白葡萄汁 20ml。"},
      wronged:{style:"Berry Rose Fizz", strength:"低酒精", technique:"摇和后加气泡", ice:"块冰 7 分满", garnish:"蓝莓或覆盆子", ingredients:["金酒 30ml","蔓越莓汁 35ml","紫苏糖浆 8ml","柠檬汁 10ml","苏打水 45ml"], steps:["前四项与冰块摇匀后滤入杯中。","加入苏打水轻轻提一下。","用蓝莓或覆盆子装饰。","如果想更柔和，可在表面放半勺奶泡。"], pairing:"酸甜里带一点柔软，很适合慢慢喝。", mocktail:"无酒精版：把金酒换成冷泡洛神花茶 40ml。"},
      excited:{style:"Tropical Fizz", strength:"中低酒精", technique:"摇和后加气泡", ice:"块冰 7 分满", garnish:"菠萝叶或柑橘片", ingredients:["白朗姆 35ml","菠萝汁 40ml","青柠汁 12ml","糖浆 8ml","气泡水 45ml"], steps:["将朗姆、菠萝汁、青柠汁和糖浆加冰摇匀。","滤入杯中加冰。","补入气泡水，轻轻搅拌。","用菠萝叶或柑橘片装饰。"], pairing:"气泡感明显，适合高能量时段。", mocktail:"无酒精版：去掉朗姆，增加 20ml 菠萝汁。"},
      chaotic:{style:"Tropical Fizz", strength:"中低酒精", technique:"摇和后加气泡", ice:"碎冰或块冰", garnish:"青柠片", ingredients:["龙舌兰 35ml","菠萝汁 35ml","青柠汁 15ml","龙舌兰糖浆 8ml","姜汁汽水 45ml"], steps:["前四项与冰块摇匀。","滤入装好冰块的杯中。","补入姜汁汽水，轻轻搅匀。","最后放上青柠片。"], pairing:"香气活跃、层次多，适合情绪很多线程的时候。", mocktail:"无酒精版：去掉龙舌兰，改用柠檬苏打和更多菠萝汁。"}
    };
    return profiles[moodId] || profiles.blank;
  }

  function createRealRecipe(selected, form, seed, flavors, drinkName) {
    var primary = selected[0] || moodById("blank");
    var secondary = selected[1] || null;
    var profile = recipeProfileForMood(primary.id);
    var garnishMap = {mint:"薄荷叶", citrus:"柑橘片", berry:"浆果串", none:"不额外装饰"};
    var glassName = glassLabelById((form && form.glassShape) || "hurricane");
    var ingredients = profile.ingredients.slice();
    var steps = profile.steps.slice();
    var tipParts = [];
    if (secondary) {
      if (["happy","excited","hopeful"].indexOf(secondary.id) >= 0) {
        ingredients.push("额外气泡水 20ml（让口感更轻快）");
        tipParts.push("如果想更轻盈，可以在最后多补一点气泡水。");
      } else if (["calm","blank","lonely"].indexOf(secondary.id) >= 0) {
        ingredients.push("冷泡茶 15ml（让尾韵更柔和）");
        tipParts.push("加入一点冷泡茶，风味会更安静。 ");
      } else if (["romantic","wronged"].indexOf(secondary.id) >= 0) {
        ingredients.push("莓果糖浆 5ml（增加果香层次）");
      } else if (["anxious","irritable"].indexOf(secondary.id) >= 0) {
        ingredients.push("额外柠檬汁 5ml（让收口更干净）");
      } else if (secondary.id === "tired") {
        ingredients.push("冷萃咖啡 15ml（做更明显的醒神尾韵）");
      }
    }
    if (form && (form.weather === "小雨" || form.weather === "暴雨")) {
      tipParts.push("下雨天调制时，可以在杯沿抹少许海盐，让味道更立体。");
    }
    if (form && form.desired === "清醒一点") {
      tipParts.push("想更清醒，可减少糖浆 2ml 并增加 1 片柠檬皮。 ");
    } else if (form && form.desired === "被安慰") {
      tipParts.push("想更柔和，可以把酒体整体减 5ml，并增加 5ml 糖浆。 ");
    } else if (form && form.desired === "开心一点") {
      tipParts.push("如果想更明亮，优先使用新鲜柑橘汁而不是浓缩汁。 ");
    }
    tipParts.push("推荐杯型：" + glassName + "；装饰可按你的选择改为“" + (garnishMap[(form && form.garnish) || "mint"] || "薄荷叶") + "”。");
    return {
      primaryMoodId:primary.id,
      title:(drinkName || "今日特调") + " · 现实尝试版",
      style:profile.style,
      strength:profile.strength,
      technique:profile.technique,
      ice:profile.ice,
      glass:glassName,
      ingredients:ingredients,
      steps:steps,
      garnish:profile.garnish,
      pairing:profile.pairing,
      mocktail:profile.mocktail,
      note:tipParts.join("")
    };
  }

  function ensureRealRecipe(drink) {
    if (drink && drink.realRecipe) return drink.realRecipe;
    return createRealRecipe(resolveDrinkEmotions(drink || {}), (drink && drink.input) || defaultForm(), hashSeed((drink && drink.name || "") + (drink && drink.createdAt || "")), (drink && drink.flavors) || [], (drink && drink.name) || "今日特调");
  }

  function zeroProofVariant(primaryMoodId) {
    var groups = {
      bright:{ingredients:["冷泡伯爵茶 45ml","鲜橙汁或青提汁 40ml","蜂蜜糖浆 10ml","柠檬汁 12ml","苏打水 80ml"],steps:["杯中加入八分满块冰。","加入冷泡茶、果汁、蜂蜜糖浆和柠檬汁。","补入苏打水，轻轻搅拌 5–6 下。","以柑橘片或薄荷装饰。"]},
      tea:{ingredients:["冷萃茉莉茶或白桃乌龙 80ml","接骨木糖浆 10ml","青柠汁 10ml","苏打水 60ml"],steps:["杯中放入大块冰。","加入冷萃茶、糖浆和青柠汁。","补入苏打水后轻提一次。","用薄荷或白桃片装饰。"]},
      coffee:{ingredients:["冷萃咖啡 60ml","橙汁 15ml","糖浆 10ml","汤力水 90ml"],steps:["杯中加入块冰。","加入橙汁和糖浆，再补入汤力水。","沿勺背缓缓倒入冷萃咖啡。","挤一片橙皮释放香气。"]},
      citrus:{ingredients:["西柚汁 55ml","柠檬汁 10ml","糖浆 8ml","汤力水 90ml"],steps:["杯中装入冰块。","加入西柚汁、柠檬汁和糖浆。","补入汤力水并轻轻搅拌。","用西柚皮装饰。"]},
      ginger:{ingredients:["青柠汁 15ml","糖浆 8ml","姜汁啤酒 110ml","黄瓜片 2 片","苏打水 20ml"],steps:["杯中加入冰块和黄瓜片。","加入青柠汁与糖浆。","补入姜汁啤酒和苏打水。","轻搅后以青柠片装饰。"]},
      berry:{ingredients:["冷泡洛神花茶 45ml","蔓越莓汁 45ml","玫瑰糖浆 10ml","柠檬汁 10ml","苏打水 50ml"],steps:["前四项与冰块一起摇匀。","滤入装有冰块的杯中。","补入苏打水。","用莓果或可食用花瓣装饰。"]},
      tropical:{ingredients:["菠萝汁 65ml","青柠汁 15ml","糖浆 8ml","姜汁汽水 65ml","苏打水 30ml"],steps:["菠萝汁、青柠汁和糖浆与冰块摇匀。","滤入装有冰块的杯中。","补入姜汁汽水与苏打水。","用青柠片或菠萝叶装饰。"]}
    };
    if (["happy","hopeful"].indexOf(primaryMoodId) >= 0) return groups.bright;
    if (["calm","blank","lonely"].indexOf(primaryMoodId) >= 0) return groups.tea;
    if (primaryMoodId === "tired") return groups.coffee;
    if (primaryMoodId === "anxious") return groups.citrus;
    if (primaryMoodId === "irritable") return groups.ginger;
    if (["romantic","wronged"].indexOf(primaryMoodId) >= 0) return groups.berry;
    return groups.tropical;
  }

  function normalizeRealRecipe(realRecipe) {
    var recipe = realRecipe || {};
    var zero = zeroProofVariant(recipe.primaryMoodId || "blank");
    return {
      title:recipe.title || "今日特调 · 现实尝试版",
      style:recipe.style || "House Special",
      strength:recipe.strength || "中低酒精",
      technique:recipe.technique || "加冰直调",
      ice:recipe.ice || "块冰 8 分满",
      glass:recipe.glass || "飓风杯",
      garnish:recipe.garnish || "柑橘片或薄荷",
      pairing:recipe.pairing || "适合慢慢饮用。",
      mocktail:recipe.mocktail || "可以使用茶、果汁与苏打水替代基酒。",
      note:recipe.note || "先从较少糖量开始，再按口味调整。",
      primaryMoodId:recipe.primaryMoodId || "blank",
      alcohol:{
        ingredients:((recipe.alcohol && recipe.alcohol.ingredients) || recipe.ingredients || []).slice(),
        steps:((recipe.alcohol && recipe.alcohol.steps) || recipe.steps || []).slice()
      },
      zero:{
        ingredients:((recipe.zero && recipe.zero.ingredients) || zero.ingredients).slice(),
        steps:((recipe.zero && recipe.zero.steps) || zero.steps).slice()
      }
    };
  }

  function scaleIngredientText(text, servings) {
    return String(text).replace(/(\d+(?:\.\d+)?)\s*ml/g, function (_, value) {
      var amount = Number(value) * servings;
      var formatted = Math.round(amount * 10) / 10;
      return formatted + "ml";
    });
  }

  function currentRecipeVariant(recipe) {
    var normalized = normalizeRealRecipe(recipe);
    return state.recipeMode === "zero" ? normalized.zero : normalized.alcohol;
  }

  function recipeText(realRecipe) {
    var normalized = normalizeRealRecipe(realRecipe);
    var variant = currentRecipeVariant(normalized);
    var title = normalized.title + "（" + (state.recipeMode === "zero" ? "无酒精版" : "酒精版") + " · " + state.recipeServings + "杯）";
    return [title,"", "配方："].concat(variant.ingredients.map(function (item) { return "- " + scaleIngredientText(item,state.recipeServings); }),["","做法："],variant.steps.map(function (item,index) { return (index + 1) + ". " + item; }),["","杯型：" + normalized.glass,"装饰：" + normalized.garnish,"提示：" + normalized.note]).join("\n");
  }

  function updateRecipeCard() {
    var drink = state.detailDrink || state.currentDrink;
    var card = document.querySelector(".real-recipe-card");
    if (!drink || !card) return;
    card.outerHTML = renderRealRecipeCard(ensureRealRecipe(drink));
  }

  function renderRealRecipeCard(realRecipe) {
    if (!realRecipe) return "";
    var normalized = normalizeRealRecipe(realRecipe);
    var variant = currentRecipeVariant(normalized);
    var levelTip = state.recipeLevel === "beginner" ?
      "新手建议：所有材料先冷藏，按顺序量取；补气泡饮料后只轻搅，不要用力摇。" :
      "进阶建议：杯具预冷；摇和类配方控制在 10–12 秒，并根据冰块大小调整稀释度。";
    return '<article class="card real-recipe-card">' +
      '<div class="menu-stamp">HOUSE RECIPE · V8</div>' +
      '<div class="real-recipe-head"><div><span class="eyebrow">现实调酒配方</span><h3>' + escapeHTML(normalized.title) + '</h3></div><span class="doodle-badge">✎ bar note</span></div>' +
      '<div class="recipe-control-row">' +
        '<div class="segmented-control"><button class="segment ' + (state.recipeMode === "alcohol" ? "active" : "") + '" data-action="recipe-mode" data-value="alcohol">酒精版</button>' +
        '<button class="segment ' + (state.recipeMode === "zero" ? "active" : "") + '" data-action="recipe-mode" data-value="zero">无酒精版</button></div>' +
        '<div class="segmented-control compact"><button class="segment ' + (state.recipeServings === 1 ? "active" : "") + '" data-action="recipe-serving" data-value="1">1杯</button>' +
        '<button class="segment ' + (state.recipeServings === 2 ? "active" : "") + '" data-action="recipe-serving" data-value="2">2杯</button>' +
        '<button class="segment ' + (state.recipeServings === 4 ? "active" : "") + '" data-action="recipe-serving" data-value="4">4杯</button></div>' +
      '</div>' +
      '<div class="real-meta-grid">' +
      '<div class="metric"><span class="small muted">风格</span><strong>' + escapeHTML(normalized.style) + '</strong></div>' +
      '<div class="metric"><span class="small muted">推荐杯型</span><strong>' + escapeHTML(normalized.glass) + '</strong></div>' +
      '<div class="metric"><span class="small muted">调制方式</span><strong>' + escapeHTML(normalized.technique) + '</strong></div>' +
      '<div class="metric"><span class="small muted">冰型 / 酒感</span><strong>' + escapeHTML(normalized.ice + ' · ' + (state.recipeMode === "zero" ? "0% 酒精" : normalized.strength)) + '</strong></div>' +
      '</div>' +
      '<div class="recipe-level-row"><span class="eyebrow">难度提示</span><div class="segmented-control compact"><button class="segment ' + (state.recipeLevel === "beginner" ? "active" : "") + '" data-action="recipe-level" data-value="beginner">新手</button><button class="segment ' + (state.recipeLevel === "advanced" ? "active" : "") + '" data-action="recipe-level" data-value="advanced">进阶</button></div></div>' +
      '<div class="recipe-columns">' +
      '<div><span class="eyebrow">配方清单 · 点按勾选</span><ul class="ingredient-list checklist">' + variant.ingredients.map(function (item,index) { return '<li data-action="toggle-ingredient" data-index="' + index + '"><span class="check-box">✓</span><span>' + escapeHTML(scaleIngredientText(item,state.recipeServings)) + '</span></li>'; }).join("") + '</ul></div>' +
      '<div><span class="eyebrow">做法</span><ol class="step-list">' + variant.steps.map(function (item) { return '<li>' + escapeHTML(item) + '</li>'; }).join("") + '</ol></div>' +
      '</div>' +
      '<div class="recipe-tip"><b>装饰建议：</b>' + escapeHTML(normalized.garnish) + '<br><b>风味提示：</b>' + escapeHTML(normalized.pairing) + '<br><b>' + (state.recipeMode === "zero" ? "无酒精说明" : "替代建议") + '：</b>' + escapeHTML(state.recipeMode === "zero" ? "这版不含酒精，适合直接按配方尝试。" : normalized.mocktail) + '<br><b>调酒小纸条：</b>' + escapeHTML(normalized.note) + '<br><b>操作提示：</b>' + escapeHTML(levelTip) + '</div>' +
      '<div class="recipe-action-row"><button class="secondary-btn" data-action="copy-recipe">复制配方</button><button class="secondary-btn" data-action="reset-checklist">清空勾选</button></div>' +
      '<p class="responsible-note">仅供达到当地法定饮酒年龄的成年人参考。请适量饮酒；不饮酒时优先选择无酒精版。</p>' +
      '</article>';
  }

  function buildAIRequestPayload() {
    var selected = state.form.emotions.map(moodById);
    if (!selected.length) selected = [moodById("blank")];
    return {
      emotions:selected.map(function (mood) { return {id:mood.id,label:mood.label,flavors:mood.flavors}; }),
      customMood:state.form.customMood,
      intensity:state.form.intensity,
      contexts:state.form.contexts,
      note:state.form.note,
      energy:state.form.energy,
      weather:state.form.weather,
      desired:state.form.desired,
      glassShape:state.form.glassShape,
      garnish:state.form.garnish,
      primaryColor:selected[0].c1,
      secondaryColor:selected[1] ? selected[1].c2 : selected[0].c2,
      preferences:clone(state.preferences)
    };
  }

  function applyAIResult(localDrink, payload, model) {
    var data = payload || {};
    var result = clone(localDrink);
    result.name = data.name || result.name;
    result.subtitle = data.subtitle || result.subtitle;
    result.tastingNote = data.tastingNote || result.tastingNote;
    if (Array.isArray(data.flavors) && data.flavors.length) result.flavors = data.flavors.slice(0,5);
    if (Array.isArray(data.emotionalRecipe) && data.emotionalRecipe.length) result.recipe = data.emotionalRecipe;
    if (data.visual) {
      result.c1 = data.visual.primaryColor || result.c1;
      result.c2 = data.visual.secondaryColor || result.c2;
      result.glassShape = data.visual.glassShape || result.glassShape;
      result.garnish = data.visual.garnish || result.garnish;
    }
    if (data.metrics) {
      result.metrics.spirit = Number(data.metrics.spirit) || result.metrics.spirit;
      result.metrics.bubble = Number(data.metrics.bubble) || result.metrics.bubble;
      result.metrics.aftertaste = data.metrics.aftertaste || result.metrics.aftertaste;
      result.metrics.setting = data.metrics.setting || result.metrics.setting;
    }
    if (data.realRecipe) result.realRecipe = data.realRecipe;
    result.aiGenerated = true;
    result.aiModel = model || "qwen3.7-plus";
    result.aiGeneratedAt = new Date().toISOString();
    return result;
  }

  function requestAIDrink() {
    if (!aiCanRun()) return Promise.resolve({ok:false,code:aiRemaining() <= 0 ? "LIMIT" : "OFFLINE"});
    var controller = new AbortController();
    var timer = window.setTimeout(function () { controller.abort(); }, 18000);
    return fetch("./api/generate-drink", {
      method:"POST",
      headers:{"Content-Type":"application/json","Accept":"application/json"},
      body:JSON.stringify(buildAIRequestPayload()),
      signal:controller.signal
    }).then(function (response) {
      return response.json().then(function (payload) {
        if (!response.ok || !payload.ok) {
          if (payload && payload.code === "AI_NOT_CONFIGURED") state.aiStatus = "offline";
          return {ok:false,code:(payload && payload.code) || "FAILED",message:(payload && payload.message) || "AI 生成失败"};
        }
        markAIUsage();
        state.aiStatus = "online";
        state.aiModel = payload.model || state.aiModel;
        return payload;
      });
    }).catch(function (error) {
      if (error && error.name === "AbortError") return {ok:false,code:"TIMEOUT",message:"AI 请求超时"};
      return {ok:false,code:"FAILED",message:error && error.message ? error.message : "AI 生成失败"};
    }).finally(function () { window.clearTimeout(timer); });
  }

  function generateDrink() {
    var selected = state.form.emotions.map(moodById);
    if (!selected.length) selected = [moodById("blank")];
    var seed = hashSeed(JSON.stringify(state.form) + new Date().toDateString());
    var variation = state.form.variant || 0;
    var effectiveSeed = seed + variation;
    var labels = selected.map(function (mood) { return mood.label; });
    var nameSets = {
      tired:["再睡五分钟","低电量缓冲区","今天先这样","温柔罢工冰茶","下班之后再解释"],
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
    var name = pick(nameSets[selected[0].id] || nameSets.blank, effectiveSeed);
    var subtitles = [
      "献给今天" + labels.join("、") + "，却仍然把一天过完的你。",
      "这杯不解决问题，只负责陪你坐一会儿。",
      "把" + state.form.weather + "留在杯口，把没说完的话沉到底部。",
      "适合在" + (state.form.contexts[0] || "安静的角落") + "之后，慢慢喝完。"
    ];
    var notes = [
      "入口先是" + selected[0].flavors[0] + "的味道，随后浮起一点" +
        (selected[1] ? selected[1].flavors[1] : "轻微的甜") +
        "。今天并没有被强行变好，但你已经撑过了最难喝的第一口。",
      "前调带着" + state.form.weather + "的气息，中段是" + selected[0].flavors[1] +
        "，余味停在“" + state.form.desired + "”。有些感受不必马上解释，先让它们在杯里慢慢晕开。",
      "这是一杯浓度为" + state.form.intensity +
        "%的今天：不够完美，也没有完全失控。冰块会融化，颜色会扩散，而你可以暂时什么都不处理。"
    ];
    var flavors = [];
    selected.forEach(function (mood) {
      mood.flavors.forEach(function (flavor) {
        if (flavors.indexOf(flavor) < 0) flavors.push(flavor);
      });
    });
    if (state.form.weather === "晚风" && flavors.indexOf("晚风") < 0) flavors.push("晚风");
    if ((state.form.weather === "小雨" || state.form.weather === "暴雨") && flavors.indexOf("雨水") < 0) flavors.push("雨水");

    var basePrimary = Math.max(40, 65 - selected.length * 8);
    var recipe = selected.map(function (mood, index) {
      return {
        label:mood.label,
        value:index === 0 ? basePrimary : Math.round((100 - basePrimary) / Math.max(1, selected.length - 1))
      };
    });
    var total = recipe.reduce(function (sum, item) { return sum + item.value; }, 0);
    recipe[0].value += 100 - total;
    if (state.form.customMood.trim()) {
      recipe[0].value = Math.max(20, recipe[0].value - 10);
      recipe.push({label:state.form.customMood.trim().slice(0,10),value:10});
    }

    var bubble = Math.max(12, Math.min(96, Math.round(state.form.energy * .65 +
      (selected.some(function (mood) { return ["happy","excited","romantic"].indexOf(mood.id) >= 0; }) ? 25 : 0))));
    var spirit = Math.max(8, Math.min(99, Math.round(state.form.energy * .55 + state.form.intensity * .35)));
    var aftertaste = state.form.desired === "保持现在" ? "今晚" :
      (state.form.desired === "什么都不需要改变" ? "不设期限" : pick(["明天早上","睡一觉之后","下一阵晚风","周末之前"], effectiveSeed, 9));

    return {
      id:Date.now(),
      name:name,
      subtitle:pick(subtitles, effectiveSeed, 2),
      tastingNote:pick(notes, effectiveSeed, 4),
      flavors:flavors.slice(0,5),
      emotions:selected.map(function (mood) { return {id:mood.id,label:mood.label}; }),
      recipe:recipe,
      metrics:{
        intensity:state.form.intensity,
        spirit:spirit,
        bubble:bubble,
        aftertaste:aftertaste,
        setting:state.form.energy <= 30 ? "戴上耳机，独自慢慢喝" :
          (state.form.desired === "被安慰" ? "盖好被子，在暖光里喝" : "在晚风经过的时候慢慢喝")
      },
      c1:selected[0].c1,
      c2:selected[1] ? selected[1].c2 : selected[0].c2,
      glassShape:state.form.glassShape,
      garnish:state.form.garnish,
      realRecipe:createRealRecipe(selected, state.form, effectiveSeed, flavors, name),
      createdAt:new Date().toISOString(),
      input:clone(state.form)
    };
  }

  function renderResult(drink, detailMode) {
    if (!drink) return "";
    var glassLabel = glassLabelById(drink.glassShape);
    var realRecipe = ensureRealRecipe(drink);
    var content = '<div class="result-screen screen"><header class="topbar">' +
      '<button class="back-btn" data-action="' + (detailMode ? "close-detail" : "result-home") + '">‹</button>' +
      '<span class="eyebrow">YOUR WATERCOLOR SPECIAL</span><button class="icon-btn" data-action="share-drink">↗</button></header>' +
      '<section class="result-hero">' + drinkVisual(drink,"result") + '</section>' +
      '<section class="result-title"><span class="eyebrow">今日情绪特调 · ' + glassLabel + (drink.aiGenerated ? ' · AI GENERATED' : ' · LOCAL') + '</span>' +
      '<h1>' + escapeHTML(drink.name) + '</h1><p class="result-subtitle">' + escapeHTML(drink.subtitle) + '</p>' +
      '<div class="tags">' + (drink.flavors || []).map(function (flavor) {
        return '<span class="tag">' + escapeHTML(flavor) + '</span>';
      }).join("") + '</div></section>' +
      '<article class="card recipe-card"><span class="eyebrow">情绪配方</span>' +
      (drink.recipe || []).map(function (item, index) {
        return '<div class="recipe-row"><div class="recipe-label"><span>' + escapeHTML(item.label) +
          '</span><span>' + item.value + '%</span></div><div class="recipe-bar"><div style="width:' +
          item.value + '%;filter:hue-rotate(' + (index * 24) + 'deg)"></div></div></div>';
      }).join("") + '</article>' +
      '<article class="card note-card"><span class="eyebrow">调酒师品鉴</span><p>' +
      escapeHTML(drink.tastingNote) + '</p></article>' +
      renderRealRecipeCard(realRecipe) +
      '<article class="card metrics-card"><span class="eyebrow">饮品属性</span><div class="metrics-grid">' +
      metric("情绪浓度",drink.metrics.intensity + "%") + metric("精神浓度",drink.metrics.spirit + "%") +
      metric("气泡指数",drink.metrics.bubble + "%") + metric("回甘时间",drink.metrics.aftertaste) +
      '</div><div class="metric" style="margin-top:9px"><span class="small muted">建议饮用方式</span><strong>' +
      escapeHTML(drink.metrics.setting) + '</strong></div></article>' +
      '<div class="result-actions">' +
      (detailMode ? '' : '<button class="primary-btn" data-action="save-drink">收藏这杯</button>') +
      '<button class="secondary-btn" data-action="share-drink">生成分享卡</button>' +
      (detailMode ? (drink.isPublicSample ?
        '<button class="primary-btn" data-action="use-detail-sample" data-id="' + drink.sourceSampleId + '">用这个配方调制</button>' :
        '<button class="text-link" data-action="delete-drink" data-id="' + drink.id + '">从酒窖移除</button>') :
        '<button class="secondary-btn" data-action="regenerate-drink">换一个名字与文案</button>' +
        '<button class="text-link" data-action="remix-drink">重新调制</button>') +
      '</div></div>';
    if (detailMode) return content;
    app.innerHTML = '<main class="app-shell no-nav">' + content + '</main>';
  }

  function metric(label, value) {
    return '<div class="metric"><span class="small muted">' + label + '</span><strong>' + escapeHTML(value) + '</strong></div>';
  }

  function renderDetailOverlay() {
    var old = document.querySelector(".detail-overlay");
    if (old) old.remove();
    var overlay = document.createElement("div");
    overlay.className = "detail-overlay";
    overlay.innerHTML = '<main class="app-shell no-nav">' + renderResult(state.detailDrink, true) + '</main>';
    document.body.appendChild(overlay);
  }

  function render() {
    if (!app) return;
    if (state.view === "onboarding") {
      app.innerHTML = onboardingView();
      return;
    }
    if (state.view === "mix") {
      renderMix();
      return;
    }
    if (state.view === "mixing") {
      renderMixing();
      return;
    }
    if (state.view === "result") {
      renderResult(state.currentDrink, false);
      return;
    }
    renderMain();
  }

  function resetForm() {
    state.form = defaultForm();
    state.mixStep = 1;
  }

  function startMix() {
    state.view = "mix";
    state.mixStep = 1;
    render();
  }

  function updateMoodUI() {
    var buttons = document.querySelectorAll('[data-action="select-mood"]');
    Array.prototype.forEach.call(buttons, function (button) {
      var active = state.form.emotions.indexOf(button.getAttribute("data-mood")) >= 0;
      button.classList.toggle("active", active);
      button.disabled = !active && state.form.emotions.length >= 3;
    });
    var next = document.querySelector('[data-action="next-step"]');
    if (next) next.disabled = !(state.form.emotions.length > 0 || state.form.customMood.trim());
  }

  function selectOnly(selector, value, attribute) {
    var buttons = document.querySelectorAll(selector);
    Array.prototype.forEach.call(buttons, function (button) {
      button.classList.toggle("active", button.getAttribute(attribute) === String(value));
    });
  }

  function beginMixing() {
    state.view = "mixing";
    state.mixingIndex = 0;
    render();
    var messages = [
      "正在提取今天的颜色……",
      "千问正在理解尚未说出口的话……",
      "正在匹配你的个人风味档案……",
      "正在校验现实调酒配方……",
      "让今天的情绪慢慢融进杯中……",
      "你的 AI 特调即将完成。"
    ];
    var messageIndex = 0;
    var timer = window.setInterval(function () {
      messageIndex = Math.min(messageIndex + 1, messages.length - 1);
      var message = document.getElementById("mixingMessage");
      if (message) message.textContent = messages[messageIndex];
    }, 1100);

    var localDrink = generateDrink();
    var minimumDelay = new Promise(function (resolve) { window.setTimeout(resolve, 2600); });
    Promise.all([requestAIDrink(), minimumDelay]).then(function (values) {
      var aiPayload = values[0];
      if (aiPayload && aiPayload.ok && aiPayload.data) {
        state.currentDrink = applyAIResult(localDrink, aiPayload.data, aiPayload.model);
        state.aiSource = "ai";
      } else {
        state.currentDrink = localDrink;
        state.currentDrink.aiGenerated = false;
        state.aiSource = "local";
      }
      state.recipeMode = state.preferences.alcohol === "zero" ? "zero" : "alcohol";
      state.recipeServings = 1;
      state.recipeLevel = "beginner";
      state.view = "result";
      render();
      if (state.aiSource === "local") {
        if (aiPayload && aiPayload.code === "LIMIT") showToast("今日 AI 次数已用完，已使用本地配方");
        else if (state.aiStatus === "offline") showToast("API 尚未配置，已使用本地配方");
        else showToast("AI 暂时没有响应，已自动使用本地配方");
      } else {
        showToast("千问已完成这杯专属特调");
      }
    }).finally(function () { window.clearInterval(timer); });
  }

  function findSample(id) {
    return sampleDrinks.filter(function (sample) { return sample.id === id; })[0];
  }

  function useSample(sample) {
    if (!sample) return;
    resetForm();
    state.form.emotions = sample.emotions.map(function (label) { return moodByLabel(label).id; });
    state.form.intensity = 66;
    state.form.glassShape = sample.glassShape;
    state.form.garnish = sample.garnish;
    state.form.desired = "保持现在";
    state.view = "mix";
    state.mixStep = 1;
    render();
  }

  function openShare(drink) {
    if (!drink) return;
    var old = document.getElementById("shareModal");
    if (old) old.remove();
    var modal = document.createElement("div");
    modal.className = "modal-backdrop";
    modal.id = "shareModal";
    modal.innerHTML = '<section class="bottom-sheet"><div class="sheet-handle"></div>' +
      '<div class="section-title"><h3>生成分享卡</h3><button class="ghost-btn" data-action="close-share">×</button></div>' +
      '<div class="template-tabs">' +
      shareTemplateButton("midnight","Midnight Bar") +
      shareTemplateButton("paper","Watercolor Paper") +
      shareTemplateButton("poster","Dreamy Poster") +
      '</div><img id="sharePreview" class="share-preview" alt="分享卡预览"/>' +
      '<button class="primary-btn" style="margin-top:14px" data-action="download-share">保存或分享 PNG</button></section>';
    document.body.appendChild(modal);
    modal._drink = drink;
    updateSharePreview(drink, state.shareTemplate);
  }

  function shareTemplateButton(id, label) {
    return '<button class="chip ' + (state.shareTemplate === id ? "active" : "") +
      '" data-action="share-template" data-template="' + id + '">' + label + '</button>';
  }

  function roundRect(ctx,x,y,w,h,r) {
    var radius = Math.min(r,w/2,h/2);
    ctx.beginPath();
    ctx.moveTo(x + radius,y);
    ctx.arcTo(x + w,y,x + w,y + h,radius);
    ctx.arcTo(x + w,y + h,x,y + h,radius);
    ctx.arcTo(x,y + h,x,y,radius);
    ctx.arcTo(x,y,x + w,y,radius);
    ctx.closePath();
  }

  function wrapText(ctx,text,x,y,maxWidth,lineHeight,maxLines) {
    var chars = Array.from(String(text));
    var line = "";
    var lines = [];
    chars.forEach(function (char) {
      var test = line + char;
      if (ctx.measureText(test).width > maxWidth && line) {
        lines.push(line);
        line = char;
      } else {
        line = test;
      }
    });
    if (line) lines.push(line);
    lines.slice(0,maxLines || 4).forEach(function (content,index) {
      ctx.fillText(content,x,y + index * lineHeight);
    });
  }

  function paintCanvasDrink(ctx, drink) {
    ctx.save();
    ctx.translate(540,620);

    var shape = (drink && drink.glassShape) || "hurricane";
    var colorA = (drink && drink.c1) || "#f592ad";
    var colorB = (drink && drink.c2) || "#8ecfd8";
    var garnish = (drink && drink.garnish) || "mint";
    var seed = hashSeed(String(colorA) + String(colorB) + shape + garnish + ((drink && drink.name) || ""));

    var shapes = {
      hurricane: {
        bowl:"M112 70 C101 80 98 96 100 113 C102 134 113 151 114 170 C115 187 106 205 104 228 C100 273 121 307 160 323 C199 307 220 273 216 228 C214 205 205 187 206 170 C207 151 218 134 220 113 C222 96 219 80 208 70 C184 61 136 61 112 70 Z",
        liquid:"M116 111 C113 128 118 143 120 160 C122 178 114 196 113 227 C111 266 129 291 160 304 C191 291 209 266 207 227 C206 196 198 178 200 160 C202 143 207 128 204 111 C182 104 138 104 116 111 Z",
        stem:"M158 323 C158 342 158 361 158 381",
        base:"M109 394 C130 386 190 386 211 394 C193 404 127 404 109 394 Z",
        straw:[205,70,179,175], garnishCx:227, garnishCy:80,
        leaf1:[209,119,225,105,245,106,257,120,242,139,224,142,209,119],
        leaf2:[191,136,205,124,223,127,232,142,217,154,201,153,191,136]
      },
      goblet: {
        bowl:"M100 77 C90 116 89 163 100 220 C110 270 132 304 160 317 C188 304 210 270 220 220 C231 163 230 116 220 77 C188 66 132 66 100 77 Z",
        liquid:"M107 111 C99 144 100 182 109 226 C118 267 136 290 160 299 C184 290 202 267 211 226 C220 182 221 144 213 111 C185 103 135 103 107 111 Z",
        stem:"M157 316 C158 340 158 362 157 385",
        base:"M103 395 C122 387 199 387 217 395 C199 406 121 406 103 395 Z",
        straw:[197,77,174,169], garnishCx:222, garnishCy:84,
        leaf1:[204,116,221,102,241,104,253,117,239,137,220,140,204,116],
        leaf2:[186,132,201,120,220,124,230,140,214,153,197,151,186,132]
      },
      highball: {
        bowl:"M115 59 C110 119 108 189 114 270 C117 310 129 339 160 349 C191 339 203 310 206 270 C212 189 210 119 205 59 C181 53 139 53 115 59 Z",
        liquid:"M120 101 C116 150 116 206 121 269 C124 299 133 319 160 329 C187 319 196 299 199 269 C204 206 204 150 200 101 C178 96 142 96 120 101 Z",
        stem:"",
        base:"M116 357 C134 352 187 352 204 357 C190 365 130 365 116 357 Z",
        straw:[198,60,178,171], garnishCx:219, garnishCy:73,
        leaf1:[205,120,220,108,238,109,250,122,236,139,220,142,205,120],
        leaf2:[189,135,202,125,220,128,228,143,214,154,199,152,189,135]
      },
      martini: {
        bowl:"M75 86 C102 132 128 171 160 202 C192 171 218 132 245 86 C196 75 124 75 75 86 Z",
        liquid:"M90 104 C112 137 134 165 160 188 C186 165 208 137 230 104 C191 97 129 97 90 104 Z",
        stem:"M158 202 C158 258 158 330 157 382",
        base:"M102 395 C124 386 198 386 218 395 C199 406 120 406 102 395 Z",
        straw:[213,77,178,154], garnishCx:225, garnishCy:80,
        leaf1:[210,112,225,99,243,100,254,113,241,132,224,135,210,112],
        leaf2:[191,127,204,117,221,120,230,135,215,147,200,145,191,127]
      }
    };
    var g = shapes[shape] || shapes.hurricane;

    function drawLeaf(values, fill, stroke) {
      ctx.beginPath();
      ctx.moveTo(values[0], values[1]);
      ctx.bezierCurveTo(values[2], values[3], values[4], values[5], values[6], values[7]);
      ctx.bezierCurveTo(values[8], values[9], values[10], values[11], values[12], values[13]);
      ctx.closePath();
      ctx.fillStyle = fill;
      ctx.fill();
      ctx.strokeStyle = stroke;
      ctx.lineWidth = 2.1;
      ctx.stroke();
    }

    function drawMint() {
      drawLeaf(g.leaf1, "#66bc76", "rgba(37,87,50,.34)");
      drawLeaf(g.leaf2, "#4ea866", "rgba(37,87,50,.32)");
      ctx.beginPath();
      ctx.moveTo(216,134); ctx.bezierCurveTo(203,145,193,154,185,170);
      ctx.strokeStyle = "#4f9861"; ctx.lineWidth = 3; ctx.lineCap = "round"; ctx.stroke();
    }

    function drawBerry() {
      [[g.garnishCx - 7, g.garnishCy + 12, 8, "#d84e79"],[g.garnishCx + 4, g.garnishCy + 8, 8, "#b94877"],[g.garnishCx + 13, g.garnishCy + 17, 7, "#e06e86"]].forEach(function(item){
        ctx.beginPath(); ctx.arc(item[0], item[1], item[2], 0, Math.PI*2); ctx.fillStyle = item[3]; ctx.fill();
      });
      ctx.beginPath();
      ctx.moveTo(g.garnishCx + 2, g.garnishCy + 2);
      ctx.bezierCurveTo(g.garnishCx + 3, g.garnishCy - 5, g.garnishCx + 8, g.garnishCy - 10, g.garnishCx + 14, g.garnishCy - 13);
      ctx.strokeStyle = "#5e9d61"; ctx.lineWidth = 2.4; ctx.stroke();
    }

    function drawCitrus() {
      ctx.save();
      ctx.translate(g.garnishCx, g.garnishCy); ctx.rotate(20 * Math.PI / 180);
      ctx.beginPath(); ctx.ellipse(0,0,21,10,0,0,Math.PI*2);
      ctx.strokeStyle = "#f0a34f"; ctx.lineWidth = 7; ctx.stroke();
      ctx.restore();
    }

    // watercolor halo behind the glass
    var halo = ctx.createRadialGradient(160,180,18,160,180,165);
    halo.addColorStop(0, colorA + "40");
    halo.addColorStop(.58, colorB + "28");
    halo.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.ellipse(160,180,120,158,0,0,Math.PI*2);
    ctx.fill();

    // doodle accents around glass
    ctx.lineCap = "round"; ctx.lineJoin = "round";
    ctx.strokeStyle = "rgba(255,248,242,.66)"; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(58,116); ctx.bezierCurveTo(46,106,45,88,58,83); ctx.bezierCurveTo(72,77,83,95,73,108); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(246,128); ctx.bezierCurveTo(259,117,276,121,281,134); ctx.stroke();
    ctx.strokeStyle = "rgba(241,176,95,.68)"; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(259,148); ctx.bezierCurveTo(268,141,279,143,284,153); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(69,286); ctx.bezierCurveTo(80,282,92,284,102,292); ctx.stroke();
    function drawSpark(x, y, s, color) {
      ctx.strokeStyle = color; ctx.lineWidth = 2.3;
      ctx.beginPath();
      ctx.moveTo(x, y - s); ctx.lineTo(x, y - s/3);
      ctx.moveTo(x, y + s/3); ctx.lineTo(x, y + s);
      ctx.moveTo(x - s, y); ctx.lineTo(x - s/3, y);
      ctx.moveTo(x + s/3, y); ctx.lineTo(x + s, y);
      ctx.stroke();
    }
    drawSpark(86, 86, 12, "rgba(255,248,242,.56)");
    drawSpark(240, 85, 10, "rgba(241,176,95,.62)");

    var bowlPath = new Path2D(g.bowl);
    var liquidPath = new Path2D(g.liquid);
    var basePath = new Path2D(g.base);
    var stemPath = g.stem ? new Path2D(g.stem) : null;

    // glass outline shadow
    ctx.shadowColor = "rgba(0,0,0,.18)";
    ctx.shadowBlur = 28;
    ctx.fillStyle = "rgba(255,255,255,.06)";
    ctx.fill(bowlPath);
    ctx.shadowBlur = 0;

    // liquid clipping and watercolor blotches
    var gradient = ctx.createLinearGradient(160,96,160,310);
    gradient.addColorStop(0, colorA);
    gradient.addColorStop(.58, colorB);
    gradient.addColorStop(1, "#f2b064");
    ctx.save();
    ctx.clip(liquidPath);
    ctx.fillStyle = gradient;
    ctx.fillRect(80, 92, 160, 240);
    for (var i = 0; i < 17; i += 1) {
      var cx = 104 + ((seed + i * 47) % 112);
      var cy = 116 + ((seed + i * 67) % 168);
      var rx = 13 + ((seed + i * 19) % 26);
      var ry = 11 + ((seed + i * 23) % 31);
      var fill = i % 3 === 0 ? colorA : (i % 3 === 1 ? colorB : "#f4b35f");
      ctx.globalAlpha = .13 + ((i % 5) * .035);
      ctx.fillStyle = fill;
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, ((i * 17) % 48 - 24) * Math.PI / 180, 0, Math.PI*2);
      ctx.fill();
    }
    // little white speckles and top sheen
    ctx.globalAlpha = .28;
    ctx.fillStyle = "#ffffff";
    for (var j = 0; j < 18; j += 1) {
      var sx = 110 + ((seed + j * 31) % 100);
      var sy = 112 + ((seed + j * 53) % 178);
      var sr = 1 + ((j + seed) % 3);
      ctx.beginPath(); ctx.arc(sx, sy, sr, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = .30;
    ctx.strokeStyle = "rgba(255,255,255,.42)";
    ctx.lineWidth = 5.5; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(121, 110); ctx.bezierCurveTo(139,105,183,105,201,111); ctx.stroke();
    ctx.restore();
    ctx.globalAlpha = 1;

    // ice cubes
    [[136,163,-18],[181,194,11],[152,232,-40]].forEach(function(item){
      ctx.save();
      ctx.translate(item[0], item[1]); ctx.rotate(item[2] * Math.PI / 180);
      ctx.beginPath();
      roundRect(ctx, -16, -19, 32, 38, 8);
      ctx.fillStyle = "rgba(255,255,255,.14)"; ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,.24)"; ctx.lineWidth = 2; ctx.stroke();
      ctx.restore();
    });

    // glass outline
    ctx.strokeStyle = "rgba(246,241,244,.78)";
    ctx.lineWidth = 4.2;
    ctx.stroke(bowlPath);
    ctx.strokeStyle = "rgba(255,255,255,.20)";
    ctx.lineWidth = 2.2;
    ctx.beginPath(); ctx.moveTo(122,86); ctx.bezierCurveTo(142,80,178,80,198,86); ctx.stroke();

    // straw
    var strawGrad = ctx.createLinearGradient(g.straw[0], g.straw[1], g.straw[2], g.straw[3]);
    strawGrad.addColorStop(0, colorA); strawGrad.addColorStop(1, colorB);
    ctx.strokeStyle = strawGrad; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(g.straw[0], g.straw[1]); ctx.lineTo(g.straw[2], g.straw[3]); ctx.stroke();
    ctx.strokeStyle = "#75d2df"; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(g.straw[0]-24, g.straw[1]+5); ctx.lineTo(g.straw[0]+3, g.straw[1]+2); ctx.stroke();

    // garnish
    if (garnish === "mint") drawMint();
    else if (garnish === "berry") drawBerry();
    else if (garnish === "citrus") drawCitrus();

    // stem/base
    if (stemPath) {
      ctx.strokeStyle = "rgba(246,241,244,.78)"; ctx.lineWidth = 4.2; ctx.lineCap = "round"; ctx.stroke(stemPath);
    }
    ctx.fillStyle = "rgba(255,255,255,.05)"; ctx.fill(basePath);
    ctx.strokeStyle = "rgba(246,241,244,.72)"; ctx.lineWidth = 3; ctx.stroke(basePath);

    ctx.restore();
  }

  function updateSharePreview(drink, template) {
    var canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1920;
    var ctx = canvas.getContext("2d");
    var palettes = {
      midnight:["#110c17","#2b1834","#fff8f2"],
      paper:["#f4eadf","#e6d7cb","#2a1c2e"],
      poster:["#2b1740","#8d4f79","#fff8f2"]
    };
    var palette = palettes[template] || palettes.midnight;
    var background = ctx.createLinearGradient(0,0,1080,1920);
    background.addColorStop(0,palette[0]);
    background.addColorStop(1,palette[1]);
    ctx.fillStyle = background;
    ctx.fillRect(0,0,1080,1920);

    var bloom = ctx.createRadialGradient(540,620,30,540,620,540);
    bloom.addColorStop(0,drink.c1 + "99");
    bloom.addColorStop(.52,drink.c2 + "44");
    bloom.addColorStop(1,"transparent");
    ctx.fillStyle = bloom;
    ctx.fillRect(0,60,1080,1240);

    for (var i = 0; i < 80; i += 1) {
      ctx.globalAlpha = .025 + (i % 4) * .012;
      ctx.fillStyle = i % 2 ? drink.c1 : drink.c2;
      ctx.beginPath();
      ctx.ellipse((i * 139) % 1080,(i * 211) % 1920,18 + (i % 8) * 7,14 + (i % 6) * 8,(i * 13) * Math.PI / 180,0,Math.PI*2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    ctx.fillStyle = palette[2];
    ctx.globalAlpha = .7;
    ctx.font = "500 30px system-ui";
    ctx.textAlign = "left";
    ctx.fillText("MOOD MIXER · 情绪调酒师",86,108);
    ctx.globalAlpha = 1;

    paintCanvasDrink(ctx,drink);

    ctx.fillStyle = palette[2];
    ctx.font = "700 76px serif";
    ctx.textAlign = "center";
    wrapText(ctx,drink.name,540,1120,890,92,2);

    ctx.globalAlpha = .72;
    ctx.font = "400 34px system-ui";
    wrapText(ctx,drink.subtitle,540,1305,820,55,3);
    ctx.globalAlpha = 1;

    ctx.textAlign = "left";
    ctx.font = "500 28px system-ui";
    ctx.fillText("情绪配方",86,1510);
    (drink.recipe || []).slice(0,4).forEach(function (item,index) {
      ctx.globalAlpha = .78;
      ctx.fillText(item.label + "  " + item.value + "%",86,1575 + index * 52);
    });
    ctx.globalAlpha = .55;
    ctx.font = "400 25px system-ui";
    ctx.fillText(new Date(drink.createdAt).toLocaleDateString("zh-CN"),86,1810);
    ctx.textAlign = "right";
    ctx.fillText("把今天的情绪，调成一杯酒。",994,1810);

    var preview = document.getElementById("sharePreview");
    if (preview) preview.src = canvas.toDataURL("image/png");
  }

  function dataURLToBlob(dataURL) {
    var parts = dataURL.split(",");
    var mime = parts[0].match(/:(.*?);/)[1];
    var binary = atob(parts[1]);
    var array = new Uint8Array(binary.length);
    for (var i = 0; i < binary.length; i += 1) array[i] = binary.charCodeAt(i);
    return new Blob([array], {type:mime});
  }

  function downloadShare() {
    var preview = document.getElementById("sharePreview");
    var modal = document.getElementById("shareModal");
    if (!preview || !modal || !preview.src) return;
    var drink = modal._drink;
    var filename = (drink ? drink.name : "情绪特调") + "-分享卡.png";
    var blob = dataURLToBlob(preview.src);
    var file;
    try { file = new File([blob], filename, {type:"image/png"}); }
    catch (error) { file = null; }

    if (navigator.share && file && navigator.canShare && navigator.canShare({files:[file]})) {
      navigator.share({title:"我的情绪特调",files:[file]}).then(function () {
        showToast("分享卡已打开");
      }).catch(function () {});
      return;
    }

    var url = URL.createObjectURL(blob);
    var link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(function () { URL.revokeObjectURL(url); }, 1200);
    showToast("分享卡已生成");
  }

  function exportData() {
    var payload = {
      version:APP_VERSION,
      exportedAt:new Date().toISOString(),
      drinks:getSavedDrinks(),
      favorites:getFavorites()
    };
    var blob = new Blob([JSON.stringify(payload,null,2)], {type:"application/json"});
    var url = URL.createObjectURL(blob);
    var link = document.createElement("a");
    link.href = url;
    link.download = "mood-mixer-backup.json";
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    showToast("酒窖备份已导出");
  }

  function fallbackCopy(text) {
    var area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly","");
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    try { document.execCommand("copy"); showToast("配方已复制"); }
    catch (error) { showToast("长按配方文字进行复制"); }
    area.remove();
  }

  function handleClick(event) {
    var target = event.target.closest("[data-action]");
    if (!target) {
      if (event.target.classList.contains("modal-backdrop")) event.target.remove();
      return;
    }
    var action = target.getAttribute("data-action");

    if (action === "onboarding-next") {
      if (state.onboardingStep < 2) {
        state.onboardingStep += 1;
      } else {
        safeStorageSet(STORAGE.onboarded,"true");
        state.view = "main";
        state.activeTab = "home";
      }
      render();
      return;
    }

    if (action === "onboarding-skip") {
      safeStorageSet(STORAGE.onboarded,"true");
      state.view = "main";
      state.activeTab = "home";
      render();
      return;
    }

    if (action === "nav") {
      state.view = "main";
      state.activeTab = target.getAttribute("data-tab");
      state.detailDrink = null;
      var overlay = document.querySelector(".detail-overlay");
      if (overlay) overlay.remove();
      render();
      return;
    }

    if (action === "start-mix") {
      resetForm();
      startMix();
      return;
    }

    if (action === "quick-mood") {
      resetForm();
      state.form.emotions = [target.getAttribute("data-mood")];
      startMix();
      return;
    }

    if (action === "daily-prompt") {
      resetForm();
      state.form.contexts = ["独处"];
      state.form.note = "今天有什么瞬间，让我的情绪突然发生了变化？";
      startMix();
      return;
    }

    if (action === "open-drink") {
      var id = target.getAttribute("data-id");
      state.detailDrink = getSavedDrinks().filter(function (drink) { return String(drink.id) === String(id); })[0];
      if (state.detailDrink) { state.recipeMode = "alcohol"; state.recipeServings = 1; state.recipeLevel = "beginner"; renderDetailOverlay(); }
      return;
    }

    if (action === "cellar-filter") {
      state.cellarFilter = target.getAttribute("data-filter");
      renderMain();
      return;
    }

    if (action === "cellar-mode") {
      state.cellarMode = target.getAttribute("data-mode");
      renderMain();
      return;
    }

    if (action === "discover-filter") {
      state.discoverCategory = target.getAttribute("data-category");
      renderMain();
      return;
    }

    if (action === "open-sample") {
      var sample = findSample(target.getAttribute("data-id"));
      if (sample) {
        state.detailDrink = sampleAsDrink(sample);
        state.recipeMode = "alcohol"; state.recipeServings = 1; state.recipeLevel = "beginner";
        renderDetailOverlay();
      }
      return;
    }

    if (action === "use-sample") {
      useSample(findSample(target.getAttribute("data-id")));
      return;
    }

    if (action === "favorite-sample") {
      var sampleId = target.getAttribute("data-id");
      var favorites = getFavorites();
      var index = favorites.indexOf(sampleId);
      var sampleDrink = findSample(sampleId);
      var saved = getSavedDrinks();
      if (index >= 0) {
        favorites.splice(index,1);
        saved = saved.filter(function (drink) { return drink.sourceSampleId !== sampleId; });
        showToast("已取消收藏");
      } else {
        favorites.push(sampleId);
        if (sampleDrink && !saved.some(function (drink) { return drink.sourceSampleId === sampleId; })) {
          var savedSample = sampleAsDrink(sampleDrink);
          savedSample.isPublicSample = false;
          saved.unshift(savedSample);
        }
        showToast("已收藏到酒窖");
      }
      setFavorites(favorites);
      setSavedDrinks(saved);
      renderMain();
      return;
    }

    if (action === "toggle-taste") {
      var taste = target.getAttribute("data-value");
      var tasteIndex = state.preferences.tastes.indexOf(taste);
      if (tasteIndex >= 0) state.preferences.tastes.splice(tasteIndex,1);
      else if (state.preferences.tastes.length < 4) state.preferences.tastes.push(taste);
      else { showToast("最多选择四项风味偏好"); return; }
      savePreferences();
      renderMain();
      return;
    }

    if (action === "set-alcohol-pref") {
      state.preferences.alcohol = target.getAttribute("data-value");
      savePreferences();
      renderMain();
      return;
    }

    if (action === "install-app") {
      if (state.installPrompt) {
        state.installPrompt.prompt();
        state.installPrompt.userChoice.then(function () { state.installPrompt = null; });
      } else {
        showToast("iPhone：Safari 分享 → 添加到主屏幕");
      }
      return;
    }

    if (action === "export-data") {
      exportData();
      return;
    }

    if (action === "reset-onboarding") {
      safeStorageRemove(STORAGE.onboarded);
      state.view = "onboarding";
      state.onboardingStep = 0;
      render();
      return;
    }

    if (action === "clear-data") {
      if (window.confirm("确定清空手机上的全部饮品和收藏吗？")) {
        setSavedDrinks([]);
        setFavorites([]);
        safeStorageRemove(STORAGE.preferences);
        safeStorageRemove(STORAGE.aiUsage);
        state.preferences = defaultPreferences();
        showToast("本地数据已清空");
        renderMain();
      }
      return;
    }

    if (action === "mix-back") {
      if (state.mixStep > 1) state.mixStep -= 1;
      else {
        state.view = "main";
        state.activeTab = "home";
      }
      render();
      return;
    }

    if (action === "select-mood") {
      var moodId = target.getAttribute("data-mood");
      var moodIndex = state.form.emotions.indexOf(moodId);
      if (moodIndex >= 0) state.form.emotions.splice(moodIndex,1);
      else if (state.form.emotions.length < 3) state.form.emotions.push(moodId);
      updateMoodUI();
      return;
    }

    if (action === "select-context") {
      var context = target.getAttribute("data-value");
      var contextIndex = state.form.contexts.indexOf(context);
      if (contextIndex >= 0) state.form.contexts.splice(contextIndex,1);
      else state.form.contexts.push(context);
      target.classList.toggle("active");
      return;
    }

    if (action === "select-energy") {
      state.form.energy = Number(target.getAttribute("data-value"));
      selectOnly('[data-action="select-energy"]',state.form.energy,"data-value");
      return;
    }

    if (action === "select-weather") {
      state.form.weather = target.getAttribute("data-value");
      selectOnly('[data-action="select-weather"]',state.form.weather,"data-value");
      return;
    }

    if (action === "select-glass") {
      state.form.glassShape = target.getAttribute("data-value");
      selectOnly('[data-action="select-glass"]',state.form.glassShape,"data-value");
      return;
    }

    if (action === "select-garnish") {
      state.form.garnish = target.getAttribute("data-value");
      selectOnly('[data-action="select-garnish"]',state.form.garnish,"data-value");
      return;
    }

    if (action === "select-desired") {
      state.form.desired = target.getAttribute("data-value");
      selectOnly('[data-action="select-desired"]',state.form.desired,"data-value");
      return;
    }

    if (action === "next-step") {
      state.mixStep += 1;
      render();
      return;
    }

    if (action === "generate-drink") {
      beginMixing();
      return;
    }

    if (action === "result-home") {
      state.view = "main";
      state.activeTab = "home";
      render();
      return;
    }

    if (action === "save-drink") {
      var drinks = getSavedDrinks();
      if (!drinks.some(function (drink) { return drink.id === state.currentDrink.id; })) {
        drinks.unshift(state.currentDrink);
        setSavedDrinks(drinks);
        showToast("已放入情绪酒窖");
      } else showToast("这杯已经收藏过了");
      return;
    }

    if (action === "share-drink") {
      openShare(state.detailDrink || state.currentDrink);
      return;
    }

    if (action === "regenerate-drink") {
      var oldDrink = state.currentDrink;
      state.form.variant = (state.form.variant || 0) + 1;
      state.currentDrink = generateDrink();
      state.currentDrink.id = oldDrink.id;
      state.view = "result";
      render();
      showToast("已重新命名这杯");
      return;
    }

    if (action === "remix-drink") {
      resetForm();
      startMix();
      return;
    }

    if (action === "use-detail-sample") {
      var detailSampleId = target.getAttribute("data-id");
      state.detailDrink = null;
      var sampleOverlay = document.querySelector(".detail-overlay");
      if (sampleOverlay) sampleOverlay.remove();
      useSample(findSample(detailSampleId));
      return;
    }

    if (action === "close-detail") {
      state.detailDrink = null;
      var detailOverlay = document.querySelector(".detail-overlay");
      if (detailOverlay) detailOverlay.remove();
      return;
    }

    if (action === "delete-drink") {
      var deleteId = target.getAttribute("data-id");
      if (window.confirm("确定从酒窖移除这杯吗？")) {
        setSavedDrinks(getSavedDrinks().filter(function (drink) { return String(drink.id) !== String(deleteId); }));
        state.detailDrink = null;
        var detail = document.querySelector(".detail-overlay");
        if (detail) detail.remove();
        showToast("已从酒窖移除");
        renderMain();
      }
      return;
    }

    if (action === "recipe-mode") {
      state.recipeMode = target.getAttribute("data-value") === "zero" ? "zero" : "alcohol";
      updateRecipeCard();
      return;
    }

    if (action === "recipe-serving") {
      state.recipeServings = Number(target.getAttribute("data-value")) || 1;
      updateRecipeCard();
      return;
    }

    if (action === "recipe-level") {
      state.recipeLevel = target.getAttribute("data-value") === "advanced" ? "advanced" : "beginner";
      updateRecipeCard();
      return;
    }

    if (action === "toggle-ingredient") {
      target.classList.toggle("checked");
      return;
    }

    if (action === "reset-checklist") {
      Array.prototype.forEach.call(document.querySelectorAll(".ingredient-list.checklist li"), function (item) { item.classList.remove("checked"); });
      return;
    }

    if (action === "copy-recipe") {
      var recipeDrink = state.detailDrink || state.currentDrink;
      var copyText = recipeText(ensureRealRecipe(recipeDrink));
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(copyText).then(function () { showToast("配方已复制"); }).catch(function () { fallbackCopy(copyText); });
      } else fallbackCopy(copyText);
      return;
    }

    if (action === "close-share") {
      var share = document.getElementById("shareModal");
      if (share) share.remove();
      return;
    }

    if (action === "share-template") {
      state.shareTemplate = target.getAttribute("data-template");
      selectOnly('[data-action="share-template"]',state.shareTemplate,"data-template");
      var modal = document.getElementById("shareModal");
      if (modal && modal._drink) updateSharePreview(modal._drink,state.shareTemplate);
      return;
    }

    if (action === "download-share") {
      downloadShare();
    }
  }

  function handleInput(event) {
    if (event.target.id === "customMood") {
      state.form.customMood = event.target.value;
      var next = document.querySelector('[data-action="next-step"]');
      if (next) next.disabled = !(state.form.emotions.length > 0 || state.form.customMood.trim());
      return;
    }
    if (event.target.id === "eventNote") {
      state.form.note = event.target.value;
      return;
    }
    if (event.target.id === "avoidIngredients") {
      state.preferences.avoid = event.target.value.slice(0,100);
      savePreferences();
      return;
    }
    if (event.target.id === "intensityRange") {
      state.form.intensity = Number(event.target.value);
      var number = document.getElementById("rangeNumber");
      var liquid = document.getElementById("meterLiquid");
      if (number) number.textContent = event.target.value;
      if (liquid) liquid.style.height = Math.max(8,state.form.intensity * .92) + "%";
    }
  }

  window.addEventListener("beforeinstallprompt", function (event) {
    event.preventDefault();
    state.installPrompt = event;
  });

  window.addEventListener("error", function () {
    if (!app || app.children.length) return;
    app.innerHTML = '<main class="fatal"><h2>页面加载遇到问题</h2>' +
      '<p class="muted">请刷新页面，或清除这个网站的缓存后重新打开。</p>' +
      '<button class="primary-btn" onclick="location.reload()">重新加载</button></main>';
  });

  document.addEventListener("click",handleClick);
  document.addEventListener("input",handleInput);

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("./sw.js?v=81").catch(function () {});
    });
  }

  render();
}());
