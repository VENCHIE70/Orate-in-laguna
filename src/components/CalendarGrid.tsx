import React from 'react';
import { DayFishingData, FishingTripNote } from '../types';
import { MoonIcon } from './MoonIcon';
import { Sparkles, Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight, Bookmark } from 'lucide-react';

interface CalendarGridProps {
  currentYear: number;
  currentMonth: number; // 0-11
  daysData: DayFishingData[];
  selectedDateString: string;
  onSelectDate: (day: DayFishingData) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onJumpToSeason: (month: number) => void;
  savedTrips: FishingTripNote[];
  filterLevel: 'all' | 'top_only' | 'sizigia_only';
  onFilterChange: (level: 'all' | 'top_only' | 'sizigia_only') => void;
}

const MONTH_NAMES = [
  'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
  'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
];

const WEEKDAY_NAMES = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];

export const CalendarGrid: React.FC<CalendarGridProps> = ({
  currentYear,
  currentMonth,
  daysData,
  selectedDateString,
  onSelectDate,
  onPrevMonth,
  onNextMonth,
  onJumpToSeason,
  savedTrips,
  filterLevel,
  onFilterChange,
}) => {
  // First day of month offset (0 = Sunday, 1 = Monday, etc.)
  const firstDay = new Date(currentYear, currentMonth, 1);
  let startingDayOfWeek = firstDay.getDay() - 1; // 0 for Monday, 6 for Sunday
  if (startingDayOfWeek === -1) startingDayOfWeek = 6;

  const today = new Date();
  const isCurrentMonthThisMonth =
    today.getFullYear() === currentYear && today.getMonth() === currentMonth;
  const todayDateString = today.toISOString().split('T')[0];

  // Helper for rating colors & styling
  const getRatingBadge = (day: DayFishingData) => {
    switch (day.ratingLevel) {
      case 'eccellente':
        return {
          bg: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
          dot: 'bg-emerald-500',
          border: 'hover:border-emerald-500/50',
          tag: 'Eccellente',
        };
      case 'ottimo':
        return {
          bg: 'bg-teal-500/15 text-teal-700 dark:text-teal-300 border-teal-500/30',
          dot: 'bg-teal-500',
          border: 'hover:border-teal-500/50',
          tag: 'Ottimo',
        };
      case 'buono':
        return {
          bg: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
          dot: 'bg-amber-500',
          border: 'hover:border-amber-500/50',
          tag: 'Buono',
        };
      case 'medio':
        return {
          bg: 'bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-500/30',
          dot: 'bg-slate-400',
          border: 'hover:border-slate-400/50',
          tag: 'Medio',
        };
      default:
        return {
          bg: 'bg-slate-200 dark:bg-slate-800 text-slate-500 border-slate-300 dark:border-slate-700',
          dot: 'bg-slate-400',
          border: 'hover:border-slate-400/30',
          tag: 'Basso',
        };
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 sm:p-6 transition-all">
      {/* Month Navigation & Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-50">
              {MONTH_NAMES[currentMonth]} {currentYear}
            </h2>
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1 border border-slate-200 dark:border-slate-700">
              <button
                id="btn-prev-month"
                onClick={onPrevMonth}
                aria-label="Mese precedente"
                className="p-1.5 rounded-md hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                id="btn-next-month"
                onClick={onNextMonth}
                aria-label="Mese successivo"
                className="p-1.5 rounded-md hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Seleziona un giorno per vedere l'analisi oraria, le finestre di marea e le esche consigliate.
          </p>
        </div>

        {/* Quick Season Jump & Filter Chips */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Today button */}
          <button
            id="btn-jump-today"
            onClick={() => {
              const now = new Date();
              if (now.getMonth() !== currentMonth || now.getFullYear() !== currentYear) {
                onJumpToSeason(now.getMonth());
              }
            }}
            className="px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
          >
            Oggi
          </button>

          {/* Quick jump to peak autumn season */}
          <button
            id="btn-season-autumn"
            onClick={() => onJumpToSeason(8)} // Settembre
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
              currentMonth === 8 || currentMonth === 9
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 hover:bg-amber-100'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Picco Autunno (Sett-Ott)
          </button>

          {/* Quick jump to spring montada */}
          <button
            id="btn-season-spring"
            onClick={() => onJumpToSeason(4)} // Maggio
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              currentMonth === 4 || currentMonth === 5
                ? 'bg-teal-600 text-white shadow-sm'
                : 'bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300 border border-teal-300 dark:border-teal-800 hover:bg-teal-100'
            }`}
          >
            Primavera (Mag-Giu)
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 mr-1">Filtra:</span>
        <button
          id="filter-all"
          onClick={() => onFilterChange('all')}
          className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
            filterLevel === 'all'
              ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Tutti i giorni ({daysData.length})
        </button>
        <button
          id="filter-top"
          onClick={() => onFilterChange('top_only')}
          className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors flex items-center gap-1 ${
            filterLevel === 'top_only'
              ? 'bg-emerald-600 text-white'
              : 'text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
          }`}
        >
          <span>★★★ Giorni Top & Ottimi</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-700/20">
            {daysData.filter((d) => d.ratingLevel === 'eccellente' || d.ratingLevel === 'ottimo').length}
          </span>
        </button>
        <button
          id="filter-sizigia"
          onClick={() => onFilterChange('sizigia_only')}
          className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors flex items-center gap-1 ${
            filterLevel === 'sizigia_only'
              ? 'bg-indigo-600 text-white'
              : 'text-indigo-700 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40'
          }`}
        >
          <span>Maree di Sizigia (Luna Nuova/Piena)</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-indigo-700/20">
            {daysData.filter((d) => d.isSizigia).length}
          </span>
        </button>
      </div>

      {/* Weekday Header */}
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2 mb-2 text-center text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
        {WEEKDAY_NAMES.map((name, i) => (
          <div key={name} className={i >= 5 ? 'text-amber-500/80' : ''}>
            {name}
          </div>
        ))}
      </div>

      {/* Month Calendar Grid */}
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {/* Leading empty days */}
        {Array.from({ length: startingDayOfWeek }).map((_, i) => (
          <div
            key={`empty-${i}`}
            className="min-h-[90px] sm:min-h-[110px] rounded-xl bg-slate-50/50 dark:bg-slate-900/40 border border-transparent opacity-30 pointer-events-none"
          />
        ))}

        {/* Days of Month */}
        {daysData.map((day) => {
          const isSelected = day.dateString === selectedDateString;
          const isToday = isCurrentMonthThisMonth && day.dateString === todayDateString;
          const badge = getRatingBadge(day);
          const hasSavedTrip = savedTrips.some((t) => t.dateString === day.dateString);

          // Filtering check
          const isDimmed =
            (filterLevel === 'top_only' && day.ratingLevel !== 'eccellente' && day.ratingLevel !== 'ottimo') ||
            (filterLevel === 'sizigia_only' && !day.isSizigia);

          // Find first high tide for quick display
          const firstHighTide = day.extremes.find((e) => e.type === 'high');

          return (
            <div
              key={day.dateString}
              id={`calendar-day-${day.dateString}`}
              onClick={() => onSelectDate(day)}
              className={`group relative flex flex-col justify-between p-2 sm:p-2.5 rounded-xl border transition-all cursor-pointer min-h-[95px] sm:min-h-[115px] select-none ${
                isSelected
                  ? 'border-cyan-500 dark:border-cyan-400 ring-2 ring-cyan-500/30 bg-cyan-50/50 dark:bg-cyan-950/20 shadow-md'
                  : isDimmed
                  ? 'opacity-35 grayscale-[50%] bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
                  : 'bg-white dark:bg-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-800 ' + badge.border
              }`}
            >
              {/* Card Header: Day number + Moon phase */}
              <div className="flex items-center justify-between gap-1">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-sm sm:text-base font-bold ${
                      isToday
                        ? 'w-6 h-6 rounded-full bg-cyan-600 text-white flex items-center justify-center text-xs'
                        : isSelected
                        ? 'text-cyan-700 dark:text-cyan-300 font-extrabold'
                        : 'text-slate-800 dark:text-slate-100'
                    }`}
                  >
                    {day.date.getDate()}
                  </span>
                  {hasSavedTrip && (
                    <span title="Uscita pianificata">
                      <Bookmark className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1" title={`${day.moonPhaseLabel} (${day.moonIllumination}%)`}>
                  <MoonIcon phase={day.moonPhase} illumination={day.moonIllumination} size={15} />
                </div>
              </div>

              {/* Middle: Orata Rating Badge & Stars */}
              <div className="my-1">
                <div
                  className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] sm:text-xs font-semibold border ${badge.bg}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`}></span>
                  <span>{day.overallScore}%</span>
                  <span className="hidden sm:inline">• {'★'.repeat(day.stars)}</span>
                </div>

                {/* Sizigia tag */}
                {day.isSizigia && (
                  <div className="text-[9px] font-medium text-indigo-600 dark:text-indigo-400 mt-0.5 truncate">
                    Marea Sizigia
                  </div>
                )}
              </div>

              {/* Bottom: Best hours hint or tide peak */}
              <div className="text-[10px] text-slate-500 dark:text-slate-400 space-y-0.5">
                {day.bestWindows.length > 0 ? (
                  <div className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300 truncate">
                    <Clock className="w-3 h-3 text-cyan-600 shrink-0" />
                    <span className="truncate">
                      {day.bestWindows[0].startHour}-{day.bestWindows[0].endHour}
                    </span>
                  </div>
                ) : (
                  <div className="truncate">Attività ridotta</div>
                )}

                {firstHighTide && (
                  <div className="text-[9px] text-slate-400 truncate">
                    Colmo: {firstHighTide.time} ({firstHighTide.heightCm > 0 ? `+${firstHighTide.heightCm}` : firstHighTide.heightCm}cm)
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
