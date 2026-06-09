import React, { useEffect, useState } from 'react';
import { getMyShifts } from '../../api/shiftApi';
import { checkIn, checkOut } from '../../api/attendanceApi';
import ShiftCard from '../../components/workforce/ShiftCard';
import toast from 'react-hot-toast';

export default function MyShifts() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ from: '', to: '', status: '' });
  const [checking, setChecking] = useState(null);

  async function load() {
    setLoading(true);
    try {
      const params = {};
      if (filters.from) params.from = filters.from;
      if (filters.to) params.to = filters.to;
      const res = await getMyShifts(params);
      setAssignments(res.data.data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [filters]);

  async function handleCheckIn(shiftId) {
    setChecking(shiftId);
    try {
      await checkIn(shiftId);
      toast.success('Checked in!');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Check-in failed');
    } finally {
      setChecking(null);
    }
  }

  async function handleCheckOut(shiftId) {
    setChecking(shiftId);
    try {
      await checkOut(shiftId);
      toast.success('Checked out!');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Check-out failed');
    } finally {
      setChecking(null);
    }
  }

  const today = new Date().toDateString();

  function isToday(shift) {
    return new Date(shift.date).toDateString() === today;
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Shifts</h1>
        <p className="text-sm text-gray-500 mt-0.5">{assignments.length} shifts</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap gap-3">
        <input type="date" className="text-sm border border-gray-200 rounded-lg px-3 py-2" value={filters.from} onChange={(e) => setFilters({ ...filters, from: e.target.value })} />
        <input type="date" className="text-sm border border-gray-200 rounded-lg px-3 py-2" value={filters.to} onChange={(e) => setFilters({ ...filters, to: e.target.value })} />
        <button onClick={() => setFilters({ from: '', to: '', status: '' })} className="text-sm text-gray-500 hover:text-gray-700 px-2">Clear</button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-primary-700 border-t-transparent rounded-full animate-spin" /></div>
      ) : assignments.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-500">No shifts found.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {assignments.map((a) => {
            const shiftToday = isToday(a.shift);
            return (
              <ShiftCard key={a.id} shift={a.shift} actions={
                shiftToday && a.status === 'CONFIRMED' ? (
                  <div className="flex gap-2">
                    <button onClick={() => handleCheckIn(a.shift.id)} disabled={checking === a.shift.id}
                      className="text-xs bg-green-600 text-white px-2 py-1 rounded-lg hover:bg-green-700 disabled:opacity-50">
                      Check In
                    </button>
                    <button onClick={() => handleCheckOut(a.shift.id)} disabled={checking === a.shift.id}
                      className="text-xs bg-orange-500 text-white px-2 py-1 rounded-lg hover:bg-orange-600 disabled:opacity-50">
                      Check Out
                    </button>
                  </div>
                ) : null
              } />
            );
          })}
        </div>
      )}
    </div>
  );
}
