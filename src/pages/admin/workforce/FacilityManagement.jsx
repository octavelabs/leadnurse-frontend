import React, { useEffect, useState } from 'react';
import { getFacilities, createFacility, updateFacility, deleteFacility } from '../../../api/facilityApi';
import toast from 'react-hot-toast';

const TYPES = ['HOSPITAL', 'CARE_HOME', 'CLINIC', 'GP_SURGERY', 'COMMUNITY_HEALTH', 'OTHER'];
const EMPTY = { name: '', type: 'HOSPITAL', address: '', city: '', postcode: '', contactName: '', contactEmail: '', contactPhone: '' };

// Defined outside component so React sees a stable type reference "” fixes the
// "input loses focus after every keystroke" bug caused by inline component defs.
function FormField({ label, value, onChange, type = 'text', placeholder }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-700"
        placeholder={placeholder}
        value={value || ''}
        onChange={onChange}
      />
    </div>
  );
}

export default function FacilityManagement() {
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await getFacilities();
      setFacilities(res.data.data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function setField(field) {
    return (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  async function handleSave() {
    if (!form.name.trim()) return toast.error('Facility name is required');
    if (!form.address.trim()) return toast.error('Address is required');
    if (!form.city.trim()) return toast.error('City is required');
    if (!form.postcode.trim()) return toast.error('Postcode is required');

    setSaving(true);
    try {
      if (form.id) {
        const { id, ...data } = form;
        await updateFacility(id, data);
      } else {
        await createFacility(form);
      }
      toast.success(form.id ? 'Facility updated' : 'Facility created');
      setForm(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save facility');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this facility? This cannot be undone.')) return;
    try {
      await deleteFacility(id);
      toast.success('Facility deleted');
      load();
    } catch {
      toast.error('Cannot delete "” this facility may have existing shifts');
    }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Facilities</h1>
          <p className="text-sm text-gray-500 mt-0.5">{facilities.length} registered</p>
        </div>
        <button
          onClick={() => setForm({ ...EMPTY })}
          className="bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-800 transition-colors"
        >
          + Add Facility
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary-700 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {facilities.length === 0 && (
            <div className="col-span-3 text-center py-12 text-gray-500">
              No facilities yet. Add your first one above.
            </div>
          )}
          {facilities.map((f) => (
            <div key={f.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-gray-900">{f.name}</h3>
                  <p className="text-xs text-primary-700 mt-0.5">{f.type.replace(/_/g, ' ')}</p>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setForm({ ...f })} className="text-xs text-primary-700 hover:underline">Edit</button>
                  <button onClick={() => handleDelete(f.id)} className="text-xs text-red-500 hover:underline">Delete</button>
                </div>
              </div>
              <div className="mt-3 space-y-1 text-xs text-gray-500">
                <p>{f.address}</p>
                <p>{f.city}{f.postcode ? `, ${f.postcode}` : ''}</p>
                {f.contactName && <p className="pt-1 font-medium text-gray-600">{f.contactName}</p>}
                {f.contactEmail && <p>{f.contactEmail}</p>}
                {f.contactPhone && <p>{f.contactPhone}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {form && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-900 text-lg">{form.id ? 'Edit Facility' : 'Add New Facility'}</h2>
              <button onClick={() => setForm(null)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <FormField label="Facility Name *" value={form.name} onChange={setField('name')} placeholder="e.g. Sunrise Care Home" />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Facility Type</label>
              <select
                className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-700"
                value={form.type}
                onChange={setField('type')}
              >
                {TYPES.map((t) => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
              </select>
            </div>

            <FormField label="Street Address *" value={form.address} onChange={setField('address')} placeholder="123 High Street" />

            <div className="grid grid-cols-2 gap-3">
              <FormField label="City *" value={form.city} onChange={setField('city')} placeholder="Telford" />
              <FormField label="Postcode *" value={form.postcode} onChange={setField('postcode')} placeholder="TF1 1AA" />
            </div>

            <div className="border-t border-gray-100 pt-3">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Contact Details (optional)</p>
              <div className="space-y-3">
                <FormField label="Contact Name" value={form.contactName} onChange={setField('contactName')} placeholder="Jane Smith" />
                <div className="grid grid-cols-2 gap-3">
                  <FormField label="Email" value={form.contactEmail} onChange={setField('contactEmail')} type="email" placeholder="jane@facility.nhs.uk" />
                  <FormField label="Phone" value={form.contactPhone} onChange={setField('contactPhone')} placeholder="01952 000000" />
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-primary-700 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-primary-800 disabled:opacity-50 transition-colors"
              >
                {saving ? 'Saving…' : form.id ? 'Update Facility' : 'Create Facility'}
              </button>
              <button
                onClick={() => setForm(null)}
                className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
