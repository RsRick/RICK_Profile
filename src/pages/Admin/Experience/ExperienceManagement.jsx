import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, GripVertical, Briefcase, GraduationCap, Trophy, Award, Calendar, MapPin, Eye, EyeOff, Save, X, ChevronDown, ChevronUp } from 'lucide-react';
import { databaseService, storageService, ID } from '../../../lib/appwrite';
import { useToast } from '../../../contexts/ToastContext';

const EXPERIENCES_COLLECTION = 'experiences';
const EXPERIENCE_BUCKET = 'experience_images';

// Experience types with icons
const experienceTypes = [
  { value: 'work', label: 'Work Experience', icon: Briefcase },
  { value: 'education', label: 'Education', icon: GraduationCap },
  { value: 'achievement', label: 'Achievement', icon: Trophy },
  { value: 'award', label: 'Award', icon: Award },
];

// Preset colors
const presetColors = [
  { primary: '#105652', secondary: '#1E8479', name: 'Teal' },
  { primary: '#1e40af', secondary: '#3b82f6', name: 'Blue' },
  { primary: '#7c3aed', secondary: '#a78bfa', name: 'Purple' },
  { primary: '#dc2626', secondary: '#f87171', name: 'Red' },
  { primary: '#ea580c', secondary: '#fb923c', name: 'Orange' },
  { primary: '#16a34a', secondary: '#4ade80', name: 'Green' },
  { primary: '#0891b2', secondary: '#22d3ee', name: 'Cyan' },
  { primary: '#be185d', secondary: '#f472b6', name: 'Pink' },
];

const emptyExperience = {
  title: '',
  organization: '',
  type: 'achievement',
  description: '',
  location: '',
  startDate: '',
  endDate: '',
  current: false,
  skills: [],
  highlights: [],
  color: '#105652',
  colorSecondary: '#1E8479',
  imageUrl: '',
  credentialUrl: '',
  featured: true,
  order: 0,
};

export default function ExperienceManagement() {
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingExp, setEditingExp] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(emptyExperience);
  const [skillInput, setSkillInput] = useState('');
  const [highlightInput, setHighlightInput] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const { showToast } = useToast();

  useEffect(() => {
    loadExperiences();
  }, []);

  const loadExperiences = async () => {
    try {
      const result = await databaseService.listDocuments(EXPERIENCES_COLLECTION);
      if (result.success) {
        const sorted = result.data.documents.sort((a, b) => (a.order || 0) - (b.order || 0));
        setExperiences(sorted);
      }
    } catch (error) {
      console.error('Error loading experiences:', error);
      showToast('Failed to load experiences', 'error');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (exp = null) => {
    if (exp) {
      setEditingExp(exp);
      setFormData({
        ...emptyExperience,
        ...exp,
        skills: exp.skills || [],
        highlights: exp.highlights || [],
        startDate: exp.startDate || '',
        endDate: exp.endDate || '',
        imageUrl: exp.imageUrl || '',
        credentialUrl: exp.credentialUrl || '',
      });
      setImagePreview(exp.imageUrl || '');
    } else {
      setEditingExp(null);
      setFormData({ ...emptyExperience, order: experiences.length });
      setImagePreview('');
    }
    setImageFile(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingExp(null);
    setFormData(emptyExperience);
    setImageFile(null);
    setImagePreview('');
    setSkillInput('');
    setHighlightInput('');
  };


  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const addSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()]
      }));
      setSkillInput('');
    }
  };

  const removeSkill = (skill) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };

  const addHighlight = () => {
    if (highlightInput.trim()) {
      setFormData(prev => ({
        ...prev,
        highlights: [...prev.highlights, highlightInput.trim()]
      }));
      setHighlightInput('');
    }
  };

  const removeHighlight = (index) => {
    setFormData(prev => ({
      ...prev,
      highlights: prev.highlights.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showToast('Title is required', 'error');
      return;
    }

    setSaving(true);
    try {
      let imageUrl = formData.imageUrl;

      // Upload image if new file selected
      if (imageFile) {
        const fileId = ID.unique();
        const uploadResult = await storageService.uploadFile(EXPERIENCE_BUCKET, fileId, imageFile);
        if (uploadResult.success) {
          imageUrl = storageService.getFilePreview(EXPERIENCE_BUCKET, uploadResult.data.$id);
        }
      }

      const expData = {
        title: formData.title.trim(),
        organization: formData.organization.trim(),
        type: formData.type,
        description: formData.description.trim(),
        location: formData.location.trim(),
        startDate: formData.startDate || '',
        endDate: formData.current ? '' : (formData.endDate || ''),
        current: formData.current,
        skills: formData.skills,
        highlights: formData.highlights,
        color: formData.color,
        colorSecondary: formData.colorSecondary,
        imageUrl: imageUrl || '',
        credentialUrl: formData.credentialUrl.trim(),
        featured: formData.featured,
        order: formData.order,
      };

      if (editingExp) {
        // Update existing
        const result = await databaseService.updateDocument(
          EXPERIENCES_COLLECTION,
          editingExp.$id,
          expData
        );
        if (result.success) {
          showToast('Experience updated successfully', 'success');
          loadExperiences();
          closeModal();
        } else {
          throw new Error(result.error);
        }
      } else {
        // Create new
        const result = await databaseService.createDocument(
          EXPERIENCES_COLLECTION,
          expData
        );
        if (result.success) {
          showToast('Experience created successfully', 'success');
          loadExperiences();
          closeModal();
        } else {
          throw new Error(result.error);
        }
      }
    } catch (error) {
      console.error('Error saving experience:', error);
      showToast('Failed to save experience', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (exp) => {
    if (!window.confirm(`Delete "${exp.title}"? This cannot be undone.`)) return;

    try {
      const result = await databaseService.deleteDocument(
        EXPERIENCES_COLLECTION,
        exp.$id
      );
      if (result.success) {
        showToast('Experience deleted', 'success');
        loadExperiences();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error deleting experience:', error);
      showToast('Failed to delete experience', 'error');
    }
  };

  const toggleFeatured = async (exp) => {
    try {
      const result = await databaseService.updateDocument(
        EXPERIENCES_COLLECTION,
        exp.$id,
        { featured: !exp.featured }
      );
      if (result.success) {
        showToast(`Experience ${!exp.featured ? 'featured' : 'hidden'}`, 'success');
        loadExperiences();
      }
    } catch (error) {
      console.error('Error toggling featured:', error);
      showToast('Failed to update', 'error');
    }
  };

  const moveExperience = async (index, direction) => {
    const newExperiences = [...experiences];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex < 0 || targetIndex >= newExperiences.length) return;

    // Swap
    [newExperiences[index], newExperiences[targetIndex]] = [newExperiences[targetIndex], newExperiences[index]];

    // Update order values
    try {
      await Promise.all([
        databaseService.updateDocument(EXPERIENCES_COLLECTION, newExperiences[index].$id, { order: index }),
        databaseService.updateDocument(EXPERIENCES_COLLECTION, newExperiences[targetIndex].$id, { order: targetIndex })
      ]);
      loadExperiences();
    } catch (error) {
      console.error('Error reordering:', error);
      showToast('Failed to reorder', 'error');
    }
  };

  const getTypeIcon = (type) => {
    const found = experienceTypes.find(t => t.value === type);
    return found ? found.icon : Award;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#105652' }}></div>
      </div>
    );
  }


  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: '#105652' }}>Experience Management</h1>
          <p className="text-gray-600 mt-1">Manage your work experience, education, and achievements</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-90 transition-colors"
          style={{ backgroundColor: '#105652' }}
        >
          <Plus className="w-5 h-5" />
          Add Experience
        </button>
      </div>

      {/* Experience List */}
      {experiences.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border-2 border-dashed border-gray-300">
          <Trophy className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No experiences yet</h3>
          <p className="text-gray-500 mb-6">Add your first experience, achievement, or milestone</p>
          <button
            onClick={() => openModal()}
            className="inline-flex items-center gap-2 px-6 py-3 text-white rounded-lg hover:opacity-90"
            style={{ backgroundColor: '#105652' }}
          >
            <Plus className="w-5 h-5" />
            Add Experience
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {experiences.map((exp, index) => {
            const TypeIcon = getTypeIcon(exp.type);
            return (
              <div
                key={exp.$id}
                className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-4">
                  {/* Drag Handle & Order */}
                  <div className="flex flex-col items-center gap-1">
                    <button
                      onClick={() => moveExperience(index, 'up')}
                      disabled={index === 0}
                      className="p-1 hover:bg-gray-100 rounded disabled:opacity-30"
                    >
                      <ChevronUp className="w-4 h-4 text-gray-500" />
                    </button>
                    <GripVertical className="w-5 h-5 text-gray-400" />
                    <button
                      onClick={() => moveExperience(index, 'down')}
                      disabled={index === experiences.length - 1}
                      className="p-1 hover:bg-gray-100 rounded disabled:opacity-30"
                    >
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>

                  {/* Icon */}
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: exp.color || '#105652' }}
                  >
                    <TypeIcon className="w-6 h-6 text-white" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 truncate">{exp.title}</h3>
                      <span
                        className="px-2 py-0.5 rounded-full text-xs font-medium text-white"
                        style={{ backgroundColor: exp.color || '#105652' }}
                      >
                        {exp.type}
                      </span>
                    </div>
                    {exp.organization && (
                      <p className="text-sm text-gray-600 truncate">{exp.organization}</p>
                    )}
                    <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                      {exp.startDate && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(exp.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                          {exp.endDate && ` - ${new Date(exp.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`}
                          {exp.current && ' - Present'}
                        </span>
                      )}
                      {exp.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {exp.location}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleFeatured(exp)}
                      className={`p-2 rounded-lg transition-colors ${
                        exp.featured ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                      }`}
                      title={exp.featured ? 'Featured (click to hide)' : 'Hidden (click to feature)'}
                    >
                      {exp.featured ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                    </button>
                    <button
                      onClick={() => openModal(exp)}
                      className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(exp)}
                      className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}


      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200 flex items-center justify-between" style={{ backgroundColor: '#105652' }}>
              <h2 className="text-xl font-bold text-white">
                {editingExp ? 'Edit Experience' : 'Add New Experience'}
              </h2>
              <button onClick={closeModal} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#105652] focus:border-transparent"
                    placeholder="e.g., Software Engineer, Bachelor's Degree, Best Paper Award"
                    required
                  />
                </div>

                {/* Organization */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Organization</label>
                  <input
                    type="text"
                    value={formData.organization}
                    onChange={(e) => setFormData(prev => ({ ...prev, organization: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#105652] focus:border-transparent"
                    placeholder="e.g., Google, MIT, IEEE"
                  />
                </div>

                {/* Type & Location Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#105652] focus:border-transparent"
                    >
                      {experienceTypes.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#105652] focus:border-transparent"
                      placeholder="e.g., San Francisco, CA"
                    />
                  </div>
                </div>

                {/* Date Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#105652] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                      disabled={formData.current}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#105652] focus:border-transparent disabled:bg-gray-100"
                    />
                    <label className="flex items-center gap-2 mt-2">
                      <input
                        type="checkbox"
                        checked={formData.current}
                        onChange={(e) => setFormData(prev => ({ ...prev, current: e.target.checked }))}
                        className="rounded"
                      />
                      <span className="text-sm text-gray-600">Currently ongoing</span>
                    </label>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#105652] focus:border-transparent resize-none"
                    placeholder="Describe your role, achievements, or what you learned..."
                  />
                </div>

                {/* Skills */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Skills / Tags</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#105652] focus:border-transparent"
                      placeholder="Add a skill and press Enter"
                    />
                    <button
                      type="button"
                      onClick={addSkill}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                    >
                      Add
                    </button>
                  </div>
                  {formData.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.skills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm"
                          style={{ backgroundColor: 'rgba(16, 86, 82, 0.1)', color: '#105652' }}
                        >
                          {skill}
                          <button type="button" onClick={() => removeSkill(skill)} className="hover:text-red-500">
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Highlights */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Key Highlights</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={highlightInput}
                      onChange={(e) => setHighlightInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addHighlight())}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#105652] focus:border-transparent"
                      placeholder="Add a highlight and press Enter"
                    />
                    <button
                      type="button"
                      onClick={addHighlight}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                    >
                      Add
                    </button>
                  </div>
                  {formData.highlights.length > 0 && (
                    <ul className="space-y-2">
                      {formData.highlights.map((highlight, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-700 bg-gray-50 p-2 rounded-lg">
                          <span className="flex-1">{highlight}</span>
                          <button type="button" onClick={() => removeHighlight(idx)} className="text-red-500 hover:text-red-700">
                            <X className="w-4 h-4" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Colors */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Card Color Theme</label>
                  <div className="flex flex-wrap gap-2">
                    {presetColors.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, color: preset.primary, colorSecondary: preset.secondary }))}
                        className={`w-10 h-10 rounded-lg border-2 transition-all ${
                          formData.color === preset.primary ? 'border-gray-900 scale-110' : 'border-transparent'
                        }`}
                        style={{ background: `linear-gradient(135deg, ${preset.primary} 0%, ${preset.secondary} 100%)` }}
                        title={preset.name}
                      />
                    ))}
                  </div>
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Image (Optional)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                  {imagePreview && (
                    <img src={imagePreview} alt="Preview" className="mt-2 w-32 h-32 object-cover rounded-lg" />
                  )}
                </div>

                {/* Credential URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Credential URL (Optional)</label>
                  <input
                    type="url"
                    value={formData.credentialUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, credentialUrl: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#105652] focus:border-transparent"
                    placeholder="https://..."
                  />
                </div>

                {/* Featured Toggle */}
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
                    className="w-5 h-5 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">Show on homepage</span>
                </label>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2 text-white rounded-lg hover:opacity-90 disabled:opacity-50"
                  style={{ backgroundColor: '#105652' }}
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      {editingExp ? 'Update' : 'Create'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
