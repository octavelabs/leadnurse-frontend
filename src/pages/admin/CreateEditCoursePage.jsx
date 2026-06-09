import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { getCourseById, createCourse, updateCourse } from '../../api/courseApi';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function CreateEditCoursePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: { title: '', description: '', isPublished: false },
  });

  useEffect(() => {
    if (!isEdit) return;
    getCourseById(id)
      .then((res) => reset({
        title: res.data.data.title,
        description: res.data.data.description,
        isPublished: res.data.data.isPublished,
      }))
      .finally(() => setLoading(false));
  }, [id]);

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      if (isEdit) {
        await updateCourse(id, data);
        toast.success('Course updated successfully');
        navigate('/admin/courses');
      } else {
        const res = await createCourse(data);
        toast.success('Course created successfully');
        navigate(`/admin/courses/${res.data.data.id}/lessons`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save course');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Link to="/admin/courses" className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1 mb-4">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to courses
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">{isEdit ? 'Edit Course' : 'Create New Course'}</h1>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Input
            label="Course Title"
            placeholder="e.g. Introduction to JavaScript"
            error={errors.title?.message}
            {...register('title', {
              required: 'Title is required',
              maxLength: { value: 200, message: 'Max 200 characters' },
            })}
          />

          <Input
            label="Description"
            textarea
            rows={4}
            placeholder="Describe what students will learn in this course..."
            error={errors.description?.message}
            {...register('description', { required: 'Description is required' })}
          />

          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
            <input
              type="checkbox"
              id="isPublished"
              className="w-4 h-4 rounded text-blue-600 border-gray-300 focus:ring-blue-500"
              {...register('isPublished')}
            />
            <label htmlFor="isPublished" className="text-sm text-gray-700">
              <span className="font-medium">Publish immediately</span>
              <span className="text-gray-500 ml-1">— make this course visible to employees</span>
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={saving} size="lg">
              {isEdit ? 'Save Changes' : 'Create Course'}
            </Button>
            <Link to="/admin/courses">
              <Button variant="secondary" size="lg" type="button">Cancel</Button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
