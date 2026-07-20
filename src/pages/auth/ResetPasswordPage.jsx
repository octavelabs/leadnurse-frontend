import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { resetPassword } from '../../api/authApi';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

const LOGO_URL = 'https://leadnurse.co.uk/wp-content/uploads/2026/02/Lead-Nurse-Logo-e1771949504571-1024x377.png';

export default function ResetPasswordPage() {
  const { token } = useParams();
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [linkError, setLinkError] = useState(null);

  const onSubmit = async ({ newPassword }) => {
    setLoading(true);
    try {
      await resetPassword(token, { newPassword });
      setDone(true);
    } catch (err) {
      const msg = err.response?.data?.message;
      if (err.response?.status === 400) {
        setLinkError(msg || 'This reset link is invalid or has expired.');
      } else {
        toast.error(msg || 'Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <img src={LOGO_URL} alt="Lead Nurse" className="h-10 w-auto object-contain" />
        </div>

        {done ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">Password reset!</h2>
            <p className="text-sm text-gray-500 mb-6">Your password has been updated. Please log in with your new credentials.</p>
            <Link to="/login" className="inline-flex items-center justify-center w-full py-2.5 px-4 bg-primary-700 text-white text-sm font-semibold rounded-xl hover:bg-primary-800">
              Go to login
            </Link>
          </div>
        ) : linkError ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">Link expired</h2>
            <p className="text-sm text-gray-500 mb-6">{linkError}</p>
            <Link to="/forgot-password" className="text-sm font-medium text-primary-700 hover:text-primary-800">
              Request a new reset link
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Reset your password</h1>
            <p className="text-gray-500 text-sm mb-6">Choose a strong new password for your account.</p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="New password"
                type="password"
                placeholder="Min. 8 characters"
                error={errors.newPassword?.message}
                {...register('newPassword', {
                  required: 'New password is required',
                  minLength: { value: 8, message: 'Minimum 8 characters' },
                  pattern: {
                    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                    message: 'Must include uppercase, lowercase and a number',
                  },
                })}
              />
              <Input
                label="Confirm new password"
                type="password"
                placeholder="Re-enter password"
                error={errors.confirmPassword?.message}
                {...register('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: (val) => val === watch('newPassword') || 'Passwords do not match',
                })}
              />
              <Button type="submit" className="w-full" loading={loading} size="lg">
                Reset password
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
