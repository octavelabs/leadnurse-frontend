import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { loginUser } from '../../api/authApi';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { resendVerification } from '../../api/authApi';

const LOGO_URL = 'https://leadnurse.co.uk/wp-content/uploads/2026/02/Lead-Nurse-Logo-e1771949504571-1024x377.png';

export default function LoginPage() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const [unverifiedEmail, setUnverifiedEmail] = useState(null);
  const [resendLoading, setResendLoading] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);
    setUnverifiedEmail(null);
    try {
      const res = await loginUser(data);
      toast.success('Welcome back!');
      login(res.data.data.user);
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      if (msg.toLowerCase().includes('verify your email')) {
        setUnverifiedEmail(data.email);
      }
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!unverifiedEmail) return;
    setResendLoading(true);
    try {
      await resendVerification(unverifiedEmail);
      toast.success('Verification email resent — check your inbox.');
      setUnverifiedEmail(null);
    } catch {
      toast.error('Failed to resend. Please try again.');
    } finally {
      setResendLoading(false);
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
            Learning &amp; workforce management built for healthcare teams.
          </h2>
          <p className="text-primary-200 text-sm leading-relaxed">
            Manage courses, shifts, compliance and staff onboarding — all in one place.
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
            <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
            <p className="text-gray-500 mt-1 text-sm">Sign in to your account to continue</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                placeholder="••••••••"
                error={errors.password?.message}
                {...register('password', { required: 'Password is required' })}
              />

              <div className="flex items-center justify-between mt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input type="checkbox" {...register('rememberMe')} className="accent-primary-700" />
                  <span className="text-sm text-gray-600">Remember me for 30 days</span>
                </label>
                <Link to="/forgot-password" className="text-sm text-primary-700 hover:text-primary-800 font-medium">
                  Forgot password?
                </Link>
              </div>

              {unverifiedEmail && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-800">
                  Your email is not verified.{' '}
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resendLoading}
                    className="font-semibold underline disabled:opacity-50"
                  >
                    {resendLoading ? 'Sending…' : 'Resend verification email'}
                  </button>
                </div>
              )}

              <Button type="submit" className="w-full" loading={loading} size="lg">
                Sign in
              </Button>
            </form>

            <div className="mt-6 pt-5 border-t border-gray-100 text-center">
              <p className="text-sm text-gray-500">
                Don't have an account?{' '}
                <Link to="/register" className="font-medium text-primary-700 hover:text-primary-800">
                  Create one free
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
