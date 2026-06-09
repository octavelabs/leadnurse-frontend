import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAllReferences, getReferenceSummary } from '../../../api/referenceApi';

const STATUS_STYLES = {
  PENDING:   'bg-gray-100 text-gray-600',
  SENT:      'bg-yellow-100 text-yellow-700',
  COMPLETED: 'bg-green-100 text-green-700',
  DECLINED:  'bg-red-100 text-red-700',
  EXPIRED:   'bg-orange-100 text-orange-700',
};

const RELATIONSHIP_LABELS = {
  LINE_MANAGER: 'Line Manager',
  SUPERVISOR:   'Supervisor',
  COLLEAGUE:    'Colleague',
  HR_CONTACT:   'HR Contact',
  OTHER:        'Other',
};

function StatusBadge({ status }) {
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded ${STATUS_STYLES[status] || 'bg-gray-100 text-gray-600'}`}>
      {status?.replace(/_/g, ' ')}
    </span>
  );
}

export default function ReferenceMonitor() {
  const navigate = useNavigate();
  const [references, setReferences] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    setLoading(true);
    const params = statusFilter ? { status: statusFilter } : {};
    Promise.all([
      getAllReferences(params),
      getReferenceSummary(),
    ]).then(([refRes, sumRes]) => {
      setReferences(refRes.data.data.references);
      setSummary(sumRes.data.data);
    }).finally(() => setLoading(false));
  }, [statusFilter]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">References</h1>
        <p className="text-sm text-gray-500 mt-0.5">Track employment reference requests across all workers</p>
      </div>

      {/* Summary cards */}
      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500">Total</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{summary.total}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500">Awaiting Response</p>
            <p className="text-2xl font-bold text-yellow-600 mt-1">{summary.awaitingResponse}</p>
            <p className="text-xs text-gray-400 mt-0.5">{summary.pending} unsent Â· {summary.sent} sent</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500">Completed</p>
            <p className="text-2xl font-bold text-green-600 mt-1">{summary.completed}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500">Expired / Declined</p>
            <p className="text-2xl font-bold text-red-500 mt-1">{summary.expired + summary.declined}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap gap-3 items-center">
        <label className="text-xs font-medium text-gray-500">Filter by status:</label>
        <div className="flex flex-wrap gap-2">
          {['', 'PENDING', 'SENT', 'COMPLETED', 'DECLINED', 'EXPIRED'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1 rounded-lg text-xs font-medium border transition-colors ${
                statusFilter === s
                  ? 'bg-primary-700 text-white border-primary-700'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {s || 'All'}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-primary-700 border-t-transparent rounded-full animate-spin" /></div>
      ) : references.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-500">
          No references found{statusFilter ? ' for this status' : ''}. Add references from a worker's profile.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Worker</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Referee</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Relationship</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Requested</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Completed</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {references.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link
                      to={`/admin/workforce/workers/${r.worker?.id}`}
                      className="font-medium text-primary-700 hover:text-primary-800"
                    >
                      {r.worker?.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{r.refereeName}</p>
                    <p className="text-xs text-gray-400">{r.refereeEmail}</p>
                    {r.refereeOrganisation && <p className="text-xs text-gray-400">{r.refereeOrganisation}</p>}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {RELATIONSHIP_LABELS[r.relationship] || r.relationship}
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {r.requestedAt ? new Date(r.requestedAt).toLocaleDateString('en-GB') : 'â€”'}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {r.completedAt ? new Date(r.completedAt).toLocaleDateString('en-GB') : 'â€”'}
                  </td>
                  <td className="px-4 py-3">
                    {r.status === 'COMPLETED' && (
                      <button
                        onClick={() => navigate(`/admin/workforce/workers/${r.worker?.id}`)}
                        className="text-xs text-primary-700 hover:underline"
                      >
                        View
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
