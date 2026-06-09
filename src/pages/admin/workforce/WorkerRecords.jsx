import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getWorkers } from '../../../api/workerApi';
import ComplianceBadge from '../../../components/workforce/ComplianceBadge';

function getWorstCompliance(compliance) {
  if (!compliance?.length) return null;
  if (compliance.some((c) => c.status === 'EXPIRED')) return 'EXPIRED';
  if (compliance.some((c) => c.status === 'EXPIRING_SOON')) return 'EXPIRING_SOON';
  if (compliance.some((c) => c.status === 'NOT_SUBMITTED')) return 'NOT_SUBMITTED';
  return 'VALID';
}

export default function WorkerRecords() {
  const navigate = useNavigate();
  const [workers, setWorkers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [page, setPage] = useState(1);
  const fetchIdRef = useRef(0);
  const LIMIT = 20;

  useEffect(() => {
    const fetchId = ++fetchIdRef.current;
    setLoading(true);
    const params = { page, limit: LIMIT };
    if (search) params.search = search;
    if (cityFilter) params.city = cityFilter;

    getWorkers(params).then((res) => {
      if (fetchId !== fetchIdRef.current) return;
      setWorkers(res.data.data.workers);
      setTotal(res.data.data.total);
    }).finally(() => {
      if (fetchId === fetchIdRef.current) setLoading(false);
    });
  }, [search, cityFilter, page]);

  function handleSearchChange(e) {
    setSearch(e.target.value);
    setPage(1);
  }

  function handleCityChange(e) {
    setCityFilter(e.target.value);
    setPage(1);
  }

  const hasFilters = search || cityFilter;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Worker Records</h1>
          <p className="text-sm text-gray-500 mt-0.5">{total} staff members</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-48">
          <label className="block text-xs font-medium text-gray-500 mb-1">Search</label>
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-700"
              placeholder="Name, emailâ€¦"
              value={search}
              onChange={handleSearchChange}
            />
          </div>
        </div>
        <div className="min-w-40">
          <label className="block text-xs font-medium text-gray-500 mb-1">Filter by City</label>
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <input
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-700"
              placeholder="e.g. Telford"
              value={cityFilter}
              onChange={handleCityChange}
            />
          </div>
        </div>
        {hasFilters && (
          <button
            onClick={() => { setSearch(''); setCityFilter(''); setPage(1); }}
            className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 py-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            Clear
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary-700 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : workers.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-500">
          {hasFilters ? 'No workers match your filters.' : 'No workers registered yet.'}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Contact</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Location</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Roles</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Compliance</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {workers.map((w) => (
                <tr
                  key={w.id}
                  onClick={() => navigate(`/admin/workforce/workers/${w.id}`)}
                  className="hover:bg-primary-50 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-800 font-semibold text-xs flex-shrink-0">
                        {w.name?.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-gray-900">{w.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-gray-600">{w.email}</p>
                    {w.phone && <p className="text-xs text-gray-400 mt-0.5">{w.phone}</p>}
                  </td>
                  <td className="px-4 py-3">
                    {w.city ? (
                      <div className="flex items-center gap-1 text-gray-600">
                        <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>{w.city}{w.postcode ? `, ${w.postcode}` : ''}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">â€”</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {w.workerRoles?.map((wr) => (
                        <span key={wr.id} className="text-xs bg-primary-50 text-primary-800 px-2 py-0.5 rounded">{wr.role.name}</span>
                      ))}
                      {w.workerRoles?.length === 0 && <span className="text-xs text-gray-400">None</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {getWorstCompliance(w.compliance)
                      ? <ComplianceBadge status={getWorstCompliance(w.compliance)} />
                      : <span className="text-xs text-gray-400">â€”</span>}
                  </td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                    {new Date(w.createdAt).toLocaleDateString('en-GB')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-4 py-2 border-t border-gray-100 bg-gray-50">
            <p className="text-xs text-gray-400">Click any row to view full worker profile</p>
          </div>
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
