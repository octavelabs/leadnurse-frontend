import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getMyCertificates } from '../../api/certificateApi';
import { getMyUploadedCertificates, uploadCertificate, deleteUploadedCertificate } from '../../api/uploadedCertificateApi';
import { generateCertificatePDF } from '../../utils/certificateGenerator';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';

// ─── Certificate type definitions ─────────────────────────────────────────────

const CARE_STANDARDS = [
  { key: 'CARE_CERT_STD_1',  num: 1,  label: 'Understand your role' },
  { key: 'CARE_CERT_STD_2',  num: 2,  label: 'Your personal development' },
  { key: 'CARE_CERT_STD_3',  num: 3,  label: 'Duty of care' },
  { key: 'CARE_CERT_STD_4',  num: 4,  label: 'Equality and diversity' },
  { key: 'CARE_CERT_STD_5',  num: 5,  label: 'Work in a person-centred way' },
  { key: 'CARE_CERT_STD_6',  num: 6,  label: 'Communication' },
  { key: 'CARE_CERT_STD_7',  num: 7,  label: 'Privacy and dignity' },
  { key: 'CARE_CERT_STD_8',  num: 8,  label: 'Fluids and nutrition' },
  { key: 'CARE_CERT_STD_9',  num: 9,  label: 'Awareness of mental health, dementia and learning disability' },
  { key: 'CARE_CERT_STD_10', num: 10, label: 'Safeguarding adults' },
  { key: 'CARE_CERT_STD_11', num: 11, label: 'Safeguarding children' },
  { key: 'CARE_CERT_STD_12', num: 12, label: 'Basic life support' },
  { key: 'CARE_CERT_STD_13', num: 13, label: 'Health and safety' },
  { key: 'CARE_CERT_STD_14', num: 14, label: 'GDPR / Handling information' },
  { key: 'CARE_CERT_STD_15', num: 15, label: 'Infection prevention and control' },
];

const OTHER_CERTS = [
  { key: 'AUTISM_AWARENESS_LD', label: 'Autism Awareness and Learning Disabilities' },
  { key: 'FIRST_AID_CERT',      label: 'First Aid' },
  { key: 'MCA_DOLS',            label: 'MCA & DoLS' },
  { key: 'FOOD_HYGIENE',        label: 'Food Hygiene' },
  { key: 'FIRE_SAFETY',         label: 'Fire Safety' },
  { key: 'MOVING_HANDLING',     label: 'Moving and Handling (Theory and Practical)' },
];

const BLANK_FORM = {
  category: '',        // 'care' | 'other'
  careMode: '',        // 'combined' | 'individual'
  selectedStandards: new Set(),
  selectedOther: '',
  file: null,
  issueDate: '',
  expiryDate: '',
  notes: '',
};

// ─── Upload modal ─────────────────────────────────────────────────────────────

function UploadModal({ onClose, onUploaded }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(BLANK_FORM);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef();

  const set = (f, v) => setForm((p) => ({ ...p, [f]: v }));

  const toggleStandard = (key) => {
    setForm((p) => {
      const s = new Set(p.selectedStandards);
      s.has(key) ? s.delete(key) : s.add(key);
      return { ...p, selectedStandards: s };
    });
  };

  const toggleAll = () => {
    setForm((p) => {
      const allKeys = CARE_STANDARDS.map((s) => s.key);
      const allSelected = allKeys.every((k) => p.selectedStandards.has(k));
      return { ...p, selectedStandards: allSelected ? new Set() : new Set(allKeys) };
    });
  };

  const handleFile = (file) => {
    if (!file) return;
    const allowed = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!allowed.includes(file.type)) { toast.error('Only PDF or image files are allowed'); return; }
    if (file.size > 10 * 1024 * 1024) { toast.error('File must be under 10 MB'); return; }
    set('file', file);
  };

  const canProceedStep1 = !!form.category;

  const canProceedStep2 = form.category === 'care'
    ? (form.careMode === 'combined' || (form.careMode === 'individual' && form.selectedStandards.size > 0))
    : !!form.selectedOther;

  const getCertTypes = () => {
    if (form.category === 'care') {
      if (form.careMode === 'combined') return ['CARE_CERT_COMBINED'];
      return Array.from(form.selectedStandards);
    }
    return [form.selectedOther];
  };

  const handleSubmit = async () => {
    if (!form.file) { toast.error('Please attach a file'); return; }
    const types = getCertTypes();
    if (types.length === 0) { toast.error('No certificate type selected'); return; }

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', form.file);
      fd.append('certTypes', JSON.stringify(types));
      if (form.issueDate) fd.append('issueDate', form.issueDate);
      if (form.expiryDate) fd.append('expiryDate', form.expiryDate);
      if (form.notes) fd.append('notes', form.notes);

      const res = await uploadCertificate(fd);
      onUploaded(res.data.data);
      toast.success(`${res.data.data.length} certificate(s) uploaded`);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally { setUploading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="font-bold text-gray-900">Upload Certificate</h2>
            <p className="text-xs text-gray-400 mt-0.5">Step {step} of 3</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-gray-100">
          <div className="h-1 bg-primary-700 transition-all" style={{ width: `${(step / 3) * 100}%` }} />
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">

          {/* ── Step 1: Category ── */}
          {step === 1 && (
            <div className="space-y-4">
              <p className="font-semibold text-gray-800">What type of certificate are you uploading?</p>
              <div className="space-y-3">
                <label className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${form.category === 'care' ? 'border-primary-700 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input type="radio" name="category" value="care" checked={form.category === 'care'} onChange={() => set('category', 'care')} className="mt-0.5 accent-primary-700" />
                  <div>
                    <p className="font-semibold text-sm text-gray-900">Care Certificate Standards 1–15</p>
                    <p className="text-xs text-gray-500 mt-0.5">The core Care Certificate covering all 15 standards</p>
                  </div>
                </label>
                <label className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${form.category === 'other' ? 'border-primary-700 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input type="radio" name="category" value="other" checked={form.category === 'other'} onChange={() => set('category', 'other')} className="mt-0.5 accent-primary-700" />
                  <div>
                    <p className="font-semibold text-sm text-gray-900">Other Certificate</p>
                    <p className="text-xs text-gray-500 mt-0.5">First Aid, MCA & DoLS, Food Hygiene, Fire Safety, Moving and Handling, and more</p>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* ── Step 2a: Care Certificate pathway ── */}
          {step === 2 && form.category === 'care' && (
            <div className="space-y-4">
              <p className="font-semibold text-gray-800">How do you hold your Care Certificate?</p>
              <div className="space-y-3">
                <label className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${form.careMode === 'combined' ? 'border-primary-700 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input type="radio" name="careMode" value="combined" checked={form.careMode === 'combined'} onChange={() => set('careMode', 'combined')} className="mt-0.5 accent-primary-700" />
                  <div>
                    <p className="font-semibold text-sm text-gray-900">Combined certificate <span className="text-primary-700 font-normal">(Standards 1–15 in one document)</span></p>
                    <p className="text-xs text-gray-500 mt-0.5">You received a single certificate covering all 15 standards</p>
                  </div>
                </label>
                <label className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${form.careMode === 'individual' ? 'border-primary-700 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input type="radio" name="careMode" value="individual" checked={form.careMode === 'individual'} onChange={() => set('careMode', 'individual')} className="mt-0.5 accent-primary-700" />
                  <div>
                    <p className="font-semibold text-sm text-gray-900">Individual standard(s)</p>
                    <p className="text-xs text-gray-500 mt-0.5">You have one or more standards as separate certificates</p>
                  </div>
                </label>
              </div>

              {form.careMode === 'individual' && (
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 border-b border-gray-200">
                    <p className="text-xs font-semibold text-gray-700">Select the standard(s) this file covers</p>
                    <button onClick={toggleAll} className="text-xs text-primary-700 font-medium hover:underline">
                      {CARE_STANDARDS.every((s) => form.selectedStandards.has(s.key)) ? 'Deselect all' : 'Select all'}
                    </button>
                  </div>
                  <div className="divide-y divide-gray-100 max-h-64 overflow-y-auto">
                    {CARE_STANDARDS.map((s) => (
                      <label key={s.key} className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors ${form.selectedStandards.has(s.key) ? 'bg-primary-50' : 'hover:bg-gray-50'}`}>
                        <input
                          type="checkbox"
                          checked={form.selectedStandards.has(s.key)}
                          onChange={() => toggleStandard(s.key)}
                          className="accent-primary-700 flex-shrink-0"
                        />
                        <span className="w-6 h-6 rounded-md bg-gray-100 text-gray-600 text-xs font-bold flex items-center justify-center flex-shrink-0">{s.num}</span>
                        <span className="text-sm text-gray-800">{s.label}</span>
                      </label>
                    ))}
                  </div>
                  {form.selectedStandards.size > 0 && (
                    <div className="px-4 py-2 bg-primary-50 border-t border-primary-100">
                      <p className="text-xs text-primary-700 font-medium">{form.selectedStandards.size} standard(s) selected — one file will be linked to all of them</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── Step 2b: Other certificate pathway ── */}
          {step === 2 && form.category === 'other' && (
            <div className="space-y-4">
              <p className="font-semibold text-gray-800">Select the certificate type</p>
              <div className="space-y-2">
                {OTHER_CERTS.map((c) => (
                  <label key={c.key} className={`flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-colors ${form.selectedOther === c.key ? 'border-primary-700 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <input type="radio" name="otherCert" value={c.key} checked={form.selectedOther === c.key} onChange={() => set('selectedOther', c.key)} className="accent-primary-700 flex-shrink-0" />
                    <span className="text-sm font-medium text-gray-800">{c.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* ── Step 3: File + dates ── */}
          {step === 3 && (
            <div className="space-y-4">
              {/* Summary badge */}
              <div className="bg-primary-50 border border-primary-100 rounded-xl px-4 py-3">
                <p className="text-xs font-semibold text-primary-700 mb-1">Uploading:</p>
                {form.category === 'care' && form.careMode === 'combined' && (
                  <p className="text-sm text-gray-800">Care Certificate Standards 1–15 (Combined)</p>
                )}
                {form.category === 'care' && form.careMode === 'individual' && (
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {CARE_STANDARDS.filter((s) => form.selectedStandards.has(s.key)).map((s) => (
                      <span key={s.key} className="bg-primary-100 text-primary-700 text-xs px-2 py-0.5 rounded-full font-medium">Std {s.num}</span>
                    ))}
                  </div>
                )}
                {form.category === 'other' && (
                  <p className="text-sm text-gray-800">{OTHER_CERTS.find((c) => c.key === form.selectedOther)?.label}</p>
                )}
              </div>

              {/* File upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Certificate file <span className="text-red-500">*</span></label>
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
                  onClick={() => fileRef.current.click()}
                  className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${dragOver ? 'border-primary-500 bg-primary-50' : form.file ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'}`}
                >
                  <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={(e) => handleFile(e.target.files[0])} />
                  {form.file ? (
                    <div className="flex items-center justify-center gap-2">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      <span className="text-sm font-medium text-green-700">{form.file.name}</span>
                      <button type="button" onClick={(e) => { e.stopPropagation(); set('file', null); }} className="text-gray-400 hover:text-red-500 ml-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  ) : (
                    <>
                      <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                      <p className="text-sm text-gray-600"><span className="font-medium text-primary-700">Click to upload</span> or drag and drop</p>
                      <p className="text-xs text-gray-400 mt-1">PDF, JPG or PNG · max 10 MB</p>
                    </>
                  )}
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Issue date <span className="text-gray-400 font-normal">(optional)</span></label>
                  <input type="date" value={form.issueDate} onChange={(e) => set('issueDate', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-700" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expiry date <span className="text-gray-400 font-normal">(optional)</span></label>
                  <input type="date" value={form.expiryDate} onChange={(e) => set('expiryDate', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-700" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes <span className="text-gray-400 font-normal">(optional)</span></label>
                <textarea rows={2} value={form.notes} onChange={(e) => set('notes', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-700"
                  placeholder="Any additional notes…" />
              </div>
            </div>
          )}
        </div>

        {/* Footer nav */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between gap-3">
          {step > 1 ? (
            <button onClick={() => setStep(step - 1)} className="text-sm text-gray-500 hover:text-gray-700 font-medium">
              ← Back
            </button>
          ) : (
            <button onClick={onClose} className="text-sm text-gray-500 hover:text-gray-700">Cancel</button>
          )}

          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={step === 1 ? !canProceedStep1 : !canProceedStep2}
              className="bg-primary-700 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-primary-800 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Continue →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={uploading || !form.file}
              className="bg-primary-700 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-primary-800 disabled:opacity-40 flex items-center gap-2"
            >
              {uploading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              {uploading ? 'Uploading…' : 'Upload Certificate'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Uploaded certificate card ────────────────────────────────────────────────

function UploadedCertCard({ cert, onDeleted }) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm('Remove this certificate?')) return;
    setDeleting(true);
    try {
      await deleteUploadedCertificate(cert.id);
      onDeleted(cert.id);
      toast.success('Certificate removed');
    } catch { toast.error('Failed to remove certificate'); } finally { setDeleting(false); }
  };

  const isExpired = cert.expiryDate && new Date(cert.expiryDate) < new Date();
  const isExpiringSoon = cert.expiryDate && !isExpired &&
    new Date(cert.expiryDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
      <div className={`h-1.5 ${isExpired ? 'bg-red-400' : isExpiringSoon ? 'bg-amber-400' : 'bg-gradient-to-r from-secondary-400 to-secondary-600'}`} />
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 bg-secondary-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 leading-snug">{cert.label}</p>
            <div className="flex flex-wrap items-center gap-2 mt-1.5">
              {cert.issueDate && (
                <span className="text-xs text-gray-500">
                  Issued {new Date(cert.issueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              )}
              {cert.expiryDate && (
                <span className={`text-xs px-1.5 py-0.5 rounded-md font-medium ${isExpired ? 'bg-red-100 text-red-600' : isExpiringSoon ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                  {isExpired ? 'Expired' : isExpiringSoon ? 'Expiring soon' : 'Valid'} · {new Date(cert.expiryDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              )}
              {!cert.issueDate && !cert.expiryDate && (
                <span className="text-xs text-gray-400">Uploaded {new Date(cert.uploadedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-2 mt-3">
          <a href={cert.fileUrl} target="_blank" rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-1.5 border border-gray-200 rounded-lg py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
            View
          </a>
          <button onClick={handleDelete} disabled={deleting}
            className="px-3 py-1.5 rounded-lg border border-red-200 text-red-500 text-xs font-medium hover:bg-red-50 disabled:opacity-50">
            {deleting ? '…' : 'Remove'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MyCertificatesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courseCerts, setCourseCerts] = useState([]);
  const [uploadedCerts, setUploadedCerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);

  useEffect(() => {
    Promise.all([getMyCertificates(), getMyUploadedCertificates()])
      .then(([c, u]) => { setCourseCerts(c.data.data); setUploadedCerts(u.data.data); })
      .finally(() => setLoading(false));
  }, []);

  const handleDownload = (cert) => {
    generateCertificatePDF({ userName: user.name, courseTitle: cert.course.title, issuedAt: cert.issuedAt, certificateId: cert.id });
    toast.success('Certificate downloaded!');
  };

  if (loading) return <LoadingSpinner />;

  const totalCount = courseCerts.length + uploadedCerts.length;

  return (
    <div className="space-y-8">
      {showUpload && (
        <UploadModal
          onClose={() => setShowUpload(false)}
          onUploaded={(newRecords) => setUploadedCerts((prev) => [...newRecords, ...prev])}
        />
      )}

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Certificates</h1>
          <p className="text-gray-500 mt-1">{totalCount} certificate{totalCount !== 1 ? 's' : ''} total</p>
        </div>
        <button
          onClick={() => setShowUpload(true)}
          className="flex items-center gap-2 bg-primary-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-primary-800 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          Upload Certificate
        </button>
      </div>

      {/* ── Uploaded certificates section ── */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Uploaded Certificates</h2>
          <span className="bg-secondary-100 text-secondary-700 text-xs font-semibold px-2 py-0.5 rounded-full">{uploadedCerts.length}</span>
        </div>

        {uploadedCerts.length === 0 ? (
          <div className="bg-white border border-dashed border-gray-300 rounded-xl p-8 text-center">
            <svg className="w-10 h-10 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="text-sm text-gray-500 mb-3">No certificates uploaded yet</p>
            <button onClick={() => setShowUpload(true)} className="text-sm text-primary-700 font-medium hover:text-primary-800">
              Upload your first certificate →
            </button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {uploadedCerts.map((cert) => (
              <UploadedCertCard key={cert.id} cert={cert} onDeleted={(id) => setUploadedCerts((p) => p.filter((c) => c.id !== id))} />
            ))}
          </div>
        )}
      </div>

      {/* ── Course completion certificates section ── */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Course Certificates</h2>
          <span className="bg-primary-100 text-primary-700 text-xs font-semibold px-2 py-0.5 rounded-full">{courseCerts.length}</span>
        </div>

        {courseCerts.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-700 mb-1">No course certificates yet</p>
            <p className="text-xs text-gray-500 mb-3">Complete courses and pass assessments to earn certificates.</p>
            <Link to="/courses" className="text-sm text-primary-700 font-medium hover:text-primary-800">Browse courses →</Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {courseCerts.map((cert) => (
              <div key={cert.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                <div className="h-1.5 bg-gradient-to-r from-primary-500 to-indigo-500" />
                <div className="p-5">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-primary-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm leading-snug">{cert.course.title}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Issued {new Date(cert.issuedAt).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => navigate(`/courses/${cert.courseId}/certificate`)}
                      className="flex-1 border border-gray-200 rounded-lg py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50">
                      View
                    </button>
                    <button onClick={() => handleDownload(cert)}
                      className="flex-1 bg-primary-700 text-white rounded-lg py-1.5 text-xs font-medium hover:bg-primary-800">
                      Download
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
