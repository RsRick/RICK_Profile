import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Globe, CheckCircle2, XCircle, AlertCircle, Loader, Copy, Trash2, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { listDomains, createDomain, deleteDomain, updateDomain } from '../../../lib/domainService';
import { verifyDNS, generateDNSInstructions } from '../../../lib/dnsVerification';
import { useToast } from '../../../contexts/ToastContext';
import { useAuth } from '../../../contexts/AuthContext';

export default function DomainManagement({ onBack }) {
  const [domains, setDomains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDomain, setNewDomain] = useState('');
  const [verifying, setVerifying] = useState({});
  const [expandedDomain, setExpandedDomain] = useState(null);
  const { showToast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    loadDomains();
  }, []);

  const loadDomains = async () => {
    try {
      setLoading(true);
      const response = await listDomains({ limit: 100 });
      setDomains(response.documents);
    } catch (error) {
      console.error('Error loading domains:', error);
      showToast('Failed to load domains', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddDomain = async (e) => {
    e.preventDefault();
    
    try {
      await createDomain(newDomain, user.$id);
      showToast('Domain added successfully', 'success');
      setNewDomain('');
      setShowAddForm(false);
      loadDomains();
    } catch (error) {
      console.error('Error adding domain:', error);
      showToast(error.message || 'Failed to add domain', 'error');
    }
  };

  const handleVerifyDomain = async (domain) => {
    try {
      setVerifying(prev => ({ ...prev, [domain.$id]: true }));
      
      const result = await verifyDNS(domain);
      
      if (result.isVerified) {
        showToast('Domain verified successfully!', 'success');
        loadDomains();
      } else {
        showToast('Domain verification failed. Please check DNS records.', 'error');
      }
    } catch (error) {
      console.error('Error verifying domain:', error);
      showToast('Failed to verify domain', 'error');
    } finally {
      setVerifying(prev => ({ ...prev, [domain.$id]: false }));
    }
  };

  const handleToggleActive = async (domain) => {
    try {
      await updateDomain(domain.$id, { isActive: !domain.isActive });
      showToast(`Domain ${domain.isActive ? 'disabled' : 'enabled'} successfully`, 'success');
      loadDomains();
    } catch (error) {
      console.error('Error toggling domain:', error);
      showToast('Failed to update domain', 'error');
    }
  };

  const handleDeleteDomain = async (domain) => {
    if (!window.confirm(`Are you sure you want to delete the domain "${domain.domain}"?`)) {
      return;
    }

    try {
      await deleteDomain(domain.$id);
      showToast('Domain deleted successfully', 'success');
      loadDomains();
    } catch (error) {
      console.error('Error deleting domain:', error);
      showToast(error.message || 'Failed to delete domain', 'error');
    }
  };

  const handleCopyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    showToast('Copied to clipboard', 'success');
  };

  const toggleExpanded = (domainId) => {
    setExpandedDomain(expandedDomain === domainId ? null : domainId);
  };

  const getStatusBadge = (domain) => {
    if (domain.isVerified) {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle2 className="w-3 h-3" />
          Verified
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <AlertCircle className="w-3 h-3" />
          Pending
        </span>
      );
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-lg shadow-lg p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: '#2596be' }}></div>
          <p className="text-gray-600 mt-4">Loading domains...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Shortlinks
          </button>
          <h1 className="text-3xl font-bold" style={{ color: '#2596be' }}>
            Custom Domain Management
          </h1>
          <p className="text-gray-600 mt-1">
            Configure custom domains for your shortlinks
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-white transition-all duration-300 hover:scale-105"
          style={{ backgroundColor: '#2596be' }}
        >
          <Plus className="w-5 h-5" />
          Add Domain
        </button>
      </div>

      {/* Add Domain Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4" style={{ color: '#2596be' }}>
            Add Custom Domain
          </h2>
          
          <form onSubmit={handleAddDomain} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Domain Name *
              </label>
              <input
                type="text"
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
                placeholder="link.yourdomain.com"
                required
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2"
                style={{ borderColor: '#2596be' }}
              />
              <p className="text-gray-500 text-sm mt-1">
                Enter a subdomain (e.g., link.yourdomain.com)
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setNewDomain('');
                }}
                className="px-4 py-2 rounded-lg border-2 transition-all duration-300"
                style={{ borderColor: '#2596be', color: '#2596be' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg text-white transition-all duration-300 hover:scale-105"
                style={{ backgroundColor: '#2596be' }}
              >
                Add Domain
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Domains List */}
      {domains.length === 0 ? (
        <div className="bg-white rounded-lg shadow-lg p-12 text-center">
          <Globe className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            No custom domains yet
          </h3>
          <p className="text-gray-600 mb-6">
            Add a custom domain to use branded shortlinks
          </p>
          <button
            onClick={() => setShowAddForm(true)}
            className="px-6 py-3 rounded-lg text-white transition-all duration-300 hover:scale-105"
            style={{ backgroundColor: '#2596be' }}
          >
            Add Your First Domain
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {domains.map((domain) => {
            const instructions = generateDNSInstructions(domain);
            const isExpanded = expandedDomain === domain.$id;

            return (
              <div key={domain.$id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                {/* Domain Header */}
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Globe className="w-8 h-8 text-gray-400" />
                      <div>
                        <h3 className="text-lg font-semibold">{domain.domain}</h3>
                        <p className="text-sm text-gray-500">
                          Added {new Date(domain.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusBadge(domain)}
                      {domain.isActive ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          Inactive
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 mt-4">
                    <button
                      onClick={() => handleVerifyDomain(domain)}
                      disabled={verifying[domain.$id]}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all duration-300 hover:scale-105 disabled:opacity-50"
                      style={{ borderColor: '#2596be', color: '#2596be' }}
                    >
                      {verifying[domain.$id] ? (
                        <>
                          <Loader className="w-4 h-4 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-4 h-4" />
                          Verify DNS
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleToggleActive(domain)}
                      className="px-4 py-2 rounded-lg border-2 transition-all duration-300 hover:scale-105"
                      style={{ borderColor: '#2596be', color: '#2596be' }}
                    >
                      {domain.isActive ? 'Disable' : 'Enable'}
                    </button>

                    <button
                      onClick={() => toggleExpanded(domain.$id)}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all duration-300"
                      style={{ borderColor: '#2596be', color: '#2596be' }}
                    >
                      DNS Setup
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                    <button
                      onClick={() => handleDeleteDomain(domain)}
                      className="ml-auto p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete domain"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* DNS Instructions (Expandable) */}
                {isExpanded && (
                  <div className="border-t bg-gray-50 p-6">
                    <h4 className="font-semibold mb-4" style={{ color: '#2596be' }}>
                      DNS Configuration Instructions
                    </h4>

                    <div className="space-y-6">
                      {instructions.steps.map((step) => (
                        <div key={step.step} className="flex gap-4">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold"
                            style={{ backgroundColor: '#2596be' }}
                          >
                            {step.step}
                          </div>
                          <div className="flex-1">
                            <h5 className="font-medium mb-1">{step.title}</h5>
                            <p className="text-sm text-gray-600 mb-2">{step.description}</p>
                            
                            {step.record && (
                              <div className="bg-white border rounded-lg p-4 space-y-2">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <span className="text-gray-500">Type:</span>
                                    <span className="ml-2 font-mono font-medium">{step.record.type}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-500">Name:</span>
                                    <span className="ml-2 font-mono font-medium">{step.record.name}</span>
                                  </div>
                                  <div className="col-span-2">
                                    <span className="text-gray-500">Content:</span>
                                    <div className="flex items-center gap-2 mt-1">
                                      <code className="flex-1 bg-gray-100 px-3 py-2 rounded text-xs break-all">
                                        {step.record.content}
                                      </code>
                                      <button
                                        onClick={() => handleCopyToClipboard(step.record.content)}
                                        className="p-2 hover:bg-gray-100 rounded transition-colors"
                                        title="Copy to clipboard"
                                      >
                                        <Copy className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </div>
                                  <div>
                                    <span className="text-gray-500">TTL:</span>
                                    <span className="ml-2 font-mono font-medium">{step.record.ttl}</span>
                                  </div>
                                  {step.record.proxy !== undefined && (
                                    <div>
                                      <span className="text-gray-500">Proxy:</span>
                                      <span className="ml-2 font-mono font-medium">{step.record.proxy}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Important Notes */}
                    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h5 className="font-medium text-blue-900 mb-2">Important Notes:</h5>
                      <ul className="space-y-1 text-sm text-blue-800">
                        {instructions.notes.map((note, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-blue-600 mt-0.5">•</span>
                            <span>{note}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

