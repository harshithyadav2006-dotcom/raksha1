import React, { useState, useMemo } from 'react';
import { Search, Flame, Shield, Activity, Eye, ChevronUp, ChevronDown, X, Clock } from 'lucide-react';

const TYPES = ['Fire', 'Medical', 'Security'];
const STATUSES = ['Active', 'Resolved', 'Pending'];
const SEVERITIES = ['Critical', 'High', 'Medium', 'Low'];

const MOCK_INCIDENTS = Array.from({ length: 15 }, (_, i) => ({
  id: `INC-${1024 + i}`,
  type: TYPES[i % 3],
  location: ['MG Road Junction', 'Indiranagar 100ft Rd', 'Koramangala 4th Block', 'Whitefield ITBP', 'Jayanagar 4th T Block'][i % 5],
  severity: SEVERITIES[i % 4],
  reportedAt: new Date(Date.now() - (i * 3600000) - 1200000).toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true, month: 'short', day: 'numeric' }),
  assignedUnit: ['FTR-04', 'AMB-01', 'PAT-12', 'Unassigned'][i % 4],
  responseTime: i % 4 === 3 ? '—' : `${Math.floor(Math.random() * 12) + 3}m`,
  status: STATUSES[i % 3],
  timeline: [
    { time: 'T-0', action: 'Initial report received via Public App' },
    { time: 'T+2m', action: `AI classified incident as ${SEVERITIES[i % 4]} severity` },
    { time: 'T+3m', action: 'Automated dispatch protocol initiated' },
    { time: 'T+8m', action: 'First responders arrived on scene' },
  ]
}));

type SortKey = keyof typeof MOCK_INCIDENTS[0];

export const IncidentManagementTable: React.FC = () => {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortKey, setSortKey] = useState<SortKey>('id');
  const [sortAsc, setSortAsc] = useState(false);
  const [viewIncident, setViewIncident] = useState<typeof MOCK_INCIDENTS[0] | null>(null);

  const filtered = useMemo(() => {
    return MOCK_INCIDENTS.filter(inc => {
      const matchSearch = inc.id.toLowerCase().includes(search.toLowerCase()) || inc.location.toLowerCase().includes(search.toLowerCase());
      const matchType = typeFilter === 'All' || inc.type === typeFilter;
      const matchStatus = statusFilter === 'All' || inc.status === statusFilter;
      return matchSearch && matchType && matchStatus;
    }).sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (aVal < bVal) return sortAsc ? -1 : 1;
      if (aVal > bVal) return sortAsc ? 1 : -1;
      return 0;
    });
  }, [search, typeFilter, statusFilter, sortKey, sortAsc]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(true); }
  };

  const getSeverityBadge = (sev: string) => {
    const colors: Record<string, string> = {
      'Critical': 'bg-red-500/20 text-red-400 border-red-500/30',
      'High': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      'Medium': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      'Low': 'bg-green-500/20 text-green-400 border-green-500/30'
    };
    return <span className={`text-[10px] border px-2 py-0.5 rounded-full uppercase tracking-wider font-bold ${colors[sev]}`}>{sev}</span>;
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      'Active': 'bg-red-500/20 text-red-400 border-red-500/30',
      'Pending': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      'Resolved': 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    };
    return <span className={`text-[10px] border px-2 py-0.5 rounded-full uppercase tracking-wider font-bold ${colors[status]}`}>{status}</span>;
  };

  const getTypeIcon = (type: string) => {
    if (type === 'Fire') return <Flame size={14} className="text-orange-400" />;
    if (type === 'Medical') return <Activity size={14} className="text-blue-400" />;
    return <Shield size={14} className="text-purple-400" />;
  };

  const thClass = "px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-white/5 transition-colors";

  return (
    <div className="flex flex-col gap-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 liquid-glass border border-white/10 rounded-xl p-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input 
            type="text" 
            placeholder="Search ID or Location..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-black/50 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-white/30 transition-colors"
          />
        </div>
        <select 
          value={typeFilter} 
          onChange={e => setTypeFilter(e.target.value)}
          className="bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-white/30 [&>option]:bg-zinc-900"
        >
          <option value="All">All Types</option>
          {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select 
          value={statusFilter} 
          onChange={e => setStatusFilter(e.target.value)}
          className="bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-white/30 [&>option]:bg-zinc-900"
        >
          <option value="All">All Statuses</option>
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="liquid-glass border border-white/10 rounded-xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto max-h-[500px]">
          <table className="w-full text-sm">
            <thead className="bg-black/60 sticky top-0 z-10 backdrop-blur-md">
              <tr className="border-b border-white/10">
                <th className={thClass} onClick={() => handleSort('id')}>ID {sortKey==='id' && (sortAsc ? <ChevronUp size={12} className="inline"/> : <ChevronDown size={12} className="inline"/>)}</th>
                <th className={thClass} onClick={() => handleSort('type')}>Type {sortKey==='type' && (sortAsc ? <ChevronUp size={12} className="inline"/> : <ChevronDown size={12} className="inline"/>)}</th>
                <th className={thClass} onClick={() => handleSort('location')}>Location {sortKey==='location' && (sortAsc ? <ChevronUp size={12} className="inline"/> : <ChevronDown size={12} className="inline"/>)}</th>
                <th className={thClass} onClick={() => handleSort('severity')}>Severity {sortKey==='severity' && (sortAsc ? <ChevronUp size={12} className="inline"/> : <ChevronDown size={12} className="inline"/>)}</th>
                <th className={thClass} onClick={() => handleSort('reportedAt')}>Reported {sortKey==='reportedAt' && (sortAsc ? <ChevronUp size={12} className="inline"/> : <ChevronDown size={12} className="inline"/>)}</th>
                <th className={thClass} onClick={() => handleSort('assignedUnit')}>Unit {sortKey==='assignedUnit' && (sortAsc ? <ChevronUp size={12} className="inline"/> : <ChevronDown size={12} className="inline"/>)}</th>
                <th className={thClass} onClick={() => handleSort('responseTime')}>Resp. Time {sortKey==='responseTime' && (sortAsc ? <ChevronUp size={12} className="inline"/> : <ChevronDown size={12} className="inline"/>)}</th>
                <th className={thClass} onClick={() => handleSort('status')}>Status {sortKey==='status' && (sortAsc ? <ChevronUp size={12} className="inline"/> : <ChevronDown size={12} className="inline"/>)}</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map(inc => (
                <tr key={inc.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3 font-mono text-white font-medium">{inc.id}</td>
                  <td className="px-4 py-3"><div className="flex items-center gap-2">{getTypeIcon(inc.type)} <span className="text-gray-300">{inc.type}</span></div></td>
                  <td className="px-4 py-3 text-gray-300">{inc.location}</td>
                  <td className="px-4 py-3">{getSeverityBadge(inc.severity)}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{inc.reportedAt}</td>
                  <td className="px-4 py-3 font-mono text-gray-300 text-xs">{inc.assignedUnit}</td>
                  <td className="px-4 py-3 font-mono text-gray-300 text-xs">{inc.responseTime}</td>
                  <td className="px-4 py-3">{getStatusBadge(inc.status)}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => setViewIncident(inc)} className="p-1.5 bg-white/10 hover:bg-white/20 rounded-md transition-colors text-white">
                      <Eye size={14} />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={9} className="px-4 py-8 text-center text-gray-500">No incidents match your filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {viewIncident && (
        <div className="fixed inset-0 z-[1100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease-out]">
          <div className="liquid-glass border border-white/10 rounded-2xl p-6 max-w-2xl w-full flex flex-col max-h-[90vh]">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-3">
                  {viewIncident.id} {getSeverityBadge(viewIncident.severity)} {getStatusBadge(viewIncident.status)}
                </h3>
                <div className="text-sm text-gray-400 flex items-center gap-2">
                  {getTypeIcon(viewIncident.type)} {viewIncident.type} Incident · {viewIncident.location}
                </div>
              </div>
              <button onClick={() => setViewIncident(null)} className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors"><X size={20} className="text-white" /></button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white/5 rounded-lg p-3 border border-white/5">
                <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Reported At</div>
                <div className="text-xs text-white">{viewIncident.reportedAt}</div>
              </div>
              <div className="bg-white/5 rounded-lg p-3 border border-white/5">
                <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Assigned Unit</div>
                <div className="text-xs font-mono text-white">{viewIncident.assignedUnit}</div>
              </div>
              <div className="bg-white/5 rounded-lg p-3 border border-white/5">
                <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Response Time</div>
                <div className="text-xs font-mono text-white">{viewIncident.responseTime}</div>
              </div>
              <div className="bg-white/5 rounded-lg p-3 border border-white/5">
                <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Status</div>
                <div className="text-xs text-white">{viewIncident.status}</div>
              </div>
            </div>

            <h4 className="text-sm font-semibold tracking-wider text-white mb-4 border-b border-white/10 pb-2">INCIDENT TIMELINE</h4>
            <div className="flex-1 overflow-y-auto pr-2 relative">
              <div className="absolute left-3 top-2 bottom-2 w-px bg-white/10" />
              <div className="flex flex-col gap-4">
                {viewIncident.timeline.map((t, i) => (
                  <div key={i} className="flex gap-4 relative">
                    <div className="w-6 h-6 rounded-full bg-black border-2 border-white/20 flex items-center justify-center shrink-0 z-10 mt-0.5">
                      <Clock size={10} className="text-gray-400" />
                    </div>
                    <div className="bg-white/5 border border-white/5 rounded-lg p-3 flex-1">
                      <div className="text-xs font-mono text-blue-400 mb-1">{t.time}</div>
                      <div className="text-sm text-gray-300">{t.action}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button onClick={() => setViewIncident(null)} className="px-6 py-2.5 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors">
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
