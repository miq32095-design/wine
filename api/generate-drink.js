const DEFAULT_BASE_URL = "https://dashscope.aliyuncs.com/compatible-mode/v1";
const DEFAULT_MODEL = "qwen3.7-plus";

const GLASSES = new Set(["hurricane", "goblet", "highball", "martini"]);
const GARNISHES = new Set(["mint", "citrus", "berry", "none"]);
const MOOD_IDS = new Set([
  "happy", "calm", "tired", "anxious", "wronged", "excited",
  "lonely", "irritable", "blank", "hopeful", "romantic", "chaotic"
]);

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store"
    }
  });
}

function cleanText(value, max = 160) {
  return String(value ?? "").replace(/\s+/g, " ").trim().slice(0, max);
}

function cleanStringList(value, maxItems = 8, maxLength = 40) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => cleanText(item, maxLength))
    .filter(Boolean)
    .slice(0, maxItems);
}

function validHex(value, fallback) {
  const text = cleanText(value, 12);
  return /^#[0-9a-fA-F]{6}$/.test(text) ? text : fallback;
}

function clamp(value, min, max, fallback) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(max, Math.max(min, Math.round(number)));
}

function normalizeEmotionalRecipe(value, emotions) {
  let items = Array.isArray(value) ? value : [];
  items = items.slice(0, 4).map((item, index) => ({
    label: cleanText(item?.label || emotions[index]?.label || "情绪", 12),
    value: clamp(item?.value, 1, 100, index === 0 ? 60 : 40)
  })).filter((item) => item.label);

  if (!items.length) {
    const safe = emotions.length ? emotions.slice(0, 3) : [{ label: "空白" }];
    items = safe.map((emotion, index) => ({
      label: cleanText(emotion.label || emotion.id || "情绪", 12),
      value: index === 0 ? 60 : Math.round(40 / Math.max(1, safe.length - 1))
    }));
  }

  const total = items.reduce((sum, item) => sum + item.value, 0) || 1;
  let running = 0;
  items = items.map((item, index) => {
    const value = index === items.length - 1
      ? 100 - running
      : Math.max(1, Math.round(item.value / total * 100));
    running += value;
    return { ...item, value };
  });
  if (items[items.length - 1].value < 1) {
    items[0].value += items[items.length - 1].value - 1;
    items[items.length - 1].value = 1;
  }
  return items;
}

function normalizeVariant(value, fallbackIngredients, fallbackSteps) {
  const ingredients = cleanStringList(value?.ingredients, 9, 80);
  const steps = cleanStringList(value?.steps, 7, 120);
  return {
    ingredients: ingredients.length >= 3 ? ingredients : fallbackIngredients,
    steps: steps.length >= 2 ? steps : fallbackSteps
  };
}

function validateResult(raw, input) {
  if (!raw || typeof raw !== "object") throw new Error("模型返回的 JSON 不是对象");
  const primaryMood = input.emotions?.[0]?.id || "blank";
  const defaultAlcohol = {
    ingredients: ["金酒 35ml", "柠檬汁 12ml", "蜂蜜糖浆 10ml", "苏打水 70ml"],
    steps: ["杯中加入八分满块冰。", "加入除苏打水外的材料并轻搅。", "补入苏打水，再轻轻提一次。"]
  };
  const defaultZero = {
    ingredients: ["冷泡茉莉茶 60ml", "柠檬汁 12ml", "蜂蜜糖浆 10ml", "苏打水 80ml"],
    steps: ["杯中加入八分满块冰。", "加入冷泡茶、柠檬汁和糖浆。", "补入苏打水并轻轻搅拌。"]
  };

  const visual = raw.visual || {};
  const metrics = raw.metrics || {};
  const recipe = raw.realRecipe || {};
  const glassShape = GLASSES.has(visual.glassShape) ? visual.glassShape : input.glassShape;
  const garnish = GARNISHES.has(visual.garnish) ? visual.garnish : input.garnish;

  return {
    name: cleanText(raw.name, 28) || "今日未命名特调",
    subtitle: cleanText(raw.subtitle, 90) || "把今天没有说完的部分，慢慢留在杯底。",
    tastingNote: cleanText(raw.tastingNote, 260) || "入口轻盈，随后出现一点柔和的酸甜，余味慢慢安静下来。",
    flavors: cleanStringList(raw.flavors, 5, 12).length
      ? cleanStringList(raw.flavors, 5, 12)
      : ["柑橘", "气泡", "晚风"],
    emotionalRecipe: normalizeEmotionalRecipe(raw.emotionalRecipe, input.emotions || []),
    visual: {
      primaryColor: validHex(visual.primaryColor, input.primaryColor || "#ef8cab"),
      secondaryColor: validHex(visual.secondaryColor, input.secondaryColor || "#65cbd7"),
      glassShape,
      garnish
    },
    metrics: {
      spirit: clamp(metrics.spirit, 0, 99, 55),
      bubble: clamp(metrics.bubble, 0, 99, 60),
      aftertaste: cleanText(metrics.aftertaste, 24) || "今晚",
      setting: cleanText(metrics.setting, 64) || "在安静的角落慢慢喝"
    },
    realRecipe: {
      title: cleanText(recipe.title, 54) || "今日特调 · 现实尝试版",
      style: cleanText(recipe.style, 36) || "House Special",
      strength: cleanText(recipe.strength, 24) || "中低酒精",
      technique: cleanText(recipe.technique, 28) || "加冰直调",
      ice: cleanText(recipe.ice, 28) || "块冰 8 分满",
      glass: cleanText(recipe.glass, 24) || ({
        hurricane: "飓风杯", goblet: "圆肚杯", highball: "高球杯", martini: "马天尼杯"
      }[glassShape] || "飓风杯"),
      garnish: cleanText(recipe.garnish, 36) || "柑橘片或薄荷",
      pairing: cleanText(recipe.pairing, 100) || "酸甜平衡，适合慢慢饮用。",
      mocktail: cleanText(recipe.mocktail, 130) || "使用冷泡茶替代基酒，并适量增加苏打水。",
      note: cleanText(recipe.note, 180) || "先从较少糖量开始，再按个人口味调整。",
      primaryMoodId: MOOD_IDS.has(recipe.primaryMoodId) ? recipe.primaryMoodId : primaryMood,
      alcohol: normalizeVariant(recipe.alcohol, defaultAlcohol.ingredients, defaultAlcohol.steps),
      zero: normalizeVariant(recipe.zero, defaultZero.ingredients, defaultZero.steps)
    }
  };
}

function buildPrompt(input) {
  const preferences = input.preferences || {};
  return `你是 Mood Mixer 的创意调酒师。请根据用户输入，生成一杯具有柔和晕染、轻涂鸦气质的情绪特调，并严格只返回 JSON 对象。

产品定位：轻娱乐、陪伴感、不过度鸡汤，不进行心理诊断或医疗建议。
现实配方要求：必须可在家中尝试；材料常见；酒精版只使用一种基酒，基酒建议 25–45ml；禁止烈酒点火、干冰、药物、能量饮料或危险材料；同时给出完整无酒精版。
文案风格：中文，年轻、克制、有一点幽默和画面感，避免模板化。

允许枚举：
- visual.glassShape: hurricane | goblet | highball | martini
- visual.garnish: mint | citrus | berry | none

用户输入：
${JSON.stringify(input, null, 2)}

个人风味偏好：${JSON.stringify(preferences)}

请返回以下 JSON 结构，不要使用 Markdown，不要输出 JSON 以外的任何内容：
{
  "name": "饮品名称，最多14个汉字",
  "subtitle": "一句副标题",
  "tastingNote": "80至150字的调酒师品鉴",
  "flavors": ["3至5个风味词"],
  "emotionalRecipe": [{"label":"情绪名","value":60}],
  "visual": {
    "primaryColor": "#RRGGBB",
    "secondaryColor": "#RRGGBB",
    "glassShape": "hurricane",
    "garnish": "mint"
  },
  "metrics": {
    "spirit": 55,
    "bubble": 60,
    "aftertaste": "今晚",
    "setting": "建议饮用场景"
  },
  "realRecipe": {
    "title": "饮品名 · 现实尝试版",
    "style": "英文或中文风格名称",
    "strength": "低酒精或中低酒精",
    "technique": "加冰直调或摇和后加气泡",
    "ice": "冰型",
    "glass": "推荐杯型中文",
    "garnish": "装饰建议",
    "pairing": "风味提示",
    "mocktail": "一句无酒精替代说明",
    "note": "个性化调酒小纸条",
    "primaryMoodId": "${input.emotions?.[0]?.id || "blank"}",
    "alcohol": {
      "ingredients": ["金酒 35ml"],
      "steps": ["步骤1"]
    },
    "zero": {
      "ingredients": ["冷泡茶 60ml"],
      "steps": ["步骤1"]
    }
  }
}`;
}

function endpointFromEnv() {
  const base = String(process.env.DASHSCOPE_BASE_URL || DEFAULT_BASE_URL).replace(/\/+$/, "");
  return base.endsWith("/chat/completions") ? base : `${base}/chat/completions`;
}

export async function GET() {
  return json({
    ok: true,
    configured: Boolean(process.env.DASHSCOPE_API_KEY),
    model: process.env.DASHSCOPE_MODEL || DEFAULT_MODEL
  });
}

export async function POST(request) {
  if (!process.env.DASHSCOPE_API_KEY) {
    return json({ ok: false, code: "AI_NOT_CONFIGURED", message: "DASHSCOPE_API_KEY 未配置" }, 503);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, code: "INVALID_JSON", message: "请求体不是有效 JSON" }, 400);
  }

  const input = {
    emotions: Array.isArray(body.emotions) ? body.emotions.slice(0, 3).map((item) => ({
      id: MOOD_IDS.has(item?.id) ? item.id : "blank",
      label: cleanText(item?.label, 12),
      flavors: cleanStringList(item?.flavors, 4, 12)
    })) : [],
    customMood: cleanText(body.customMood, 40),
    intensity: clamp(body.intensity, 0, 100, 58),
    contexts: cleanStringList(body.contexts, 5, 18),
    note: cleanText(body.note, 220),
    energy: clamp(body.energy, 0, 100, 50),
    weather: cleanText(body.weather, 12),
    desired: cleanText(body.desired, 24),
    glassShape: GLASSES.has(body.glassShape) ? body.glassShape : "hurricane",
    garnish: GARNISHES.has(body.garnish) ? body.garnish : "mint",
    primaryColor: validHex(body.primaryColor, "#ef8cab"),
    secondaryColor: validHex(body.secondaryColor, "#65cbd7"),
    preferences: {
      tastes: cleanStringList(body.preferences?.tastes, 6, 12),
      alcohol: cleanText(body.preferences?.alcohol, 18),
      avoid: cleanText(body.preferences?.avoid, 100)
    }
  };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  const model = process.env.DASHSCOPE_MODEL || DEFAULT_MODEL;
  const prompt = buildPrompt(input);
  let lastError = null;

  try {
    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        const response = await fetch(endpointFromEnv(), {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${process.env.DASHSCOPE_API_KEY}`,
            "Content-Type": "application/json"
          },
          signal: controller.signal,
          body: JSON.stringify({
            model,
            messages: [
              { role: "system", content: "你是严谨而有创意的调酒师。必须只返回可解析的 JSON。" },
              { role: "user", content: prompt }
            ],
            response_format: { type: "json_object" },
            enable_thinking: false,
            temperature: attempt === 0 ? 0.9 : 0.55,
            max_tokens: 2200
          })
        });

        const payload = await response.json().catch(() => ({}));
        if (!response.ok) {
          const message = payload?.error?.message || payload?.message || `上游接口错误 ${response.status}`;
          throw new Error(message);
        }

        const content = payload?.choices?.[0]?.message?.content;
        if (!content) throw new Error("模型未返回内容");
        const parsed = JSON.parse(content);
        const data = validateResult(parsed, input);
        return json({ ok: true, data, model, usage: payload.usage || null });
      } catch (error) {
        lastError = error;
        if (error?.name === "AbortError") break;
      }
    }
  } finally {
    clearTimeout(timeout);
  }

  const timedOut = lastError?.name === "AbortError";
  return json({
    ok: false,
    code: timedOut ? "AI_TIMEOUT" : "AI_FAILED",
    message: timedOut ? "AI 请求超时" : cleanText(lastError?.message || "AI 生成失败", 180)
  }, timedOut ? 504 : 502);
}
