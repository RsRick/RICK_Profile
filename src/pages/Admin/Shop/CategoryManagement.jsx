import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Tag, GripVertical } from 'lucide-react';
import { databaseService, ID } from '../../../lib/appwrite';
import { useToast } from '../../../contexts/ToastContext';

const CATEGORY_COLLECTION = 'shop_categories';

export default function CategoryManagement() {
  const { showToast } = useToast();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '', color: '#2596be' });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const result = await databaseService.listDocuments(CATEGORY_COLLECTION);
      if (result.success) {
        const sorted = result.data.documents.sort((a, b) => (a.order || 0) - (b.order || 0));
        setCategories(sorted);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('Category name is required', 'error');
      return;
    }

    const categoryData = {
      name: formData.name.trim(),
      color: formData.color,
      order: editingCategory ? editingCategory.order : categories.length,
    };

    try {
      if (editingCategory) {
        const result = await databaseService.updateDocument(
          CATEGORY_COLLECTION, editingCategory.$id, categoryData
        );
        if (result.success) showToast('Category updated', 'success');
      } else {
        const result = await databaseService.createDocument(
          CATEGORY_COLLECTION, categoryData
        );
        if (result.success) showToast('Category created', 'success');
      }
      setShowModal(false);
      resetForm();
      loadCategories();
    } catch (error) {
      showToast('Failed to save category', 'error');
    }
  };


  const handleDelete = async (category) => {
    if (!window.confirm(`Delete "${category.name}"? Products with this category will become uncategorized.`)) return;
    
    try {
      const result = await databaseService.deleteDocument(CATEGORY_COLLECTION, category.$id);
      if (result.success) {
        showToast('Category deleted', 'success');
        loadCategories();
      }
    } catch (error) {
      showToast('Failed to delete category', 'error');
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({ name: category.name, color: category.color || '#2596be' });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({ name: '', color: '#2596be' });
    setEditingCategory(null);
  };

  const colorPresets = [
    '#2596be', '#3ba8d1', '#ef4444', '#f97316', '#eab308', 
    '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#6b7280'
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Shop Categories</h1>
          <p className="text-gray-600 mt-1">Manage product categories</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-[#2596be] text-white rounded-lg hover:bg-[#0d4543]"
        >
          <Plus className="w-5 h-5" /> Add Category
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2596be]"></div>
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <Tag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No categories yet. Add your first category!</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {categories.map((category, index) => (
            <div
              key={category.$id}
              className="flex items-center justify-between p-4 border-b last:border-b-0 hover:bg-gray-50"
            >
              <div className="flex items-center gap-3">
                <GripVertical className="w-5 h-5 text-gray-400 cursor-grab" />
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: category.color || '#2596be' }}
                />
                <span className="font-medium text-gray-800">{category.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleEdit(category)}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(category)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}


      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">
                {editingCategory ? 'Edit Category' : 'Add Category'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2596be] focus:border-transparent"
                  placeholder="e.g., Maps, Posters, Digital"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {colorPresets.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, color }))}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        formData.color === color ? 'border-gray-800 scale-110' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                    className="w-10 h-10 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="#2596be"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[#2596be] text-white rounded-lg hover:bg-[#0d4543]"
                >
                  {editingCategory ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

