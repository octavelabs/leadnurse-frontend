import React, { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { getAllDocuments, uploadDocument, assignDocument, deleteDocument } from '../../../api/documentApi';
import { getWorkers } from '../../../api/workerApi';

const SIG_STYLES = {
  PENDING:  'bg-yellow-100 text-yellow-700',
  SIGNED:   'bg-green-100 text-green-700',
  DECLINED: 'bg-red-100 text-red-700',
};

function UploadModal({ onClose, onUploaded }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !file) return;
    setSaving(true);
    try {
      const form = new FormData();
      form.append('title', title.trim());
      form.append('description', description.trim());
      form.append('document', file);
      const res = await uploadDocument(form);
      onUploaded(res.data.data);
      toast.success('Document uploaded');
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Upload Document for Signing</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Document Title <span className="text-red-500">*</span></label>
            <input required value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. Employment Contract — June 2026" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description <span className="text-gray-400 font-normal">(optional)</span></label>
            <textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Brief description of what this document is…" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">File <span className="text-red-500">*</span></label>
            <div onClick={() => fileRef.current?.click()} className="border-2 border-dashed border-gray-200 rounded-lg p-5 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
              <input ref={fileRef} type="file" accept="application/pdf,image/*" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
              {file ? (
                <p className="text-sm text-gray-700 font-medium">{file.name}</p>
              ) : (
                <>
                  <svg className="w-8 h-8 text-gray-300 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                  <p className="text-sm text-gray-500">PDF or Image · Max 10MB</p>
                </>
              )}
            </div>
          </div>
          <div className="flex gap-3 pt-1">
            <button type="submit" disabled={saving || !title.trim() || !file} className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2">
              {saving && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              {saving ? 'Uploading…' : 'Upload Document'}
            </button>
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AssignModal({ doc, onClose, onAssigned }) {
  const [workers, setWorkers] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getWorkers({ limit: 200 }).then((r) => {
      setWorkers(r.data.data.workers);
      const already = new Set(doc.signatures.map((s) => s.userId));
      setSelected(already);
    }).finally(() => setLoading(false));
  }, [doc]);

  const toggle = (id) => setSelected((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const handleSave = async () => {
    setSaving(true);
    try {
      const newIds = [...selected].filter((id) => !doc.signatures.some((s) => s.userId === id));
      if (newIds.length > 0) {
        await assignDocument(doc.id, newIds);
        onAssigned();
        toast.success(`Assigned to ${newIds.length} employee(s)`);
      } else {
        toast('No new assignments added');
      }
      onClose();
    } catch (err) {
      toast.error('Failed to assign');
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="font-semibold text-gray-900">Assign to Employees</h2>
            <p className="text-xs text-gray-500 mt-0.5">{doc.title}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
        </div>
        {loading ? (
          <div className="flex justify-center py-8"><div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>
        ) : (
          <div className="flex-1 overflow-y-auto px-6 py-3 space-y-1">
            {workers.map((w) => {
              const alreadySigned = doc.signatures.find((s) => s.userId === w.id && s.status === 'SIGNED');
              return (
                <label key={w.id} className={`flex items-center gap-3 py-2 cursor-pointer ${alreadySigned ? 'opacity-50' : ''}`}>
                  <input type="checkbox" checked={selected.has(w.id)} onChange={() => !alreadySigned && toggle(w.id)} disabled={!!alreadySigned} className="accent-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{w.name}</p>
                    <p className="text-xs text-gray-400">{w.email}</p>
                  </div>
                  {alreadySigned && <span className="ml-auto text-xs text-green-600 font-medium">Already signed</span>}
                </label>
              );
            })}
          </div>
        )}
        <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
          <button onClick={handleSave} disabled={saving} className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">{saving ? 'Assigning…' : 'Assign Selected'}</button>
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg">Cancel</button>
        </div>
      </div>
    </div>
  );
}

export default function DocumentManagement() {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [assignDoc, setAssignDoc] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const load = () => {
    setLoading(true);
    getAllDocuments().then((r) => setDocs(r.data.data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this document? All signatures will also be removed.')) return;
    setDeleting(id);
    try {
      await deleteDocument(id);
      setDocs((prev) => prev.filter((d) => d.id !== id));
      toast.success('Document deleted');
    } catch { toast.error('Failed to delete'); } finally { setDeleting(null); }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documents for Signing</h1>
          <p className="text-sm text-gray-500 mt-0.5">Upload contracts and policy documents for employees to sign</p>
        </div>
        <button onClick={() => setShowUpload(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
          Upload Document
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>
      ) : docs.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-500">No documents uploaded yet.</div>
      ) : (
        <div className="space-y-4">
          {docs.map((doc) => {
            const signed = doc.signatures.filter((s) => s.status === 'SIGNED').length;
            const total = doc.signatures.length;
            return (
              <div key={doc.id} className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                      <div>
                        <h3 className="font-semibold text-gray-900">{doc.title}</h3>
                        {doc.description && <p className="text-xs text-gray-500 mt-0.5">{doc.description}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-3">
                      <span className="text-xs text-gray-500">{signed}/{total} signed</span>
                      <a href={doc.documentUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">View Document</a>
                      <span className="text-xs text-gray-400">Uploaded {new Date(doc.createdAt).toLocaleDateString('en-GB')}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={() => setAssignDoc(doc)} className="text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 px-3 py-1.5 rounded-lg font-medium">Assign</button>
                    <button onClick={() => handleDelete(doc.id)} disabled={deleting === doc.id} className="text-xs text-red-400 hover:text-red-600 disabled:opacity-50">Delete</button>
                  </div>
                </div>
                {doc.signatures.length > 0 && (
                  <div className="mt-4 border-t border-gray-100 pt-3">
                    <p className="text-xs font-medium text-gray-500 mb-2">Assignees</p>
                    <div className="flex flex-wrap gap-2">
                      {doc.signatures.map((sig) => (
                        <div key={sig.id} className="flex items-center gap-1.5 bg-gray-50 border border-gray-100 rounded-lg px-2.5 py-1">
                          <span className="text-xs text-gray-700">{sig.user?.name}</span>
                          <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${SIG_STYLES[sig.status]}`}>{sig.status}</span>
                          {sig.signedAt && <span className="text-xs text-gray-400">{new Date(sig.signedAt).toLocaleDateString('en-GB')}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showUpload && <UploadModal onClose={() => setShowUpload(false)} onUploaded={(doc) => { setDocs((prev) => [doc, ...prev]); }} />}
      {assignDoc && <AssignModal doc={assignDoc} onClose={() => setAssignDoc(null)} onAssigned={load} />}
    </div>
  );
}
