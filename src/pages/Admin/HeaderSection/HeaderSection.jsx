import React, { useState, useEffect } from 'react';
import {
  Upload,
  Save,
  GripVertical,
  Plus,
  X,
  Image as ImageIcon,
  Trash2,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import {
  databaseService,
  storageService,
  appwriteConfig,
  ID,
} from '../../../lib/appwrite';
import FontSelector from '../../../components/FontSelector/FontSelector';

// Icon mapping for social links
const ICON_MAP = {
  github: 'Github',
  linkedin: 'Linkedin',
  mail: 'Mail',
  mapPin: 'MapPin',
  code: 'Code',
  twitter: 'Twitter',
  facebook: 'Facebook',
  instagram: 'Instagram',
  youtube: 'Youtube',
  globe: 'Globe',
  externalLink: 'ExternalLink',
};

export default function HeaderSection() {
  const [heroName, setHeroName] = useState('PARVEJ HOSSAIN');
  const [heroNameFont, setHeroNameFont] = useState("'Playfair Display', serif");
  const [roles, setRoles] = useState([
    { id: 1, text: 'GIS Enthusiast', order: 0 },
    { id: 2, text: 'Cartographer', order: 1 },
    { id: 3, text: 'GIS Data Analyst', order: 2 },
  ]);
  const [rolesFont, setRolesFont] = useState("'Poppins', sans-serif");
  const [description, setDescription] = useState(
    'Skilled in Python, R, and GIS software like ArcGIS Pro, ArcMap, QGIS, and Erdas Imagine, with practical experience in analyzing environmental data. Eager to learn from experts and contribute to impactful research that promotes sustainability and addresses global climate challenges.'
  );
  const [descriptionFont, setDescriptionFont] = useState("'Open Sans', sans-serif");
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoUrl, setPhotoUrl] = useState(null);
  const [yearsExperience, setYearsExperience] = useState({ number: '5+', text: 'Years\nExperience' });
  const [projectsCompleted, setProjectsCompleted] = useState({ number: '10+', text: 'Projects\nCompleted' });
  const [statsFont, setStatsFont] = useState("'Poppins', sans-serif");
  const [socialLinks, setSocialLinks] = useState([
    { id: 1, icon: 'github', label: 'GitHub', href: '#', order: 0 },
    { id: 2, icon: 'linkedin', label: 'LinkedIn', href: '#', order: 1 },
    { id: 3, icon: 'code', label: 'Portfolio', href: '#', order: 2 },
    { id: 4, icon: 'mapPin', label: 'Google Scholar', href: '#', order: 3 },
  ]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const HEADER_COLLECTION = 'header_section';
  const STORAGE_BUCKET = appwriteConfig.storageId || 'reactbucket';

  useEffect(() => {
    loadHeaderSettings();
  }, []);

  const loadHeaderSettings = async () => {
    try {
      setLoading(true);
      const result = await databaseService.listDocuments(HEADER_COLLECTION);
      if (result.success && result.data.documents.length > 0) {
        const settings = result.data.documents[0];
        if (settings.heroName) setHeroName(settings.heroName);
        if (settings.heroNameFont) setHeroNameFont(settings.heroNameFont);
        if (settings.roles) setRoles(JSON.parse(settings.roles));
        if (settings.rolesFont) setRolesFont(settings.rolesFont);
        if (settings.description) setDescription(settings.description);
        if (settings.descriptionFont) setDescriptionFont(settings.descriptionFont);
        if (settings.photoUrl) {
          setPhotoUrl(settings.photoUrl);
          setPhotoPreview(settings.photoUrl);
        }
        if (settings.yearsExperience) setYearsExperience(JSON.parse(settings.yearsExperience));
        if (settings.projectsCompleted) setProjectsCompleted(JSON.parse(settings.projectsCompleted));
        if (settings.statsFont) setStatsFont(settings.statsFont);
        if (settings.socialLinks) setSocialLinks(JSON.parse(settings.socialLinks));
      }
    } catch (error) {
      console.error('Error loading header settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        alert('Please select a valid image file (PNG, JPG, or WebP)');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadPhoto = async () => {
    if (!photoFile) return null;
    try {
      const fileId = ID.unique();
      const result = await storageService.uploadFile(STORAGE_BUCKET, fileId, photoFile);
      if (result.success) {
        return storageService.getFileView(STORAGE_BUCKET, result.data.$id);
      }
      return null;
    } catch (error) {
      console.error('Error uploading photo:', error);
      return null;
    }
  };

  const handleRoleMove = (index, direction) => {
    const newRoles = [...roles];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= newRoles.length) return;
    [newRoles[index], newRoles[newIndex]] = [newRoles[newIndex], newRoles[index]];
    setRoles(newRoles.map((r, i) => ({ ...r, order: i })));
  };

  const handleRoleDelete = (id) => {
    setRoles(roles.filter((r) => r.id !== id).map((r, i) => ({ ...r, order: i })));
  };

  const handleAddRole = () => {
    const newId = Math.max(...roles.map((r) => r.id), 0) + 1;
    setRoles([...roles, { id: newId, text: 'New Role', order: roles.length }]);
  };

  const handleRoleChange = (id, text) => {
    setRoles(roles.map((r) => (r.id === id ? { ...r, text } : r)));
  };

  const handleSocialMove = (index, direction) => {
    const newLinks = [...socialLinks];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= newLinks.length) return;
    [newLinks[index], newLinks[newIndex]] = [newLinks[newIndex], newLinks[index]];
    setSocialLinks(newLinks.map((l, i) => ({ ...l, order: i })));
  };

  const handleSocialDelete = (id) => {
    setSocialLinks(socialLinks.filter((l) => l.id !== id).map((l, i) => ({ ...l, order: i })));
  };

  const handleAddSocial = () => {
    const newId = Math.max(...socialLinks.map((l) => l.id), 0) + 1;
    setSocialLinks([
      ...socialLinks,
      { id: newId, icon: 'globe', label: 'New Link', href: '#', order: socialLinks.length },
    ]);
  };

  const handleSocialChange = (id, field, value) => {
    setSocialLinks(socialLinks.map((l) => (l.id === id ? { ...l, [field]: value } : l)));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      let finalPhotoUrl = photoUrl;

      if (photoFile) {
        finalPhotoUrl = await uploadPhoto();
        if (!finalPhotoUrl) {
          alert('Failed to upload photo. Please check your storage bucket permissions.');
          setSaving(false);
          return;
        }
      }

      const settingsData = {
        heroName: heroName || 'PARVEJ HOSSAIN',
        heroNameFont: heroNameFont,
        roles: JSON.stringify(roles),
        rolesFont: rolesFont,
        description: description || '',
        descriptionFont: descriptionFont,
        photoUrl: finalPhotoUrl || '',
        yearsExperience: JSON.stringify(yearsExperience),
        projectsCompleted: JSON.stringify(projectsCompleted),
        statsFont: statsFont,
        socialLinks: JSON.stringify(socialLinks),
      };

      const existing = await databaseService.listDocuments(HEADER_COLLECTION);
      if (existing.success && existing.data.documents.length > 0) {
        const updateResult = await databaseService.updateDocument(
          HEADER_COLLECTION,
          existing.data.documents[0].$id,
          settingsData
        );
        if (!updateResult.success) {
          throw new Error(updateResult.error || 'Failed to update settings');
        }
      } else {
        const createResult = await databaseService.createDocument(
          HEADER_COLLECTION,
          settingsData
        );
        if (!createResult.success) {
          throw new Error(createResult.error || 'Failed to create settings');
        }
      }

      setPhotoUrl(finalPhotoUrl);
      setPhotoFile(null);
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert(error.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-3xl font-bold mb-6" style={{ color: '#2596be' }}>
          Header Section Settings
        </h1>

        {/* Hero Name */}
        <div className="mb-8">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Name (after "Hi, I'm")
          </label>
          <input
            type="text"
            value={heroName}
            onChange={(e) => setHeroName(e.target.value)}
            placeholder="PARVEJ HOSSAIN"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2596be] focus:border-transparent outline-none transition-all mb-4"
          />
          <FontSelector
            value={heroNameFont}
            onChange={setHeroNameFont}
            label="Name Font"
            previewText={heroName || 'PARVEJ HOSSAIN'}
          />
        </div>

        {/* Roles */}
        <div className="mb-8">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Rotating Roles (Typewriter Effect)
          </label>
          <FontSelector
            value={rolesFont}
            onChange={setRolesFont}
            label="Roles Font"
            previewText={roles[0]?.text || 'GIS Enthusiast'}
          />
          <div className="space-y-2 mt-4">
            {roles.map((role, index) => (
              <div key={role.id} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <GripVertical className="w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={role.text}
                  onChange={(e) => handleRoleChange(role.id, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#2596be] focus:border-transparent outline-none"
                />
                <div className="flex gap-1">
                  <button
                    onClick={() => handleRoleMove(index, 'up')}
                    disabled={index === 0}
                    className="p-1 text-gray-600 hover:text-[#2596be] disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleRoleMove(index, 'down')}
                    disabled={index === roles.length - 1}
                    className="p-1 text-gray-600 hover:text-[#2596be] disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleRoleDelete(role.id)}
                    className="p-1 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            <button
              onClick={handleAddRole}
              className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-[#2596be] hover:text-[#2596be] transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Role
            </button>
          </div>
        </div>

        {/* Description */}
        <div className="mb-8">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Description Text
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2596be] focus:border-transparent outline-none transition-all resize-none mb-4"
            placeholder="Enter your description..."
          />
          <FontSelector
            value={descriptionFont}
            onChange={setDescriptionFont}
            label="Description Font"
            previewText={description.substring(0, 50) + '...'}
          />
        </div>

        {/* Professional Photo */}
        <div className="mb-8">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Professional Photo
          </label>
          {photoPreview ? (
            <div className="mb-4">
              <div className="relative inline-block">
                <div className="w-64 h-80 border-2 border-gray-300 rounded-lg overflow-hidden bg-gray-50">
                  <img
                    src={photoPreview}
                    alt="Photo preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                {photoFile && (
                  <button
                    onClick={() => {
                      setPhotoFile(null);
                      setPhotoPreview(photoUrl);
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <p className="mt-2 text-sm text-gray-500">
                {photoFile ? `New file: ${photoFile.name}` : 'Current photo'}
              </p>
            </div>
          ) : (
            <div className="mb-4">
              <div className="w-64 h-80 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                <ImageIcon className="w-16 h-16 text-gray-400" />
              </div>
            </div>
          )}
          <label className="inline-flex items-center gap-2 px-6 py-3 bg-[#2596be] text-white rounded-lg cursor-pointer hover:bg-[#3ba8d1] transition-colors">
            <Upload className="w-5 h-5" />
            <span>{photoFile ? 'Change Photo' : 'Upload Photo'}</span>
            <input
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              onChange={handlePhotoChange}
              className="hidden"
            />
          </label>
          <p className="mt-2 text-sm text-gray-500">
            <strong>Recommended size:</strong> 800x960px (5:6 aspect ratio) or 600x720px. Max size: 5MB. Formats: PNG, JPG, WebP
          </p>
        </div>

        {/* Stats */}
        <div className="mb-8">
          <label className="block text-sm font-semibold text-gray-700 mb-4">
            Statistics Section
          </label>
          <div className="mb-4">
            <FontSelector
              value={statsFont}
              onChange={setStatsFont}
              label="Statistics Font"
              previewText={`${yearsExperience.number} ${yearsExperience.text.split('\n')[0]}`}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Years Experience
              </label>
              <input
                type="text"
                value={yearsExperience.number}
                onChange={(e) => setYearsExperience({ ...yearsExperience, number: e.target.value })}
                placeholder="5+"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2596be] focus:border-transparent outline-none mb-2"
              />
              <textarea
                value={yearsExperience.text}
                onChange={(e) => setYearsExperience({ ...yearsExperience, text: e.target.value })}
                rows={2}
                placeholder="Years\nExperience"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2596be] focus:border-transparent outline-none resize-none text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Projects Completed
              </label>
              <input
                type="text"
                value={projectsCompleted.number}
                onChange={(e) => setProjectsCompleted({ ...projectsCompleted, number: e.target.value })}
                placeholder="10+"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2596be] focus:border-transparent outline-none mb-2"
              />
              <textarea
                value={projectsCompleted.text}
                onChange={(e) => setProjectsCompleted({ ...projectsCompleted, text: e.target.value })}
                rows={2}
                placeholder="Projects\nCompleted"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2596be] focus:border-transparent outline-none resize-none text-sm"
              />
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="mb-8">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Social Links (Find Me On)
          </label>
          <div className="space-y-2">
            {socialLinks.map((link, index) => (
              <div key={link.id} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <GripVertical className="w-5 h-5 text-gray-400" />
                <select
                  value={link.icon}
                  onChange={(e) => handleSocialChange(link.id, 'icon', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#2596be] focus:border-transparent outline-none"
                >
                  {Object.keys(ICON_MAP).map((key) => (
                    <option key={key} value={key}>
                      {ICON_MAP[key]}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={link.label}
                  onChange={(e) => handleSocialChange(link.id, 'label', e.target.value)}
                  placeholder="Label"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#2596be] focus:border-transparent outline-none"
                />
                <input
                  type="url"
                  value={link.href}
                  onChange={(e) => handleSocialChange(link.id, 'href', e.target.value)}
                  placeholder="URL"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#2596be] focus:border-transparent outline-none"
                />
                <div className="flex gap-1">
                  <button
                    onClick={() => handleSocialMove(index, 'up')}
                    disabled={index === 0}
                    className="p-1 text-gray-600 hover:text-[#2596be] disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleSocialMove(index, 'down')}
                    disabled={index === socialLinks.length - 1}
                    className="p-1 text-gray-600 hover:text-[#2596be] disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleSocialDelete(link.id)}
                    className="p-1 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            <button
              onClick={handleAddSocial}
              className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-[#2596be] hover:text-[#2596be] transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Social Link
            </button>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-3 bg-[#2596be] text-white rounded-lg font-semibold hover:bg-[#3ba8d1] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Save className="w-5 h-5" />
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
}



