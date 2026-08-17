import React, { useState, useEffect } from 'react';
import { Palette, X, Check, Sparkles, RefreshCw, Moon, Sun, Sliders, Eye, Wand2, RotateCcw } from 'lucide-react';
import { ColorSchemeConfig, ColorSchemeId, CustomThemeColors } from '../../types';
import { COLOR_SCHEMES, DEFAULT_CUSTOM_COLORS } from '../../data/colorSchemes';

interface ColorSchemeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentColorScheme: ColorSchemeId;
  onSelectColorScheme: (schemeId: ColorSchemeId) => void;
  customColors: CustomThemeColors;
  onSaveCustomColors: (colors: CustomThemeColors) => void;
}

export const ColorSchemeModal: React.FC<ColorSchemeModalProps> = ({
  isOpen,
  onClose,
  currentColorScheme,
  onSelectColorScheme,
  customColors,
  onSaveCustomColors,
}) => {
  const [activeTab, setActiveTab] = useState<'presets' | 'custom'>('presets');
  const [localCustom, setLocalCustom] = useState<CustomThemeColors>(customColors || DEFAULT_CUSTOM_COLORS);

  useEffect(() => {
    if (isOpen) {
      setLocalCustom(customColors || DEFAULT_CUSTOM_COLORS);
      if (currentColorScheme === 'custom') {
        setActiveTab('custom');
      }
    }
  }, [isOpen, customColors, currentColorScheme]);

  if (!isOpen) return null;

  const currentConfig = COLOR_SCHEMES.find((s) => s.id === currentColorScheme) || COLOR_SCHEMES[0];

  const handleColorChange = (key: keyof CustomThemeColors, value: string) => {
    const updated = { ...localCustom, [key]: value };
    setLocalCustom(updated);
    onSaveCustomColors(updated);
    if (currentColorScheme !== 'custom') {
      onSelectColorScheme('custom');
    }
  };

  const handleApplyQuickPreset = (preset: CustomThemeColors) => {
    setLocalCustom(preset);
    onSaveCustomColors(preset);
    onSelectColorScheme('custom');
  };

  const handleResetCustom = () => {
    setLocalCustom(DEFAULT_CUSTOM_COLORS);
    onSaveCustomColors(DEFAULT_CUSTOM_COLORS);
    onSelectColorScheme('custom');
  };

  const quickPresets = [
    {
      name: 'Obsidian Emerald',
      colors: DEFAULT_CUSTOM_COLORS,
    },
    {
      name: 'Midnight Ocean',
      colors: {
        mainBg: '#030712',
        cardBg: '#0f172a',
        innerContainerBg: '#1e293b',
        primaryAccent: '#38bdf8',
        secondaryAccent: '#38bdf8',
        textColor: '#f8fafc',
        textMutedColor: '#94a3b8',
        buttonBg: '#0284c7',
        buttonText: '#ffffff',
        borderColor: '#1e293b',
      },
    },
    {
      name: 'Royal Amethyst',
      colors: {
        mainBg: '#090514',
        cardBg: '#170c2e',
        innerContainerBg: '#28144f',
        primaryAccent: '#c084fc',
        secondaryAccent: '#f59e0b',
        textColor: '#f8fafc',
        textMutedColor: '#c084fc',
        buttonBg: '#9333ea',
        buttonText: '#ffffff',
        borderColor: '#3b1c71',
      },
    },
    {
      name: 'Clean Studio Light',
      colors: {
        mainBg: '#f8fafc',
        cardBg: '#ffffff',
        innerContainerBg: '#f1f5f9',
        primaryAccent: '#4f46e5',
        secondaryAccent: '#059669',
        textColor: '#0f172a',
        textMutedColor: '#64748b',
        buttonBg: '#4f46e5',
        buttonText: '#ffffff',
        borderColor: '#cbd5e1',
      },
    },
    {
      name: 'Crimson Archer',
      colors: {
        mainBg: '#0f0507',
        cardBg: '#270911',
        innerContainerBg: '#450a18',
        primaryAccent: '#fb7185',
        secondaryAccent: '#fbbf24',
        textColor: '#fff1f2',
        textMutedColor: '#fda4af',
        buttonBg: '#e11d48',
        buttonText: '#ffffff',
        borderColor: '#701a2d',
      },
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 relative">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500/20 via-sky-500/20 to-purple-500/20 border border-slate-700 flex items-center justify-center text-amber-400">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                Skema & Kustomisasi Warna
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                  Admin Customizer
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Pilih tema standar atau kreasikan kombinasi warna khusus untuk aplikasi Anda.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 px-6 pt-4 border-b border-slate-800 bg-slate-950/50">
          <button
            type="button"
            onClick={() => setActiveTab('presets')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'presets'
                ? 'border-emerald-500 text-emerald-400 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>Tema Preset Standar</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('custom');
              if (currentColorScheme !== 'custom') {
                onSelectColorScheme('custom');
              }
            }}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'custom'
                ? 'border-amber-500 text-amber-400 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Kustomisasi Warna Bebas</span>
            <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.2 rounded font-extrabold uppercase">
              Custom
            </span>
          </button>
        </div>

        {/* Modal Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 custom-scrollbar flex-1">
          {activeTab === 'presets' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {COLOR_SCHEMES.map((scheme) => {
                const isSelected = currentColorScheme === scheme.id;
                return (
                  <button
                    key={scheme.id}
                    type="button"
                    onClick={() => onSelectColorScheme(scheme.id)}
                    className={`relative p-4 rounded-2xl border text-left transition-all flex flex-col justify-between gap-3 group ${
                      isSelected
                        ? 'bg-slate-800/90 border-emerald-500 ring-2 ring-emerald-500/30 shadow-lg shadow-emerald-950/50'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50'
                    }`}
                  >
                    {/* Selected Indicator Badge */}
                    {isSelected && (
                      <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-bold shadow">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    )}

                    {/* Header & Swatch */}
                    <div className="flex items-start justify-between gap-2 pr-6">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-sm text-white group-hover:text-amber-300 transition-colors">
                            {scheme.name}
                          </span>
                        </div>
                        <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                          {scheme.badge}
                        </span>
                      </div>

                      {/* Mode Icon */}
                      <div className="text-slate-500">
                        {scheme.bgMode === 'light' ? (
                          <Sun className="w-4 h-4 text-amber-400" />
                        ) : (
                          <Moon className="w-4 h-4 text-sky-400" />
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-slate-400 line-clamp-2">
                      {scheme.description}
                    </p>

                    {/* Color Swatches Preview Bar */}
                    <div className="flex items-center gap-2 pt-1 border-t border-slate-800/80">
                      <span className="text-[10px] text-slate-500 font-medium">Palet:</span>
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-4 h-4 rounded-full border border-white/20 shadow-sm"
                          style={{ backgroundColor: scheme.primaryColorHex }}
                          title="Warna Utama"
                        />
                        <span
                          className="w-4 h-4 rounded-full border border-white/20 shadow-sm"
                          style={{ backgroundColor: scheme.accentColorHex }}
                          title="Warna Aksen"
                        />
                        <span
                          className={`w-4 h-4 rounded-full border border-white/20 shadow-sm ${
                            scheme.bgMode === 'light' ? 'bg-slate-100' : 'bg-slate-950'
                          }`}
                          title="Latar Belakang"
                        />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {activeTab === 'custom' && (
            <div className="space-y-6">
              {/* Quick Presets for Custom Scheme */}
              <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <Wand2 className="w-3.5 h-3.5" />
                    Pilih Prasetel Kustom Cepat:
                  </span>
                  <button
                    type="button"
                    onClick={handleResetCustom}
                    className="text-[11px] text-slate-400 hover:text-rose-300 flex items-center gap-1 transition"
                  >
                    <RotateCcw className="w-3 h-3" /> Reset Default
                  </button>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {quickPresets.map((qp, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleApplyQuickPreset(qp.colors)}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-amber-500/50 rounded-xl text-xs font-semibold text-slate-200 flex items-center gap-2 transition"
                    >
                      <span
                        className="w-3 h-3 rounded-full border border-white/20 shrink-0"
                        style={{ backgroundColor: qp.colors.primaryAccent }}
                      />
                      <span>{qp.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Live Interactive Preview Box */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-sky-400" />
                  Pratinjau Langsung (Live Interactive Preview):
                </span>
                <div
                  className="p-5 rounded-2xl border transition-all duration-300 shadow-xl space-y-3"
                  style={{
                    backgroundColor: localCustom.mainBg,
                    borderColor: localCustom.borderColor,
                    color: localCustom.textColor,
                  }}
                >
                  <div
                    className="p-4 rounded-xl border flex items-center justify-between gap-3"
                    style={{
                      backgroundColor: localCustom.cardBg,
                      borderColor: localCustom.borderColor,
                    }}
                  >
                    <div>
                      <h4 className="font-extrabold text-sm" style={{ color: localCustom.textColor }}>
                        Kartu Utama Dashboard
                      </h4>
                      <p className="text-xs" style={{ color: localCustom.textMutedColor }}>
                        Teks keterangan / subtitle informasi
                      </p>
                    </div>
                    <span
                      className="text-[10px] font-extrabold px-2.5 py-1 rounded-lg border"
                      style={{
                        backgroundColor: `${localCustom.primaryAccent}20`,
                        color: localCustom.primaryAccent,
                        borderColor: `${localCustom.primaryAccent}40`,
                      }}
                    >
                      Badge Aksen
                    </span>
                  </div>

                  <div
                    className="p-3 rounded-xl border flex items-center justify-between"
                    style={{
                      backgroundColor: localCustom.innerContainerBg,
                      borderColor: localCustom.borderColor,
                    }}
                  >
                    <span className="text-xs font-medium" style={{ color: localCustom.textColor }}>
                      Box Dalam (Inner Container)
                    </span>
                    <button
                      type="button"
                      className="px-3 py-1.5 font-bold text-xs rounded-xl shadow transition"
                      style={{
                        backgroundColor: localCustom.buttonBg,
                        color: localCustom.buttonText,
                      }}
                    >
                      Tombol Contoh
                    </button>
                  </div>
                </div>
              </div>

              {/* Color Pickers Grid */}
              <div className="space-y-3">
                <p className="text-xs font-black text-slate-400 uppercase tracking-wider">
                  Pengaturan Warna Masing-masing Elemen:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* 1. Latar Belakang Utama */}
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-white">Latar Belakang Utama</p>
                      <p className="text-[10px] text-slate-400">Main Page Background</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={localCustom.mainBg}
                        onChange={(e) => handleColorChange('mainBg', e.target.value)}
                        className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0 p-0"
                      />
                      <input
                        type="text"
                        value={localCustom.mainBg}
                        onChange={(e) => handleColorChange('mainBg', e.target.value)}
                        className="w-20 px-2 py-1 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-white"
                      />
                    </div>
                  </div>

                  {/* 2. Latar Kartu / Container */}
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-white">Latar Kartu / Container</p>
                      <p className="text-[10px] text-slate-400">Card & Modal Background</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={localCustom.cardBg}
                        onChange={(e) => handleColorChange('cardBg', e.target.value)}
                        className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0 p-0"
                      />
                      <input
                        type="text"
                        value={localCustom.cardBg}
                        onChange={(e) => handleColorChange('cardBg', e.target.value)}
                        className="w-20 px-2 py-1 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-white"
                      />
                    </div>
                  </div>

                  {/* 3. Latar Inner Box */}
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-white">Latar Inner Box</p>
                      <p className="text-[10px] text-slate-400">Sub-container / Table Row</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={localCustom.innerContainerBg}
                        onChange={(e) => handleColorChange('innerContainerBg', e.target.value)}
                        className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0 p-0"
                      />
                      <input
                        type="text"
                        value={localCustom.innerContainerBg}
                        onChange={(e) => handleColorChange('innerContainerBg', e.target.value)}
                        className="w-20 px-2 py-1 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-white"
                      />
                    </div>
                  </div>

                  {/* 4. Garis Tepi / Border */}
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-white">Garis Tepi / Border</p>
                      <p className="text-[10px] text-slate-400">Border Divider Lines</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={localCustom.borderColor}
                        onChange={(e) => handleColorChange('borderColor', e.target.value)}
                        className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0 p-0"
                      />
                      <input
                        type="text"
                        value={localCustom.borderColor}
                        onChange={(e) => handleColorChange('borderColor', e.target.value)}
                        className="w-20 px-2 py-1 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-white"
                      />
                    </div>
                  </div>

                  {/* 5. Teks / Font Utama */}
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-white">Warna Teks Utama</p>
                      <p className="text-[10px] text-slate-400">Primary Font Color</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={localCustom.textColor}
                        onChange={(e) => handleColorChange('textColor', e.target.value)}
                        className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0 p-0"
                      />
                      <input
                        type="text"
                        value={localCustom.textColor}
                        onChange={(e) => handleColorChange('textColor', e.target.value)}
                        className="w-20 px-2 py-1 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-white"
                      />
                    </div>
                  </div>

                  {/* 6. Teks Subtitle / Keterangan */}
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-white">Warna Teks Keterangan</p>
                      <p className="text-[10px] text-slate-400">Muted Subtitle Font</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={localCustom.textMutedColor}
                        onChange={(e) => handleColorChange('textMutedColor', e.target.value)}
                        className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0 p-0"
                      />
                      <input
                        type="text"
                        value={localCustom.textMutedColor}
                        onChange={(e) => handleColorChange('textMutedColor', e.target.value)}
                        className="w-20 px-2 py-1 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-white"
                      />
                    </div>
                  </div>

                  {/* 7. Warna Background Tombol */}
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-white">Background Tombol</p>
                      <p className="text-[10px] text-slate-400">Primary Button Color</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={localCustom.buttonBg}
                        onChange={(e) => handleColorChange('buttonBg', e.target.value)}
                        className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0 p-0"
                      />
                      <input
                        type="text"
                        value={localCustom.buttonBg}
                        onChange={(e) => handleColorChange('buttonBg', e.target.value)}
                        className="w-20 px-2 py-1 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-white"
                      />
                    </div>
                  </div>

                  {/* 8. Warna Teks / Font Tombol */}
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-white">Teks / Font Tombol</p>
                      <p className="text-[10px] text-slate-400">Button Font Color</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={localCustom.buttonText}
                        onChange={(e) => handleColorChange('buttonText', e.target.value)}
                        className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0 p-0"
                      />
                      <input
                        type="text"
                        value={localCustom.buttonText}
                        onChange={(e) => handleColorChange('buttonText', e.target.value)}
                        className="w-20 px-2 py-1 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-white"
                      />
                    </div>
                  </div>

                  {/* 9. Warna Aksen Utama */}
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-white">Warna Aksen Utama</p>
                      <p className="text-[10px] text-slate-400">Primary Brand Accent</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={localCustom.primaryAccent}
                        onChange={(e) => handleColorChange('primaryAccent', e.target.value)}
                        className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0 p-0"
                      />
                      <input
                        type="text"
                        value={localCustom.primaryAccent}
                        onChange={(e) => handleColorChange('primaryAccent', e.target.value)}
                        className="w-20 px-2 py-1 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-white"
                      />
                    </div>
                  </div>

                  {/* 10. Warna Aksen Sekunder */}
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-white">Warna Aksen Sekunder</p>
                      <p className="text-[10px] text-slate-400">Secondary Gold/Highlight</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={localCustom.secondaryAccent}
                        onChange={(e) => handleColorChange('secondaryAccent', e.target.value)}
                        className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0 p-0"
                      />
                      <input
                        type="text"
                        value={localCustom.secondaryAccent}
                        onChange={(e) => handleColorChange('secondaryAccent', e.target.value)}
                        className="w-20 px-2 py-1 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-white"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Active Theme Preview Summary */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <p className="text-xs font-bold text-white">
                  Status Tema Saat Ini:{' '}
                  <span className="text-amber-400 font-extrabold">
                    {currentColorScheme === 'custom' ? 'Skema Warna Kustom (Custom Admin)' : currentConfig.name}
                  </span>
                </p>
                <p className="text-[11px] text-slate-400">
                  Warna tersimpan di memori lokal browser dan berlaku otomatis di seluruh portal admin, siswa, dan orang tua.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onSelectColorScheme('emerald')}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset Standar
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center gap-2"
          >
            Selesai & Simpan
          </button>
        </div>
      </div>
    </div>
  );
};
