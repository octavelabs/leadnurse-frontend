import React, { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { updateMyProfile, uploadAvatar } from '../api/workerApi';
import Input from '../components/common/Input';
import Button from '../components/common/Button';

export default function ProfilePage() {
  const { user, login } = useAuth();
  const [saving, setSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const fileInputRef = useRef(null);

  const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm();

  useEffect(() => {
    if (user) {
      reset({
        name: user.name || '',
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
        postcode: user.postcode || '',
        bio: user.bio || '',
      });
    }
  }, [user, reset]);

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      const res = await updateMyProfile(data);
      const token = localStorage.getItem('token');
      login(res.data.data, token);
      toast.success('Profile updated');
      reset(data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarUploading(true);
    try {
      const res = await uploadAvatar(file);
      const token = localStorage.getItem('token');
      login(res.data.data, token);
      toast.success('Photo updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload photo');
    } finally {
      setAvatarUploading(false);
      e.target.value = '';
    }
  };

  const initials = user?.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-sm text-gray-500 mt-0.5">Keep your details up to date so you can be matched with nearby shifts</p>
      </div>

      {/* Avatar card */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
        <div className="relative flex-shrink-0">
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-primary-700 flex items-center justify-center text-white text-xl font-bold">
              {initials}
            </div>
          )}
          {avatarUploading && (
            <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
        <div className="flex-1">
          <p className="font-semibold text-gray-900">{user?.name}</p>
          <p className="text-sm text-gray-500">{user?.email}</p>
          <span className="text-xs bg-primary-50 text-primary-800 px-2 py-0.5 rounded mt-1 inline-block capitalize">{user?.role?.toLowerCase()}</span>
        </div>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleAvatarChange}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={avatarUploading}
            className="text-sm text-primary-700 hover:text-primary-800 font-medium disabled:opacity-50"
          >
            {user?.avatarUrl ? 'Change photo' : 'Upload photo'}
          </button>
          <p className="text-xs text-gray-400 mt-0.5">JPG, PNG or WebP · Max 5MB</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

          <div>
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">Personal Information</h2>
            <div className="space-y-4">
              <Input
                label="Full Name"
                placeholder="Your full name"
                error={errors.name?.message}
                {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'Too short' } })}
              />
              <Input
                label="Phone Number"
                type="tel"
                placeholder="e.g. 07700 900000"
                error={errors.phone?.message}
                {...register('phone')}
              />
            </div>
          </div>

          <div className="border-t border-gray-100 pt-5">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">Location</h2>
            <p className="text-xs text-gray-500 mb-3">Your location helps match you with nearby shifts and allows managers to filter staff by area.</p>
            <div className="space-y-4">
              <Input
                label="Street Address"
                placeholder="e.g. 12 Oak Avenue"
                error={errors.address?.message}
                {...register('address')}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="City / Town"
                  placeholder="e.g. Telford"
                  error={errors.city?.message}
                  {...register('city')}
                />
                <Input
                  label="Postcode"
                  placeholder="e.g. TF1 1AA"
                  error={errors.postcode?.message}
                  {...register('postcode')}
                />
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-5">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">About Me</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Short Bio</label>
              <textarea
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-700"
                placeholder="A brief description of your experience and skills..."
                {...register('bio')}
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button type="submit" loading={saving} disabled={!isDirty}>
              Save Changes
            </Button>
            {isDirty && (
              <button type="button" onClick={() => reset()} className="text-sm text-gray-500 hover:text-gray-700">
                Discard
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Read-only account info */}
      <div className="bg-gray-50 rounded-xl border border-gray-200 p-5">
        <h2 className="text-sm font-semibold text-gray-600 mb-3">Account Details</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Email</span>
            <span className="text-gray-900">{user?.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Member since</span>
            <span className="text-gray-900">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }) : '"”'}</span>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-3">To change your email or password, please contact your administrator.</p>
      </div>
    </div>
  );
}
