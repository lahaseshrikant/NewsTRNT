'use client';

import { useState, useEffect } from 'react';

interface MarketIndexConfig {
  id: string;
  symbol: string;
  name: string;
  country: string;
  region: string[];
  exchange: string;
  currency: string;
  timezone: string;
  marketHours: { open: string; close: string };
  isActive: boolean;
  isGlobal: boolean;
  sortOrder: number;
}

export default function MarketIndicesConfigPage() {
  const [indices, setIndices] = useState<MarketIndexConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<MarketIndexConfig>>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    fetchIndices();
  }, []);

  const fetchIndices = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/market-config/indices');
      const data = await response.json();
      setIndices(data.indices || []);
    } catch (error) {
      console.error('Failed to fetch indices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (id?: string) => {
    if (!formData.symbol || !formData.name || !formData.country || !formData.exchange || !formData.currency) {
      setFormError('Please fill out symbol, name, country, exchange, and currency before saving.');
      return;
    }

    try {
      setSaving(true);
      setFormError(null);

      const url = id 
        ? `/api/admin/market-config/indices/${id}` 
        : '/api/admin/market-config/indices';
      
      const method = id ? 'PUT' : 'POST';

      const payload = {
        ...formData,
        sortOrder:
          formData.sortOrder !== undefined && formData.sortOrder !== null
            ? Number(formData.sortOrder)
            : undefined,
      };
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        await fetchIndices();
        setEditingId(null);
        setShowAddForm(false);
        setFormData({});
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.error || 'Failed to save index.');
      }
    } catch (error) {
      console.error('Failed to save index:', error);
      setFormError(error instanceof Error ? error.message : 'Failed to save index.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this index?')) return;

    try {
      const response = await fetch(`/api/admin/market-config/indices/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchIndices();
      }
    } catch (error) {
      console.error('Failed to delete index:', error);
    }
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    try {
      await fetch(`/api/admin/market-config/indices/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive }),
      });
      await fetchIndices();
    } catch (error) {
      console.error('Failed to toggle active status:', error);
    }
  };

  const startEdit = (index: MarketIndexConfig) => {
    setEditingId(index.id);
    setFormData(index);
    setShowAddForm(false);
    setFormError(null);
  };

  const startAdd = () => {
    setShowAddForm(true);
    setEditingId(null);
    setFormData({
      isActive: true,
      isGlobal: false,
      sortOrder: indices.length + 1,
      region: [],
      marketHours: { open: '09:30', close: '16:00' },
    });
    setFormError(null);
  };

  const cancelForm = () => {
    setShowAddForm(false);
    setEditingId(null);
    setFormError(null);
    setFormData({});
  };

  const isFormVisible = showAddForm || editingId;
  const isEditing = Boolean(editingId);

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Market Indices Configuration</h1>
            <p className="mt-2 text-muted-foreground">Manage stock market indices displayed in the platform</p>
          </div>
          <button
            onClick={startAdd}
            className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 transition"
          >
            + Add Index
          </button>
        </div>

        {/* Add Form */}
        {isFormVisible && (
          <div className="bg-card rounded-lg shadow-md p-6 mb-6 border border-border">
            <h3 className="text-xl font-semibold mb-4">{isEditing ? 'Edit Index' : 'Add New Index'}</h3>
            {formError && (
              <div className="mb-4 rounded border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {formError}
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Symbol (e.g., ^GSPC)"
                value={formData.symbol || ''}
                onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                className="border border-border rounded px-3 py-2 bg-background text-foreground placeholder:text-muted-foreground/80 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                required
              />
              <input
                type="text"
                placeholder="Name (e.g., S&P 500)"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="border border-border rounded px-3 py-2 bg-background text-foreground placeholder:text-muted-foreground/80 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                required
              />
              <input
                type="text"
                placeholder="Country (e.g., US)"
                value={formData.country || ''}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className="border border-border rounded px-3 py-2 bg-background text-foreground placeholder:text-muted-foreground/80 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                required
              />
              <input
                type="text"
                placeholder="Exchange (e.g., NYSE)"
                value={formData.exchange || ''}
                onChange={(e) => setFormData({ ...formData, exchange: e.target.value })}
                className="border border-border rounded px-3 py-2 bg-background text-foreground placeholder:text-muted-foreground/80 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                required
              />
              <input
                type="text"
                placeholder="Currency (e.g., USD)"
                value={formData.currency || ''}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="border border-border rounded px-3 py-2 bg-background text-foreground placeholder:text-muted-foreground/80 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                required
              />
              <input
                type="text"
                placeholder="Timezone"
                value={formData.timezone || ''}
                onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                className="border border-border rounded px-3 py-2 bg-background text-foreground placeholder:text-muted-foreground/80 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
              />
              <input
                type="text"
                placeholder="Regions (comma separated, e.g., AMERICAS, GLOBAL)"
                value={formData.region?.join(', ') || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    region: e.target.value
                      .split(',')
                      .map((item) => item.trim())
                      .filter(Boolean),
                  })
                }
                className="border border-border rounded px-3 py-2 bg-background text-foreground placeholder:text-muted-foreground/80 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
              />
              <input
                type="number"
                placeholder="Sort Order"
                value={formData.sortOrder ?? ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    sortOrder: e.target.value === '' ? undefined : Number(e.target.value),
                  })
                }
                className="border border-border rounded px-3 py-2 bg-background text-foreground placeholder:text-muted-foreground/80 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                min={0}
              />
              <div className="flex gap-4">
                <label className="flex items-center text-sm text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={formData.isGlobal || false}
                    onChange={(e) => setFormData({ ...formData, isGlobal: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-foreground">Global Index</span>
                </label>
                <label className="flex items-center text-sm text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={formData.isActive || false}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-foreground">Active</span>
                </label>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => handleSave(editingId || undefined)}
                disabled={saving}
                className="bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-500 transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving…' : 'Save'}
              </button>
              <button
                onClick={cancelForm}
                className="bg-slate-600 text-white px-4 py-2 rounded hover:bg-slate-500 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Indices Table */}
        <div className="bg-card rounded-lg shadow-md overflow-hidden border border-border">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted/60">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Symbol</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Country</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Exchange</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Currency</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Global</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {indices.map((index) => (
                <tr key={index.id} className={`${!index.isActive ? 'opacity-50' : ''} hover:bg-muted/60`}>
                  <td className="px-6 py-4 whitespace-nowrap font-mono text-sm text-foreground">{index.symbol}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{index.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{index.country}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{index.exchange}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{index.currency}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {index.isGlobal ? (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-primary/10 text-primary">
                        Global
                      </span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => toggleActive(index.id, index.isActive)}
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        index.isActive
                          ? 'bg-emerald-500/10 text-emerald-500'
                          : 'bg-rose-500/10 text-rose-500'
                      }`}
                    >
                      {index.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => startEdit(index)}
                      className="text-primary hover:text-primary/80 mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(index.id)}
                      className="text-destructive hover:text-destructive/80"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {indices.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No indices configured yet. Click "Add Index" to get started.
          </div>
        )}
      </div>
    </div>
  );
}
