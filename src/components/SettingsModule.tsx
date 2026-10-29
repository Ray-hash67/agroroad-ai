import React, { useState } from 'react';
import { Save, CheckCircle2 } from 'lucide-react';

export const SettingsModule: React.FC = () => {
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.80);
  const [gpsAccuracyThreshold, setGpsAccuracyThreshold] = useState(2.5);
  const [selectedModel, setSelectedModel] = useState('yolov8-pavement-kh');
  const [autoSyncCloud, setAutoSyncCloud] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-6 max-w-3xl space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h3 className="text-base font-bold text-slate-900">AI Vision & System Settings</h3>
        <p className="text-xs text-slate-500 mt-1">
          Tune defect detection neural net sensitivity, GPS telemetry filters, and municipal cloud sync policies.
        </p>
      </div>

      {/* Model Selection */}
      <div className="space-y-4">
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">
            Active Vision Architecture Model
          </label>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="w-full max-w-md px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800"
          >
            <option value="yolov8-pavement-kh">YOLOv8-Pavement (Optimized for Tropical Asphalt Degradation)</option>
            <option value="resnet50-road-vision">ResNet50 Multi-Head Road Feature Extractor</option>
            <option value="gemini-vision-inspector">Gemini 2.5 Flash Multimodal Civil Inspector</option>
          </select>
        </div>

        {/* Confidence Threshold */}
        <div>
          <div className="flex items-center justify-between max-w-md mb-1.5">
            <label className="text-xs font-bold text-slate-700">
              Confidence Filter Cutoff
            </label>
            <span className="font-mono text-xs font-bold text-blue-600">
              {(confidenceThreshold * 100).toFixed(0)}%
            </span>
          </div>
          <input
            type="range"
            min="0.50"
            max="0.95"
            step="0.05"
            value={confidenceThreshold}
            onChange={(e) => setConfidenceThreshold(parseFloat(e.target.value))}
            className="w-full max-w-md accent-blue-600"
          />
          <p className="text-[11px] text-slate-400 mt-1">
            Bounding boxes with model confidence below this threshold will be filtered out to eliminate false positives.
          </p>
        </div>

        {/* GPS Accuracy Filter */}
        <div>
          <div className="flex items-center justify-between max-w-md mb-1.5">
            <label className="text-xs font-bold text-slate-700">
              GPS Horizontal Accuracy Limit
            </label>
            <span className="font-mono text-xs font-bold text-blue-600">
              {gpsAccuracyThreshold.toFixed(1)} meters
            </span>
          </div>
          <input
            type="range"
            min="1.0"
            max="10.0"
            step="0.5"
            value={gpsAccuracyThreshold}
            onChange={(e) => setGpsAccuracyThreshold(parseFloat(e.target.value))}
            className="w-full max-w-md accent-blue-600"
          />
          <p className="text-[11px] text-slate-400 mt-1">
            Discards GPS location fixes with dilution of precision greater than {gpsAccuracyThreshold}m.
          </p>
        </div>

        {/* Cloud Sync Toggle */}
        <div className="pt-2">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={autoSyncCloud}
              onChange={(e) => setAutoSyncCloud(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
            />
            <div>
              <span className="text-xs font-bold text-slate-800">
                Automated Municipal Cloud Database Synchronization
              </span>
              <p className="text-[11px] text-slate-500">
                Instantly push detected potholes and crack coordinates to the central GIS server.
              </p>
            </div>
          </label>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg flex items-center gap-2 transition-all shadow-xs"
        >
          {saveSuccess ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-white" />
              <span>Settings Saved!</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4 text-white" />
              <span>Save Configuration</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
