import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { createShift, updateShift, getShift } from '../../../api/shiftApi';
import { getFacilities } from '../../../api/facilityApi';
import { getHealthcareRoles } from '../../../api/workerApi';
import Input from '../../../components/common/Input';
import Button from '../../../components/common/Button';

export default function CreateEditShift() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [facilities, setFacilities] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    Promise.all([getFacilities(), getHealthcareRoles()]).then(([f, r]) => {
      setFacilities(f.data.data);
      setRoles(r.data.data);
    });
    if (isEdit) {
      getShift(id).then((r) => {
        const s = r.data.data;
        reset({
          ...s,
          date: s.date?.split('T')[0],
          startTime: new Date(s.startTime).toISOString().slice(11, 16),
          endTime: new Date(s.endTime).toISOString().slice(11, 16),
        });
      });
    }
  }, [id]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const payload = {
        ...data,
        startTime: new Date(`${data.date}T${data.startTime}`).toISOString(),
        endTime: new Date(`${data.date}T${data.endTime}`).toISOString(),
        hourlyRate: data.hourlyRate ? parseFloat(data.hourlyRate) : 0,
        facilityHourlyRate: data.facilityHourlyRate ? parseFloat(data.facilityHourlyRate) : 0,
        requiredWorkers: parseInt(data.requiredWorkers),
      };
      if (isEdit) await updateShift(id, payload);
      else await createShift(payload);
      toast.success(isEdit ? 'Shift updated' : 'Shift created');
      navigate('/admin/workforce/shifts');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save shift');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{isEdit ? 'Edit Shift' : 'Create New Shift'}</h1>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Shift Title" placeholder="e.g. Night Cover – Ward B" error={errors.title?.message}
            {...register('title', { required: 'Title is required' })} />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Facility</label>
              <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" {...register('facilityId', { required: true })}>
                <option value="">Select facility</option>
                {facilities.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role Required</label>
              <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" {...register('roleId', { required: true })}>
                <option value="">Select role</option>
                {roles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Input label="Date" type="date" error={errors.date?.message} {...register('date', { required: 'Date is required' })} />
            <Input label="Start Time" type="time" error={errors.startTime?.message} {...register('startTime', { required: true })} />
            <Input label="End Time" type="time" error={errors.endTime?.message} {...register('endTime', { required: true })} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Shift Type</label>
              <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" {...register('shiftType')}>
                {['DAY','NIGHT','LONG_DAY','ON_CALL'].map((t) => <option key={t} value={t}>{t.replace('_',' ')}</option>)}
              </select>
            </div>
            <Input label="Workers Required" type="number" min="1" placeholder="1" error={errors.requiredWorkers?.message}
              {...register('requiredWorkers', { required: true, min: 1 })} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Employee Hourly Rate (£)" type="number" step="0.01" placeholder="12.50"
              error={errors.hourlyRate?.message}
              {...register('hourlyRate', { min: { value: 0, message: 'Must be 0 or more' } })} />
            <Input label="Facility Hourly Rate (£)" type="number" step="0.01" placeholder="25.00"
              error={errors.facilityHourlyRate?.message}
              {...register('facilityHourlyRate', { min: { value: 0, message: 'Must be 0 or more' } })} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Compliance Requirements</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                ['requiresDBS','DBS Check'],
                ['requiresNMC','NMC PIN'],
                ['requiresRightToWork','Right to Work'],
                ['requiresCareCert','Care Certificate'],
                ['requiresMandatoryTraining','Mandatory Training'],
              ].map(([field, label]) => (
                <label key={field} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input type="checkbox" className="rounded border-gray-300" {...register(field)} />
                  {label}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none" placeholder="Optional shift notes..." {...register('notes')} />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={loading}>{isEdit ? 'Update Shift' : 'Create Shift'}</Button>
            <button type="button" onClick={() => navigate('/admin/workforce/shifts')} className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
