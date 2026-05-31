import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAddresses, addAddress, updateAddress, deleteAddress } from '../../redux/slices/userSlice';
import ProfileLayout from '../../components/profile/ProfileLayout';
import { FiPlus, FiEdit2, FiTrash2, FiMapPin, FiCheck } from 'react-icons/fi';
import toast from 'react-hot-toast';

const BLANK = {
  label: 'Home', fullName: '', phone: '',
  addressLine1: '', addressLine2: '',
  city: '', postalCode: '', state: '', country: 'Sri Lanka',
  isDefault: false,
};

const MAX_ADDRESSES = 5;

export default function AddressManagement() {
  const dispatch = useDispatch();
  const { addresses } = useSelector((s) => s.user);
  const [showForm, setShowForm]   = useState(false);
  const [editing, setEditing]     = useState(null);
  const [form, setForm]           = useState(BLANK);

  useEffect(() => { dispatch(fetchAddresses()); }, [dispatch]);

  const openAdd = () => { setForm(BLANK); setEditing(null); setShowForm(true); };
  const openEdit = (a) => { setForm({ ...a }); setEditing(a._id); setShowForm(true); };
  const closeForm = () => { setShowForm(false); setEditing(null); setForm(BLANK); };

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editing) {
      const res = await dispatch(updateAddress({ id: editing, data: form }));
      if (res.meta.requestStatus === 'fulfilled') { toast.success('Address updated'); closeForm(); }
      else toast.error('Update failed');
    } else {
      const res = await dispatch(addAddress(form));
      if (res.meta.requestStatus === 'fulfilled') { toast.success('Address added'); closeForm(); }
      else toast.error('Add failed');
    }
  };

  const handleDelete = async (id) => {
    const res = await dispatch(deleteAddress(id));
    if (res.meta.requestStatus === 'fulfilled') toast.success('Address removed');
  };

  const list = addresses || [];
  const slots = MAX_ADDRESSES - list.length;

  const inputCls = 'w-full border border-[#C5C5C5] rounded-[6px] px-3 py-2.5 text-[13px] outline-none focus:border-[#FFB700] bg-[#FAFAFA]';

  return (
    <ProfileLayout>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-[18px] font-black text-[#1A1A1A]">Saved Addresses</h1>
          <p className="text-[12px] text-[#60717B]">{list.length} of {MAX_ADDRESSES} address slots used</p>
        </div>
        {!showForm && list.length < MAX_ADDRESSES && (
          <button
            onClick={openAdd}
            className="flex items-center gap-1.5 bg-[#FFB700] text-black text-[12px] font-bold px-4 py-2.5 rounded-[6px] hover:bg-amber-500 transition-colors"
          >
            <FiPlus size={14} /> Add New Address
          </button>
        )}
      </div>

  
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        {list.map((a) => (
          <div
            key={a._id}
            className={`bg-white border-2 rounded-[10px] p-4 shadow-[2px_3px_8px_rgba(0,0,0,0.04)] relative ${
              a.isDefault ? 'border-[#FFB700]' : 'border-[#E9E9E9]'
            }`}
          >
            {a.isDefault && (
              <span className="absolute top-3 right-3 flex items-center gap-1 text-[10px] font-bold bg-[#FFB700] text-black px-2 py-0.5 rounded-full">
                <FiCheck size={9} strokeWidth={3} /> Default
              </span>
            )}
            <div className="flex items-center gap-1.5 mb-2">
              <span className="text-[10px] font-bold bg-[#F0F0F0] text-[#60717B] px-2 py-0.5 rounded-full uppercase">{a.label}</span>
            </div>
            <p className="text-[13px] font-bold text-[#1A1A1A] mb-0.5">{a.fullName}</p>
            <p className="text-[12px] text-[#60717B]">{a.addressLine1}{a.addressLine2 ? `, ${a.addressLine2}` : ''}</p>
            <p className="text-[12px] text-[#60717B]">{a.city}{a.postalCode ? ` ${a.postalCode}` : ''}, {a.state}</p>
            <p className="text-[12px] text-[#60717B]">{a.country}</p>
            <p className="text-[12px] text-[#60717B] mt-0.5">{a.phone}</p>
            <div className="flex items-center gap-3 mt-3 pt-3 border-t border-[#F5F5F5]">
              <button
                onClick={() => openEdit(a)}
                className="flex items-center gap-1 text-[11px] font-semibold text-[#60717B] hover:text-[#1A1A1A] transition-colors"
              >
                <FiEdit2 size={11} /> Edit
              </button>
              {!a.isDefault && (
                <button
                  onClick={() => dispatch(updateAddress({ id: a._id, data: { ...a, isDefault: true } }))}
                  className="text-[11px] font-semibold text-[#60717B] hover:text-[#1A1A1A] transition-colors"
                >
                  Set as Default
                </button>
              )}
              <button
                onClick={() => handleDelete(a._id)}
                className="flex items-center gap-1 text-[11px] font-semibold text-red-400 hover:text-red-600 transition-colors ml-auto"
              >
                <FiTrash2 size={11} /> Remove
              </button>
            </div>
          </div>
        ))}

        {!showForm && list.length < MAX_ADDRESSES && (
          <button
            onClick={openAdd}
            className="border-2 border-dashed border-[#C5C5C5] rounded-[10px] p-4 flex flex-col items-center justify-center gap-2 min-h-[160px] hover:border-[#FFB700] hover:bg-amber-50/30 transition-colors"
          >
            <FiMapPin size={22} className="text-[#C5C5C5]" />
            <p className="text-[12px] font-semibold text-[#60717B]">Add New Address</p>
            <p className="text-[10px] text-[#C5C5C5]">{slots} slot{slots !== 1 ? 's' : ''} remaining</p>
          </button>
        )}
      </div>

     
      {showForm && (
        <div className="bg-white border border-[#E9E9E9] rounded-[10px] p-5 shadow-[2px_3px_8px_rgba(0,0,0,0.04)]">
          <p className="text-[14px] font-black text-[#1A1A1A] mb-4">
            {editing ? 'Edit Address' : 'Add New Address'}
          </p>
          <form onSubmit={handleSubmit} className="space-y-3">
       
            <div>
              <label className="block text-[11px] font-bold text-[#60717B] uppercase tracking-wider mb-1.5">Address Label</label>
              <div className="flex gap-2">
                {['Home','Work','Other'].map((lbl) => (
                  <button
                    key={lbl}
                    type="button"
                    onClick={() => set('label', lbl)}
                    className={`px-4 py-1.5 rounded-full text-[12px] font-bold border transition-colors ${
                      form.label === lbl ? 'bg-[#FFB700] border-[#FFB700] text-black' : 'border-[#C5C5C5] text-[#60717B] hover:border-[#FFB700]'
                    }`}
                  >
                    {lbl}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#60717B] uppercase tracking-wider mb-1">Full Name</label>
              <input value={form.fullName} onChange={(e) => set('fullName', e.target.value)} required placeholder="e.g. Janith Perera" className={inputCls} />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#60717B] uppercase tracking-wider mb-1">Address Line 1</label>
              <input value={form.addressLine1} onChange={(e) => set('addressLine1', e.target.value)} required placeholder="Street, house number" className={inputCls} />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[#60717B] uppercase tracking-wider mb-1">Address Line 2 <span className="font-normal normal-case text-[#C5C5C5]">(optional)</span></label>
              <input value={form.addressLine2} onChange={(e) => set('addressLine2', e.target.value)} placeholder="Apartment, suite, etc." className={inputCls} />
            </div>

          
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-[#60717B] uppercase tracking-wider mb-1">City</label>
                <input value={form.city} onChange={(e) => set('city', e.target.value)} required placeholder="Colombo" className={inputCls} />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#60717B] uppercase tracking-wider mb-1">Postal Code</label>
                <input value={form.postalCode} onChange={(e) => set('postalCode', e.target.value)} placeholder="00300" className={inputCls} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-[#60717B] uppercase tracking-wider mb-1">Province</label>
                <input value={form.state} onChange={(e) => set('state', e.target.value)} placeholder="Western" className={inputCls} />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#60717B] uppercase tracking-wider mb-1">Country</label>
                <input value={form.country} onChange={(e) => set('country', e.target.value)} className={inputCls} />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#60717B] uppercase tracking-wider mb-1">Phone</label>
              <input value={form.phone} onChange={(e) => set('phone', e.target.value)} required placeholder="+94 77 123 4567" className={inputCls} />
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isDefault}
                onChange={(e) => set('isDefault', e.target.checked)}
                className="accent-[#FFB700] w-4 h-4"
              />
              <span className="text-[12px] text-[#60717B]">Set as default address</span>
            </label>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={closeForm}
                className="flex-1 border border-[#C5C5C5] text-[#1A1A1A] text-[13px] font-bold py-2.5 rounded-[6px] hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 bg-[#FFB700] text-black text-[13px] font-bold py-2.5 rounded-[6px] hover:bg-amber-500 transition-colors"
              >
                {editing ? 'Update Address' : 'Save Address'}
              </button>
            </div>
          </form>
        </div>
      )}
    </ProfileLayout>
  );
}
