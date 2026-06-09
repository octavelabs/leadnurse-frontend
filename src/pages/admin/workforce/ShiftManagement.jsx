import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getShifts, deleteShift } from '../../../api/shiftApi';
import { getFacilities } from '../../../api/facilityApi';
import ShiftCard from '../../../components/workforce/ShiftCard';
import toast from 'react-hot-toast';

export default function ShiftManagement() {
  const [shifts, setShifts] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', facilityId: '', from: '', to: '' });
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const LIMIT = 12;

  async function load() {
    setLoading(true);
    try {
      const params = { page, limit: LIMIT };
      if (filters.status) params.status = filters.status;
      if (filters.facilityId) params.facilityId = filters.facilityId;
      if (filters.from) params.from = filters.from;
      if (filters.to) params.to = filters.to;
      const res = await getShifts(params);
      setShifts(res.data.data.shifts);
      setTotal(res.data.data.total);
    } catch {
      toast.error('Failed to load shifts');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { getFacilities().then((r) => setFacilities(r.data.data)); }, []);
  useEffect(() => { load(); }, [page, filters]);

  async function handleDelete(id) {
    if (!window.confirm('Delete this shift?')) return;
    try {
      await deleteShift(id);
      toast.success('Shift deleted');
      load();
    } catch {
      toast.error('Delete failed');
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Shift Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">{total} shifts total</p>
        </div>
        <Link to="/admin/workforce/shifts/new" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
          + New Shift
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap gap-3">
        <select className="text-sm border border-gray-200 rounded-lg px-3 py-2" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
          <option value="">All Statuses</option>
          {['OPEN','PARTIALLY_FILLED','FILLED','COMPLETED','CANCELLED'].map((s) => <option key={s} value={s}>{s.replace('_',' ')}</option>)}
        </select>
        <select className="text-sm border border-gray-200 rounded-lg px-3 py-2" value={filters.facilityId} onChange={(e) => setFilters({ ...filters, facilityId: e.target.value })}>
          <option value="">All Facilities</option>
          {facilities.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
        </select>
        <input type="date" className="text-sm border border-gray-200 rounded-lg px-3 py-2" value={filters.from} onChange={(e) => setFilters({ ...filters, from: e.target.value })} />
        <input type="date" className="text-sm border border-gray-200 rounded-lg px-3 py-2" value={filters.to} onChange={(e) => setFilters({ ...filters, to: e.target.value })} />
        <button onClick={() => { setFilters({ status: '', facilityId: '', from: '', to: '' }); setPage(1); }} className="text-sm text-gray-500 hover:text-gray-700 px-2">Clear</button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>
      ) : shifts.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No shifts found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {shifts.map((shift) => (
            <ShiftCard key={shift.id} shift={shift} actions={
              <>
                <Link to={`/admin/workforce/shifts/${shift.id}/edit`} className="text-xs text-blue-600 hover:underline">Edit</Link>
                <button onClick={() => handleDelete(shift.id)} className="text-xs text-red-500 hover:underline">Delete</button>
              </>
            } />
          ))}
        </div>
      )}

      {total > LIMIT && (
        <div className="flex justify-center gap-2">
          <button disabled={page === 1} onClick={() => setPage(page - 1)} className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-40">Previous</button>
          <span className="px-3 py-1.5 text-sm text-gray-600">Page {page} of {Math.ceil(total / LIMIT)}</span>
          <button disabled={page >= Math.ceil(total / LIMIT)} onClick={() => setPage(page + 1)} className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-40">Next</button>
        </div>
      )}
    </div>
  );
}
