import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getLessonById } from '../../api/lessonApi';
import { markLessonComplete } from '../../api/progressApi';
import { getChapterQuiz, submitChapterQuiz } from '../../api/chapterApi';

// ─── Theme helpers ────────────────────────────────────────────────────────────

const THEME_BG = {
  white:   'bg-white text-gray-900',
  blue:    'bg-gradient-to-br from-primary-700 to-primary-800 text-white',
  dark:    'bg-gray-900 text-white',
  purple:  'bg-gradient-to-br from-purple-700 to-purple-900 text-white',
  emerald: 'bg-gradient-to-br from-emerald-600 to-emerald-800 text-white',
};
const THEME_ACCENT = {
  white:   'bg-primary-700',
  blue:    'bg-white/20',
  dark:    'bg-primary-600',
  purple:  'bg-white/20',
  emerald: 'bg-white/20',
};
const THEME_MUTED = {
  white:   'text-gray-500',
  blue:    'text-primary-200',
  dark:    'text-gray-400',
  purple:  'text-purple-200',
  emerald: 'text-emerald-200',
};

// ─── Slide renderers ──────────────────────────────────────────────────────────

function TitleSlide({ slide }) {
  const bg = THEME_BG[slide.backgroundTheme] || THEME_BG.blue;
  const muted = THEME_MUTED[slide.backgroundTheme] || 'text-primary-200';
  return (
    <div className={`w-full h-full flex flex-col items-center justify-center text-center p-10 ${bg}`}>
      <div className="max-w-2xl">
        <h1 className="text-4xl lg:text-5xl font-extrabold leading-tight tracking-tight">{slide.title}</h1>
        {slide.content && <p className={`mt-5 text-lg lg:text-xl leading-relaxed ${muted}`}>{slide.content}</p>}
      </div>
    </div>
  );
}

function ContentSlide({ slide }) {
  const bg = THEME_BG[slide.backgroundTheme] || THEME_BG.white;
  const accent = THEME_ACCENT[slide.backgroundTheme] || THEME_ACCENT.white;
  const muted = THEME_MUTED[slide.backgroundTheme] || 'text-gray-600';
  return (
    <div className={`w-full h-full flex flex-col p-8 lg:p-12 ${bg}`}>
      <div className={`w-12 h-1.5 rounded-full mb-6 ${accent}`} />
      {slide.title && <h2 className="text-2xl lg:text-3xl font-bold mb-5 leading-snug">{slide.title}</h2>}
      <div className={`flex-1 overflow-y-auto text-base lg:text-lg leading-relaxed ${muted} whitespace-pre-line`}>
        {slide.content}
      </div>
    </div>
  );
}

function BulletSlide({ slide }) {
  const bg = THEME_BG[slide.backgroundTheme] || THEME_BG.white;
  const accent = THEME_ACCENT[slide.backgroundTheme] || THEME_ACCENT.white;
  const points = (slide.bulletPoints || []).filter(Boolean);
  return (
    <div className={`w-full h-full flex flex-col p-8 lg:p-12 ${bg}`}>
      <div className={`w-12 h-1.5 rounded-full mb-6 ${accent}`} />
      {slide.title && <h2 className="text-2xl lg:text-3xl font-bold mb-6 leading-snug">{slide.title}</h2>}
      <ul className="flex-1 space-y-4 overflow-y-auto">
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
  const muted = THEME_MUTED[slide.backgroundTheme] || 'text-gray-500';
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
      {slide.content && <p className={`mt-2 text-sm text-center ${muted}`}>{slide.content}</p>}
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

// ─── Chapter Quiz overlay ──────────────────────────────────────────────────────

function ChapterQuiz({ chapterId, chapterTitle, onPass, onSkip }) {
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
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
    setSubmitting(true);
    try {
      const res = await submitChapterQuiz(chapterId, answers);
      setResult(res.data.data);
    } catch { toast.error('Failed to submit quiz'); } finally { setSubmitting(false); }
  };

  if (loading) return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const questions = quiz?.questions ?? [];
  const currentQuestion = questions[currentIndex];
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === questions.length - 1;
  const currentAnswered = answers[currentIndex] !== -1;
  const allAnswered = answers.every((a) => a !== -1);

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
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
            <div className="text-left space-y-3 mb-6 max-h-64 overflow-y-auto">
              {result.results.map((r, i) => (
                <div key={i} className={`rounded-xl p-3 border ${r.correct ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                  <p className="text-sm font-medium text-gray-900 mb-2">{r.question}</p>
                  {r.options.map((opt, oi) => (
                    <div key={oi} className={`text-xs py-0.5 flex items-center gap-1.5 ${oi === r.correctAnswer ? 'text-green-700 font-semibold' : oi === r.yourAnswer && !r.correct ? 'text-red-600' : 'text-gray-500'}`}>
                      {oi === r.correctAnswer ? '✓' : oi === r.yourAnswer && !r.correct ? '✗' : '·'} {opt}
                    </div>
                  ))}
                  {r.explanation && <p className="text-xs text-gray-500 mt-1 italic">{r.explanation}</p>}
                </div>
              ))}
            </div>
            {result.passed
              ? <button onClick={onPass} className="w-full bg-primary-700 text-white py-3 rounded-xl text-sm font-semibold hover:bg-primary-800">Continue →</button>
              : <button onClick={() => { setResult(null); setAnswers(new Array(questions.length).fill(-1)); setCurrentIndex(0); }} className="w-full bg-gray-800 text-white py-3 rounded-xl text-sm font-semibold hover:bg-gray-900">Try Again</button>
            }
          </div>
        ) : (
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-gray-900">Chapter Quiz</h3>
                <p className="text-xs text-gray-500">{chapterTitle}</p>
              </div>
              <button onClick={onSkip} className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1">Skip</button>
            </div>

            {/* Progress dots */}
            <div className="flex items-center gap-1.5 mb-5">
              {questions.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all ${
                    i === currentIndex ? 'w-5 bg-purple-600' : answers[i] !== -1 ? 'w-2 bg-purple-300' : 'w-2 bg-gray-200'
                  }`}
                />
              ))}
              <span className="ml-1 text-xs text-gray-400">Q{currentIndex + 1}/{questions.length}</span>
            </div>

            {/* Question */}
            <p className="text-sm font-semibold text-gray-900 mb-4 leading-snug">{currentQuestion?.question}</p>

            {/* Options */}
            <div className="space-y-2 mb-6">
              {currentQuestion?.options.map((opt, oi) => (
                <button
                  key={oi}
                  type="button"
                  onClick={() => setAnswers((prev) => { const n = [...prev]; n[currentIndex] = oi; return n; })}
                  className={`w-full text-left px-4 py-3 rounded-xl border-2 text-sm transition-colors ${
                    answers[currentIndex] === oi
                      ? 'border-purple-500 bg-purple-50 text-purple-900 font-medium'
                      : 'border-gray-200 hover:border-purple-300 text-gray-700'
                  }`}
                >
                  <span className="font-semibold mr-2">{String.fromCharCode(65 + oi)}.</span>
                  {opt}
                </button>
              ))}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between gap-3">
              <button
                onClick={() => setCurrentIndex((i) => i - 1)}
                disabled={isFirst}
                className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                Back
              </button>

              {isLast ? (
                <button
                  onClick={handleSubmit}
                  disabled={submitting || !allAnswered}
                  className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white text-sm font-semibold rounded-xl hover:bg-purple-700 disabled:opacity-50 flex-1 justify-center"
                >
                  {submitting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  {submitting ? 'Submitting…' : 'Submit Quiz'}
                </button>
              ) : (
                <button
                  onClick={() => setCurrentIndex((i) => i + 1)}
                  disabled={!currentAnswered}
                  className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white text-sm font-semibold rounded-xl hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed flex-1 justify-center"
                >
                  Next
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
              )}
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
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [marking, setMarking] = useState(false);
  const [lessonCompleted, setLessonCompleted] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setCurrentSlideIndex(0);
    setShowQuiz(false);
    getLessonById(lessonId)
      .then((res) => {
        const data = res.data.data;
        setLesson(data);
        setLessonCompleted(data.progress?.completed || false);
      })
      .catch(() => toast.error('Failed to load lesson'))
      .finally(() => setLoading(false));
  }, [lessonId]);

  useEffect(() => { load(); window.scrollTo({ top: 0 }); }, [load]);

  const markComplete = useCallback(async () => {
    if (lessonCompleted || marking) return;
    setMarking(true);
    try {
      await markLessonComplete(lessonId);
      setLessonCompleted(true);
    } catch { } finally { setMarking(false); }
  }, [lessonId, lessonCompleted, marking]);

  const handleAfterLesson = useCallback(async () => {
    await markComplete();
    const nav = lesson?.navigation;
    if (nav?.nextLessonId) {
      navigate(`/courses/${courseId}/lessons/${nav.nextLessonId}`);
    } else if (nav?.isLastInChapter && nav?.hasChapterQuiz && !nav?.chapterQuizPassed) {
      setShowQuiz(true);
    } else if (nav?.nextChapterFirstLessonId) {
      navigate(`/courses/${courseId}/lessons/${nav.nextChapterFirstLessonId}`);
    } else {
      navigate(`/courses/${courseId}/assessment`);
    }
  }, [lesson, lessonCompleted, marking, courseId, navigate]);

  const handleQuizPass = useCallback(() => {
    setShowQuiz(false);
    const nav = lesson?.navigation;
    if (nav?.nextChapterFirstLessonId) {
      navigate(`/courses/${courseId}/lessons/${nav.nextChapterFirstLessonId}`);
    } else {
      navigate(`/courses/${courseId}/assessment`);
    }
  }, [lesson, courseId, navigate]);

  const handleQuizSkip = useCallback(() => {
    setShowQuiz(false);
    const nav = lesson?.navigation;
    if (nav?.nextChapterFirstLessonId) {
      navigate(`/courses/${courseId}/lessons/${nav.nextChapterFirstLessonId}`);
    } else {
      navigate(`/courses/${courseId}/assessment`);
    }
  }, [lesson, courseId, navigate]);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-primary-700 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!lesson) return <div className="text-center py-16 text-gray-500">Lesson not found.</div>;

  // Slides to show: use lesson.slides if populated, else treat lesson itself as one slide
  const slides = lesson.slides?.length > 0 ? lesson.slides : [lesson];
  const currentSlide = slides[currentSlideIndex];
  const isFirstSlide = currentSlideIndex === 0;
  const isLastSlide = currentSlideIndex === slides.length - 1;

  const { navigation, chapter } = lesson;

  // Label for the last-slide "continue" button
  const continueLabel = navigation?.nextLessonId
    ? 'Next Lesson'
    : navigation?.isLastInChapter && navigation?.hasChapterQuiz && !navigation?.chapterQuizPassed
      ? 'Chapter Quiz'
      : navigation?.nextChapterFirstLessonId
        ? 'Next Chapter'
        : 'Final Assessment';

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 4rem)' }}>
      {/* Top bar */}
      <div className="bg-white border-b border-gray-200 px-4 py-2.5 flex items-center gap-3 flex-shrink-0">
        <Link to={`/courses/${courseId}`} className="text-gray-400 hover:text-gray-600 flex-shrink-0">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </Link>
        <div className="flex-1 min-w-0">
          {chapter && <p className="text-xs text-gray-400 truncate">{chapter.title}</p>}
          <p className="text-sm font-semibold text-gray-900 truncate">{lesson.title}</p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          {lessonCompleted && (
            <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              Done
            </span>
          )}
          {slides.length > 1 && (
            <span className="text-xs text-gray-400">
              Slide {currentSlideIndex + 1}/{slides.length}
            </span>
          )}
          <span className="text-xs text-gray-400 border-l border-gray-200 pl-3">
            Lesson {navigation?.current}/{navigation?.total}
          </span>
        </div>
      </div>

      {/* Slide progress dots */}
      {slides.length > 1 && (
        <div className="bg-white border-b border-gray-100 px-4 py-2 flex items-center gap-1.5 overflow-x-auto flex-shrink-0">
          {slides.map((s, i) => (
            <button
              key={s.id || i}
              onClick={() => setCurrentSlideIndex(i)}
              className={`h-1.5 rounded-full transition-all flex-shrink-0 ${i === currentSlideIndex ? 'w-6 bg-primary-700' : i < currentSlideIndex ? 'w-2 bg-primary-300' : 'w-2 bg-gray-200 hover:bg-gray-400'}`}
              title={s.title}
            />
          ))}
        </div>
      )}

      {/* Slide area */}
      <div className="flex-1 overflow-hidden relative">
        <SlideRenderer slide={currentSlide} />
      </div>

      {/* Bottom navigation */}
      <div className="bg-white border-t border-gray-200 px-4 py-3 flex items-center justify-between flex-shrink-0">
        {/* Previous button */}
        <button
          onClick={() => {
            if (!isFirstSlide) {
              setCurrentSlideIndex((i) => i - 1);
            } else if (navigation?.prevLessonId) {
              navigate(`/courses/${courseId}/lessons/${navigation.prevLessonId}`);
            }
          }}
          disabled={isFirstSlide && !navigation?.prevLessonId}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          {isFirstSlide && navigation?.prevLessonId ? 'Prev Lesson' : 'Previous'}
        </button>

        <div className="text-xs text-gray-400 text-center">
          {slides.length > 1
            ? `${currentSlideIndex + 1} of ${slides.length} slides`
            : `Lesson ${navigation?.current} of ${navigation?.total}`}
        </div>

        {/* Next / Complete button */}
        {!isLastSlide ? (
          <button
            onClick={() => setCurrentSlideIndex((i) => i + 1)}
            className="flex items-center gap-2 px-5 py-2 text-sm font-semibold bg-primary-700 text-white rounded-xl hover:bg-primary-800"
          >
            Next
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
        ) : continueLabel === 'Chapter Quiz' ? (
          <button
            onClick={handleAfterLesson}
            className="flex items-center gap-2 px-5 py-2 text-sm font-semibold bg-purple-600 text-white rounded-xl hover:bg-purple-700"
          >
            {continueLabel}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
        ) : continueLabel === 'Final Assessment' ? (
          <button
            onClick={handleAfterLesson}
            className="flex items-center gap-2 px-5 py-2 text-sm font-semibold bg-emerald-600 text-white rounded-xl hover:bg-emerald-700"
          >
            {continueLabel}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
        ) : (
          <button
            onClick={handleAfterLesson}
            className="flex items-center gap-2 px-5 py-2 text-sm font-semibold bg-primary-700 text-white rounded-xl hover:bg-primary-800"
          >
            {continueLabel}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
        )}
      </div>

      {showQuiz && chapter && (
        <ChapterQuiz
          chapterId={chapter.id}
          chapterTitle={chapter.title}
          onPass={handleQuizPass}
          onSkip={handleQuizSkip}
        />
      )}
    </div>
  );
}
