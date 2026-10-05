import { useState } from 'react';
import type { AssistantSettings } from '@/types';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: AssistantSettings;
  onSave: (s: AssistantSettings) => void;
}

/** 大模型服务商预设（均为 OpenAI 兼容接口） */
const PROVIDERS = [
  {
    key: 'deepseek',
    name: 'DeepSeek',
    baseUrl: 'https://api.deepseek.com/v1',
    model: 'deepseek-chat',
    keyUrl: 'https://platform.deepseek.com/api_keys',
    hint: '国内直连、价格便宜。到 platform.deepseek.com 创建 API Key。',
  },
  {
    key: 'openai',
    name: 'OpenAI',
    baseUrl: 'https://api.openai.com/v1',
    model: 'gpt-4o-mini',
    keyUrl: 'https://platform.openai.com/api-keys',
    hint: '到 platform.openai.com 创建 API Key，需要海外网络环境。',
  },
  {
    key: 'custom',
    name: '自定义',
    baseUrl: '',
    model: '',
    keyUrl: '',
    hint: '任何 OpenAI 兼容接口都可以接入（如 Kimi、通义、Ollama 本地模型等）。',
  },
] as const;

function detectProvider(s: AssistantSettings): string {
  if (s.baseUrl.includes('deepseek')) return 'deepseek';
  if (s.baseUrl.includes('openai.com')) return 'openai';
  if (s.baseUrl) return 'custom';
  return 'deepseek'; // 默认推荐
}

export function SettingsDialog({ open, onOpenChange, settings, onSave }: Props) {
  const [draft, setDraft] = useState<AssistantSettings>(settings);
  const provider = detectProvider(draft);
  const preset = PROVIDERS.find((p) => p.key === provider)!;

  const pickProvider = (key: string) => {
    const p = PROVIDERS.find((x) => x.key === key)!;
    setDraft({
      ...draft,
      baseUrl: p.baseUrl || (key === 'custom' ? draft.baseUrl : p.baseUrl),
      model: p.model || draft.model,
    });
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { setDraft(settings); onOpenChange(o); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>设置</DialogTitle>
          <DialogDescription>
            IsMe 默认使用本地规则引擎，无需联网。接入大模型后，未命中技能的对话将由 AI 回答。所有配置仅保存在本机浏览器中。
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="userName">你的称呼</Label>
            <Input
              id="userName"
              placeholder="怎么称呼你？"
              value={draft.userName}
              onChange={(e) => setDraft({ ...draft, userName: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <Label>大模型服务商（可选）</Label>
            <div className="grid grid-cols-3 gap-1.5">
              {PROVIDERS.map((p) => (
                <Button
                  key={p.key}
                  size="sm"
                  variant={provider === p.key ? 'default' : 'outline'}
                  onClick={() => pickProvider(p.key)}
                >
                  {p.name}
                </Button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              {preset.hint}
              {preset.keyUrl && (
                <a
                  href={preset.keyUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="ml-1 inline-flex items-center gap-0.5 text-primary hover:underline"
                >
                  去创建 Key <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="baseUrl">API Base URL</Label>
            <Input
              id="baseUrl"
              placeholder="https://api.deepseek.com/v1"
              value={draft.baseUrl}
              onChange={(e) => setDraft({ ...draft, baseUrl: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="apiKey">API Key</Label>
            <Input
              id="apiKey"
              type="password"
              placeholder="sk-..."
              value={draft.apiKey}
              onChange={(e) => setDraft({ ...draft, apiKey: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="model">模型</Label>
            <Input
              id="model"
              placeholder={provider === 'deepseek' ? 'deepseek-chat（或 deepseek-reasoner）' : 'gpt-4o-mini'}
              value={draft.model}
              onChange={(e) => setDraft({ ...draft, model: e.target.value })}
            />
            {provider === 'deepseek' && (
              <p className="text-xs text-muted-foreground">
                日常对话用 <code>deepseek-chat</code>（V3）；复杂推理可换 <code>deepseek-reasoner</code>（R1）。
              </p>
            )}
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>取消</Button>
          <Button onClick={() => { onSave(draft); onOpenChange(false); }}>保存</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
