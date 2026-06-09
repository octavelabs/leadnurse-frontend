import React, { useEffect, useState } from 'react';
import api from '../../../api/axios';
import { reviewApplication } from '../../../api/shiftApi';
import toast from 'react-hot-toast';

export default function ShiftApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState(null);

  async function load() {
    setLoading(true);
    try {
      const res = await api.get('/shifts', { params: { limit: 100 } });
      const allShifts = res.data.data.shifts;
      const pending = [];
      for (const shift of allShifts) {
        for (const assignment of shift.assignments || []) {
          if (assignment.status === 'PENDING') {
            pending.push({ ...assignment, shift });
          }
        }
      }
      setApplications(pending);
    } catch {
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleReview(assignmentId, action) {
    setReviewing(assignmentId + action);
    try {
      await reviewApplication(assignmentId, action);
      toast.success(action === 'confirm' ? 'Application confirmed' : 'Application declined');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    } finally {
      setReviewing(null);
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Shift Applications</h1>
        <p className="text-sm text-gray-500 mt-0.5">{applications.length} pending application{applications.length !== 1 ? 's' : ''}</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-primary-700 border-t-transparent rounded-full animate-spin" /></div>
      ) : applications.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-500">No pending applications.</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Worker</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Shift</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Applied</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {applications.map((a) => (
                <tr key={a.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{a.user?.name}</p>
                    <p className="text-xs text-gray-500">{a.user?.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{a.shift?.title}</p>
                    <p className="text-xs text-gray-500">{a.shift?.facility?.name}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {new Date(a.shift?.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {new Date(a.assignedAt).toLocaleDateString('en-GB')}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => handleReview(a.id, 'confirm')}
                        disabled={!!reviewing}
                        className="text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 disabled:opacity-50"
                      >
                        {reviewing === a.id + 'confirm' ? 'â€¦' : 'Confirm'}
                      </button>
                      <button
                        onClick={() => handleReview(a.id, 'decline')}
                        disabled={!!reviewing}
                        className="text-xs bg-red-50 text-red-600 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-100 disabled:opacity-50"
                      >
                        {reviewing === a.id + 'decline' ? 'â€¦' : 'Decline'}
                      </button>
                    </div>
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
