'use client';

import React, { useEffect, useState } from 'react';
import { SuperAdminRoute } from '@/components/auth/RouteGuard';
import adminAuth from '@/lib/admin-auth';
import { API_CONFIG } from '@/config/api';
const API_URL = API_CONFIG.baseURL;

interface ScrapedItem {
  id: string;
  itemType: string;
  payload: any;
  scrapedAt: string;
  isApproved: boolean;
}

const ScrapedItemsPage: React.FC = () => {
  const [items, setItems] = useState<ScrapedArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);

  const fetchPage = async (pg = 0) => {
    setLoading(true);
    try {
      const token = adminAuth.getToken();
      const res = await fetch(`${API_URL}/admin/scraped-items?status=pending&limit=20&offset=${pg * 20}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setItems(data.items);
        setTotal(data.total);
        setPage(pg);
      }
    } catch (err) {
      console.error('Failed to load scraped articles', err);
    } finally {
      setLoading(false);
    }
  };

  const approve = async (id: string) => {
    try {
      const token = adminAuth.getToken();
      const res = await fetch(`${API_URL}/admin/scraped-items/${id}/approve`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        fetchPage(page);
      }
    } catch (err) {
      console.error('approve failed', err);
    }
  };

  useEffect(() => {
    fetchPage(0);
  }, []);

  return (
    <SuperAdminRoute>
      <div className="p-6 space-y-6">
        <h1 className="text-3xl font-bold">Scraped Items</h1>
        {loading ? (
          <div>Loading…</div>
        ) : (
          <>
            <table className="min-w-full bg-white">
              <thead>
                <tr>
                  <th className="px-4 py-2">Title</th>
                  <th className="px-4 py-2">Scraped At</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {items.map(it => (
                  <tr key={it.id} className="border-t">
                    <td className="px-4 py-2">
                      <div className="truncate max-w-xs">{it.itemType}</div>
                    </td>
                    <td className="px-4 py-2">{new Date(it.scrapedAt).toLocaleString()}</td>
                    <td className="px-4 py-2">{it.isApproved ? 'Approved' : 'Pending'}</td>
                    <td className="px-4 py-2">
                      {!it.isApproved && (
                        <button onClick={() => approve(it.id)} className="px-2 py-1 bg-green-600 text-white rounded">
                          Approve
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-between mt-4">
              <button disabled={page === 0} onClick={() => fetchPage(page - 1)} className="px-3 py-1 border rounded">Prev</button>
              <button disabled={(page + 1) * 20 >= total} onClick={() => fetchPage(page + 1)} className="px-3 py-1 border rounded">Next</button>
            </div>
          </>
        )}
      </div>
    </SuperAdminRoute>
  );
};

export default ScrapedItemsPage;
