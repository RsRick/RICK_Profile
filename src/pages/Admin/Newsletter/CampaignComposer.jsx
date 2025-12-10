import { useState, useRef } from 'react';
import { ArrowLeft, Send, Save, Eye, Code, Type, FileCode, Upload, Users, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { newsletterService } from '../../../lib/appwrite';

export default function CampaignComposer({ initialData, recipients, folders, onBack, onSent }) {
  const [campaign, setCampaign] = useState({
    name: initialData?.name || '',
    folderId: initialData?.folderId || '',
    fromName: initialData?.fromName || '',
    fromEmail: initialData?.fromEmail || '',
    subject: initialData?.subject || '',
    contentType: initialData?.contentType || 'html', // text, html, custom
    textContent: initialData?.textContent || '',
    htmlContent: initialData?.htmlContent || '',
    trackOpens: initialData?.trackOpens !== false,
    trackClicks: initialData?.trackClicks !== false
  });
  
  const [activeEditor, setActiveEditor] = useState('visual'); // visual, code, preview
  const [sending, setSending] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef(null);

  const handleChange = (field, value) => {
    setCampaign(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      handleChange('htmlContent', event.target.result);
      handleChange('contentType', 'custom');
    };
    reader.readAsText(file);
  };

  const saveDraft = async () => {
    if (!campaign.name || !campaign.subject) {
      setError('Name and subject are required');
      return;
    }
    
    setSaving(true);
    setError('');
    
    try {
      if (initialData?.$id) {
        await newsletterService.updateCampaign(initialData.$id, campaign);
      } else {
        await newsletterService.createCampaign(campaign);
      }
      setSuccess('Draft saved!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const sendCampaign = async () => {
    if (!campaign.subject) {
      setError('Subject is required');
      return;
    }
    if (!campaign.htmlContent && !campaign.textContent) {
      setError('Email content is required');
      return;
    }
    if (recipients.length === 0) {
      setError('No recipients selected');
      return;
    }

    if (!confirm(`Send this campaign to ${recipients.length} recipient(s)?`)) return;

    setSending(true);
    setError('');

    try {
      // Save campaign first
      let campaignId = initialData?.$id;
      if (!campaignId) {
        const createResult = await newsletterService.createCampaign({
          ...campaign,
          status: 'sending',
          recipientCount: recipients.length
        });
        if (!createResult.success) throw new Error(createResult.error);
        campaignId = createResult.data.$id;
      } else {
        await newsletterService.updateCampaign(campaignId, { status: 'sending' });
      }

      // Send via function
      const result = await newsletterService.sendCampaign(campaignId, campaign, recipients);
      
      if (result.success) {
        setSuccess(`Campaign sent to ${recipients.length} recipients!`);
        setTimeout(() => onSent(), 2000);
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      setError(err.message);
      setSending(false);
    }
  };

  // Simple HTML templates
  const templates = {
    blank: '',
    simple: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 20px; background-color: #f5f5f5; font-family: Arial, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
    <div style="background: #2596be; padding: 30px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 24px;">Your Newsletter Title</h1>
    </div>
    <div style="padding: 30px;">
      <p style="color: #333; line-height: 1.6;">Hello,</p>
      <p style="color: #333; line-height: 1.6;">Your newsletter content goes here. You can add text, images, and links.</p>
      <p style="color: #333; line-height: 1.6;">Best regards,<br>Your Name</p>
    </div>
    <div style="background: #f8f8f8; padding: 20px; text-align: center; border-top: 1px solid #eee;">
      <p style="color: #888; font-size: 12px; margin: 0;">© 2024 Your Company. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`,
    announcement: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 20px; background-color: #f0f4f8; font-family: 'Segoe UI', Arial, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
    <div style="background: linear-gradient(135deg, #2596be 0%, #3ba8d1 100%); padding: 40px; text-align: center;">
      <span style="font-size: 48px;">🎉</span>
      <h1 style="color: white; margin: 16px 0 0; font-size: 28px;">Big Announcement!</h1>
    </div>
    <div style="padding: 40px;">
      <p style="color: #333; line-height: 1.8; font-size: 16px;">Hi there,</p>
      <p style="color: #333; line-height: 1.8; font-size: 16px;">We have exciting news to share with you!</p>
      <div style="background: #f8fafc; border-radius: 12px; padding: 24px; margin: 24px 0; border-left: 4px solid #2596be;">
        <p style="color: #2596be; font-weight: 600; margin: 0;">Your announcement details here...</p>
      </div>
      <div style="text-align: center; margin-top: 32px;">
        <a href="#" style="display: inline-block; background: #2596be; color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600;">Learn More</a>
      </div>
    </div>
    <div style="background: #f8fafc; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0;">
      <p style="color: #64748b; font-size: 12px; margin: 0;">© 2024 Your Company</p>
    </div>
  </div>
</body>
</html>`
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">
            {initialData ? 'Edit Campaign' : 'New Campaign'}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm">
            <Users className="w-4 h-4" />
            {recipients.length} recipients
          </div>
          <button
            onClick={saveDraft}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Draft
          </button>
          <button
            onClick={sendCampaign}
            disabled={sending}
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50"
          >
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Send Campaign
          </button>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700">
          <CheckCircle className="w-5 h-5" />
          {success}
        </div>
      )}

      <div className="grid grid-cols-3 gap-6">
        {/* Left Column - Settings */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <h3 className="font-semibold text-gray-800 mb-4">Campaign Settings</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Name</label>
                <input
                  type="text"
                  value={campaign.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Internal name for this campaign"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Folder</label>
                <select
                  value={campaign.folderId}
                  onChange={(e) => handleChange('folderId', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                >
                  <option value="">No folder</option>
                  {folders.map(f => (
                    <option key={f.$id} value={f.$id}>{f.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">From Name</label>
                <input
                  type="text"
                  value={campaign.fromName}
                  onChange={(e) => handleChange('fromName', e.target.value)}
                  placeholder="Your Name or Company"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">From Email (optional)</label>
                <input
                  type="email"
                  value={campaign.fromEmail}
                  onChange={(e) => handleChange('fromEmail', e.target.value)}
                  placeholder="Uses default if empty"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject Line *</label>
                <input
                  type="text"
                  value={campaign.subject}
                  onChange={(e) => handleChange('subject', e.target.value)}
                  placeholder="Email subject"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-4">
            <h3 className="font-semibold text-gray-800 mb-4">Tracking</h3>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={campaign.trackOpens}
                  onChange={(e) => handleChange('trackOpens', e.target.checked)}
                  className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                />
                <span className="text-sm text-gray-700">Track email opens</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={campaign.trackClicks}
                  onChange={(e) => handleChange('trackClicks', e.target.checked)}
                  className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                />
                <span className="text-sm text-gray-700">Track link clicks</span>
              </label>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-4">
            <h3 className="font-semibold text-gray-800 mb-4">Templates</h3>
            <div className="space-y-2">
              <button
                onClick={() => handleChange('htmlContent', templates.simple)}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
              >
                📄 Simple Newsletter
              </button>
              <button
                onClick={() => handleChange('htmlContent', templates.announcement)}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
              >
                🎉 Announcement
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Editor */}
        <div className="col-span-2">
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            {/* Editor Tabs */}
            <div className="flex items-center justify-between border-b px-4">
              <div className="flex">
                <button
                  onClick={() => setActiveEditor('visual')}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px ${
                    activeEditor === 'visual' ? 'border-teal-600 text-teal-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Type className="w-4 h-4" /> Visual
                </button>
                <button
                  onClick={() => setActiveEditor('code')}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px ${
                    activeEditor === 'code' ? 'border-teal-600 text-teal-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Code className="w-4 h-4" /> HTML Code
                </button>
                <button
                  onClick={() => setActiveEditor('preview')}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px ${
                    activeEditor === 'preview' ? 'border-teal-600 text-teal-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Eye className="w-4 h-4" /> Preview
                </button>
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".html,.htm"
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  <Upload className="w-4 h-4" /> Upload HTML
                </button>
              </div>
            </div>

            {/* Editor Content */}
            <div className="p-4" style={{ minHeight: '500px' }}>
              {activeEditor === 'visual' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Plain Text Version (fallback)</label>
                    <textarea
                      value={campaign.textContent}
                      onChange={(e) => handleChange('textContent', e.target.value)}
                      placeholder="Plain text version of your email..."
                      rows={4}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 font-mono text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      HTML Content
                      <span className="text-gray-400 font-normal ml-2">
                        (paste from Canva, Mailchimp, or any email builder)
                      </span>
                    </label>
                    <textarea
                      value={campaign.htmlContent}
                      onChange={(e) => handleChange('htmlContent', e.target.value)}
                      placeholder="Paste your HTML email content here, or use a template from the left..."
                      rows={16}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 font-mono text-sm"
                    />
                  </div>
                </div>
              )}

              {activeEditor === 'code' && (
                <textarea
                  value={campaign.htmlContent}
                  onChange={(e) => handleChange('htmlContent', e.target.value)}
                  placeholder="<!DOCTYPE html>..."
                  className="w-full h-full min-h-[500px] px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 font-mono text-sm bg-gray-900 text-green-400"
                  style={{ tabSize: 2 }}
                />
              )}

              {activeEditor === 'preview' && (
                <div className="border rounded-lg overflow-hidden bg-gray-100">
                  {campaign.htmlContent ? (
                    <iframe
                      srcDoc={campaign.htmlContent}
                      className="w-full bg-white"
                      style={{ minHeight: '500px', border: 'none' }}
                      title="Email Preview"
                    />
                  ) : (
                    <div className="p-8 text-center text-gray-500">
                      <FileCode className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>No content to preview</p>
                      <p className="text-sm mt-1">Add HTML content or select a template</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
