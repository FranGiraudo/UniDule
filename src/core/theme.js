export const THEMES = {
  dark: {
    name: 'Midnight Dark',
    primary: '#6366f1',
    bg: '#09090b',
    isLight: false,
    vars: {
      '--bg': '#09090b',
      '--bg2': '#121215',
      '--card': '#18181c',
      '--card2': '#222228',
      '--border': 'rgba(255,255,255,.08)',
      '--text': '#eeeeff',
      '--text2': '#94a3b8',
      '--primary': '#6366f1'
    }
  },
  emerald: {
    name: 'Emerald Obsidian',
    primary: '#10b981',
    bg: '#061412',
    isLight: false,
    vars: {
      '--bg': '#061412',
      '--bg2': '#0b1f1c',
      '--card': '#102a26',
      '--card2': '#163631',
      '--border': 'rgba(52,211,153,.18)',
      '--text': '#e6f7f3',
      '--text2': '#6ee7b7',
      '--primary': '#10b981'
    }
  },
  dracula: {
    name: 'Dracula Purple',
    primary: '#a855f7',
    bg: '#181424',
    isLight: false,
    vars: {
      '--bg': '#181424',
      '--bg2': '#211c30',
      '--card': '#2b253e',
      '--card2': '#37304e',
      '--border': 'rgba(192,132,252,.2)',
      '--text': '#f5f3ff',
      '--text2': '#c084fc',
      '--primary': '#a855f7'
    }
  },
  cyberpunk: {
    name: 'Cyberpunk Neon',
    primary: '#06b6d4',
    bg: '#070913',
    isLight: false,
    vars: {
      '--bg': '#070913',
      '--bg2': '#0e1225',
      '--card': '#151a36',
      '--card2': '#1e254b',
      '--border': 'rgba(6,182,212,.25)',
      '--text': '#e0f2fe',
      '--text2': '#38bdf8',
      '--primary': '#06b6d4'
    }
  },
  crimson: {
    name: 'Crimson Red',
    primary: '#ef4444',
    bg: '#180808',
    isLight: false,
    vars: {
      '--bg': '#180808',
      '--bg2': '#250d0d',
      '--card': '#2e1212',
      '--card2': '#3c1818',
      '--border': 'rgba(239,68,68,.25)',
      '--text': '#fee2e2',
      '--text2': '#fca5a5',
      '--primary': '#ef4444'
    }
  },
  light: {
    name: 'Enterprise Light',
    primary: '#4f46e5',
    bg: '#f8fafc',
    isLight: true,
    vars: {
      '--bg': '#f8fafc',
      '--bg2': '#f1f5f9',
      '--card': '#ffffff',
      '--card2': '#f1f5f9',
      '--border': '#cbd5e1',
      '--text': '#0f172a',
      '--text2': '#475569',
      '--primary': '#4f46e5'
    }
  },
  sunset: {
    name: 'Sunset Amber (Naranja)',
    primary: '#ea580c',
    bg: '#fff7ed',
    isLight: true,
    vars: {
      '--bg': '#fff7ed',
      '--bg2': '#ffedd5',
      '--card': '#ffffff',
      '--card2': '#ffedd5',
      '--border': '#fed7aa',
      '--text': '#431407',
      '--text2': '#9a3412',
      '--primary': '#ea580c'
    }
  },
  sakura: {
    name: 'Sakura Blossom (Rosa)',
    primary: '#db2777',
    bg: '#fdf2f8',
    isLight: true,
    vars: {
      '--bg': '#fdf2f8',
      '--bg2': '#fce7f3',
      '--card': '#ffffff',
      '--card2': '#fce7f3',
      '--border': '#fbcfe8',
      '--text': '#500724',
      '--text2': '#9d174d',
      '--primary': '#db2777'
    }
  }
};

export function applyTheme(themeKey) {
  const theme = THEMES[themeKey] || THEMES.dark;
  const root = document.documentElement;
  if (!root) return;
  Object.entries(theme.vars).forEach(([k, v]) => {
    root.style.setProperty(k, v);
  });
}
