import React, { useState } from 'react';
import { 
  Search, 
  Trash2, 
  Eye 
} from 'lucide-react';
import { DamageDetection, DefectStatus, DamageType } from '../types/damage';

interface DataManagementModuleProps {
  detections: DamageDetection[];
  onSelectDetection: (det: DamageDetection) => void;
  onUpdateStatus: (id: string, status: DefectStatus) => void;
  onDeleteDetection: (id: string) => void;
}

export const DataManagementModule: React.FC<DataManagementModuleProps> = ({
  detections,
  onSelectDetection,
  onUpdateStatus,
  onDeleteDetection
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<DamageType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<DefectStatus | 'all'>('all');

  const filtered = detections.filter(d => {
    const matchesSearch = d.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          d.roadName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          d.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || 
                        d.type === typeFilter || 
                        ((typeFilter === 'crack' || typeFilter === 'longitudinal_crack') && (d.type === 'crack' || d.type === 'longitudinal_crack'));
    const matchesStatus = statusFilter === 'all' || d.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-6 space-y-5">
      {/* Search and Filters Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by ID, road name, or damage type..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs md:text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700"
          >
            <option value="all">All Types</option>
            <option value="pothole">Potholes</option>
            <option value="longitudinal_crack">Longitudinal Cracks</option>
            <option value="transverse_crack">Transverse Cracks</option>
            <option value="alligator_crack">Alligator Cracks</option>
            <option value="manhole_hazard">Manhole Hazards</option>
            <option value="other">Other Defects</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700"
          >
            <option value="all">All Statuses</option>
            <option value="detected">Detected</option>
            <option value="inspected">Inspected</option>
            <option value="scheduled">Scheduled</option>
            <option value="repaired">Repaired</option>
          </select>
        </div>
      </div>

      {/* Table Container */}
      <div className="border border-slate-200 rounded-xl overflow-hidden overflow-x-auto shadow-2xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
            <tr>
              <th className="p-3.5">ID & Image</th>
              <th className="p-3.5">Defect Type</th>
              <th className="p-3.5">Corridor / Location</th>
              <th className="p-3.5">Confidence</th>
              <th className="p-3.5">GPS Coordinates</th>
              <th className="p-3.5">Status</th>
              <th className="p-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="p-3.5 flex items-center gap-3">
                  <div className="w-11 h-11 rounded-lg overflow-hidden bg-slate-900 shrink-0 border border-slate-200">
                    <img src={item.cropImage || item.image} alt={item.title} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <div className="font-mono font-bold text-slate-900">{item.id}</div>
                    <div className="text-[11px] text-slate-400">{item.date}</div>
                  </div>
                </td>
                <td className="p-3.5">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider text-white ${
                    item.type === 'pothole' ? 'bg-rose-500' :
                    item.type === 'crack' || item.type === 'longitudinal_crack' ? 'bg-amber-500' :
                    item.type === 'transverse_crack' ? 'bg-teal-600' :
                    item.type === 'alligator_crack' ? 'bg-indigo-600' :
                    item.type === 'manhole_hazard' ? 'bg-sky-600' : 'bg-emerald-600'
                  }`}>
                    {item.type.replace('_', ' ')}
                  </span>
                </td>
                <td className="p-3.5 font-medium text-slate-800 max-w-[180px] truncate">
                  {item.roadName}
                </td>
                <td className="p-3.5 font-mono font-bold text-blue-600">
                  {(item.confidence * 100).toFixed(0)}%
                </td>
                <td className="p-3.5 font-mono text-slate-600">
                  {item.coordinates.lat.toFixed(4)}, {item.coordinates.lng.toFixed(4)}
                </td>
                <td className="p-3.5">
                  <select
                    value={item.status}
                    onChange={(e) => onUpdateStatus(item.id, e.target.value as DefectStatus)}
                    className="text-xs px-2 py-1 bg-white border border-slate-200 rounded font-medium text-slate-700 cursor-pointer"
                  >
                    <option value="detected">Detected</option>
                    <option value="inspected">Inspected</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="repaired">Repaired</option>
                  </select>
                </td>
                <td className="p-3.5 text-right space-x-1">
                  <button
                    onClick={() => onSelectDetection(item)}
                    className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    title="View Full Details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDeleteDetection(item.id)}
                    className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                    title="Delete Record"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
