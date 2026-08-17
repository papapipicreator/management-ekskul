import { ColorSchemeConfig, ColorSchemeId, CustomThemeColors } from '../types';

export const DEFAULT_CUSTOM_COLORS: CustomThemeColors = {
  mainBg: '#020617',
  cardBg: '#0f172a',
  innerContainerBg: '#1e293b',
  primaryAccent: '#10b981',
  secondaryAccent: '#f59e0b',
  textColor: '#f8fafc',
  textMutedColor: '#94a3b8',
  buttonBg: '#059669',
  buttonText: '#ffffff',
  borderColor: '#334155',
};

export const COLOR_SCHEMES: ColorSchemeConfig[] = [
  {
    id: 'emerald',
    name: 'Hijau Jamrud & Emas (Standar)',
    badge: 'Standar Panahan',
    description: 'Skema warna ikonik panahan nasional dengan perpaduan hijau jamrud dan aksen emas.',
    primaryColorHex: '#10b981',
    accentColorHex: '#f59e0b',
    bgMode: 'dark',
    bgClass: 'bg-slate-950',
    textClass: 'text-slate-100',
    primaryBgClass: 'bg-emerald-600',
    primaryHoverBgClass: 'hover:bg-emerald-500',
    primaryTextClass: 'text-emerald-400',
    primaryBorderClass: 'border-emerald-500/30',
  },
  {
    id: 'blue',
    name: 'Biru Samudra & Sian',
    badge: 'Ocean Navy',
    description: 'Tampilan biru laut profesional dengan aksen sian jernih untuk nuansa sejuk dan modern.',
    primaryColorHex: '#0284c7',
    accentColorHex: '#06b6d4',
    bgMode: 'dark',
    bgClass: 'bg-slate-950',
    textClass: 'text-slate-100',
    primaryBgClass: 'bg-sky-600',
    primaryHoverBgClass: 'hover:bg-sky-500',
    primaryTextClass: 'text-sky-400',
    primaryBorderClass: 'border-sky-500/30',
  },
  {
    id: 'purple',
    name: 'Ungu Kerajaan & Emas',
    badge: 'Royal Violet',
    description: 'Tema ungu kontras tinggi nan elegan dipadukan dengan aksen emas berkelas.',
    primaryColorHex: '#9333ea',
    accentColorHex: '#f59e0b',
    bgMode: 'dark',
    bgClass: 'bg-slate-950',
    textClass: 'text-slate-100',
    primaryBgClass: 'bg-purple-600',
    primaryHoverBgClass: 'hover:bg-purple-500',
    primaryTextClass: 'text-purple-400',
    primaryBorderClass: 'border-purple-500/30',
  },
  {
    id: 'rose',
    name: 'Merah Ruby & Emas',
    badge: 'Crimson Target',
    description: 'Skema warna berani dan penuh energi yang terinspirasi dari lingkaran target panahan.',
    primaryColorHex: '#e11d48',
    accentColorHex: '#fbbf24',
    bgMode: 'dark',
    bgClass: 'bg-zinc-950',
    textClass: 'text-zinc-100',
    primaryBgClass: 'bg-rose-600',
    primaryHoverBgClass: 'hover:bg-rose-500',
    primaryTextClass: 'text-rose-400',
    primaryBorderClass: 'border-rose-500/30',
  },
  {
    id: 'cyan',
    name: 'Sian Cyber & Mint',
    badge: 'Futuristic',
    description: 'Warna futuristik cyan dan mint dengan kontras maksimal untuk suasana teknologi tinggi.',
    primaryColorHex: '#06b6d4',
    accentColorHex: '#10b981',
    bgMode: 'dark',
    bgClass: 'bg-slate-950',
    textClass: 'text-slate-100',
    primaryBgClass: 'bg-cyan-600',
    primaryHoverBgClass: 'hover:bg-cyan-500',
    primaryTextClass: 'text-cyan-400',
    primaryBorderClass: 'border-cyan-500/30',
  },
  {
    id: 'amber',
    name: 'Emas Warm & Jingga',
    badge: 'Warm Gold',
    description: 'Nuansa hangat cokelat obsidian dan emas jingga yang nyaman di mata.',
    primaryColorHex: '#d97706',
    accentColorHex: '#f97316',
    bgMode: 'dark',
    bgClass: 'bg-stone-950',
    textClass: 'text-stone-100',
    primaryBgClass: 'bg-amber-600',
    primaryHoverBgClass: 'hover:bg-amber-500',
    primaryTextClass: 'text-amber-400',
    primaryBorderClass: 'border-amber-500/30',
  },
  {
    id: 'light',
    name: 'Mode Terang (Clean Light)',
    badge: 'Clean Light',
    description: 'Tampilan latar putih terang dengan aksen biru indigo, cocok untuk luar ruangan.',
    primaryColorHex: '#4f46e5',
    accentColorHex: '#059669',
    bgMode: 'light',
    bgClass: 'bg-slate-100',
    textClass: 'text-slate-900',
    primaryBgClass: 'bg-indigo-600',
    primaryHoverBgClass: 'hover:bg-indigo-500',
    primaryTextClass: 'text-indigo-600',
    primaryBorderClass: 'border-indigo-500/30',
  },
  {
    id: 'custom',
    name: 'Kustom Bebas (Custom Palette)',
    badge: 'Custom Admin',
    description: 'Atur warna sendiri secara terperinci untuk latar belakang, container, tombol, font, border, dan aksen.',
    primaryColorHex: '#10b981',
    accentColorHex: '#f59e0b',
    bgMode: 'dark',
    bgClass: 'bg-slate-950',
    textClass: 'text-slate-100',
    primaryBgClass: 'bg-emerald-600',
    primaryHoverBgClass: 'hover:bg-emerald-500',
    primaryTextClass: 'text-emerald-400',
    primaryBorderClass: 'border-emerald-500/30',
  },
];

export const applyThemeStyle = (schemeId: ColorSchemeId, customColors?: CustomThemeColors) => {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('data-theme', schemeId);

  let styleEl = document.getElementById('panahan-custom-theme-style');

  if (schemeId === 'custom' && customColors) {
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'panahan-custom-theme-style';
      document.head.appendChild(styleEl);
    }

    styleEl.textContent = `
      :root[data-theme="custom"], [data-theme="custom"] {
        --color-primary: ${customColors.primaryAccent};
        --color-primary-hover: ${customColors.primaryAccent};
        --color-primary-light: ${customColors.primaryAccent}25;
        --color-primary-border: ${customColors.borderColor};
        --color-accent: ${customColors.secondaryAccent};
      }

      [data-theme="custom"] body,
      [data-theme="custom"] .min-h-screen {
        background-color: ${customColors.mainBg} !important;
        color: ${customColors.textColor} !important;
      }

      [data-theme="custom"] .bg-slate-950,
      [data-theme="custom"] .bg-zinc-950,
      [data-theme="custom"] .bg-stone-950 {
        background-color: ${customColors.mainBg} !important;
      }

      [data-theme="custom"] .bg-slate-900,
      [data-theme="custom"] .bg-zinc-900,
      [data-theme="custom"] .bg-stone-900,
      [data-theme="custom"] aside,
      [data-theme="custom"] header {
        background-color: ${customColors.cardBg} !important;
      }

      [data-theme="custom"] .bg-slate-800,
      [data-theme="custom"] .bg-slate-800\\/80,
      [data-theme="custom"] .bg-slate-800\\/50,
      [data-theme="custom"] .bg-slate-950\\/80,
      [data-theme="custom"] .bg-slate-950\\/60,
      [data-theme="custom"] .bg-slate-900\\/90,
      [data-theme="custom"] .bg-slate-900\\/80 {
        background-color: ${customColors.innerContainerBg} !important;
      }

      [data-theme="custom"] .border-slate-800,
      [data-theme="custom"] .border-slate-700,
      [data-theme="custom"] .border-slate-800\\/80 {
        border-color: ${customColors.borderColor} !important;
      }

      [data-theme="custom"] .text-slate-100,
      [data-theme="custom"] .text-slate-200,
      [data-theme="custom"] .text-white {
        color: ${customColors.textColor} !important;
      }

      [data-theme="custom"] .text-slate-400,
      [data-theme="custom"] .text-slate-500,
      [data-theme="custom"] .text-slate-300 {
        color: ${customColors.textMutedColor} !important;
      }

      [data-theme="custom"] .bg-emerald-600,
      [data-theme="custom"] .bg-emerald-500,
      [data-theme="custom"] .bg-amber-600,
      [data-theme="custom"] .bg-sky-600,
      [data-theme="custom"] .bg-purple-600,
      [data-theme="custom"] .bg-rose-600 {
        background-color: ${customColors.buttonBg} !important;
        color: ${customColors.buttonText} !important;
      }

      [data-theme="custom"] .text-emerald-400,
      [data-theme="custom"] .text-emerald-500 {
        color: ${customColors.primaryAccent} !important;
      }

      [data-theme="custom"] .text-amber-400,
      [data-theme="custom"] .text-amber-300 {
        color: ${customColors.secondaryAccent} !important;
      }
    `;
  } else {
    if (styleEl) {
      styleEl.textContent = '';
    }
  }
};

