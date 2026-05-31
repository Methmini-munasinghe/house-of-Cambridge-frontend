import { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchAdminUsers, updateAdminUser, deleteAdminUser, createAdmin,
} from '../../redux/slices/adminSlice.js';
import AdminLayout from '../../components/admin/AdminLayout.jsx';
import ConfirmModal from '../../components/ui/ConfirmModal.jsx';
import { ToastContainer } from '../../components/ui/Toast.jsx';
import useToast from '../../hooks/useToast.js';
import { FiSearch, FiEdit2, FiTrash2, FiPlus, FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const PAGE_SIZE = 20;

const ROLES = ['user', 'admin', 'superadmin'];

const ROLE_BADGE = {
  user:       'bg-gray-100   text-gray-600',
  admin:      'bg-blue-100   text-blue-700',
  superadmin: 'bg-purple-100 text-purple-700',
};

const INPUT_CLS =
  'w-full px-3 py-2 text-[13px] border border-[#E9E9E9] rounded-[8px] bg-[#FAFAFA] focus:outline-none focus:border-[#FFB700]';

const ADMIN_FIELDS = [
  { key: 'name',     label: 'Full Name', type: 'text',     required: true },
  { key: 'email',    label: 'Email',     type: 'email',    required: true },
  { key: 'password', label: 'Password',  type: 'password', required: true },
];

export default function AdminUsers() {
  const dispatch = useDispatch();
  const { users, usersTotal, loading } = useSelector((s) => s.admin);
  const { user: me }                   = useSelector((s) => s.auth);
  const { toasts, toast, removeToast } = useToast();

  const [search,       setSearch]       = useState('');
  const [roleFilter,   setRoleFilter]   = useState('');
  const [page,         setPage]         = useState(1);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [delLoading,   setDelLoading]   = useState(false);
  const [editTarget,   setEditTarget]   = useState(null);
  const [editForm,     setEditForm]     = useState({});
  const [saving,       setSaving]       = useState(false);
  const [showCreate,   setShowCreate]   = useState(false);
  const [createForm,   setCreateForm]   = useState({ name: '', email: '', password: '', role: 'admin' });
  const [creating,     setCreating]     = useState(false);

  const pages        = Math.ceil((usersTotal ?? 0) / PAGE_SIZE);
  const isSuperAdmin = me?.role === 'superadmin';

  const load = useCallback((s = search, r = roleFilter, p = page) => {
    dispatch(fetchAdminUsers({
      search: s || undefined,
      role:   r || undefined,
      page:   p,
      limit:  PAGE_SIZE,
    }));
  }, [dispatch, search, roleFilter, page]);

  useEffect(() => { load(search, roleFilter, page); }, [page]);

  const openEdit = (u) => {
    setEditTarget(u);
    setEditForm({ role: u.role, isActive: u.isActive !== false, loyaltyPoints: u.loyaltyPoints ?? 0 });
  };

  const handleDelete = async () => {
    setDelLoading(true);
    try {
      await dispatch(deleteAdminUser(deleteTarget._id)).unwrap();
      toast.success(`User "${deleteTarget.name}" deleted`);
      setDeleteTarget(null);
      load(search, roleFilter, page);
    } catch (err) {
      toast.error(typeof err === 'string' ? err : 'Delete failed');
    } finally {
      setDelLoading(false);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await dispatch(updateAdminUser({ id: editTarget._id, data: editForm })).unwrap();
      toast.success('User updated');
      setEditTarget(null);
      load(search, roleFilter, page);
    } catch (err) {
      toast.error(typeof err === 'string' ? err : 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    if (createForm.password.length < 8) return toast.error('Password must be at least 8 characters');
    setCreating(true);
    try {
      await dispatch(createAdmin(createForm)).unwrap();
      toast.success('Admin account created');
      setShowCreate(false);
      setCreateForm({ name: '', email: '', password: '', role: 'admin' });
      load(search, roleFilter, page);
    } catch (err) {
      toast.error(typeof err === 'string' ? err : 'Create failed');
    } finally {
      setCreating(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-3 justify-between">
          <h2 className="text-[20px] font-black text-[#1A1A1A]">
            Users <span className="text-[#60717B] font-normal text-[16px]">({usersTotal ?? 0})</span>
          </h2>
          {isSuperAdmin && (
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#FFB700] text-[#1A1A1A] font-semibold text-[13px] rounded-[8px] hover:bg-amber-400 transition-colors"
            >
              <FiPlus size={16} aria-hidden="true" /> Create Admin
            </button>
          )}
        </div>

        <div className="bg-white rounded-[12px] border border-[#E9E9E9] p-4 flex flex-wrap gap-3">
          <form onSubmit={(e) => { e.preventDefault(); setPage(1); load(search, roleFilter, 1); }} className="flex gap-2 flex-1 min-w-[200px]" role="search">
            <div className="relative flex-1">
              <FiSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#60717B]" aria-hidden="true" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name or email…"
                aria-label="Search users"
                className="w-full pl-8 pr-3 py-2 text-[13px] border border-[#E9E9E9] rounded-[8px] bg-[#FAFAFA] focus:outline-none focus:border-[#FFB700]"
              />
            </div>
            <button type="submit" className="px-4 py-2 bg-[#FFB700] text-[#1A1A1A] font-semibold text-[13px] rounded-[8px] hover:bg-amber-400 transition-colors">Search</button>
          </form>
          <select
            value={roleFilter}
            onChange={(e) => { setRoleFilter(e.target.value); setPage(1); load(search, e.target.value, 1); }}
            aria-label="Filter by role"
            className="px-3 py-2 text-[13px] border border-[#E9E9E9] rounded-[8px] bg-[#FAFAFA] focus:outline-none focus:border-[#FFB700]"
          >
            <option value="">All Roles</option>
            {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>

        <div className="bg-white rounded-[12px] border border-[#E9E9E9] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead className="bg-[#FAFAFA] border-b border-[#E9E9E9]">
                <tr>
                  {['Name', 'Email', 'Role', 'Points', 'Joined', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-semibold text-[#60717B] whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading && !users.length ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-[#60717B]">
                      <div className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-[#FFB700] border-t-transparent rounded-full animate-spin" aria-hidden="true" />
                        Loading…
                      </div>
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-12 text-[#60717B]">No users found</td></tr>
                ) : users.map((u) => (
                  <tr key={u._id} className="border-b border-[#F4F5F7] hover:bg-[#FAFAFA] transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-[#FFB700]/20 flex items-center justify-center text-[#FFB700] text-[11px] font-bold flex-shrink-0" aria-hidden="true">
                          {u.name?.[0]?.toUpperCase()}
                        </div>
                        <span className="font-semibold text-[#1A1A1A]">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[#60717B]">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold capitalize ${ROLE_BADGE[u.role] ?? 'bg-gray-100 text-gray-600'}`}>{u.role}</span>
                    </td>
                    <td className="px-4 py-3 text-[#60717B]">{u.loyaltyPoints ?? 0}</td>
                    <td className="px-4 py-3 text-[#60717B] whitespace-nowrap">
                      <time dateTime={u.createdAt}>{new Date(u.createdAt).toLocaleDateString('en-GB')}</time>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${u.isActive !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {u.isActive !== false ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(u)} aria-label={`Edit ${u.name}`} className="text-[#60717B] hover:text-[#1A1A1A] transition-colors"><FiEdit2 size={15} /></button>
                        {isSuperAdmin && u._id !== me._id && (
                          <button onClick={() => setDeleteTarget(u)} aria-label={`Delete ${u.name}`} className="text-[#60717B] hover:text-red-600 transition-colors"><FiTrash2 size={15} /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {pages > 1 && (
            <div className="px-4 py-3 border-t border-[#E9E9E9] flex items-center justify-between">
              <p className="text-[13px] text-[#60717B]">Page {page} of {pages}</p>
              <div className="flex gap-2">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} aria-label="Previous page" className="p-2 rounded-[6px] border border-[#E9E9E9] disabled:opacity-40 hover:bg-[#FAFAFA] transition-colors"><FiChevronLeft size={14} /></button>
                <button onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page === pages} aria-label="Next page" className="p-2 rounded-[6px] border border-[#E9E9E9] disabled:opacity-40 hover:bg-[#FAFAFA] transition-colors"><FiChevronRight size={14} /></button>
              </div>
            </div>
          )}
        </div>
      </div>

      {editTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Edit User">
          <div className="absolute inset-0 bg-black/40" onClick={() => setEditTarget(null)} aria-hidden="true" />
          <form onSubmit={handleEdit} className="relative bg-white rounded-[12px] shadow-2xl w-full max-w-[400px] p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[16px] font-bold text-[#1A1A1A]">Edit User</h3>
              <button type="button" onClick={() => setEditTarget(null)} aria-label="Close dialog" className="text-[#60717B] hover:text-[#1A1A1A] transition-colors"><FiX size={20} /></button>
            </div>
            <p className="text-[13px] text-[#60717B] mb-4">{editTarget.name} · {editTarget.email}</p>
            <div className="space-y-3">
              <div>
                <label htmlFor="edit-role" className="text-[13px] font-semibold text-[#1A1A1A] block mb-1">Role</label>
                <select
                  id="edit-role"
                  value={editForm.role}
                  onChange={(e) => setEditForm((f) => ({ ...f, role: e.target.value }))}
                  disabled={!isSuperAdmin && ['admin', 'superadmin'].includes(editForm.role)}
                  className={INPUT_CLS}
                >
                  {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="edit-points" className="text-[13px] font-semibold text-[#1A1A1A] block mb-1">Loyalty Points</label>
                <input
                  id="edit-points"
                  type="number"
                  min={0}
                  value={editForm.loyaltyPoints}
                  onChange={(e) => setEditForm((f) => ({ ...f, loyaltyPoints: Number(e.target.value) }))}
                  className={INPUT_CLS}
                />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editForm.isActive}
                  onChange={(e) => setEditForm((f) => ({ ...f, isActive: e.target.checked }))}
                  className="w-4 h-4 accent-[#FFB700]"
                />
                <span className="text-[13px] text-[#1A1A1A] font-medium">Account Active</span>
              </label>
            </div>
            <div className="flex gap-3 mt-5">
              <button type="button" onClick={() => setEditTarget(null)} className="flex-1 py-2.5 border border-[#E9E9E9] rounded-[8px] text-[13px] font-medium text-[#60717B] hover:bg-[#FAFAFA] transition-colors">Cancel</button>
              <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-[#FFB700] rounded-[8px] text-[13px] font-bold text-[#1A1A1A] hover:bg-amber-400 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors">
                {saving && <span className="w-4 h-4 border-2 border-[#1A1A1A] border-t-transparent rounded-full animate-spin" aria-hidden="true" />}
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Create Admin Account">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowCreate(false)} aria-hidden="true" />
          <form onSubmit={handleCreateAdmin} className="relative bg-white rounded-[12px] shadow-2xl w-full max-w-[400px] p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[16px] font-bold text-[#1A1A1A]">Create Admin Account</h3>
              <button type="button" onClick={() => setShowCreate(false)} aria-label="Close dialog" className="text-[#60717B] hover:text-[#1A1A1A] transition-colors"><FiX size={20} /></button>
            </div>
            <div className="space-y-3">
              {ADMIN_FIELDS.map(({ key, label, type, required }) => (
                <div key={key}>
                  <label htmlFor={`create-${key}`} className="text-[13px] font-semibold text-[#1A1A1A] block mb-1">
                    {label} {required && <span className="text-red-500" aria-hidden="true">*</span>}
                  </label>
                  <input
                    id={`create-${key}`}
                    type={type}
                    required={required}
                    value={createForm[key]}
                    onChange={(e) => setCreateForm((f) => ({ ...f, [key]: e.target.value }))}
                    minLength={key === 'password' ? 8 : undefined}
                    className={INPUT_CLS}
                  />
                </div>
              ))}
              <div>
                <label htmlFor="create-role" className="text-[13px] font-semibold text-[#1A1A1A] block mb-1">Role</label>
                <select id="create-role" value={createForm.role} onChange={(e) => setCreateForm((f) => ({ ...f, role: e.target.value }))} className={INPUT_CLS}>
                  <option value="admin">Admin</option>
                  <option value="superadmin">Super Admin</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button type="button" onClick={() => setShowCreate(false)} className="flex-1 py-2.5 border border-[#E9E9E9] rounded-[8px] text-[13px] font-medium text-[#60717B] hover:bg-[#FAFAFA] transition-colors">Cancel</button>
              <button type="submit" disabled={creating} className="flex-1 py-2.5 bg-[#FFB700] rounded-[8px] text-[13px] font-bold text-[#1A1A1A] hover:bg-amber-400 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors">
                {creating && <span className="w-4 h-4 border-2 border-[#1A1A1A] border-t-transparent rounded-full animate-spin" aria-hidden="true" />}
                Create Admin
              </button>
            </div>
          </form>
        </div>
      )}

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete User"
        message={`Delete "${deleteTarget?.name}"? Their account data will be permanently removed. Users with active orders cannot be deleted.`}
        confirmLabel="Delete User"
        variant="danger"
        loading={delLoading}
      />
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </AdminLayout>
  );
}