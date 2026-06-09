import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getCourseById } from '../../api/courseApi';
import { createLesson, updateLesson, deleteLesson } from '../../api/lessonApi';
import { getChaptersByCourse, createChapter, updateChapter, deleteChapter, upsertChapterQuiz } from '../../api/chapterApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const SLIDE_TYPES = [
  { value: 'TITLE', label: 'Title Slide', icon: 'T', desc: 'Big heading + subtitle, full-colour background' },
  { value: 'CONTENT', label: 'Content', icon: '¶', desc: 'Heading + rich text body' },
  { value: 'BULLET_LIST', label: 'Key Points', icon: '•', desc: 'List of bullet points' },
  { value: 'IMAGE', label: 'Image', icon: '🖼', desc: 'Image with optional caption' },
  { value: 'QUOTE', label: 'Quote', icon: '"', desc: 'Pull quote with attribution' },
];

const THEMES = [
  { value: 'white',   label: 'Clean White',    bg: 'bg-white border border-gray-200',       text: 'text-gray-900' },
  { value: 'blue',    label: 'Lead Blue',      bg: 'bg-blue-600',                           text: 'text-white' },
  { value: 'dark',    label: 'Dark',           bg: 'bg-gray-900',                           text: 'text-white' },
  { value: 'purple',  label: 'Purple',         bg: 'bg-purple-700',                         text: 'text-white' },
  { value: 'emerald', label: 'Emerald',        bg: 'bg-emerald-600',                        text: 'text-white' },
];

function SlideFormFields({ slide, onChange }) {
  const set = (f, v) => onChange({ ...slide, [f]: v });

  return (
    <div className="space-y-3">
      {/* Slide type */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1.5">Slide Type</label>
        <div className="grid grid-cols-5 gap-1.5">
          {SLIDE_TYPES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => set('slideType', t.value)}
              className={`p-2 rounded-lg border-2 text-center transition-colors ${slide.slideType === t.value ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
              title={t.desc}
            >
              <div className="text-lg leading-none mb-1">{t.icon}</div>
              <div className="text-xs font-medium text-gray-700 leading-tight">{t.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Background theme */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1.5">Background Theme</label>
        <div className="flex gap-2 flex-wrap">
          {THEMES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => set('backgroundTheme', t.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border-2 transition-colors ${t.bg} ${t.text} ${slide.backgroundTheme === t.value ? 'ring-2 ring-offset-1 ring-blue-500' : 'opacity-70 hover:opacity-100'}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Title (always visible) */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">
          {slide.slideType === 'QUOTE' ? 'Attribution / Speaker' : 'Slide Title'}
        </label>
        <input
          value={slide.title}
          onChange={(e) => set('title', e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder={slide.slideType === 'TITLE' ? 'Chapter or topic title…' : slide.slideType === 'QUOTE' ? 'e.g. — Florence Nightingale' : 'Slide heading…'}
        />
      </div>

      {/* Content field — varies by type */}
      {slide.slideType === 'BULLET_LIST' ? (
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Bullet Points <span className="text-gray-400 font-normal">(one per line)</span></label>
          <textarea
            rows={6}
            value={(slide.bulletPoints || []).join('\n')}
            onChange={(e) => set('bulletPoints', e.target.value.split('\n'))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            placeholder={'Key point one\nKey point two\nKey point three'}
          />
        </div>
      ) : slide.slideType === 'IMAGE' ? (
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Image URL</label>
          <input
            value={slide.imageUrl || ''}
            onChange={(e) => set('imageUrl', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="https://…"
          />
          <label className="block text-xs font-medium text-gray-500 mb-1 mt-2">Caption <span className="text-gray-400 font-normal">(optional)</span></label>
          <input
            value={slide.content}
            onChange={(e) => set('content', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Image caption…"
          />
        </div>
      ) : slide.slideType === 'TITLE' ? (
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Subtitle <span className="text-gray-400 font-normal">(optional)</span></label>
          <input
            value={slide.content}
            onChange={(e) => set('content', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Optional supporting text below the title…"
          />
        </div>
      ) : (
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            {slide.slideType === 'QUOTE' ? 'Quote Text' : 'Content'}
          </label>
          <textarea
            rows={7}
            value={slide.content}
            onChange={(e) => set('content', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={slide.slideType === 'QUOTE' ? '"The nurse is the key worker in healthcare delivery…"' : 'Slide content…'}
          />
        </div>
      )}
    </div>
  );
}

function QuizEditor({ chapterId, existingQuiz, onSaved }) {
  const [questions, setQuestions] = useState(
    existingQuiz?.questions?.length > 0
      ? existingQuiz.questions.map((q) => ({ question: q.question, options: q.options, correctAnswer: q.correctAnswer, explanation: q.explanation || '' }))
      : [{ question: '', options: ['', '', '', ''], correctAnswer: 0, explanation: '' }]
  );
  const [saving, setSaving] = useState(false);

  const addQuestion = () => {
    if (questions.length >= 5) return;
    setQuestions((prev) => [...prev, { question: '', options: ['', '', '', ''], correctAnswer: 0, explanation: '' }]);
  };
  const removeQuestion = (i) => setQuestions((prev) => prev.filter((_, j) => j !== i));
  const setQ = (i, field, val) => setQuestions((prev) => prev.map((q, j) => j === i ? { ...q, [field]: val } : q));
  const setOpt = (qi, oi, val) => setQuestions((prev) => prev.map((q, j) => j === qi ? { ...q, options: q.options.map((o, k) => k === oi ? val : o) } : q));

  const handleSave = async () => {
    const valid = questions.every((q) => q.question.trim() && q.options.every((o) => o.trim()));
    if (!valid) { toast.error('Fill in all questions and options'); return; }
    setSaving(true);
    try {
      const res = await upsertChapterQuiz(chapterId, questions);
      onSaved(res.data.data);
      toast.success('Quiz saved');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save quiz');
    } finally { setSaving(false); }
  };

  return (
    <div className="space-y-4">
      {questions.map((q, qi) => (
        <div key={qi} className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Question {qi + 1}</span>
            {questions.length > 1 && (
              <button onClick={() => removeQuestion(qi)} className="text-xs text-red-400 hover:text-red-600">Remove</button>
            )}
          </div>
          <input
            value={q.question}
            onChange={(e) => setQ(qi, 'question', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter the question…"
          />
          <div className="space-y-2">
            {q.options.map((opt, oi) => (
              <div key={oi} className="flex items-center gap-2">
                <input
                  type="radio"
                  name={`correct-${qi}`}
                  checked={q.correctAnswer === oi}
                  onChange={() => setQ(qi, 'correctAnswer', oi)}
                  className="accent-green-600 flex-shrink-0"
                  title="Mark as correct answer"
                />
                <input
                  value={opt}
                  onChange={(e) => setOpt(qi, oi, e.target.value)}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={`Option ${oi + 1}${q.correctAnswer === oi ? ' (correct)' : ''}`}
                />
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400">Select the radio button next to the correct answer</p>
          <input
            value={q.explanation}
            onChange={(e) => setQ(qi, 'explanation', e.target.value)}
            className="w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-1.5 text-xs focus:outline-none"
            placeholder="Explanation shown after submission (optional)…"
          />
        </div>
      ))}
      <div className="flex gap-3">
        {questions.length < 5 && (
          <button onClick={addQuestion} className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Add Question
          </button>
        )}
        <button onClick={handleSave} disabled={saving} className="ml-auto bg-green-600 text-white px-4 py-1.5 rounded-lg text-xs font-semibold hover:bg-green-700 disabled:opacity-50 flex items-center gap-1.5">
          {saving && <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />}
          {saving ? 'Saving…' : 'Save Quiz'}
        </button>
      </div>
    </div>
  );
}

function ChapterBlock({ chapter, courseId, onUpdated, onDeleted }) {
  const [expanded, setExpanded] = useState(true);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleVal, setTitleVal] = useState(chapter.title);
  const [showQuiz, setShowQuiz] = useState(false);
  const [addingSlide, setAddingSlide] = useState(false);
  const [editingSlide, setEditingSlide] = useState(null);
  const [newSlide, setNewSlide] = useState({ title: '', content: '', slideType: 'CONTENT', backgroundTheme: 'white', imageUrl: '', bulletPoints: [] });
  const [saving, setSaving] = useState(false);

  const saveTitle = async () => {
    if (!titleVal.trim()) return;
    try {
      const res = await updateChapter(chapter.id, { title: titleVal.trim() });
      onUpdated(res.data.data);
      setEditingTitle(false);
    } catch { toast.error('Failed to update chapter'); }
  };

  const handleAddSlide = async () => {
    if (!newSlide.title.trim()) { toast.error('Slide title is required'); return; }
    setSaving(true);
    try {
      const res = await createLesson({ ...newSlide, courseId, chapterId: chapter.id, order: chapter.lessons.length + 1 });
      onUpdated({ ...chapter, lessons: [...chapter.lessons, res.data.data] });
      setNewSlide({ title: '', content: '', slideType: 'CONTENT', backgroundTheme: 'white', imageUrl: '', bulletPoints: [] });
      setAddingSlide(false);
      toast.success('Slide added');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to add slide'); } finally { setSaving(false); }
  };

  const handleUpdateSlide = async () => {
    if (!editingSlide.title.trim()) { toast.error('Slide title is required'); return; }
    setSaving(true);
    try {
      const res = await updateLesson(editingSlide.id, editingSlide);
      onUpdated({ ...chapter, lessons: chapter.lessons.map((l) => l.id === editingSlide.id ? res.data.data : l) });
      setEditingSlide(null);
      toast.success('Slide updated');
    } catch (err) { toast.error('Failed to update slide'); } finally { setSaving(false); }
  };

  const handleDeleteSlide = async (id) => {
    if (!window.confirm('Delete this slide?')) return;
    try {
      await deleteLesson(id);
      onUpdated({ ...chapter, lessons: chapter.lessons.filter((l) => l.id !== id) });
      toast.success('Slide deleted');
    } catch { toast.error('Failed to delete slide'); }
  };

  const slideThemePill = (theme) => {
    const t = THEMES.find((t) => t.value === theme);
    return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${t?.bg} ${t?.text}`}>{t?.label || theme}</span>;
  };

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
      {/* Chapter header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-200">
        <button onClick={() => setExpanded(!expanded)} className="text-gray-400 hover:text-gray-600">
          <svg className={`w-4 h-4 transition-transform ${expanded ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </button>
        <div className="w-7 h-7 rounded-lg bg-blue-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">Ch</div>
        {editingTitle ? (
          <input
            value={titleVal}
            onChange={(e) => setTitleVal(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') saveTitle(); if (e.key === 'Escape') setEditingTitle(false); }}
            onBlur={saveTitle}
            autoFocus
            className="flex-1 border border-blue-300 rounded-lg px-2 py-1 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        ) : (
          <button className="flex-1 text-left text-sm font-semibold text-gray-900 hover:text-blue-600" onClick={() => setEditingTitle(true)}>
            {chapter.title}
          </button>
        )}
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <span>{chapter.lessons.length} slide{chapter.lessons.length !== 1 ? 's' : ''}</span>
          {chapter.quiz && <span className="text-green-600 font-medium ml-1">· Quiz ✓</span>}
        </div>
        <button onClick={() => { if (window.confirm('Delete this chapter and all its slides?')) onDeleted(chapter.id); }} className="text-gray-300 hover:text-red-500 ml-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
        </button>
      </div>

      {expanded && (
        <div className="p-4 space-y-3">
          {/* Slides list */}
          {chapter.lessons.length === 0 && !addingSlide && (
            <p className="text-sm text-gray-400 text-center py-2">No slides yet. Add your first slide.</p>
          )}
          {chapter.lessons.map((slide, idx) => (
            <div key={slide.id}>
              {editingSlide?.id === slide.id ? (
                <div className="bg-white border border-blue-200 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-blue-600">Editing Slide {idx + 1}</span>
                    <button onClick={() => setEditingSlide(null)} className="text-xs text-gray-400 hover:text-gray-600">Cancel</button>
                  </div>
                  <SlideFormFields slide={editingSlide} onChange={setEditingSlide} />
                  <div className="flex justify-end gap-2">
                    <button onClick={handleUpdateSlide} disabled={saving} className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-xs font-medium hover:bg-blue-700 disabled:opacity-50">
                      {saving ? 'Saving…' : 'Save Slide'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-white border border-gray-100 rounded-xl px-4 py-2.5 flex items-center gap-3">
                  <span className="w-5 h-5 rounded bg-gray-100 text-gray-500 text-xs font-bold flex items-center justify-center flex-shrink-0">{idx + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{slide.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-gray-400">{SLIDE_TYPES.find((t) => t.value === slide.slideType)?.label}</span>
                      {slideThemePill(slide.backgroundTheme)}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => setEditingSlide({ ...slide })} className="text-xs text-blue-500 hover:text-blue-700 px-2 py-1 rounded hover:bg-blue-50">Edit</button>
                    <button onClick={() => handleDeleteSlide(slide.id)} className="text-xs text-red-400 hover:text-red-600 px-2 py-1 rounded hover:bg-red-50">Delete</button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Add slide form */}
          {addingSlide ? (
            <div className="bg-white border border-blue-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-blue-600">New Slide</span>
                <button onClick={() => setAddingSlide(false)} className="text-xs text-gray-400 hover:text-gray-600">Cancel</button>
              </div>
              <SlideFormFields slide={newSlide} onChange={setNewSlide} />
              <div className="flex justify-end gap-2">
                <button onClick={handleAddSlide} disabled={saving} className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-xs font-medium hover:bg-blue-700 disabled:opacity-50">
                  {saving ? 'Adding…' : 'Add Slide'}
                </button>
              </div>
            </div>
          ) : (
            <button onClick={() => setAddingSlide(true)} className="w-full py-2 border-2 border-dashed border-gray-200 rounded-xl text-xs text-gray-400 hover:border-blue-300 hover:text-blue-500 transition-colors">
              + Add Slide
            </button>
          )}

          {/* Chapter quiz */}
          <div className="border-t border-gray-200 pt-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span className="text-xs font-semibold text-gray-700">Chapter Quiz</span>
                {chapter.quiz && <span className="text-xs text-green-600 font-medium">({chapter.quiz.questions?.length} question{chapter.quiz.questions?.length !== 1 ? 's' : ''})</span>}
              </div>
              <button onClick={() => setShowQuiz(!showQuiz)} className="text-xs text-purple-600 hover:underline font-medium">
                {showQuiz ? 'Hide' : chapter.quiz ? 'Edit Quiz' : 'Add Quiz'}
              </button>
            </div>
            {showQuiz && (
              <QuizEditor
                chapterId={chapter.id}
                existingQuiz={chapter.quiz}
                onSaved={(quiz) => { onUpdated({ ...chapter, quiz }); setShowQuiz(false); }}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function LessonManagementPage() {
  const { id: courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingChapter, setAddingChapter] = useState(false);
  const [newChapterTitle, setNewChapterTitle] = useState('');
  const [savingChapter, setSavingChapter] = useState(false);

  useEffect(() => {
    Promise.all([getCourseById(courseId), getChaptersByCourse(courseId)])
      .then(([c, ch]) => { setCourse(c.data.data); setChapters(ch.data.data); })
      .finally(() => setLoading(false));
  }, [courseId]);

  const handleAddChapter = async () => {
    if (!newChapterTitle.trim()) return;
    setSavingChapter(true);
    try {
      const res = await createChapter({ courseId, title: newChapterTitle.trim() });
      setChapters((prev) => [...prev, res.data.data]);
      setNewChapterTitle('');
      setAddingChapter(false);
      toast.success('Chapter added');
    } catch (err) { toast.error('Failed to add chapter'); } finally { setSavingChapter(false); }
  };

  const handleChapterUpdated = (updated) => {
    setChapters((prev) => prev.map((c) => c.id === updated.id ? updated : c));
  };

  const handleChapterDeleted = async (id) => {
    try {
      await deleteChapter(id);
      setChapters((prev) => prev.filter((c) => c.id !== id));
      toast.success('Chapter deleted');
    } catch { toast.error('Failed to delete chapter'); }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <Link to="/admin/courses" className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1 mb-4">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back to courses
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Course Builder</h1>
            <p className="text-gray-500 mt-1 text-sm">{course?.title} · {chapters.length} chapter{chapters.length !== 1 ? 's' : ''} · {chapters.reduce((s, c) => s + c.lessons.length, 0)} slides</p>
          </div>
          <Link to={`/admin/courses/${courseId}/assessment`}>
            <button className="text-sm border border-gray-200 rounded-lg px-3 py-2 hover:bg-gray-50">Manage Final Assessment</button>
          </Link>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-800">
        <strong>How it works:</strong> Add chapters to organise your course. Each chapter contains slides (Title, Content, Key Points, Image, Quote). Add a 2–5 question quiz at the end of each chapter to test understanding before learners advance.
      </div>

      {/* Chapter list */}
      {chapters.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-gray-500 mb-2">No chapters yet.</p>
          <p className="text-xs text-gray-400">Add your first chapter to start building slide-based lessons.</p>
        </div>
      )}

      <div className="space-y-4">
        {chapters.map((ch) => (
          <ChapterBlock
            key={ch.id}
            chapter={ch}
            courseId={courseId}
            onUpdated={handleChapterUpdated}
            onDeleted={handleChapterDeleted}
          />
        ))}
      </div>

      {/* Add chapter */}
      {addingChapter ? (
        <div className="bg-white border border-blue-200 rounded-xl p-4 flex gap-3">
          <input
            autoFocus
            value={newChapterTitle}
            onChange={(e) => setNewChapterTitle(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleAddChapter(); if (e.key === 'Escape') setAddingChapter(false); }}
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Chapter title, e.g. Introduction to Medication Safety…"
          />
          <button onClick={handleAddChapter} disabled={savingChapter || !newChapterTitle.trim()} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
            {savingChapter ? 'Adding…' : 'Add'}
          </button>
          <button onClick={() => setAddingChapter(false)} className="text-sm text-gray-500 px-2">Cancel</button>
        </div>
      ) : (
        <button
          onClick={() => setAddingChapter(true)}
          className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-400 hover:border-blue-400 hover:text-blue-500 transition-colors font-medium"
        >
          + Add Chapter
        </button>
      )}
    </div>
  );
}
