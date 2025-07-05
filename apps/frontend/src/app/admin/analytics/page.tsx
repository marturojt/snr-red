import AdminLayout from '@/components/admin/AdminLayout';
import AdminAnalytics from '@/components/admin/AdminAnalytics';

export default function AdminAnalyticsPage() {
  return (
    <AdminLayout currentPage="Analytics">
      <AdminAnalytics />
    </AdminLayout>
  );
}
