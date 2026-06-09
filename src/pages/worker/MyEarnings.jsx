import React, { useEffect, useState } from 'react';
import { getMyEarnings } from '../../api/payrollApi';

const STATUS_COLORS = {
  DRAFT: 'bg-gray-100 text-gray-600',
  SUBMITTED: 'bg-primary-100 text-blue-800',
  APPROVED: 'bg-green-100 text-green-800',
  PAID: 'bg-purple-100 text-purple-800',
};

export default function MyEarnings() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyEarnings().then((r) => setEntries(r.data.data)).finally(() => setLoading(false));
  }, []);

  const totalPaid = entries.filter((e) => e.payrollReport?.status === 'PAID').reduce((s, e) => s + e.totalPay, 0);
  const totalPending = entries.filter((e) => e.payrollReport?.status !== 'PAID').reduce((s, e) => s + e.totalPay, 0);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-primary-700 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Earnings</h1>
        <p className="text-sm text-gray-500 mt-0.5">Payroll history</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500">Total Paid</p>
          <p className="text-3xl font-bold text-green-700 mt-1">Â£{totalPaid.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500">Pending</p>
          <p className="text-3xl font-bold text-yellow-700 mt-1">Â£{totalPending.toFixed(2)}</p>
        </div>
      </div>

      {entries.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-500">No payroll records yet.</div>
      ) : (
        <div className="space-y-3">
          {entries.map((e) => (
            <div key={e.id} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900">
                    {new Date(e.payrollReport.periodStart).toLocaleDateString('en-GB')} â€“ {new Date(e.payrollReport.periodEnd).toLocaleDateString('en-GB')}
                  </p>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {e.shiftsWorked} shifts Â· {e.regularHours.toFixed(1)}h regular Â· {e.overtimeHours.toFixed(1)}h overtime
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-gray-900">Â£{e.totalPay.toFixed(2)}</p>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded mt-1 inline-block ${STATUS_COLORS[e.payrollReport.status]}`}>{e.payrollReport.status}</span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-3 gap-2 text-xs text-gray-500">
                <span>Regular: Â£{e.regularPay.toFixed(2)}</span>
                <span>Overtime: Â£{e.overtimePay.toFixed(2)}</span>
                <span>Rate: Â£{e.hourlyRate.toFixed(2)}/hr</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
