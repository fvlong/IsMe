export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  ts: number;
  /** 消息携带的交互组件类型 */
  widget?: 'pomodoro' | 'todos' | 'notes' | 'weather' | 'help';
  /** 天气卡片数据（widget === 'weather' 时使用） */
  payload?: unknown;
}

export interface TodoItem {
  id: string;
  text: string;
  done: boolean;
  createdAt: number;
}

export interface NoteItem {
  id: string;
  text: string;
  createdAt: number;
}

export interface AssistantSettings {
  /** OpenAI 兼容接口地址，留空则使用纯本地规则引擎 */
  baseUrl: string;
  apiKey: string;
  model: string;
  userName: string;
}

export interface WeatherInfo {
  city: string;
  temperature: number;
  apparent: number;
  humidity: number;
  windSpeed: number;
  weatherCode: number;
  description: string;
}
