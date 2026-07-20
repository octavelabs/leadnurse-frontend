import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getPublicReferenceForm, submitReferenceForm } from '../api/referenceApi';

const LOGO = 'https://leadnurse.co.uk/wp-content/uploads/2026/02/Lead-Nurse-Logo-e1771949504571-1024x377.png';

const HOW_KNOW_OPTIONS = [
  'Former employer / line manager',
  'Current employer / line manager',
  'Colleague',
  'Academic / tutor',
  'Community / religious leader',
  'Neighbour',
  'Friend',
  'Other',
];

const CHARACTER_CRITERIA = [
  { key: 'honestyIntegrity',           label: 'Honesty & Integrity' },
  { key: 'reliability',                label: 'Reliability' },
  { key: 'professionalism',            label: 'Professionalism' },
  { key: 'communicationSkills',        label: 'Communication Skills' },
  { key: 'teamWorking',                label: 'Team Working' },
  { key: 'timekeepingAttendance',      label: 'Timekeeping & Attendance' },
  { key: 'trustworthiness',            label: 'Trustworthiness' },
  { key: 'respectForOthers',           label: 'Respect for Others' },
  { key: 'abilityToFollowProcedures',  label: 'Ability to Follow Procedures' },
  { key: 'suitabilityForHealthcare',   label: 'Suitability for Healthcare / Care Environment' },
];

const RATINGS = ['Excellent', 'Good', 'Satisfactory', 'Unsatisfactory'];

const RECOMMENDATIONS = [
  { value: 'STRONGLY_RECOMMEND',           label: 'Strongly Recommend' },
  { value: 'RECOMMEND',                    label: 'Recommend' },
  { value: 'RECOMMEND_WITH_RESERVATIONS',  label: 'Recommend with Reservations' },
  { value: 'DO_NOT_RECOMMEND',             label: 'Do Not Recommend' },
];

const today = new Date().toISOString().split('T')[0];

function SectionHeading({ children }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <span className="text-xs font-bold uppercase tracking-widest text-primary-700">{children}</span>
      <div className="flex-1 h-px bg-primary-100" />
    </div>
  );
}

function YesNoField({ label, value, onChange, detailValue, onDetailChange, detailLabel }) {
  return (
    <div className="space-y-2">
      <p className="text-sm text-gray-800">{label}</p>
      <div className="flex gap-3">
        {[false, true].map((v) => (
          <label key={String(v)} className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 cursor-pointer text-sm font-medium transition-colors ${value === v ? (v ? 'border-red-400 bg-red-50 text-red-700' : 'border-green-400 bg-green-50 text-green-700') : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
            <input type="radio" className="sr-only" checked={value === v} onChange={() => onChange(v)} />
            {v ? 'Yes' : 'No'}
          </label>
        ))}
      </div>
      {value === true && (
        <textarea
          rows={3}
          value={detailValue}
          onChange={(e) => onDetailChange(e.target.value)}
          placeholder={detailLabel || 'Please provide details…'}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-700"
        />
      )}
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

  // ── Form state ────────────────────────────────────────────────────────────
  const [refereeDate, setRefereeDate] = useState(today);
  const [refereeName, setRefereeName] = useState('');
  const [refereeOrganisation, setRefereeOrganisation] = useState('');
  const [refereeJobTitle, setRefereeJobTitle] = useState('');
  const [refereeAddress, setRefereeAddress] = useState('');
  const [refereeEmail, setRefereeEmail] = useState('');
  const [refereeTelephone, setRefereeTelephone] = useState('');

  const [positionAppliedFor, setPositionAppliedFor] = useState('');
  const [proposedStartDate, setProposedStartDate] = useState('');

  const [howTheyKnow, setHowTheyKnow] = useState('');
  const [howTheyKnowOther, setHowTheyKnowOther] = useState('');
  const [durationKnown, setDurationKnown] = useState('');
  const [capacityKnown, setCapacityKnown] = useState('');

  const [characterRatings, setCharacterRatings] = useState(() =>
    Object.fromEntries(CHARACTER_CRITERIA.map((c) => [c.key, { rating: '', comment: '' }]))
  );

  const [disciplinaryAction, setDisciplinaryAction] = useState(null);
  const [disciplinaryDetails, setDisciplinaryDetails] = useState('');
  const [misconductInvestigation, setMisconductInvestigation] = useState(null);
  const [misconductDetails, setMisconductDetails] = useState('');
  const [unsuitableForVulnerable, setUnsuitableForVulnerable] = useState(null);
  const [unsuitableDetails, setUnsuitableDetails] = useState('');

  const [additionalComments, setAdditionalComments] = useState('');

  const [recommendation, setRecommendation] = useState('');
  const [recommendationComments, setRecommendationComments] = useState('');

  const [declarationName, setDeclarationName] = useState('');
  const [declarationPosition, setDeclarationPosition] = useState('');
  const [declarationOrganisation, setDeclarationOrganisation] = useState('');
  const [declarationSignature, setDeclarationSignature] = useState('');
  const [declarationDate, setDeclarationDate] = useState(today);
  const [declarationSigned, setDeclarationSigned] = useState(false);

  useEffect(() => {
    getPublicReferenceForm(token)
      .then((r) => {
        const ctx = r.data.data;
        setContext(ctx);
        setRefereeName(ctx.refereeName || '');
        setRefereeOrganisation(ctx.refereeOrganisation || '');
        setRefereeJobTitle(ctx.refereeJobTitle || '');
        setRefereeEmail(ctx.refereeEmail || '');
      })
      .catch((err) => setLoadError(err.response?.data?.message || 'This reference link is invalid or has expired.'))
      .finally(() => setLoading(false));
  }, [token]);

  const setRating = (key, field, value) => {
    setCharacterRatings((prev) => ({ ...prev, [key]: { ...prev[key], [field]: value } }));
  };

  const allRatingsComplete = CHARACTER_CRITERIA.every((c) => characterRatings[c.key]?.rating);
  const safeguardingComplete = disciplinaryAction !== null && misconductInvestigation !== null && unsuitableForVulnerable !== null;

  const canSubmit =
    refereeName.trim() &&
    howTheyKnow &&
    durationKnown.trim() &&
    capacityKnown.trim() &&
    allRatingsComplete &&
    safeguardingComplete &&
    recommendation &&
    declarationName.trim() &&
    declarationSignature.trim() &&
    declarationSigned;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      await submitReferenceForm(token, {
        refereeAddress, refereeTelephone, refereeEmailOnForm: refereeEmail, refereeDate,
        howTheyKnow, howTheyKnowOther, durationKnown, capacityKnown,
        characterRatings,
        disciplinaryAction, disciplinaryDetails,
        misconductInvestigation, misconductDetails,
        unsuitableForVulnerable, unsuitableDetails,
        additionalComments,
        recommendation, recommendationComments,
        declarationName, declarationPosition, declarationOrganisation,
        declarationSignature, declarationDate, declarationSigned,
      });
      setSubmitted(true);
    } catch (err) {
      setSubmitError(err.response?.data?.message || 'Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── States ────────────────────────────────────────────────────────────────

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
        <img src={LOGO} alt="Lead Nurse" className="h-8 w-auto object-contain mx-auto mb-6" />
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Reference Submitted</h2>
        <p className="text-gray-500 text-sm leading-relaxed">
          Thank you for completing the character reference for <strong>{context?.workerName}</strong>.<br />
          Lead Nurse Limited will review your response in confidence.
        </p>
        <p className="text-xs text-gray-400 mt-4">You may now close this window.</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Page header */}
        <div className="bg-primary-700 rounded-t-2xl px-8 py-6 flex items-center justify-between">
          <div>
            <p className="text-primary-200 text-xs font-semibold uppercase tracking-wider mb-1">Private &amp; Confidential</p>
            <h1 className="text-white text-xl font-bold">Character Reference Request Form</h1>
          </div>
          <img src={LOGO} alt="Lead Nurse" className="h-9 w-auto object-contain bg-white rounded-lg px-2 py-1" />
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-b-2xl shadow-sm divide-y divide-gray-100">

          {/* ── Section 1: Referee details ─────────────────────────────────────── */}
          <div className="px-8 py-6">
            <SectionHeading>Referee Details</SectionHeading>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Date</label>
                <input type="date" value={refereeDate} onChange={(e) => setRefereeDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-700" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Referee Name <span className="text-red-500">*</span></label>
                <input value={refereeName} onChange={(e) => setRefereeName(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-700" placeholder="Full name" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Organisation</label>
                <input value={refereeOrganisation} onChange={(e) => setRefereeOrganisation(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-700" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Position / Job Title</label>
                <input value={refereeJobTitle} onChange={(e) => setRefereeJobTitle(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-700" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-500 mb-1">Address</label>
                <input value={refereeAddress} onChange={(e) => setRefereeAddress(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-700" placeholder="Work / professional address" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Professional Email</label>
                <input type="email" value={refereeEmail} onChange={(e) => setRefereeEmail(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-700" placeholder="professional@company.com" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Telephone</label>
                <input value={refereeTelephone} onChange={(e) => setRefereeTelephone(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-700" />
              </div>
            </div>
          </div>

          {/* ── Section 2: Applicant details ──────────────────────────────────── */}
          <div className="px-8 py-6 bg-primary-50">
            <SectionHeading>Applicant Details</SectionHeading>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Applicant Name</label>
                <p className="text-sm font-semibold text-gray-900 px-3 py-2 bg-white rounded-lg border border-gray-200">{context?.workerName}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Position Applied For</label>
                <input value={positionAppliedFor} onChange={(e) => setPositionAppliedFor(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-700" placeholder="e.g. Healthcare Assistant" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Proposed Start Date</label>
                <input type="date" value={proposedStartDate} onChange={(e) => setProposedStartDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-700" />
              </div>
            </div>
            <p className="mt-4 text-xs text-gray-600 leading-relaxed">
              The above-named individual has applied for a position with Lead Nurse Limited. As part of our recruitment and
              safeguarding procedures, we would be grateful if you could complete this reference form honestly and accurately.
              The applicant has authorised us to seek a reference from you and any information provided will be treated
              confidentially and processed in accordance with applicable data protection legislation.
            </p>
          </div>

          {/* ── Section 3: Referee relationship questions ─────────────────────── */}
          <div className="px-8 py-6">
            <SectionHeading>About Your Relationship with the Applicant</SectionHeading>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  1. How do you know the applicant? <span className="text-red-500">*</span>
                </label>
                <select value={howTheyKnow} onChange={(e) => setHowTheyKnow(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-700">
                  <option value="">Choose an option…</option>
                  {HOW_KNOW_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
                {howTheyKnow === 'Other' && (
                  <input value={howTheyKnowOther} onChange={(e) => setHowTheyKnowOther(e.target.value)}
                    className="mt-2 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-700"
                    placeholder="Please specify…" />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  2. How long have you known the applicant? <span className="text-red-500">*</span>
                </label>
                <input value={durationKnown} onChange={(e) => setDurationKnown(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-700"
                  placeholder="e.g. 3 years" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  3. In what capacity have you known the applicant? <span className="text-red-500">*</span>
                </label>
                <textarea rows={3} value={capacityKnown} onChange={(e) => setCapacityKnown(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-700"
                  placeholder="Describe the nature of your relationship with the applicant…" />
              </div>
            </div>
          </div>

          {/* ── Section 4: Character assessment ──────────────────────────────── */}
          <div className="px-8 py-6">
            <SectionHeading>Character Assessment</SectionHeading>
            <p className="text-sm text-gray-500 mb-4">Please rate the applicant in the following areas:</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-2 pr-4 font-semibold text-gray-700 w-48">Criteria</th>
                    {RATINGS.map((r) => (
                      <th key={r} className="text-center py-2 px-3 font-semibold text-gray-700 text-xs">{r}</th>
                    ))}
                    <th className="text-left py-2 pl-4 font-semibold text-gray-700 text-xs">Optional Comment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {CHARACTER_CRITERIA.map((c) => (
                    <tr key={c.key} className={characterRatings[c.key]?.rating ? 'bg-green-50/30' : ''}>
                      <td className="py-3 pr-4 text-gray-800 font-medium text-sm leading-snug">{c.label}</td>
                      {RATINGS.map((r) => (
                        <td key={r} className="py-3 px-3 text-center">
                          <input
                            type="radio"
                            name={c.key}
                            value={r}
                            checked={characterRatings[c.key]?.rating === r}
                            onChange={() => setRating(c.key, 'rating', r)}
                            className="w-4 h-4 accent-primary-700"
                          />
                        </td>
                      ))}
                      <td className="py-3 pl-4">
                        <input
                          value={characterRatings[c.key]?.comment || ''}
                          onChange={(e) => setRating(c.key, 'comment', e.target.value)}
                          className="w-full border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary-700"
                          placeholder="Comment…"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!allRatingsComplete && (
              <p className="text-xs text-amber-600 mt-2">Please rate all 10 criteria before submitting.</p>
            )}
          </div>

          {/* ── Section 5: Safeguarding & Conduct ────────────────────────────── */}
          <div className="px-8 py-6">
            <SectionHeading>Safeguarding &amp; Conduct</SectionHeading>
            <p className="text-sm text-gray-600 mb-5">To the best of your knowledge:</p>
            <div className="space-y-6">
              <YesNoField
                label="Has the applicant ever been subject to disciplinary action?"
                value={disciplinaryAction}
                onChange={setDisciplinaryAction}
                detailValue={disciplinaryDetails}
                onDetailChange={setDisciplinaryDetails}
                detailLabel="Please provide details of the disciplinary action…"
              />
              <YesNoField
                label="Has the applicant ever been investigated regarding misconduct, safeguarding concerns, abuse, neglect, dishonesty, or behaviour that may place vulnerable individuals at risk?"
                value={misconductInvestigation}
                onChange={setMisconductInvestigation}
                detailValue={misconductDetails}
                onDetailChange={setMisconductDetails}
                detailLabel="Please provide details of the investigation…"
              />
              <YesNoField
                label="Are you aware of any reason why this applicant may be unsuitable to work with vulnerable adults, children, patients, or members of the public?"
                value={unsuitableForVulnerable}
                onChange={setUnsuitableForVulnerable}
                detailValue={unsuitableDetails}
                onDetailChange={setUnsuitableDetails}
                detailLabel="Please provide details…"
              />
            </div>
          </div>

          {/* ── Section 6: Additional comments ───────────────────────────────── */}
          <div className="px-8 py-6">
            <SectionHeading>Additional Comments</SectionHeading>
            <p className="text-sm text-gray-600 mb-3">
              Please provide any additional information you believe would assist us in assessing the applicant's suitability for employment.
            </p>
            <textarea rows={5} value={additionalComments} onChange={(e) => setAdditionalComments(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-700"
              placeholder="Any further information about the applicant's character, skills or suitability…" />
          </div>

          {/* ── Section 7: Overall recommendation ───────────────────────────── */}
          <div className="px-8 py-6">
            <SectionHeading>Overall Recommendation</SectionHeading>
            <p className="text-sm text-gray-700 mb-3 font-medium">Would you recommend this applicant for employment? <span className="text-red-500">*</span></p>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {RECOMMENDATIONS.map((r) => (
                <label key={r.value} className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-colors ${recommendation === r.value ? 'border-primary-700 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input type="radio" name="recommendation" value={r.value} checked={recommendation === r.value} onChange={() => setRecommendation(r.value)} className="accent-primary-700" />
                  <span className="text-sm font-medium text-gray-800">{r.label}</span>
                </label>
              ))}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Comments <span className="text-gray-400 font-normal">(optional)</span></label>
              <textarea rows={3} value={recommendationComments} onChange={(e) => setRecommendationComments(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-700" placeholder="Supporting comments for your recommendation…" />
            </div>
          </div>

          {/* ── Section 8: Referee declaration ──────────────────────────────── */}
          <div className="px-8 py-6 bg-gray-50 rounded-b-2xl">
            <SectionHeading>Referee Declaration</SectionHeading>
            <div className="bg-white border border-gray-200 rounded-xl p-4 mb-5 space-y-1.5 text-sm text-gray-700">
              <p>I confirm that:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-600 pl-2">
                <li>The information provided in this reference is true and accurate to the best of my knowledge.</li>
                <li>I understand that Lead Nurse Limited may rely on this information when making employment decisions.</li>
                <li>I am authorised to provide this reference where applicable.</li>
              </ul>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Name <span className="text-red-500">*</span></label>
                <input value={declarationName} onChange={(e) => setDeclarationName(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-700" placeholder="Full name" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Position</label>
                <input value={declarationPosition} onChange={(e) => setDeclarationPosition(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-700" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Organisation</label>
                <input value={declarationOrganisation} onChange={(e) => setDeclarationOrganisation(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-700" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Date</label>
                <input type="date" value={declarationDate} onChange={(e) => setDeclarationDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-700" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Signature <span className="text-red-500">*</span>
                  <span className="text-gray-400 font-normal ml-1">(type your full name as your signature)</span>
                </label>
                <input value={declarationSignature} onChange={(e) => setDeclarationSignature(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-700 italic"
                  placeholder="Type your full name…" style={{ fontFamily: 'cursive' }} />
              </div>
            </div>

            <label className="flex items-start gap-3 cursor-pointer mb-5">
              <input type="checkbox" checked={declarationSigned} onChange={(e) => setDeclarationSigned(e.target.checked)}
                className="mt-0.5 w-4 h-4 accent-primary-700 flex-shrink-0" />
              <span className="text-sm text-gray-700 leading-relaxed">
                I confirm that the information provided above is true and accurate to the best of my knowledge.
              </span>
            </label>

            <div className="bg-primary-50 border border-primary-100 rounded-xl p-4 mb-5 text-sm text-gray-600">
              <p className="font-semibold text-primary-700 mb-1">Return Details</p>
              <p>Please return the completed form to:</p>
              <p>Email: <a href="mailto:compliance@leadnurse.co.uk" className="text-primary-700 font-medium">compliance@leadnurse.co.uk</a></p>
              <p>Telephone: 0338800828</p>
              <p className="mt-2 italic">Thank you for assisting us with our safer recruitment procedures.</p>
            </div>

            {submitError && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-sm text-red-700">{submitError}</div>
            )}

            <button type="submit" disabled={!canSubmit || submitting}
              className="w-full bg-primary-700 text-white py-3.5 rounded-xl text-sm font-bold hover:bg-primary-800 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors">
              {submitting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              {submitting ? 'Submitting…' : 'Submit Reference Form'}
            </button>

            <p className="text-xs text-gray-400 text-center mt-3">
              Once submitted, your reference cannot be edited.
            </p>
          </div>

        </form>
      </div>
    </div>
  );
}
