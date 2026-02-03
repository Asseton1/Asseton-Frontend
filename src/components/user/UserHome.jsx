import { useState, useEffect, useMemo, useCallback } from 'react'
import Header from '../shared/Header'
import Footer from '../shared/Footer'
import { FaChevronLeft, FaChevronRight, FaWhatsapp, FaBed, FaBath, FaRulerCombined, FaChevronDown, FaMapMarkerAlt } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import { getAPIConfig } from '../../config/api'
import { propertyAPI } from '../../Services/api'

// Add custom styles for consistent dropdown appearance
const dropdownStyles = `
  .dropdown-select {
    font-size: 14px !important;
    line-height: 1.4 !important;
    min-height: 48px !important;
    box-sizing: border-box !important;
  }
  .dropdown-select option {
    font-size: 14px !important;
    line-height: 1.4 !important;
  }
  /* Ensure all select elements have consistent styling */
  select {
    font-size: 14px !important;
    line-height: 1.4 !important;
    min-height: 48px !important;
    box-sizing: border-box !important;
  }
  select option {
    font-size: 14px !important;
    line-height: 1.4 !important;
  }
  /* Ensure consistent box dimensions for all dropdowns */
  .search-form select {
    min-height: 48px !important;
    box-sizing: border-box !important;
  }
`;

function UserHome() {
  const [activeTab, setActiveTab] = useState('buy')
  const [listingTypeDirty, setListingTypeDirty] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isHovering] = useState(false)
  const navigate = useNavigate()
  
  // Property search states
  const [location, setLocation] = useState('')
  const [selectedPropertyType, setSelectedPropertyType] = useState('All')
  const [priceRange, setPriceRange] = useState('Price (INR)')
  
  // Add state for mobile sidebar
  const [mobileMenuOpen] = useState(false);

  // Add these new states
  const [userCoordinates, setUserCoordinates] = useState(null);
  const [isLocating, setIsLocating] = useState(false);

  // Add new state for properties
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add new state for property metrics
  const [propertyMetric, setPropertyMetric] = useState('Beds');
  const [propertyMetricValue, setPropertyMetricValue] = useState('Any');

  // Add this new state for banner
  const [heroBanner, setHeroBanner] = useState(null);
  const [bannerLoading, setBannerLoading] = useState(true);
  
  // Add state for offer banner
  const [offerBanner, setOfferBanner] = useState(null);
  const [offerBannerLoading, setOfferBannerLoading] = useState(true);

  const apiConfig = useMemo(() => getAPIConfig(), []);
  const apiBaseUrl = useMemo(() => {
    const base = apiConfig?.baseURL || '';
    return base.replace(/\/(api)\/?$/, '');
  }, [apiConfig?.baseURL]);

  const buildImageUrl = useCallback((url) => {
    if (!url) return '';
    if (url.startsWith('http')) {
      return url;
    }
    const normalizedBase = apiBaseUrl.endsWith('/') ? apiBaseUrl.slice(0, -1) : apiBaseUrl;
    const normalizedPath = url.startsWith('/') ? url : `/${url}`;
    return `${normalizedBase}${normalizedPath}`;
  }, [apiBaseUrl]);

  const heroBannerImage = useMemo(() => {
    if (heroBanner?.image) {
      return buildImageUrl(heroBanner.image);
    }
    // Return null if no banner is available - will use CSS gradient fallback
    return null;
  }, [heroBanner, buildImageUrl]);

  const offerBannerImage = useMemo(() => {
    if (offerBanner?.image) {
      return buildImageUrl(offerBanner.image);
    }
    return null;
  }, [offerBanner, buildImageUrl]);

  const getPropertyImage = useCallback((property) => {
    if (!property) return '';
    if (property.main_image) {
      return buildImageUrl(property.main_image);
    }
    if (property.main_image_url) {
      return buildImageUrl(property.main_image_url);
    }
    if (property.images && property.images.length > 0) {
      const firstImage = property.images[0];
      if (typeof firstImage === 'string') {
        return buildImageUrl(firstImage);
      }
      if (firstImage?.image) {
        return buildImageUrl(firstImage.image);
      }
      if (firstImage?.image_url) {
        return buildImageUrl(firstImage.image_url);
      }
    }
    return '';
  }, [buildImageUrl]);

  // Add state for property types
  const [propertyTypes, setPropertyTypes] = useState([]);
  const [propertyTypesLoading, setPropertyTypesLoading] = useState(true);

  useEffect(() => {
    // Handle body scroll lock when mobile menu is open
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const handleActiveTabChange = (tab) => {
    setActiveTab(tab);
    setListingTypeDirty(true);
  };

  const handlePropertyTypeSelect = (type) => {
    setSelectedPropertyType(type);
    
    // Check if the selected type is a land property based on API data
    const isLandProperty = propertyTypes.some(propertyType => 
      propertyType.name === type && propertyType.name.toLowerCase().includes('land')
    );
    
    if (isLandProperty) {
      setPropertyMetric('Cents');
      setPropertyMetricValue('Any');
    } else {
      setPropertyMetric('Square Feet');
      setPropertyMetricValue('Any');
    }
  };


  // Add this function to get user's current location
  const getUserLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    
    setIsLocating(true);
    
    // Check if geolocation permission is granted
    navigator.permissions.query({ name: 'geolocation' }).then((permissionStatus) => {
      if (permissionStatus.state === 'denied') {
        setIsLocating(false);
        alert("Location permission denied. Please enable location access in your browser settings.");
        return;
      }
      
      // Request location with timeout and better error handling
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setIsLocating(false);
          setUserCoordinates({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          
          // Reverse geocode to get address from coordinates
          reverseGeocode(position.coords.latitude, position.coords.longitude);
        },
        (err) => {
          setIsLocating(false);
          let errorMessage = "Unable to retrieve your location";
          
          switch (err.code) {
            case err.PERMISSION_DENIED:
              errorMessage = "Location permission denied. Please enable location access in your browser settings.";
              break;
            case err.POSITION_UNAVAILABLE:
              errorMessage = "Location information is unavailable.";
              break;
            case err.TIMEOUT:
              errorMessage = "Location request timed out.";
              break;
            default:
              errorMessage = `Location error: ${err.message}`;
          }
          
          console.error("Geolocation error:", err);
          alert(errorMessage);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    }).catch(() => {
      // Fallback for browsers that don't support permissions API
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setIsLocating(false);
          setUserCoordinates({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          
          reverseGeocode(position.coords.latitude, position.coords.longitude);
        },
        (err) => {
          setIsLocating(false);
          let errorMessage = "Unable to retrieve your location";
          
          switch (err.code) {
            case err.PERMISSION_DENIED:
              errorMessage = "Location permission denied. Please enable location access in your browser settings.";
              break;
            case err.POSITION_UNAVAILABLE:
              errorMessage = "Location information is unavailable.";
              break;
            case err.TIMEOUT:
              errorMessage = "Location request timed out.";
              break;
            default:
              errorMessage = `Location error: ${err.message}`;
          }
          
          console.error("Geolocation error:", err);
          alert(errorMessage);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    });
  };
  
  // Add function to convert coordinates to address
  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      const data = await response.json();
      
      if (data && data.display_name) {
        // Extract city/locality from the address
        const locality = data.address.city || 
                         data.address.town || 
                         data.address.village || 
                         data.address.suburb ||
                         data.address.county;
        
        setLocation(locality ? `${locality}, ${data.address.state || ''}` : data.display_name);
      }
    } catch {
      // Silent fail for reverse geocoding
    }
  };

  // Fetch properties on component mount
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await propertyAPI.getAllProperties({ page_size: 8, page: 1 });
        let propertiesData = [];

        if (response?.results) {
          propertiesData = response.results;
        } else if (Array.isArray(response)) {
          propertiesData = response;
        } else if (Array.isArray(response?.data)) {
          propertiesData = response.data;
        }
        
        if (propertiesData.length > 0) {
          const sortedPropertiesData = [...propertiesData].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
          setProperties(sortedPropertiesData.slice(0, 8));
        } else {
          setProperties([]);
        }
        setLoading(false);
      } catch {
        setProperties([]);
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  // Calculate how many items to show based on screen size
  const getItemsToShow = () => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth < 640) return 1;
      if (window.innerWidth < 1024) return 2;
      if (window.innerWidth < 1280) return 3;
      return 4;
    }
    return 4; // Default for SSR
  }
  
  const [itemsToShow, setItemsToShow] = useState(4);
  
  useEffect(() => {
    const handleResize = () => {
      setItemsToShow(getItemsToShow());
    };
    
    // Set initial value
    handleResize();
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Clean up
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Function to scroll to next set of items
  const scrollNext = useCallback(() => {
    setCurrentIndex((prevIndex) => {
      if (prevIndex + itemsToShow < properties.length) {
        return prevIndex + 1;
      } else {
        // Loop back to start
        return 0;
      }
    });
  }, [itemsToShow, properties.length]);
  
  // Function to scroll to previous set of items
  const scrollPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else {
      // Loop to end
      setCurrentIndex(properties.length - itemsToShow);
    }
  };
  
  // Auto-scroll functionality
  useEffect(() => {
    let interval;
    
    if (!isHovering) {
      interval = setInterval(() => {
        scrollNext();
      }, 5000);
    }
    
    return () => clearInterval(interval);
  }, [isHovering, itemsToShow, scrollNext]);

  // Handle search
  const handleSearch = () => {
    const params = new URLSearchParams();
    
    if (location) {
      params.set('search', location);
    }
    
    if (userCoordinates) {
      params.set('lat', userCoordinates.lat);
      params.set('lng', userCoordinates.lng);
    }
    
    if (listingTypeDirty) {
      params.set('type', activeTab);
    }
    
    if (selectedPropertyType !== 'All') {
      params.set('propertyType', selectedPropertyType);
    }
    
    if (propertyMetricValue !== 'Any') {
      params.set(propertyMetric.toLowerCase(), propertyMetricValue);
    }
    
    if (priceRange !== 'Price (INR)') {
      params.set('price', priceRange);
    }
    
    navigate(`/property-listing?${params.toString()}`);
  };

  // Add this new useEffect to fetch the banner
  useEffect(() => {
    const fetchHeroBanner = async () => {
      try {
        const response = await propertyAPI.getHeroBanners();
        let banners = [];
        if (response?.results) {
          banners = response.results;
        } else if (Array.isArray(response)) {
          banners = response;
        } else if (Array.isArray(response?.data)) {
          banners = response.data;
        }
        if (banners.length > 0) {
          setHeroBanner(banners[0]);
        }
        setBannerLoading(false);
      } catch {
        setBannerLoading(false);
      }
    };

    fetchHeroBanner();
  }, []);

  // Add this new useEffect to fetch the offer banner
  useEffect(() => {
    const fetchOfferBanner = async () => {
      try {
        const response = await propertyAPI.getOfferBanners();
        let banners = [];
        if (response?.results) {
          banners = response.results;
        } else if (Array.isArray(response)) {
          banners = response;
        } else if (Array.isArray(response?.data)) {
          banners = response.data;
        }
        if (banners && banners.length > 0) {
          setOfferBanner(banners[0]);
        }
        setOfferBannerLoading(false);
      } catch {
        setOfferBannerLoading(false);
      }
    };

    fetchOfferBanner();
  }, []);

  // Add useEffect to fetch property types
  useEffect(() => {
    const fetchPropertyTypes = async () => {
      try {
        const response = await propertyAPI.getPropertyTypes();
        setPropertyTypes(response);
        setPropertyTypesLoading(false);
      } catch (error) {
        console.error('Error fetching property types:', error);
        setPropertyTypesLoading(false);
      }
    };

    fetchPropertyTypes();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Add custom styles for dropdowns */}
      <style dangerouslySetInnerHTML={{ __html: dropdownStyles }} />
      
      <Header isAdmin={false} />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <header className="relative overflow-hidden h-[350px] xs:h-[400px] sm:h-[450px] md:h-[600px] lg:h-[650px] xl:h-[700px] mt-16 sm:mt-18 md:mt-20 md:mx-2 lg:mx-4 xl:mx-6 md:rounded-3xl">
          {/* Ad placement pixel */}
          <div className="hidden" id="ad-placement-pixel" data-google-query-id="CK6MoJmRto0DFQWnZgIdC_cd3A">
            <div id="google_ads_iframe_/1000931/bayut_desktop/homepage_1__container__"></div>
          </div>
          
          {/* Background image */}
          <div className="absolute inset-0 w-full overflow-hidden md:rounded-3xl">
            {bannerLoading ? (
              // Loading skeleton
              <div className="w-full h-full bg-gray-200 animate-pulse"></div>
            ) : heroBannerImage ? (
              <picture>
                <img 
                  className="w-full h-full object-cover object-center md:rounded-3xl" 
                  src={heroBannerImage}
                  alt={heroBanner?.title || 'Property background'}
                  loading="eager"
                />
              </picture>
            ) : (
              <div 
                className="w-full h-full bg-gradient-to-br from-green-600 via-green-500 to-emerald-600 md:rounded-3xl"
              ></div>
            )}
            {/* Overlay for better text readability */}
            <div className="absolute inset-0 bg-black/50 w-full md:rounded-3xl"></div>
          </div>

                    {/* Title section - Consistent across all devices */}
          <div className="absolute inset-0 flex flex-col justify-center items-center px-4 z-10">
            <div className="text-center">
              <h1 className="text-3xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-2 sm:mb-4 px-2 leading-tight">
                We manage your dreams
              </h1>
              <h2 className="text-lg sm:text-lg md:text-lg lg:text-xl xl:text-2xl text-white/90 px-2 mb-8 leading-relaxed">
                not just your assets
              </h2>
              
              {/* Property Search Container - Only visible on larger screens */}
              <div className="hidden lg:block w-full max-w-4xl mx-auto">
                <div className="w-full rounded-2xl shadow-lg p-5 lg:p-6 search-form" style={{ backgroundColor: 'rgb(240 253 244)' }}>
              {/* Top Row: Buy/Rent Toggle, Property Type, Sq.ft, Price - All in one row */}
              <div className="grid grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-3 lg:gap-3 xl:gap-4 mb-4 lg:mb-5 xl:mb-6">
                {/* Buy/Rent Toggle */}
                <div className="relative">
                  <div className="w-full bg-gray-100 border border-gray-200 rounded-lg flex items-center p-1">
                    <div className="flex w-full">
                      {['Buy', 'Rent'].map((tab) => (
                        <button
                          key={tab}
                          onClick={() => handleActiveTabChange(tab.toLowerCase())}
                          className={`flex-1 px-3 py-2 rounded-md font-medium text-sm transition-all duration-300 ${
                            activeTab === tab.toLowerCase()
                              ? 'text-white shadow-lg transform scale-[1.02]'
                              : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                          }`}
                          style={activeTab === tab.toLowerCase() ? { 
                            backgroundColor: 'rgb(18 110 60)',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                          } : {}}
                        >
                          {tab}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Property Type */}
                <div className="relative">
                  <select
                    value={selectedPropertyType}
                    onChange={(e) => {
                      handlePropertyTypeSelect(e.target.value);
                    }}
                    className="w-full bg-white border border-gray-200 rounded-lg px-4 pr-10 py-3 text-sm text-gray-700 appearance-none cursor-pointer focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 dropdown-select"
                    disabled={propertyTypesLoading}
                  >
                    <option value="All">All Property Types</option>
                    {propertyTypesLoading ? (
                      <option disabled>Loading...</option>
                    ) : (
                      <>
                        <optgroup label="Land Properties">
                          {propertyTypes
                            .filter(type => type.name.toLowerCase().includes('land'))
                            .map(type => (
                              <option key={type.id} value={type.name}>{type.name}</option>
                            ))}
                        </optgroup>
                        <optgroup label="Buildings">
                          {propertyTypes
                            .filter(type => !type.name.toLowerCase().includes('land'))
                            .map(type => (
                              <option key={type.id} value={type.name}>{type.name}</option>
                            ))}
                        </optgroup>
                      </>
                    )}
                  </select>
                  <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>

                {/* Sq.ft/Cents */}
                <div className="relative">
                  <select
                    value={propertyMetricValue}
                    onChange={(e) => setPropertyMetricValue(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-lg px-4 pr-10 py-3 text-sm text-gray-700 appearance-none cursor-pointer focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 dropdown-select"
                  >
                    {propertyMetric === 'Cents' ? (
                      <>
                        <option value="Any">Any Cents</option>
                        <option value="0-5">Below 5 Cents</option>
                        <option value="5-10">5-10 Cents</option>
                        <option value="10-20">10-20 Cents</option>
                        <option value="20-50">20-50 Cents</option>
                        <option value="50-100">50-100 Cents</option>
                        <option value="100+">Above 100 Cents</option>
                      </>
                    ) : (
                      <>
                        <option value="Any">Any Sq.ft</option>
                        <option value="0-500">Below 500 sq.ft</option>
                        <option value="500-1000">500-1,000 sq.ft</option>
                        <option value="1000-2000">1,000-2,000 sq.ft</option>
                        <option value="2000-5000">2,000-5,000 sq.ft</option>
                        <option value="5000-10000">5,000-10,000 sq.ft</option>
                        <option value="10000+">Above 10,000 sq.ft</option>
                      </>
                    )}
                  </select>
                  <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>

                {/* Price Range */}
                <div className="relative">
                  <select
                    value={priceRange}
                    onChange={(e) => setPriceRange(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-lg px-4 pr-10 py-3 text-sm text-gray-700 appearance-none cursor-pointer focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 dropdown-select"
                  >
                    <option value="Price (INR)">Price (INR)</option>
                    <option value="Under ₹50L">Under ₹50L</option>
                    <option value="₹50L - ₹1Cr">₹50L - ₹1Cr</option>
                    <option value="₹1Cr - ₹2Cr">₹1Cr - ₹2Cr</option>
                    <option value="₹2Cr - ₹5Cr">₹2Cr - ₹5Cr</option>
                    <option value="Above ₹5Cr">Above ₹5Cr</option>
                  </select>
                  <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Second Row: Location Input, Use my location button, and Search button */}
              <div className="flex flex-col lg:flex-row xl:flex-row gap-3 lg:gap-3 xl:gap-4">
                {/* Location Input */}
                <div className="relative flex-1">
                  <div className="flex items-center bg-white rounded-lg px-4 py-3 border border-gray-200 focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-200 h-full">
                    <FaMapMarkerAlt className="h-5 w-5 text-gray-400 mr-3" />
                    <input
                      type="text"
                      placeholder="Enter location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="flex-1 bg-transparent outline-none text-gray-700 placeholder-gray-500"
                    />
                  </div>
                </div>

                {/* Use my location button */}
                <button 
                  onClick={getUserLocation}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg border transition-colors whitespace-nowrap text-sm lg:text-sm xl:text-base"
                  style={{ backgroundColor: 'rgb(240 253 250)', color: 'rgb(18 110 60)', borderColor: 'rgb(18 110 60)' }}
                  disabled={isLocating}
                >
                  {isLocating ? (
                    <span className="flex items-center">
                      <svg className="animate-spin h-4 w-4 mr-1" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Locating...
                    </span>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Use my location
                    </>
                  )}
                </button>

                {/* Search Button */}
                <button 
                  onClick={handleSearch}
                  className="text-white font-semibold py-3 px-6 lg:px-6 xl:px-8 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 shrink-0 text-sm lg:text-sm xl:text-base"
                  style={{ backgroundColor: 'rgb(18 110 60)' }}
                >
                  Search Properties
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
          <div className="relative z-10 flex flex-col justify-center items-center h-1/3 mt-4">
          {/* <h2 className="text-lg md:text-xl backdrop-blur-md bg-white/10 border border-white/30 p-2 text-white text-center rounded-md shadow-lg">Experience the journey</h2>           */}
          </div>
        </header>

        {/* Mobile Search Section - Only visible below 1024px */}
        <section className="lg:hidden bg-white py-6 sm:py-8">
          <div className="container mx-auto px-4">
            <div className="w-full sm:w-11/12 md:w-4/5 lg:w-3/5 mx-auto rounded-xl shadow-lg p-3 sm:p-4 md:p-6 search-form" style={{ backgroundColor: 'rgb(240 253 244)' }}>
              {/* Top Row: Buy/Rent Toggle, Property Type, Sq.ft, Price - All in one row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 md:gap-4 mb-3 sm:mb-4 md:mb-6">
                {/* Buy/Rent Toggle */}
                <div className="relative">
                  <div className="w-full bg-gray-100 border border-gray-200 rounded-lg flex items-center p-0.5 sm:p-1">
                    <div className="flex w-full">
                      {['Buy', 'Rent'].map((tab) => (
                        <button
                          key={tab}
                          onClick={() => handleActiveTabChange(tab.toLowerCase())}
                          className={`flex-1 px-2 sm:px-3 py-1.5 sm:py-2 rounded-md font-medium text-xs sm:text-sm transition-all duration-300 ${
                            activeTab === tab.toLowerCase()
                              ? 'text-white shadow-lg transform scale-[1.02]'
                              : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                          }`}
                          style={activeTab === tab.toLowerCase() ? { 
                            backgroundColor: 'rgb(18 110 60)',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                          } : {}}
                        >
                          {tab}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Property Type */}
                <div className="relative">
                  <select
                    value={selectedPropertyType}
                    onChange={(e) => {
                      handlePropertyTypeSelect(e.target.value);
                    }}
                    className="w-full bg-white border border-gray-200 rounded-lg px-3 sm:px-4 pr-8 sm:pr-10 py-2 sm:py-3 text-xs sm:text-sm text-gray-700 appearance-none cursor-pointer focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 dropdown-select"
                    disabled={propertyTypesLoading}
                  >
                    <option value="All">All Property Types</option>
                    {propertyTypesLoading ? (
                      <option disabled>Loading...</option>
                    ) : (
                      <>
                        <optgroup label="Land Properties">
                          {propertyTypes
                            .filter(type => type.name.toLowerCase().includes('land'))
                            .map(type => (
                              <option key={type.id} value={type.name}>{type.name}</option>
                            ))}
                        </optgroup>
                        <optgroup label="Buildings">
                          {propertyTypes
                            .filter(type => !type.name.toLowerCase().includes('land'))
                            .map(type => (
                              <option key={type.id} value={type.name}>{type.name}</option>
                            ))}
                        </optgroup>
                      </>
                    )}
                  </select>
                  <FaChevronDown className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Second Row: Sq.ft and Price */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 md:gap-4 mb-3 sm:mb-4 md:mb-6">
                {/* Sq.ft/Cents */}
                <div className="relative">
                  <select
                    value={propertyMetricValue}
                    onChange={(e) => setPropertyMetricValue(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-lg px-4 pr-10 py-3 text-sm text-gray-700 appearance-none cursor-pointer focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 dropdown-select"
                  >
                    {propertyMetric === 'Cents' ? (
                      <>
                        <option value="Any">Any Cents</option>
                        <option value="0-5">Below 5 Cents</option>
                        <option value="5-10">5-10 Cents</option>
                        <option value="10-20">10-20 Cents</option>
                        <option value="20-50">20-50 Cents</option>
                        <option value="50-100">50-100 Cents</option>
                        <option value="100+">Above 100 Cents</option>
                      </>
                    ) : (
                      <>
                        <option value="Any">Any Sq.ft</option>
                        <option value="0-500">Below 500 sq.ft</option>
                        <option value="500-1000">500-1,000 sq.ft</option>
                        <option value="1000-2000">1,000-2,000 sq.ft</option>
                        <option value="2000-5000">2,000-5,000 sq.ft</option>
                        <option value="5000-10000">5,000-10,000 sq.ft</option>
                        <option value="10000+">Above 10,000 sq.ft</option>
                      </>
                    )}
                  </select>
                  <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>

                {/* Price Range */}
                <div className="relative">
                  <select
                    value={priceRange}
                    onChange={(e) => setPriceRange(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-lg px-4 pr-10 py-3 text-sm text-gray-700 appearance-none cursor-pointer focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 dropdown-select"
                  >
                    <option value="Price (INR)">Price (INR)</option>
                    <option value="Under ₹50L">Under ₹50L</option>
                    <option value="₹50L - ₹1Cr">₹50L - ₹1Cr</option>
                    <option value="₹1Cr - ₹2Cr">₹1Cr - ₹2Cr</option>
                    <option value="₹2Cr - ₹5Cr">₹2Cr - ₹5Cr</option>
                    <option value="Above ₹5Cr">Above ₹5Cr</option>
                  </select>
                  <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Third Row: Location Input, Use my location button, and Search button */}
              <div className="space-y-2 sm:space-y-3 md:space-y-4">
                {/* Location Input */}
                <div className="relative">
                  <div className="flex items-center bg-white rounded-lg px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-200">
                    <FaMapMarkerAlt className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 mr-2 sm:mr-3" />
                    <input
                      type="text"
                      placeholder="Enter location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="flex-1 bg-transparent outline-none text-xs sm:text-sm text-gray-700 placeholder-gray-500"
                    />
                  </div>
                </div>

                {/* Use my location button */}
                <button 
                  onClick={getUserLocation}
                  className="w-full flex items-center justify-center gap-1.5 py-2 sm:py-2.5 px-3 rounded-lg border transition-colors text-xs sm:text-sm md:text-base"
                  style={{ backgroundColor: 'rgb(240 253 250)', color: 'rgb(18 110 60)', borderColor: 'rgb(18 110 60)' }}
                  disabled={isLocating}
                >
                  {isLocating ? (
                    <span className="flex items-center">
                      <svg className="animate-spin h-4 w-4 mr-1" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Locating...
                    </span>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Use my location
                    </>
                  )}
                </button>

                {/* Search Button */}
                <button 
                  onClick={handleSearch}
                  className="w-full text-white font-semibold py-2.5 sm:py-3 px-6 sm:px-8 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 text-xs sm:text-sm md:text-base"
                  style={{ backgroundColor: 'rgb(18 110 60)' }}
                >
                  Search Properties
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Premium Banner Section */}
        <section className="section-padding bg-white">
          <div className="container mx-auto container-padding">
            <div className="max-w-7xl mx-auto overflow-hidden rounded-2xl shadow-xl bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 border border-gray-100">
              <div className="responsive-flex-row items-center">
                <div className="responsive-w-half relative h-48 sm:h-56 md:h-64 lg:h-80 overflow-hidden">
                  {offerBannerLoading ? (
                    // Loading skeleton
                    <div className="w-full h-full skeleton"></div>
                  ) : offerBanner ? (
                    <img 
                      src={offerBannerImage}
                      alt="Premium property" 
                      className="w-full h-full object-cover image-hover"
                    />
                  ) : (
                    // Fallback image if no banner is available
                    <img 
                      src="https://img.freepik.com/free-photo/house-isolated-field_1303-23773.jpg?uid=R175609030&ga=GA1.1.2035126144.1745896858&semt=ais_hybrid&w=740" 
                      alt="Premium property" 
                      className="w-full h-full object-cover image-hover"
                    />
                  )}
                </div>
                <div className="responsive-w-half p-6 sm:p-8 md:p-10 flex flex-col justify-center">
                  <h3 className="heading-3 text-gray-800 mb-3">Exclusive Property Offer</h3>
                  <p className="body-medium text-gray-600 mb-4 sm:mb-6 leading-relaxed">Experience luxury living with our premium properties. Enjoy special discounts and priority access for a limited time only.</p>
                  <div className="responsive-flex-row gap-3 sm:gap-4">
                    <button 
                      className="btn-primary"
                      onClick={() => navigate('/property-listing')}
                    >
                      Explore Premium Listings
                    </button>
                    <button 
                      className="btn-secondary"
                      onClick={() => navigate('/contact')}
                    >
                      Contact an Agent
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>  
        
        {/* Modern Property Slider Section */}
        <section className="bg-white">
          <div className="container mx-auto container-padding section-padding-sm">
            <div className="responsive-flex-row justify-between items-center mb-6 sm:mb-8">
              <h2 className="heading-3 text-gray-900 mb-4 md:mb-0">Featured Properties</h2>
            </div>
            
            {loading ? (
              <div className="text-center py-8">
                <p>Loading properties...</p>
              </div>
            ) : (
              <div className="relative overflow-hidden">
                {/* Navigation arrows - positioned on sides for all devices */}
                <div className="absolute top-1/2 left-1 md:left-4 z-10 transform -translate-y-1/2">
                  <button 
                    onClick={scrollPrev}
                    className="p-1.5 md:p-2 rounded-full bg-white/80 backdrop-blur-sm shadow-md hover:bg-white transition-all duration-200"
                  >
                    <FaChevronLeft className="h-3 w-3 md:h-4 md:w-4 text-gray-500" />
                  </button>
                </div>
                <div className="absolute top-1/2 right-1 md:right-4 z-10 transform -translate-y-1/2">
                  <button 
                    onClick={scrollNext}
                    className="p-1.5 md:p-2 rounded-full bg-white/80 backdrop-blur-sm shadow-md hover:bg-white transition-all duration-200"
                  >
                    <FaChevronRight className="h-3 w-3 md:h-4 md:w-4 text-gray-500" />
                  </button>
                </div>
                <div 
                  className="flex transition-transform duration-300 ease-out"
                  style={{ transform: `translateX(-${currentIndex * (100 / itemsToShow)}%)` }}
                >
                  {properties.map((property) => {
                    const propertyImageUrl = getPropertyImage(property);
                    const city = property?.location?.city || property?.city || '';
                    const district = property?.location?.district || property?.district || '';
                    const state = property?.location?.state || property?.state || '';
                    const locationDisplay = [city, district, state].filter(Boolean).join(', ');

                    return (
                      <div 
                        key={property.id}
                        style={{ 
                          width: `${100 / itemsToShow}%`,
                          flexShrink: 0,
                          paddingLeft: '0.5rem',
                          paddingRight: '0.5rem'
                        }}
                      >
                        <div 
                          className="h-full bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 cursor-pointer"
                          onClick={() => navigate(`/property/${property.id}`)}
                        >
                          <div className="relative h-40 sm:h-48 overflow-hidden group">
                            {propertyImageUrl ? (
                              <img 
                                src={propertyImageUrl} 
                                alt={property.title || 'Property image'} 
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
                                No image available
                              </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          </div>
                          <div className="p-3 sm:p-4">
                            <h3 className="font-bold text-base sm:text-lg">{property.title}</h3>
                            <p className="text-gray-600 text-xs sm:text-sm">{property.property_type_details?.name || property.property_type}</p>
                            
                            <div className="flex items-center mt-2 text-xs sm:text-sm text-gray-600">
                              <FaMapMarkerAlt className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                              <span className="truncate">
                                {locationDisplay || 'Location not specified'}
                              </span>
                            </div>

                            <div className="flex justify-between mt-3 sm:mt-4 border-t pt-3 sm:pt-4">
                              <div>
                                <p className="text-xs text-gray-500">Price</p>
                                <p className="font-semibold text-sm sm:text-base">₹{property.price}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Listed</p>
                                <p className="text-xs sm:text-sm text-gray-600">
                                  {property.created_at ? new Date(property.created_at).toLocaleDateString('en-IN', {
                                    day: 'numeric',
                                    month: 'short'
                                  }) : 'N/A'}
                                </p>
                              </div>
                            </div>
                            
                            {property.whatsapp_number && (
                              <a 
                                href={`https://wa.me/${property.whatsapp_number}?text=Hi, I'm interested in the property: ${encodeURIComponent(property.title || '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-3 sm:mt-4 w-full bg-green-50 hover:bg-green-100 text-green-700 py-2 rounded-md flex items-center justify-center transition-all duration-300 transform hover:scale-[1.02] text-sm"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <FaWhatsapp className="mr-2" />
                                Chat on WhatsApp
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {/* Pagination dots */}
                <div className="flex justify-center mt-8 space-x-2">
                  {Array.from({ length: Math.ceil(properties.length / itemsToShow) }).map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentIndex(index * itemsToShow)}
                      className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                        Math.floor(currentIndex / itemsToShow) === index 
                          ? 'bg-green-600 w-6' 
                          : 'bg-gray-300 hover:bg-gray-400'
                      }`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            )}
            
            <div className="text-center mt-8">
              <button 
                className="px-6 py-3 bg-green-50 hover:bg-green-100 text-green-600 font-medium rounded-md transition-colors shadow-sm"
                onClick={() => navigate('/property-listing')}
              >
                View all new projects
              </button>
            </div>
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section className="section-padding bg-white">
          <div className="container mx-auto container-padding">
            <div className="responsive-text-center mb-8 sm:mb-12">
              <h2 className="heading-2 mb-3 sm:mb-4">Why Choose Us</h2>
              <p className="body-medium text-gray-600 max-w-2xl mx-auto">We're committed to providing exceptional service and value to our clients</p>
            </div>

            <div className="responsive-grid-4 responsive-gap">
              {/* Feature 1 */}
                              <div className="group">
                  <div className="bg-green-50 rounded-2xl p-4 sm:p-6 transition-all duration-300 group-hover:bg-green-100">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500 rounded-lg flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
                      <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="heading-5 mb-2">Trusted Excellence</h3>
                    <p className="body-small text-gray-600">Over 1000+ satisfied clients and growing, with a proven track record of success</p>
                  </div>
                </div>

              {/* Feature 2 */}
              <div className="group">
                                  <div className="bg-green-50 rounded-2xl p-4 sm:p-6 transition-all duration-300 group-hover:bg-green-100">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500 rounded-lg flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
                      <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <h3 className="heading-5 mb-2">Fast & Efficient</h3>
                    <p className="body-small text-gray-600">Quick response times and streamlined processes to save you time and effort</p>
                  </div>
              </div>

              {/* Feature 3 */}
              <div className="group">
                                  <div className="bg-green-50 rounded-2xl p-4 sm:p-6 transition-all duration-300 group-hover:bg-green-100">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500 rounded-lg flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
                      <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <h3 className="heading-5 mb-2">Expert Team</h3>
                    <p className="body-small text-gray-600">Experienced professionals dedicated to helping you find your perfect property</p>
                  </div>
              </div>

              {/* Feature 4 */}
              <div className="group">
                                  <div className="bg-green-50 rounded-2xl p-4 sm:p-6 transition-all duration-300 group-hover:bg-green-100">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500 rounded-lg flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
                      <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <h3 className="heading-5 mb-2">Secure Deals</h3>
                    <p className="body-small text-gray-600">Transparent transactions and secure processes for your peace of mind</p>
                  </div>
              </div>
            </div>
          </div>
        </section>
        
        
        {/* Client Testimonials Section */}
        <section className="section-padding bg-gray-50">
          <div className="container mx-auto container-padding">
            <div className="responsive-text-center mb-8 sm:mb-12">
              <h2 className="heading-2 mb-3 sm:mb-4">What Our Clients Say</h2>
              <p className="body-medium text-gray-600 max-w-2xl mx-auto">Discover why our clients trust us with their dream properties</p>
            </div>
            
            <div className="responsive-grid-3 responsive-gap">
              {/* Testimonial Card 1 */}
              <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-md hover:shadow-xl transition-shadow relative">
                <div className="absolute -top-3 sm:-top-4 left-4 sm:left-6">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9.983 3v7.391c0 5.704-3.731 9.57-8.983 10.609l-.995-2.151c2.432-.917 3.995-3.638 3.995-5.849h-4v-10h9.983zm14.017 0v7.391c0 5.704-3.748 9.571-9 10.609l-.996-2.151c2.433-.917 3.996-3.638 3.996-5.849h-3.983v-10h9.983z"/>
                    </svg>
                  </div>
                </div>
                <div className="pt-4 sm:pt-6">
                  <p className="body-small text-gray-600 mb-3 sm:mb-4">"Finding our dream home was effortless with their exceptional service. The team went above and beyond to understand our needs."</p>
                  <div className="flex items-center">
                    <div>
                      <h4 className="heading-6">Thomas Mathew</h4>
                      <p className="body-xs text-gray-500">Homeowner</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Testimonial Card 2 */}
              <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-md hover:shadow-xl transition-shadow relative">
                <div className="absolute -top-3 sm:-top-4 left-4 sm:left-6">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9.983 3v7.391c0 5.704-3.731 9.57-8.983 10.609l-.995-2.151c2.432-.917 3.995-3.638 3.995-5.849h-4v-10h9.983zm14.017 0v7.391c0 5.704-3.748 9.571-9 10.609l-.996-2.151c2.433-.917 3.996-3.638 3.996-5.849h-3.983v-10h9.983z"/>
                    </svg>
                  </div>
                </div>
                <div className="pt-4 sm:pt-6">
                  <p className="body-small text-gray-600 mb-3 sm:mb-4">"The property listings were accurate, and the team's expertise in the local market made our investment decision easy."</p>
                  <div className="flex items-center">
                    <div>
                      <h4 className="heading-6">Johnson Samuel</h4>
                      <p className="body-xs text-gray-500">Property Investor</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Testimonial Card 3 */}
              <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-md hover:shadow-xl transition-shadow relative">
                <div className="absolute -top-3 sm:-top-4 left-4 sm:left-6">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9.983 3v7.391c0 5.704-3.731 9.57-8.983 10.609l-.995-2.151c2.432-.917 3.995-3.638 3.995-5.849h-4v-10h9.983zm14.017 0v7.391c0 5.704-3.748 9.571-9 10.609l-.996-2.151c2.433-.917 3.996-3.638 3.996-5.849h-3.983v-10h9.983z"/>
                    </svg>
                  </div>
                </div>
                <div className="pt-4 sm:pt-6">
                  <p className="body-small text-gray-600 mb-3 sm:mb-4">"Professional, transparent, and truly customer-focused. They made our property search journey smooth and genuinely enjoyable."</p>
                  <div className="flex items-center">
                    <div>
                      <h4 className="heading-6">Rajesh Kumar</h4>
                      <p className="body-xs text-gray-500">First-time Buyer</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="section-padding bg-gradient-to-r from-gray-800 to-gray-800 relative overflow-hidden">
          <div className="absolute inset-0">
            <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 1000 1000">
              <path d="M0 0h1000v1000H0z" fill="url(#pattern)" fillOpacity=".1"/>
              <defs>
                <pattern id="pattern" patternUnits="userSpaceOnUse" width="10" height="10">
                  <path d="M-3 3l6-6M7 13l6-6M-3 13l6-6M7 3l6-6" stroke="currentColor" strokeWidth="1.5"/>
                </pattern>
              </defs>
            </svg>
          </div>
          <div className="container mx-auto container-padding relative">
            <div className="max-w-3xl mx-auto responsive-text-center">
              <h2 className="heading-2 text-white mb-4 sm:mb-6">Ready to Find Your Dream Property?</h2>
              <p className="body-medium text-green-50 mb-6 sm:mb-8">Join thousands of satisfied customers who found their perfect home with us</p>
              <div className="responsive-flex-row gap-3 sm:gap-4 justify-center">
                <button onClick={() => navigate('/property-listing')} className="btn-primary">
                  Browse Properties
                </button>
                <button onClick={() => navigate('/contact')} className="btn-secondary text-white border-white hover:bg-white/10">
                  Contact Us
                </button>
              </div>
            </div>
          </div>
        </section>

      </main>
      
      <Footer />
    </div>
  )
}

export default UserHome




































































