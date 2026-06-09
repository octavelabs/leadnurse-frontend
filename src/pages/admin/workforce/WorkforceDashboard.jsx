import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../../api/axios';

function StatCard({ label, value, sub, color = 'blue', to }) {
  const colorMap = { blue: 'bg-primary-50 text-primary-800', green: 'bg-green-50 text-green-700', yellow: 'bg-yellow-50 text-yellow-700', red: 'bg-red-50 text-red-700' };
  const content = (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm transition-shadow">
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`text-3xl font-bold mt-1 ${colorMap[color].split(' ')[1]}`}>{value ?? 'â€”'}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
  return to ? <Link to={to}>{content}</Link> : content;
}

export default function WorkforceDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/analytics/workforce').then((r) => setStats(r.data.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-primary-700 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Workforce Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Overview of your healthcare workforce</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Workers" value={stats?.totalWorkers} color="blue" to="/admin/workforce/workers" />
        <StatCard label="Open Shifts" value={stats?.openShifts} color="yellow" to="/admin/workforce/shifts" />
        <StatCard label="Today's Shifts" value={stats?.todayShifts} color="green" />
        <StatCard label="Compliance Alerts" value={stats?.expiringCompliance} color="red" to="/admin/workforce/compliance" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-2 gap-4">
        <StatCard
          label="References Awaiting Response"
          value={stats?.referencesAwaitingResponse}
          color="yellow"
          sub="Pending or sent â€” no reply yet"
          to="/admin/workforce/references"
        />
        <StatCard
          label="References Completed"
          value={stats?.referencesCompleted}
          color="green"
          sub="Responses received"
          to="/admin/workforce/references"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Shift Status Breakdown</h2>
          <div className="space-y-2">
            {stats?.shiftsByStatus && Object.entries(stats.shiftsByStatus).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{status.replace('_', ' ')}</span>
                <span className="font-medium text-gray-900">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {stats?.recentAuditLogs?.slice(0, 8).map((log) => (
              <div key={log.id} className="flex items-start gap-3 text-sm">
                <span className="w-16 text-xs text-gray-400 flex-shrink-0 pt-0.5">{new Date(log.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</span>
                <div>
                  <span className="font-medium text-gray-700">{log.user?.name || 'System'}</span>
                  <span className="text-gray-500"> {log.action.toLowerCase()} {log.entity.toLowerCase()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="font-semibold text-gray-900 mb-2">Monthly Hours</h2>
        <p className="text-3xl font-bold text-primary-800">{(stats?.monthlyHours || 0).toFixed(1)}</p>
        <p className="text-sm text-gray-500 mt-1">Total hours worked this month across {stats?.monthlyAttendanceCount} shifts</p>
      </div>
    </div>
  );
}
