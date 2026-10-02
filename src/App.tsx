import React, { useState, useMemo, useEffect } from 'react';
import { DayFishingData, FishingTripNote } from './types';
import { getMonthFishingData } from './utils/orataModel';
import { CalendarGrid } from './components/CalendarGrid';
import { DayDetailView } from './components/DayDetailView';
import { SpotGuideModal } from './components/SpotGuideModal';
import { ExportIcsModal } from './components/ExportIcsModal';
import { TripPlannerModal } from './components/TripPlannerModal';
import {
  Compass,
  Calendar as CalendarIcon,
  Download,
  Bookmark,
  MapPin,
  Waves,
  Sparkles,
  Info,
  ChevronRight,
  Fish,
} from 'lucide-react';

const MONTH_NAMES = [
  'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
  'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre',
];

export default function App() {
  const initialDate = useMemo(() => new Date(), []);
  const [currentYear, setCurrentYear] = useState<number>(initialDate.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(initialDate.getMonth()); // 0-11
  const [filterLevel, setFilterLevel] = useState<'all' | 'top_only' | 'sizigia_only'>('all');

  // Load saved trips from localStorage
  const [savedTrips, setSavedTrips] = useState<FishingTripNote[]>(() => {
    try {
      const stored = localStorage.getItem('laguna_orate_saved_trips');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Modals state
  const [isSpotGuideOpen, setIsSpotGuideOpen] = useState<boolean>(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [isTripModalOpen, setIsTripModalOpen] = useState<boolean>(false);
  const [showSavedTripsDrawer, setShowSavedTripsDrawer] = useState<boolean>(false);

  // Compute month data
  const daysData = useMemo(() => {
    return getMonthFishingData(currentYear, currentMonth);
  }, [currentYear, currentMonth]);

  // Selected date state (defaults to today if in current month, or the 1st of month)
  const defaultDateString = useMemo(() => {
    const today = new Date();
    if (today.getFullYear() === currentYear && today.getMonth() === currentMonth) {
      return today.toISOString().split('T')[0];
    }
    const firstDay = daysData[0];
    return firstDay ? firstDay.dateString : '';
  }, [currentYear, currentMonth, daysData]);

  const [selectedDateString, setSelectedDateString] = useState<string>(defaultDateString);

  // Synchronize selectedDateString when month/year changes
  useEffect(() => {
    const exists = daysData.some((d) => d.dateString === selectedDateString);
    if (!exists && daysData.length > 0) {
      const todayStr = new Date().toISOString().split('T')[0];
      const todayInMonth = daysData.find((d) => d.dateString === todayStr);
      setSelectedDateString(todayInMonth ? todayInMonth.dateString : daysData[0].dateString);
    }
  }, [daysData, selectedDateString]);

  // Save trips to localStorage
  const handleSaveTrip = (trip: FishingTripNote) => {
    setSavedTrips((prev) => {
      const existingIdx = prev.findIndex((t) => t.id === trip.id || t.dateString === trip.dateString);
      let updated: FishingTripNote[];
      if (existingIdx >= 0) {
        updated = [...prev];
        updated[existingIdx] = trip;
      } else {
        updated = [trip, ...prev];
      }
      try {
        localStorage.setItem('laguna_orate_saved_trips', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const handleDeleteTrip = (tripId: string) => {
    setSavedTrips((prev) => {
      const updated = prev.filter((t) => t.id !== tripId);
      try {
        localStorage.setItem('laguna_orate_saved_trips', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleJumpToSeason = (targetMonth: number) => {
    setCurrentMonth(targetMonth);
  };

  // Currently active selected day object
  const selectedDayData: DayFishingData = useMemo(() => {
    const match = daysData.find((d) => d.dateString === selectedDateString);
    return match || daysData[0] || getMonthFishingData(currentYear, currentMonth)[0];
  }, [daysData, selectedDateString, currentYear, currentMonth]);

  const currentSavedTrip = useMemo(() => {
    return savedTrips.find((t) => t.dateString === selectedDayData.dateString);
  }, [savedTrips, selectedDayData.dateString]);

  return (
    <div id="laguna-orate-app" className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased flex flex-col">
      {/* TOP NAVIGATION / APP HEADER */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Brand Identity */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-600 text-white flex items-center justify-center shadow-md shadow-cyan-600/30">
              <Fish className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white">
                  Laguna Orate
                </span>
                <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800">
                  Venezia ZMPS
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden xs:block">
                Calendario Maree, Solunare & Orari Migliori per Sparus aurata
              </p>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Guide Spot Modal Trigger */}
            <button
              id="btn-open-spot-guide"
              onClick={() => setIsSpotGuideOpen(true)}
              className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Compass className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <span className="hidden md:inline">Guida Spot & Esche</span>
              <span className="md:hidden">Spot</span>
            </button>

            {/* Saved Trips Drawer Trigger */}
            <button
              id="btn-open-saved-trips"
              onClick={() => setShowSavedTripsDrawer(!showSavedTripsDrawer)}
              className="relative px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Bookmark className="w-4 h-4 text-amber-500" />
              <span className="hidden sm:inline">Uscite</span>
              {savedTrips.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] flex items-center justify-center">
                  {savedTrips.length}
                </span>
              )}
            </button>

            {/* Export .ics Action */}
            <button
              id="btn-open-export-ics"
              onClick={() => setIsExportModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-cyan-900/30 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Esporta .ics</span>
            </button>
          </div>
        </div>
      </header>

      {/* SAVED TRIPS DRAWER / NOTIFICATION BAR IF OPEN */}
      {showSavedTripsDrawer && (
        <div className="bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-900/50 p-4 transition-all">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-amber-600 fill-amber-600" />
              <span className="text-xs sm:text-sm font-bold text-amber-900 dark:text-amber-200">
                Uscite di Pesca Pianificate ({savedTrips.length})
              </span>
            </div>

            {savedTrips.length === 0 ? (
              <p className="text-xs text-amber-800 dark:text-amber-300">
                Non hai ancora salvato uscite. Clicca su "Pianifica Uscita" in qualsiasi giorno per annotare spot, esche e orari.
              </p>
            ) : (
              <div className="flex flex-wrap items-center gap-2 overflow-x-auto w-full md:w-auto">
                {savedTrips.map((trip) => (
                  <div
                    key={trip.id}
                    onClick={() => {
                      setSelectedDateString(trip.dateString);
                      const [y, m] = trip.dateString.split('-').map(Number);
                      setCurrentYear(y);
                      setCurrentMonth(m - 1);
                    }}
                    className="flex items-center gap-2 px-3 py-1 rounded-lg bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-800 text-xs cursor-pointer hover:border-amber-500 transition-colors shadow-xs"
                  >
                    <span className="font-bold text-slate-800 dark:text-slate-100">{trip.dateString}</span>
                    <span className="text-slate-500">•</span>
                    <span className="text-cyan-700 dark:text-cyan-400 truncate max-w-[130px]">{trip.spotName}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteTrip(trip.id);
                      }}
                      className="text-slate-400 hover:text-rose-500 ml-1 font-bold"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MAIN CONTAINER */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Calendar Grid Section */}
        <section aria-label="Calendario mensile maree orate">
          <CalendarGrid
            currentYear={currentYear}
            currentMonth={currentMonth}
            daysData={daysData}
            selectedDateString={selectedDateString}
            onSelectDate={(day) => setSelectedDateString(day.dateString)}
            onPrevMonth={handlePrevMonth}
            onNextMonth={handleNextMonth}
            onJumpToSeason={handleJumpToSeason}
            savedTrips={savedTrips}
            filterLevel={filterLevel}
            onFilterChange={setFilterLevel}
          />
        </section>

        {/* Selected Day In-Depth Fishing & Tidal Analysis */}
        <section aria-label="Dettagli e orari del giorno selezionato">
          <DayDetailView
            dayData={selectedDayData}
            onOpenTripModal={() => setIsTripModalOpen(true)}
            savedTrip={currentSavedTrip}
            onOpenSpotGuide={() => setIsSpotGuideOpen(true)}
          />
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 mt-12 text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Laguna Orate • Calendario di Pesca Venezia
            </span>
            <p className="mt-0.5 text-[11px]">
              Dati mareali su modello armonico ZMPS Punta della Salute. Regolamentazioni vigenti della Città Metropolitana di Venezia e Laguna Nord/Sud.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSpotGuideOpen(true)}
              className="hover:underline text-cyan-600 dark:text-cyan-400"
            >
              Spot & Esche
            </button>
            <span>•</span>
            <button
              onClick={() => setIsExportModalOpen(true)}
              className="hover:underline text-cyan-600 dark:text-cyan-400"
            >
              Esporta Calendario (.ics)
            </button>
          </div>
        </div>
      </footer>

      {/* MODALS */}
      <SpotGuideModal
        isOpen={isSpotGuideOpen}
        onClose={() => setIsSpotGuideOpen(false)}
      />

      <ExportIcsModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        selectedDayData={selectedDayData}
        monthDaysData={daysData}
        monthName={MONTH_NAMES[currentMonth]}
        year={currentYear}
      />

      <TripPlannerModal
        isOpen={isTripModalOpen}
        onClose={() => setIsTripModalOpen(false)}
        dayData={selectedDayData}
        savedTrip={currentSavedTrip}
        onSaveTrip={handleSaveTrip}
        onDeleteTrip={handleDeleteTrip}
      />
    </div>
  );
}
