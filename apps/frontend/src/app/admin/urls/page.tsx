import AdminLayout from '@/components/admin/AdminLayout';
import UrlManagement from '@/components/admin/UrlManagement';

export default function AdminUrlsPage() {
  return (
    <AdminLayout currentPage="URLs">
      <UrlManagement />
    </AdminLayout>
  );
}
