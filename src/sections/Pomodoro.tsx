import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Pause, Play, RotateCcw } from 'lucide-react';

const MODES = [
  { key: 'focus', label: '专注', minutes: 25 },
  { key: 'short', label: '短休息', minutes: 5 },
  { key: 'long', label: '长休息', minutes: 15 },
] as const;

type ModeKey = (typeof MODES)[number]['key'];

export function Pomodoro({ compact = false }: { compact?: boolean }) {
  const [mode, setMode] = useState<ModeKey>('focus');
  const total = MODES.find((m) => m.key === mode)!.minutes * 60;
  const [left, setLeft] = useState(total);
  const [running, setRunning] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    setLeft(total);
    setRunning(false);
  }, [total]);

  useEffect(() => {
    if (!running) return;
    timer.current = window.setInterval(() => {
      setLeft((s) => {
        if (s <= 1) {
          setRunning(false);
          try {
            new Notification('IsMe 番茄钟', { body: mode === 'focus' ? '专注结束，休息一下吧！' : '休息结束，继续加油！' });
          } catch { /* 无通知权限时忽略 */ }
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => { if (timer.current) window.clearInterval(timer.current); };
  }, [running, mode]);

  const mm = String(Math.floor(left / 60)).padStart(2, '0');
  const ss = String(left % 60).padStart(2, '0');
  const pct = ((total - left) / total) * 100;

  return (
    <div className={compact ? 'space-y-3' : 'space-y-4'}>
      <div className="flex gap-1.5">
        {MODES.map((m) => (
          <Button
            key={m.key}
            size="sm"
            variant={mode === m.key ? 'default' : 'outline'}
            className="flex-1 text-xs"
            onClick={() => setMode(m.key)}
          >
            {m.label} {m.minutes}′
          </Button>
        ))}
      </div>
      <div className="text-center">
        <div className="font-mono text-5xl font-semibold tabular-nums tracking-tight">
          {mm}:{ss}
        </div>
        <Progress value={pct} className="mt-3 h-1.5" />
      </div>
      <div className="flex justify-center gap-2">
        <Button size="sm" onClick={() => setRunning((r) => !r)}>
          {running ? <Pause className="mr-1 h-4 w-4" /> : <Play className="mr-1 h-4 w-4" />}
          {running ? '暂停' : '开始'}
        </Button>
        <Button size="sm" variant="outline" onClick={() => { setRunning(false); setLeft(total); }}>
          <RotateCcw className="mr-1 h-4 w-4" /> 重置
        </Button>
      </div>
    </div>
  );
}
