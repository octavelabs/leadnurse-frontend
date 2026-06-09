import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getLessonById } from '../../api/lessonApi';
import { markLessonComplete } from '../../api/progressApi';
import { getChapterQuiz, submitChapterQuiz } from '../../api/chapterApi';

// ─── Theme helpers ────────────────────────────────────────────────────────────

const THEME_BG = {
  white:   'bg-white text-gray-900',
  blue:    'bg-gradient-to-br from-blue-600 to-blue-800 text-white',
  dark:    'bg-gray-900 text-white',
  purple:  'bg-gradient-to-br from-purple-700 to-purple-900 text-white',
  emerald: 'bg-gradient-to-br from-emerald-600 to-emerald-800 text-white',
};
const THEME_ACCENT = {
  white:   'bg-blue-600',
  blue:    'bg-white/20',
  dark:    'bg-blue-500',
  purple:  'bg-white/20',
  emerald: 'bg-white/20',
};
const THEME_MUTED = {
  white:   'text-gray-500',
  blue:    'text-blue-200',
  dark:    'text-gray-400',
  purple:  'text-purple-200',
  emerald: 'text-emerald-200',
};

// ─── Slide renderers ──────────────────────────────────────────────────────────

function TitleSlide({ slide }) {
  const bg = THEME_BG[slide.backgroundTheme] || THEME_BG.blue;
  return (
    <div className={`w-full h-full flex flex-col items-center justify-center text-center p-10 ${bg}`}>
      <div className="max-w-2xl">
        <h1 className="text-4xl lg:text-5xl font-extrabold leading-tight tracking-tight">{slide.title}</h1>
        {slide.content && <p className={`mt-5 text-lg lg:text-xl leading-relaxed ${THEME_MUTED[slide.backgroundTheme] || 'text-gray-400'}`}>{slide.content}</p>}
      </div>
    </div>
  );
}

function ContentSlide({ slide }) {
  const bg = THEME_BG[slide.backgroundTheme] || THEME_BG.white;
  const accent = THEME_ACCENT[slide.backgroundTheme] || THEME_ACCENT.white;
  return (
    <div className={`w-full h-full flex flex-col p-8 lg:p-12 ${bg}`}>
      <div className={`w-12 h-1.5 rounded-full mb-6 ${accent}`} />
      {slide.title && <h2 className="text-2xl lg:text-3xl font-bold mb-5 leading-snug">{slide.title}</h2>}
      <div className={`flex-1 overflow-y-auto text-base lg:text-lg leading-relaxed ${THEME_MUTED[slide.backgroundTheme] || 'text-gray-600'} whitespace-pre-line`}>
        {slide.content}
      </div>
    </div>
  );
}

function BulletSlide({ slide }) {
  const bg = THEME_BG[slide.backgroundTheme] || THEME_BG.white;
  const accent = THEME_ACCENT[slide.backgroundTheme] || THEME_ACCENT.white;
  const muted = THEME_MUTED[slide.backgroundTheme] || 'text-gray-400';
  const points = (slide.bulletPoints || []).filter(Boolean);
  return (
    <div className={`w-full h-full flex flex-col p-8 lg:p-12 ${bg}`}>
      <div className={`w-12 h-1.5 rounded-full mb-6 ${accent}`} />
      {slide.title && <h2 className="text-2xl lg:text-3xl font-bold mb-6 leading-snug">{slide.title}</h2>}
      <ul className="flex-1 space-y-4">
        {points.map((point, i) => (
          <li key={i} className="flex items-start gap-4">
            <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5 ${accent}`}>
              {i + 1}
            </span>
            <span className="text-base lg:text-lg leading-relaxed">{point}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ImageSlide({ slide }) {
  const bg = THEME_BG[slide.backgroundTheme] || THEME_BG.white;
  return (
    <div className={`w-full h-full flex flex-col items-center justify-center p-6 ${bg}`}>
      {slide.imageUrl && (
        <img
          src={slide.imageUrl}
          alt={slide.title || 'Slide image'}
          className="max-h-[65%] max-w-full object-contain rounded-xl shadow-lg mb-4"
        />
      )}
      {slide.title && <h3 className="text-xl font-semibold text-center">{slide.title}</h3>}
      {slide.content && <p className={`mt-2 text-sm text-center ${THEME_MUTED[slide.backgroundTheme] || 'text-gray-500'}`}>{slide.content}</p>}
    </div>
  );
}

function QuoteSlide({ slide }) {
  const bg = THEME_BG[slide.backgroundTheme] || THEME_BG.dark;
  const muted = THEME_MUTED[slide.backgroundTheme] || 'text-gray-400';
  return (
    <div className={`w-full h-full flex flex-col items-center justify-center text-center p-10 lg:p-16 ${bg}`}>
      <div className="text-6xl opacity-30 leading-none mb-4">"</div>
      <blockquote className="text-2xl lg:text-3xl font-light leading-relaxed italic max-w-2xl">
        {slide.content}
      </blockquote>
      {slide.title && <p className={`mt-6 text-base font-medium ${muted}`}>— {slide.title}</p>}
    </div>
  );
}

function SlideRenderer({ slide }) {
  if (!slide) return null;
  const type = slide.slideType || 'CONTENT';
  if (type === 'TITLE')       return <TitleSlide slide={slide} />;
  if (type === 'BULLET_LIST') return <BulletSlide slide={slide} />;
  if (type === 'IMAGE')       return <ImageSlide slide={slide} />;
  if (type === 'QUOTE')       return <QuoteSlide slide={slide} />;
  return <ContentSlide slide={slide} />;
}

// ─── Chapter Quiz overlay ─────────────────────────────────────────────────────

function ChapterQuiz({ chapterId, chapterTitle, onPass, onSkip }) {
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getChapterQuiz(chapterId)
      .then((r) => {
        const data = r.data.data;
        setQuiz(data);
        setAnswers(new Array(data.questions.length).fill(-1));
        if (data.previousAttempt?.passed) onPass();
      })
      .catch(() => onSkip())
      .finally(() => setLoading(false));
  }, [chapterId]);

  const handleSubmit = async () => {
    if (answers.some((a) => a === -1)) { toast.error('Please answer all questions'); return; }
    setSubmitting(true);
    try {
      const res = await submitChapterQuiz(chapterId, answers);
      setResult(res.data.data);
    } catch (err) { toast.error('Failed to submit quiz'); } finally { setSubmitting(false); }
  };

  if (loading) return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl my-4">
        {result ? (
          <div className="p-6 text-center">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${result.passed ? 'bg-green-100' : 'bg-red-100'}`}>
              {result.passed
                ? <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                : <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              }
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">{result.passed ? 'Chapter complete!' : 'Not quite right'}</h3>
            <p className="text-gray-500 text-sm mb-4">You scored {Math.round(result.score)}% — {result.passed ? 'well done!' : 'review the answers below and try again.'}</p>
            <div className="text-left space-y-3 mb-6">
              {result.results.map((r, i) => (
                <div key={i} className={`rounded-xl p-3 border ${r.correct ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                  <p className="text-sm font-medium text-gray-900 mb-2">{r.question}</p>
                  {r.options.map((opt, oi) => (
                    <div key={oi} className={`text-xs py-0.5 flex items-center gap-1.5 ${oi === r.correctAnswer ? 'text-green-700 font-semibold' : oi === r.yourAnswer && !r.correct ? 'text-red-600' : 'text-gray-500'}`}>
                      {oi === r.correctAnswer ? '✓' : oi === r.yourAnswer && !r.correct ? '✗' : '○'} {opt}
                    </div>
                  ))}
                  {r.explanation && <p className="text-xs text-gray-500 mt-1 italic">{r.explanation}</p>}
                </div>
              ))}
            </div>
            {result.passed
              ? <button onClick={onPass} className="w-full bg-blue-600 text-white py-3 rounded-xl text-sm font-semibold hover:bg-blue-700">Continue to Next Chapter →</button>
              : <button onClick={() => { setResult(null); setAnswers(new Array(quiz.questions.length).fill(-1)); }} className="w-full bg-gray-800 text-white py-3 rounded-xl text-sm font-semibold hover:bg-gray-900">Try Again</button>
            }
          </div>
        ) : (
          <div className="p-6">
            <div className="text-center mb-5">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900">Chapter Quiz</h3>
              <p className="text-sm text-gray-500 mt-0.5">{chapterTitle} · {quiz?.questions.length} questions</p>
            </div>
            <div className="space-y-5">
              {quiz?.questions.map((q, qi) => (
                <div key={q.id}>
                  <p className="text-sm font-semibold text-gray-900 mb-2">Q{qi + 1}. {q.question}</p>
                  <div className="space-y-1.5">
                    {q.options.map((opt, oi) => (
                      <button
                        key={oi}
                        type="button"
                        onClick={() => setAnswers((prev) => { const n = [...prev]; n[qi] = oi; return n; })}
                        className={`w-full text-left px-4 py-2.5 rounded-xl border-2 text-sm transition-colors ${answers[qi] === oi ? 'border-blue-500 bg-blue-50 text-blue-800 font-medium' : 'border-gray-200 hover:border-gray-300 text-gray-700'}`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={handleSubmit} disabled={submitting || answers.some((a) => a === -1)} className="flex-1 bg-purple-600 text-white py-3 rounded-xl text-sm font-semibold hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center gap-2">
                {submitting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                {submitting ? 'Submitting…' : 'Submit Answers'}
              </button>
              <button onClick={onSkip} className="px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-500 hover:bg-gray-50">Skip</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main viewer ──────────────────────────────────────────────────────────────

export default function LessonViewerPage() {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setShowQuiz(false);
    getLessonById(lessonId)
      .then((res) => setLesson(res.data.data))
      .catch(() => toast.error('Failed to load slide'))
      .finally(() => setLoading(false));
  }, [lessonId]);

  useEffect(() => { load(); window.scrollTo({ top: 0 }); }, [load]);

  const markComplete = async () => {
    if (lesson?.progress?.completed || marking) return;
    setMarking(true);
    try {
      await markLessonComplete(lessonId);
      setLesson((prev) => ({ ...prev, progress: { ...prev?.progress, completed: true } }));
    } catch { } finally { setMarking(false); }
  };

  const goToSlide = async (id) => {
    await markComplete();
    navigate(`/courses/${courseId}/lessons/${id}`);
  };

  const handleNext = async () => {
    await markComplete();
    const nav = lesson?.navigation;
    if (nav?.nextLessonId) {
      navigate(`/courses/${courseId}/lessons/${nav.nextLessonId}`);
    } else if (nav?.isLastInChapter && nav?.hasChapterQuiz && !nav?.chapterQuizPassed) {
      setShowQuiz(true);
    } else {
      navigate(`/courses/${courseId}/assessment`);
    }
  };

  const handleQuizPass = () => {
    setShowQuiz(false);
    navigate(`/courses/${courseId}/assessment`);
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!lesson) return <div className="text-center py-16 text-gray-500">Slide not found.</div>;

  const { navigation, progress, chapter } = lesson;
  const isCompleted = progress?.completed;
  const isLastSlide = !navigation?.nextLessonId;
  const chapterSlides = chapter?.lessons || [];

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-h-[800px]">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-200 px-4 py-2.5 flex items-center gap-3 flex-shrink-0">
        <Link to={`/courses/${courseId}`} className="text-gray-400 hover:text-gray-600 flex-shrink-0">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </Link>
        <div className="flex-1 min-w-0">
          {chapter && <p className="text-xs text-gray-400 truncate">{chapter.title}</p>}
          <p className="text-sm font-semibold text-gray-900 truncate">{lesson.title}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {isCompleted && (
            <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              Done
            </span>
          )}
          <span className="text-xs text-gray-400">{navigation?.current}/{navigation?.total}</span>
        </div>
      </div>

      {/* Progress dots (slides in chapter) */}
      {chapterSlides.length > 1 && (
        <div className="bg-white border-b border-gray-100 px-4 py-1.5 flex items-center gap-1.5 overflow-x-auto flex-shrink-0">
          {chapterSlides.map((s, i) => (
            <button
              key={s.id}
              onClick={() => s.id !== lessonId && goToSlide(s.id)}
              className={`h-1.5 rounded-full transition-all ${s.id === lessonId ? 'w-6 bg-blue-600' : 'w-1.5 bg-gray-200 hover:bg-gray-400'}`}
              title={s.title}
            />
          ))}
        </div>
      )}

      {/* Slide area */}
      <div className="flex-1 overflow-hidden relative">
        <SlideRenderer slide={lesson} />
      </div>

      {/* Bottom navigation */}
      <div className="bg-white border-t border-gray-200 px-4 py-3 flex items-center justify-between flex-shrink-0">
        <button
          onClick={() => navigation?.prevLessonId && goToSlide(navigation.prevLessonId)}
          disabled={!navigation?.prevLessonId}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Previous
        </button>

        <div className="text-xs text-gray-400">{navigation?.current} of {navigation?.total}</div>

        {isLastSlide && navigation?.hasChapterQuiz && !navigation?.chapterQuizPassed ? (
          <button
            onClick={async () => { await markComplete(); setShowQuiz(true); }}
            className="flex items-center gap-2 px-5 py-2 text-sm font-semibold bg-purple-600 text-white rounded-xl hover:bg-purple-700"
          >
            Chapter Quiz
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
        ) : isLastSlide ? (
          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-5 py-2 text-sm font-semibold bg-emerald-600 text-white rounded-xl hover:bg-emerald-700"
          >
            Take Final Assessment
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-5 py-2 text-sm font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700"
          >
            Next
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
        )}
      </div>

      {showQuiz && lesson.chapter && (
        <ChapterQuiz
          chapterId={lesson.chapter.id}
          chapterTitle={lesson.chapter.title}
          onPass={handleQuizPass}
          onSkip={() => { setShowQuiz(false); navigate(`/courses/${courseId}/assessment`); }}
        />
      )}
    </div>
  );
}
