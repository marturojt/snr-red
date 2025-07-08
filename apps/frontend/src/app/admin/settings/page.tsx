import AdminLayout from '@/components/admin/AdminLayout';
import AdminSettings from '@/components/admin/AdminSettings';

export default function AdminSettingsPage() {
  return (
    <AdminLayout currentPage="Settings">
      <AdminSettings />
    </AdminLayout>
  );
}
