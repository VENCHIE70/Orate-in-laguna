import React from 'react';
import { DayFishingData, FishingTripNote } from '../types';
import { TideActivityChart } from './TideActivityChart';
import { MoonIcon } from './MoonIcon';
import {
  Clock,
  Sparkles,
  MapPin,
  Fish,
  Anchor,
  Compass,
  Thermometer,
  Bookmark,
  Waves,
  Sun,
  Moon,
  Info,
} from 'lucide-react';

interface DayDetailViewProps {
  dayData: DayFishingData;
  onOpenTripModal: (day: DayFishingData) => void;
  savedTrip?: FishingTripNote;
  onOpenSpotGuide: () => void;
}

export const DayDetailView: React.FC<DayDetailViewProps> = ({
  dayData,
  onOpenTripModal,
  savedTrip,
  onOpenSpotGuide,
}) => {
  // Format day for display in Italian
  const dateFormatted = new Intl.DateTimeFormat('it-IT', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(dayData.date);

  const capitalizedDate = dateFormatted.charAt(0).toUpperCase() + dateFormatted.slice(1);

  // Badge styles
  const getBadgeStyle = () => {
    switch (dayData.ratingLevel) {
      case 'eccellente':
        return 'bg-emerald-500 text-white shadow-emerald-500/20';
      case 'ottimo':
        return 'bg-teal-600 text-white shadow-teal-500/20';
      case 'buono':
        return 'bg-amber-600 text-white shadow-amber-500/20';
      case 'medio':
        return 'bg-slate-600 text-white shadow-slate-500/20';
      default:
        return 'bg-slate-400 text-white';
    }
  };

  return (
    <div id="day-detail-view-container" className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-cyan-950 text-white rounded-2xl p-5 sm:p-6 border border-slate-700/60 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <Compass className="w-3.5 h-3.5" /> Laguna di Venezia • Analisi Orate
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              {capitalizedDate}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              {dayData.seasonDescription}
            </p>
          </div>

          {/* Rating Pill & Action */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right">
              <div
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold shadow-md ${getBadgeStyle()}`}
              >
                <span>{dayData.overallScore}%</span>
                <span>•</span>
                <span>{dayData.ratingLabel}</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-end gap-1.5">
                <MoonIcon phase={dayData.moonPhase} illumination={dayData.moonIllumination} size={13} />
                <span>{dayData.moonPhaseLabel}</span>
              </div>
            </div>

            <button
              id="btn-plan-trip"
              onClick={() => onOpenTripModal(dayData)}
              className="px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-700 text-white text-xs sm:text-sm font-medium transition-all flex items-center gap-1.5 shadow-md shadow-cyan-900/40"
            >
              <Bookmark className={`w-4 h-4 ${savedTrip ? 'fill-white' : ''}`} />
              <span>{savedTrip ? 'Uscita Salvata' : 'Pianifica Uscita'}</span>
            </button>
          </div>
        </div>

        {/* Quick parameters grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-700/60 text-xs">
          <div className="bg-slate-800/60 rounded-xl p-2.5 border border-slate-700/50">
            <span className="text-slate-400 block mb-0.5">Tipo Marea:</span>
            <span className="font-semibold text-slate-100 flex items-center gap-1">
              <Waves className="w-3.5 h-3.5 text-cyan-400" />
              {dayData.isSizigia ? 'Marea di Sizigia (Forte)' : dayData.isQuadratura ? 'Quadratura (Lenta)' : 'Marea Media Regolare'}
            </span>
          </div>

          <div className="bg-slate-800/60 rounded-xl p-2.5 border border-slate-700/50">
            <span className="text-slate-400 block mb-0.5">Temperatura Acqua Laguna:</span>
            <span className="font-semibold text-slate-100 flex items-center gap-1">
              <Thermometer className="w-3.5 h-3.5 text-amber-400" />
              ~{dayData.waterTempEstimated}°C
            </span>
          </div>

          <div className="bg-slate-800/60 rounded-xl p-2.5 border border-slate-700/50">
            <span className="text-slate-400 block mb-0.5">Alba & Tramonto:</span>
            <span className="font-semibold text-slate-100 flex items-center gap-2">
              <span className="flex items-center gap-1 text-amber-300"><Sun className="w-3 h-3" /> {dayData.sunriseTime}</span>
              <span className="flex items-center gap-1 text-indigo-300"><Moon className="w-3 h-3" /> {dayData.sunsetTime}</span>
            </span>
          </div>

          <div className="bg-slate-800/60 rounded-xl p-2.5 border border-slate-700/50">
            <span className="text-slate-400 block mb-0.5">Esca Regina di Oggi:</span>
            <span className="font-semibold text-cyan-300 truncate block">
              {dayData.topRecommendedBait.split('(')[0]}
            </span>
          </div>
        </div>
      </div>

      {/* CORE SECTION: LE ORE MIGLIORI PER PESCARE ORATE */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                Le Ore Migliori per l'Orata Oggi
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                  {dayData.bestWindows.length} {dayData.bestWindows.length === 1 ? 'finestra top' : 'finestre top'}
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Orari calcolati sull'interazione tra marea montante della Laguna di Venezia, ciclo solunare e abitudini alimentari dello Sparus aurata.
              </p>
            </div>
          </div>

          <button
            onClick={onOpenSpotGuide}
            className="text-xs font-semibold text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300 flex items-center gap-1 hover:underline"
          >
            <MapPin className="w-3.5 h-3.5" /> Guida Spot & Esche Laguna
          </button>
        </div>

        {/* List of best windows */}
        {dayData.bestWindows.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dayData.bestWindows.map((win, idx) => (
              <div
                key={win.id}
                id={`best-window-${idx}`}
                className="group relative rounded-xl border border-amber-200 dark:border-amber-900/40 bg-gradient-to-br from-amber-50/50 via-white to-amber-50/20 dark:from-amber-950/20 dark:via-slate-850 dark:to-slate-900 p-4 transition-all hover:shadow-md"
              >
                {/* Header of Window card */}
                <div className="flex items-start justify-between gap-3 mb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 font-black text-sm tracking-wide shadow-sm flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      {win.startHour} - {win.endHour}
                    </span>
                    <span className="text-xs font-bold text-amber-700 dark:text-amber-400">
                      ★ {win.score}% Attività
                    </span>
                  </div>

                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    {win.tideContext}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1.5">
                  {win.title}
                </h3>

                <p className="text-xs text-slate-600 dark:text-slate-300 mb-3 leading-relaxed">
                  {win.reason}
                </p>

                {/* Practical tips for this window */}
                <div className="space-y-1.5 text-xs pt-2 border-t border-amber-200/60 dark:border-amber-900/30">
                  <div className="flex items-start gap-1.5 text-slate-700 dark:text-slate-300">
                    <Fish className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-slate-900 dark:text-slate-100">Esca indicata:</strong> {win.suggestedBait}
                    </span>
                  </div>
                  <div className="flex items-start gap-1.5 text-slate-700 dark:text-slate-300">
                    <MapPin className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-slate-900 dark:text-slate-100">Spot ideali:</strong> {win.suggestedSpots}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850 text-center text-slate-500 text-sm">
            Nessuna finestra con attività elevata rilevata per questa data (periodo di riposo invernale o acqua ferma).
          </div>
        )}
      </div>

      {/* 24-HOUR INTERACTIVE CHART */}
      <TideActivityChart dayData={dayData} />

      {/* TIDE EXTREMES & LAGOON TACTICS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Extremes (Colmi e Secche) */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100 dark:border-slate-800">
            <Waves className="w-4 h-4 text-cyan-600" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Colmi & Secche (ZMPS)
            </h3>
          </div>
          <div className="space-y-2.5">
            {dayData.extremes.map((ext, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`w-5 h-5 rounded-md flex items-center justify-center font-bold text-[10px] ${
                      ext.type === 'high'
                        ? 'bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {ext.type === 'high' ? '▲' : '▼'}
                  </span>
                  <div>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                      {ext.label}
                    </span>
                    <span className="text-[10px] text-slate-400">Ore {ext.time}</span>
                  </div>
                </div>
                <span
                  className={`font-mono font-bold ${
                    ext.heightCm > 0 ? 'text-cyan-600 dark:text-cyan-400' : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {ext.heightCm > 0 ? `+${ext.heightCm}` : ext.heightCm} cm
                </span>
              </div>
            ))}
          </div>
          <div className="mt-3 text-[11px] text-slate-400 italic">
            *I livelli fanno riferimento allo zero mareografico della Punta della Salute di Venezia.
          </div>
        </div>

        {/* Recommended Rig & Equipment */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100 dark:border-slate-800">
            <Anchor className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Montatura & Assetto Consigliato
            </h3>
          </div>
          <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
            <div>
              <span className="font-semibold text-slate-900 dark:text-slate-100 block mb-0.5">
                Piombo & Terminale per oggi:
              </span>
              <p className="bg-emerald-50/50 dark:bg-emerald-950/20 p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800/40 text-emerald-900 dark:text-emerald-300 leading-relaxed">
                {dayData.topRecommendedRig}
              </p>
            </div>
            <div>
              <span className="font-semibold text-slate-900 dark:text-slate-100 block mb-0.5">
                Regola lagunare del fondale:
              </span>
              <p className="leading-relaxed">
                In laguna la corrente sposta i sedimenti: mantieni il filo teso a canna alta in canale per evitare che il granchio si insabbi nella melma.
              </p>
            </div>
          </div>
        </div>

        {/* Tactical Advice */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100 dark:border-slate-800">
            <Info className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Tattica della Giornata
            </h3>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
            {dayData.lagoonAdvice}
          </p>
          <div className="bg-indigo-50/50 dark:bg-indigo-950/20 p-2.5 rounded-xl border border-indigo-200 dark:border-indigo-800/40 text-indigo-950 dark:text-indigo-300 text-xs">
            <strong>Fase Lunare:</strong> {dayData.moonPhaseLabel} con illuminazione al {dayData.moonIllumination}%. Età della luna: {dayData.moonAgeDays} giorni.
          </div>
        </div>
      </div>
    </div>
  );
};
