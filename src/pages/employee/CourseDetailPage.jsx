import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getCourseById } from '../../api/courseApi';
import { getChaptersByCourse } from '../../api/chapterApi';
import { enrollInCourse } from '../../api/enrollmentApi';
import Badge from '../../components/common/Badge';
import ProgressBar from '../../components/dashboard/ProgressBar';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const SLIDE_TYPE_ICONS = {
  TITLE:       '🎯',
  CONTENT:     '📄',
  BULLET_LIST: '📋',
  IMAGE:       '🖼',
  QUOTE:       '💬',
};

export default function CourseDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [expandedChapter, setExpandedChapter] = useState(null);

  const load = async () => {
    const [c, ch] = await Promise.all([getCourseById(id), getChaptersByCourse(id).catch(() => ({ data: { data: [] } }))]);
    setCourse(c.data.data);
    const chapterData = ch.data.data || [];
    setChapters(chapterData);
    if (chapterData.length > 0) setExpandedChapter(chapterData[0].id);
    setLoading(false);
  };

  useEffect(() => { load(); }, [id]);

  const handleEnroll = async () => {
    setEnrolling(true);
    try {
      await enrollInCourse(id);
      toast.success('Enrolled successfully!');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Enrollment failed');
    } finally { setEnrolling(false); }
  };

  if (loading) return <LoadingSpinner />;
  if (!course) return <div className="text-center py-16 text-gray-500">Course not found.</div>;

  const enrolled = !!course.enrollment;
  const completedCount = course.progress?.filter((p) => p.completed).length ?? 0;
  const totalSlides = chapters.reduce((s, c) => s + c.lessons.length, 0) || (course.lessons?.length ?? 0);

  // Find the first incomplete slide for "Continue" button
  const completedIds = new Set((course.progress || []).filter((p) => p.completed).map((p) => p.lessonId));
  let resumeSlide = null;
  for (const ch of chapters) {
    for (const slide of ch.lessons) {
      if (!completedIds.has(slide.id)) { resumeSlide = slide; break; }
    }
    if (resumeSlide) break;
  }
  if (!resumeSlide && chapters.length === 0) resumeSlide = course.lessons?.[0];

  const usesChapters = chapters.length > 0;

  return (
    <div className="space-y-6">
      <div>
        <Link to="/courses" className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1 mb-4">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back to courses
        </Link>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{course.title}</h1>
              <p className="text-gray-600">{course.description}</p>
            </div>
            {enrolled ? <Badge variant="green">Enrolled</Badge> : (
              <button onClick={handleEnroll} disabled={enrolling} className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 disabled:opacity-50">
                {enrolling ? 'Enrolling…' : 'Enrol Now'}
              </button>
            )}
          </div>

          {enrolled && (
            <div className="mt-5 p-4 bg-gray-50 rounded-xl">
              <ProgressBar value={completedCount} max={totalSlides} label={`${completedCount} of ${totalSlides} slides completed`} size="lg" />
            </div>
          )}

          <div className="mt-5 flex flex-wrap gap-4 text-sm text-gray-600">
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
              {usesChapters ? `${chapters.length} chapters` : `${totalSlides} lessons`}
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
              {totalSlides} slides
            </span>
            {chapters.filter((c) => c.quiz).length > 0 && (
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                {chapters.filter((c) => c.quiz).length} chapter quizzes
              </span>
            )}
            {course.assessment && (
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Final assessment ({course.assessment.passScore}% to pass)
              </span>
            )}
          </div>
        </div>
      </div>

      {enrolled && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Course Content</h2>
            {resumeSlide && (
              <button
                onClick={() => navigate(`/courses/${id}/lessons/${resumeSlide.id}`)}
                className="px-4 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
              >
                {completedCount > 0 ? 'Continue' : 'Start Course'}
              </button>
            )}
          </div>

          {usesChapters ? (
            <div className="divide-y divide-gray-100">
              {chapters.map((ch, ci) => {
                const chCompleted = ch.lessons.filter((l) => completedIds.has(l.id)).length;
                const isExpanded = expandedChapter === ch.id;
                return (
                  <div key={ch.id}>
                    <button
                      onClick={() => setExpandedChapter(isExpanded ? null : ch.id)}
                      className="w-full flex items-center gap-4 px-6 py-4 hover:bg-gray-50 text-left transition-colors"
                    >
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 ${chCompleted === ch.lessons.length && ch.lessons.length > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                        {chCompleted === ch.lessons.length && ch.lessons.length > 0
                          ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                          : ci + 1
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900">{ch.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{ch.lessons.length} slides{ch.quiz ? ' · quiz' : ''} · {chCompleted}/{ch.lessons.length} done</p>
                      </div>
                      <svg className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </button>

                    {isExpanded && (
                      <div className="bg-gray-50 border-t border-gray-100">
                        {ch.lessons.map((slide, si) => {
                          const isDone = completedIds.has(slide.id);
                          return (
                            <button
                              key={slide.id}
                              onClick={() => navigate(`/courses/${id}/lessons/${slide.id}`)}
                              className="w-full flex items-center gap-3 px-8 py-2.5 hover:bg-blue-50 text-left transition-colors"
                            >
                              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 ${isDone ? 'bg-emerald-100 text-emerald-600' : 'bg-white border border-gray-200 text-gray-400'}`}>
                                {isDone ? '✓' : si + 1}
                              </span>
                              <span className="mr-1">{SLIDE_TYPE_ICONS[slide.slideType] || '📄'}</span>
                              <span className={`text-sm flex-1 ${isDone ? 'text-gray-400 line-through' : 'text-gray-700'}`}>{slide.title}</span>
                            </button>
                          );
                        })}
                        {ch.quiz && (
                          <div className="flex items-center gap-3 px-8 py-2.5 text-xs text-purple-600 font-medium">
                            <span>✦</span>
                            <span>Chapter Quiz ({ch.quiz.questions?.length} questions)</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {course.lessons?.map((lesson) => {
                const isDone = completedIds.has(lesson.id);
                return (
                  <li key={lesson.id}>
                    <button
                      onClick={() => navigate(`/courses/${id}/lessons/${lesson.id}`)}
                      className="w-full flex items-center gap-4 px-6 py-3.5 hover:bg-gray-50 text-left transition-colors"
                    >
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-semibold ${isDone ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                        {isDone ? <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg> : lesson.order}
                      </div>
                      <span className={`text-sm ${isDone ? 'text-gray-400 line-through' : 'text-gray-800 font-medium'}`}>{lesson.title}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          {course.assessment && (
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900 text-sm">Final Assessment</p>
                <p className="text-xs text-gray-500">Pass with {course.assessment.passScore}% or higher to earn your certificate</p>
              </div>
              <button onClick={() => navigate(`/courses/${id}/assessment`)} className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-white transition-colors">
                Take Assessment
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
