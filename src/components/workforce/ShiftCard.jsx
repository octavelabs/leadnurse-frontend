import React from 'react';

const STATUS_COLORS = {
  OPEN: 'bg-primary-100 text-blue-800',
  PARTIALLY_FILLED: 'bg-yellow-100 text-yellow-800',
  FILLED: 'bg-green-100 text-green-800',
  COMPLETED: 'bg-gray-100 text-gray-600',
  CANCELLED: 'bg-red-100 text-red-800',
};

const TYPE_LABELS = { DAY: 'Day', NIGHT: 'Night', LONG_DAY: 'Long Day', ON_CALL: 'On Call' };

export default function ShiftCard({ shift, actions }) {
  const start = new Date(shift.startTime);
  const end = new Date(shift.endTime);
  const date = new Date(shift.date);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold text-gray-900 text-sm">{shift.title}</h3>
          <p className="text-xs text-gray-500 mt-0.5">{shift.facility?.name}</p>
        </div>
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium flex-shrink-0 ${STATUS_COLORS[shift.status] || 'bg-gray-100 text-gray-600'}`}>
          {shift.status?.replace('_', ' ')}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-600">
        <div className="flex items-center gap-1">
          <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
        </div>
        <div className="flex items-center gap-1">
          <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {start.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} "“ {end.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
        </div>
        <div className="flex items-center gap-1">
          <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          {shift.role?.name}
        </div>
        <div className="flex items-center gap-1">
          <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          £{shift.hourlyRate?.toFixed(2)}/hr · {TYPE_LABELS[shift.shiftType]}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs text-gray-500">
          {shift.assignments?.filter((a) => a.status === 'CONFIRMED').length || 0}/{shift.requiredWorkers} workers
        </span>
        {actions && <div className="flex gap-2">{actions}</div>}
      </div>
    </div>
  );
}
