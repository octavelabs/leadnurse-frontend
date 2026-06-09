import React from 'react';
import { useNavigate } from 'react-router-dom';
import Badge from '../common/Badge';
import Button from '../common/Button';

export default function CourseCard({ course, showActions = true }) {
  const navigate = useNavigate();
  const enrolled = !!course.enrollment;
  const completed = course.enrollment?.completed;

  const lessonCount = course._count?.lessons ?? course.lessons?.length ?? 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 hover:shadow-md transition-shadow overflow-hidden flex flex-col">
      <div className="h-2 bg-gradient-to-r from-blue-500 to-indigo-600" />
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-gray-900 text-base leading-snug line-clamp-2">
            {course.title}
          </h3>
          <div className="flex-shrink-0">
            {completed ? (
              <Badge variant="green">Completed</Badge>
            ) : enrolled ? (
              <Badge variant="blue">Enrolled</Badge>
            ) : (
              <Badge variant="gray">Available</Badge>
            )}
          </div>
        </div>

        <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-1">{course.description}</p>

        <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            {lessonCount} lesson{lessonCount !== 1 ? 's' : ''}
          </span>
          {course.assessment && (
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Assessment
            </span>
          )}
        </div>

        {showActions && (
          <Button
            variant={enrolled ? 'primary' : 'outline'}
            size="sm"
            className="w-full"
            onClick={() => navigate(`/courses/${course.id}`)}
          >
            {completed ? 'View Certificate' : enrolled ? 'Continue' : 'View Course'}
          </Button>
        )}
      </div>
    </div>
  );
}
