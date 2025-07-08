'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function VCardRedirect() {
  const { id } = useParams();
  const router = useRouter();

  useEffect(() => {
    if (id) {
      // Redirect to the correct vCard URL
      router.replace(`/vcard/${id}`);
    }
  }, [id, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Redirecting to vCard...</p>
      </div>
    </div>
  );
}
