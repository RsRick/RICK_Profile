import React from 'react';
import { Link } from 'react-router-dom';
import { Menu } from 'lucide-react';

export default function AdminHome() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8" style={{ color: '#105652' }}>
        Admin Dashboard
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          to="/admin/menubar"
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 hover:border-[#105652]"
        >
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #105652, #1E8479)' }}
            >
              <Menu className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Menubar</h2>
              <p className="text-gray-600 text-sm">
                Manage menu items, logo, and navigation
              </p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}

