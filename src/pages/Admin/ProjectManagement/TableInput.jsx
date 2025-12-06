import React, { useState } from 'react';
import { X } from 'lucide-react';

export default function TableInput({ onSave, onCancel, initialData }) {
  const [rows, setRows] = useState(initialData?.rows || 3);
  const [cols, setCols] = useState(initialData?.cols || 3);

  const handleSave = () => {
    // Create default table data
    const tableData = Array(rows).fill(null).map((_, rowIdx) => 
      Array(cols).fill(null).map(() => ({
        text: '',
        fontFamily: "'Inter', sans-serif",
        fontSize: '14',
        color: '#1f2937',
        bgColor: '#ffffff',
        alignment: 'left',
        bold: rowIdx === 0, // First row (header) is bold by default
        italic: false
      }))
    );
    
    onSave({
      rows,
      cols,
      tableData,
      borderColor: '#e5e7eb',
      borderWidth: 1,
      headerBgColor: '#f3f4f6',
      headerTextColor: '#1f2937',
      stripedRows: false,
      stripedColor: '#f9fafb'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="bg-white border-b px-6 py-4 flex justify-between items-center rounded-t-lg">
          <h3 className="text-xl font-bold" style={{ color: '#105652' }}>
            {initialData ? 'Edit Table Dimensions' : 'Insert Table'}
          </h3>
          <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          <p className="text-sm text-gray-600 mb-6">
            Select the number of rows and columns. You can edit content, add/remove rows/columns, and style text directly in the editor after inserting.
          </p>
          
          {/* Dimension Controls */}
          <div className="mb-6 flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">Rows</label>
              <input
                type="number"
                min="1"
                max="20"
                value={rows}
                onChange={(e) => setRows(Math.max(1, parseInt(e.target.value) || 1))}
                className="border rounded px-3 py-2 w-full text-lg"
                style={{ borderColor: '#105652' }}
              />
              <p className="text-xs text-gray-500 mt-1">1-20 rows</p>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">Columns</label>
              <input
                type="number"
                min="1"
                max="10"
                value={cols}
                onChange={(e) => setCols(Math.max(1, parseInt(e.target.value) || 1))}
                className="border rounded px-3 py-2 w-full text-lg"
                style={{ borderColor: '#105652' }}
              />
              <p className="text-xs text-gray-500 mt-1">1-10 columns</p>
            </div>
          </div>

          {/* Preview */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium mb-2">Preview:</p>
            <div className="text-center text-gray-600">
              <p className="text-2xl font-bold">{rows} × {cols}</p>
              <p className="text-sm">table will be created</p>
            </div>
          </div>

          {/* Info */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800 font-medium mb-2">After inserting:</p>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• Click cells to edit content</li>
              <li>• Hover rows/columns to add/remove</li>
              <li>• Select text to use toolbar features (bold, color, links, etc.)</li>
              <li>• First row is header (bold by default)</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <button
              onClick={onCancel}
              className="px-6 py-2 border rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 rounded-lg text-white"
              style={{ backgroundColor: '#105652' }}
            >
              {initialData ? 'Update Dimensions' : 'Insert Table'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
