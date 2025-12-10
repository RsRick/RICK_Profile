import { useState, useEffect } from 'react';
import ProjectCard from '../components/Projects/ProjectCard';
import ProjectModal from '../components/Projects/ProjectModal';
import PageWrapper from '../components/PageWrapper/PageWrapper';
import { databaseService } from '../lib/appwrite';

const PROJECTS_COLLECTION = 'projects';

// No demo projects - only load from database

export default function ProjectsPage() {
  const [selectedCategory, setSelectedCategory] = useState("All Project");
  const [selectedProject, setSelectedProject] = useState(null);
  const [likedProjects, setLikedProjects] = useState(new Set());
  const [projects, setProjects] = useState([]);
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
            details: details,
            projectDetails: parsedDetails, // Pass parsed array for modal
            gallery: doc.galleryUrls || [doc.thumbnailUrl],
            projectLink: doc.projectLink,
            fullDescription: doc.fullDescription
          };
        });
        setProjects(transformedProjects);
      } else {
        // No projects in database - show empty state
        setProjects([]);
      }
    } catch (error) {
      console.error('Error loading projects:', error);
      // On error, show empty state instead of demo projects
      setProjects([]);
    }
  };

  // Filter projects based on selected category
  const filteredProjects = selectedCategory === "All Project"
    ? projects
    : projects.filter(p => p.category === selectedCategory);

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
    <PageWrapper>
      <div className="min-h-[calc(100vh-144px)] pt-8 pb-20">
        <div className="container mx-auto px-6">
          {/* Page Title - Center Aligned */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-3" style={{ color: '#2596be' }}>
              Projects
            </h1>
            <p className="text-base text-gray-600">
              Explore my complete portfolio of {projects.length} projects
            </p>
          </div>

          {/* Category Filter - Center Aligned */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {categories.map((category) => {
              const count = category === "All Project" 
                ? projects.length 
                : projects.filter(p => p.category === category).length;
              
              return (
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
                  <span className="ml-1.5 text-xs opacity-75">
                    ({count})
                  </span>
                </button>
              );
            })}
          </div>

          {/* Projects Grid */}
          <div className="relative max-w-5xl">
            <div 
              key={filterKey}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
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
                  compact={true}
                />
              ))}
            </div>
          </div>

          {/* No Results */}
          {filteredProjects.length === 0 && (
            <div className="text-center py-20">
              <p className="text-2xl text-gray-500">No projects found in this category</p>
            </div>
          )}
        </div>
      </div>

      {/* Project Modal */}
      {selectedProject && (
        <ProjectModal
          project={selectedProject}
          isLiked={likedProjects.has(selectedProject.id)}
          onLike={handleLike}
          onClose={() => setSelectedProject(null)}
        />
      )}
    </PageWrapper>
  );
}

