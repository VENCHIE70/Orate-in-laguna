import React, { useState, useEffect } from 'react';
import { DayFishingData, FishingTripNote } from '../types';
import { VENICE_SPOTS } from '../data/veniceSpots';
import { Bookmark, X, Clock, MapPin, Fish, Calendar as CalendarIcon, Check } from 'lucide-react';

interface TripPlannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  dayData: DayFishingData | null;
  savedTrip?: FishingTripNote;
  onSaveTrip: (trip: FishingTripNote) => void;
  onDeleteTrip?: (id: string) => void;
}

export const TripPlannerModal: React.FC<TripPlannerModalProps> = ({
  isOpen,
  onClose,
  dayData,
  savedTrip,
  onSaveTrip,
  onDeleteTrip,
}) => {
  const [spotName, setSpotName] = useState<string>('');
  const [plannedTime, setPlannedTime] = useState<string>('');
  const [baitUsed, setBaitUsed] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    if (savedTrip) {
      setSpotName(savedTrip.spotName);
      setPlannedTime(savedTrip.plannedTime);
      setBaitUsed(savedTrip.baitUsed || '');
      setNotes(savedTrip.notes);
    } else if (dayData) {
      // Default to the first best window time and recommended bait
      const firstWin = dayData.bestWindows[0];
      setSpotName(VENICE_SPOTS[0].name);
      setPlannedTime(firstWin ? `${firstWin.startHour} - ${firstWin.endHour}` : '06:00 - 09:00');
      setBaitUsed(dayData.topRecommendedBait.split('(')[0].trim());
      setNotes('');
    }
  }, [savedTrip, dayData, isOpen]);

  if (!isOpen || !dayData) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trip: FishingTripNote = {
      id: savedTrip ? savedTrip.id : `trip-${Date.now()}`,
      dateString: dayData.dateString,
      spotName,
      plannedTime,
      baitUsed,
      notes,
      createdAt: savedTrip ? savedTrip.createdAt : Date.now(),
    };
    onSaveTrip(trip);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-850">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-600/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
              <Bookmark className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-50">
                {savedTrip ? 'Modifica Uscita di Pesca' : 'Pianifica Uscita per Orata'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {dayData.dateString} • {dayData.ratingLabel}
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-sm">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-cyan-600" /> Spot Prescelto
            </label>
            <select
              value={spotName}
              onChange={(e) => setSpotName(e.target.value)}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-800 dark:text-slate-100 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              {VENICE_SPOTS.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name} ({s.zone})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-500" /> Orario / Finestra di Pesca
            </label>
            <input
              type="text"
              value={plannedTime}
              onChange={(e) => setPlannedTime(e.target.value)}
              placeholder="es. 06:00 - 09:30 (Marea montante)"
              required
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-800 dark:text-slate-100 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <Fish className="w-3.5 h-3.5 text-emerald-500" /> Esche Portate
            </label>
            <input
              type="text"
              value={baitUsed}
              onChange={(e) => setBaitUsed(e.target.value)}
              placeholder="es. Granchio verde vivo, bibi, peòci"
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-800 dark:text-slate-100 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Note Personali & Tattica
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="es. Canna da beach ledgering, piombo 70g sul ciglio della secca, barca ancorata vicino alla briccola..."
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-800 dark:text-slate-100 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div className="pt-2 flex items-center justify-between gap-3">
            {savedTrip && onDeleteTrip ? (
              <button
                type="button"
                onClick={() => {
                  onDeleteTrip(savedTrip.id);
                  onClose();
                }}
                className="px-3 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors"
              >
                Elimina Uscita
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                Annulla
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-xl transition-colors flex items-center gap-1.5 shadow-md shadow-cyan-900/30"
              >
                <Check className="w-4 h-4" />
                <span>{savedTrip ? 'Salva Modifiche' : 'Memorizza Uscita'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
