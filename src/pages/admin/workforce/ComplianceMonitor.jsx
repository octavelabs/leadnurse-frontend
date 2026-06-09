import React, { useEffect, useState } from 'react';
import { getAllCompliance, upsertCompliance } from '../../../api/complianceApi';
import ComplianceBadge from '../../../components/workforce/ComplianceBadge';
import toast from 'react-hot-toast';

const COMPLIANCE_TYPES = ['DBS','NMC_PIN','RIGHT_TO_WORK','CARE_CERTIFICATE','MANDATORY_TRAINING','FIRST_AID','MANUAL_HANDLING','INFECTION_CONTROL','SAFEGUARDING','OTHER'];

export default function ComplianceMonitor() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: 'EXPIRING_SOON', type: '' });
  const [editRecord, setEditRecord] = useState(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.type) params.type = filters.type;
      const res = await getAllCompliance(params);
      setRecords(res.data.data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [filters]);

  async function handleSave() {
    setSaving(true);
    try {
      await upsertCompliance(editRecord);
      toast.success('Compliance record saved');
      setEditRecord(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Compliance Monitor</h1>
        <p className="text-sm text-gray-500 mt-0.5">{records.length} records</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap gap-3">
        <select className="text-sm border border-gray-200 rounded-lg px-3 py-2" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
          <option value="">All Statuses</option>
          {['VALID','EXPIRING_SOON','EXPIRED','NOT_SUBMITTED','UNDER_REVIEW'].map((s) => <option key={s} value={s}>{s.replace(/_/g,' ')}</option>)}
        </select>
        <select className="text-sm border border-gray-200 rounded-lg px-3 py-2" value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })}>
          <option value="">All Types</option>
          {COMPLIANCE_TYPES.map((t) => <option key={t} value={t}>{t.replace(/_/g,' ')}</option>)}
        </select>
        <button onClick={() => setFilters({ status: '', type: '' })} className="text-sm text-gray-500 hover:text-gray-700 px-2">Clear</button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-primary-700 border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Worker</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Type</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Expiry Date</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Doc No.</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Document</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {records.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">No records found.</td></tr>
              ) : records.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{r.user?.name}</td>
                  <td className="px-4 py-3 text-gray-600">{r.type.replace(/_/g, ' ')}</td>
                  <td className="px-4 py-3"><ComplianceBadge status={r.status} /></td>
                  <td className="px-4 py-3 text-gray-600">{r.expiryDate ? new Date(r.expiryDate).toLocaleDateString('en-GB') : 'â€”'}</td>
                  <td className="px-4 py-3 text-gray-500">{r.documentNumber || 'â€”'}</td>
                  <td className="px-4 py-3">
                    {r.documentUrl ? (
                      <a href={r.documentUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary-700 hover:text-primary-800 font-medium">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        View
                      </a>
                    ) : <span className="text-xs text-gray-400">â€”</span>}
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => setEditRecord({ ...r, userId: r.user?.id })} className="text-xs text-primary-700 hover:underline">Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editRecord && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-semibold text-gray-900">Edit Compliance Record</h2>
                <p className="text-xs text-gray-500 mt-0.5">{editRecord.user?.name} Â· {editRecord.type?.replace(/_/g, ' ')}</p>
              </div>
              {editRecord.documentUrl && (
                <a href={editRecord.documentUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-primary-700 hover:text-primary-800 font-medium bg-primary-50 px-3 py-1.5 rounded-lg flex-shrink-0">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  View Document
                </a>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2" value={editRecord.status} onChange={(e) => setEditRecord({ ...editRecord, status: e.target.value })}>
                {['VALID','EXPIRING_SOON','EXPIRED','NOT_SUBMITTED','UNDER_REVIEW'].map((s) => <option key={s} value={s}>{s.replace(/_/g,' ')}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Issue Date</label>
                <input type="date" className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2" value={editRecord.issueDate?.split('T')[0] || ''} onChange={(e) => setEditRecord({ ...editRecord, issueDate: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                <input type="date" className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2" value={editRecord.expiryDate?.split('T')[0] || ''} onChange={(e) => setEditRecord({ ...editRecord, expiryDate: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Document Number</label>
              <input type="text" className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2" value={editRecord.documentNumber || ''} onChange={(e) => setEditRecord({ ...editRecord, documentNumber: e.target.value })} />
            </div>
            <div className="flex gap-3">
              <button onClick={handleSave} disabled={saving} className="bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-800 disabled:opacity-50">{saving ? 'Savingâ€¦' : 'Save'}</button>
              <button onClick={() => setEditRecord(null)} className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
