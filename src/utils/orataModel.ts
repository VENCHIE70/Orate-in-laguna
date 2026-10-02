import {
  BestFishingWindow,
  DayFishingData,
  FishingRatingLevel,
  HourFishingData,
} from '../types';
import {
  formatHourFraction,
  getMoonDetails,
  getSunTimes,
} from './astronomy';
import {
  getVeniceTide24hCurve,
  getVeniceTideDerivative,
  getVeniceTideExtremes,
  getVeniceTideHeight,
} from './veniceTides';

/**
 * Biological seasonality multiplier for Gilthead Seabream (Orata) inside the Venice Lagoon
 */
export function getVeniceOrataSeasonality(date: Date): {
  scoreMultiplier: number;
  description: string;
  waterTemp: number;
} {
  const month = date.getMonth(); // 0 = Jan, 8 = Sep, 9 = Oct
  const day = date.getDate();

  switch (month) {
    case 0: // Gennaio
      return {
        scoreMultiplier: 0.30,
        description: 'Bassa stagione: le orate adulte sono migrate nel mare Adriatico profondo per svernare e riprodursi. Pochi esemplari stazionari nei canali più profondi.',
        waterTemp: 7.5,
      };
    case 1: // Febbraio
      return {
        scoreMultiplier: 0.35,
        description: 'Acqua fredda in laguna (<9°C). Attività ridottissima, orate perlopiù in mare aperto.',
        waterTemp: 8.2,
      };
    case 2: // Marzo
      return {
        scoreMultiplier: 0.50,
        description: 'Inizio risveglio: con i primi tepori primaverili iniziano ad affacciarsi le prime oratelle dalle bocche di porto.',
        waterTemp: 11.5,
      };
    case 3: // Aprile
      return {
        scoreMultiplier: 0.75,
        description: 'Inizio della "Montada": branchi di orate risalgono l\'Adriatico ed entrano dalle bocche di porto di Malamocco, Lido e Chioggia alla ricerca di cibo.',
        waterTemp: 15.0,
      };
    case 4: // Maggio
      return {
        scoreMultiplier: 0.90,
        description: 'Piena stagione primaverile: appetito vorace dopo la migrazione. Si nutrono attivamente di cozze, granchi e bivalvi sui banchi lagunari.',
        waterTemp: 18.5,
      };
    case 5: // Giugno
      return {
        scoreMultiplier: 0.92,
        description: 'Stagione ottima: orate diffuse in tutta la laguna, dai canali profondi alle barene durante l\'alta marea.',
        waterTemp: 22.0,
      };
    case 6: // Luglio
      return {
        scoreMultiplier: 0.85,
        description: 'Estate lagunare: nelle ore calde stazionano nei canali profondi; pascolano sui bassifondi all\'alba, al tramonto e nelle notti di luna.',
        waterTemp: 25.5,
      };
    case 7: // Agosto
      return {
        scoreMultiplier: 0.82,
        description: 'Acque calde in laguna: concentrarsi nelle bocche di porto con ricambio d\'acqua marina fresca o all\'alba/tramonto.',
        waterTemp: 26.5,
      };
    case 8: // Settembre
      return {
        scoreMultiplier: 0.98,
        description: 'Mese Top d\'oro! Le grandi orate lagunari si nutrono senza sosta per accumulare grasso in vista della migrazione. Pezzature record.',
        waterTemp: 22.5,
      };
    case 9: // Ottobre
      return {
        scoreMultiplier: 0.95,
        description: 'Fase clou della "Smontada": le grosse orate si raggruppano nei canali principali e verso le bocche di porto per uscire in mare.',
        waterTemp: 18.0,
      };
    case 10: // Novembre
      return {
        scoreMultiplier: 0.70,
        description: 'Ultime grandi orate in transito verso il mare aperto prima del grande freddo. Concentrarsi esclusivamente sulle bocche di porto esterne.',
        waterTemp: 13.5,
      };
    case 11: // Dicembre
      return {
        scoreMultiplier: 0.40,
        description: 'Fine stagione lagunare: la maggior parte dei pesci ha già guadagnato le profondità dell\'Adriatico.',
        waterTemp: 9.5,
      };
    default:
      return {
        scoreMultiplier: 0.70,
        description: 'Stagione intermedia in laguna.',
        waterTemp: 16.0,
      };
  }
}

/**
 * Calculates hour-by-hour fishing potential (0 to 100) for a given date
 */
export function calculateDayFishingData(date: Date): DayFishingData {
  const dateString = date.toISOString().split('T')[0];
  const moon = getMoonDetails(date);
  const sun = getSunTimes(date);
  const season = getVeniceOrataSeasonality(date);
  const extremes = getVeniceTideExtremes(date);

  // Hourly evaluation (24 steps for hours 0..23)
  const hourlyActivity: HourFishingData[] = [];

  for (let h = 0; h < 24; h++) {
    const hourFraction = h + 0.5; // midpoint of the hour
    const tideHeight = getVeniceTideHeight(date, hourFraction);
    const tideDeriv = getVeniceTideDerivative(date, hourFraction);

    // 1. Tide Stage Component (0 to 35)
    // Orata loves:
    // - Strong rising tide (+0.8 to +2.5 cm/hr derivative): +30 to +35 pts
    // - High slack (water > 45cm ZMPS): +28 to +32 pts
    // - Mild falling tide (-0.5 to -1.5): +15 to +20 pts
    // - Low water secca (< 0cm ZMPS and zero current): +5 to +10 pts
    let tideScore = 15;
    let tideTrend: HourFishingData['tideTrend'] = 'rising';

    if (Math.abs(tideDeriv) < 1.5) {
      if (tideHeight > 30) {
        tideTrend = 'slack_high';
        tideScore = 32;
      } else {
        tideTrend = 'slack_low';
        tideScore = 8;
      }
    } else if (tideDeriv > 0) {
      tideTrend = 'rising';
      // Rising water pushes bait onto flats and edges
      tideScore = Math.min(35, 20 + tideDeriv * 2.5 + (tideHeight > 20 ? 8 : 0));
    } else {
      tideTrend = 'falling';
      // Falling tide: fish retreat to drop-offs
      tideScore = Math.max(10, 22 - Math.abs(tideDeriv) * 1.5);
    }

    // 2. Solunar Moon Phase & Alignment Component (0 to 25)
    let solunarScore = 12;
    if (moon.isSizigia) {
      solunarScore += 10; // Sizigie generate strong tides in Venice
    } else if (moon.isQuadratura) {
      solunarScore -= 4; // Quadrature have sluggish current
    }

    // Solunar major transit (approx based on moon age)
    const moonTransitHour = ((moon.ageDays / 29.53) * 24 + 12) % 24;
    const moonUnderfootHour = (moonTransitHour + 12) % 24;
    const isSolunarMajor =
      Math.abs(hourFraction - moonTransitHour) < 1.2 ||
      Math.abs(hourFraction - moonUnderfootHour) < 1.2;

    const isSolunarMinor =
      Math.abs(hourFraction - ((moonTransitHour + 6) % 24)) < 1.0 ||
      Math.abs(hourFraction - ((moonTransitHour + 18) % 24)) < 1.0;

    if (isSolunarMajor) solunarScore += 5;
    if (isSolunarMinor) solunarScore += 2.5;

    // 3. Solar & Daylight Component (0 to 25)
    // Dawn and Dusk are prime feeding periods for sparids
    const diffSunrise = Math.abs(hourFraction - sun.sunriseFraction);
    const diffSunset = Math.abs(hourFraction - sun.sunsetFraction);
    const isDawnOrDusk = diffSunrise < 1.5 || diffSunset < 1.5;

    let solarScore = 12;
    if (isDawnOrDusk) {
      solarScore = 25; // Golden hours
    } else if (hourFraction >= sun.sunriseFraction && hourFraction <= sun.sunsetFraction) {
      // Daytime: good in autumn/spring, slightly lower during scorching summer noon
      const month = date.getMonth();
      if (month === 6 || month === 7) { // July/August
        solarScore = (hourFraction >= 12 && hourFraction <= 16) ? 8 : 16;
      } else {
        solarScore = 18;
      }
    } else {
      // Nighttime: good with full moon or rising tide
      solarScore = moon.illumination > 60 ? 16 : 10;
    }

    // 4. Synergy Synergy Boost: Rising tide + Dawn or Dusk
    let synergyBoost = 0;
    if (isDawnOrDusk && (tideTrend === 'rising' || tideTrend === 'slack_high')) {
      synergyBoost = 15;
    }

    // Raw score before seasonality
    const rawHourly = (tideScore + solunarScore + solarScore + synergyBoost); // ~ 30 to 100
    // Scale with season
    const activityScore = Math.min(100, Math.max(10, Math.round(rawHourly * season.scoreMultiplier)));

    hourlyActivity.push({
      hour: h,
      timeLabel: `${h.toString().padStart(2, '0')}:00`,
      activityScore,
      tideHeightCm: Math.round(tideHeight),
      tideTrend,
      isBestWindow: false, // will mark below
      solunarMajor: isSolunarMajor,
      solunarMinor: isSolunarMinor,
      isDawnOrDusk,
    });
  }

  // Identify Best Fishing Windows (contiguous blocks with activityScore >= 68 or top peaks)
  const bestWindows: BestFishingWindow[] = [];
  
  // Find high-scoring windows
  // Check windows around each Colmo and around Dawn/Dusk + Montante
  const scoredHours = [...hourlyActivity].sort((a, b) => b.activityScore - a.activityScore);
  const threshold = Math.max(60, scoredHours[6]?.activityScore ?? 55);

  let inWindow = false;
  let winStart = 0;
  let winPeakScore = 0;

  for (let i = 0; i < 24; i++) {
    const isHigh = hourlyActivity[i].activityScore >= threshold;
    if (isHigh && !inWindow) {
      inWindow = true;
      winStart = i;
      winPeakScore = hourlyActivity[i].activityScore;
    } else if (isHigh && inWindow) {
      winPeakScore = Math.max(winPeakScore, hourlyActivity[i].activityScore);
    } else if (!isHigh && inWindow) {
      inWindow = false;
      const winEnd = i;
      if (winEnd - winStart >= 2) {
        addWindow(winStart, winEnd, winPeakScore);
      }
    }
  }
  if (inWindow && 24 - winStart >= 2) {
    addWindow(winStart, 24, winPeakScore);
  }

  // If no windows met the strict threshold (e.g. winter), take the top 2 local peaks
  if (bestWindows.length === 0) {
    const bestHour = scoredHours[0].hour;
    const startH = Math.max(0, bestHour - 1);
    const endH = Math.min(24, bestHour + 2);
    addWindow(startH, endH, scoredHours[0].activityScore);
  }

  // Helper to construct window description
  function addWindow(startH: number, endH: number, peakScore: number) {
    // Mark hourly items
    for (let h = startH; h < endH; h++) {
      if (hourlyActivity[h]) hourlyActivity[h].isBestWindow = true;
    }

    const midH = (startH + endH) / 2;
    const tideMidHeight = getVeniceTideHeight(date, midH);
    const tideDeriv = getVeniceTideDerivative(date, midH);
    const isNearSunrise = Math.abs(midH - sun.sunriseFraction) < 2;
    const isNearSunset = Math.abs(midH - sun.sunsetFraction) < 2;

    let title = 'Finestra Ottimale';
    let reason = '';
    let suggestedSpots = '';
    let suggestedBait = '';
    let tideContext = '';

    if (isNearSunrise && tideDeriv > 0) {
      title = 'Alba con Marea Montante (Momento d\'Oro)';
      reason = 'La combinazione regina in Laguna di Venezia: la luce dell\'aurora attiva la vista dell\'orata mentre l\'acqua che entra dalle bocche allaga le velme con cibo fresco.';
      suggestedSpots = 'Bocca di Porto di Lido o Malamocco; scalini di ciglina del Canale dei Petroli.';
      suggestedBait = 'Granchio ripario vivo o Bibi di Chioggia innescato intero.';
      tideContext = `Marea in crescita (+${Math.round(tideMidHeight)} cm ZMPS)`;
    } else if (isNearSunset && (tideDeriv > 0 || Math.abs(tideDeriv) < 1.5)) {
      title = 'Tramonto & Colmo Serale';
      reason = 'Calo della pressione antropica e delle imbarcazioni. Le orate si avvicinano alle rive e pascolano sui banchi di cozze con la massima tranquillità.';
      suggestedSpots = 'Barene di Pellestrina / Portosecco o massicciate esterne della diga di Chioggia.';
      suggestedBait = 'Cozza semi-aperta legata con filo elastico, cannolicchio fresco.';
      tideContext = `Marea al culmine (+${Math.round(tideMidHeight)} cm ZMPS)`;
    } else if (tideDeriv > 1.0) {
      title = 'Forte Corrente Montante';
      reason = 'Marea crescente decisa: grande afflusso di nutrienti dall\'Adriatico. Le orate risalgono i canali controcorrente intercettando granchi e bivalvi scalzati dalla corrente.';
      suggestedSpots = 'Canale dei Petroli (sul gradino a 4-5m), Canale di San Nicolò.';
      suggestedBait = 'Granchio verde vivo con piombo scorrevole adeguato alla corrente.';
      tideContext = `Flusso montante rapido (+${Math.round(tideMidHeight)} cm ZMPS)`;
    } else if (Math.abs(tideDeriv) < 1.5 && tideMidHeight > 30) {
      title = 'Stanca di Alta Marea (Colmo)';
      reason = 'Corrente azzerata o dolcissima al massimo livello dell\'acqua. Momento ideale per pescare leggero senza che la lenza venga trascinata.';
      suggestedSpots = 'Piattaforme di barena, piloni di briccole e secche interne.';
      suggestedBait = 'Arenicola, bibi o peòcio fresco.';
      tideContext = `Colmo di marea (+${Math.round(tideMidHeight)} cm ZMPS)`;
    } else {
      title = 'Finestra Favorevole di Marea';
      reason = 'Buon movimento d\'acqua con condizioni favorevoli al pascolo dei pesci sparidi.';
      suggestedSpots = 'Bocche di Porto e canali di comunicazione laguna-mare.';
      suggestedBait = 'Bibi nostrano o granchietto vivo.';
      tideContext = `Livello acqua a +${Math.round(tideMidHeight)} cm ZMPS`;
    }

    bestWindows.push({
      id: `win-${startH}-${endH}`,
      startHour: `${startH.toString().padStart(2, '0')}:00`,
      endHour: `${endH.toString().padStart(2, '0')}:00`,
      startFraction: startH,
      endFraction: endH,
      score: Math.min(100, Math.round(peakScore)),
      title,
      reason,
      suggestedBait,
      suggestedSpots,
      tideContext,
    });
  }

  // Calculate Overall Day Score (0 to 100)
  // Weighted average of peak hours + moon phase + season
  const top4Avg = (scoredHours[0].activityScore + scoredHours[1].activityScore + scoredHours[2].activityScore + scoredHours[3].activityScore) / 4;
  const overallScore = Math.min(100, Math.max(10, Math.round(top4Avg)));

  let ratingLevel: FishingRatingLevel = 'medio';
  let ratingLabel = 'Attività Media';
  let stars = 3;

  if (overallScore >= 82) {
    ratingLevel = 'eccellente';
    ratingLabel = 'Giornata Eccellente ★★★';
    stars = 5;
  } else if (overallScore >= 72) {
    ratingLevel = 'ottimo';
    ratingLabel = 'Giornata Ottima ★★';
    stars = 4;
  } else if (overallScore >= 58) {
    ratingLevel = 'buono';
    ratingLabel = 'Giornata Buona ★';
    stars = 3;
  } else if (overallScore >= 42) {
    ratingLevel = 'medio';
    ratingLabel = 'Attività Moderata';
    stars = 2;
  } else {
    ratingLevel = 'basso';
    ratingLabel = 'Attività Ridotta';
    stars = 1;
  }

  // Top recommended bait and rig for the day based on tidal strength
  let topRecommendedBait = 'Granchio verde nostrano (vivo)';
  let topRecommendedRig = 'Piombo scorrevole 60-80g con terminale fluorocarbon 150cm (0.24mm)';

  if (moon.isSizigia) {
    topRecommendedBait = 'Granchio verde vivo o favollo con zampe rimosse (resiste alla forte corrente)';
    topRecommendedRig = 'Piombo rocchetto o saponetta 80-110g per tenere il fondo nel Canale dei Petroli / Bocche';
  } else if (moon.isQuadratura) {
    topRecommendedBait = 'Bibi di Chioggia o Arenicola (esche mobili e profumate con poca corrente)';
    topRecommendedRig = 'Montatura leggera: piombo oliva scorrevole 30-50g, terminale sottile 0.20-0.22mm';
  }

  const lagoonAdvice = moon.isSizigia
    ? 'Oggi marea sizigiale (forti escursioni e corrente decisa): le orate sono molto attive ma richiedono piombature consistenti per pescare sul ciglio dei canali.'
    : moon.isQuadratura
    ? 'Oggi marea di quadratura (poca corrente): acque calme in laguna, ideali per la pesca a vista sulle barene e nei bassifondi con esche vive molto visibili.'
    : 'Condizioni regolari di marea: concentrarsi sulle due ore precedenti il colmo di marea per massimizzare le partenze.';

  return {
    date,
    dateString,
    overallScore,
    ratingLevel,
    ratingLabel,
    stars,
    moonPhase: moon.phase,
    moonPhaseLabel: moon.phaseLabel,
    moonIllumination: moon.illumination,
    moonAgeDays: moon.ageDays,
    isSizigia: moon.isSizigia,
    isQuadratura: moon.isQuadratura,
    seasonScore: season.scoreMultiplier,
    seasonDescription: season.description,
    sunriseTime: sun.sunriseTime,
    sunsetTime: sun.sunsetTime,
    extremes,
    hourlyActivity,
    bestWindows,
    waterTempEstimated: season.waterTemp,
    topRecommendedBait,
    topRecommendedRig,
    lagoonAdvice,
  };
}

/**
 * Precomputes an entire month of fishing data
 */
export function getMonthFishingData(year: number, month: number): DayFishingData[] {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const list: DayFishingData[] = [];

  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d, 12, 0, 0);
    list.push(calculateDayFishingData(date));
  }

  return list;
}
