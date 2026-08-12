import { useEffect } from 'react';
import { useStore } from '../store/useStore';
import { THEMES } from '../lib/themes';

export { THEMES };

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const themeKey = useStore((state) => state.theme);

  useEffect(() => {
    const theme = THEMES[themeKey] || THEMES.dark;
    const root = document.documentElement;

    Object.entries(theme.vars).forEach(([k, v]) => {
      root.style.setProperty(k, v as string);
    });

    document.body.classList.toggle('theme-kps1', themeKey === 'keychron_ps1');
  }, [themeKey]);

  return <>{children}</>;
}
