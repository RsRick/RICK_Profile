import React from 'react';

export default function Research() {
  return (
    <section id="research" className="min-h-screen py-20 relative overflow-hidden scroll-mt-20">
      {/* Gradient Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute rounded-full blur-3xl"
          style={{
            background: '#105652',
            width: '400px',
            height: '400px',
            top: '50%',
            left: '-100px',
            transform: 'translateY(-50%)',
            animation: 'float 20s ease-in-out infinite reverse',
            opacity: 0.15,
          }}
        />
        <div
          className="absolute rounded-full blur-3xl"
          style={{
            background: '#1E8479',
            width: '300px',
            height: '300px',
            bottom: '-50px',
            right: '10%',
            animation: 'float 18s ease-in-out infinite',
            opacity: 0.15,
          }}
        />
      </div>
      <div className="container mx-auto px-6 relative z-10">
        <h2 className="text-4xl font-bold mb-8" style={{ color: '#105652' }}>
          Research
        </h2>
        <p className="text-lg text-gray-600">
          Research section content goes here...
        </p>
      </div>
    </section>
  );
}

