import React, { useEffect, useState } from 'react';
import { getMyShifts } from '../../api/shiftApi';
import { checkIn, checkOut } from '../../api/attendanceApi';
import ShiftCard from '../../components/workforce/ShiftCard';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const normalizeName = (s) => (s || '').trim().replace(/\s+/g, ' ').toLowerCase();

export default function MyShifts() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ from: '', to: '', status: '' });
  const [checking, setChecking] = useState(null);
  const [signOffShiftId, setSignOffShiftId] = useState(null);
  const [signature, setSignature] = useState('');
  const [signatureError, setSignatureError] = useState('');
  const [confirmedBy, setConfirmedBy] = useState('');
  const [confirmedByError, setConfirmedByError] = useState('');

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

  function openSignOff(shiftId) {
    setSignOffShiftId(shiftId);
    setSignature('');
    setSignatureError('');
    setConfirmedBy('');
    setConfirmedByError('');
  }

  function closeSignOff() {
    setSignOffShiftId(null);
    setSignature('');
    setSignatureError('');
    setConfirmedBy('');
    setConfirmedByError('');
  }

  async function confirmCheckOut() {
    let hasError = false;
    if (normalizeName(signature) !== normalizeName(user?.name)) {
      setSignatureError('Please type your full name exactly as it appears on your account.');
      hasError = true;
    }
    if (!confirmedBy.trim()) {
      setConfirmedByError('Please enter who confirmed this checkout.');
      hasError = true;
    }
    if (hasError) return;

    const shiftId = signOffShiftId;
    setChecking(shiftId);
    try {
      await checkOut(shiftId, signature.trim(), confirmedBy.trim());
      toast.success('Checked out!');
      closeSignOff();
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
                    <button onClick={() => openSignOff(a.shift.id)} disabled={checking === a.shift.id}
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

      <Modal isOpen={signOffShiftId !== null} onClose={closeSignOff} title="Sign to Check Out" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            To confirm you're checking out of this shift, please type your full name exactly as it appears on your account, and who at the facility confirmed your checkout.
          </p>
          <Input
            label="Full Name"
            placeholder={user?.name || 'Your full name'}
            value={signature}
            autoFocus
            onChange={(e) => { setSignature(e.target.value); setSignatureError(''); }}
            onKeyDown={(e) => { if (e.key === 'Enter') confirmCheckOut(); }}
            error={signatureError}
          />
          <Input
            label="Confirmed By"
            placeholder="e.g. Ward Manager, Supervisor name"
            value={confirmedBy}
            onChange={(e) => { setConfirmedBy(e.target.value); setConfirmedByError(''); }}
            onKeyDown={(e) => { if (e.key === 'Enter') confirmCheckOut(); }}
            error={confirmedByError}
          />
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="secondary" onClick={closeSignOff}>Cancel</Button>
            <Button variant="success" onClick={confirmCheckOut} loading={checking === signOffShiftId}>
              Sign &amp; Check Out
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
