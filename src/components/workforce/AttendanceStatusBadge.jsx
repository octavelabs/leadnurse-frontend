import React from 'react';

const STATUS_CONFIG = {
  ON_TIME: { label: 'On Time', cls: 'bg-green-100 text-green-800' },
  LATE: { label: 'Late', cls: 'bg-yellow-100 text-yellow-800' },
  ABSENT: { label: 'Absent', cls: 'bg-red-100 text-red-800' },
  LEFT_EARLY: { label: 'Left Early', cls: 'bg-orange-100 text-orange-800' },
};

export default function AttendanceStatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || { label: status, cls: 'bg-gray-100 text-gray-600' };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
}
