import React, { useState } from "react";
import { useStore } from "../services/store";
import { 
  Layers, ArrowRight, X 
} from "lucide-react";
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_PLATFORM_KEY || '';
const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY';

export const MapScreen: React.FC = () => {
  const { issues, actions } = useStore();
  const [selectedIssId, setSelectedIssId] = useState<string | null>(issues[0]?.id || null);
  const [mapLayer, setMapLayer] = useState<"standard" | "satellite">("standard");

  const selectedIss = issues.find(i => i.id === selectedIssId);

  // Filter out resolved if desired or keep all
  const activeCount = issues.filter(i => i.status !== "Resolved").length;

  if (!hasValidKey) {
    return (
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xl flex flex-col items-center justify-center text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Google Maps API Key Required</h2>
        <p className="text-sm text-slate-600 max-w-sm">
          <strong>Step 1:</strong> <a href="https://console.cloud.google.com/google/maps-apis/start?utm_campaign=gmp-code-assist-ais" target="_blank" rel="noopener" className="text-blue-600 underline">Get an API Key</a><br/><br/>
          <strong>Step 2:</strong> Add your key as a secret in AI Studio:
        </p>
        <ul className="text-left text-sm text-slate-600 space-y-2 list-disc pl-5">
          <li>Open <strong>Settings</strong> (⚙️ gear icon, <strong>top-right corner</strong>)</li>
          <li>Select <strong>Secrets</strong></li>
          <li>Type <code>GOOGLE_MAPS_PLATFORM_KEY</code>, press <strong>Enter</strong></li>
          <li>Paste your API key, press <strong>Enter</strong></li>
        </ul>
        <p className="text-xs text-slate-500 italic mt-4">The app will rebuild automatically.</p>
      </div>
    );
  }

  const defaultCenter = issues.length > 0 ? { lat: issues[0].latitude, lng: issues[0].longitude } : { lat: 37.42, lng: -122.08 };

  return (
    <div className="space-y-4 pb-12 animate-in fade-in duration-300 h-full flex flex-col">
      
      {/* Top Map Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-lg font-bold text-slate-900">Live Municipal GIS Map</h1>
            <span className="text-[10px] font-mono bg-blue-500/10 text-blue-600 px-2 py-0.5 rounded font-bold border border-blue-200">
              Live Feed
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Displaying {activeCount} active civic infrastructure markers. Color coded by hazard severity.
          </p>
        </div>

        <div className="flex items-center space-x-2 self-end sm:self-auto">
          <button
            onClick={() => setMapLayer(mapLayer === "standard" ? "satellite" : "standard")}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition"
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="capitalize">{mapLayer} Layer</span>
          </button>
        </div>
      </div>

      {/* Main Map Container */}
      <div className="rounded-3xl border-2 border-slate-800 flex-1 relative overflow-hidden flex flex-col justify-between shadow-xl min-h-[400px]">
        
        <APIProvider apiKey={API_KEY} version="weekly">
          <Map
            defaultCenter={defaultCenter}
            defaultZoom={13}
            mapId="DEMO_MAP_ID"
            mapTypeId={mapLayer}
            internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
            style={{width: '100%', height: '100%'}}
          >
            {issues.map((iss) => {
              const isSelected = iss.id === selectedIssId;
              const bg = iss.severity === "Critical" ? "#dc2626" :
                         iss.severity === "High" ? "#f97316" :
                         iss.severity === "Medium" ? "#f59e0b" : "#2563eb";

              return (
                <AdvancedMarker 
                  key={iss.id} 
                  position={{lat: iss.latitude, lng: iss.longitude}} 
                  title={iss.title}
                  onClick={() => setSelectedIssId(iss.id)}
                  zIndex={isSelected ? 50 : 10}
                >
                  <Pin background={bg} borderColor="#fff" glyphColor="#fff" scale={isSelected ? 1.3 : 1} />
                </AdvancedMarker>
              );
            })}
          </Map>
        </APIProvider>

        {/* Selected Pin Callout Card Overlay at bottom */}
        {selectedIss && (
          <div className="absolute bottom-4 left-4 right-4 z-30 animate-in slide-in-from-bottom-4 duration-200 pointer-events-none">
            <div className="bg-white text-slate-900 rounded-2xl p-4 shadow-2xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 max-w-2xl mx-auto pointer-events-auto">
              
              <div className="flex items-center space-x-3.5 flex-1 min-w-0">
                <img 
                  src={selectedIss.imageUrl} 
                  alt={selectedIss.title} 
                  className="w-14 h-14 rounded-xl object-cover shrink-0 border border-slate-200"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center space-x-1.5">
                    <span className={`text-[9px] font-bold px-2 py-0.2 rounded uppercase font-mono text-white ${
                      selectedIss.severity === "Critical" ? "bg-red-600" :
                      selectedIss.severity === "High" ? "bg-orange-500" : "bg-blue-600"
                    }`}>
                      {selectedIss.severity}
                    </span>
                    <span className="text-[10px] font-mono font-semibold text-slate-500 truncate">
                      {selectedIss.address}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 truncate mt-1">
                    {selectedIss.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">
                    {selectedIss.department} • {selectedIss.status}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2 w-full sm:w-auto justify-end shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-slate-100">
                <button
                  onClick={() => setSelectedIssId(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition"
                  title="Close callout"
                >
                  <X className="w-4 h-4" />
                </button>

                <button
                  onClick={() => actions.setActiveScreen("detail", selectedIss.id)}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2 rounded-xl text-xs shadow transition flex items-center space-x-1"
                >
                  <span>Open Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          </div>
        )}

      </div>

      {/* Map Legend */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
        <span className="font-bold text-slate-700">Severity Color Legend:</span>
        <div className="flex items-center space-x-4">
          <span className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-full bg-red-600 shrink-0" />
            <span className="text-slate-600 font-medium">Critical</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-full bg-orange-500 shrink-0" />
            <span className="text-slate-600 font-medium">High</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-500 shrink-0" />
            <span className="text-slate-600 font-medium">Medium</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-full bg-blue-600 shrink-0" />
            <span className="text-slate-600 font-medium">Low</span>
          </span>
        </div>
      </div>

    </div>
  );
};
