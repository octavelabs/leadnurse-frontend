import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getMyEnrollments } from '../../api/enrollmentApi';
import { getMyCertificates } from '../../api/certificateApi';
import StatsCard from '../../components/dashboard/StatsCard';
import ProgressBar from '../../components/dashboard/ProgressBar';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';

export default function DashboardPage() {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getMyEnrollments(), getMyCertificates()])
      .then(([e, c]) => {
        setEnrollments(e.data.data);
        setCertificates(c.data.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  const inProgress = enrollments.filter((e) => !e.completed);
  const completed = enrollments.filter((e) => e.completed);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.name?.split(' ')[0]}! ðŸ‘‹
        </h1>
        <p className="text-gray-500 mt-1">Here's your learning progress at a glance.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard label="Enrolled Courses" value={enrollments.length} icon="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" color="blue" />
        <StatsCard label="In Progress" value={inProgress.length} icon="M13 10V3L4 14h7v7l9-11h-7z" color="orange" />
        <StatsCard label="Completed" value={completed.length} icon="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" color="green" />
        <StatsCard label="Certificates" value={certificates.length} icon="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" color="purple" />
      </div>

      {inProgress.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Continue Learning</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {inProgress.map((enrollment) => {
              const total = enrollment.course._count.lessons;
              const done = enrollment.completedLessons;
              return (
                <Link
                  key={enrollment.id}
                  to={`/courses/${enrollment.courseId}`}
                  className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-medium text-gray-900 group-hover:text-primary-700 transition-colors line-clamp-1">
                      {enrollment.course.title}
                    </h3>
                    <Badge variant="blue">In Progress</Badge>
                  </div>
                  <ProgressBar value={done} max={total} label={`${done} / ${total} lessons`} />
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {enrollments.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">No courses yet</h3>
          <p className="text-gray-500 text-sm mb-4">Browse available courses and start your learning journey.</p>
          <Link to="/courses" className="inline-flex items-center gap-1 text-primary-700 font-medium text-sm hover:text-primary-800">
            Browse courses â†’
          </Link>
        </div>
      )}
    </div>
  );
}
