import { TideExtremum, TidePoint } from '../types';
import { getJulianDate } from './astronomy';

/**
 * Venice Lagoon Astronomical Tide Model (calibrated to Punta della Salute - ZMPS)
 * Harmonic synthesis of M2, S2, K1, O1 components with seasonal Adriatic sea level bias.
 */

// Angular speeds in radians per hour
const SPEED_M2 = (2 * Math.PI) / 12.4206012; // Principal lunar semi-diurnal
const SPEED_S2 = (2 * Math.PI) / 12.0000000; // Principal solar semi-diurnal
const SPEED_K1 = (2 * Math.PI) / 23.9344721; // Lunar diurnal
const SPEED_O1 = (2 * Math.PI) / 25.8193417; // Lunar diurnal

// Baseline amplitudes in cm for Venice Punta della Salute
const AMP_M2 = 25.5;
const AMP_S2 = 14.0;
const AMP_K1 = 18.2;
const AMP_O1 = 5.5;

// Reference epoch: 2000-01-01 00:00:00 UTC (JD 2451544.5)
const JD_EPOCH = 2451544.5;
const PHASE_M2 = 1.25;
const PHASE_S2 = 0.85;
const PHASE_K1 = 2.10;
const PHASE_O1 = 0.45;

/**
 * Calculates water level in cm at Punta della Salute at a given Date & hour fraction
 */
export function getVeniceTideHeight(date: Date, hourFraction: number): number {
  const jd = getJulianDate(date) + (hourFraction / 24);
  const hoursSinceEpoch = (jd - JD_EPOCH) * 24;

  // Seasonal mean sea level variation in Venice (autumn/winter is slightly higher by +5 to +12cm)
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);
  const seasonalBias = 5.0 * Math.sin(((dayOfYear - 120) * 2 * Math.PI) / 365) + 25; // average mean sea level ~ +25cm ZMPS

  const h =
    AMP_M2 * Math.cos(SPEED_M2 * hoursSinceEpoch - PHASE_M2) +
    AMP_S2 * Math.cos(SPEED_S2 * hoursSinceEpoch - PHASE_S2) +
    AMP_K1 * Math.cos(SPEED_K1 * hoursSinceEpoch - PHASE_K1) +
    AMP_O1 * Math.cos(SPEED_O1 * hoursSinceEpoch - PHASE_O1) +
    seasonalBias;

  return Math.round(h * 10) / 10;
}

/**
 * Calculates the rate of change dH/dt (cm per hour)
 * Positive = Marea Montante (rising)
 * Negative = Marea Calante (falling)
 */
export function getVeniceTideDerivative(date: Date, hourFraction: number): number {
  const dt = 0.1; // 6 minutes
  const h1 = getVeniceTideHeight(date, hourFraction - dt / 2);
  const h2 = getVeniceTideHeight(date, hourFraction + dt / 2);
  return (h2 - h1) / dt;
}

/**
 * Finds all tide extremums (Colmi and Secche) for a full 24-hour day (with 2-hour buffer)
 */
export function getVeniceTideExtremes(date: Date): TideExtremum[] {
  const extremes: TideExtremum[] = [];
  const step = 0.05; // ~3 minute resolution for peak detection

  let prevDerivative = getVeniceTideDerivative(date, 0);

  for (let t = 0.1; t <= 24.0; t += step) {
    const deriv = getVeniceTideDerivative(date, t);

    // Zero-crossing check
    if ((prevDerivative > 0 && deriv <= 0) || (prevDerivative >= 0 && deriv < 0)) {
      // High Tide (Colmo)
      const height = getVeniceTideHeight(date, t);
      extremes.push({
        time: formatHour(t),
        hourFraction: Math.round(t * 100) / 100,
        heightCm: Math.round(height),
        type: 'high',
        label: 'Colmo di Marea',
      });
    } else if ((prevDerivative < 0 && deriv >= 0) || (prevDerivative <= 0 && deriv > 0)) {
      // Low Tide (Secca)
      const height = getVeniceTideHeight(date, t);
      extremes.push({
        time: formatHour(t),
        hourFraction: Math.round(t * 100) / 100,
        heightCm: Math.round(height),
        type: 'low',
        label: 'Secca (Bassa Marea)',
      });
    }
    prevDerivative = deriv;
  }

  return extremes;
}

/**
 * Generates 24-hour points (e.g. every 15 or 30 minutes) for rendering graphs and curves
 */
export function getVeniceTide24hCurve(date: Date, sampleCount: number = 48): TidePoint[] {
  const points: TidePoint[] = [];
  const step = 24 / sampleCount;

  for (let i = 0; i <= sampleCount; i++) {
    const hourFraction = Math.min(24, i * step);
    const heightCm = getVeniceTideHeight(date, hourFraction);
    const deriv = getVeniceTideDerivative(date, hourFraction);

    let trend: TidePoint['trend'];
    if (Math.abs(deriv) < 1.8) {
      trend = heightCm > 25 ? 'slack_high' : 'slack_low';
    } else if (deriv > 0) {
      trend = 'rising';
    } else {
      trend = 'falling';
    }

    // Relative current velocity 0..100
    const currentSpeed = Math.min(100, Math.round(Math.abs(deriv) * 7.5));

    points.push({
      time: formatHour(hourFraction),
      hourFraction,
      heightCm,
      trend,
      currentSpeed,
    });
  }

  return points;
}

function formatHour(fraction: number): string {
  let normalized = fraction % 24;
  if (normalized < 0) normalized += 24;
  const h = Math.floor(normalized);
  const m = Math.floor((normalized - h) * 60);
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}
