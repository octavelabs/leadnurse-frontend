import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getPublicReferenceForm, submitReferenceForm } from '../api/referenceApi';

const RATINGS = ['reliability', 'timekeeping', 'teamwork', 'communication', 'overallPerformance'];
const RATING_LABELS = {
  reliability: 'Reliability',
  timekeeping: 'Timekeeping',
  teamwork: 'Teamwork & Collaboration',
  communication: 'Communication Skills',
  overallPerformance: 'Overall Performance',
};

const RELATIONSHIP_LABELS = {
  LINE_MANAGER: 'Line Manager',
  SUPERVISOR: 'Supervisor',
  COLLEAGUE: 'Colleague',
  HR_CONTACT: 'HR Contact',
  OTHER: 'Other',
};

function RatingSelector({ name, label, value, onChange }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={`w-10 h-10 rounded-lg border-2 text-sm font-semibold transition-colors ${
              value === n
                ? 'border-blue-600 bg-blue-600 text-white'
                : 'border-gray-200 text-gray-500 hover:border-blue-300'
            }`}
          >
            {n}
          </button>
        ))}
        <span className="self-center text-xs text-gray-400 ml-1">
          {value === 1 ? 'Poor' : value === 2 ? 'Below average' : value === 3 ? 'Average' : value === 4 ? 'Good' : value === 5 ? 'Excellent' : ''}
        </span>
      </div>
    </div>
  );
}

export default function ReferencePage() {
  const { token } = useParams();
  const [context, setContext] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const [form, setForm] = useState({
    jobTitleDuringTenure: '',
    reliability: 0,
    timekeeping: 0,
    teamwork: 0,
    communication: 0,
    overallPerformance: 0,
    wouldRehire: null,
    reasonForLeaving: '',
    additionalComments: '',
    declarationSigned: false,
  });

  useEffect(() => {
    getPublicReferenceForm(token)
      .then((r) => setContext(r.data.data))
      .catch((err) => setLoadError(err.response?.data?.message || 'This reference link is invalid or has expired.'))
      .finally(() => setLoading(false));
  }, [token]);

  const setField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const canSubmit = () => {
    return RATINGS.every((r) => form[r] >= 1) &&
      form.wouldRehire !== null &&
      form.declarationSigned;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit()) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      await submitReferenceForm(token, form);
      setSubmitted(true);
    } catch (err) {
      setSubmitError(err.response?.data?.message || 'Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (loadError) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl border border-gray-200 p-8 max-w-md w-full text-center">
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
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
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Thank you, {context?.refereeName?.split(' ')[0]}!</h2>
        <p className="text-gray-500 text-sm leading-relaxed">
          Your reference for <strong>{context?.workerFirstName}</strong> has been submitted successfully.
          The employer will review your response.
        </p>
        <p className="text-xs text-gray-400 mt-4">You may now close this window.</p>
      </div>
    </div>
  );

  const fmt = (d) => d ? new Date(d).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }) : null;
  const period = [fmt(context?.employmentStart), fmt(context?.employmentEnd)].filter(Boolean).join(' – ');

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <span className="font-bold text-gray-900 text-lg">Lead Nurse</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Employment Reference Request</h1>
          <p className="text-gray-500 text-sm mt-1">
            Dear <strong>{context?.refereeName}</strong>, you have been asked to provide a reference for <strong>{context?.workerFirstName}</strong>.
          </p>
        </div>

        {/* Context card */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6 text-sm">
          <div className="flex flex-wrap gap-4">
            <div>
              <p className="text-xs text-blue-500 font-medium uppercase tracking-wide">Applicant</p>
              <p className="text-blue-900 font-semibold">{context?.workerFirstName}</p>
            </div>
            {context?.relationship && (
              <div>
                <p className="text-xs text-blue-500 font-medium uppercase tracking-wide">Your relationship</p>
                <p className="text-blue-900 font-semibold">{RELATIONSHIP_LABELS[context.relationship] || context.relationship}</p>
              </div>
            )}
            {context?.refereeOrganisation && (
              <div>
                <p className="text-xs text-blue-500 font-medium uppercase tracking-wide">Organisation</p>
                <p className="text-blue-900 font-semibold">{context.refereeOrganisation}</p>
              </div>
            )}
            {period && (
              <div>
                <p className="text-xs text-blue-500 font-medium uppercase tracking-wide">Period known</p>
                <p className="text-blue-900 font-semibold">{period}</p>
              </div>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Employment details */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-900 mb-4">Employment Details</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                What was {context?.workerFirstName}'s job title during their time with you?
              </label>
              <input
                type="text"
                value={form.jobTitleDuringTenure}
                onChange={(e) => setField('jobTitleDuringTenure', e.target.value)}
                placeholder="e.g. Healthcare Assistant"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Performance ratings */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-900 mb-1">Performance Ratings</h2>
            <p className="text-xs text-gray-400 mb-4">Rate from 1 (Poor) to 5 (Excellent)</p>
            <div className="space-y-4">
              {RATINGS.map((r) => (
                <RatingSelector
                  key={r}
                  name={r}
                  label={RATING_LABELS[r]}
                  value={form[r]}
                  onChange={(v) => setField(r, v)}
                />
              ))}
            </div>
          </div>

          {/* Open questions */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
            <h2 className="font-semibold text-gray-900">Additional Information</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason for leaving <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <textarea
                rows={3}
                value={form.reasonForLeaving}
                onChange={(e) => setField('reasonForLeaving', e.target.value)}
                placeholder="Describe the circumstances of their departure..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Additional comments <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <textarea
                rows={4}
                value={form.additionalComments}
                onChange={(e) => setField('additionalComments', e.target.value)}
                placeholder="Any other relevant information about the applicant's character, skills or suitability for a healthcare role..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Would rehire */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-900 mb-3">
              Would you re-employ {context?.workerFirstName} if given the opportunity?
            </h2>
            <div className="flex gap-3">
              {[{ label: 'Yes', value: true }, { label: 'No', value: false }].map(({ label, value }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setField('wouldRehire', value)}
                  className={`flex-1 py-2.5 rounded-lg border-2 text-sm font-semibold transition-colors ${
                    form.wouldRehire === value
                      ? value ? 'border-green-500 bg-green-50 text-green-700' : 'border-red-400 bg-red-50 text-red-700'
                      : 'border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Declaration */}
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-5">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.declarationSigned}
                onChange={(e) => setField('declarationSigned', e.target.checked)}
                className="mt-0.5 w-4 h-4 accent-blue-600 flex-shrink-0"
              />
              <span className="text-sm text-gray-700 leading-relaxed">
                I declare that the information I have provided in this reference is true, accurate and to the best of my knowledge.
                I understand this reference may be used in the employment decision for the above-named individual.
              </span>
            </label>
          </div>

          {submitError && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">{submitError}</div>
          )}

          <button
            type="submit"
            disabled={!canSubmit() || submitting}
            className="w-full bg-blue-600 text-white py-3 rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
          >
            {submitting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            {submitting ? 'Submitting…' : 'Submit Reference'}
          </button>

          <p className="text-xs text-gray-400 text-center pb-6">
            Once submitted, your reference cannot be edited. If you have questions, contact the employer directly.
          </p>
        </form>
      </div>
    </div>
  );
}
