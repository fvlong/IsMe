const SKILLS: { cmd: string; desc: string }[] = [
  { cmd: '提醒我 明天下午三点开会', desc: '添加待办事项' },
  { cmd: '查看待办 / 清理已完成', desc: '管理待办清单' },
  { cmd: '记一下 周四给客户回电话', desc: '快速记录笔记' },
  { cmd: '查看笔记', desc: '浏览我的笔记' },
  { cmd: '上海天气', desc: '查询实时天气（Open-Meteo）' },
  { cmd: '计算 128 * 46 + 9', desc: '安全表达式计算' },
  { cmd: '现在几点 / 今天几号', desc: '时间与日期' },
  { cmd: '番茄钟', desc: '25 分钟专注计时' },
];

export function HelpCard({ onTry }: { onTry?: (cmd: string) => void }) {
  return (
    <div className="grid gap-1.5 sm:grid-cols-2">
      {SKILLS.map((s) => (
        <button
          key={s.cmd}
          onClick={() => onTry?.(s.cmd.split(' /')[0])}
          className="rounded-md border bg-card px-3 py-2 text-left transition-colors hover:bg-accent"
        >
          <p className="text-sm font-medium">{s.cmd}</p>
          <p className="text-xs text-muted-foreground">{s.desc}</p>
        </button>
      ))}
    </div>
  );
}
