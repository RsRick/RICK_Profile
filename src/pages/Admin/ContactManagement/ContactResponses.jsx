import { useState, useEffect } from 'react';
import { Eye, Trash2, X, Mail, Phone, Calendar, MessageSquare, User } from 'lucide-react';
import { databaseService } from '../../../lib/appwrite';
import { useToast } from '../../../contexts/ToastContext';

const CONTACT_RESPONSES_COLLECTION = 'contact_responses';

export default function ContactResponses() {
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedResponse, setSelectedResponse] = useState(null);
  const { showToast } = useToast();

  useEffect(() => {
    loadResponses();
  }, []);

  const loadResponses = async () => {
    try {
      setLoading(true);
      const result = await databaseService.listDocuments(CONTACT_RESPONSES_COLLECTION);
      
      if (result.success) {
        // Sort by date, newest first
        const sorted = result.data.documents.sort((a, b) => 
          new Date(b.$createdAt) - new Date(a.$createdAt)
        );
        setResponses(sorted);
      }
    } catch (error) {
      console.error('Error loading responses:', error);
      showToast('Failed to load responses', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this response?')) return;

    try {
      const result = await databaseService.deleteDocument(
        CONTACT_RESPONSES_COLLECTION,
        id
      );

      if (result.success) {
        showToast('Response deleted successfully', 'success');
        setResponses(prev => prev.filter(r => r.$id !== id));
        if (selectedResponse?.$id === id) {
          setSelectedResponse(null);
        }
      } else {
        showToast('Failed to delete response', 'error');
      }
    } catch (error) {
      console.error('Delete error:', error);
      showToast('Failed to delete response', 'error');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const markAsRead = async (response) => {
    if (response.isRead) return;

    try {
      await databaseService.updateDocument(
        CONTACT_RESPONSES_COLLECTION,
        response.$id,
        { isRead: true }
      );
      
      setResponses(prev => prev.map(r => 
        r.$id === response.$id ? { ...r, isRead: true } : r
      ));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const openResponse = (response) => {
    setSelectedResponse(response);
    markAsRead(response);
  };

  const unreadCount = responses.filter(r => !r.isRead).length;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: '#105652' }}>
            Contact Form Responses
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {responses.length} total responses {unreadCount > 0 && `(${unreadCount} unread)`}
          </p>
        </div>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading responses...</p>
      ) : responses.length === 0 ? (
        <div className="bg-white rounded-lg shadow-lg p-12 text-center">
          <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No Responses Yet</h3>
          <p className="text-gray-500">
            When someone submits the contact form, their message will appear here.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Subject
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {responses.map((response) => (
                <tr 
                  key={response.$id} 
                  className={`hover:bg-gray-50 transition-colors cursor-pointer ${!response.isRead ? 'bg-blue-50/50' : ''}`}
                  onClick={() => openResponse(response)}
                >
                  <td className="px-6 py-4">
                    {!response.isRead ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        New
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                        Read
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{response.name}</div>
                    <div className="text-sm text-gray-500">{response.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-gray-900 truncate max-w-xs">{response.subject}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {formatDate(response.$createdAt)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => openResponse(response)}
                        className="p-2 rounded-lg text-white transition-all hover:scale-105"
                        style={{ backgroundColor: '#105652' }}
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(response.$id)}
                        className="p-2 rounded-lg bg-red-500 text-white transition-all hover:scale-105"
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
      )}

      {/* Response Detail Modal */}
      {selectedResponse && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedResponse(null)}
        >
          <div 
            className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b" style={{ backgroundColor: '#105652' }}>
              <h3 className="text-xl font-bold text-white">Message Details</h3>
              <button
                onClick={() => setSelectedResponse(null)}
                className="p-2 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Contact Info */}
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#105652' }}>
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Name</p>
                    <p className="font-medium">{selectedResponse.name}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#105652' }}>
                    <Mail className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Email</p>
                    <a href={`mailto:${selectedResponse.email}`} className="font-medium text-blue-600 hover:underline">
                      {selectedResponse.email}
                    </a>
                  </div>
                </div>

                {selectedResponse.phone && (
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#105652' }}>
                      <Phone className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase">Phone</p>
                      <a href={`tel:${selectedResponse.phone}`} className="font-medium text-blue-600 hover:underline">
                        {selectedResponse.phone}
                      </a>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#105652' }}>
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Received</p>
                    <p className="font-medium">{formatDate(selectedResponse.$createdAt)}</p>
                  </div>
                </div>
              </div>

              {/* Subject */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-500 uppercase mb-2">Subject</h4>
                <p className="text-lg font-medium" style={{ color: '#105652' }}>
                  {selectedResponse.subject}
                </p>
              </div>

              {/* Message */}
              <div>
                <h4 className="text-sm font-semibold text-gray-500 uppercase mb-2">Message</h4>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {selectedResponse.message}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-6 pt-6 border-t">
                <a
                  href={`mailto:${selectedResponse.email}?subject=Re: ${selectedResponse.subject}`}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-white transition-all hover:scale-105"
                  style={{ backgroundColor: '#105652' }}
                >
                  <Mail className="w-4 h-4" />
                  Reply via Email
                </a>
                <button
                  onClick={() => {
                    handleDelete(selectedResponse.$id);
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500 text-white transition-all hover:scale-105"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
