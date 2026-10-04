import type { NoteItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

interface Props {
  notes: NoteItem[];
  onRemove: (id: string) => void;
  compact?: boolean;
}

export function NotesList({ notes, onRemove, compact }: Props) {
  if (notes.length === 0) {
    return <p className="py-4 text-center text-sm text-muted-foreground">暂无笔记，对我说「记一下 …」试试。</p>;
  }
  const list = compact ? notes.slice(0, 4) : notes;
  return (
    <ul className="space-y-2">
      {list.map((note) => (
        <li key={note.id} className="group relative rounded-md border bg-card px-3 py-2">
          <p className="whitespace-pre-wrap text-sm">{note.text}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {new Date(note.createdAt).toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </p>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1 h-6 w-6 opacity-0 group-hover:opacity-100"
            onClick={() => onRemove(note.id)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </li>
      ))}
      {compact && notes.length > 4 && (
        <li className="px-2 text-xs text-muted-foreground">还有 {notes.length - 4} 条，见右侧「笔记」面板</li>
      )}
    </ul>
  );
}
