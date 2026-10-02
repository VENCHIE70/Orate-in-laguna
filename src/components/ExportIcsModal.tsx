import React, { useState } from 'react';
import { DayFishingData, BestFishingWindow } from '../types';
import { generateFishingICS, downloadICSFile } from '../utils/icsExport';
import { Calendar as CalendarIcon, Download, X, CheckCircle2, Sparkles, Clock, AlertCircle } from 'lucide-react';

interface ExportIcsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDayData: DayFishingData;
  monthDaysData: DayFishingData[];
  monthName: string;
  year: number;
}

export const ExportIcsModal: React.FC<ExportIcsModalProps> = ({
  isOpen,
  onClose,
  selectedDayData,
  monthDaysData,
  monthName,
  year,
}) => {
  const [exportScope, setExportScope] = useState<'single' | 'top_month' | 'all_month'>('single');
  const [isExported, setIsExported] = useState(false);

  if (!isOpen) return null;

  // Prepare events based on selection
  let eventsToExport: Array<{ day: DayFishingData; window: BestFishingWindow }> = [];

  if (exportScope === 'single') {
    eventsToExport = selectedDayData.bestWindows.map((win) => ({
      day: selectedDayData,
      window: win,
    }));
  } else if (exportScope === 'top_month') {
    monthDaysData
      .filter((d) => d.ratingLevel === 'eccellente' || d.ratingLevel === 'ottimo')
      .forEach((day) => {
        day.bestWindows.forEach((win) => {
          eventsToExport.push({ day, window: win });
        });
      });
  } else {
    monthDaysData.forEach((day) => {
      day.bestWindows.forEach((win) => {
        eventsToExport.push({ day, window: win });
      });
    });
  }

  const handleExport = () => {
    let filename = `pesca-orate-${selectedDayData.dateString}.ics`;
    let calTitle = `Orate Venezia - ${selectedDayData.dateString}`;

    if (exportScope === 'top_month') {
      filename = `orate-top-${monthName.toLowerCase()}-${year}.ics`;
      calTitle = `Orate Top ${monthName} ${year} - Laguna Venezia`;
    } else if (exportScope === 'all_month') {
      filename = `orate-${monthName.toLowerCase()}-${year}.ics`;
      calTitle = `Orate Laguna Venezia ${monthName} ${year}`;
    }

    const icsContent = generateFishingICS(eventsToExport, calTitle);
    downloadICSFile(filename, icsContent);
    setIsExported(true);
    setTimeout(() => {
      setIsExported(false);
      onClose();
    }, 1800);
  };

  const topDaysCount = monthDaysData.filter(
    (d) => d.ratingLevel === 'eccellente' || d.ratingLevel === 'ottimo'
  ).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-850">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-600/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
              <CalendarIcon className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-50">
                Esporta nel tuo Calendario (.ics)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Compatibile con Google Calendar, Apple Calendar, Outlook
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 text-sm">
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            Gli orari delle migliori finestre di pesca per l'orata, con escursione di marea ZMPS, esche consigliate e promemoria verranno sincronizzati nel tuo calendario.
          </p>

          <div className="space-y-2.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
              Seleziona intervallo da esportare:
            </label>

            {/* Option 1: Selected day */}
            <div
              onClick={() => setExportScope('single')}
              className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                exportScope === 'single'
                  ? 'border-cyan-500 bg-cyan-50/50 dark:bg-cyan-950/20 ring-1 ring-cyan-500'
                  : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850'
              }`}
            >
              <input
                type="radio"
                name="exportScope"
                checked={exportScope === 'single'}
                onChange={() => setExportScope('single')}
                className="mt-0.5 text-cyan-600 focus:ring-cyan-500"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                    Solo il giorno selezionato ({selectedDayData.dateString})
                  </span>
                  <span className="text-[11px] font-medium text-cyan-600 dark:text-cyan-400">
                    {selectedDayData.bestWindows.length} finestre
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {selectedDayData.ratingLabel} • Marea {selectedDayData.isSizigia ? 'Sizigiale' : 'Regolare'}
                </p>
              </div>
            </div>

            {/* Option 2: Top days of month */}
            <div
              onClick={() => setExportScope('top_month')}
              className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                exportScope === 'top_month'
                  ? 'border-cyan-500 bg-cyan-50/50 dark:bg-cyan-950/20 ring-1 ring-cyan-500'
                  : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850'
              }`}
            >
              <input
                type="radio"
                name="exportScope"
                checked={exportScope === 'top_month'}
                onChange={() => setExportScope('top_month')}
                className="mt-0.5 text-cyan-600 focus:ring-cyan-500"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    Tutti i Giorni TOP di {monthName} (★★★ e ★★)
                  </span>
                  <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                    {topDaysCount} giorni
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Esporta solo le giornate con rating Eccellente e Ottimo (ideale per non intasare il calendario).
                </p>
              </div>
            </div>

            {/* Option 3: Full month */}
            <div
              onClick={() => setExportScope('all_month')}
              className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                exportScope === 'all_month'
                  ? 'border-cyan-500 bg-cyan-50/50 dark:bg-cyan-950/20 ring-1 ring-cyan-500'
                  : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850'
              }`}
            >
              <input
                type="radio"
                name="exportScope"
                checked={exportScope === 'all_month'}
                onChange={() => setExportScope('all_month')}
                className="mt-0.5 text-cyan-600 focus:ring-cyan-500"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                    Intero Mese di {monthName} {year}
                  </span>
                  <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400">
                    {monthDaysData.length} giorni
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Tutte le finestre orarie calcolate per l'intero mese.
                </p>
              </div>
            </div>
          </div>

          {/* Quick instructions */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-300 space-y-1">
            <span className="font-semibold text-slate-800 dark:text-slate-200 block">
              Come importare il file .ics scaricato:
            </span>
            <ul className="list-disc list-inside space-y-0.5 text-slate-500 dark:text-slate-400">
              <li><strong>Google Calendar:</strong> Impostazioni &gt; Importa ed esporta &gt; Carica il file scaricato.</li>
              <li><strong>iPhone / Apple Calendar / Mac:</strong> Fai doppio clic sul file .ics scaricato per aggiungerlo automaticamente.</li>
              <li><strong>Notifiche:</strong> Ogni evento include un avviso preimpostato 60 minuti prima.</li>
            </ul>
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Annulla
            </button>
            <button
              type="button"
              id="btn-download-ics-confirm"
              onClick={handleExport}
              disabled={eventsToExport.length === 0}
              className="px-5 py-2.5 text-xs sm:text-sm font-semibold text-white bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-700 disabled:opacity-50 rounded-xl transition-all flex items-center gap-2 shadow-md shadow-cyan-900/30"
            >
              {isExported ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  <span>File Scaricato!</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Scarica File .ics ({eventsToExport.length} eventi)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
