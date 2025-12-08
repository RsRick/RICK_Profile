import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import ProjectCard from './ProjectCard';
import ProjectModal from './ProjectModal';
import { databaseService } from '../../lib/appwrite';

const PROJECTS_COLLECTION = 'projects';

export default function Projects() {
  const [selectedCategory, setSelectedCategory] = useState("All Project");
  const [selectedProject, setSelectedProject] = useState(null);
  const [likedProjects, setLikedProjects] = useState(new Set());
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryColors, setCategoryColors] = useState({});
  const [categories, setCategories] = useState(["All Project"]);
  const [filterKey, setFilterKey] = useState(0);

  // Load categories and projects from database
  useEffect(() => {
    loadCategories();
    loadProjects();
    loadLikedProjects();
  }, []);

  // Load liked projects from localStorage
  const loadLikedProjects = () => {
    try {
      const liked = localStorage.getItem('likedProjects');
      if (liked) {
        setLikedProjects(new Set(JSON.parse(liked)));
      }
    } catch (error) {
      console.error('Error loading liked projects:', error);
    }
  };

  // Save liked projects to localStorage
  const saveLikedProjects = (likedSet) => {
    try {
      localStorage.setItem('likedProjects', JSON.stringify([...likedSet]));
    } catch (error) {
      console.error('Error saving liked projects:', error);
    }
  };

  const loadCategories = async () => {
    try {
      const result = await databaseService.listDocuments('categories');
      if (result.success && result.data.documents.length > 0) {
        // Sort by order and create category list
        const sortedCategories = result.data.documents.sort((a, b) => a.order - b.order);
        const categoryNames = ["All Project", ...sortedCategories.map(cat => cat.name)];
        setCategories(categoryNames);
        
        // Create a map of category name to color
        const colorMap = {};
        sortedCategories.forEach(cat => {
          colorMap[cat.name] = cat.color;
        });
        setCategoryColors(colorMap);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadProjects = async () => {
    try {
      const result = await databaseService.listDocuments(PROJECTS_COLLECTION);
      if (result.success && result.data.documents.length > 0) {
        // Transform database format to component format
        const transformedProjects = result.data.documents.map(doc => {
          // Explicitly check for featured - must be true, not undefined/null
          const isFeatured = doc.featured === true;
          console.log(`Project: ${doc.title}, Featured value: ${doc.featured}, Is Featured: ${isFeatured}`);
          
          // Parse projectDetails from database (stored as JSON strings)
          let parsedDetails = [];
          let details = {};
          
          if (doc.projectDetails && Array.isArray(doc.projectDetails)) {
            // New format: array of JSON strings
            parsedDetails = doc.projectDetails.map(jsonStr => {
              try {
                return JSON.parse(jsonStr);
              } catch (e) {
                console.error('Error parsing project detail:', e);
                return null;
              }
            }).filter(Boolean);
            
            // Convert to object for backward compatibility
            parsedDetails.forEach(detail => {
              details[detail.label] = detail.value;
            });
          } else {
            // Old format: individual fields
            details = {
              software: doc.software,
              timeframe: doc.timeframe,
              data: doc.dataSource,
              studyArea: doc.studyArea
            };
          }
          
          return {
            id: doc.$id,
            title: doc.title,
            category: doc.category,
            image: doc.thumbnailUrl,
            likes: doc.likes || 0,
            description: doc.description,
            featured: isFeatured,
            details: details,
            projectDetails: parsedDetails, // Pass parsed array for modal
            gallery: doc.galleryUrls || [doc.thumbnailUrl],
            projectLink: doc.projectLink,
            fullDescription: doc.fullDescription
          };
        });
        
        // ONLY show featured projects on homepage (must have featured = true)
        const featuredProjects = transformedProjects.filter(p => p.featured === true);
        console.log(`Total projects: ${transformedProjects.length}, Featured: ${featuredProjects.length}`);
        
        // ONLY show featured projects - no fallback!
        setProjects(featuredProjects);
      } else {
        // No projects in database - show empty state
        setProjects([]);
      }
    } catch (error) {
      console.error('Error loading projects:', error);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter projects based on selected category
  const filteredProjects = selectedCategory === "All Project"
    ? projects.slice(0, 9) // Show only 9 projects on homepage
    : projects.filter(p => p.category === selectedCategory).slice(0, 9);

  const handleCategoryChange = (category) => {
    if (category === selectedCategory) return;
    setSelectedCategory(category);
    setFilterKey(prev => prev + 1);
  };

  const handleLike = async (projectId) => {
    const isCurrentlyLiked = likedProjects.has(projectId);
    const project = projects.find(p => p.id === projectId);
    
    if (!project) return;

    // Optimistic update
    const newLikedProjects = new Set(likedProjects);
    let newLikeCount = project.likes;

    if (isCurrentlyLiked) {
      newLikedProjects.delete(projectId);
      newLikeCount = Math.max(0, project.likes - 1);
    } else {
      newLikedProjects.add(projectId);
      newLikeCount = project.likes + 1;
    }

    setLikedProjects(newLikedProjects);
    saveLikedProjects(newLikedProjects);

    // Update local state immediately
    setProjects(prev => prev.map(p => 
      p.id === projectId ? { ...p, likes: newLikeCount } : p
    ));

    // Update database
    try {
      const result = await databaseService.updateDocument(
        PROJECTS_COLLECTION,
        projectId,
        { likes: newLikeCount }
      );

      if (!result.success) {
        console.error('Failed to update likes:', result.error);
        // Revert on failure
        setLikedProjects(likedProjects);
        setProjects(prev => prev.map(p => 
          p.id === projectId ? { ...p, likes: project.likes } : p
        ));
      }
    } catch (error) {
      console.error('Error updating likes:', error);
      // Revert on error
      setLikedProjects(likedProjects);
      setProjects(prev => prev.map(p => 
        p.id === projectId ? { ...p, likes: project.likes } : p
      ));
    }
  };

  return (
    <section id="projects" className="py-10 relative overflow-hidden scroll-mt-20">
      {/* Gradient Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute rounded-full blur-3xl"
          style={{
            background: '#3ba8d1',
            width: '450px',
            height: '450px',
            top: '20%',
            left: '50%',
            transform: 'translateX(-50%)',
            animation: 'float 25s ease-in-out infinite',
            opacity: 0.15,
          }}
        />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Section Title */}
        <h2 className="text-3xl font-bold mb-6 text-center" style={{ color: '#2596be' }}>
          Featured Projects
        </h2>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => handleCategoryChange(category)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
                selectedCategory === category
                  ? 'text-white shadow-lg scale-105'
                  : 'bg-white text-gray-700 hover:bg-gray-50 shadow-md'
              }`}
              style={{
                backgroundColor: selectedCategory === category ? '#2596be' : undefined,
              }}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Projects Grid */}
        <div className="relative mb-8 max-w-6xl mx-auto">
          <div 
            key={filterKey}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredProjects.map((project, index) => (
              <ProjectCard
                key={project.id}
                project={project}
                index={index}
                isLiked={likedProjects.has(project.id)}
                onLike={handleLike}
                onClick={() => setSelectedProject(project)}
                categoryColors={categoryColors}
              />
            ))}
          </div>
        </div>

        {/* View All Projects Button */}
        <div className="flex justify-center mt-8">
          <Link
            to="/projects"
            className="group relative px-6 py-2.5 rounded-lg font-semibold text-white text-base overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl"
            style={{ backgroundColor: '#2596be' }}
          >
            <span className="relative z-10">View All Projects</span>
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{
                background: 'linear-gradient(135deg, #3ba8d1, #2596be)',
              }}
            />
          </Link>
        </div>
      </div>

      {/* Project Modal */}
      {selectedProject && (
        <ProjectModal
          project={selectedProject}
          isLiked={likedProjects.has(selectedProject.id)}
          onLike={handleLike}
          onClose={() => setSelectedProject(null)}
          onNavigate={(direction) => {
            const currentIndex = filteredProjects.findIndex(p => p.id === selectedProject.id);
            if (direction === 'prev' && currentIndex > 0) {
              setSelectedProject(filteredProjects[currentIndex - 1]);
            } else if (direction === 'next' && currentIndex < filteredProjects.length - 1) {
              setSelectedProject(filteredProjects[currentIndex + 1]);
            }
          }}
          currentIndex={filteredProjects.findIndex(p => p.id === selectedProject.id)}
          totalProjects={filteredProjects.length}
        />
      )}
    </section>
  );
}

