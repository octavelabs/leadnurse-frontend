import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import toast from 'react-hot-toast';
import { getCourseById } from '../../api/courseApi';
import { getAssessmentByCourse, createAssessment, updateAssessment } from '../../api/assessmentApi';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const defaultQuestion = () => ({
  question: '',
  options: ['', '', '', ''],
  correctAnswer: 0,
  order: 1,
});

export default function AssessmentManagementPage() {
  const { id: courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  const { register, control, handleSubmit, reset, watch, formState: { errors } } = useForm({
    defaultValues: {
      passScore: 70,
      maxAttempts: 3,
      questions: [defaultQuestion()],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'questions' });

  useEffect(() => {
    Promise.all([
      getCourseById(courseId),
      getAssessmentByCourse(courseId).catch(() => null),
    ]).then(([c, a]) => {
      setCourse(c.data.data);
      if (a?.data?.data?.assessment) {
        const existing = a.data.data.assessment;
        setIsEdit(true);
        reset({
          passScore: existing.passScore,
          maxAttempts: existing.maxAttempts,
          questions: existing.questions.map((q) => ({
            question: q.question,
            options: q.options,
            correctAnswer: q.correctAnswer,
            order: q.order,
          })),
        });
      }
    }).finally(() => setLoading(false));
  }, [courseId]);

  const onSubmit = async (data) => {
    setSaving(true);
    const payload = {
      passScore: parseInt(data.passScore),
      maxAttempts: parseInt(data.maxAttempts),
      questions: data.questions.map((q, i) => ({
        ...q,
        correctAnswer: parseInt(q.correctAnswer),
        order: i + 1,
        options: q.options.filter((o) => o.trim() !== ''),
      })),
    };

    // Validate each question has at least 2 options
    const invalid = payload.questions.find((q) => q.options.length < 2);
    if (invalid) {
      toast.error('Each question needs at least 2 options');
      setSaving(false);
      return;
    }

    try {
      if (isEdit) {
        await updateAssessment(courseId, payload);
        toast.success('Assessment updated');
      } else {
        await createAssessment(courseId, payload);
        toast.success('Assessment created');
        setIsEdit(true);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save assessment');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <Link to={`/admin/courses/${courseId}/lessons`} className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1 mb-4">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to lessons
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">{isEdit ? 'Edit' : 'Create'} Assessment</h1>
        <p className="text-gray-500 mt-1">{course?.title}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Settings */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Assessment Settings</h2>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Pass Score (%)"
              type="number"
              min="1"
              max="100"
              error={errors.passScore?.message}
              {...register('passScore', { required: true, min: 1, max: 100, valueAsNumber: true })}
            />
            <Input
              label="Max Attempts"
              type="number"
              min="1"
              error={errors.maxAttempts?.message}
              {...register('maxAttempts', { required: true, min: 1, valueAsNumber: true })}
            />
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-4">
          {fields.map((field, qi) => (
            <div key={field.id} className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Question {qi + 1}</h3>
                {fields.length > 1 && (
                  <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-50" type="button" onClick={() => remove(qi)}>
                    Remove
                  </Button>
                )}
              </div>

              <div className="space-y-3">
                <Input
                  label="Question"
                  placeholder="e.g. What does the Array .map() method return?"
                  error={errors.questions?.[qi]?.question?.message}
                  {...register(`questions.${qi}.question`, { required: 'Question is required' })}
                />

                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">
                    Options (mark the correct one)
                  </label>
                  <div className="space-y-2">
                    {[0, 1, 2, 3].map((oi) => (
                      <div key={oi} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name={`questions.${qi}.correctAnswer`}
                          value={oi}
                          className="w-4 h-4 text-blue-600"
                          {...register(`questions.${qi}.correctAnswer`)}
                        />
                        <input
                          type="text"
                          placeholder={`Option ${String.fromCharCode(65 + oi)}`}
                          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          {...register(`questions.${qi}.options.${oi}`)}
                        />
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-1.5">Click the radio button next to the correct answer.</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => append({ ...defaultQuestion(), order: fields.length + 1 })}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Question
        </Button>

        <div className="flex gap-3">
          <Button type="submit" loading={saving} size="lg">
            {isEdit ? 'Update Assessment' : 'Create Assessment'}
          </Button>
          <Link to={`/admin/courses/${courseId}/lessons`}>
            <Button variant="secondary" size="lg" type="button">Cancel</Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
