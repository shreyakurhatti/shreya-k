import React, { useState } from 'react';
import {
  MapPin,
  AlertTriangle,
  CloudRain,
  Users,
  Calendar,
  Activity,
  Plus,
  ShieldCheck,
  CheckCircle2,
  Info,
  Clock,
  Navigation,
} from 'lucide-react';
import { useEco } from '../../context/EcoContext';
import { HotspotReport, PredictedHotspot, SeverityLevel } from '../../types/plastic';
import { PREDICTED_HOTSPOTS } from '../../data/mockData';

export const HotspotMap: React.FC = () => {
  const { hotspots, addNewHotspot, locationRegion } = useEco();

  const [activeLayer, setActiveLayer] = useState<'reported' | 'prediction'>('reported');
  const [selectedHotspot, setSelectedHotspot] = useState<HotspotReport | null>(hotspots[0]);
  const [selectedPrediction, setSelectedPrediction] = useState<PredictedHotspot | null>(PREDICTED_HOTSPOTS[0]);
  const [reportModalOpen, setReportModalOpen] = useState(false);

  // New report form state
  const [newLocName, setNewLocName] = useState('');
  const [newCity, setNewCity] = useState(locationRegion.split(',')[0] || 'Bengaluru');
  const [newSeverity, setNewSeverity] = useState<SeverityLevel>('High');
  const [newDensity, setNewDensity] = useState(150);
  const [newPolymers, setNewPolymers] = useState('PET (#1), PP (#5), PS (#6)');
  const [newNotes, setNewNotes] = useState('');

  const handleCreateReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLocName.trim()) return;

    addNewHotspot({
      locationName: newLocName,
      city: newCity,
      lat: 12.9 + Math.random() * 0.1,
      lng: 77.6 + Math.random() * 0.1,
      severity: newSeverity,
      wasteDensityKg: newDensity,
      reportedBy: 'You (Eco Citizen)',
      primaryPolymers: newPolymers.split(',').map((p) => p.trim()),
      status: 'Open',
      notes: newNotes || 'Reported by local resident for municipal cleanup scheduling.',
    });

    setReportModalOpen(false);
    setNewLocName('');
    setNewNotes('');
  };

  const getSeverityColor = (sev: SeverityLevel) => {
    switch (sev) {
      case 'Low':
        return '#10b981';
      case 'Medium':
        return '#f59e0b';
      case 'High':
        return '#f97316';
      case 'Hazardous':
      default:
        return '#ef4444';
    }
  };

  return (
    <div className="space-y-6">
      {/* Map Header */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-emerald-500/30 backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <Activity className="w-3.5 h-3.5 text-lime-400" />
            <span>Community Heatmap & Predictive Modeling</span>
          </div>
          <h2 className="text-2xl font-display font-extrabold text-white">
            Plastic Waste Hotspot Intelligence
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Live geo-tagged reports and machine-learning simulation of micro-watershed plastic accumulation over the next 7 days.
          </p>
        </div>

        {/* Action Controls & Layer Toggle */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setActiveLayer('reported')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
                activeLayer === 'reported'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Live Reports ({hotspots.length})</span>
            </button>

            <button
              onClick={() => setActiveLayer('prediction')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
                activeLayer === 'prediction'
                  ? 'bg-teal-500 text-slate-950 font-bold shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <CloudRain className="w-3.5 h-3.5" />
              <span>7-Day AI Forecast</span>
            </button>
          </div>

          <button
            onClick={() => setReportModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-lime-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/25 transition active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Report Waste Pile (+150 XP)</span>
          </button>
        </div>
      </div>

      {/* Main Map Visual Canvas & Details Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Interactive SVG / Vector Map */}
        <div className="lg:col-span-8 p-4 rounded-3xl bg-slate-950 border border-slate-800 relative min-h-[460px] flex flex-col justify-between overflow-hidden shadow-2xl">
          {/* Map Top Status Bar */}
          <div className="flex items-center justify-between z-10 px-3 py-1.5 bg-slate-900/90 backdrop-blur rounded-2xl border border-slate-800 text-xs">
            <span className="flex items-center gap-2 text-slate-300 font-mono text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              ACTIVE REGION: {locationRegion.toUpperCase()}
            </span>
            <div className="flex items-center gap-3 text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400" /> Low
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-400" /> Med
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-400" /> Hazardous
              </span>
            </div>
          </div>

          {/* Stylized Vector World / Grid Topography Map */}
          <div className="relative w-full h-[360px] my-auto flex items-center justify-center">
            <svg
              className="w-full h-full"
              viewBox="0 0 800 450"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Background Map Grid Lines */}
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.8" />
                </pattern>
                <linearGradient id="runoffGlow" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.1" />
                </linearGradient>
              </defs>

              <rect width="800" height="450" fill="url(#grid)" />

              {/* Stylized Coastal Contours & Watershed River Corridors */}
              <path
                d="M 50 180 Q 220 120 380 220 T 750 200"
                stroke="#0d9488"
                strokeWidth="3"
                strokeDasharray="6 4"
                opacity="0.4"
              />
              <path
                d="M 120 40 Q 240 280 440 320 T 780 390"
                stroke="#0284c7"
                strokeWidth="2.5"
                opacity="0.3"
              />

              {/* 7-DAY PREDICTION FORECAST SHADING LAYER */}
              {activeLayer === 'prediction' && (
                <>
                  {/* High Risk Watershed Inundation Plumes */}
                  <circle cx="280" cy="190" r="75" fill="url(#runoffGlow)" className="animate-pulse" />
                  <circle cx="560" cy="240" r="60" fill="url(#runoffGlow)" className="animate-pulse" />
                  <circle cx="680" cy="140" r="50" fill="url(#runoffGlow)" />

                  {/* Flow vectors pointing towards bottlenecks */}
                  <line x1="220" y1="140" x2="270" y2="180" stroke="#f87171" strokeWidth="2" strokeDasharray="3 3" />
                  <line x1="510" y1="200" x2="550" y2="230" stroke="#f87171" strokeWidth="2" strokeDasharray="3 3" />
                </>
              )}

              {/* LIVE REPORTED PINS */}
              {activeLayer === 'reported' &&
                hotspots.map((hp, idx) => {
                  // Coordinate projections for visualization canvas
                  const posX = 120 + ((idx * 145 + 70) % 620);
                  const posY = 100 + ((idx * 85 + 40) % 260);
                  const isSelected = selectedHotspot?.id === hp.id;
                  const color = getSeverityColor(hp.severity);

                  return (
                    <g
                      key={hp.id}
                      onClick={() => setSelectedHotspot(hp)}
                      className="cursor-pointer group"
                    >
                      {/* Pulse rings */}
                      <circle
                        cx={posX}
                        cy={posY}
                        r={isSelected ? 18 : 12}
                        fill={color}
                        fillOpacity="0.25"
                        className={isSelected ? 'animate-ping' : ''}
                      />
                      <circle
                        cx={posX}
                        cy={posY}
                        r={isSelected ? 9 : 6}
                        fill={color}
                        stroke="#0f172a"
                        strokeWidth="2"
                      />
                      <text
                        x={posX + 10}
                        y={posY - 8}
                        fill="#cbd5e1"
                        fontSize="10"
                        fontFamily="monospace"
                        fontWeight="bold"
                        className="group-hover:fill-emerald-300"
                      >
                        {hp.city}: {hp.wasteDensityKg}kg
                      </text>
                    </g>
                  );
                })}

              {/* PREDICTION LAYER PINS */}
              {activeLayer === 'prediction' &&
                PREDICTED_HOTSPOTS.map((pred, idx) => {
                  const posX = 280 + idx * 190;
                  const posY = 190 + (idx % 2) * 50;
                  const isSelected = selectedPrediction?.id === pred.id;

                  return (
                    <g
                      key={pred.id}
                      onClick={() => setSelectedPrediction(pred)}
                      className="cursor-pointer group"
                    >
                      <circle
                        cx={posX}
                        cy={posY}
                        r="26"
                        fill="#ef4444"
                        fillOpacity="0.3"
                        className="animate-ping"
                      />
                      <circle
                        cx={posX}
                        cy={posY}
                        r="8"
                        fill="#ef4444"
                        stroke="#ffffff"
                        strokeWidth="2"
                      />
                      <text
                        x={posX + 12}
                        y={posY - 10}
                        fill="#fca5a5"
                        fontSize="11"
                        fontFamily="monospace"
                        fontWeight="bold"
                      >
                        {pred.predictedRisk.toUpperCase()}: {pred.expectedWasteIncrease}
                      </text>
                    </g>
                  );
                })}
            </svg>
          </div>

          {/* Bottom Layer Status Legend */}
          <div className="z-10 p-3 rounded-2xl bg-slate-900/90 backdrop-blur border border-slate-800 flex items-center justify-between text-xs text-slate-300">
            <span className="flex items-center gap-1.5">
              <Navigation className="w-3.5 h-3.5 text-emerald-400" />
              <span>Click any marker to inspect community field audits or hydrological forecast models</span>
            </span>
            <span className="text-[11px] font-mono text-slate-500">GIS Engine v4.2</span>
          </div>
        </div>

        {/* Selected Hotspot / Prediction Detail Inspector Sidebar */}
        <div className="lg:col-span-4 space-y-4">
          {activeLayer === 'reported' && selectedHotspot && (
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-5">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="text-[11px] font-mono text-emerald-400 uppercase font-semibold">
                    Field Hotspot Audit
                  </div>
                  <h3 className="text-lg font-bold text-white leading-tight">
                    {selectedHotspot.locationName}
                  </h3>
                  <p className="text-xs text-slate-400">
                    City: <strong className="text-slate-200">{selectedHotspot.city}</strong> • {selectedHotspot.reportedAgo}
                  </p>
                </div>

                <span
                  className="px-2.5 py-1 rounded-full text-xs font-bold shrink-0"
                  style={{
                    backgroundColor: `${getSeverityColor(selectedHotspot.severity)}20`,
                    color: getSeverityColor(selectedHotspot.severity),
                    border: `1px solid ${getSeverityColor(selectedHotspot.severity)}40`,
                  }}
                >
                  {selectedHotspot.severity}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs">
                <div>
                  <div className="text-slate-400 text-[11px]">Accumulated Waste</div>
                  <div className="text-lg font-mono font-bold text-white">
                    {selectedHotspot.wasteDensityKg} kg
                  </div>
                </div>
                <div>
                  <div className="text-slate-400 text-[11px]">Cleanup Status</div>
                  <div className="text-xs font-semibold text-emerald-400 flex items-center gap-1 mt-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{selectedHotspot.status}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 text-xs">
                <span className="font-semibold text-slate-300">Dominant Polymer Types:</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedHotspot.primaryPolymers.map((pol, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 text-[11px] font-mono"
                    >
                      {pol}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-1 text-xs text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                <span className="font-semibold text-slate-400 text-[11px]">Reporter Notes:</span>
                <p className="leading-relaxed">{selectedHotspot.notes}</p>
                <div className="text-[10px] text-slate-500 pt-1">
                  Submitted by {selectedHotspot.reportedBy}
                </div>
              </div>

              <button
                onClick={() => alert(`Municipal cleanup notification dispatched for ${selectedHotspot.locationName}!`)}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 text-xs font-bold border border-emerald-500/30 transition flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Notify Municipal Clean-up Crew</span>
              </button>
            </div>
          )}

          {activeLayer === 'prediction' && selectedPrediction && (
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-red-500/30 space-y-5">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="text-[11px] font-mono text-red-400 uppercase font-semibold flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    7-Day AI Accumulation Warning
                  </div>
                  <h3 className="text-lg font-bold text-white leading-tight">
                    {selectedPrediction.name}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Expected Surge: <strong className="text-red-400">{selectedPrediction.expectedWasteIncrease}</strong>
                  </p>
                </div>

                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/40 shrink-0">
                  {selectedPrediction.predictedRisk}
                </span>
              </div>

              {/* Three Factors Breakdown */}
              <div className="space-y-2.5 text-xs">
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                  <div className="flex items-center gap-1.5 font-semibold text-cyan-300">
                    <CloudRain className="w-3.5 h-3.5" />
                    <span>Hydrological & Rainfall Factor</span>
                  </div>
                  <p className="text-slate-400 leading-relaxed text-[11px]">
                    {selectedPrediction.factors.rainfallSim}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                  <div className="flex items-center gap-1.5 font-semibold text-amber-300">
                    <Users className="w-3.5 h-3.5" />
                    <span>Population Density Factor</span>
                  </div>
                  <p className="text-slate-400 leading-relaxed text-[11px]">
                    {selectedPrediction.factors.populationDensity}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                  <div className="flex items-center gap-1.5 font-semibold text-purple-300">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Historical Chokepoint Factor</span>
                  </div>
                  <p className="text-slate-400 leading-relaxed text-[11px]">
                    {selectedPrediction.factors.historicalAccumulation}
                  </p>
                </div>
              </div>

              {/* Predictive Reasoning */}
              <div className="p-3.5 rounded-2xl bg-red-950/30 border border-red-500/30 text-xs text-red-200 leading-relaxed">
                <strong className="text-white">Predictive Synthesis: </strong>
                {selectedPrediction.reasoning}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Report New Hotspot Modal */}
      {reportModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-emerald-500/40 rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">Report Waste Accumulation</h3>
                <p className="text-xs text-slate-400">Geo-tag uncollected trash for community cleanup</p>
              </div>
              <button
                onClick={() => setReportModalOpen(false)}
                className="text-slate-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateReport} className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Location / Street Landmark
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 5th Cross Drain, Near Metro Pillar 140"
                  value={newLocName}
                  onChange={(e) => setNewLocName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:border-emerald-400 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">City</label>
                  <input
                    type="text"
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Severity</label>
                  <select
                    value={newSeverity}
                    onChange={(e) => setNewSeverity(e.target.value as SeverityLevel)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 outline-none"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Hazardous">Hazardous</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Estimated Waste Density (kg)
                </label>
                <input
                  type="number"
                  value={newDensity}
                  onChange={(e) => setNewDensity(parseInt(e.target.value, 10) || 50)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 outline-none"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Dominant Plastics (comma separated)
                </label>
                <input
                  type="text"
                  value={newPolymers}
                  onChange={(e) => setNewPolymers(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 outline-none"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Observations & Access Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Blocked rainwater culvert, strong smell, requires crane/boom"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setReportModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-lime-400 text-slate-950 font-bold"
                >
                  Submit Report (+150 XP)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
