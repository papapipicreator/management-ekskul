import React from 'react';
import { Palette, X, Check, Sparkles, RefreshCw, Moon, Sun } from 'lucide-react';
import { ColorSchemeConfig, ColorSchemeId } from '../../types';
import { COLOR_SCHEMES } from '../../data/colorSchemes';

interface ColorSchemeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentColorScheme: ColorSchemeId;
  onSelectColorScheme: (schemeId: ColorSchemeId) => void;
}

export const ColorSchemeModal: React.FC<ColorSchemeModalProps> = ({
  isOpen,
  onClose,
  currentColorScheme,
  onSelectColorScheme,
}) => {
  if (!isOpen) return null;

  const currentConfig = COLOR_SCHEMES.find((s) => s.id === currentColorScheme) || COLOR_SCHEMES[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 relative">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500/20 via-sky-500/20 to-purple-500/20 border border-slate-700 flex items-center justify-center text-amber-400">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                Pilihan Skema Warna Tampilan
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                  Admin Customizer
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Pilih tema warna aplikasi sesuai selera atau suasana latihan klub panahan Anda.
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

        {/* Modal Content - List of Schemes */}
        <div className="p-6 overflow-y-auto space-y-4">
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

          {/* Active Theme Preview Summary */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <p className="text-xs font-bold text-white">
                  Tema Aktif: <span className="text-amber-400">{currentConfig.name}</span>
                </p>
                <p className="text-[11px] text-slate-400">
                  Perubahan skema warna langsung diterapkan ke seluruh halaman admin, portal siswa, dan portal orang tua secara otomatis.
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
