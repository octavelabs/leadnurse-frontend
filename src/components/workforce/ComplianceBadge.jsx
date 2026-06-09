import React from 'react';

const STATUS_CONFIG = {
  VALID: { label: 'Valid', cls: 'bg-green-100 text-green-800' },
  EXPIRING_SOON: { label: 'Expiring Soon', cls: 'bg-yellow-100 text-yellow-800' },
  EXPIRED: { label: 'Expired', cls: 'bg-red-100 text-red-800' },
  NOT_SUBMITTED: { label: 'Not Submitted', cls: 'bg-gray-100 text-gray-600' },
  UNDER_REVIEW: { label: 'Under Review', cls: 'bg-blue-100 text-blue-800' },
};

export default function ComplianceBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.NOT_SUBMITTED;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
}
