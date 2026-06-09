import React, { useEffect, useRef, useState } from 'react';
import { getAvailableShifts, applyForShift } from '../../api/shiftApi';
import { getFacilities } from '../../api/facilityApi';
import { getHealthcareRoles } from '../../api/workerApi';
import toast from 'react-hot-toast';

const TYPE_LABELS = { DAY: 'Day', NIGHT: 'Night', LONG_DAY: 'Long Day', ON_CALL: 'On Call' };
const TYPE_COLORS = { DAY: 'bg-sky-50 text-sky-700', NIGHT: 'bg-indigo-50 text-indigo-700', LONG_DAY: 'bg-orange-50 text-orange-700', ON_CALL: 'bg-purple-50 text-purple-700' };

const APP_STATUS = {
  PENDING:   { label: 'Applied "” Awaiting review', cls: 'bg-yellow-50 text-yellow-800 border border-yellow-200' },
  CONFIRMED: { label: '✓ Confirmed', cls: 'bg-green-50 text-green-800 border border-green-200' },
  DECLINED:  { label: 'Not successful', cls: 'bg-red-50 text-red-700 border border-red-200' },
  CANCELLED: { label: 'Cancelled', cls: 'bg-gray-100 text-gray-500 border border-gray-200' },
};

function RequirementTag({ label }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs bg-primary-50 text-primary-800 border border-primary-100 px-2 py-0.5 rounded-full">
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
      {label}
    </span>
  );
}

function ShiftCardFull({ shift, onApply, applying }) {
  const date = new Date(shift.date);
  const start = new Date(shift.startTime);
  const end = new Date(shift.endTime);
  const spotsLeft = shift.requiredWorkers - shift.confirmedCount;
  const fillPct = Math.min(100, (shift.confirmedCount / shift.requiredWorkers) * 100);
  const appStatus = shift.myApplicationStatus;
  const canApply = !appStatus && spotsLeft > 0;

  const requirements = [
    shift.requiresDBS && 'DBS Check',
    shift.requiresNMC && 'NMC PIN',
    shift.requiresRightToWork && 'Right to Work',
    shift.requiresCareCert && 'Care Certificate',
    shift.requiresMandatoryTraining && 'Mandatory Training',
  ].filter(Boolean);

  return (
    <div className={`bg-white rounded-2xl border transition-shadow ${appStatus === 'CONFIRMED' ? 'border-green-200 shadow-sm shadow-green-50' : 'border-gray-200 hover:shadow-md'}`}>
      {/* Header strip */}
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-gray-900 truncate">{shift.title}</h3>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${TYPE_COLORS[shift.shiftType] || 'bg-gray-100 text-gray-600'}`}>
                {TYPE_LABELS[shift.shiftType]}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-0.5">{shift.facility?.name}</p>
            <p className="text-xs text-gray-400">{shift.role?.name}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-xl font-bold text-gray-900">£{shift.hourlyRate?.toFixed(2)}</p>
            <p className="text-xs text-gray-400">per hour</p>
          </div>
        </div>

        {/* Date + time row */}
        <div className="mt-4 flex flex-wrap gap-3 text-sm text-gray-600">
          <span className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {date.toLocaleDateString('en-GB', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
          </span>
          <span className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {start.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} "“ {end.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        {/* Requirements */}
        {requirements.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5 items-center">
            <span className="text-xs text-gray-400 mr-0.5">Requires:</span>
            {requirements.map((r) => <RequirementTag key={r} label={r} />)}
          </div>
        )}

        {shift.notes && (
          <p className="mt-2 text-xs text-gray-400 italic leading-relaxed">{shift.notes}</p>
        )}
      </div>

      {/* Footer */}
      <div className="px-5 py-3 bg-gray-50 rounded-b-2xl border-t border-gray-100 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1">
          <div className="flex-1 max-w-28">
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div className="bg-primary-600 h-1.5 rounded-full transition-all" style={{ width: `${fillPct}%` }} />
            </div>
          </div>
          <span className="text-xs text-gray-500 whitespace-nowrap">
            {shift.confirmedCount}/{shift.requiredWorkers} filled
            {spotsLeft > 0 && <span className="text-primary-700 font-medium"> · {spotsLeft} spot{spotsLeft !== 1 ? 's' : ''} left</span>}
          </span>
        </div>

        <div>
          {appStatus ? (
            <span className={`text-xs font-medium px-3 py-1.5 rounded-lg ${APP_STATUS[appStatus]?.cls}`}>
              {APP_STATUS[appStatus]?.label}
            </span>
          ) : spotsLeft === 0 ? (
            <span className="text-xs text-gray-400 px-3 py-1.5">Fully booked</span>
          ) : (
            <button
              onClick={() => onApply(shift.id)}
              disabled={applying === shift.id}
              className="bg-primary-700 hover:bg-primary-800 text-white text-sm font-medium px-4 py-1.5 rounded-lg disabled:opacity-60 transition-colors"
            >
              {applying === shift.id ? (
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Applying…
                </span>
              ) : 'Apply'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AvailableShifts() {
  const [shifts, setShifts] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [applying, setApplying] = useState(null);
  const [filters, setFilters] = useState({ from: '', to: '', facilityId: '', roleId: '' });

  // Prevent StrictMode double-invoke from showing duplicate toasts or setting stale state
  const fetchIdRef = useRef(0);

  async function load(currentFilters) {
    const fetchId = ++fetchIdRef.current;
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (currentFilters.from) params.from = currentFilters.from;
      if (currentFilters.to) params.to = currentFilters.to;
      if (currentFilters.facilityId) params.facilityId = currentFilters.facilityId;
      if (currentFilters.roleId) params.roleId = currentFilters.roleId;
      const res = await getAvailableShifts(params);
      // Discard result if a newer fetch has started
      if (fetchId !== fetchIdRef.current) return;
      setShifts(res.data.data);
    } catch (err) {
      if (fetchId !== fetchIdRef.current) return;
      setError(err.response?.data?.message || 'Could not load shifts. Please try again.');
    } finally {
      if (fetchId === fetchIdRef.current) setLoading(false);
    }
  }

  useEffect(() => {
    Promise.all([getFacilities(), getHealthcareRoles()])
      .then(([f, r]) => {
        setFacilities(f.data.data);
        setRoles(r.data.data);
      })
      .catch(() => {}); // non-critical; filters still usable without these
  }, []);

  useEffect(() => {
    load(filters);
  }, [filters]);

  async function handleApply(shiftId) {
    setApplying(shiftId);
    try {
      await applyForShift(shiftId);
      toast.success('Application submitted! Your manager will confirm shortly.');
      // Refresh to update button state
      load(filters);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Application failed. Please try again.');
    } finally {
      setApplying(null);
    }
  }

  function clearFilters() {
    setFilters({ from: '', to: '', facilityId: '', roleId: '' });
  }

  const hasFilters = filters.from || filters.to || filters.facilityId || filters.roleId;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Find Shifts</h1>
        <p className="text-sm text-gray-500 mt-0.5">Browse open shifts and submit your application</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">From</label>
            <input type="date" className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-700"
              value={filters.from} onChange={(e) => setFilters((f) => ({ ...f, from: e.target.value }))} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">To</label>
            <input type="date" className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-700"
              value={filters.to} onChange={(e) => setFilters((f) => ({ ...f, to: e.target.value }))} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Facility</label>
            <select className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-700"
              value={filters.facilityId} onChange={(e) => setFilters((f) => ({ ...f, facilityId: e.target.value }))}>
              <option value="">All facilities</option>
              {facilities.map((fac) => <option key={fac.id} value={fac.id}>{fac.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Role</label>
            <select className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-700"
              value={filters.roleId} onChange={(e) => setFilters((f) => ({ ...f, roleId: e.target.value }))}>
              <option value="">All roles</option>
              {roles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </div>
          {hasFilters && (
            <button onClick={clearFilters} className="text-sm text-gray-500 hover:text-gray-700 px-2 py-2 flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="w-8 h-8 border-4 border-primary-700 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-400">Loading available shifts…</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <svg className="w-10 h-10 text-red-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-red-800 font-medium">Could not load shifts</p>
          <p className="text-red-600 text-sm mt-1">{error}</p>
          <button onClick={() => load(filters)} className="mt-4 text-sm text-red-700 border border-red-300 px-4 py-1.5 rounded-lg hover:bg-red-100 transition-colors">
            Try again
          </button>
        </div>
      ) : shifts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <p className="font-medium text-gray-900">No shifts available right now</p>
            <p className="text-sm text-gray-500 mt-1">{hasFilters ? 'Try adjusting your filters.' : 'Check back soon "” new shifts are posted regularly.'}</p>
          </div>
          {hasFilters && (
            <button onClick={clearFilters} className="text-sm text-primary-700 hover:underline">Clear filters</button>
          )}
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500">{shifts.length} shift{shifts.length !== 1 ? 's' : ''} available</p>
          <div className="space-y-4">
            {shifts.map((shift) => (
              <ShiftCardFull key={shift.id} shift={shift} onApply={handleApply} applying={applying} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
