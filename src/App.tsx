import { useState } from 'react';
import type { AssistantSettings, ChatMessage, NoteItem, TodoItem } from '@/types';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { ChatPanel } from '@/sections/ChatPanel';
import { TodoList } from '@/sections/TodoList';
import { NotesList } from '@/sections/NotesList';
import { Pomodoro } from '@/sections/Pomodoro';
import { SettingsDialog } from '@/sections/SettingsDialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Settings, ShieldCheck, Sparkles } from 'lucide-react';

export default function App() {
  const [messages, setMessages] = useLocalStorage<ChatMessage[]>('isme.messages', []);
  const [todos, setTodos] = useLocalStorage<TodoItem[]>('isme.todos', []);
  const [notes, setNotes] = useLocalStorage<NoteItem[]>('isme.notes', []);
  const [settings, setSettings] = useLocalStorage<AssistantSettings>('isme.settings', {
    baseUrl: '',
    apiKey: '',
    model: 'gpt-4o-mini',
    userName: '',
  });
  const [settingsOpen, setSettingsOpen] = useState(false);

  const pendingCount = todos.filter((t) => !t.done).length;

  return (
    <div className="flex h-screen flex-col bg-background text-foreground">
      {/* 顶栏 */}
      <header className="flex items-center justify-between border-b px-4 py-2.5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Sparkles className="h-4.5 w-4.5" />
          </div>
          <div>
            <h1 className="text-sm font-semibold leading-tight">IsMe</h1>
            <p className="text-xs text-muted-foreground leading-tight">个人超级助理</p>
          </div>
          <Badge variant="secondary" className="ml-2 gap-1 text-xs">
            <ShieldCheck className="h-3 w-3" /> 本地优先
          </Badge>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setSettingsOpen(true)} title="设置">
          <Settings className="h-4.5 w-4.5" />
        </Button>
      </header>

      {/* 主区域：对话 + 技能面板 */}
      <div className="flex min-h-0 flex-1">
        <main className="min-w-0 flex-1">
          <ChatPanel
            messages={messages}
            setMessages={setMessages}
            todos={todos}
            setTodos={setTodos}
            notes={notes}
            setNotes={setNotes}
            settings={settings}
          />
        </main>

        <aside className="hidden w-80 shrink-0 border-l lg:block">
          <Tabs defaultValue="todos" className="flex h-full flex-col">
            <TabsList className="mx-3 mt-3 grid grid-cols-3">
              <TabsTrigger value="todos">
                待办{pendingCount > 0 && <span className="ml-1 text-xs text-primary">({pendingCount})</span>}
              </TabsTrigger>
              <TabsTrigger value="notes">笔记</TabsTrigger>
              <TabsTrigger value="focus">专注</TabsTrigger>
            </TabsList>
            <div className="min-h-0 flex-1 overflow-y-auto p-3">
              <TabsContent value="todos" className="mt-0">
                <TodoList
                  todos={todos}
                  onToggle={(id) => setTodos((p) => p.map((t) => (t.id === id ? { ...t, done: !t.done } : t)))}
                  onRemove={(id) => setTodos((p) => p.filter((t) => t.id !== id))}
                />
              </TabsContent>
              <TabsContent value="notes" className="mt-0">
                <NotesList notes={notes} onRemove={(id) => setNotes((p) => p.filter((n) => n.id !== id))} />
              </TabsContent>
              <TabsContent value="focus" className="mt-0 pt-4">
                <Pomodoro />
              </TabsContent>
            </div>
          </Tabs>
        </aside>
      </div>

      <SettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        settings={settings}
        onSave={setSettings}
      />
    </div>
  );
}
