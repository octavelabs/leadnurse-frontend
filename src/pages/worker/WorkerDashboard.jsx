import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyShifts } from '../../api/shiftApi';
import { getMyCompliance } from '../../api/complianceApi';
import { getUnreadCount } from '../../api/notificationApi';
import { useAuth } from '../../context/AuthContext';
import ComplianceBadge from '../../components/workforce/ComplianceBadge';
import ShiftCard from '../../components/workforce/ShiftCard';

export default function WorkerDashboard() {
  const { user } = useAuth();
  const [upcomingShifts, setUpcomingShifts] = useState([]);
  const [compliance, setCompliance] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    Promise.all([
      getMyShifts({ from: today }),
      getMyCompliance(),
      getUnreadCount(),
    ]).then(([shifts, comp, notif]) => {
      setUpcomingShifts(shifts.data.data.slice(0, 4));
      setCompliance(comp.data.data);
      setUnread(notif.data.data.count);
    }).finally(() => setLoading(false));
  }, []);

  const alertCompliance = compliance.filter((c) => c.status === 'EXPIRED' || c.status === 'EXPIRING_SOON');

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-primary-700 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name?.split(' ')[0]}</h1>
        <p className="text-gray-500 text-sm mt-1">Here's your workforce overview</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <Link to="/my-shifts" className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm transition-shadow">
          <p className="text-sm text-gray-500">Upcoming Shifts</p>
          <p className="text-3xl font-bold text-primary-800 mt-1">{upcomingShifts.length}</p>
        </Link>
        <Link to="/my-compliance" className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm transition-shadow">
          <p className="text-sm text-gray-500">Compliance Alerts</p>
          <p className={`text-3xl font-bold mt-1 ${alertCompliance.length > 0 ? 'text-red-600' : 'text-green-600'}`}>{alertCompliance.length}</p>
        </Link>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500">Notifications</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{unread}</p>
        </div>
      </div>

      {alertCompliance.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <h2 className="font-semibold text-red-900 text-sm mb-2">Compliance Action Required</h2>
          <div className="space-y-2">
            {alertCompliance.map((c) => (
              <div key={c.id} className="flex items-center justify-between text-sm">
                <span className="text-red-800">{c.type.replace(/_/g, ' ')}</span>
                <ComplianceBadge status={c.status} />
              </div>
            ))}
          </div>
          <Link to="/my-compliance" className="text-sm text-red-700 font-medium mt-3 block hover:underline">View all compliance →</Link>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-900">Upcoming Shifts</h2>
          <Link to="/my-shifts" className="text-sm text-primary-700 hover:underline">View all</Link>
        </div>
        {upcomingShifts.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">No upcoming shifts assigned.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {upcomingShifts.map((a) => (
              <ShiftCard key={a.id} shift={a.shift} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
