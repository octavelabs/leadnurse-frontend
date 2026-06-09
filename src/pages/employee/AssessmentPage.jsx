import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getAssessmentByCourse, submitAssessment } from '../../api/assessmentApi';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function AssessmentPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    getAssessmentByCourse(courseId)
      .then((res) => setData(res.data.data))
      .catch(() => toast.error('Failed to load assessment'))
      .finally(() => setLoading(false));
  }, [courseId]);

  const handleSelect = (qIndex, optionIndex) => {
    setAnswers((prev) => ({ ...prev, [qIndex]: optionIndex }));
  };

  const handleSubmit = async () => {
    const questions = data?.assessment?.questions ?? [];
    if (Object.keys(answers).length < questions.length) {
      toast.error('Please answer all questions before submitting.');
      return;
    }

    const answerArray = questions.map((_, i) => answers[i]);
    setSubmitting(true);
    try {
      const res = await submitAssessment(courseId, answerArray);
      setResult(res.data.data);
      toast[res.data.data.passed ? 'success' : 'error'](res.data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!data) return <div className="text-center py-16 text-gray-500">Assessment not found.</div>;

  const { assessment, canAttempt, bestAttempt } = data;
  const questions = assessment?.questions ?? [];

  if (result) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className={`bg-white rounded-2xl border-2 p-8 text-center ${result.passed ? 'border-emerald-300' : 'border-red-300'}`}>
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${result.passed ? 'bg-emerald-100' : 'bg-red-100'}`}>
            {result.passed ? (
              <svg className="w-10 h-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">
            {result.passed ? 'Congratulations!' : 'Keep Trying!'}
          </h2>
          <p className="text-gray-500 mb-6">
            {result.passed
              ? 'You passed the assessment and earned your certificate.'
              : `You scored ${result.score}%. Pass mark is ${result.passScore}%.`}
          </p>

          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-3xl font-bold text-gray-900">{result.score}%</p>
              <p className="text-xs text-gray-500 mt-1">Your Score</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-3xl font-bold text-gray-900">{result.correctCount}/{result.totalQuestions}</p>
              <p className="text-xs text-gray-500 mt-1">Correct Answers</p>
            </div>
            <div className={`rounded-xl p-4 ${result.passed ? 'bg-emerald-50' : 'bg-red-50'}`}>
              <p className={`text-3xl font-bold ${result.passed ? 'text-emerald-600' : 'text-red-600'}`}>
                {result.passed ? 'PASS' : 'FAIL'}
              </p>
              <p className="text-xs text-gray-500 mt-1">Result</p>
            </div>
          </div>

          <div className="space-y-3 mb-8">
            {result.results?.map((r, i) => (
              <div key={i} className={`flex items-center gap-3 p-3 rounded-lg ${r.isCorrect ? 'bg-emerald-50' : 'bg-red-50'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${r.isCorrect ? 'bg-emerald-200 text-emerald-700' : 'bg-red-200 text-red-700'}`}>
                  {r.isCorrect ? '✓' : '✗'}
                </div>
                <span className="text-sm text-gray-700">Question {i + 1}</span>
              </div>
            ))}
          </div>

          <div className="flex gap-3 justify-center">
            <Button variant="secondary" onClick={() => navigate(`/courses/${courseId}`)}>
              Back to Course
            </Button>
            {result.passed && (
              <Button variant="success" onClick={() => navigate(`/courses/${courseId}/certificate`)}>
                View Certificate
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!canAttempt && bestAttempt) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <div className="bg-white rounded-xl border border-gray-200 p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Assessment Complete</h2>
          {bestAttempt.passed ? (
            <p className="text-gray-500 mb-6">You passed with a score of {bestAttempt.score}%.</p>
          ) : (
            <p className="text-gray-500 mb-6">
              You have used all {assessment.maxAttempts} attempts. Best score: {bestAttempt.score}%.
            </p>
          )}
          <div className="flex gap-3 justify-center">
            <Button variant="secondary" onClick={() => navigate(`/courses/${courseId}`)}>Back to Course</Button>
            {bestAttempt.passed && (
              <Button variant="success" onClick={() => navigate(`/courses/${courseId}/certificate`)}>View Certificate</Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Final Assessment</h1>
            <p className="text-gray-500 text-sm mt-0.5">
              {questions.length} questions · Pass with {assessment.passScore}% ·
              Attempt {(assessment.attemptsUsed ?? 0) + 1} of {assessment.maxAttempts}
            </p>
          </div>
          <Link to={`/courses/${courseId}`} className="text-sm text-blue-600 hover:text-blue-700">← Back</Link>
        </div>
      </div>

      <div className="space-y-4">
        {questions.map((q, qi) => (
          <div key={q.id} className="bg-white rounded-xl border border-gray-200 p-6">
            <p className="font-medium text-gray-900 mb-4">
              <span className="text-blue-600 mr-2">{qi + 1}.</span>
              {q.question}
            </p>
            <div className="space-y-2">
              {q.options.map((opt, oi) => (
                <button
                  key={oi}
                  onClick={() => handleSelect(qi, oi)}
                  className={`w-full text-left px-4 py-3 rounded-lg border-2 text-sm transition-all ${
                    answers[qi] === oi
                      ? 'border-blue-500 bg-blue-50 text-blue-800 font-medium'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <span className="font-medium mr-2">{String.fromCharCode(65 + oi)}.</span>
                  {opt}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {Object.keys(answers).length} of {questions.length} answered
        </p>
        <Button
          onClick={handleSubmit}
          loading={submitting}
          disabled={Object.keys(answers).length < questions.length}
          size="lg"
        >
          Submit Assessment
        </Button>
      </div>
    </div>
  );
}
