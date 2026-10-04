import { useEffect, useRef, useState } from 'react';
import type { AssistantSettings, ChatMessage, NoteItem, TodoItem, WeatherInfo } from '@/types';
import { processInput } from '@/lib/assistant';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Sparkles, Trash2 } from 'lucide-react';
import { TodoList } from '@/sections/TodoList';
import { NotesList } from '@/sections/NotesList';
import { WeatherCard } from '@/sections/WeatherCard';
import { Pomodoro } from '@/sections/Pomodoro';
import { HelpCard } from '@/sections/HelpCard';

interface Props {
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  todos: TodoItem[];
  setTodos: React.Dispatch<React.SetStateAction<TodoItem[]>>;
  notes: NoteItem[];
  setNotes: React.Dispatch<React.SetStateAction<NoteItem[]>>;
  settings: AssistantSettings;
}

const uid = () => Math.random().toString(36).slice(2, 10);

/** 极简 markdown：**加粗** 与换行 */
function renderText(text: string) {
  return text.split('\n').map((line, i) => (
    <span key={i}>
      {i > 0 && <br />}
      {line.split(/(\*\*[^*]+\*\*)/g).map((seg, j) =>
        seg.startsWith('**') && seg.endsWith('**') ? (
          <strong key={j}>{seg.slice(2, -2)}</strong>
        ) : (
          <span key={j}>{seg}</span>
        ),
      )}
    </span>
  ));
}

export function ChatPanel({ messages, setMessages, todos, setTodos, notes, setNotes, settings }: Props) {
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, thinking]);

  const send = async (raw?: string) => {
    const text = (raw ?? input).trim();
    if (!text || thinking) return;
    setInput('');
    setMessages((m) => [...m, { id: uid(), role: 'user', text, ts: Date.now() }]);
    setThinking(true);
    try {
      const replies = await processInput(text, {
        addTodo: (t) => { setTodos((prev) => [{ id: uid(), text: t, done: false, createdAt: Date.now() }, ...prev]); return 1; },
        clearDoneTodos: () => {
          let n = 0;
          setTodos((prev) => { n = prev.filter((t) => t.done).length; return prev.filter((t) => !t.done); });
          return n;
        },
        addNote: (t) => setNotes((prev) => [{ id: uid(), text: t, createdAt: Date.now() }, ...prev]),
        settings,
      });
      setMessages((m) => [...m, ...replies]);
    } finally {
      setThinking(false);
    }
  };

  return (
    <div className="flex h-full flex-col">
      <ScrollArea className="flex-1 px-4">
        <div className="mx-auto max-w-2xl space-y-5 py-6">
          {messages.length === 0 && (
            <div className="pt-16 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                <Sparkles className="h-7 w-7" />
              </div>
              <h2 className="text-xl font-semibold">我是 IsMe，你的个人超级助理</h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                本地优先、隐私安全。直接下达指令，或点击下面的技能卡片快速体验。
              </p>
              <div className="mt-6 text-left">
                <HelpCard onTry={(cmd) => void send(cmd)} />
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'border bg-card'
                }`}
              >
                {renderText(msg.text)}
                {msg.widget && (
                  <div className="mt-3 min-w-64">
                    {msg.widget === 'todos' && (
                      <TodoList
                        todos={todos}
                        compact
                        onToggle={(id) => setTodos((p) => p.map((t) => (t.id === id ? { ...t, done: !t.done } : t)))}
                        onRemove={(id) => setTodos((p) => p.filter((t) => t.id !== id))}
                      />
                    )}
                    {msg.widget === 'notes' && (
                      <NotesList notes={notes} compact onRemove={(id) => setNotes((p) => p.filter((n) => n.id !== id))} />
                    )}
                    {msg.widget === 'weather' && <WeatherCard info={msg.payload as WeatherInfo} />}
                    {msg.widget === 'pomodoro' && <Pomodoro compact />}
                    {msg.widget === 'help' && <HelpCard onTry={(cmd) => void send(cmd)} />}
                  </div>
                )}
              </div>
            </div>
          ))}

          {thinking && (
            <div className="flex justify-start">
              <div className="rounded-2xl border bg-card px-4 py-3 text-sm text-muted-foreground">
                <span className="inline-flex gap-1">
                  <span className="animate-bounce">·</span>
                  <span className="animate-bounce [animation-delay:120ms]">·</span>
                  <span className="animate-bounce [animation-delay:240ms]">·</span>
                </span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      <div className="border-t p-4">
        <div className="mx-auto flex max-w-2xl gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && void send()}
            placeholder="对我说点什么，例如「提醒我明早 9 点打卡」…"
            className="flex-1"
          />
          {messages.length > 0 && (
            <Button variant="outline" size="icon" title="清空对话" onClick={() => setMessages([])}>
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
          <Button size="icon" onClick={() => void send()} disabled={!input.trim() || thinking}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
