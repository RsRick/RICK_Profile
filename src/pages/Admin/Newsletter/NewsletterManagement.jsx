import { useState, useEffect } from 'react';
import { Mail, Trash2, Download, Search, Users, UserCheck, UserX, RefreshCw, Send, FolderPlus, Folder, BarChart3, Eye, MousePointer, CheckCircle, XCircle, Plus, Edit2, X, ChevronRight } from 'lucide-react';
import { newsletterService } from '../../../lib/appwrite';
import { Query } from 'appwrite';
import CampaignComposer from './CampaignComposer';
import CampaignReport from './CampaignReport';

export default function NewsletterManagement() {
  const [activeTab, setActiveTab] = useState('subscribers'); // subscribers, campaigns, compose
  const [subscribers, setSubscribers] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [selectedSubscribers, setSelectedSubscribers] = useState([]);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [composerData, setComposerData] = useState(null);
  const [viewingReport, setViewingReport] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [subsResult, campaignsResult, foldersResult] = await Promise.all([
      newsletterService.getSubscribers([Query.orderDesc('subscribedAt')]),
      newsletterService.getCampaigns(),
      newsletterService.getFolders()
    ]);
    
    if (subsResult.success) setSubscribers(subsResult.data.documents);
    if (campaignsResult.success) setCampaigns(campaignsResult.data.documents);
    if (foldersResult.success) setFolders(foldersResult.data.documents);
    setLoading(false);
  };

  const toggleStatus = async (subscriber) => {
    const result = await newsletterService.updateSubscriber(subscriber.$id, {
      isActive: !subscriber.isActive
    });
    if (result.success) {
      setSubscribers(prev => prev.map(s => 
        s.$id === subscriber.$id ? { ...s, isActive: !s.isActive } : s
      ));
    }
  };

  const deleteSubscriber = async (id) => {
    if (!confirm('Delete this subscriber?')) return;
    const result = await newsletterService.deleteSubscriber(id);
    if (result.success) {
      setSubscribers(prev => prev.filter(s => s.$id !== id));
      setSelectedSubscribers(prev => prev.filter(sid => sid !== id));
    }
  };

  const exportCSV = () => {
    const activeOnly = subscribers.filter(s => s.isActive);
    const csv = ['Email,Subscribed Date,Status'];
    activeOnly.forEach(s => {
      csv.push(`${s.email},${new Date(s.subscribedAt).toLocaleDateString()},${s.isActive ? 'Active' : 'Inactive'}`);
    });
    const blob = new Blob([csv.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `newsletter-subscribers-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const createFolder = async () => {
    if (!newFolderName.trim()) return;
    const result = await newsletterService.createFolder(newFolderName.trim());
    if (result.success) {
      setFolders(prev => [result.data, ...prev]);
      setNewFolderName('');
      setShowFolderModal(false);
    }
  };

  const deleteFolder = async (folderId) => {
    if (!confirm('Delete this folder? Campaigns inside will be moved to root.')) return;
    const result = await newsletterService.deleteFolder(folderId);
    if (result.success) {
      setFolders(prev => prev.filter(f => f.$id !== folderId));
      if (selectedFolder === folderId) setSelectedFolder(null);
    }
  };

  const deleteCampaign = async (campaignId) => {
    if (!confirm('Delete this campaign?')) return;
    const result = await newsletterService.deleteCampaign(campaignId);
    if (result.success) {
      setCampaigns(prev => prev.filter(c => c.$id !== campaignId));
    }
  };

  const toggleSelectAll = () => {
    const filtered = filteredSubscribers.filter(s => s.isActive);
    if (selectedSubscribers.length === filtered.length) {
      setSelectedSubscribers([]);
    } else {
      setSelectedSubscribers(filtered.map(s => s.$id));
    }
  };

  const toggleSelectSubscriber = (id) => {
    setSelectedSubscribers(prev => 
      prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
    );
  };

  const startCompose = (existingCampaign = null) => {
    const recipientList = selectedSubscribers.length > 0 
      ? subscribers.filter(s => selectedSubscribers.includes(s.$id))
      : subscribers.filter(s => s.isActive);
    
    setComposerData({
      campaign: existingCampaign,
      recipients: recipientList
    });
    setActiveTab('compose');
  };

  const filteredSubscribers = subscribers.filter(s => {
    const matchesSearch = s.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || (filter === 'active' ? s.isActive : !s.isActive);
    return matchesSearch && matchesFilter;
  });

  const filteredCampaigns = selectedFolder 
    ? campaigns.filter(c => c.folderId === selectedFolder)
    : campaigns;

  const stats = {
    total: subscribers.length,
    active: subscribers.filter(s => s.isActive).length,
    inactive: subscribers.filter(s => !s.isActive).length
  };

  // If viewing a campaign report
  if (viewingReport) {
    return (
      <CampaignReport 
        campaign={viewingReport} 
        onBack={() => setViewingReport(null)} 
      />
    );
  }

  // If composing
  if (activeTab === 'compose' && composerData) {
    return (
      <CampaignComposer
        initialData={composerData.campaign}
        recipients={composerData.recipients}
        folders={folders}
        onBack={() => {
          setActiveTab('campaigns');
          setComposerData(null);
          fetchData();
        }}
        onSent={() => {
          setActiveTab('campaigns');
          setComposerData(null);
          fetchData();
        }}
      />
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Mail className="w-8 h-8 text-teal-600" />
          <h1 className="text-2xl font-bold text-gray-800">Newsletter</h1>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchData} className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
          <button 
            onClick={() => startCompose()} 
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
          >
            <Send className="w-4 h-4" /> New Campaign
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('subscribers')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
            activeTab === 'subscribers' ? 'bg-white text-teal-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <Users className="w-4 h-4 inline mr-2" />Subscribers
        </button>
        <button
          onClick={() => setActiveTab('campaigns')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
            activeTab === 'campaigns' ? 'bg-white text-teal-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <BarChart3 className="w-4 h-4 inline mr-2" />Campaigns
        </button>
      </div>

      {/* SUBSCRIBERS TAB */}
      {activeTab === 'subscribers' && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white p-4 rounded-xl shadow-sm border flex items-center gap-3">
              <Users className="w-10 h-10 text-blue-500 bg-blue-50 p-2 rounded-lg" />
              <div>
                <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
                <p className="text-sm text-gray-500">Total</p>
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border flex items-center gap-3">
              <UserCheck className="w-10 h-10 text-green-500 bg-green-50 p-2 rounded-lg" />
              <div>
                <p className="text-2xl font-bold text-gray-800">{stats.active}</p>
                <p className="text-sm text-gray-500">Active</p>
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border flex items-center gap-3">
              <UserX className="w-10 h-10 text-red-500 bg-red-50 p-2 rounded-lg" />
              <div>
                <p className="text-2xl font-bold text-gray-800">{stats.inactive}</p>
                <p className="text-sm text-gray-500">Inactive</p>
              </div>
            </div>
          </div>

          {/* Actions Bar */}
          <div className="flex gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
              <Download className="w-4 h-4" /> Export
            </button>
            {selectedSubscribers.length > 0 && (
              <button 
                onClick={() => startCompose()}
                className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
              >
                <Send className="w-4 h-4" /> Send to Selected ({selectedSubscribers.length})
              </button>
            )}
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-gray-500">Loading...</div>
            ) : filteredSubscribers.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No subscribers found</div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-6 py-3">
                      <input
                        type="checkbox"
                        checked={selectedSubscribers.length === filteredSubscribers.filter(s => s.isActive).length && filteredSubscribers.filter(s => s.isActive).length > 0}
                        onChange={toggleSelectAll}
                        className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                      />
                    </th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Email</th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Subscribed</th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Status</th>
                    <th className="text-right px-6 py-3 text-sm font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredSubscribers.map(subscriber => (
                    <tr key={subscriber.$id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedSubscribers.includes(subscriber.$id)}
                          onChange={() => toggleSelectSubscriber(subscriber.$id)}
                          disabled={!subscriber.isActive}
                          className="rounded border-gray-300 text-teal-600 focus:ring-teal-500 disabled:opacity-50"
                        />
                      </td>
                      <td className="px-6 py-4 text-gray-800">{subscriber.email}</td>
                      <td className="px-6 py-4 text-gray-500 text-sm">
                        {new Date(subscriber.subscribedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => toggleStatus(subscriber)}
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            subscriber.isActive 
                              ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                              : 'bg-red-100 text-red-700 hover:bg-red-200'
                          }`}
                        >
                          {subscriber.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => deleteSubscriber(subscriber.$id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {/* CAMPAIGNS TAB */}
      {activeTab === 'campaigns' && (
        <div className="flex gap-6">
          {/* Folders Sidebar */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm border p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800">Folders</h3>
                <button 
                  onClick={() => setShowFolderModal(true)}
                  className="p-1.5 text-teal-600 hover:bg-teal-50 rounded-lg"
                >
                  <FolderPlus className="w-4 h-4" />
                </button>
              </div>
              
              <div className="space-y-1">
                <button
                  onClick={() => setSelectedFolder(null)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm ${
                    !selectedFolder ? 'bg-teal-50 text-teal-700' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Folder className="w-4 h-4" />
                  All Campaigns
                  <span className="ml-auto text-xs bg-gray-100 px-2 py-0.5 rounded-full">{campaigns.length}</span>
                </button>
                
                {folders.map(folder => (
                  <div key={folder.$id} className="group relative">
                    <button
                      onClick={() => setSelectedFolder(folder.$id)}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm ${
                        selectedFolder === folder.$id ? 'bg-teal-50 text-teal-700' : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <Folder className="w-4 h-4" />
                      {folder.name}
                      <span className="ml-auto text-xs bg-gray-100 px-2 py-0.5 rounded-full">
                        {campaigns.filter(c => c.folderId === folder.$id).length}
                      </span>
                    </button>
                    <button
                      onClick={() => deleteFolder(folder.$id)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-red-500 opacity-0 group-hover:opacity-100 hover:bg-red-50 rounded"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Campaigns List */}
          <div className="flex-1">
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              {loading ? (
                <div className="p-8 text-center text-gray-500">Loading...</div>
              ) : filteredCampaigns.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Mail className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No campaigns yet</p>
                  <button 
                    onClick={() => startCompose()}
                    className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 text-sm"
                  >
                    Create First Campaign
                  </button>
                </div>
              ) : (
                <div className="divide-y">
                  {filteredCampaigns.map(campaign => (
                    <div key={campaign.$id} className="p-4 hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-gray-800">{campaign.name || campaign.subject}</h4>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              campaign.status === 'sent' ? 'bg-green-100 text-green-700' :
                              campaign.status === 'sending' ? 'bg-blue-100 text-blue-700' :
                              'bg-gray-100 text-gray-600'
                            }`}>
                              {campaign.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 mb-2">{campaign.subject}</p>
                          
                          {campaign.status === 'sent' && (
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <CheckCircle className="w-3 h-3 text-green-500" />
                                {campaign.sentCount || 0} sent
                              </span>
                              <span className="flex items-center gap-1">
                                <Eye className="w-3 h-3 text-blue-500" />
                                {campaign.openCount || 0} opens
                              </span>
                              <span className="flex items-center gap-1">
                                <MousePointer className="w-3 h-3 text-purple-500" />
                                {campaign.clickCount || 0} clicks
                              </span>
                              {campaign.failedCount > 0 && (
                                <span className="flex items-center gap-1">
                                  <XCircle className="w-3 h-3 text-red-500" />
                                  {campaign.failedCount} failed
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {campaign.status === 'sent' && (
                            <button
                              onClick={() => setViewingReport(campaign)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                              title="View Report"
                            >
                              <BarChart3 className="w-4 h-4" />
                            </button>
                          )}
                          {campaign.status === 'draft' && (
                            <button
                              onClick={() => startCompose(campaign)}
                              className="p-2 text-teal-600 hover:bg-teal-50 rounded-lg"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => deleteCampaign(campaign.$id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-gray-400 mt-2">
                        {campaign.sentAt 
                          ? `Sent ${new Date(campaign.sentAt).toLocaleString()}`
                          : `Created ${new Date(campaign.createdAt).toLocaleString()}`
                        }
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Folder Modal */}
      {showFolderModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Create Folder</h3>
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Folder name"
              className="w-full px-4 py-2 border rounded-lg mb-4 focus:ring-2 focus:ring-teal-500"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => { setShowFolderModal(false); setNewFolderName(''); }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={createFolder}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
