import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X, Tag } from 'lucide-react';
import { databaseService } from '../../../lib/appwrite';
import { useToast } from '../../../contexts/ToastContext';

const CATEGORIES_COLLECTION = 'categories';

export default function CategoryManagement() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    color: '#3b82f6',
    order: 0
  });
  const { showToast } = useToast();

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const result = await databaseService.listDocuments(CATEGORIES_COLLECTION);
      if (result.success) {
        // Sort by order
        const sorted = result.data.documents.sort((a, b) => a.order - b.order);
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
    
    try {
      setLoading(true);

      const categoryData = {
        name: formData.name.trim(),
        color: formData.color,
        order: parseInt(formData.order) || categories.length
      };

      let result;
      if (editingCategory) {
        result = await databaseService.updateDocument(
          CATEGORIES_COLLECTION,
          editingCategory.$id,
          categoryData
        );
      } else {
        result = await databaseService.createDocument(
          CATEGORIES_COLLECTION,
          categoryData
        );
      }

      if (result.success) {
        showToast(
          editingCategory ? 'Category updated successfully' : 'Category created successfully',
          'success'
        );
        resetForm();
        loadCategories();
      } else {
        showToast('Failed to save category: ' + result.error, 'error');
      }
    } catch (error) {
      showToast('Error saving category: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      color: category.color,
      order: category.order
    });
    setShowForm(true);
  };

  const handleDelete = async (categoryId, categoryName) => {
    if (!window.confirm(`Are you sure you want to delete "${categoryName}"? This cannot be undone.`)) {
      return;
    }

    try {
      const result = await databaseService.deleteDocument(
        CATEGORIES_COLLECTION,
        categoryId
      );
      if (result.success) {
        showToast('Category deleted successfully', 'success');
        loadCategories();
      } else {
        showToast('Failed to delete category', 'error');
      }
    } catch (error) {
      showToast('Error deleting category', 'error');
    }
  };

  const resetForm = () => {
    setFormData({ name: '', color: '#3b82f6', order: 0 });
    setEditingCategory(null);
    setShowForm(false);
  };

  const predefinedColors = [
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Purple', value: '#a855f7' },
    { name: 'Green', value: '#10b981' },
    { name: 'Red', value: '#ef4444' },
    { name: 'Orange', value: '#f97316' },
    { name: 'Pink', value: '#ec4899' },
    { name: 'Teal', value: '#14b8a6' },
    { name: 'Yellow', value: '#eab308' },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: '#105652' }}>
            Category Management
          </h1>
          <p className="text-gray-600 mt-1">
            Manage project categories for filtering
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-white transition-all duration-300 hover:scale-105"
          style={{ backgroundColor: '#105652' }}
        >
          {showForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          {showForm ? 'Cancel' : 'Add Category'}
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4" style={{ color: '#105652' }}>
            {editingCategory ? 'Edit Category' : 'Add New Category'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Category Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
                maxLength="50"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                style={{ borderColor: '#105652' }}
                placeholder="e.g., Machine Learning, Web Development"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Badge Color
              </label>
              <div className="grid grid-cols-4 md:grid-cols-8 gap-2 mb-3">
                {predefinedColors.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, color: color.value }))}
                    className={`h-10 rounded-lg border-2 transition-all ${
                      formData.color === color.value ? 'border-gray-800 scale-110' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
              </div>
              <input
                type="color"
                value={formData.color}
                onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                className="w-full h-10 rounded-lg border"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Display Order
              </label>
              <input
                type="number"
                value={formData.order}
                onChange={(e) => setFormData(prev => ({ ...prev, order: e.target.value }))}
                min="0"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                style={{ borderColor: '#105652' }}
                placeholder="0"
              />
              <p className="text-sm text-gray-500 mt-1">
                Lower numbers appear first in the filter list
              </p>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 rounded-lg text-white transition-all duration-300 hover:scale-105 disabled:opacity-50"
                style={{ backgroundColor: '#105652' }}
              >
                <Save className="w-5 h-5" />
                {loading ? 'Saving...' : editingCategory ? 'Update Category' : 'Create Category'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-3 rounded-lg border-2 transition-all duration-300 hover:scale-105"
                style={{ borderColor: '#105652', color: '#105652' }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Categories List */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4" style={{ color: '#105652' }}>
          All Categories ({categories.length})
        </h2>
        
        {loading && !showForm ? (
          <p>Loading categories...</p>
        ) : categories.length === 0 ? (
          <div className="text-center py-12">
            <Tag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No categories yet</p>
            <p className="text-gray-400 text-sm">Add your first category to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {categories.map((category) => (
              <div
                key={category.$id}
                className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-4">
                  <div
                    className="px-4 py-2 rounded-full text-white font-semibold text-sm"
                    style={{ backgroundColor: category.color }}
                  >
                    {category.name}
                  </div>
                  <span className="text-sm text-gray-500">
                    Order: {category.order}
                  </span>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(category)}
                    className="flex items-center gap-1 px-3 py-2 rounded-lg text-white text-sm transition-all duration-300 hover:scale-105"
                    style={{ backgroundColor: '#105652' }}
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(category.$id, category.name)}
                    className="flex items-center gap-1 px-3 py-2 rounded-lg bg-red-500 text-white text-sm transition-all duration-300 hover:scale-105"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
