import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getMyDocuments, signDocument, declineDocument } from '../../api/documentApi';
import toast from 'react-hot-toast';

const STATUS_STYLES = {
  PENDING:  'bg-yellow-100 text-yellow-700',
  SIGNED:   'bg-green-100 text-green-700',
  DECLINED: 'bg-gray-100 text-gray-500',
};

function SignModal({ sig, onClose, onSigned }) {
  const { user } = useAuth();
  const [typed, setTyped] = useState('');
  const [saving, setSaving] = useState(false);
  const confirmed = typed.trim().toLowerCase() === user?.name?.trim().toLowerCase();

  const handleSign = async () => {
    if (!confirmed) return;
    setSaving(true);
    try {
      const res = await signDocument(sig.id, typed.trim());
      onSigned(res.data.data);
      toast.success('Document signed successfully');
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to sign');
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Sign Document</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="bg-primary-50 border border-primary-100 rounded-lg p-3">
            <p className="text-sm font-medium text-blue-900">{sig.document?.title}</p>
            {sig.document?.description && <p className="text-xs text-primary-800 mt-0.5">{sig.document.description}</p>}
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-600 leading-relaxed">
            By signing, you confirm that you have read and agree to the contents of this document. This constitutes your electronic signature.
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type your full name to sign: <span className="text-primary-700 font-semibold">{user?.name}</span>
            </label>
            <input
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-700"
              placeholder="Type your name exactly as shown above"
            />
            {typed && !confirmed && (
              <p className="text-xs text-red-500 mt-1">Name does not match "” type exactly: {user?.name}</p>
            )}
          </div>
          <div className="flex gap-3">
            <button onClick={handleSign} disabled={!confirmed || saving} className="flex-1 bg-primary-700 text-white py-2 rounded-lg text-sm font-semibold hover:bg-primary-800 disabled:opacity-50 flex items-center justify-center gap-2">
              {saving && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              {saving ? 'Signing…' : 'Sign Document'}
            </button>
            <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MyDocuments() {
  const [signatures, setSignatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [signingSig, setSigningSig] = useState(null);
  const [declining, setDeclining] = useState(null);

  useEffect(() => {
    getMyDocuments().then((r) => setSignatures(r.data.data)).finally(() => setLoading(false));
  }, []);

  const handleDecline = async (sigId) => {
    if (!window.confirm('Are you sure you want to decline this document?')) return;
    setDeclining(sigId);
    try {
      const res = await declineDocument(sigId);
      setSignatures((prev) => prev.map((s) => s.id === sigId ? { ...s, status: 'DECLINED' } : s));
      toast.success('Document declined');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to decline');
    } finally { setDeclining(null); }
  };

  const handleSigned = (updated) => {
    setSignatures((prev) => prev.map((s) => s.id === updated.id ? { ...s, ...updated } : s));
  };

  const pending = signatures.filter((s) => s.status === 'PENDING');
  const done = signatures.filter((s) => s.status !== 'PENDING');

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-primary-700 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Documents</h1>
        <p className="text-sm text-gray-500 mt-0.5">{pending.length} pending signature{pending.length !== 1 ? 's' : ''}</p>
      </div>

      {pending.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <p className="font-semibold text-yellow-900 text-sm">Action required: {pending.length} document{pending.length !== 1 ? 's' : ''} awaiting your signature</p>
        </div>
      )}

      {signatures.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-500">No documents assigned to you yet.</div>
      ) : (
        <div className="space-y-3">
          {signatures.map((sig) => (
            <div key={sig.id} className="bg-white rounded-xl border border-gray-200 p-5 flex items-start gap-4">
              <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-medium text-gray-900">{sig.document?.title}</p>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded ${STATUS_STYLES[sig.status]}`}>{sig.status}</span>
                </div>
                {sig.document?.description && <p className="text-xs text-gray-500 mt-0.5">{sig.document.description}</p>}
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="text-xs text-gray-400">Assigned {new Date(sig.assignedAt).toLocaleDateString('en-GB')}</span>
                  {sig.signedAt && <span className="text-xs text-green-600">Signed {new Date(sig.signedAt).toLocaleDateString('en-GB')}</span>}
                  <a href={sig.document?.documentUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary-700 hover:underline">View Document</a>
                </div>
              </div>
              {sig.status === 'PENDING' && (
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => setSigningSig(sig)} className="text-xs bg-primary-700 text-white hover:bg-primary-800 px-3 py-1.5 rounded-lg font-medium">Sign</button>
                  <button onClick={() => handleDecline(sig.id)} disabled={declining === sig.id} className="text-xs text-gray-400 hover:text-red-500 disabled:opacity-50">Decline</button>
                </div>
              )}
              {sig.status === 'SIGNED' && (
                <div className="flex items-center gap-1 text-green-600 flex-shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <span className="text-xs font-medium">Signed</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {signingSig && <SignModal sig={signingSig} onClose={() => setSigningSig(null)} onSigned={handleSigned} />}
    </div>
  );
}
