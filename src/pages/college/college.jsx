import React, { useState } from 'react';
import { Search } from 'lucide-react';
import './college.css';

const CollegePage = () => {
  // Sample college data - replace with your actual college data from your book
  const colleges = [
    {
      id: 1,
      name: "Harvard University",
      location: "Cambridge, MA",
      description: "One of the most prestigious Ivy League research universities in the United States.",
      events: ["Leadership Conference", "Alumni Networking Night", "Tech Innovation Summit"],
      image: "/api/placeholder/400/300"
    },
    {
      id: 2,
      name: "Stanford University",
      location: "Stanford, CA",
      description: "A leading private research university known for entrepreneurship and innovation.",
      events: ["Sustainability Forum", "Young Entrepreneurs Meet", "Academic Excellence Awards"],
      image: "/api/placeholder/400/300"
    },
    {
      id: 3,
      name: "Massachusetts Institute of Technology",
      location: "Cambridge, MA",
      description: "A world-renowned institution focused on science, engineering, and technology.",
      events: ["Robotics Exhibition", "Climate Change Symposium", "Future of AI Conference"],
      image: "/api/placeholder/400/300"
    },
    {
      id: 4,
      name: "University of California, Berkeley",
      location: "Berkeley, CA",
      description: "A leading public research university with a rich history of academic achievement.",
      events: ["Social Justice Forum", "International Science Fair", "Alumni Homecoming"],
      image: "/api/placeholder/400/300"
    },
    {
      id: 5,
      name: "University of Oxford",
      location: "Oxford, UK",
      description: "One of the oldest and most prestigious universities in the English-speaking world.",
      events: ["Historical Literature Symposium", "Global Economics Forum", "Research Showcase"],
      image: "/api/placeholder/400/300"
    },
    // Add more colleges from your book as needed
  ];

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('All');

  // Derive unique regions for filter
  const regions = ['All', ...new Set(colleges.map(college => college.location.split(', ')[1]))];

  // Filter colleges based on search term and selected region
  const filteredColleges = colleges.filter(college => {
    const matchesSearch = college.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         college.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRegion = selectedRegion === 'All' || college.location.includes(selectedRegion);
    
    return matchesSearch && matchesRegion;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Featured Colleges</h1>
      
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        {/* Search input */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search colleges..."
            className="pl-10 pr-4 py-2 border rounded-lg w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {/* Region filter */}
        <div className="w-full md:w-64">
          <select
            className="w-full p-2 border rounded-lg"
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
          >
            {regions.map((region) => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {/* College grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredColleges.map((college) => (
          <div key={college.id} className="border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
            <img 
              src={college.image} 
              alt={`${college.name} campus`} 
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h2 className="text-xl font-semibold mb-2">{college.name}</h2>
              <p className="text-gray-600 mb-2">{college.location}</p>
              <p className="text-gray-700 mb-4">{college.description}</p>
              
              <div className="mb-4">
                <h3 className="font-medium mb-2">Upcoming Events:</h3>
                <ul className="list-disc pl-5">
                  {college.events.map((event, index) => (
                    <li key={index} className="text-gray-700">{event}</li>
                  ))}
                </ul>
              </div>
              
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition-colors">
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {/* Show message if no colleges match the filters */}
      {filteredColleges.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-600">No colleges found matching your search criteria.</p>
        </div>
      )}
    </div>
  );
};

export default CollegePage;