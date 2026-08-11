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
  },
  amanecer_morado: {
    name: 'Amanecer Morado',
    primary: '#F8B2B2',
    bg: '#252352',
    isLight: false,
    vars: { '--bg': '#252352', '--bg2': '#32306b', '--card': '#2e2c60', '--card2': '#3d3a7c', '--border': 'rgba(255,255,255,.1)', '--text': '#ffffff', '--text2': '#AF719D', '--primary': '#F8B2B2' }
  },
  algodon_azucar: {
    name: 'Algodón de Azúcar',
    primary: '#b094c4',
    bg: '#FBEFEF',
    isLight: true,
    vars: { '--bg': '#FBEFEF', '--bg2': '#FFE2E2', '--card': '#ffffff', '--card2': '#fff0f0', '--border': '#F5CBCB', '--text': '#4a4a4a', '--text2': '#866b96', '--primary': '#b094c4' }
  },
  otono_calido: {
    name: 'Otoño Cálido',
    primary: '#EC5B38',
    bg: '#3b3232',
    isLight: false,
    vars: { '--bg': '#3b3232', '--bg2': '#524646', '--card': '#463c3c', '--card2': '#5a4e4e', '--border': 'rgba(255,255,255,.1)', '--text': '#FCF2E5', '--text2': '#A8A492', '--primary': '#EC5B38' }
  },
  frutos_rojos: {
    name: 'Frutos Rojos',
    primary: '#F39399',
    bg: '#3b1c26',
    isLight: false,
    vars: { '--bg': '#3b1c26', '--bg2': '#5D3140', '--card': '#4f2634', '--card2': '#6d3a4b', '--border': 'rgba(255,255,255,.1)', '--text': '#F6D8BD', '--text2': '#CF4173', '--primary': '#F39399' }
  },
  bosque_esmeralda: {
    name: 'Bosque Esmeralda',
    primary: '#4CAF50',
    bg: '#E8F5E9',
    isLight: true,
    vars: { '--bg': '#E8F5E9', '--bg2': '#C8E6C9', '--card': '#ffffff', '--card2': '#f1f8f2', '--border': '#A5D6A7', '--text': '#1B5E20', '--text2': '#388E3C', '--primary': '#4CAF50' }
  },
  rojo_fuego: {
    name: 'Rojo Fuego',
    primary: '#FFB300',
    bg: '#1f0301',
    isLight: false,
    vars: { '--bg': '#1f0301', '--bg2': '#3E0703', '--card': '#2e0502', '--card2': '#4d0904', '--border': 'rgba(255,255,255,.1)', '--text': '#FFF0C4', '--text2': '#ff8a65', '--primary': '#FFB300' }
  },
  carmin_oscuro: {
    name: 'Carmín Oscuro',
    primary: '#D84040',
    bg: '#110d0d',
    isLight: false,
    vars: { '--bg': '#110d0d', '--bg2': '#1D1616', '--card': '#181212', '--card2': '#261c1c', '--border': 'rgba(255,255,255,.1)', '--text': '#EEEEEE', '--text2': '#e57373', '--primary': '#D84040' }
  },
  rosa_vintage: {
    name: 'Rosa Vintage',
    primary: '#D76C82',
    bg: '#EBE8DB',
    isLight: true,
    vars: { '--bg': '#EBE8DB', '--bg2': '#e0dcca', '--card': '#ffffff', '--card2': '#f5f3eb', '--border': '#d8cbb6', '--text': '#3D0301', '--text2': '#B03052', '--primary': '#D76C82' }
  },
  pastel_pop: {
    name: 'Pastel Pop',
    primary: '#6b9bec',
    bg: '#FFEFE3',
    isLight: true,
    vars: { '--bg': '#FFEFE3', '--bg2': '#ffdfcc', '--card': '#ffffff', '--card2': '#fff7f2', '--border': '#ffc599', '--text': '#333333', '--text2': '#d64585', '--primary': '#6b9bec' }
  },
  cielo_estival: {
    name: 'Cielo Estival',
    primary: '#CA6180',
    bg: '#e3f6f9',
    isLight: true,
    vars: { '--bg': '#e3f6f9', '--bg2': '#cbeaf0', '--card': '#ffffff', '--card2': '#f0fbfd', '--border': '#9ED3DC', '--text': '#1a3b40', '--text2': '#8a4257', '--primary': '#CA6180' }
  },
  dorado_atardecer: {
    name: 'Lluvia Dorada',
    primary: '#FF9D00',
    bg: '#3d2814',
    isLight: false,
    vars: { '--bg': '#3d2814', '--bg2': '#54381e', '--card': '#4b321a', '--card2': '#614122', '--border': 'rgba(255,255,255,.1)', '--text': '#FFCF71', '--text2': '#ffb74d', '--primary': '#FF9D00' }
  },
  lcd: {
    name: 'LCD (Psychedelic)',
    primary: '#39FF14',
    bg: '#1A0B2E',
    isLight: false,
    vars: { '--bg': '#1A0B2E', '--bg2': '#FF00FF', '--card': '#2B0F4C', '--card2': '#4C128B', '--border': '#00FFCC', '--text': '#FFFF00', '--text2': '#00FFCC', '--primary': '#39FF14' }
  },
  keychron_ps1: {
    name: '⌨️ Keychron / PS1',
    primary: '#CC2929',
    bg: '#D8D5CE',
    isLight: true,
    vars: {
      '--bg':     '#D8D5CE',   // platino claro — cuerpo PS1 limpio
      '--bg2':    '#CCCAC2',   // gris ceniza
      '--card':   '#E2E0DA',   // tecla cream clara
      '--card2':  '#ECEAE5',   // card elevada
      '--border': '#B2AFA6',   // borde neutro
      '--text':   '#1C1814',   // tinta oscura
      '--text2':  '#6A6258',   // texto secundario sepia leve
      '--primary':'#CC2929'
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
  // Toggle retro class for keychron_ps1
  document.body.classList.toggle('theme-kps1', themeKey === 'keychron_ps1');
}
