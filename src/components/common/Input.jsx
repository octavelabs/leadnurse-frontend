import React from 'react';

const Input = React.forwardRef(function Input(
  { label, error, className = '', textarea = false, ...props },
  ref
) {
  const base =
    'w-full rounded-lg border px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-700 focus:border-primary-700 transition-colors';
  const normal  = 'border-gray-300 bg-white';
  const errored = 'border-red-400 bg-red-50';

  const cls = `${base} ${error ? errored : normal} ${className}`;

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-gray-700">{label}</label>
      )}
      {textarea ? (
        <textarea ref={ref} className={`${cls} resize-y min-h-[100px]`} {...props} />
      ) : (
        <input ref={ref} className={cls} {...props} />
      )}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
});

export default Input;
