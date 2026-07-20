import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { registerUser } from '../../api/authApi';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

const LOGO_URL = 'https://leadnurse.co.uk/wp-content/uploads/2026/02/Lead-Nurse-Logo-e1771949504571-1024x377.png';

export default function RegisterPage() {
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const { confirmPassword, ...payload } = data;
      await registerUser(payload);
      setRegistered(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel — brand */}
      <div className="hidden lg:flex flex-col justify-between w-2/5 bg-primary-700 p-10">
        <img src={LOGO_URL} alt="Lead Nurse" className="h-10 w-auto object-contain object-left brightness-0 invert" />
        <div>
          <p className="text-secondary-400 text-sm font-semibold uppercase tracking-widest mb-3">Healthcare Platform</p>
          <h2 className="text-white text-3xl font-bold leading-snug mb-4">
            Join thousands of healthcare professionals on Lead Nurse.
          </h2>
          <p className="text-primary-200 text-sm leading-relaxed">
            Complete mandatory training, manage your shifts and keep your compliance up to date.
          </p>
        </div>
        <p className="text-primary-400 text-xs">© {new Date().getFullYear()} Lead Nurse</p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex justify-center mb-8 lg:hidden">
            <img src={LOGO_URL} alt="Lead Nurse" className="h-10 w-auto object-contain" />
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
            <p className="text-gray-500 mt-1 text-sm">Join Lead Nurse and start learning today</p>
          </div>

          {registered ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-gray-900 mb-2">Check your email</h2>
              <p className="text-sm text-gray-500 leading-relaxed mb-6">
                We've sent a verification link to your email address. Click the link to activate your account, then log in.
              </p>
              <Link to="/login" className="inline-flex items-center justify-center w-full py-3 px-4 bg-primary-700 text-white text-sm font-semibold rounded-xl hover:bg-primary-800">
                Go to login
              </Link>
            </div>
          ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Full name"
                type="text"
                placeholder="Jane Smith"
                error={errors.name?.message}
                {...register('name', {
                  required: 'Name is required',
                  minLength: { value: 2, message: 'Name must be at least 2 characters' },
                })}
              />
              <Input
                label="Email address"
                type="email"
                placeholder="you@company.com"
                error={errors.email?.message}
                {...register('email', {
                  required: 'Email is required',
                  pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email address' },
                })}
              />
              <Input
                label="Password"
                type="password"
                placeholder="Min. 8 characters"
                error={errors.password?.message}
                {...register('password', {
                  required: 'Password is required',
                  minLength: { value: 8, message: 'Minimum 8 characters' },
                  pattern: {
                    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                    message: 'Must include uppercase, lowercase and a number',
                  },
                })}
              />
              <Input
                label="Confirm password"
                type="password"
                placeholder="Re-enter password"
                error={errors.confirmPassword?.message}
                {...register('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: (val) => val === watch('password') || 'Passwords do not match',
                })}
              />

              <Button type="submit" className="w-full mt-2" loading={loading} size="lg">
                Create account
              </Button>
            </form>

            <div className="mt-6 pt-5 border-t border-gray-100 text-center">
              <p className="text-sm text-gray-500">
                Already have an account?{' '}
                <Link to="/login" className="font-medium text-primary-700 hover:text-primary-800">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
          )}
        </div>
      </div>
    </div>
  );
}
