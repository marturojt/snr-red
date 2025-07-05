import AdminLayout from '@/components/admin/AdminLayout';

export default function AdminSecurityPage() {
  return (
    <AdminLayout currentPage="Security">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Security</h1>
          <p className="text-gray-600">Security monitoring and management</p>
        </div>
        
        <div className="text-center py-12">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Security Module</h2>
          <p className="text-gray-600">This section will include security logs, IP blocking, and threat monitoring.</p>
          <p className="text-sm text-gray-500 mt-4">Coming soon...</p>
        </div>
      </div>
    </AdminLayout>
  );
}
