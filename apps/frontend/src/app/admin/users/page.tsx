import AdminLayout from '@/components/admin/AdminLayout';
import UserManagement from '@/components/admin/UserManagement';

export default function AdminUsersPage() {
  return (
    <AdminLayout currentPage="Users">
      <UserManagement />
    </AdminLayout>
  );
}
