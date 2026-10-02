import React, { useState } from 'react';
import { VENICE_SPOTS, ORATA_BAIT_GUIDE } from '../data/veniceSpots';
import { MapPin, Fish, Compass, X, Anchor, Waves, CheckCircle2 } from 'lucide-react';

interface SpotGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSpotForDay?: (spotName: string) => void;
}

export const SpotGuideModal: React.FC<SpotGuideModalProps> = ({
  isOpen,
  onClose,
  onSelectSpotForDay,
}) => {
  const [activeTab, setActiveTab] = useState<'spots' | 'baits'>('spots');
  const [selectedZone, setSelectedZone] = useState<string>('all');

  if (!isOpen) return null;

  const filteredSpots =
    selectedZone === 'all'
      ? VENICE_SPOTS
      : VENICE_SPOTS.filter((s) => s.zone === selectedZone);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-850">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-600/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-50">
                Guida agli Spot & Esche per Orata nella Laguna di Venezia
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                I canali, le bocche di porto e le esche della tradizione lagunare veneta
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center px-5 pt-3 border-b border-slate-200 dark:border-slate-800 gap-4 text-sm font-semibold">
          <button
            onClick={() => setActiveTab('spots')}
            className={`pb-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'spots'
                ? 'border-cyan-600 text-cyan-600 dark:text-cyan-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <MapPin className="w-4 h-4" />
            Spot di Pesca della Laguna ({VENICE_SPOTS.length})
          </button>
          <button
            onClick={() => setActiveTab('baits')}
            className={`pb-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'baits'
                ? 'border-amber-600 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Fish className="w-4 h-4" />
            Esche Regine & Inneschi ({ORATA_BAIT_GUIDE.length})
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {activeTab === 'spots' ? (
            <div>
              {/* Zone Filter Chips */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="text-xs text-slate-400 font-medium">Zona:</span>
                {[
                  { id: 'all', label: 'Tutti gli spot' },
                  { id: 'Bocche di Porto', label: 'Bocche di Porto' },
                  { id: 'Canali Navigabili', label: 'Canali Profondi' },
                  { id: 'Barene e Bassifondi', label: 'Barene & Velme' },
                  { id: 'Laguna Nord', label: 'Laguna Nord' },
                ].map((z) => (
                  <button
                    key={z.id}
                    onClick={() => setSelectedZone(z.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                      selectedZone === z.id
                        ? 'bg-cyan-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {z.label}
                  </button>
                ))}
              </div>

              {/* Spots Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredSpots.map((spot) => (
                  <div
                    key={spot.id}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 hover:border-cyan-500/50 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                          {spot.name}
                        </h3>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800 shrink-0">
                          {spot.zone}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-300 mb-2 leading-relaxed">
                        {spot.description}
                      </p>

                      <div className="space-y-1 text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 mb-2">
                        <div>
                          <strong className="text-slate-700 dark:text-slate-300">Fondale:</strong> {spot.depthRange}
                        </div>
                        <div>
                          <strong className="text-slate-700 dark:text-slate-300">Momento di marea migliore:</strong> {spot.bestTidePhase}
                        </div>
                        <div>
                          <strong className="text-slate-700 dark:text-slate-300">Taglia orata target:</strong> {spot.targetOrataSize}
                        </div>
                      </div>

                      <div className="text-[11px] text-slate-600 dark:text-slate-300">
                        <strong className="text-slate-900 dark:text-slate-100">Consiglio tattico:</strong> {spot.tacticalTip}
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <div className="flex flex-wrap gap-1">
                        {spot.recommendedBaits.map((bait, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900/50"
                          >
                            {bait}
                          </span>
                        ))}
                      </div>

                      {onSelectSpotForDay && (
                        <button
                          onClick={() => {
                            onSelectSpotForDay(spot.name);
                            onClose();
                          }}
                          className="text-[11px] font-semibold text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300 shrink-0 ml-2"
                        >
                          Scegli per uscita →
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Baits List */
            <div className="space-y-4">
              {ORATA_BAIT_GUIDE.map((bait, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 hover:border-amber-500/50 transition-all"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        {bait.name}
                        <span className="text-xs font-normal text-amber-700 dark:text-amber-400 italic">
                          ({bait.dialetto})
                        </span>
                      </h3>
                    </div>
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                      Esca d'Oro
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 mb-2 leading-relaxed">
                    {bait.description}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] bg-slate-50 dark:bg-slate-900 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                    <div>
                      <strong className="text-slate-900 dark:text-slate-100 block mb-0.5">Condizioni ideali:</strong>
                      <span className="text-slate-600 dark:text-slate-300">{bait.bestConditions}</span>
                    </div>
                    <div>
                      <strong className="text-slate-900 dark:text-slate-100 block mb-0.5">Metodo di innesco:</strong>
                      <span className="text-slate-600 dark:text-slate-300">{bait.hooking}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 text-white text-xs font-medium hover:bg-slate-700 transition-colors"
          >
            Chiudi Guida
          </button>
        </div>
      </div>
    </div>
  );
};
