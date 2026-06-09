import React, { useEffect, useState } from 'react';
import { getMyAttendance } from '../../api/attendanceApi';
import AttendanceStatusBadge from '../../components/workforce/AttendanceStatusBadge';

export default function MyAttendance() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ from: '', to: '' });

  async function load() {
    setLoading(true);
    try {
      const params = {};
      if (filters.from) params.from = filters.from;
      if (filters.to) params.to = filters.to;
      const res = await getMyAttendance(params);
      setRecords(res.data.data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [filters]);

  const totalHours = records.reduce((s, r) => s + (r.hoursWorked || 0), 0);
  const totalOvertime = records.reduce((s, r) => s + (r.overtimeHours || 0), 0);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Attendance</h1>
        <p className="text-sm text-gray-500 mt-0.5">{records.length} records Â· {totalHours.toFixed(1)}h regular Â· {totalOvertime.toFixed(1)}h overtime</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap gap-3">
        <input type="date" className="text-sm border border-gray-200 rounded-lg px-3 py-2" value={filters.from} onChange={(e) => setFilters({ ...filters, from: e.target.value })} />
        <input type="date" className="text-sm border border-gray-200 rounded-lg px-3 py-2" value={filters.to} onChange={(e) => setFilters({ ...filters, to: e.target.value })} />
        <button onClick={() => setFilters({ from: '', to: '' })} className="text-sm text-gray-500 hover:text-gray-700 px-2">Clear</button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-primary-700 border-t-transparent rounded-full animate-spin" /></div>
      ) : records.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-500">No attendance records found.</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Shift</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Facility</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Check In</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Check Out</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Hours</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {records.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{r.shift?.title}</td>
                  <td className="px-4 py-3 text-gray-500">{r.shift?.facility?.name}</td>
                  <td className="px-4 py-3 text-gray-600">{r.checkInTime ? new Date(r.checkInTime).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'â€”'}</td>
                  <td className="px-4 py-3 text-gray-600">{r.checkOutTime ? new Date(r.checkOutTime).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'â€”'}</td>
                  <td className="px-4 py-3">{r.hoursWorked ? `${r.hoursWorked.toFixed(1)}h${r.overtimeHours > 0 ? ` +${r.overtimeHours.toFixed(1)}OT` : ''}` : 'â€”'}</td>
                  <td className="px-4 py-3"><AttendanceStatusBadge status={r.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
