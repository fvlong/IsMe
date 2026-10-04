import type { AssistantSettings, ChatMessage, WeatherInfo } from '@/types';

export interface SkillContext {
  addTodo: (text: string) => number;
  clearDoneTodos: () => number;
  addNote: (text: string) => void;
  settings: AssistantSettings;
}

interface SkillResult {
  text: string;
  widget?: ChatMessage['widget'];
  payload?: unknown;
}

const uid = () => Math.random().toString(36).slice(2, 10);

/* ---------------- 天气（Open-Meteo，无需 API Key） ---------------- */

const WMO: Record<number, string> = {
  0: '晴', 1: '大致晴', 2: '局部多云', 3: '阴',
  45: '雾', 48: '冻雾',
  51: '小毛毛雨', 53: '毛毛雨', 55: '大毛毛雨',
  61: '小雨', 63: '中雨', 65: '大雨',
  66: '冻雨', 67: '强冻雨',
  71: '小雪', 73: '中雪', 75: '大雪', 77: '雪粒',
  80: '小阵雨', 81: '阵雨', 82: '强阵雨',
  85: '小阵雪', 86: '大阵雪',
  95: '雷暴', 96: '雷暴伴冰雹', 99: '强雷暴伴冰雹',
};

async function fetchWeather(city: string): Promise<WeatherInfo> {
  const geo = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=zh&format=json`,
  ).then((r) => r.json());
  const place = geo?.results?.[0];
  if (!place) throw new Error(`找不到城市「${city}」`);

  const wx = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}` +
      `&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&timezone=auto`,
  ).then((r) => r.json());

  const c = wx.current;
  return {
    city: place.name + (place.admin1 ? ` · ${place.admin1}` : ''),
    temperature: Math.round(c.temperature_2m),
    apparent: Math.round(c.apparent_temperature),
    humidity: c.relative_humidity_2m,
    windSpeed: Math.round(c.wind_speed_10m),
    weatherCode: c.weather_code,
    description: WMO[c.weather_code] ?? '未知',
  };
}

/* ---------------- 计算器（安全表达式求值） ---------------- */

function evalExpression(expr: string): number | null {
  const cleaned = expr
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/（/g, '(')
    .replace(/）/g, ')')
    .replace(/\s+/g, '');
  if (!/^[\d+\-*/().%]+$/.test(cleaned)) return null;
  try {
    // 仅含数字与运算符，Function 求值是安全的
    const result = Function(`"use strict"; return (${cleaned})`)() as number;
    if (typeof result !== 'number' || !Number.isFinite(result)) return null;
    return Math.round(result * 1e10) / 1e10;
  } catch {
    return null;
  }
}

/* ---------------- 技能路由（借鉴 Leon 的意图→技能架构） ---------------- */

async function route(text: string, ctx: SkillContext): Promise<SkillResult | null> {
  const t = text.trim();

  // 帮助
  if (/^(帮助|help|你能做什么|会什么|功能)/i.test(t)) {
    return { text: '这是我目前掌握的技能：', widget: 'help' };
  }

  // 待办
  const todoMatch = t.match(/^(?:提醒我|待办|todo|添加待办|记个任务)[:：\s]*(.+)$/i);
  if (todoMatch) {
    const item = todoMatch[1].trim();
    if (item) {
      ctx.addTodo(item);
      return { text: `好的，已加入待办清单：「${item}」。`, widget: 'todos' };
    }
  }
  if (/^(查看|看看|显示)?(我的)?待办(清单|列表)?$/.test(t) || /^todos?$/i.test(t)) {
    return { text: '这是你当前的待办清单：', widget: 'todos' };
  }
  if (/清理已完成|清除已完成/.test(t)) {
    const n = ctx.clearDoneTodos();
    return { text: n > 0 ? `已清理 ${n} 条完成的待办。` : '没有已完成的待办需要清理。' };
  }

  // 笔记
  const noteMatch = t.match(/^(?:记一下|笔记|note|记录)[:：\s]*(.+)$/i);
  if (noteMatch) {
    const note = noteMatch[1].trim();
    if (note) {
      ctx.addNote(note);
      return { text: `已记下来：「${note}」。`, widget: 'notes' };
    }
  }
  if (/^(查看|看看|显示)?(我的)?笔记$/.test(t) || /^notes?$/i.test(t)) {
    return { text: '这是你最近的笔记：', widget: 'notes' };
  }

  // 天气
  const weatherMatch = t.match(/^(?:查)?(?:一下)?(.+?)?的?天气$/) || t.match(/^weather\s+(.+)$/i);
  if (weatherMatch) {
    const city = (weatherMatch[1] || '北京').trim() || '北京';
    try {
      const info = await fetchWeather(city);
      return {
        text: `${info.city}现在${info.description}，气温 ${info.temperature}°C。`,
        widget: 'weather',
        payload: info,
      };
    } catch (e) {
      return { text: `天气查询失败：${e instanceof Error ? e.message : '网络异常'}` };
    }
  }

  // 番茄钟
  if (/番茄钟|专注|pomodoro/i.test(t)) {
    return { text: '番茄钟已就绪，点击开始专注：', widget: 'pomodoro' };
  }

  // 计算
  const calcMatch = t.match(/^(?:计算|算一下|等于多少|calc)[:：\s]*(.+)$/i);
  const expr = calcMatch ? calcMatch[1] : /^[\d\s+\-*/().%×÷（）]+[=？?]?$/.test(t) ? t : null;
  if (expr) {
    const result = evalExpression(expr.replace(/[=？?]/g, ''));
    if (result !== null) return { text: `计算结果：${expr.replace(/[=？?\s]/g, '')} = **${result}**` };
    return { text: '这个表达式我算不出来，换个写法试试？' };
  }

  // 时间日期
  if (/几点|现在时间|当前时间/.test(t)) {
    const now = new Date();
    return {
      text: `现在是 ${now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}。`,
    };
  }
  if (/今天(是)?(几号|星期|日期)|日期/.test(t)) {
    return {
      text: `今天是 ${new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}。`,
    };
  }

  // 问候
  if (/^(你好|hi|hello|嗨|在吗)/i.test(t)) {
    const name = ctx.settings.userName ? `，${ctx.settings.userName}` : '';
    return {
      text: `你好${name}！我是 IsMe，你的个人超级助理。可以直接跟我说话，比如「提醒我下午三点开会」「北京天气」「计算 128*46」，输入「帮助」查看全部技能。`,
    };
  }

  return null; // 未命中技能 → 交给 LLM 或兜底
}

/* ---------------- LLM 兜底（OpenAI 兼容接口，可选） ---------------- */

async function askLLM(text: string, settings: AssistantSettings): Promise<string | null> {
  if (!settings.baseUrl || !settings.apiKey) return null;
  try {
    const res = await fetch(`${settings.baseUrl.replace(/\/$/, '')}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${settings.apiKey}`,
      },
      body: JSON.stringify({
        model: settings.model || 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content:
              '你是 IsMe，一个本地优先的个人超级助理。回答简洁、有用、中文为主。',
          },
          { role: 'user', content: text },
        ],
      }),
    });
    const data = await res.json();
    return data?.choices?.[0]?.message?.content ?? null;
  } catch {
    return null;
  }
}

/* ---------------- 入口 ---------------- */

export async function processInput(text: string, ctx: SkillContext): Promise<ChatMessage[]> {
  const replies: ChatMessage[] = [];
  const push = (r: SkillResult) =>
    replies.push({ id: uid(), role: 'assistant', text: r.text, ts: Date.now(), widget: r.widget, payload: r.payload });

  const skillResult = await route(text, ctx);
  if (skillResult) {
    push(skillResult);
    return replies;
  }

  const llm = await askLLM(text, ctx.settings);
  if (llm) {
    push({ text: llm });
  } else {
    push({
      text: '这句话我还没有对应的技能。输入「帮助」看看我会什么；也可以在右上角设置里接入任意 OpenAI 兼容的大模型，让我变得更聪明。',
      widget: 'help',
    });
  }
  return replies;
}
