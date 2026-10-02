import React, { useState, useId } from 'react';
import { DayFishingData } from '../types';
import { getVeniceTide24hCurve } from '../utils/veniceTides';
import { Waves, Sparkles, Sun, Moon } from 'lucide-react';

interface TideActivityChartProps {
  dayData: DayFishingData;
}

export const TideActivityChart: React.FC<TideActivityChartProps> = ({ dayData }) => {
  const [hoveredHour, setHoveredHour] = useState<number | null>(null);
  const chartId = useId();

  const tidePoints = getVeniceTide24hCurve(dayData.date, 48);

  // Dimensions
  const width = 800;
  const height = 240;
  const paddingLeft = 46;
  const paddingRight = 46;
  const paddingTop = 26;
  const paddingBottom = 34;

  const chartW = width - paddingLeft - paddingRight;
  const chartH = height - paddingTop - paddingBottom;

  // Scale calculations
  // Tide range typically from -30cm to +85cm
  const minTide = -35;
  const maxTide = 90;

  const getX = (hourFraction: number) => {
    return paddingLeft + (hourFraction / 24) * chartW;
  };

  const getY_Tide = (cm: number) => {
    const clamped = Math.max(minTide, Math.min(maxTide, cm));
    const normalized = (clamped - minTide) / (maxTide - minTide);
    return paddingTop + chartH - normalized * chartH;
  };

  const getY_Activity = (score: number) => {
    const normalized = Math.max(0, Math.min(100, score)) / 100;
    return paddingTop + chartH - normalized * (chartH * 0.88);
  };

  // Build SVG path for Tide
  let tidePathD = '';
  tidePoints.forEach((pt, idx) => {
    const x = getX(pt.hourFraction);
    const y = getY_Tide(pt.heightCm);
    if (idx === 0) {
      tidePathD += `M ${x} ${y}`;
    } else {
      tidePathD += ` L ${x} ${y}`;
    }
  });

  const tideAreaD = `${tidePathD} L ${paddingLeft + chartW} ${paddingTop + chartH} L ${paddingLeft} ${paddingTop + chartH} Z`;

  // Build SVG path for Orata Feeding Activity
  let activityPathD = '';
  dayData.hourlyActivity.forEach((h, idx) => {
    const x = getX(h.hour + 0.5);
    const y = getY_Activity(h.activityScore);
    if (idx === 0) {
      activityPathD += `M ${x} ${y}`;
    } else {
      activityPathD += ` L ${x} ${y}`;
    }
  });

  const activeHourData = hoveredHour !== null ? dayData.hourlyActivity[hoveredHour] : null;

  return (
    <div id="venice-tide-activity-chart-container" className="bg-slate-900/90 text-white rounded-2xl p-4 sm:p-5 border border-slate-700/60 shadow-lg">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Waves className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              Curva Mareale & Attività Orata (24 Ore)
            </h4>
            <p className="text-xs text-slate-400">
              Zero Mareografico Punta della Salute (ZMPS) & Indice Alimentare Orate
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-1 rounded-full bg-cyan-400"></span>
            <span className="text-cyan-300 font-medium">Marea Laguna (cm)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-1 rounded-full bg-amber-400"></span>
            <span className="text-amber-300 font-medium">Attività Orata (%)</span>
          </div>
          <div className="flex items-center gap-1.5 hidden sm:flex">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500/25 border border-emerald-500/50"></span>
            <span className="text-emerald-300">Ore Top</span>
          </div>
        </div>
      </div>

      {/* SVG Container */}
      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto select-none overflow-visible"
        >
          <defs>
            <linearGradient id={`tideGrad-${chartId}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.40" />
              <stop offset="60%" stopColor="#0284c7" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#0f172a" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id={`activityGrad-${chartId}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.30" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Shaded Best Windows */}
          {dayData.bestWindows.map((win) => {
            const x1 = getX(win.startFraction);
            const x2 = getX(win.endFraction);
            return (
              <g key={win.id}>
                <rect
                  x={x1}
                  y={paddingTop}
                  width={Math.max(4, x2 - x1)}
                  height={chartH}
                  fill="#10b981"
                  fillOpacity="0.12"
                />
                <line
                  x1={x1}
                  y1={paddingTop}
                  x2={x1}
                  y2={paddingTop + chartH}
                  stroke="#10b981"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                  strokeOpacity="0.4"
                />
                <line
                  x1={x2}
                  y1={paddingTop}
                  x2={x2}
                  y2={paddingTop + chartH}
                  stroke="#10b981"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                  strokeOpacity="0.4"
                />
              </g>
            );
          })}

          {/* Grid lines and labels for Tide heights */}
          {[-20, 0, 30, 60, 80].map((level) => {
            const y = getY_Tide(level);
            return (
              <g key={level}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={paddingLeft + chartW}
                  y2={y}
                  stroke={level === 0 ? '#475569' : '#334155'}
                  strokeWidth={level === 0 ? '1.5' : '1'}
                  strokeDasharray={level === 0 ? undefined : '2 3'}
                  strokeOpacity={level === 0 ? '0.7' : '0.4'}
                />
                <text
                  x={paddingLeft - 8}
                  y={y + 3}
                  textAnchor="end"
                  fontSize="10"
                  fill="#94a3b8"
                  className="font-mono"
                >
                  {level > 0 ? `+${level}` : level}
                </text>
              </g>
            );
          })}

          {/* Right Y-Axis: Activity % labels */}
          {[25, 50, 75, 100].map((score) => {
            const y = getY_Activity(score);
            return (
              <text
                key={score}
                x={paddingLeft + chartW + 8}
                y={y + 3}
                textAnchor="start"
                fontSize="10"
                fill="#d97706"
                className="font-mono"
              >
                {score}%
              </text>
            );
          })}

          {/* Tide filled area & line */}
          <path d={tideAreaD} fill={`url(#tideGrad-${chartId})`} />
          <path
            d={tidePathD}
            fill="none"
            stroke="#22d3ee"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Orata Activity line */}
          <path
            d={activityPathD}
            fill="none"
            stroke="#fbbf24"
            strokeWidth="2.5"
            strokeDasharray="4 2"
            strokeLinecap="round"
          />

          {/* Extremum markers (Colmo & Secca) */}
          {dayData.extremes.map((ext, idx) => {
            const x = getX(ext.hourFraction);
            const y = getY_Tide(ext.heightCm);
            const isColmo = ext.type === 'high';
            return (
              <g key={idx}>
                <circle
                  cx={x}
                  cy={y}
                  r="4.5"
                  fill={isColmo ? '#06b6d4' : '#64748b'}
                  stroke="#ffffff"
                  strokeWidth="1.5"
                />
                <rect
                  x={x - 28}
                  y={isColmo ? y - 22 : y + 6}
                  width="56"
                  height="16"
                  rx="3"
                  fill="#0f172a"
                  stroke={isColmo ? '#0891b2' : '#475569'}
                  strokeWidth="1"
                />
                <text
                  x={x}
                  y={isColmo ? y - 11 : y + 17}
                  textAnchor="middle"
                  fontSize="9"
                  fill={isColmo ? '#38bdf8' : '#cbd5e1'}
                  fontWeight="600"
                >
                  {isColmo ? `▲ ${ext.heightCm}cm` : `▼ ${ext.heightCm}cm`}
                </text>
              </g>
            );
          })}

          {/* Time axis ticks (every 3 hours) */}
          {[0, 3, 6, 9, 12, 15, 18, 21, 24].map((h) => {
            const x = getX(h);
            return (
              <g key={h}>
                <line
                  x1={x}
                  y1={paddingTop + chartH}
                  x2={x}
                  y2={paddingTop + chartH + 5}
                  stroke="#64748b"
                  strokeWidth="1"
                />
                <text
                  x={x}
                  y={paddingTop + chartH + 18}
                  textAnchor="middle"
                  fontSize="10"
                  fill="#94a3b8"
                  className="font-mono font-medium"
                >
                  {h === 24 ? '24:00' : `${h.toString().padStart(2, '0')}:00`}
                </text>
              </g>
            );
          })}

          {/* Sunrise and Sunset Markers */}
          <line
            x1={getX(parseFloat(dayData.sunriseTime.split(':')[0]) + parseFloat(dayData.sunriseTime.split(':')[1]) / 60)}
            y1={paddingTop}
            x2={getX(parseFloat(dayData.sunriseTime.split(':')[0]) + parseFloat(dayData.sunriseTime.split(':')[1]) / 60)}
            y2={paddingTop + chartH}
            stroke="#f59e0b"
            strokeWidth="1"
            strokeDasharray="2 2"
            strokeOpacity="0.5"
          />
          <line
            x1={getX(parseFloat(dayData.sunsetTime.split(':')[0]) + parseFloat(dayData.sunsetTime.split(':')[1]) / 60)}
            y1={paddingTop}
            x2={getX(parseFloat(dayData.sunsetTime.split(':')[0]) + parseFloat(dayData.sunsetTime.split(':')[1]) / 60)}
            y2={paddingTop + chartH}
            stroke="#f97316"
            strokeWidth="1"
            strokeDasharray="2 2"
            strokeOpacity="0.5"
          />

          {/* Interactive Scrubbing Columns */}
          {Array.from({ length: 24 }).map((_, h) => {
            const x1 = getX(h);
            const x2 = getX(h + 1);
            const isHovered = hoveredHour === h;
            return (
              <rect
                key={h}
                x={x1}
                y={paddingTop}
                width={x2 - x1}
                height={chartH}
                fill={isHovered ? '#ffffff' : 'transparent'}
                fillOpacity={isHovered ? '0.08' : '0'}
                className="cursor-crosshair transition-colors"
                onMouseEnter={() => setHoveredHour(h)}
                onTouchStart={() => setHoveredHour(h)}
              />
            );
          })}

          {/* Hover indicator cursor */}
          {hoveredHour !== null && (
            <g>
              <line
                x1={getX(hoveredHour + 0.5)}
                y1={paddingTop}
                x2={getX(hoveredHour + 0.5)}
                y2={paddingTop + chartH}
                stroke="#ffffff"
                strokeWidth="1.5"
                strokeDasharray="2 2"
              />
              <circle
                cx={getX(hoveredHour + 0.5)}
                cy={getY_Tide(dayData.hourlyActivity[hoveredHour].tideHeightCm)}
                r="4.5"
                fill="#22d3ee"
                stroke="#ffffff"
                strokeWidth="2"
              />
              <circle
                cx={getX(hoveredHour + 0.5)}
                cy={getY_Activity(dayData.hourlyActivity[hoveredHour].activityScore)}
                r="4.5"
                fill="#fbbf24"
                stroke="#ffffff"
                strokeWidth="2"
              />
            </g>
          )}
        </svg>
      </div>

      {/* Dynamic Hover Tooltip Info Bar */}
      <div className="mt-3 pt-3 border-t border-slate-700/50 flex flex-wrap items-center justify-between text-xs gap-2">
        {activeHourData ? (
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-semibold text-white px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
              Ore {activeHourData.timeLabel}
            </span>
            <span className="text-cyan-300">
              Marea: <strong>{activeHourData.tideHeightCm > 0 ? `+${activeHourData.tideHeightCm}` : activeHourData.tideHeightCm} cm ZMPS</strong> ({activeHourData.tideTrend === 'rising' ? 'In salita / Montante' : activeHourData.tideTrend === 'falling' ? 'In calo / Calante' : activeHourData.tideTrend === 'slack_high' ? 'Colmo' : 'Secca'})
            </span>
            <span className="text-amber-300">
              Attività Orata: <strong>{activeHourData.activityScore}/100</strong>
            </span>
            {activeHourData.isBestWindow && (
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-medium">
                ★ Finestra Top di Pesca
              </span>
            )}
          </div>
        ) : (
          <div className="text-slate-400 italic">
            Passa il mouse o tocca il grafico per analizzare l'orario specifico (livello acqua e attività orata).
          </div>
        )}

        <div className="flex items-center gap-3 text-slate-400 ml-auto">
          <span className="flex items-center gap-1">
            <Sun className="w-3.5 h-3.5 text-amber-400" /> Alba: {dayData.sunriseTime}
          </span>
          <span className="flex items-center gap-1">
            <Moon className="w-3.5 h-3.5 text-indigo-300" /> Tramonto: {dayData.sunsetTime}
          </span>
        </div>
      </div>
    </div>
  );
};
