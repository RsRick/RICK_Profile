import { useState, useEffect } from 'react';
import { Link2, Plus, Search, Edit2, Trash2, Copy, BarChart3, ExternalLink, CheckCircle2, XCircle, Globe, TrendingUp, QrCode, Download } from 'lucide-react';
import { listShortlinks, deleteShortlink, createShortlink, updateShortlink } from '../../../lib/shortlinkService';
import { getAnalyticsSummary } from '../../../lib/analyticsService';
import { useToast } from '../../../contexts/ToastContext';
import { useAuth } from '../../../contexts/AuthContext';
import ShortlinkForm from './ShortlinkForm';
import AnalyticsDashboard from './AnalyticsDashboard';
import DomainManagement from './DomainManagement';
import QRCode from 'qrcode';

export default function ShortlinkManagement() {
  const [shortlinks, setShortlinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingShortlink, setEditingShortlink] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedShortlink, setSelectedShortlink] = useState(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showDomains, setShowDomains] = useState(false);
  const [analyticsData, setAnalyticsData] = useState({});
  const { showToast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    loadShortlinks();
  }, []);

  const loadShortlinks = async () => {
    try {
      setLoading(true);
      const response = await listShortlinks({ limit: 100 });
      setShortlinks(response.documents);
      
      // Load analytics summary for each shortlink
      const analyticsPromises = response.documents.map(async (link) => {
        try {
          const summary = await getAnalyticsSummary(link.$id);
          return { id: link.$id, summary };
        } catch (error) {
          return { id: link.$id, summary: { totalClicks: 0 } };
        }
      });
      
      const analyticsResults = await Promise.all(analyticsPromises);
      const analyticsMap = {};
      analyticsResults.forEach(({ id, summary }) => {
        analyticsMap[id] = summary;
      });
      setAnalyticsData(analyticsMap);
    } catch (error) {
      console.error('Error loading shortlinks:', error);
      showToast('Failed to load shortlinks', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingShortlink(null);
    setShowForm(true);
  };

  const handleEdit = (shortlink) => {
    setEditingShortlink(shortlink);
    setShowForm(true);
  };

  const handleDelete = async (shortlink) => {
    if (!window.confirm(`Are you sure you want to delete the shortlink "${shortlink.customPath}"?`)) {
      return;
    }

    try {
      await deleteShortlink(shortlink.$id);
      showToast('Shortlink deleted successfully', 'success');
      loadShortlinks();
    } catch (error) {
      console.error('Error deleting shortlink:', error);
      showToast('Failed to delete shortlink', 'error');
    }
  };

  const handleCopy = (shortlink) => {
    const url = `${window.location.origin}/${shortlink.customPath}`;
    navigator.clipboard.writeText(url);
    showToast('Short URL copied to clipboard', 'success');
  };

  const handleViewAnalytics = (shortlink) => {
    setSelectedShortlink(shortlink);
    setShowAnalytics(true);
  };

  const handleDownloadQR = async (shortlink) => {
    try {
      const url = `${window.location.origin}/${shortlink.customPath}`;
      const qrDataUrl = await QRCode.toDataURL(url, {
        width: 512,
        margin: 2,
        color: {
          dark: '#105652',
          light: '#FFFFFF'
        }
      });
      
      const link = document.createElement('a');
      link.href = qrDataUrl;
      link.download = `qr-${shortlink.customPath}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('QR code downloaded successfully', 'success');
    } catch (error) {
      console.error('Error generating QR code:', error);
      showToast('Failed to generate QR code', 'error');
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (editingShortlink) {
        await updateShortlink(editingShortlink.$id, {
          ...formData,
          userId: user.$id
        });
        showToast('Shortlink updated successfully', 'success');
      } else {
        await createShortlink({
          ...formData,
          userId: user.$id
        });
        showToast('Shortlink created successfully', 'success');
      }
      setShowForm(false);
      setEditingShortlink(null);
      loadShortlinks();
    } catch (error) {
      console.error('Error saving shortlink:', error);
      showToast(error.message || 'Failed to save shortlink', 'error');
      throw error;
    }
  };

  const filteredShortlinks = shortlinks.filter(link =>
    link.customPath.toLowerCase().includes(searchQuery.toLowerCase()) ||
    link.destinationUrl.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (showAnalytics && selectedShortlink) {
    return (
      <AnalyticsDashboard
        shortlink={selectedShortlink}
        onBack={() => {
          setShowAnalytics(false);
          setSelectedShortlink(null);
        }}
      />
    );
  }

  if (showDomains) {
    return (
      <DomainManagement
        onBack={() => setShowDomains(false)}
      />
    );
  }

  if (showForm) {
    return (
      <ShortlinkForm
        shortlink={editingShortlink}
        onSubmit={handleFormSubmit}
        onCancel={() => {
          setShowForm(false);
          setEditingShortlink(null);
        }}
      />
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: '#105652' }}>
            Shortlink Management
          </h1>
          <p className="text-gray-600 mt-1">
            Create and manage shortened URLs with analytics
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowDomains(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all duration-300 hover:scale-105"
            style={{ borderColor: '#105652', color: '#105652' }}
          >
            <Globe className="w-5 h-5" />
            Manage Domains
          </button>
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-white transition-all duration-300 hover:scale-105"
            style={{ backgroundColor: '#105652' }}
          >
            <Plus className="w-5 h-5" />
            Create Shortlink
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by path or destination URL..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2"
            style={{ borderColor: '#105652' }}
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Shortlinks</p>
              <p className="text-3xl font-bold mt-1" style={{ color: '#105652' }}>
                {shortlinks.length}
              </p>
            </div>
            <Link2 className="w-12 h-12 text-gray-300" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Clicks</p>
              <p className="text-3xl font-bold mt-1" style={{ color: '#105652' }}>
                {Object.values(analyticsData).reduce((sum, data) => sum + (data.totalClicks || 0), 0)}
              </p>
            </div>
            <TrendingUp className="w-12 h-12 text-gray-300" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Active Links</p>
              <p className="text-3xl font-bold mt-1" style={{ color: '#105652' }}>
                {shortlinks.filter(link => link.isActive).length}
              </p>
            </div>
            <CheckCircle2 className="w-12 h-12 text-gray-300" />
          </div>
        </div>
      </div>

      {/* Shortlinks List */}
      {loading ? (
        <div className="bg-white rounded-lg shadow-lg p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: '#105652' }}></div>
          <p className="text-gray-600 mt-4">Loading shortlinks...</p>
        </div>
      ) : filteredShortlinks.length === 0 ? (
        <div className="bg-white rounded-lg shadow-lg p-12 text-center">
          <Link2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            {searchQuery ? 'No shortlinks found' : 'No shortlinks yet'}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchQuery
              ? 'Try adjusting your search query'
              : 'Create your first shortlink to get started'}
          </p>
          {!searchQuery && (
            <button
              onClick={handleCreate}
              className="px-6 py-3 rounded-lg text-white transition-all duration-300 hover:scale-105"
              style={{ backgroundColor: '#105652' }}
            >
              Create Shortlink
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Short URL
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Destination
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Clicks
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredShortlinks.map((link) => (
                  <tr key={link.$id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Link2 className="w-4 h-4 text-gray-400" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            /{link.customPath}
                          </div>
                          {link.previewImageUrl && (
                            <div className="text-xs text-gray-500 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              Has preview
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 truncate max-w-xs" title={link.destinationUrl}>
                        {link.destinationUrl}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">
                          {analyticsData[link.$id]?.totalClicks || 0}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {link.isActive ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle2 className="w-3 h-3" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          <XCircle className="w-3 h-3" />
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(link.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleCopy(link)}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Copy URL"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDownloadQR(link)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          style={{ color: '#105652' }}
                          title="Download QR Code"
                        >
                          <QrCode className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => window.open(`/${link.customPath}`, '_blank')}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Test Link"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleViewAnalytics(link)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          style={{ color: '#105652' }}
                          title="View Analytics"
                        >
                          <BarChart3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(link)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(link)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
