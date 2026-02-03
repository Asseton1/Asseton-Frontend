import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaBed,
  FaBath,
  FaRulerCombined,
  FaRegHeart,
  FaHeart,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaWhatsapp,
  FaChevronLeft,
  FaChevronRight,
  FaShare,
  FaDownload,
  FaCalendarAlt,
  FaHome,
  FaCar,
  FaMapPin,
  FaShoppingBag,
  FaCheckCircle,
  FaInfoCircle,
  FaArrowLeft,
  FaDirections,
  FaGraduationCap,
  FaHospital,
  FaUtensils,
} from 'react-icons/fa';
import Header from '../shared/Header';
import Footer from '../shared/Footer';
import { propertyAPI } from '../../Services/api';

const PropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState({
    feature_details: [],
    nearby_places: [],
    images: [],
  });
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [showContactForm, setShowContactForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: 'I\'m interested in this property. Please contact me with more information.'
  });

  useEffect(() => {
    const fetchPropertyDetails = async () => {
      try {
        setLoading(true);
        // Use the correct API method to get a single property
        const propertyData = await propertyAPI.getPropertyById(id);
        
        if (propertyData) {
          setProperty(propertyData);
        } else {
          // Property not found
          console.error('Property not found:', id);
          // You could redirect to a 404 page or show an error message
          navigate('/properties');
        }
      } catch (error) {
        console.error('Error fetching property details:', error);
        // Handle the error gracefully
        if (error.status === 401) {
          // Unauthorized - redirect to properties page
          navigate('/properties');
        } else {
          // Other errors - show error state
          setProperty(null);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPropertyDetails();
  }, [id, navigate]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real app, you would send this data to your backend
    console.log('Form submitted:', formData);
    // Show success message or redirect
    alert('Your inquiry has been sent successfully!');
    setShowContactForm(false);
  };

  const nextImage = () => {
    const images = getPropertyArray(property, 'images');
    if (images.length > 0) {
      setActiveImage((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    }
  };

  const prevImage = () => {
    const images = getPropertyArray(property, 'images');
    if (images.length > 0) {
      setActiveImage((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    }
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  const getDirections = () => {
    // This URL format will automatically use user's current location as the starting point
    const directionsUrl = `https://maps.app.goo.gl/TmRYmFNwSF3g5vrX8?g_st=ac`;
    window.open(directionsUrl, '_blank');
  };

  // Safe property access helper functions
  const getPropertyValue = (property, key, defaultValue = '') => {
    if (!property) return defaultValue;
    
    // Handle nested properties like 'property_type_details.name'
    if (key.includes('.')) {
      const keys = key.split('.');
      let value = property;
      for (const k of keys) {
        if (value && typeof value === 'object' && value[k] !== undefined) {
          value = value[k];
        } else {
          return defaultValue;
        }
      }
      return value;
    }
    
    return property[key] !== undefined ? property[key] : defaultValue;
  };

  // Helper function to get property type
  const getPropertyType = (property) => {
    const possibleFields = [
      'property_type_name',
      'property_type',
      'type',
      'category'
    ];
    
    for (const field of possibleFields) {
      if (property[field] && typeof property[field] === 'string' && property[field].trim()) {
        return property[field].trim();
      }
    }
    
    // Try nested property type
    if (property.property_type_details && property.property_type_details.name) {
      return property.property_type_details.name;
    }
    
    return 'Unknown';
  };

  // Helper function to check if property is Land type
  const isLandProperty = (property) => {
    const propertyType = getPropertyType(property).toLowerCase();
    return propertyType === 'land' || propertyType.includes('land');
  };

  // Helper function to format area with correct unit
  const formatAreaWithUnit = (property) => {
    const area = getPropertyValue(property, 'area', '');
    if (!area || area === '' || area === '0') return null;
    
    if (isLandProperty(property)) {
      return `${area} cents`;
    } else {
      return `${area} sq.ft.`;
    }
  };

  const getPropertyArray = (property, key, defaultValue = []) => {
    return property && Array.isArray(property[key]) ? property[key] : defaultValue;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-500"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <div className="flex-grow flex flex-col items-center justify-center p-6">
          <h2 className="heading-3 text-gray-800 mb-4">Property Not Found</h2>
          <p className="body-medium text-gray-600 mb-6">The property you're looking for doesn't exist or has been removed.</p>
          <button 
            onClick={() => navigate('/property-listing')} 
            className="btn-primary flex items-center"
          >
            <FaArrowLeft className="mr-2" /> Back to Listings
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
      <Header />
      <div className="pt-24 flex-grow">
        <div className="container mx-auto container-padding">
          {/* Breadcrumb - Modernized */}
          <div className="flex items-center text-sm text-gray-500 mb-8">
            <button onClick={() => navigate('/')} className="hover:text-green-600 transition-colors">Home</button>
            <span className="mx-2">•</span>
            <button onClick={() => navigate('/property-listing')} className="hover:text-green-600 transition-colors">Properties</button>
            <span className="mx-2">•</span>
            <span className="text-green-600 font-medium">{getPropertyValue(property, 'title', 'Property Details')}</span>
          </div>
          
          {/* Property Header - Premium Design */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
            {/* Gallery - Full Width Slider */}
            <div className="relative h-[50vh] md:h-[70vh] bg-gray-100">
              {property.images && property.images.length > 0 ? (
                <>
                  <img 
                    src={property.images[activeImage].image} 
                    alt={`Property view ${activeImage + 1}`} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                </>
              ) : (
                <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
                  <p className="text-gray-500">No images available</p>
                </div>
              )}
              
              {/* Share button in top-right corner */}
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  // Share functionality
                  if (navigator.share) {
                    navigator.share({
                                             title: getPropertyValue(property, 'title', 'Property'),
                       text: `Check out this property: ${getPropertyValue(property, 'title', 'Property')}`,
                      url: window.location.href,
                    })
                    .catch((error) => console.log('Error sharing', error));
                  } else {
                    // Fallback for browsers that don't support navigator.share
                    const shareUrl = window.location.href;
                    navigator.clipboard.writeText(shareUrl);
                    alert('Link copied to clipboard!');
                  }
                }}
                className="absolute top-4 right-4 z-10 p-3 bg-white/80 backdrop-blur-sm rounded-full shadow-md hover:bg-white transition-all duration-300"
                aria-label="Share property"
              >
                <FaShare className="text-gray-700 text-lg" />
              </button>
              
              {/* Navigation Controls */}
              <button 
                onClick={prevImage}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 sm:p-3 rounded-full backdrop-blur-sm transition-all duration-300"
                aria-label="Previous image"
              >
                <FaChevronLeft className="text-sm sm:text-base" />
              </button>
              <button 
                onClick={nextImage}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 sm:p-3 rounded-full backdrop-blur-sm transition-all duration-300"
                aria-label="Next image"
              >
                <FaChevronRight className="text-sm sm:text-base" />
              </button>
              
              {/* Image Counter */}
              <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-black/60 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm font-medium">
                {activeImage + 1} / {property.images.length}
              </div>
              
              {/* Thumbnails */}
              <div className="absolute bottom-6 left-6 right-6 hidden sm:flex space-x-2 justify-center overflow-x-auto hide-scrollbar">
                {property.images && property.images.length > 0 ? (
                  property.images.map((image, index) => (
                    <button 
                      key={index} 
                      onClick={() => setActiveImage(index)}
                      className={`w-12 h-8 sm:w-16 sm:h-10 rounded-md overflow-hidden border-2 transition-all ${
                        activeImage === index ? 'border-green-500 shadow-lg' : 'border-white/50'
                      }`}
                    >
                      <img 
                        src={image.image} 
                        alt={`Thumbnail ${index + 1}`} 
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))
                ) : (
                  <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
                    <p className="text-gray-500">No images available</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Property Info Header */}
            <div className="p-4 sm:p-6 md:p-8">
              <div className="flex flex-col md:flex-row justify-between items-start gap-4 md:gap-6">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                                         <span className="bg-green-100 text-green-800 text-xs font-semibold px-3 py-1.5 rounded-full">{getPropertyValue(property, 'property_type_details.name', 'Property')}</span>
                     <span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-3 py-1.5 rounded-full">{getPropertyValue(property, 'property_for', 'For Sale')}</span>
                  </div>
                                     <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-3">{getPropertyValue(property, 'title', 'Property Details')}</h1>
                  <div className="flex items-center text-gray-600 mb-4">
                    <FaMapMarkerAlt 
                      className="text-blue-500 mr-2 cursor-pointer hover:text-blue-700" 
                      onClick={getDirections}
                      title="Get directions"
                    />
                    <span>{`${property.location?.city}, ${property.location?.district}, ${property.location?.state}`}</span>
                  </div>
                </div>
                
                <div className="w-full md:w-auto flex flex-col items-start md:items-end">
                                     <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-3 w-full md:w-auto text-left md:text-right">₹ {getPropertyValue(property, 'price', '0')}</div>
                  <button 
                    onClick={() => {
                                             const message = `Hi, I'm interested in:\n\n*${getPropertyValue(property, 'title', 'Property')}*\nLocation: ${getPropertyValue(property, 'location.city', 'N/A')}, ${getPropertyValue(property, 'location.district', 'N/A')}, ${getPropertyValue(property, 'location.state', 'N/A')}\nPrice: ₹${getPropertyValue(property, 'price', '0')}\n\nPlease provide more information about this property.`;
                       const whatsappUrl = `https://wa.me/${getPropertyValue(property, 'whatsapp_number', '').replace(/\D/g,'')}?text=${encodeURIComponent(message)}`;
                      window.open(whatsappUrl, '_blank');
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 sm:py-3 px-4 sm:px-6 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg w-full md:w-auto flex items-center justify-center"
                  >
                    <FaWhatsapp className="mr-2" /> Contact on WhatsApp
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Main Content - Redesigned with full width */}
          <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 w-full">
            {/* Left Column - Property Details - now full width */}
            <div className="w-full">
              {/* Tabs - Modern Design */}
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
                <div className="border-b border-gray-100">
                  <div className="flex overflow-x-auto">
                    {['overview', 'features', 'location', 'video'].map((tab) => (
                      <button 
                        key={tab}
                        onClick={() => setActiveTab(tab)} 
                        className={`px-6 py-4 font-medium text-sm whitespace-nowrap transition-all ${
                          activeTab === tab 
                            ? 'text-green-600 border-b-2 border-green-600 bg-green-50/50' 
                            : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                        }`}
                      >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Tab Content - Premium Styling */}
                <div className="p-8">
                  {activeTab === 'overview' && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-6"
                    >
                      <div className="flex items-center mb-6">
                        <div className="w-1.5 h-8 bg-green-600 rounded-full mr-3"></div>
                        <h3 className="text-2xl font-bold text-gray-800">Property Overview</h3>
                      </div>
                      
                                             <p className="text-gray-700 leading-relaxed text-lg">{getPropertyValue(property, 'description', 'No description available.')}</p>
                      
                      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-gradient-to-br from-green-50 to-white p-6 rounded-2xl shadow-sm border border-green-100">
                          <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
                            <FaHome className="text-green-600 mr-2" /> Property Details
                          </h4>
                          <div className="space-y-4">
                            {[
                              { label: 'Property Type', value: getPropertyValue(property, 'property_type_details.name') },
                              { label: 'Built Year', value: getPropertyValue(property, 'built_year', 'N/A'), show: !isLandProperty(property) },
                              { label: 'Furnishing', value: getPropertyValue(property, 'furnishing', 'N/A'), show: !isLandProperty(property) },
                              { label: 'Area', value: formatAreaWithUnit(property), show: formatAreaWithUnit(property) !== null }
                            ].filter(item => item.show !== false).map((item, idx) => (
                              <div key={idx} className="flex justify-between items-center pb-2 border-b border-gray-100">
                                <span className="text-gray-600">{item.label}</span>
                                <span className="font-medium text-gray-800">{item.value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div className="bg-gradient-to-br from-green-50 to-white p-6 rounded-2xl shadow-sm border border-green-100">
                          <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
                            <FaInfoCircle className="text-green-600 mr-2" /> Additional Info
                          </h4>
                          <div className="space-y-4">
                            {[
                              { label: 'Bedrooms', value: getPropertyValue(property, 'bedrooms', '0'), icon: <FaBed className="text-green-500" />, show: !isLandProperty(property) && getPropertyValue(property, 'bedrooms', '0') !== '0' },
                              { label: 'Bathrooms', value: getPropertyValue(property, 'bathrooms', '0'), icon: <FaBath className="text-green-500" />, show: !isLandProperty(property) && getPropertyValue(property, 'bathrooms', '0') !== '0' },
                              { label: 'Parking', value: `${getPropertyValue(property, 'parking_spaces', '0')} spaces`, icon: <FaCar className="text-green-500" />, show: !isLandProperty(property) && getPropertyValue(property, 'parking_spaces', '0') !== '0' }
                            ].filter(item => item.show !== false).map((item, idx) => (
                              <div key={idx} className="flex items-center pb-2 border-b border-gray-100">
                                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
                                  {item.icon}
                                </div>
                                <span className="text-gray-600">{item.label}</span>
                                <span className="font-medium text-gray-800 ml-auto">{item.value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  
                  {activeTab === 'features' && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3, staggerChildren: 0.1 }}
                      className="space-y-6"
                    >
                      <div className="flex items-center mb-6">
                        <div className="w-1.5 h-8 bg-green-600 rounded-full mr-3"></div>
                        <h3 className="text-2xl font-bold text-gray-800">Premium Features</h3>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {getPropertyArray(property, 'feature_details').length > 0 ? (
                          getPropertyArray(property, 'feature_details').map((feature, index) => (
                            <motion.div 
                              key={feature.id}
                              initial={{ y: 20, opacity: 0 }}
                              animate={{ y: 0, opacity: 1 }}
                              transition={{ delay: index * 0.05 }}
                              className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300"
                            >
                              <div className="flex items-center">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center mr-3 shadow-sm">
                                  <FaCheckCircle className="text-white" />
                                </div>
                                <span className="text-gray-700 font-medium">{feature.name}</span>
                              </div>
                            </motion.div>
                          ))
                        ) : (
                          <div className="col-span-3 text-center py-8">
                            <p className="text-gray-500">No features available</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                  
                  {activeTab === 'location' && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-6"
                    >
                      <div className="flex items-center mb-6">
                        <div className="w-1.5 h-8 bg-green-600 rounded-full mr-3"></div>
                        <h3 className="text-2xl font-bold text-gray-800">Location & Nearby</h3>
                      </div>
                      
                      <div className="bg-white p-1 rounded-2xl shadow-lg overflow-hidden mb-8 h-[350px]">
                                                 <div dangerouslySetInnerHTML={{ __html: getPropertyValue(property, 'google_embedded_map_link', '<div class="flex items-center justify-center h-full text-gray-500">Map not available</div>') }} className="w-full h-full rounded-xl"></div>
                      </div>
                      
                      <div className="flex items-center mb-6">
                        <div className="w-1 h-6 bg-green-500 rounded-full mr-3"></div>
                        <h4 className="text-xl font-semibold text-gray-800">Nearby Places</h4>
                      </div>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {getPropertyArray(property, 'nearby_places').length > 0 ? (
                          (() => {
                            try {
                              let places = getPropertyArray(property, 'nearby_places');
                              
                              // Handle different data formats
                              if (typeof places === 'string') {
                                places = JSON.parse(places);
                              }
                              
                              if (!Array.isArray(places)) {
                                places = [places];
                              }
                              
                              // Filter out invalid entries and ensure they are strings
                              const validPlaces = places.filter(place => {
                                if (typeof place === 'string') {
                                  return place.trim().length > 0;
                                } else if (typeof place === 'object' && place !== null) {
                                  // Handle object format like {place: "name", distance: "2km"}
                                  return place.place && typeof place.place === 'string';
                                }
                                return false;
                              });
                              
                              return validPlaces.map((place, index) => {
                                // Extract the place name from object or use string directly
                                const placeName = typeof place === 'object' ? place.place : place;
                                const distance = typeof place === 'object' ? place.distance : null;
                                
                                return (
                                  <motion.div 
                                    key={index}
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col items-center text-center"
                                  >
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-400 to-green-500 flex items-center justify-center mb-3">
                                      <FaMapMarkerAlt className="text-white text-lg" />
                                    </div>
                                    <div className="font-medium text-gray-800">{placeName}</div>
                                    {distance && (
                                      <div className="text-sm text-gray-500 mt-1">{distance}</div>
                                    )}
                                  </motion.div>
                                );
                              });
                            } catch (error) {
                              console.error('Error parsing nearby places:', error);
                              return (
                                <div className="col-span-full text-center py-8">
                                  <p className="text-gray-500">Error loading nearby places</p>
                                </div>
                              );
                            }
                          })()
                        ) : (
                          <div className="col-span-full text-center py-8">
                            <p className="text-gray-500">No nearby places available</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                  
                  {activeTab === 'video' && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-8"
                    >
                      <div className="flex items-center mb-8">
                        <div className="w-1.5 h-8 bg-green-600 rounded-full mr-3"></div>
                        <h3 className="text-2xl font-bold text-gray-800">Property Video Tour</h3>
                      </div>
                      
                      {property.youtube_video_link ? (
                        <div className="w-full max-w-5xl mx-auto">
                          <div className="relative w-full overflow-hidden rounded-2xl shadow-lg bg-black">
                            <div className="relative pt-[56.25%]">
                              {(() => {
                                try {
                                  // Handle different YouTube URL formats
                                  const url = new URL(property.youtube_video_link);
                                  let videoId = '';
                                  
                                  if (url.hostname === 'youtu.be') {
                                    // Handle youtu.be format
                                    videoId = url.pathname.slice(1);
                                  } else if (url.hostname.includes('youtube.com')) {
                                    // Handle youtube.com format
                                    videoId = url.searchParams.get('v') || url.pathname.split('/').pop();
                                  }

                                  if (!videoId) {
                                    throw new Error('Invalid YouTube URL format');
                                  }

                                  return (
                                    <iframe
                                      src={`https://www.youtube.com/embed/${videoId}`}
                                      title="Property Video Tour"
                                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                      allowFullScreen
                                      className="absolute inset-0 w-full h-full border-0"
                                    />
                                  );
                                } catch (error) {
                                  console.error('Error parsing YouTube URL:', error);
                                  return (
                                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                                      <div className="text-center p-4">
                                        <svg 
                                          className="w-12 h-12 text-gray-400 mx-auto mb-2" 
                                          fill="none" 
                                          stroke="currentColor" 
                                          viewBox="0 0 24 24"
                                        >
                                          <path 
                                            strokeLinecap="round" 
                                            strokeLinejoin="round" 
                                            strokeWidth={2} 
                                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                                          />
                                        </svg>
                                        <p className="text-gray-600">Error loading video. Please try again later.</p>
                                      </div>
                                    </div>
                                  );
                                }
                              })()}
                            </div>
                          </div>
                          
                          <div className="mt-6 p-6 bg-gray-50 rounded-xl">
                            <h4 className="text-lg font-semibold text-gray-800 mb-2">About this Video Tour</h4>
                            <p className="text-gray-600">
                              Take a virtual walk through this stunning property. This video tour showcases all the key features and amenities of the property.
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="w-full max-w-5xl mx-auto">
                          <div className="text-center py-16 bg-gray-50 rounded-2xl border border-gray-100">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                              <svg 
                                className="w-8 h-8 text-gray-400" 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                              >
                                <path 
                                  strokeLinecap="round" 
                                  strokeLinejoin="round" 
                                  strokeWidth={2} 
                                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" 
                                />
                              </svg>
                            </div>
                            <p className="text-gray-500 text-lg">No video tour available for this property.</p>
                            <p className="text-gray-400 mt-2">Check back later or contact us for more information.</p>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
      
      {/* Contact Form Modal */}
      {showContactForm && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowContactForm(false)}
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-green-600 to-green-400 p-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-white">Contact Management</h3>
                <button 
                  onClick={() => setShowContactForm(false)}
                  className="text-white/80 hover:text-white"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-green-100 mt-1">Interested in this property? Send a message to our agent.</p>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                    placeholder="Enter your full name"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                    placeholder="Enter your email"
                  />
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                    placeholder="Enter your phone number"
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-gray-700 text-sm font-medium mb-2">Message</label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      rows="4"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300"
                      required
                    ></textarea>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="consent"
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <label htmlFor="consent" className="ml-2 block text-sm text-gray-700">
                    I consent to being contacted about this property
                  </label>
                </div>
              </div>
              
              <div className="mt-6">
                <button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center"
                >
                  <FaEnvelope className="mr-2" /> Send Message
                </button>
              </div>
              
              <div className="mt-4 text-center text-sm text-gray-500">
                <p>You can also contact directly via:</p>
                <div className="flex justify-center space-x-4 mt-2">
                  <a href={`tel:${property.phone_number}`} className="text-green-600 hover:text-green-800">
                    <FaPhone className="inline mr-1" /> Call
                  </a>
                  <a href={`https://wa.me/${property.whatsapp_number.replace(/\D/g,'')}`} className="text-green-600 hover:text-green-800">
                    <FaWhatsapp className="inline mr-1" /> WhatsApp
                  </a>
                </div>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default PropertyDetails;
































