import { useEffect, useState } from 'react';

/** localStorage 持久化的 useState —— IsMe 的 local-first 数据层 */
export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = window.localStorage.getItem(key);
      return raw !== null ? (JSON.parse(raw) as T) : initial;
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // 存储已满或被禁用时静默降级
    }
  }, [key, value]);

  return [value, setValue] as const;
}
