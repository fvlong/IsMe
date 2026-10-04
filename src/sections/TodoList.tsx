import type { TodoItem } from '@/types';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

interface Props {
  todos: TodoItem[];
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
  compact?: boolean;
}

export function TodoList({ todos, onToggle, onRemove, compact }: Props) {
  if (todos.length === 0) {
    return <p className="py-4 text-center text-sm text-muted-foreground">暂无待办，对我说「提醒我 …」试试。</p>;
  }
  const sorted = [...todos].sort((a, b) => Number(a.done) - Number(b.done) || b.createdAt - a.createdAt);
  const list = compact ? sorted.slice(0, 5) : sorted;
  return (
    <ul className="space-y-1.5">
      {list.map((todo) => (
        <li key={todo.id} className="group flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-accent/50">
          <Checkbox checked={todo.done} onCheckedChange={() => onToggle(todo.id)} id={`t-${todo.id}`} />
          <label
            htmlFor={`t-${todo.id}`}
            className={`flex-1 cursor-pointer text-sm ${todo.done ? 'text-muted-foreground line-through' : ''}`}
          >
            {todo.text}
          </label>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 opacity-0 group-hover:opacity-100"
            onClick={() => onRemove(todo.id)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </li>
      ))}
      {compact && sorted.length > 5 && (
        <li className="px-2 text-xs text-muted-foreground">还有 {sorted.length - 5} 条，见右侧「待办」面板</li>
      )}
    </ul>
  );
}
