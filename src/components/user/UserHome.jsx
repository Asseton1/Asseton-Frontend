import { useState, useRef, useEffect, useMemo } from 'react'
import Header from '../shared/Header'
import Footer from '../shared/Footer'
import { FaChevronLeft, FaChevronRight, FaWhatsapp, FaBed, FaBath, FaRulerCombined } from 'react-icons/fa'
import { useNavigate, useLocation } from 'react-router-dom'
import { ChevronDown, MapPin, Navigation } from 'lucide-react'
import heroImage from '../../assets/banner.png'
import { propertyAPI } from '../../Services/api'
import {
  categorizePropertyTypes,
  isLandPropertyType,
  preparePropertyTypes,
} from '../../utils/propertyTypeUtils'

function UserHome() {
  const [activeTab, setActiveTab] = useState('sell')
  const [ownershipType, setOwnershipType] = useState('All')
  const [rentalPeriod, setRentalPeriod] = useState('Any')
  const scrollContainerRef = useRef(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isHovering, setIsHovering] = useState(false)
  const navigate = useNavigate()
  const routerLocation = useLocation()
  
  // Property search states
  const [location, setLocation] = useState('')
  const [propertyFilter, setPropertyFilter] = useState('All')
  const [selectedPropertyType, setSelectedPropertyType] = useState('All')
  const [bedsAndBaths, setBedsAndBaths] = useState('Beds')
  const [priceRange, setPriceRange] = useState('Price (INR)')
  const [locationSearchResults, setLocationSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // Add state for mobile sidebar
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Add these new states
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [userCoordinates, setUserCoordinates] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [isLocating, setIsLocating] = useState(false);

  // Add new state for properties
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add new state for property metrics
  const [propertyMetric, setPropertyMetric] = useState('Beds');
  const [propertyMetricValue, setPropertyMetricValue] = useState('Any');

  const [propertyTypesData, setPropertyTypesData] = useState([]);

  const preparedPropertyTypes = useMemo(
    () => preparePropertyTypes(propertyTypesData),
    [propertyTypesData]
  );

  const categorizedPropertyTypes = useMemo(
    () => categorizePropertyTypes(preparedPropertyTypes),
    [preparedPropertyTypes]
  );

  const heroPropertyGroups = useMemo(() => {
    const groups = [];

    if (categorizedPropertyTypes.land.length > 0) {
      groups.push({
        label: 'Land Properties',
        options: categorizedPropertyTypes.land,
      });
    }

    const buildingOptions = [
      ...categorizedPropertyTypes.residential,
      ...categorizedPropertyTypes.commercial,
      ...categorizedPropertyTypes.other,
    ];

    if (buildingOptions.length > 0) {
      groups.push({
        label: 'Buildings',
        options: buildingOptions,
      });
    }

    if (groups.length === 0 && preparedPropertyTypes.length > 0) {
      groups.push({
        label: 'Property Types',
        options: preparedPropertyTypes.map(({ name }) => name),
      });
    }

    return groups;
  }, [categorizedPropertyTypes, preparedPropertyTypes]);

  // Add this new state for banner
  const [heroBanner, setHeroBanner] = useState(null);
  const [bannerLoading, setBannerLoading] = useState(true);
  
  // Add state for offer banner
  const [offerBanner, setOfferBanner] = useState(null);
  const [offerBannerLoading, setOfferBannerLoading] = useState(true);

  useEffect(() => {
    if (routerLocation.state?.scrollTo === 'services') {
      const scrollToServices = () => {
        const section = document.getElementById('services');
        if (section) {
          section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      };

      // Wait for the DOM to be ready
      const timeout = setTimeout(scrollToServices, 0);

      navigate(routerLocation.pathname, { replace: true, state: {} });

      return () => clearTimeout(timeout);
    }
  }, [routerLocation, navigate]);

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

  const handlePropertyTypeSelect = (type) => {
    setSelectedPropertyType(type);

    if (type === 'All') {
      setPropertyMetric('Beds');
      setPropertyMetricValue('Any');
      return;
    }

    if (isLandPropertyType(type, categorizedPropertyTypes)) {
      setPropertyMetric('Cents');
    } else {
      setPropertyMetric('Square Feet');
    }

    setPropertyMetricValue('Any');
  };

  // Replace separate min/max sqft states with a single state
  const [sqftRange, setSqftRange] = useState('Square Feet');

  // Add this function to get user's current location
  const getUserLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    
    setIsLocating(true);
    setLocationError(null);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false);
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setUserCoordinates({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        
        // Reverse geocode to get address from coordinates
        reverseGeocode(position.coords.latitude, position.coords.longitude);
      },
      (error) => {
        setIsLocating(false);
        setLocationError("Unable to retrieve your location");
        console.error("Geolocation error:", error);
        alert(`Unable to retrieve your location: ${error.message}`);
      }
    );
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
    } catch (error) {
      console.error("Error reverse geocoding:", error);
    }
  };

  // Fetch properties on component mount
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const propertiesData = await propertyAPI.getAllProperties({
          params: {
            page_size: 12,
            page: 1,
          },
        });

        const propertyList = Array.isArray(propertiesData?.results)
          ? propertiesData.results
          : Array.isArray(propertiesData)
            ? propertiesData
            : [];

        const sortedProperties = propertyList
          .slice()
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        const latestProperties = sortedProperties.slice(0, 8);
        setProperties(latestProperties);
      } catch (error) {
        console.error('Error fetching properties:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  useEffect(() => {
    const loadPropertyTypes = async () => {
      try {
        const types = await propertyAPI.getPropertyTypes();
        setPropertyTypesData(Array.isArray(types) ? types : []);
      } catch (error) {
        console.error('Error loading property types:', error);
        setPropertyTypesData([]);
      }
    };

    loadPropertyTypes();
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
  const scrollNext = () => {
    if (currentIndex + itemsToShow < properties.length) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Loop back to start
      setCurrentIndex(0);
    }
  };
  
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
  }, [currentIndex, isHovering, itemsToShow]);

  // Handle search
  const handleSearch = () => {
    const params = new URLSearchParams();
    
    if (location) {
      params.set('location', location);
    }
    
    if (userCoordinates) {
      params.set('lat', userCoordinates.lat);
      params.set('lng', userCoordinates.lng);
    }
    
    if (activeTab) {
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
        const banners = await propertyAPI.getHeroBanners();
        if (banners && banners.length > 0) {
          setHeroBanner(banners[0]); // Get the first banner
        }
        setBannerLoading(false);
      } catch (error) {
        console.error('Error fetching hero banner:', error);
        setBannerLoading(false);
      }
    };

    fetchHeroBanner();
  }, []);

  // Add this new useEffect to fetch the offer banner
  useEffect(() => {
    const fetchOfferBanner = async () => {
      try {
        const banners = await propertyAPI.getOfferBanners();
        if (banners && banners.length > 0) {
          setOfferBanner(banners[0]); // Get the first banner
        }
        setOfferBannerLoading(false);
      } catch (error) {
        console.error('Error fetching offer banner:', error);
        setOfferBannerLoading(false);
      }
    };

    fetchOfferBanner();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header isAdmin={false} />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <header className="relative overflow-hidden h-[500px] sm:h-[550px] md:h-[600px] lg:h-[650px] xl:h-[700px] mt-20 md:mt-20 md:mx-4 lg:mx-4 md:rounded-3xl">
          {/* Ad placement pixel */}
          <div className="hidden" id="ad-placement-pixel" data-google-query-id="CK6MoJmRto0DFQWnZgIdC_cd3A">
            <div id="google_ads_iframe_/1000931/bayut_desktop/homepage_1__container__"></div>
          </div>
          
          {/* Background image */}
          <div className="absolute inset-0 w-full overflow-hidden md:rounded-3xl">
            {bannerLoading ? (
              // Loading skeleton
              <div className="w-full h-full bg-gray-200 animate-pulse"></div>
            ) : heroBanner ? (
              <picture>
                <img 
                  className="w-full h-full object-cover object-center md:rounded-3xl" 
                  src={heroBanner.image}
                  alt="Property background"
                  loading="eager"
                />
              </picture>
            ) : (
              // Fallback image if no banner is available
              <picture>
                <img 
                  className="w-full h-full object-cover object-center md:rounded-3xl" 
                  src={heroImage} // Your default image
                  alt="Property background"   
                />
              </picture>
            )}
            {/* Overlay for better text readability */}
            <div className="absolute inset-0 bg-black/50 w-full md:rounded-3xl"></div>
          </div>

          {/* Title section - Desktop (1024px and above) */}
          <div className="relative z-10 hidden lg:flex flex-col justify-center items-center h-1/3 pt-24">
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-2 text-center">We manage your dreams</h1>
            <h2 className="text-xl text-white/90 text-center">not just your assets</h2>
          </div>

          {/* Title section - Mobile (below 1024px) - perfectly centered */}
          <div className="absolute inset-0 flex lg:hidden flex-col justify-center items-center px-4 z-10">
            <div className="text-center">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                We manage your dreams
              </h1>
              <h2 className="text-lg md:text-xl text-white/90">
                not just your assets
              </h2>
            </div>
          </div>

          {/* Property Search Container - Only visible on larger screens */}
          <div className="relative z-20 hidden lg:justify-center lg:items-center px-4 pt-8 lg:block">
            <div className="w-full max-w-3xl mx-auto bg-green-50 rounded-2xl shadow-lg p-4 sm:p-6">
              {/* Top Row: Location and Search Button */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                {/* Location Input */}
                <div className="relative flex-1">
                  <div className="flex items-center bg-gray-50 rounded-lg px-4 py-3 border border-gray-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200 h-full">
                    <MapPin className="h-5 w-5 text-gray-400 mr-3" />
                    <input
                      type="text"
                      placeholder="Enter location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="flex-1 bg-transparent outline-none text-gray-700 placeholder-gray-500"
                    />
                  </div>
                </div>

                {/* Add this button near your search input */}
                <button 
                  onClick={getUserLocation}
                  className="flex items-center gap-1.5 py-2 px-3 bg-teal-50 text-teal-700 rounded-lg border border-teal-200 hover:bg-teal-100 transition-colors"
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
                  className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 shrink-0"
                >
                  Search
                </button>
              </div>

              {/* Filters Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Sale/Rent Toggle */}
                <div className="relative">
                  <div className="w-full h-full bg-gray-50 border border-gray-200 rounded-lg flex items-center">
                    <div className="flex w-full px-4">
                      {[
                        { label: 'Sale', value: 'sell' },
                        { label: 'Rent', value: 'rent' }
                      ].map((tab) => (
                        <button
                          key={tab.value}
                          onClick={() => setActiveTab(tab.value)}
                          className={`flex-1 px-3 py-1.5 rounded-md font-medium text-sm transition-all duration-200 ${
                            activeTab === tab.value
                              ? 'bg-white text-gray-900 shadow-sm'
                              : 'text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Residential Type */}
                <div className="relative">
                  <select
                    value={selectedPropertyType}
                    onChange={(e) => {
                      handlePropertyTypeSelect(e.target.value);
                    }}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-700 appearance-none cursor-pointer focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  >
                    <option value="All">All Property Types</option>
                    {heroPropertyGroups.map(({ label, options }) =>
                      options.length > 0 ? (
                        <optgroup key={label} label={label}>
                          {options.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </optgroup>
                      ) : null
                    )}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  </div>
                </div>

                {/* Beds/Square Feet/Cents based on property type */}
                <div className="relative">
                  <select
                    value={propertyMetricValue}
                    onChange={(e) => setPropertyMetricValue(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-700 appearance-none cursor-pointer focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
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
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>

                {/* Price Range */}
                <div className="relative">
                  <select
                    value={priceRange}
                    onChange={(e) => setPriceRange(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-700 appearance-none cursor-pointer focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  >
                    <option value="Price (INR)">Price (INR)</option>
                    <option value="Under ₹50L">Under ₹50L</option>
                    <option value="₹50L - ₹1Cr">₹50L - ₹1Cr</option>
                    <option value="₹1Cr - ₹2Cr">₹1Cr - ₹2Cr</option>
                    <option value="₹2Cr - ₹5Cr">₹2Cr - ₹5Cr</option>
                    <option value="Above ₹5Cr">Above ₹5Cr</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
          <div className="relative z-10 flex flex-col justify-center items-center h-1/3 mt-4">
          {/* <h2 className="text-lg md:text-xl backdrop-blur-md bg-white/10 border border-white/30 p-2 text-white text-center rounded-md shadow-lg">Experience the journey</h2>           */}
          </div>
        </header>

        {/* Mobile Search Section - Only visible below 1024px */}
        <section className="lg:hidden bg-white py-8">
          <div className="container mx-auto px-4">
            <div className="bg-green-50 rounded-2xl shadow-lg p-4">
              {/* Location and Search Button */}
              <div className="flex flex-col gap-4 mb-4">
                <div className="relative flex-1">
                  <div className="flex items-center bg-gray-50 rounded-lg px-4 py-3 border border-gray-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200">
                    <MapPin className="h-5 w-5 text-gray-400 mr-3" />
                    <input
                      type="text"
                      placeholder="Enter location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="flex-1 bg-transparent outline-none text-gray-700 placeholder-gray-500"
                    />
                  </div>
                </div>

                {/* Location Button */}
                <button 
                  onClick={getUserLocation}
                  className="flex items-center justify-center gap-1.5 py-3 px-4 bg-teal-50 text-teal-700 rounded-lg border border-teal-200 hover:bg-teal-100 transition-colors w-full"
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
                      <Navigation className="h-4 w-4" />
                      Use my location
                    </>
                  )}
                </button>
              </div>

              {/* Sale/Rent Toggle */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-1 mb-4">
                <div className="flex">
                  {[
                    { label: 'Sale', value: 'sell' },
                    { label: 'Rent', value: 'rent' }
                  ].map((tab) => (
                    <button
                      key={tab.value}
                      onClick={() => setActiveTab(tab.value)}
                      className={`flex-1 px-4 py-2 rounded-md font-medium text-sm transition-all duration-200 ${
                        activeTab === tab.value
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Property Type */}
              <div className="mb-4">
                <select
                  value={selectedPropertyType}
                  onChange={(e) => {
                    handlePropertyTypeSelect(e.target.value);
                  }}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-700 appearance-none cursor-pointer focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                >
                  <option value="All">All Property Types</option>
                  {heroPropertyGroups.map(({ label, options }) =>
                    options.length > 0 ? (
                      <optgroup key={label} label={label}>
                        {options.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </optgroup>
                    ) : null
                  )}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </div>
              </div>

              {/* Property Metric (Beds/Square Feet/Cents) */}
              <div className="mb-4">
                <select
                  value={propertyMetricValue}
                  onChange={(e) => setPropertyMetricValue(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-700 appearance-none cursor-pointer focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
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
              </div>

              {/* Price Range */}
              <div className="mb-4">
                <select
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-700 appearance-none cursor-pointer focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                >
                  <option value="Price (INR)">Price (INR)</option>
                  <option value="Under ₹50L">Under ₹50L</option>
                  <option value="₹50L - ₹1Cr">₹50L - ₹1Cr</option>
                  <option value="₹1Cr - ₹2Cr">₹1Cr - ₹2Cr</option>
                  <option value="₹2Cr - ₹5Cr">₹2Cr - ₹5Cr</option>
                  <option value="Above ₹5Cr">Above ₹5Cr</option>
                </select>
              </div>

              {/* Search Button */}
              <button 
                onClick={handleSearch}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2"
              >
                Search Properties
              </button>
            </div>
          </div>
        </section>

        {/* Premium Banner Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-7xl mx-auto overflow-hidden rounded-2xl shadow-xl bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 border border-gray-100">
              <div className="flex flex-col md:flex-row items-center">
                <div className="md:w-2/5 relative h-64 md:h-80 overflow-hidden">
                  {offerBannerLoading ? (
                    // Loading skeleton
                    <div className="w-full h-full bg-gray-200 animate-pulse"></div>
                  ) : offerBanner ? (
                    <img 
                      src={offerBanner.image}
                      alt="Premium property" 
                      className="w-full h-full object-cover transform transition-transform duration-700 hover:scale-110"
                    />
                  ) : (
                    // Fallback image if no banner is available
                    <img 
                      src="https://img.freepik.com/free-photo/house-isolated-field_1303-23773.jpg?uid=R175609030&ga=GA1.1.2035126144.1745896858&semt=ais_hybrid&w=740" 
                      alt="Premium property" 
                      className="w-full h-full object-cover transform transition-transform duration-700 hover:scale-110"
                    />
                  )}
                </div>
                <div className="md:w-3/5 p-8 md:p-10 flex flex-col justify-center">
                  <h3 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">Exclusive Property Offer</h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">Experience luxury living with our premium properties. Enjoy special discounts and priority access for a limited time only.</p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button 
                      className="px-6 py-3 bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white font-medium rounded-lg transition-all duration-300 transform hover:scale-105 shadow-md"
                      onClick={() => navigate('/property-listing')}
                    >
                      Explore Premium Listings
                    </button>
                    <button 
                      className="px-6 py-3 bg-white text-green-600 border border-green-200 hover:bg-green-50 font-medium rounded-lg transition-all duration-300"
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
          <div className="container mx-auto px-4 py-16">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Featured Properties</h2>
              <div className="flex space-x-2 mt-4 md:mt-0">
                <button 
                  onClick={scrollPrev}
                  className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
                >
                  <FaChevronLeft className="h-5 w-5" />
                </button>
                <button 
                  onClick={scrollNext}
                  className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
                >
                  <FaChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            {loading ? (
              <div className="text-center py-8">
                <p>Loading properties...</p>
              </div>
            ) : (
              <div className="relative overflow-hidden">
                <div 
                  className="flex transition-transform duration-300 ease-out"
                  style={{ transform: `translateX(-${currentIndex * (100 / itemsToShow)}%)` }}
                >
                  {properties.map((property) => (
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
                        <div className="relative h-48 overflow-hidden group">
                          {property.images && property.images.length > 0 && (
                            <img 
                              src={property.images[0].image} 
                              alt={property.title} 
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </div>
                        <div className="p-4">
                          <h3 className="font-bold text-lg">{property.title}</h3>
                          <p className="text-gray-600 text-sm">{property.property_type_details.name}</p>
                          
                          <div className="flex items-center mt-2 text-sm text-gray-600">
                            <MapPin className="h-4 w-4 mr-1" />
                            <span className="truncate">
                              {`${property.location.city}, ${property.location.district}, ${property.location.state}`}
                            </span>
                          </div>

                          <div className="flex justify-between mt-4 border-t pt-4">
                            <div>
                              <p className="text-xs text-gray-500">Price</p>
                              <p className="font-semibold">₹{Number(property.price).toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Listed</p>
                              <p className="text-sm text-gray-600">
                                {new Date(property.created_at).toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'short'
                                })}
                              </p>
                            </div>
                          </div>
                          
                          <a 
                            href={`https://wa.me/${property.whatsapp_number}?text=Hi, I'm interested in the property: ${property.title}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-4 w-full bg-green-50 hover:bg-green-100 text-green-700 py-2 rounded-md flex items-center justify-center transition-all duration-300 transform hover:scale-[1.02]"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <FaWhatsapp className="mr-2" />
                            WhatsApp
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
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
        <section id="services" className="py-6 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Why Choose Us</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">We're committed to providing exceptional service and value to our clients</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Feature 1 */}
              <div className="group">
                <div className="bg-green-50 rounded-2xl p-6 transition-all duration-300 group-hover:bg-green-100">
                  <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-xl mb-2">Trusted Excellence</h3>
                  <p className="text-gray-600">Over 1000+ satisfied clients and growing, with a proven track record of success</p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="group">
                <div className="bg-green-50 rounded-2xl p-6 transition-all duration-300 group-hover:bg-green-100">
                  <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-xl mb-2">Fast & Efficient</h3>
                  <p className="text-gray-600">Quick response times and streamlined processes to save you time and effort</p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="group">
                <div className="bg-green-50 rounded-2xl p-6 transition-all duration-300 group-hover:bg-green-100">
                  <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-xl mb-2">Expert Team</h3>
                  <p className="text-gray-600">Experienced professionals dedicated to helping you find your perfect property</p>
                </div>
              </div>

              {/* Feature 4 */}
              <div className="group">
                <div className="bg-green-50 rounded-2xl p-6 transition-all duration-300 group-hover:bg-green-100">
                  <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-xl mb-2">Secure Deals</h3>
                  <p className="text-gray-600">Transparent transactions and secure processes for your peace of mind</p>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        
        {/* Client Testimonials Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">What Our Clients Say</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">Discover why our clients trust us with their dream properties</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Testimonial Card 1 */}
              <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition-shadow relative">
                <div className="absolute -top-4 left-6">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9.983 3v7.391c0 5.704-3.731 9.57-8.983 10.609l-.995-2.151c2.432-.917 3.995-3.638 3.995-5.849h-4v-10h9.983zm14.017 0v7.391c0 5.704-3.748 9.571-9 10.609l-.996-2.151c2.433-.917 3.996-3.638 3.996-5.849h-3.983v-10h9.983z"/>
                    </svg>
                  </div>
                </div>
                <div className="pt-6">
                  <p className="text-gray-600 mb-4">"Finding our dream home was effortless with their exceptional service. The team went above and beyond to understand our needs."</p>
                  <div className="flex items-center">
                    <div>
                      <h4 className="font-semibold">Thomas Mathew</h4>
                      <p className="text-sm text-gray-500">Homeowner</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Testimonial Card 2 */}
              <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition-shadow relative">
                <div className="absolute -top-4 left-6">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9.983 3v7.391c0 5.704-3.731 9.57-8.983 10.609l-.995-2.151c2.432-.917 3.995-3.638 3.995-5.849h-4v-10h9.983zm14.017 0v7.391c0 5.704-3.748 9.571-9 10.609l-.996-2.151c2.433-.917 3.996-3.638 3.996-5.849h-3.983v-10h9.983z"/>
                    </svg>
                  </div>
                </div>
                <div className="pt-6">
                  <p className="text-gray-600 mb-4">"The property listings were accurate, and the team's expertise in the local market made our investment decision easy."</p>
                  <div className="flex items-center">
                    <div>
                      <h4 className="font-semibold">Johnson Samuel</h4>
                      <p className="text-sm text-gray-500">Property Investor</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Testimonial Card 3 */}
              <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition-shadow relative">
                <div className="absolute -top-4 left-6">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9.983 3v7.391c0 5.704-3.731 9.57-8.983 10.609l-.995-2.151c2.432-.917 3.995-3.638 3.995-5.849h-4v-10h9.983zm14.017 0v7.391c0 5.704-3.748 9.571-9 10.609l-.996-2.151c2.433-.917 3.996-3.638 3.996-5.849h-3.983v-10h9.983z"/>
                    </svg>
                  </div>
                </div>
                <div className="pt-6">
                  <p className="text-gray-600 mb-4">"Professional, transparent, and truly customer-focused. They made our property search journey smooth and genuinely enjoyable."</p>
                  <div className="flex items-center">
                    <div>
                      <h4 className="font-semibold">Rajesh Kumar</h4>
                      <p className="text-sm text-gray-500">First-time Buyer</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="py-16 bg-gradient-to-r from-gray-800 to-gray-800 relative overflow-hidden">
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
          <div className="container mx-auto px-4 relative">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-4xl font-bold text-white mb-6">Ready to Find Your Dream Property?</h2>
              <p className="text-green-50 text-lg mb-8">Join thousands of satisfied customers who found their perfect home with us</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button onClick={() => navigate('/property-listing')} className="px-8 py-4 bg-white text-green-600 rounded-lg font-semibold hover:bg-green-50 transition-colors shadow-lg">
                  Browse Properties
                </button>
                <button onClick={() => navigate('/contact')} className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg font-semibold hover:bg-white/10 transition-colors">
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




































































