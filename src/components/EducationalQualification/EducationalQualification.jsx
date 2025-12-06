import React, { useState, useEffect } from 'react';
import { GraduationCap, BookOpen, Award, Calendar, MapPin } from 'lucide-react';

export default function EducationalQualification() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const educationData = [
    {
      degree: 'BSc in Geography and Environment',
      institution: 'Islamic University Bangladesh',
      location: 'Kushtia, Bangladesh',
      duration: 'March 2022 - Current',
      cgpa: '3.78',
      scale: '4.00',
      icon: GraduationCap,
      status: 'ongoing',
      color: '#105652',
    },
    {
      degree: 'HSC - Higher Secondary Certificate',
      institution: 'Dukhi Mahmood College',
      location: 'Shailkupa, Jhenaidah',
      duration: '2018 - 2020',
      cgpa: '5.00',
      scale: '5.00',
      icon: BookOpen,
      status: 'completed',
      color: '#1E8479',
    },
    {
      degree: 'SSC - Secondary School Certificate',
      institution: 'Tribeni High School',
      location: 'Shailkupa, Jhenaidah',
      duration: '2016 - 2018',
      cgpa: '5.00',
      scale: '5.00',
      icon: Award,
      status: 'completed',
      color: '#2AA08F',
    },
  ];

  return (
    <section
      id="education"
      className="py-12 relative overflow-hidden"
      style={{ background: '#FFFAEB' }}
    >
      <div className="container mx-auto px-6">
        {/* Section Header - Compact */}
        <div
          className={`text-center mb-8 transform transition-all duration-1000 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-lg mb-3">
            <GraduationCap className="w-4 h-4" style={{ color: '#105652' }} />
            <span className="text-xs font-semibold" style={{ color: '#105652' }}>
              Academic Journey
            </span>
          </div>

          <h2
            className="text-3xl md:text-4xl font-bold mb-3"
            style={{ color: '#105652' }}
          >
            Educational Qualification
          </h2>

          <div
            className="w-16 h-1 mx-auto rounded-full"
            style={{ background: 'linear-gradient(90deg, #105652, #1E8479)' }}
          />
        </div>

        {/* Education Cards - Compact Grid */}
        <div className="max-w-6xl mx-auto relative">
          {/* Vertical Timeline Line - Hidden on mobile, visible on desktop */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 transform -translate-x-1/2 pointer-events-none">
            {/* Animated gradient line */}
            <div
              className="relative w-0.5 h-full mx-auto"
              style={{
                background: 'linear-gradient(180deg, #105652 0%, #1E8479 50%, #2AA08F 100%)',
                opacity: 0.3
              }}
            >
              {/* Animated dot moving down the line */}
              <div
                className={`absolute w-3 h-3 rounded-full left-1/2 transform -translate-x-1/2 transition-all duration-2000 ${
                  isVisible ? 'top-full' : 'top-0'
                }`}
                style={{
                  background: 'linear-gradient(135deg, #105652, #1E8479)',
                  boxShadow: '0 0 10px rgba(16, 86, 82, 0.5)',
                  transitionDelay: '500ms'
                }}
              />
            </div>

            {/* Timeline nodes at card positions */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-0">
              <div
                className={`w-4 h-4 rounded-full border-4 border-white shadow-lg transition-all duration-700 ${
                  isVisible ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
                }`}
                style={{ background: '#105652' }}
              />
            </div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div
                className={`w-4 h-4 rounded-full border-4 border-white shadow-lg transition-all duration-700 delay-150 ${
                  isVisible ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
                }`}
                style={{ background: '#1E8479' }}
              />
            </div>
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-0">
              <div
                className={`w-4 h-4 rounded-full border-4 border-white shadow-lg transition-all duration-700 delay-300 ${
                  isVisible ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
                }`}
                style={{ background: '#2AA08F' }}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 relative z-10">
            {/* Left Column - BSC (top) and SSC (bottom) */}
            <div className="space-y-6">
              {/* BSC Card - Current (Top) */}
              <div
                className={`transform transition-all duration-700 ${
                  isVisible ? 'translate-x-0 opacity-100' : '-translate-x-20 opacity-0'
                }`}
              >
                <div className="bg-white rounded-xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-[#105652] relative overflow-hidden group">
                  {/* Status Badge with Subtle Pulse */}
                  <div className="absolute top-3 right-3">
                    <div
                      className="relative px-3 py-1 rounded-full text-xs font-bold text-white"
                      style={{ background: '#105652' }}
                    >
                      In Progress
                      {/* Subtle glow effect */}
                      <span
                        className="absolute inset-0 rounded-full opacity-0 animate-ping"
                        style={{
                          background: '#105652',
                          animationDuration: '3s'
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex gap-4">
                    {/* Icon */}
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center shadow-md flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg, #105652, #0d4240)' }}
                    >
                      <GraduationCap className="w-6 h-6 text-white" />
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Degree */}
                      <h3
                        className="text-lg font-bold mb-2 leading-tight"
                        style={{ color: '#105652' }}
                      >
                        BSc in Geography and Environment
                      </h3>

                      {/* Institution */}
                      <div className="flex items-start gap-2 mb-1.5 text-gray-700">
                        <BookOpen className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#105652' }} />
                        <p className="text-sm font-medium">Islamic University Bangladesh</p>
                      </div>

                      {/* Location */}
                      <div className="flex items-start gap-2 mb-3 text-gray-600">
                        <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#105652' }} />
                        <p className="text-sm">Kushtia, Bangladesh</p>
                      </div>

                      {/* CGPA Badge */}
                      <div
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-white shadow-md"
                        style={{ background: 'linear-gradient(135deg, #105652, #0d4240)' }}
                      >
                        <span className="text-xs opacity-90">CGPA</span>
                        <span className="text-base">3.78</span>
                        <span className="text-xs opacity-90">/ 4.00</span>
                      </div>
                    </div>
                  </div>

                  {/* Duration */}
                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <div className="inline-flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4" style={{ color: '#105652' }} />
                      <span className="text-sm font-semibold">March 2022 - Current</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* SSC Card - 2016-2018 (Bottom) */}
              <div
                className={`transform transition-all duration-700 delay-300 ${
                  isVisible ? 'translate-x-0 opacity-100' : '-translate-x-20 opacity-0'
                }`}
              >
                <div className="bg-white rounded-xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-[#2AA08F] relative overflow-hidden group">
                  <div className="flex gap-4">
                    {/* Icon */}
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center shadow-md flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg, #2AA08F, #1f8173)' }}
                    >
                      <Award className="w-6 h-6 text-white" />
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Degree */}
                      <h3
                        className="text-lg font-bold mb-2 leading-tight"
                        style={{ color: '#2AA08F' }}
                      >
                        SSC - Secondary School Certificate
                      </h3>

                      {/* Institution */}
                      <div className="flex items-start gap-2 mb-1.5 text-gray-700">
                        <BookOpen className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#2AA08F' }} />
                        <p className="text-sm font-medium">Tribeni High School</p>
                      </div>

                      {/* Location */}
                      <div className="flex items-start gap-2 mb-3 text-gray-600">
                        <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#2AA08F' }} />
                        <p className="text-sm">Shailkupa, Jhenaidah</p>
                      </div>

                      {/* GPA Badge */}
                      <div
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-white shadow-md"
                        style={{ background: 'linear-gradient(135deg, #2AA08F, #1f8173)' }}
                      >
                        <span className="text-xs opacity-90">GPA</span>
                        <span className="text-base">5.00</span>
                        <span className="text-xs opacity-90">/ 5.00</span>
                      </div>
                    </div>
                  </div>

                  {/* Duration */}
                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <div className="inline-flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4" style={{ color: '#2AA08F' }} />
                      <span className="text-sm font-semibold">2016 - 2018</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - HSC (centered vertically) */}
            <div className="flex items-center">
              <div
                className={`w-full transform transition-all duration-700 delay-150 ${
                  isVisible ? 'translate-x-0 opacity-100' : 'translate-x-20 opacity-0'
                }`}
              >
                <div className="bg-white rounded-xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-[#1E8479] relative overflow-hidden group">
                  <div className="flex gap-4">
                    {/* Icon */}
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center shadow-md flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg, #1E8479, #16685e)' }}
                    >
                      <BookOpen className="w-6 h-6 text-white" />
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Degree */}
                      <h3
                        className="text-lg font-bold mb-2 leading-tight"
                        style={{ color: '#1E8479' }}
                      >
                        HSC - Higher Secondary Certificate
                      </h3>

                      {/* Institution */}
                      <div className="flex items-start gap-2 mb-1.5 text-gray-700">
                        <BookOpen className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#1E8479' }} />
                        <p className="text-sm font-medium">Dukhi Mahmood College</p>
                      </div>

                      {/* Location */}
                      <div className="flex items-start gap-2 mb-3 text-gray-600">
                        <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#1E8479' }} />
                        <p className="text-sm">Shailkupa, Jhenaidah</p>
                      </div>

                      {/* GPA Badge */}
                      <div
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-white shadow-md"
                        style={{ background: 'linear-gradient(135deg, #1E8479, #16685e)' }}
                      >
                        <span className="text-xs opacity-90">GPA</span>
                        <span className="text-base">5.00</span>
                        <span className="text-xs opacity-90">/ 5.00</span>
                      </div>
                    </div>
                  </div>

                  {/* Duration */}
                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <div className="inline-flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4" style={{ color: '#1E8479' }} />
                      <span className="text-sm font-semibold">2018 - 2020</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
