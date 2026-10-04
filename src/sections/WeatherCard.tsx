import type { WeatherInfo } from '@/types';
import { CloudRain, Droplets, Sun, Thermometer, Wind } from 'lucide-react';

export function WeatherCard({ info }: { info: WeatherInfo }) {
  const Icon = /雨|雪|雷/.test(info.description) ? CloudRain : Sun;
  return (
    <div className="rounded-lg border bg-gradient-to-br from-sky-500/10 to-indigo-500/10 p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{info.city}</p>
          <p className="mt-1 text-3xl font-semibold">{info.temperature}°C</p>
          <p className="mt-0.5 flex items-center gap-1 text-sm">
            <Icon className="h-4 w-4" /> {info.description}
          </p>
        </div>
        <div className="space-y-1.5 text-right text-xs text-muted-foreground">
          <p className="flex items-center justify-end gap-1"><Thermometer className="h-3.5 w-3.5" /> 体感 {info.apparent}°C</p>
          <p className="flex items-center justify-end gap-1"><Droplets className="h-3.5 w-3.5" /> 湿度 {info.humidity}%</p>
          <p className="flex items-center justify-end gap-1"><Wind className="h-3.5 w-3.5" /> 风速 {info.windSpeed} km/h</p>
        </div>
      </div>
    </div>
  );
}
