import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X, ChevronUp, ChevronDown } from 'lucide-react';
import { databaseService } from '../../../lib/appwrite';
import { useToast } from '../../../contexts/ToastContext';

const BLOG_CATEGORIES_COLLECTION = 'blog_categories';

export default function BlogCategoryManagement() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    color: '#2596be',
    order: 0
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const result = await databaseService.listDocuments(BLOG_CATEGORIES_COLLECTION);
      if (result.success) {
        const sorted = result.data.documents.sort((a, b) => a.order - b.order);
        setCategories(sorted);
      }
    } catch (error) {
      showToast('Failed to load categories', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'order' ? parseInt(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);

      let result;
      if (editingCategory) {
        result = await databaseService.updateDocument(
          BLOG_CATEGORIES_COLLECTION,
          editingCategory.$id,
          formData
        );
      } else {
        result = await databaseService.createDocument(
          BLOG_CATEGORIES_COLLECTION,
          formData
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
        showToast(`Failed to save category: ${result.error}`, 'error');
      }
    } catch (error) {
      showToast(`Error saving category: ${error.message}`, 'error');
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

  const handleDelete = async (categoryId) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;

    try {
      const result = await databaseService.deleteDocument(BLOG_CATEGORIES_COLLECTION, categoryId);
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
    setFormData({
      name: '',
      color: '#2596be',
      order: categories.length
    });
    setEditingCategory(null);
    setShowForm(false);
  };

  const moveCategory = async (category, direction) => {
    const currentIndex = categories.findIndex(c => c.$id === category.$id);
    if (
      (direction === 'up' && currentIndex === 0) ||
      (direction === 'down' && currentIndex === categories.length - 1)
    ) {
      return;
    }

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const swapCategory = categories[newIndex];

    try {
      await databaseService.updateDocument(
        BLOG_CATEGORIES_COLLECTION,
        category.$id,
        { order: swapCategory.order }
      );

      await databaseService.updateDocument(
        BLOG_CATEGORIES_COLLECTION,
        swapCategory.$id,
        { order: category.order }
      );

      loadCategories();
    } catch (error) {
      showToast('Failed to reorder categories', 'error');
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold" style={{ color: '#2596be' }}>
          Blog Category Management
        </h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-white transition-all duration-300 hover:scale-105"
          style={{ backgroundColor: '#2596be' }}
        >
          {showForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          {showForm ? 'Cancel' : 'Add Category'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4" style={{ color: '#2596be' }}>
            {editingCategory ? 'Edit Category' : 'Add New Category'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Category Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                style={{ borderColor: '#2596be' }}
                placeholder="e.g., Technology, Travel, Lifestyle"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Color *</label>
              <div className="flex gap-4 items-center">
                <input
                  type="color"
                  name="color"
                  value={formData.color}
                  onChange={handleInputChange}
                  className="w-20 h-10 rounded cursor-pointer"
                />
                <input
                  type="text"
                  name="color"
                  value={formData.color}
                  onChange={handleInputChange}
                  className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                  style={{ borderColor: '#2596be' }}
                  placeholder="#2596be"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Display Order</label>
              <input
                type="number"
                name="order"
                value={formData.order}
                onChange={handleInputChange}
                min="0"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                style={{ borderColor: '#2596be' }}
              />
              <p className="text-xs text-gray-500 mt-1">
                Lower numbers appear first
              </p>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 rounded-lg text-white transition-all duration-300 hover:scale-105 disabled:opacity-50"
                style={{ backgroundColor: '#2596be' }}
              >
                <Save className="w-5 h-5" />
                {loading ? 'Saving...' : editingCategory ? 'Update Category' : 'Create Category'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-3 rounded-lg border-2 transition-all duration-300 hover:scale-105"
                style={{ borderColor: '#2596be', color: '#2596be' }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Categories List */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4" style={{ color: '#2596be' }}>
          All Categories ({categories.length})
        </h2>
        
        {loading && !showForm ? (
          <p>Loading categories...</p>
        ) : categories.length === 0 ? (
          <p className="text-gray-500">No categories yet. Add your first category!</p>
        ) : (
          <div className="space-y-2">
            {categories.map((category, index) => (
              <div
                key={category.$id}
                className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-lg"
                    style={{ backgroundColor: category.color }}
                  />
                  <div>
                    <h3 className="font-bold">{category.name}</h3>
                    <p className="text-sm text-gray-500">Order: {category.order}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => moveCategory(category, 'up')}
                    disabled={index === 0}
                    className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Move up"
                  >
                    <ChevronUp className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => moveCategory(category, 'down')}
                    disabled={index === categories.length - 1}
                    className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Move down"
                  >
                    <ChevronDown className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleEdit(category)}
                    className="p-2 rounded-lg text-white transition-all duration-300 hover:scale-105"
                    style={{ backgroundColor: '#2596be' }}
                    title="Edit Category"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(category.$id)}
                    className="p-2 rounded-lg bg-red-500 text-white transition-all duration-300 hover:scale-105"
                    title="Delete Category"
                  >
                    <Trash2 className="w-5 h-5" />
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

