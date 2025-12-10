import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X, GripVertical } from 'lucide-react';
import { databaseService } from '../../../lib/appwrite';
import { useToast } from '../../../contexts/ToastContext';

const CERTIFICATE_CATEGORIES_COLLECTION = 'certificate_categories';

export default function CertificateCategoryManagement() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', color: '#2596be' });
  const { showToast } = useToast();

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const result = await databaseService.listDocuments(CERTIFICATE_CATEGORIES_COLLECTION);
      if (result.success) {
        setCategories(result.data.documents.sort((a, b) => (a.order || 0) - (b.order || 0)));
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      showToast('Failed to load categories', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      showToast('Category name is required', 'error');
      return;
    }

    try {
      const dataToSave = {
        name: formData.name.trim(),
        color: formData.color,
        order: editingId ? categories.find(c => c.$id === editingId)?.order || 0 : categories.length
      };

      let result;
      if (editingId) {
        result = await databaseService.updateDocument(CERTIFICATE_CATEGORIES_COLLECTION, editingId, dataToSave);
      } else {
        result = await databaseService.createDocument(CERTIFICATE_CATEGORIES_COLLECTION, dataToSave);
      }

      if (result.success) {
        showToast(editingId ? 'Category updated' : 'Category added', 'success');
        resetForm();
        loadCategories();
      } else {
        showToast('Failed to save category', 'error');
      }
    } catch (error) {
      console.error('Save error:', error);
      showToast('Failed to save category', 'error');
    }
  };

  const handleEdit = (cat) => {
    setEditingId(cat.$id);
    setFormData({ name: cat.name, color: cat.color || '#2596be' });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    try {
      const result = await databaseService.deleteDocument(CERTIFICATE_CATEGORIES_COLLECTION, id);
      if (result.success) {
        showToast('Category deleted', 'success');
        loadCategories();
      }
    } catch (error) {
      showToast('Failed to delete', 'error');
    }
  };

  const resetForm = () => {
    setFormData({ name: '', color: '#2596be' });
    setEditingId(null);
    setShowForm(false);
  };

  if (loading) return <div className="p-6"><p className="text-gray-500">Loading...</p></div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold" style={{ color: '#2596be' }}>Certificate Categories</h1>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg text-white hover:scale-105 transition-all" style={{ backgroundColor: '#2596be' }}>
          <Plus className="w-5 h-5" /> Add Category
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h3 className="text-lg font-bold mb-4" style={{ color: '#2596be' }}>{editingId ? 'Edit Category' : 'Add Category'}</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                style={{ borderColor: '#2596be' }}
                placeholder="e.g., GIS, Python, R"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Color</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-12 h-10 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="flex-1 px-4 py-2 border rounded-lg focus:outline-none"
                  style={{ borderColor: '#2596be' }}
                />
              </div>
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={handleSubmit} className="flex items-center gap-2 px-6 py-2 rounded-lg text-white" style={{ backgroundColor: '#2596be' }}>
              <Save className="w-4 h-4" /> {editingId ? 'Update' : 'Save'}
            </button>
            <button onClick={resetForm} className="flex items-center gap-2 px-6 py-2 rounded-lg border hover:bg-gray-50">
              <X className="w-4 h-4" /> Cancel
            </button>
          </div>
        </div>
      )}

      {categories.length === 0 ? (
        <div className="bg-white rounded-lg shadow-lg p-12 text-center">
          <p className="text-gray-500">No categories yet. Add your first category.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {categories.map((cat, index) => (
            <div key={cat.$id} className="flex items-center justify-between p-4 border-b last:border-b-0 hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <GripVertical className="w-5 h-5 text-gray-400" />
                <div className="w-6 h-6 rounded-full" style={{ backgroundColor: cat.color }} />
                <span className="font-medium">{cat.name}</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(cat)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <Edit2 className="w-4 h-4 text-gray-600" />
                </button>
                <button onClick={() => handleDelete(cat.$id)} className="p-2 hover:bg-red-50 rounded-lg">
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

