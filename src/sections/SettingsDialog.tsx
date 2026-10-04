import { useState } from 'react';
import type { AssistantSettings } from '@/types';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: AssistantSettings;
  onSave: (s: AssistantSettings) => void;
}

export function SettingsDialog({ open, onOpenChange, settings, onSave }: Props) {
  const [draft, setDraft] = useState<AssistantSettings>(settings);

  return (
    <Dialog open={open} onOpenChange={(o) => { setDraft(settings); onOpenChange(o); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>设置</DialogTitle>
          <DialogDescription>
            IsMe 默认使用本地规则引擎，无需联网。接入任意 OpenAI 兼容接口后，未命中技能的对话将由大模型回答。所有配置仅保存在本机浏览器中。
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
            <Label htmlFor="baseUrl">API Base URL（可选）</Label>
            <Input
              id="baseUrl"
              placeholder="https://api.openai.com/v1"
              value={draft.baseUrl}
              onChange={(e) => setDraft({ ...draft, baseUrl: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="apiKey">API Key（可选）</Label>
            <Input
              id="apiKey"
              type="password"
              placeholder="sk-..."
              value={draft.apiKey}
              onChange={(e) => setDraft({ ...draft, apiKey: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="model">模型（可选）</Label>
            <Input
              id="model"
              placeholder="gpt-4o-mini"
              value={draft.model}
              onChange={(e) => setDraft({ ...draft, model: e.target.value })}
            />
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
