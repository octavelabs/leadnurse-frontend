import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getPublicSignoffForm, submitSignoff } from '../api/timesheetSignoffApi';

function StarRating({ value, onChange }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          className="text-2xl transition-transform hover:scale-110"
        >
          <span className={n <= (hovered || value) ? 'text-yellow-400' : 'text-gray-200'}>â˜…</span>
        </button>
      ))}
      {value > 0 && (
        <span className="self-center text-sm text-gray-500 ml-2">
          {value === 1 ? 'Poor' : value === 2 ? 'Below average' : value === 3 ? 'Average' : value === 4 ? 'Good' : 'Excellent'}
        </span>
      )}
    </div>
  );
}

export default function TimesheetSignoffPage() {
  const { token } = useParams();
  const [context, setContext] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const [form, setForm] = useState({
    confirmed: false,
    rating: 0,
    feedback: '',
    supervisorName: '',
  });

  useEffect(() => {
    getPublicSignoffForm(token)
      .then((r) => {
        setContext(r.data.data);
        setForm((prev) => ({ ...prev, supervisorName: r.data.data.supervisorName || '' }));
      })
      .catch((err) => setLoadError(err.response?.data?.message || 'This sign-off link is invalid or has expired.'))
      .finally(() => setLoading(false));
  }, [token]);

  const setField = (f, v) => setForm((prev) => ({ ...prev, [f]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.confirmed) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      await submitSignoff(token, form);
      setSubmitted(true);
    } catch (err) {
      setSubmitError(err.response?.data?.message || 'Failed to submit. Please try again.');
    } finally { setSubmitting(false); }
  };

  const fmt = (d) => d ? new Date(d).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'â€”';
  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }) : 'â€”';

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-primary-700 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (loadError) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl border border-gray-200 p-8 max-w-md w-full text-center">
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </div>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Link Unavailable</h2>
        <p className="text-gray-500 text-sm">{loadError}</p>
      </div>
    </div>
  );

  if (submitted) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl border border-gray-200 p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Timesheet Confirmed!</h2>
        <p className="text-gray-500 text-sm">You have successfully signed off <strong>{context?.workerName}</strong>'s timesheet for the shift on {fmtDate(context?.shiftDate)}.</p>
        <p className="text-xs text-gray-400 mt-4">You may now close this window.</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-6">
          <div className="inline-flex items-center mb-4">
            <img src="https://leadnurse.co.uk/wp-content/uploads/2026/02/Lead-Nurse-Logo-e1771949504571-1024x377.png" alt="Lead Nurse" className="h-8 w-auto object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Timesheet Sign-off</h1>
          <p className="text-gray-500 text-sm mt-1">Please confirm the attendance details below</p>
        </div>

        {/* Shift details */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-5">
          <h2 className="font-semibold text-gray-900 mb-3">Shift Details</h2>
          <div className="space-y-2.5 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Worker</span>
              <span className="font-medium text-gray-900">{context?.workerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Shift</span>
              <span className="font-medium text-gray-900">{context?.shiftTitle || 'â€”'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Facility</span>
              <span className="font-medium text-gray-900">{context?.facilityName}{context?.facilityCity ? `, ${context.facilityCity}` : ''}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Date</span>
              <span className="font-medium text-gray-900">{fmtDate(context?.shiftDate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Check-in</span>
              <span className="font-medium text-gray-900">{fmt(context?.checkInTime)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Check-out</span>
              <span className="font-medium text-gray-900">{fmt(context?.checkOutTime)}</span>
            </div>
            {context?.hoursWorked && (
              <div className="flex justify-between pt-2 border-t border-gray-100">
                <span className="text-gray-500">Total Hours</span>
                <span className="font-bold text-primary-800 text-base">{context.hoursWorked.toFixed(1)}h</span>
              </div>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Supervisor name */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
            <input
              value={form.supervisorName}
              onChange={(e) => setField('supervisorName', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-700"
              placeholder="Your full name"
            />
          </div>

          {/* Performance rating */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-medium text-gray-900 mb-1">Performance Rating <span className="text-gray-400 text-xs font-normal">(optional)</span></h3>
            <p className="text-xs text-gray-400 mb-3">How would you rate this worker's performance during this shift?</p>
            <StarRating value={form.rating} onChange={(v) => setField('rating', v)} />
          </div>

          {/* Feedback */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <label className="block text-sm font-medium text-gray-700 mb-1">Feedback <span className="text-gray-400 text-xs font-normal">(optional)</span></label>
            <textarea
              rows={3}
              value={form.feedback}
              onChange={(e) => setField('feedback', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-700"
              placeholder="Any comments on the worker's performance, punctuality, or conductâ€¦"
            />
          </div>

          {/* Confirmation */}
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-5">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.confirmed}
                onChange={(e) => setField('confirmed', e.target.checked)}
                className="mt-0.5 w-4 h-4 accent-primary-700 flex-shrink-0"
              />
              <span className="text-sm text-gray-700 leading-relaxed">
                I confirm that <strong>{context?.workerName}</strong> attended and completed this shift as described above. I am authorised to sign off this timesheet.
              </span>
            </label>
          </div>

          {submitError && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">{submitError}</div>
          )}

          <button
            type="submit"
            disabled={!form.confirmed || submitting}
            className="w-full bg-primary-700 text-white py-3 rounded-xl text-sm font-semibold hover:bg-primary-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            {submitting ? 'Submittingâ€¦' : 'Confirm & Sign Off Timesheet'}
          </button>
          <p className="text-xs text-gray-400 text-center pb-6">Once confirmed, this cannot be undone. Contact the employer if there is an error.</p>
        </form>
      </div>
    </div>
  );
}
