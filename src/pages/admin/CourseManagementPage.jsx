import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getCourses, deleteCourse, updateCourse } from '../../api/courseApi';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';

export default function CourseManagementPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [confirmId, setConfirmId] = useState(null);

  const load = () => {
    getCourses().then((res) => setCourses(res.data.data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleTogglePublish = async (course) => {
    try {
      await updateCourse(course.id, { isPublished: !course.isPublished });
      toast.success(`Course ${!course.isPublished ? 'published' : 'unpublished'}`);
      load();
    } catch {
      toast.error('Failed to update course');
    }
  };

  const handleDelete = async () => {
    if (!confirmId) return;
    setDeleting(confirmId);
    try {
      await deleteCourse(confirmId);
      toast.success('Course deleted');
      setConfirmId(null);
      load();
    } catch {
      toast.error('Failed to delete course');
    } finally {
      setDeleting(null);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Courses</h1>
          <p className="text-gray-500 mt-1">{courses.length} course{courses.length !== 1 ? 's' : ''} total</p>
        </div>
        <Link to="/admin/courses/new">
          <Button>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Course
          </Button>
        </Link>
      </div>

      {courses.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-gray-500 mb-4">No courses yet. Create your first course!</p>
          <Link to="/admin/courses/new"><Button>Create Course</Button></Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 font-semibold text-gray-600">Course</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-600">Lessons</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-600">Enrolled</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-600">Status</th>
                <th className="text-right px-6 py-3 font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {courses.map((course) => (
                <tr key={course.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900 line-clamp-1">{course.title}</p>
                    <p className="text-gray-400 text-xs mt-0.5 line-clamp-1">{course.description}</p>
                  </td>
                  <td className="px-4 py-4 text-center text-gray-600">{course._count?.lessons ?? 0}</td>
                  <td className="px-4 py-4 text-center text-gray-600">{course._count?.enrollments ?? 0}</td>
                  <td className="px-4 py-4 text-center">
                    <Badge variant={course.isPublished ? 'green' : 'yellow'}>
                      {course.isPublished ? 'Published' : 'Draft'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <Link to={`/admin/courses/${course.id}/edit`}>
                        <Button variant="ghost" size="sm">Edit</Button>
                      </Link>
                      <Link to={`/admin/courses/${course.id}/lessons`}>
                        <Button variant="ghost" size="sm">Lessons</Button>
                      </Link>
                      <Link to={`/admin/courses/${course.id}/assessment`}>
                        <Button variant="ghost" size="sm">Assessment</Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleTogglePublish(course)}
                      >
                        {course.isPublished ? 'Unpublish' : 'Publish'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:bg-red-50"
                        onClick={() => setConfirmId(course.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={!!confirmId} onClose={() => setConfirmId(null)} title="Delete Course">
        <p className="text-gray-600 mb-6">Are you sure? This will permanently delete the course and all its content. This action cannot be undone.</p>
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={() => setConfirmId(null)}>Cancel</Button>
          <Button variant="danger" loading={!!deleting} onClick={handleDelete}>Delete Course</Button>
        </div>
      </Modal>
    </div>
  );
}
