import React from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { AnalysisRecord, WasteCategory } from '../types/waste';
import { WASTE_GUIDANCE_MAP } from '../data/recommendations';

interface DashboardPageProps {
  records: AnalysisRecord[];
  onClearHistory: () => void;
  onAnalyzeMore: () => void;
}

const CATEGORY_COLORS: Record<WasteCategory, string> = {
  cardboard: '#059669',
  glass: '#0d9488',
  metal: '#0284c7',
  paper: '#65a30d',
  plastic: '#d97706',
  trash: '#9ca3af',
};

const STATUS_COLORS: Record<string, string> = {
  Recyclable: '#059669',
  'Conditional / Facility Dependent': '#d97706',
  'Landfill / Solid Waste': '#9ca3af',
};

const tooltipStyle = {
  backgroundColor: '#ffffff',
  border: '1px solid #d1fae5',
  borderRadius: '8px',
  fontSize: '12px',
};

export const DashboardPage: React.FC<DashboardPageProps> = ({ records, onClearHistory, onAnalyzeMore }) => {
  const categories = Object.keys(WASTE_GUIDANCE_MAP) as WasteCategory[];

  const chartData = categories.map((cat) => ({
    name: cat.charAt(0).toUpperCase() + cat.slice(1),
    category: cat,
    count: records.filter((r) => r.category === cat).length,
  }));

  const statusCounts: Record<string, number> = {};
  records.forEach((r) => {
    const s = WASTE_GUIDANCE_MAP[r.category]?.recyclableStatus;
    if (s) statusCounts[s] = (statusCounts[s] || 0) + 1;
  });
  const statusData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));

  const recyclable = statusCounts['Recyclable'] || 0;
  const avgConfidence =
    records.length > 0 ? (records.reduce((a, r) => a + r.confidence, 0) / records.length) * 100 : 0;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-10">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900">Your dashboard</h1>
          <p className="text-neutral-600 mt-1">A summary of the items you classified. Saved only in this browser.</p>
        </div>
        <div className="flex gap-2">
          {records.length > 0 && (
            <button
              onClick={onClearHistory}
              className="px-4 py-2 text-sm font-medium text-neutral-600 bg-white border border-neutral-200 hover:bg-neutral-50 rounded-lg cursor-pointer"
            >
              Clear history
            </button>
          )}
          <button
            onClick={onAnalyzeMore}
            className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg cursor-pointer"
          >
            Classify waste
          </button>
        </div>
      </div>

      {records.length === 0 ? (
        <div className="text-center py-20 rounded-2xl bg-emerald-50/60 border border-emerald-100">
          <h2 className="text-lg font-semibold text-neutral-900">Nothing here yet</h2>
          <p className="text-sm text-neutral-600 mt-1 mb-5">Classify an item and your results will show up here.</p>
          <button
            onClick={onAnalyzeMore}
            className="px-5 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg cursor-pointer"
          >
            Classify your first item
          </button>
        </div>
      ) : (
        <>
          {/* Key numbers */}
          <div className="grid grid-cols-3 divide-x divide-emerald-100 rounded-2xl border border-emerald-100 bg-emerald-50/40">
            {[
              { label: 'Items classified', value: String(records.length) },
              { label: 'Recyclable', value: `${recyclable} (${Math.round((recyclable / records.length) * 100)}%)` },
              { label: 'Avg. confidence', value: `${avgConfidence.toFixed(0)}%` },
            ].map((s) => (
              <div key={s.label} className="px-3 sm:px-6 py-5 text-center">
                <div className="text-xl sm:text-3xl font-bold text-emerald-700">{s.value}</div>
                <div className="text-xs sm:text-sm text-neutral-600 mt-1">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3">
              <h2 className="font-semibold text-neutral-900 mb-4">By material</h2>
              <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={tooltipStyle} cursor={{ fill: '#ecfdf5' }} />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {chartData.map((d) => (
                        <Cell key={d.category} fill={CATEGORY_COLORS[d.category]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="lg:col-span-2">
              <h2 className="font-semibold text-neutral-900 mb-4">Recyclability</h2>
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={statusData} dataKey="value" innerRadius={45} outerRadius={70} paddingAngle={3}>
                      {statusData.map((d) => (
                        <Cell key={d.name} fill={STATUS_COLORS[d.name] || '#9ca3af'} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <ul className="mt-3 space-y-1.5 text-xs text-neutral-600">
                {statusData.map((d) => (
                  <li key={d.name} className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: STATUS_COLORS[d.name] || '#9ca3af' }} />
                    {d.name.split(' / ')[0]}: {d.value}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* History */}
          <div>
            <h2 className="font-semibold text-neutral-900 mb-3">Recent items</h2>
            <div className="overflow-x-auto rounded-xl border border-emerald-100">
              <table className="w-full text-sm text-left">
                <thead className="bg-emerald-50/60 text-neutral-600">
                  <tr>
                    <th className="py-3 px-4 font-medium">Material</th>
                    <th className="py-3 px-4 font-medium">Confidence</th>
                    <th className="py-3 px-4 font-medium">Result</th>
                    <th className="py-3 px-4 font-medium">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-50">
                  {records.slice(0, 20).map((r) => (
                    <tr key={r.id}>
                      <td className="py-3 px-4 font-medium text-neutral-900 capitalize">{r.category}</td>
                      <td className="py-3 px-4 text-neutral-700">{(r.confidence * 100).toFixed(0)}%</td>
                      <td className="py-3 px-4">
                        <span className={r.isUncertain ? 'text-amber-700' : 'text-emerald-700'}>
                          {r.isUncertain ? 'Check manually' : 'Confident'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-neutral-500">
                        {new Date(r.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
