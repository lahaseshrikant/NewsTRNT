'use client';

import { useState, useEffect } from 'react';

interface CryptoConfig {
  id: string;
  symbol: string;
  name: string;
  coinGeckoId: string;
  isActive: boolean;
  sortOrder: number;
}

export default function CryptocurrenciesConfigPage() {
  const [cryptos, setCryptos] = useState<CryptoConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<CryptoConfig>>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    fetchCryptos();
  }, []);

  const fetchCryptos = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/market-config/cryptos?includeInactive=true');
      const data = await response.json();
      setCryptos(data.cryptos || []);
    } catch (error) {
      console.error('Failed to fetch cryptos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (id?: string) => {
    if (!formData.symbol || !formData.name || !formData.coinGeckoId) {
      setFormError('Symbol, name, and CoinGecko ID are required.');
      return;
    }

    try {
      setSaving(true);
      setFormError(null);

      const symbol = formData.symbol!.toUpperCase().trim();
      const name = formData.name!.trim();
      const coinGeckoId = formData.coinGeckoId!.toLowerCase().trim();

      const url = id 
        ? `/api/admin/market-config/cryptos/${id}` 
        : '/api/admin/market-config/cryptos';
      
      const method = id ? 'PUT' : 'POST';

      const normalizedSort =
        formData.sortOrder !== undefined && formData.sortOrder !== null && !Number.isNaN(Number(formData.sortOrder))
          ? Number(formData.sortOrder)
          : undefined;

      const payload = {
        symbol,
        name,
        coinGeckoId,
        isActive: formData.isActive ?? true,
        sortOrder: normalizedSort,
      };
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        await fetchCryptos();
        setEditingId(null);
        setShowAddForm(false);
        setFormData({});
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.error || 'Failed to save cryptocurrency.');
      }
    } catch (error) {
      console.error('Failed to save crypto:', error);
      setFormError(error instanceof Error ? error.message : 'Failed to save cryptocurrency.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this cryptocurrency?')) return;

    try {
      const response = await fetch(`/api/admin/market-config/cryptos/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchCryptos();
      }
    } catch (error) {
      console.error('Failed to delete crypto:', error);
    }
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    try {
      await fetch(`/api/admin/market-config/cryptos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive }),
      });
      await fetchCryptos();
    } catch (error) {
      console.error('Failed to toggle active status:', error);
    }
  };

  const startEdit = (crypto: CryptoConfig) => {
    setEditingId(crypto.id);
    setFormData(crypto);
    setShowAddForm(false);
    setFormError(null);
  };

  const startAdd = () => {
    setShowAddForm(true);
    setEditingId(null);
    setFormData({
      isActive: true,
      sortOrder: cryptos.length + 1,
    });
    setFormError(null);
  };

  const cancelForm = () => {
    setShowAddForm(false);
    setEditingId(null);
    setFormData({});
    setFormError(null);
  };

  const isEditing = Boolean(editingId);
  const isFormVisible = showAddForm || isEditing;

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
            <h1 className="text-3xl font-bold">Cryptocurrencies Configuration</h1>
            <p className="mt-2 text-muted-foreground">Manage cryptocurrencies displayed in the platform</p>
          </div>
          <button
            onClick={startAdd}
            className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 transition"
          >
            + Add Crypto
          </button>
        </div>

        {/* Add Form */}
        {isFormVisible && (
          <div className="bg-card rounded-lg shadow-md p-6 mb-6 border border-border">
            <h3 className="text-xl font-semibold mb-4">{isEditing ? 'Edit Cryptocurrency' : 'Add New Cryptocurrency'}</h3>
            {formError && (
              <div className="mb-4 rounded border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {formError}
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Symbol (e.g., BTC)"
                value={formData.symbol || ''}
                onChange={(e) => setFormData({ ...formData, symbol: e.target.value.toUpperCase() })}
                className="border border-border rounded px-3 py-2 bg-background text-foreground placeholder:text-muted-foreground/80 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                required
              />
              <input
                type="text"
                placeholder="Name (e.g., Bitcoin)"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="border border-border rounded px-3 py-2 bg-background text-foreground placeholder:text-muted-foreground/80 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                required
              />
              <input
                type="text"
                placeholder="CoinGecko ID (e.g., bitcoin)"
                value={formData.coinGeckoId || ''}
                onChange={(e) => setFormData({ ...formData, coinGeckoId: e.target.value.toLowerCase() })}
                className="border border-border rounded px-3 py-2 bg-background text-foreground placeholder:text-muted-foreground/80 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                required
              />
              <input
                type="number"
                placeholder="Sort Order"
                value={formData.sortOrder || ''}
                onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) })}
                className="border border-border rounded px-3 py-2 bg-background text-foreground placeholder:text-muted-foreground/80 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
              />
              <div className="flex items-center col-span-2">
                <label className="flex items-center text-sm text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={formData.isActive || false}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-foreground">Active (enable tracking)</span>
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

        {/* Cryptos Table */}
        <div className="bg-card rounded-lg shadow-md overflow-hidden border border-border">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted/60">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Symbol</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">CoinGecko ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Sort Order</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {cryptos.map((crypto) => (
                <tr key={crypto.id} className={`${!crypto.isActive ? 'opacity-50' : ''} hover:bg-muted/60`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-mono font-bold text-primary">{crypto.symbol}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{crypto.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground font-mono">{crypto.coinGeckoId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{crypto.sortOrder}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => toggleActive(crypto.id, crypto.isActive)}
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        crypto.isActive
                          ? 'bg-emerald-500/10 text-emerald-500'
                          : 'bg-rose-500/10 text-rose-500'
                      }`}
                    >
                      {crypto.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => startEdit(crypto)}
                      className="text-primary hover:text-primary/80 mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(crypto.id)}
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

        {cryptos.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No cryptocurrencies configured yet. Click "Add Cryptocurrency" to get started.
          </div>
        )}
      </div>
    </div>
  );
}

