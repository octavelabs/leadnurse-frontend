import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { verifyEmail, resendVerification } from '../../api/authApi';

const LOGO_URL = 'https://leadnurse.co.uk/wp-content/uploads/2026/02/Lead-Nurse-Logo-e1771949504571-1024x377.png';

export default function VerifyEmailPage() {
  const { token } = useParams();
  const [status, setStatus] = useState('loading'); // loading | success | error
  const [resendSent, setResendSent] = useState(false);
  const [resending, setResending] = useState(false);
  const { register, handleSubmit } = useForm();

  useEffect(() => {
    verifyEmail(token)
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'));
  }, [token]);

  const handleResend = async ({ email }) => {
    setResending(true);
    try {
      await resendVerification(email);
      setResendSent(true);
    } catch {
      // still show success (don't reveal if email exists)
      setResendSent(true);
    } finally {
      setResending(false);
    }
  };

  if (status === 'loading') return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-primary-700 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <img src={LOGO_URL} alt="Lead Nurse" className="h-10 w-auto object-contain" />
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
          {status === 'success' ? (
            <>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Email verified!</h2>
              <p className="text-gray-500 text-sm mb-6">Your account is now active. Log in to get started.</p>
              <Link
                to="/login"
                className="inline-flex items-center justify-center w-full py-3 px-4 bg-primary-700 text-white text-sm font-semibold rounded-xl hover:bg-primary-800"
              >
                Go to login
              </Link>
            </>
          ) : (
            <>
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Link expired</h2>
              <p className="text-gray-500 text-sm mb-6">
                This verification link is invalid or has expired. Enter your email below to receive a new one.
              </p>

              {resendSent ? (
                <p className="text-sm text-green-700 bg-green-50 rounded-xl p-3">
                  A new verification link has been sent if your email has a pending account.
                </p>
              ) : (
                <form onSubmit={handleSubmit(handleResend)} className="space-y-3 text-left">
                  <input
                    type="email"
                    placeholder="your@email.com"
                    {...register('email', { required: true })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-700"
                  />
                  <button
                    type="submit"
                    disabled={resending}
                    className="w-full py-2.5 bg-primary-700 text-white text-sm font-semibold rounded-xl hover:bg-primary-800 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {resending && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                    {resending ? 'Sending…' : 'Resend verification email'}
                  </button>
                </form>
              )}

              <Link to="/login" className="mt-5 inline-block text-sm text-gray-500 hover:text-gray-700">
                Back to login
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
