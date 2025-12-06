import { useState, useEffect } from 'react';
import { ArrowLeft, Mail, Eye, MousePointer, CheckCircle, XCircle, Clock, RefreshCw, Download, Search } from 'lucide-react';
import { newsletterService } from '../../../lib/appwrite';

export default function CampaignReport({ campaign, onBack }) {
  const [tracking, setTracking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // all, opened, clicked, failed

  useEffect(() => {
    fetchTracking();
  }, [campaign.$id]);

  const fetchTracking = async () => {
    setLoading(true);
    const result = await newsletterService.getCampaignTracking(campaign.$id);
    if (result.success) {
      setTracking(result.data.documents);
    }
    setLoading(false);
  };

  const stats = {
    sent: tracking.filter(t => t.type === 'sent').length,
    opened: tracking.filter(t => t.opened).length,
    clicked: tracking.filter(t => t.clicked).length,
    failed: campaign.failedCount || 0
  };

  const openRate = stats.sent > 0 ? ((stats.opened / stats.sent) * 100).toFixed(1) : 0;
  const clickRate = stats.opened > 0 ? ((stats.clicked / stats.opened) * 100).toFixed(1) : 0;

  const filteredTracking = tracking.filter(t => {
    const matchesSearch = t.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = 
      filter === 'all' ||
      (filter === 'opened' && t.opened) ||
      (filter === 'clicked' && t.clicked) ||
      (filter === 'not_opened' && !t.opened);
    return matchesSearch && matchesFilter;
  });

  const exportReport = () => {
    const csv = ['Email,Sent At,Opened,Opened At,Clicked,Clicked At'];
    tracking.forEach(t => {
      csv.push(`${t.email},${t.sentAt || ''},${t.opened ? 'Yes' : 'No'},${t.openedAt || ''},${t.clicked ? 'Yes' : 'No'},${t.clickedAt || ''}`);
    });
    const blob = new Blob([csv.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `campaign-report-${campaign.$id}.csv`;
    a.click();
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{campaign.name || campaign.subject}</h1>
            <p className="text-sm text-gray-500">
              Sent {campaign.sentAt ? new Date(campaign.sentAt).toLocaleString() : 'N/A'}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchTracking} className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
          <button onClick={exportReport} className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700">
            <Download className="w-4 h-4" /> Export Report
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-5 rounded-xl shadow-sm border">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <Mail className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-sm text-gray-500">Sent</span>
          </div>
          <p className="text-3xl font-bold text-gray-800">{stats.sent}</p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <Eye className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-sm text-gray-500">Opened</span>
          </div>
          <p className="text-3xl font-bold text-gray-800">{stats.opened}</p>
          <p className="text-sm text-green-600 mt-1">{openRate}% open rate</p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
              <MousePointer className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-sm text-gray-500">Clicked</span>
          </div>
          <p className="text-3xl font-bold text-gray-800">{stats.clicked}</p>
          <p className="text-sm text-purple-600 mt-1">{clickRate}% click rate</p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <span className="text-sm text-gray-500">Failed</span>
          </div>
          <p className="text-3xl font-bold text-gray-800">{stats.failed}</p>
        </div>
      </div>

      {/* Campaign Details */}
      <div className="bg-white rounded-xl shadow-sm border p-4 mb-6">
        <h3 className="font-semibold text-gray-800 mb-3">Campaign Details</h3>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Subject:</span>
            <p className="font-medium text-gray-800">{campaign.subject}</p>
          </div>
          <div>
            <span className="text-gray-500">From:</span>
            <p className="font-medium text-gray-800">{campaign.fromName || 'Default'}</p>
          </div>
          <div>
            <span className="text-gray-500">Recipients:</span>
            <p className="font-medium text-gray-800">{campaign.recipientCount || stats.sent}</p>
          </div>
        </div>
      </div>

      {/* Recipient List */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="p-4 border-b flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
          >
            <option value="all">All</option>
            <option value="opened">Opened</option>
            <option value="clicked">Clicked</option>
            <option value="not_opened">Not Opened</option>
          </select>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading tracking data...</div>
        ) : filteredTracking.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No tracking data found</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Email</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Sent</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Opened</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Clicked</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredTracking.map(item => (
                <tr key={item.$id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-gray-800">{item.email}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Clock className="w-4 h-4" />
                      {item.sentAt ? new Date(item.sentAt).toLocaleString() : '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {item.opened ? (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-green-600">
                          {item.openedAt ? new Date(item.openedAt).toLocaleString() : 'Yes'}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {item.clicked ? (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-purple-500" />
                        <span className="text-sm text-purple-600">
                          {item.clickedAt ? new Date(item.clickedAt).toLocaleString() : 'Yes'}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}