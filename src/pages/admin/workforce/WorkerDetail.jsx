import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getWorker } from '../../../api/workerApi';
import { getWorkerReferences, addReference, sendReferenceRequest, deleteReference, getReferenceResponse } from '../../../api/referenceApi';
import { toggleUserActive } from '../../../api/authApi';
import ComplianceBadge from '../../../components/workforce/ComplianceBadge';

// ”€”€”€ Helpers ”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€

function InfoRow({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex justify-between py-2.5 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm text-gray-900 font-medium text-right max-w-xs">{value}</span>
    </div>
  );
}

const REF_STATUS_STYLES = {
  PENDING:   'bg-gray-100 text-gray-600',
  SENT:      'bg-yellow-100 text-yellow-700',
  COMPLETED: 'bg-green-100 text-green-700',
  DECLINED:  'bg-red-100 text-red-700',
  EXPIRED:   'bg-orange-100 text-orange-700',
};
function RefStatusBadge({ status }) {
  return <span className={`text-xs font-medium px-2 py-0.5 rounded ${REF_STATUS_STYLES[status] || 'bg-gray-100 text-gray-600'}`}>{status?.replace(/_/g, ' ')}</span>;
}

const RELATIONSHIP_OPTIONS = [
  { value: 'LINE_MANAGER', label: 'Line Manager' },
  { value: 'SUPERVISOR',   label: 'Supervisor' },
  { value: 'COLLEAGUE',    label: 'Colleague' },
  { value: 'HR_CONTACT',   label: 'HR Contact' },
  { value: 'OTHER',        label: 'Other' },
];

const RATING_LABELS = {
  reliability: 'Reliability',
  timekeeping: 'Timekeeping',
  teamwork: 'Teamwork',
  communication: 'Communication',
  overallPerformance: 'Overall Performance',
};

function RatingBar({ label, value }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-600 w-40 flex-shrink-0">{label}</span>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <div key={n} className={`w-7 h-7 rounded text-xs font-semibold flex items-center justify-center ${n <= value ? 'bg-primary-700 text-white' : 'bg-gray-100 text-gray-400'}`}>{n}</div>
        ))}
      </div>
      <span className="text-xs text-gray-400">{value}/5</span>
    </div>
  );
}

// ”€”€”€ Add Reference Modal ”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€

function AddReferenceModal({ workerId, onClose, onAdded }) {
  const [form, setForm] = useState({ refereeName: '', refereeEmail: '', refereeJobTitle: '', refereeOrganisation: '', relationship: 'LINE_MANAGER', employmentStart: '', employmentEnd: '' });
  const [saving, setSaving] = useState(false);
  const setField = (f, v) => setForm((p) => ({ ...p, [f]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await addReference({ ...form, workerId });
      onAdded(res.data.data);
      toast.success('Reference added');
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add reference');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white">
          <h2 className="font-semibold text-gray-900">Add Reference Request</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Referee Full Name <span className="text-red-500">*</span></label>
              <input required value={form.refereeName} onChange={(e) => setField('refereeName', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-700" placeholder="e.g. Jane Smith" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Referee Email <span className="text-red-500">*</span></label>
              <input required type="email" value={form.refereeEmail} onChange={(e) => setField('refereeEmail', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-700" placeholder="jane@example.com" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Referee Job Title</label>
                <input value={form.refereeJobTitle} onChange={(e) => setField('refereeJobTitle', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-700" placeholder="e.g. Ward Manager" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Organisation</label>
                <input value={form.refereeOrganisation} onChange={(e) => setField('refereeOrganisation', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-700" placeholder="e.g. NHS Trust" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Relationship to Applicant</label>
              <select value={form.relationship} onChange={(e) => setField('relationship', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-700">
                {RELATIONSHIP_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Employment Start</label>
                <input type="date" value={form.employmentStart} onChange={(e) => setField('employmentStart', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-700" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Employment End</label>
                <input type="date" value={form.employmentEnd} onChange={(e) => setField('employmentEnd', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-700" />
              </div>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="flex-1 bg-primary-700 text-white py-2 rounded-lg text-sm font-medium hover:bg-primary-800 disabled:opacity-50 flex items-center justify-center gap-2">
              {saving && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              {saving ? 'Adding…' : 'Add Reference'}
            </button>
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ”€”€”€ View Response Modal ”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€

function ViewResponseModal({ referenceId, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getReferenceResponse(referenceId).then((r) => setData(r.data.data)).finally(() => setLoading(false));
  }, [referenceId]);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white">
          <div>
            <h2 className="font-semibold text-gray-900">Reference Response</h2>
            {data && <p className="text-xs text-gray-500 mt-0.5">From {data.refereeName} · {data.refereeOrganisation || data.refereeEmail}</p>}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-primary-700 border-t-transparent rounded-full animate-spin" /></div>
        ) : !data?.response ? (
          <div className="p-6 text-center text-gray-500 text-sm">No response data found.</div>
        ) : (
          <div className="p-6 space-y-5">
            {data.response.jobTitleDuringTenure && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Job title during tenure</p>
                <p className="text-sm font-medium text-gray-900">{data.response.jobTitleDuringTenure}</p>
              </div>
            )}
            <div>
              <p className="text-xs text-gray-500 mb-3">Performance Ratings</p>
              <div className="space-y-2">
                {Object.entries(RATING_LABELS).map(([key, label]) => (
                  <RatingBar key={key} label={label} value={data.response[key]} />
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3 py-2 border-t border-gray-100">
              <span className="text-sm text-gray-600">Would re-employ</span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded ${data.response.wouldRehire ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {data.response.wouldRehire ? 'Yes' : 'No'}
              </span>
            </div>
            {data.response.reasonForLeaving && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Reason for leaving</p>
                <p className="text-sm text-gray-700 leading-relaxed">{data.response.reasonForLeaving}</p>
              </div>
            )}
            {data.response.additionalComments && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Additional comments</p>
                <p className="text-sm text-gray-700 leading-relaxed">{data.response.additionalComments}</p>
              </div>
            )}
            <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-500 border-t border-gray-100">
              Submitted {new Date(data.response.submittedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })} · Declaration signed
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ”€”€”€ References Section ”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€

function ReferencesSection({ workerId }) {
  const [references, setReferences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [viewId, setViewId] = useState(null);
  const [sending, setSending] = useState(null);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    getWorkerReferences(workerId).then((r) => setReferences(r.data.data)).finally(() => setLoading(false));
  }, [workerId]);

  const handleAdded = (ref) => setReferences((prev) => [ref, ...prev]);

  const handleSend = async (id) => {
    setSending(id);
    try {
      const res = await sendReferenceRequest(id);
      setReferences((prev) => prev.map((r) => r.id === id ? res.data.data : r));
      toast.success('Reference request sent "” link generated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send request');
    } finally {
      setSending(null);
    }
  };

  const handleDelete = async (id) => {
    setDeleting(id);
    try {
      await deleteReference(id);
      setReferences((prev) => prev.filter((r) => r.id !== id));
      toast.success('Reference removed');
    } catch (err) {
      toast.error('Failed to remove reference');
    } finally {
      setDeleting(null);
    }
  };

  const copyLink = (token) => {
    const url = `${window.location.origin}/references/${token}`;
    navigator.clipboard.writeText(url).then(() => toast.success('Link copied to clipboard'));
  };

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-semibold text-gray-900">References</h2>
            <p className="text-xs text-gray-400 mt-0.5">{references.length} referee{references.length !== 1 ? 's' : ''}</p>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-700 text-white text-xs font-medium rounded-lg hover:bg-primary-800 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Add Reference
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-6"><div className="w-6 h-6 border-3 border-primary-700 border-t-transparent rounded-full animate-spin" /></div>
        ) : references.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-gray-400">No references added yet.</p>
            <p className="text-xs text-gray-300 mt-1">Add referee details to request employment references.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {references.map((ref) => (
              <div key={ref.id} className="border border-gray-100 rounded-lg p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium text-gray-900">{ref.refereeName}</p>
                      <RefStatusBadge status={ref.status} />
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{ref.refereeEmail}</p>
                    {(ref.refereeJobTitle || ref.refereeOrganisation) && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        {[ref.refereeJobTitle, ref.refereeOrganisation].filter(Boolean).join(' · ')}
                      </p>
                    )}
                    {ref.requestedAt && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        Sent {new Date(ref.requestedAt).toLocaleDateString('en-GB')}
                        {ref.completedAt && ` · Completed ${new Date(ref.completedAt).toLocaleDateString('en-GB')}`}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {ref.status === 'COMPLETED' && (
                      <button onClick={() => setViewId(ref.id)} className="text-xs text-primary-700 hover:underline font-medium">View Response</button>
                    )}
                    {(ref.status === 'SENT' && ref.token) && (
                      <button onClick={() => copyLink(ref.token)} className="text-xs text-gray-500 hover:text-primary-700 font-medium">Copy Link</button>
                    )}
                    {(ref.status === 'PENDING' || ref.status === 'SENT' || ref.status === 'EXPIRED') && (
                      <button
                        onClick={() => handleSend(ref.id)}
                        disabled={sending === ref.id}
                        className="text-xs bg-primary-50 text-primary-800 hover:bg-primary-100 px-2 py-1 rounded font-medium disabled:opacity-50"
                      >
                        {sending === ref.id ? '…' : ref.status === 'PENDING' ? 'Send Request' : 'Resend'}
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(ref.id)}
                      disabled={deleting === ref.id}
                      className="text-xs text-red-400 hover:text-red-600 disabled:opacity-50"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAdd && <AddReferenceModal workerId={workerId} onClose={() => setShowAdd(false)} onAdded={handleAdded} />}
      {viewId && <ViewResponseModal referenceId={viewId} onClose={() => setViewId(null)} />}
    </>
  );
}

// ”€”€”€ Main WorkerDetail page ”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€

export default function WorkerDetail() {
  const { id } = useParams();
  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [togglingActive, setTogglingActive] = useState(false);

  useEffect(() => {
    getWorker(id)
      .then((r) => setWorker(r.data.data))
      .catch(() => setError('Worker not found'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-primary-700 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (error) return <div className="p-6 text-center text-gray-500">{error}</div>;

  const initials = worker.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  const worstCompliance = (() => {
    if (!worker.compliance?.length) return null;
    if (worker.compliance.some((c) => c.status === 'EXPIRED')) return 'EXPIRED';
    if (worker.compliance.some((c) => c.status === 'EXPIRING_SOON')) return 'EXPIRING_SOON';
    if (worker.compliance.some((c) => c.status === 'NOT_SUBMITTED')) return 'NOT_SUBMITTED';
    return 'VALID';
  })();

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link to="/admin/workforce/workers" className="hover:text-primary-700">Worker Records</Link>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        <span className="text-gray-900">{worker.name}</span>
      </div>

      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 flex items-start gap-5">
        <div className="flex-shrink-0">
          {worker.avatarUrl ? (
            <img src={worker.avatarUrl} alt={worker.name} className="w-16 h-16 rounded-full object-cover" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-primary-700 flex items-center justify-center text-white text-xl font-bold">{initials}</div>
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl font-bold text-gray-900">{worker.name}</h1>
            {worstCompliance && <ComplianceBadge status={worstCompliance} />}
          </div>
          <p className="text-gray-500 text-sm mt-0.5">{worker.email}</p>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {worker.workerRoles?.map((wr) => (
              <span key={wr.id} className="text-xs bg-primary-50 text-primary-800 border border-primary-100 px-2 py-0.5 rounded-full">{wr.role.name}</span>
            ))}
            {worker.workerRoles?.length === 0 && <span className="text-xs text-gray-400">No roles assigned</span>}
          </div>
        </div>
        <div className="text-right space-y-2">
          <p className="text-xs text-gray-400">Joined {new Date(worker.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
          <button
            onClick={async () => {
              if (!window.confirm(`${worker.isActive ? 'Deactivate' : 'Reactivate'} ${worker.name}'s account?`)) return;
              setTogglingActive(true);
              try {
                const res = await toggleUserActive(worker.id);
                setWorker((prev) => ({ ...prev, isActive: res.data.data.isActive }));
                toast.success(res.data.message);
              } catch (err) {
                toast.error(err.response?.data?.message || 'Failed to update account status');
              } finally { setTogglingActive(false); }
            }}
            disabled={togglingActive}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg border disabled:opacity-50 transition-colors ${worker.isActive ? 'border-red-200 text-red-600 hover:bg-red-50' : 'border-green-200 text-green-700 hover:bg-green-50'}`}
          >
            {togglingActive ? '…' : worker.isActive ? 'Deactivate account' : 'Reactivate account'}
          </button>
          {!worker.isActive && <p className="text-xs text-red-500 font-medium">Account deactivated</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contact & Location */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-3">Contact & Location</h2>
          <div>
            <InfoRow label="Phone" value={worker.phone} />
            <InfoRow label="Address" value={worker.address} />
            <InfoRow label="City / Town" value={worker.city} />
            <InfoRow label="Postcode" value={worker.postcode} />
            {!worker.phone && !worker.address && !worker.city && (
              <p className="text-sm text-gray-400 py-2">No contact details added yet.</p>
            )}
          </div>
          {worker.bio && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-500 mb-1">About</p>
              <p className="text-sm text-gray-700 leading-relaxed">{worker.bio}</p>
            </div>
          )}
        </div>

        {/* Compliance */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-3">Compliance</h2>
          {worker.compliance?.length === 0 ? (
            <p className="text-sm text-gray-400">No compliance records on file.</p>
          ) : (
            <div className="space-y-2">
              {worker.compliance?.map((c) => (
                <div key={c.id} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                  <span className="text-sm text-gray-700">{c.type.replace(/_/g, ' ')}</span>
                  <div className="flex items-center gap-2">
                    {c.expiryDate && <span className="text-xs text-gray-400">{new Date(c.expiryDate).toLocaleDateString('en-GB')}</span>}
                    {c.documentUrl && (
                      <a href={c.documentUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-0.5 text-xs text-primary-700 hover:text-primary-800" title="View document">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Doc
                      </a>
                    )}
                    <ComplianceBadge status={c.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* References */}
      <ReferencesSection workerId={id} />

      {/* Recent Shift Assignments */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="font-semibold text-gray-900 mb-4">Recent Shift Assignments</h2>
        {worker.shiftAssignments?.length === 0 ? (
          <p className="text-sm text-gray-400">No shift history.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-100">
                <tr>
                  <th className="text-left py-2 pr-4 font-medium text-gray-500">Shift</th>
                  <th className="text-left py-2 pr-4 font-medium text-gray-500">Facility</th>
                  <th className="text-left py-2 pr-4 font-medium text-gray-500">Date</th>
                  <th className="text-left py-2 font-medium text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {worker.shiftAssignments?.map((a) => (
                  <tr key={a.id}>
                    <td className="py-2.5 pr-4 font-medium text-gray-900">{a.shift?.title}</td>
                    <td className="py-2.5 pr-4 text-gray-500">{a.shift?.facility?.name}</td>
                    <td className="py-2.5 pr-4 text-gray-500">{new Date(a.shift?.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                    <td className="py-2.5">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                        a.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                        a.status === 'PENDING'   ? 'bg-yellow-100 text-yellow-800' :
                        a.status === 'COMPLETED' ? 'bg-primary-100 text-blue-800' :
                        'bg-gray-100 text-gray-600'
                      }`}>{a.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
