import React, { useEffect, useState } from 'react';
import { getPayrollReports, createPayrollReport, updatePayrollStatus } from '../../../api/payrollApi';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  DRAFT: 'bg-gray-100 text-gray-600',
  SUBMITTED: 'bg-primary-100 text-blue-800',
  APPROVED: 'bg-green-100 text-green-800',
  PAID: 'bg-purple-100 text-purple-800',
};

export default function PayrollReports() {
  const [reports, setReports] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ periodStart: '', periodEnd: '', notes: '' });
  const [selected, setSelected] = useState(null);
  const [page, setPage] = useState(1);
  const LIMIT = 10;

  async function load() {
    setLoading(true);
    try {
      const res = await getPayrollReports({ page, limit: LIMIT });
      setReports(res.data.data.reports);
      setTotal(res.data.data.total);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [page]);

  async function handleGenerate() {
    if (!form.periodStart || !form.periodEnd) return toast.error('Select period dates');
    setGenerating(true);
    try {
      await createPayrollReport(form);
      toast.success('Payroll report generated');
      setShowForm(false);
      setForm({ periodStart: '', periodEnd: '', notes: '' });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate');
    } finally {
      setGenerating(false);
    }
  }

  async function handleStatus(id, status) {
    try {
      await updatePayrollStatus(id, status);
      toast.success('Status updated');
      load();
    } catch {
      toast.error('Failed to update');
    }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payroll Reports</h1>
          <p className="text-sm text-gray-500 mt-0.5">{total} reports</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-800 transition-colors">
          Generate Report
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <h2 className="font-semibold text-gray-900">Generate New Payroll Report</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Period Start</label>
              <input type="date" className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2" value={form.periodStart} onChange={(e) => setForm({ ...form, periodStart: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Period End</label>
              <input type="date" className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2" value={form.periodEnd} onChange={(e) => setForm({ ...form, periodEnd: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
            <textarea rows={2} className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 resize-none" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
          <div className="flex gap-3">
            <button onClick={handleGenerate} disabled={generating} className="bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-800 disabled:opacity-50">
              {generating ? 'Generating…' : 'Generate'}
            </button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-primary-700 border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="space-y-3">
          {reports.length === 0 ? <p className="text-center text-gray-500 py-8">No payroll reports yet.</p> : reports.map((r) => (
            <div key={r.id} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900">
                    {new Date(r.periodStart).toLocaleDateString('en-GB')} "“ {new Date(r.periodEnd).toLocaleDateString('en-GB')}
                  </p>
                  <p className="text-sm text-gray-500 mt-0.5">{r.entries?.length || 0} workers · £{r.totalAmount.toFixed(2)} total · Generated by {r.generatedBy?.name}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded ${STATUS_COLORS[r.status]}`}>{r.status}</span>
                  {r.status === 'DRAFT' && <button onClick={() => handleStatus(r.id, 'SUBMITTED')} className="text-xs text-primary-700 hover:underline">Submit</button>}
                  {r.status === 'SUBMITTED' && <button onClick={() => handleStatus(r.id, 'APPROVED')} className="text-xs text-green-600 hover:underline">Approve</button>}
                  {r.status === 'APPROVED' && <button onClick={() => handleStatus(r.id, 'PAID')} className="text-xs text-purple-600 hover:underline">Mark Paid</button>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {total > LIMIT && (
        <div className="flex justify-center gap-2">
          <button disabled={page === 1} onClick={() => setPage(page - 1)} className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-40">Previous</button>
          <span className="px-3 py-1.5 text-sm text-gray-600">Page {page}</span>
          <button disabled={page >= Math.ceil(total / LIMIT)} onClick={() => setPage(page + 1)} className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-40">Next</button>
        </div>
      )}
    </div>
  );
}
