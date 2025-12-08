import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import ProjectCard from '../components/Projects/ProjectCard';
import ProjectModal from '../components/Projects/ProjectModal';
import PageWrapper from '../components/PageWrapper/PageWrapper';
import { databaseService } from '../lib/appwrite';

const PROJECTS_COLLECTION = 'projects';

// Mock data - fallback if database is empty
const allProjects = [
  {
    id: 1,
    title: "Mapping Bangladesh's Seismic Risks",
    category: "GIS",
    image: "https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800",
    likes: 114,
    description: "Through a wide variety of mobile applications, we've developed a unique visual system.",
    details: {
      software: "ArcGIS Pro",
      timeframe: "2001-2025",
      data: "USGS",
      studyArea: "Bangladesh"
    },
    gallery: [
      "https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800",
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800",
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800"
    ],
    projectLink: "https://example.com",
    fullDescription: `
      <h2 style="color: #2596be; font-size: 2rem; font-weight: bold; margin-bottom: 1rem;">What it Shows:</h2>
      <p style="color: #4a5568; line-height: 1.8; margin-bottom: 1.5rem;">Using USGS earthquake data, I created a seismic risk map of Bangladesh, classifying zones from <em>very low</em> to <em>very high</em> risk. This helps visualize earthquake vulnerability for disaster preparedness and urban planning. A critical tool for policymakers, researchers, and communities!</p>
      
      <h3 style="color: #3ba8d1; font-size: 1.5rem; font-weight: bold; margin: 2rem 0 1rem;">Data Collection:</h3>
      <ul style="color: #4a5568; line-height: 1.8; margin-bottom: 1.5rem; padding-left: 2rem;">
        <li>Download earthquake data (2001–2025) from USGS Earthquake Catalog</li>
        <li>For download Bangladesh data, use Geographic region as custom and give the North, South, East, West location in the box.</li>
        <li>Then download the data in CSV format.</li>
      </ul>
      
      <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800" alt="Data visualization" style="width: 100%; max-width: 700px; border-radius: 1rem; margin: 2rem 0; box-shadow: 0 10px 30px rgba(0,0,0,0.2);" />
      
      <blockquote style="border-left: 4px solid #3ba8d1; padding-left: 1.5rem; margin: 2rem 0; font-style: italic; color: #2d3748; font-size: 1.25rem; background: #FFFAEB; padding: 1.5rem; border-radius: 0.5rem;">"Mapping risks today ensures safer cities tomorrow."</blockquote>
      
      <h3 style="color: #3ba8d1; font-size: 1.5rem; font-weight: bold; margin: 2rem 0 1rem;">Risk Classification:</h3>
      <p style="color: #4a5568; line-height: 1.8; margin-bottom: 1rem;">Reclassify the interpolated raster into 5 zones using Equal Intervals or Natural Breaks from the symbology pan of the IDW.</p>
      <p style="color: #4a5568; line-height: 1.8; margin-bottom: 1.5rem;">Then change the color as you like.</p>
      
      <h3 style="color: #3ba8d1; font-size: 1.5rem; font-weight: bold; margin: 2rem 0 1rem;">Interpolation in ArcGIS Pro:</h3>
      <pre style="background: #1a202c; color: #e2e8f0; padding: 1.5rem; border-radius: 0.5rem; overflow-x: auto; margin: 1rem 0;"><code>// Python code for IDW interpolation
import arcpy
arcpy.env.workspace = "C:/GIS/Projects"
arcpy.Idw_3d("earthquake_points", "magnitude", "output_raster", 0.001)
</code></pre>
      
      <a href="https://example.com" style="color: #3ba8d1; text-decoration: underline; font-weight: 600;">Learn more about seismic analysis →</a>
    `
  },
  {
    id: 2,
    title: "Bangladesh International Flight Network",
    category: "R",
    image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800",
    likes: 95,
    description: "Network analysis of international flight connections from Bangladesh.",
    details: {
      software: "R Studio",
      timeframe: "2024",
      data: "Flight Data",
      studyArea: "Global"
    },
    gallery: [
      "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800"
    ],
    projectLink: "https://example.com",
    fullDescription: `<h2 style="color: #2596be;">Project Overview:</h2><p style="color: #4a5568;">This project analyzes the international flight network connections from Bangladesh using R programming and network visualization techniques.</p>`
  },
  {
    id: 3,
    title: "LULC Transformation in Kutupalong Refugee Camp",
    category: "Remote Sensing",
    image: "https://images.unsplash.com/photo-1589519160732-57fc498494f8?w=800",
    likes: 98,
    description: "Land use and land cover change analysis using satellite imagery.",
    details: {
      software: "ERDAS Imagine",
      timeframe: "2017-2024",
      data: "Landsat",
      studyArea: "Cox's Bazar"
    },
    gallery: [
      "https://images.unsplash.com/photo-1589519160732-57fc498494f8?w=800"
    ],
    projectLink: "https://example.com",
    fullDescription: `<h2 style="color: #2596be;">Project Overview:</h2><p style="color: #4a5568;">Analysis of land use and land cover transformation in the Kutupalong refugee camp area from 2017 to 2024.</p>`
  },
  {
    id: 4,
    title: "Multi-Spectral Index Analysis",
    category: "Remote Sensing",
    image: "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=800",
    likes: 71,
    description: "Analysis of the Sundarban Mangrove Forest using multi-spectral indices.",
    details: {
      software: "ERDAS Imagine",
      timeframe: "2023",
      data: "Sentinel-2",
      studyArea: "Sundarban"
    },
    gallery: [
      "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=800"
    ],
    projectLink: "https://example.com",
    fullDescription: `<h2 style="color: #2596be;">Project Overview:</h2><p style="color: #4a5568;">Multi-spectral index analysis of the Sundarban Mangrove Forest ecosystem.</p>`
  },
  {
    id: 5,
    title: "Urban Heat Island Analysis",
    category: "GIS",
    image: "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800",
    likes: 82,
    description: "Thermal analysis of urban heat islands in major cities.",
    details: {
      software: "ArcGIS Pro",
      timeframe: "2023",
      data: "Landsat 8",
      studyArea: "Dhaka"
    },
    gallery: [
      "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800"
    ],
    projectLink: "https://example.com",
    fullDescription: `<h2 style="color: #2596be;">Project Overview:</h2><p style="color: #4a5568;">Urban heat island effect analysis in Dhaka city.</p>`
  },
  {
    id: 6,
    title: "Flood Risk Mapping",
    category: "GIS",
    image: "https://images.unsplash.com/photo-1547683905-f686c993aae5?w=800",
    likes: 105,
    description: "Comprehensive flood risk assessment and mapping.",
    details: {
      software: "ArcGIS Pro",
      timeframe: "2022-2023",
      data: "DEM, Rainfall",
      studyArea: "Sylhet"
    },
    gallery: [
      "https://images.unsplash.com/photo-1547683905-f686c993aae5?w=800"
    ],
    projectLink: "https://example.com",
    fullDescription: `<h2 style="color: #2596be;">Project Overview:</h2><p style="color: #4a5568;">Flood risk mapping and vulnerability assessment.</p>`
  },
  {
    id: 7,
    title: "Coastal Erosion Monitoring",
    category: "Remote Sensing",
    image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800",
    likes: 88,
    description: "Long-term coastal erosion monitoring using satellite imagery.",
    details: {
      software: "Google Earth Engine",
      timeframe: "2000-2024",
      data: "Landsat Time Series",
      studyArea: "Coastal Bangladesh"
    },
    gallery: [
      "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800"
    ],
    projectLink: "https://example.com",
    fullDescription: `<h2 style="color: #2596be;">Project Overview:</h2><p style="color: #4a5568;">Monitoring coastal erosion patterns over 24 years.</p>`
  },
  {
    id: 8,
    title: "Agricultural Land Classification",
    category: "GIS",
    image: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800",
    likes: 76,
    description: "Classification and mapping of agricultural land use patterns.",
    details: {
      software: "ArcGIS Pro",
      timeframe: "2023",
      data: "Sentinel-2",
      studyArea: "Rajshahi"
    },
    gallery: [
      "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800"
    ],
    projectLink: "https://example.com",
    fullDescription: `<h2 style="color: #2596be;">Project Overview:</h2><p style="color: #4a5568;">Agricultural land use classification and analysis.</p>`
  },
  {
    id: 9,
    title: "Water Quality Assessment",
    category: "R",
    image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800",
    likes: 92,
    description: "Statistical analysis of water quality parameters.",
    details: {
      software: "R Studio",
      timeframe: "2023",
      data: "Field Survey",
      studyArea: "Dhaka Rivers"
    },
    gallery: [
      "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800"
    ],
    projectLink: "https://example.com",
    fullDescription: `<h2 style="color: #2596be;">Project Overview:</h2><p style="color: #4a5568;">Water quality assessment using statistical methods.</p>`
  },
  {
    id: 10,
    title: "Forest Cover Change Detection",
    category: "Remote Sensing",
    image: "https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?w=800",
    likes: 67,
    description: "Monitoring deforestation patterns using time-series analysis.",
    details: {
      software: "Google Earth Engine",
      timeframe: "2010-2024",
      data: "Landsat",
      studyArea: "Chittagong Hill Tracts"
    },
    gallery: [
      "https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?w=800"
    ],
    projectLink: "https://example.com",
    fullDescription: `<h2 style="color: #2596be;">Project Overview:</h2><p style="color: #4a5568;">Forest cover change detection and analysis.</p>`
  },
  {
    id: 11,
    title: "Air Quality Index Mapping",
    category: "GIS",
    image: "https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=800",
    likes: 89,
    description: "Spatial analysis of air pollution patterns in urban areas.",
    details: {
      software: "ArcGIS Pro",
      timeframe: "2023-2024",
      data: "Air Quality Sensors",
      studyArea: "Dhaka Metropolitan"
    },
    gallery: [
      "https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=800"
    ],
    projectLink: "https://example.com",
    fullDescription: `<h2 style="color: #2596be;">Project Overview:</h2><p style="color: #4a5568;">Air quality index mapping and analysis.</p>`
  },
  {
    id: 12,
    title: "Population Density Analysis",
    category: "R",
    image: "https://images.unsplash.com/photo-1523961131990-5ea7c61b2107?w=800",
    likes: 73,
    description: "Statistical modeling of population distribution patterns.",
    details: {
      software: "R Studio",
      timeframe: "2024",
      data: "Census Data",
      studyArea: "Bangladesh"
    },
    gallery: [
      "https://images.unsplash.com/photo-1523961131990-5ea7c61b2107?w=800"
    ],
    projectLink: "https://example.com",
    fullDescription: `<h2 style="color: #2596be;">Project Overview:</h2><p style="color: #4a5568;">Population density analysis using statistical methods.</p>`
  }
];

export default function ProjectsPage() {
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
        // Use mock data if no projects in database
        setProjects(allProjects);
      }
    } catch (error) {
      console.error('Error loading projects:', error);
      setProjects(allProjects);
    } finally {
      setLoading(false);
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

