import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X, GripVertical } from 'lucide-react';
import { databaseService } from '../../../lib/appwrite';
import { useToast } from '../../../contexts/ToastContext';

const MAP_CATEGORIES_COLLECTION = 'map_categories';

export default function MapCategoryManagement() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', color: '#105652' });
  const [newCategory, setNewCategory] = useState({ name: '', color: '#105652' });
  const [showAddForm, setShowAddForm] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const result = await databaseService.listDocuments(MAP_CATEGORIES_COLLECTION);
      if (result.success) {
        const sorted = result.data.documents.sort((a, b) => (a.order || 0) - (b.order || 0));
        setCategories(sorted);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      showToast('Failed to load categories', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!newCategory.name.trim()) {
      showToast('Category name is required', 'error');
      return;
    }

    try {
      const result = await databaseService.createDocument(
        MAP_CATEGORIES_COLLECTION,
        {
          name: newCategory.name.trim(),
          color: newCategory.color,
          order: categories.length
        }
      );

      if (result.success) {
        showToast('Category added successfully', 'success');
        setNewCategory({ name: '', color: '#105652' });
        setShowAddForm(false);
        loadCategories();
      } else {
        showToast('Failed to add category', 'error');
      }
    } catch (error) {
      console.error('Error adding category:', error);
      showToast('Failed to add category', 'error');
    }
  };

  const handleEdit = (category) => {
    setEditingId(category.$id);
    setEditForm({ name: category.name, color: category.color });
  };

  const handleSaveEdit = async () => {
    if (!editForm.name.trim()) {
      showToast('Category name is required', 'error');
      return;
    }

    try {
      const result = await databaseService.updateDocument(
        MAP_CATEGORIES_COLLECTION,
        editingId,
        { name: editForm.name.trim(), color: editForm.color }
      );

      if (result.success) {
        showToast('Category updated successfully', 'success');
        setEditingId(null);
        loadCategories();
      } else {
        showToast('Failed to update category', 'error');
      }
    } catch (error) {
      console.error('Error updating category:', error);
      showToast('Failed to update category', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;

    try {
      const result = await databaseService.deleteDocument(MAP_CATEGORIES_COLLECTION, id);
      if (result.success) {
        showToast('Category deleted successfully', 'success');
        loadCategories();
      } else {
        showToast('Failed to delete category', 'error');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      showToast('Failed to delete category', 'error');
    }
  };

  const colorPresets = [
    '#105652', '#1E8479', '#ef4444', '#f97316', '#eab308', 
    '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#6b7280'
  ];

  if (loading) {
    return <div className="p-6"><p className="text-gray-500">Loading categories...</p></div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold" style={{ color: '#105652' }}>Map Categories</h1>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-white transition-all hover:scale-105"
          style={{ backgroundColor: '#105652' }}
        >
          <Plus className="w-5 h-5" />
          Add Category
        </button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h3 className="text-lg font-bold mb-4" style={{ color: '#105652' }}>New Category</h3>
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium mb-2">Name</label>
              <input
                type="text"
                value={newCategory.name}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                style={{ borderColor: '#105652' }}
                placeholder="e.g., GIS, Remote Sensing"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={newCategory.color}
                  onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
                  className="w-10 h-10 rounded cursor-pointer"
                />
                <div className="flex gap-1">
                  {colorPresets.slice(0, 5).map(color => (
                    <button
                      key={color}
                      onClick={() => setNewCategory({ ...newCategory, color })}
                      className="w-6 h-6 rounded-full border-2 transition-transform hover:scale-110"
                      style={{ backgroundColor: color, borderColor: newCategory.color === color ? '#000' : 'transparent' }}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleAdd}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-white"
                style={{ backgroundColor: '#105652' }}
              >
                <Save className="w-4 h-4" />
                Save
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Categories List */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {categories.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            No categories yet. Add your first category to get started.
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Order</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Name</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Color</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {categories.map((category, index) => (
                <tr key={category.$id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-gray-400">
                      <GripVertical className="w-4 h-4" />
                      {index + 1}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {editingId === category.$id ? (
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="px-3 py-1 border rounded-lg focus:outline-none focus:ring-2"
                        style={{ borderColor: '#105652' }}
                      />
                    ) : (
                      <span className="font-medium">{category.name}</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {editingId === category.$id ? (
                      <input
                        type="color"
                        value={editForm.color}
                        onChange={(e) => setEditForm({ ...editForm, color: e.target.value })}
                        className="w-8 h-8 rounded cursor-pointer"
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full" style={{ backgroundColor: category.color }} />
                        <span className="text-sm text-gray-500">{category.color}</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {editingId === category.$id ? (
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={handleSaveEdit}
                          className="p-2 rounded-lg text-white"
                          style={{ backgroundColor: '#105652' }}
                        >
                          <Save className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="p-2 rounded-lg border hover:bg-gray-100"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(category)}
                          className="p-2 rounded-lg text-white"
                          style={{ backgroundColor: '#105652' }}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(category.$id)}
                          className="p-2 rounded-lg bg-red-500 text-white hover:bg-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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
