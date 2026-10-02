import { MoonPhaseName } from '../types';

// Coordinates for Venice Lagoon (Piazza San Marco / Punta della Salute)
export const VENICE_LAT = 45.4408;
export const VENICE_LNG = 12.3155;

/**
 * Calculates Julian Day Number from a standard Date
 */
export function getJulianDate(date: Date): number {
  const time = date.getTime();
  return time / 86400000 + 2440587.5;
}

/**
 * Calculates Moon Phase, age in days (0..29.53), and illumination percentage
 */
export function getMoonDetails(date: Date): {
  phase: MoonPhaseName;
  phaseLabel: string;
  ageDays: number;
  illumination: number;
  isSizigia: boolean;
  isQuadratura: boolean;
} {
  // Reference new moon: Jan 6, 2000, 18:14 UTC (JD 2451549.26)
  const jd = getJulianDate(date);
  const synodicMonth = 29.53058867;
  const daysSinceRef = jd - 2451549.26;
  let age = daysSinceRef % synodicMonth;
  if (age < 0) age += synodicMonth;

  // Illumination calculation (approx. sinusoidal)
  const phaseAngle = (age / synodicMonth) * 2 * Math.PI;
  const illumination = Math.round(((1 - Math.cos(phaseAngle)) / 2) * 100);

  let phase: MoonPhaseName;
  let phaseLabel: string;

  // 8 phases with Italian labels
  if (age < 1.84) {
    phase = 'new_moon';
    phaseLabel = 'Luna Nuova (Sizigia)';
  } else if (age < 5.53) {
    phase = 'waxing_crescent';
    phaseLabel = 'Luna Crescente';
  } else if (age < 9.22) {
    phase = 'first_quarter';
    phaseLabel = 'Primo Quarto (Quadratura)';
  } else if (age < 12.91) {
    phase = 'waxing_gibbous';
    phaseLabel = 'Gibbosa Crescente';
  } else if (age < 16.61) {
    phase = 'full_moon';
    phaseLabel = 'Luna Piena (Sizigia)';
  } else if (age < 20.30) {
    phase = 'waning_gibbous';
    phaseLabel = 'Gibbosa Calante';
  } else if (age < 23.99) {
    phase = 'last_quarter';
    phaseLabel = 'Ultimo Quarto (Quadratura)';
  } else if (age < 27.68) {
    phase = 'waning_crescent';
    phaseLabel = 'Luna Calante';
  } else {
    phase = 'new_moon';
    phaseLabel = 'Luna Nuova (Sizigia)';
  }

  // Sizigia = within ~2.5 days of new or full moon
  const isSizigia = age <= 2.2 || (age >= 13.5 && age <= 16.5) || age >= 27.5;
  // Quadratura = within ~2 days of first or last quarter
  const isQuadratura = (age >= 6.5 && age <= 8.5) || (age >= 21.0 && age <= 23.0);

  return {
    phase,
    phaseLabel,
    ageDays: Math.round(age * 10) / 10,
    illumination,
    isSizigia,
    isQuadratura,
  };
}

/**
 * Calculates Sunrise and Sunset for Venice on a given date (local solar approximation)
 */
export function getSunTimes(date: Date): {
  sunriseTime: string;
  sunsetTime: string;
  sunriseFraction: number;
  sunsetFraction: number;
} {
  const dayOfYear = getDayOfYear(date);
  // Declination of the sun
  const declination = -23.44 * Math.cos(((2 * Math.PI) / 365) * (dayOfYear + 10));
  const latRad = (VENICE_LAT * Math.PI) / 180;
  const decRad = (declination * Math.PI) / 180;

  // Hour angle
  const cosH0 = -Math.tan(latRad) * Math.tan(decRad);
  // Clamp between -1 and 1
  const clampedCosH0 = Math.max(-1, Math.min(1, cosH0));
  const H0 = (Math.acos(clampedCosH0) * 180) / Math.PI;

  // Solar noon in Venice (approx 12:15 + equation of time and DST)
  const isDST = isDaylightSavingTime(date);
  const tzOffset = isDST ? 2 : 1;
  const solarNoonHour = 12 - (VENICE_LNG - 15 * tzOffset) / 15;

  const sunriseHour = solarNoonHour - H0 / 15;
  const sunsetHour = solarNoonHour + H0 / 15;

  return {
    sunriseTime: formatHourFraction(sunriseHour),
    sunsetTime: formatHourFraction(sunsetHour),
    sunriseFraction: sunriseHour,
    sunsetFraction: sunsetHour,
  };
}

export function formatHourFraction(fraction: number): string {
  let normalized = fraction % 24;
  if (normalized < 0) normalized += 24;
  const h = Math.floor(normalized);
  const m = Math.floor((normalized - h) * 60);
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

function isDaylightSavingTime(date: Date): boolean {
  // Central European Time DST: last Sunday of March to last Sunday of October
  const month = date.getMonth();
  if (month < 2 || month > 9) return false;
  if (month > 2 && month < 9) return true;
  
  // In March and October:
  const day = date.getDate();
  const dayOfWeek = date.getDay();
  // Find last Sunday
  const lastSunday = day - dayOfWeek;
  if (month === 2) {
    return day >= 25 && dayOfWeek === 0 ? true : day > (31 - ((dayOfWeek + 31 - day) % 7));
  } else {
    return day < (31 - ((dayOfWeek + 31 - day) % 7));
  }
}
