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
  FaSearch,
  FaFilter,
  FaThLarge,
  FaThList,
  FaDirections,
  FaTimes,
  FaChevronUp,
  FaChevronDown
} from 'react-icons/fa';
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import Header from '../shared/Header';
import Footer from '../shared/Footer';
import { motion } from 'framer-motion';
import { propertyAPI } from '../../Services/api';
import {
  categorizePropertyTypes,
  normalizePropertyTypeName,
  preparePropertyTypes,
  formatAreaUnit,
} from '../../utils/propertyTypeUtils';

// Add Fuse.js for fuzzy search
import Fuse from 'fuse.js';
import ExpandableText from '../shared/ExpandableText';

const DEFAULT_MAX_PRICE = 100000000;
const PAGE_SIZE_OPTIONS = [5, 10, 15, 20, 50];

const PropertyListing = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  
  // Get search parameters from URL with proper parsing
  const searchLocation = searchParams.get('location') || '';
  const searchType = searchParams.get('type') || 'all';
  const rawSearchPropertyType = searchParams.get('propertyType');
  const searchPropertyType = rawSearchPropertyType
    ? normalizePropertyTypeName(rawSearchPropertyType)
    : 'all';
  const searchCategory = searchParams.get('category') || 'residential';
  const searchBeds = searchParams.get('beds') || 'any';
  const searchPrice = searchParams.get('price') || 'Price (INR)';
  const searchSqft = searchParams.get('sqft') || 'Square Feet';
  const searchKeyword = searchParams.get('search') || '';

  // Parse price range from the price string
  const getPriceRangeFromString = (priceStr) => {
    const priceRanges = {
      'Under ₹25L': [100000, 2500000],
      '₹25L - ₹50L': [2500000, 5000000],
      '₹50L - ₹1Cr': [5000000, 10000000],
      '₹1Cr - ₹2Cr': [10000000, 20000000],
      '₹2Cr - ₹5Cr': [20000000, 50000000],
      '₹5Cr - ₹10Cr': [50000000, 100000000],
      'Price (INR)': [0, 100000000] // Default range
    };
    return priceRanges[priceStr] || priceRanges['Price (INR)'];
  };

  // Initialize state with URL parameters
  const [viewMode, setViewMode] = useState('list');
  const [favorites, setFavorites] = useState({});
  const [activeFilter, setActiveFilter] = useState(searchPropertyType);
  const [priceRange, setPriceRange] = useState(getPriceRangeFromString(searchPrice));
  const [searchQuery, setSearchQuery] = useState(searchLocation || searchKeyword);
  const [selectedLocation, setSelectedLocation] = useState(searchLocation);
  const [showFilters, setShowFilters] = useState(false);
  const [sortOption, setSortOption] = useState('newest');
  const [isLoading, setIsLoading] = useState(false);
  const [ownershipFilter, setOwnershipFilter] = useState('all');
  const [listingTypeFilter, setListingTypeFilter] = useState(searchType);
  const [furnishingFilter, setFurnishingFilter] = useState('all');
  const [distanceRange, setDistanceRange] = useState(25);
  const [userLocation, setUserLocation] = useState(null);
  const [expandedFilter, setExpandedFilter] = useState(null);
  const [bedroomsFilter, setBedroomsFilter] = useState(searchBeds);
  const [bathroomsFilter, setBathroomsFilter] = useState('any');
  const [amenitiesFilter, setAmenitiesFilter] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState(searchCategory);
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [error, setError] = useState(null);
  const [squareFeetRange, setSquareFeetRange] = useState([0, 10000]);
  const [centsRange, setCentsRange] = useState([0, 5000]);
  const searchPageParam = parseInt(searchParams.get('page') || '1', 10);
  const initialPage = Number.isFinite(searchPageParam) && searchPageParam > 0 ? searchPageParam : 1;
  const searchPageSizeParam = parseInt(
    searchParams.get('page_size') || `${PAGE_SIZE_OPTIONS[0]}`,
    10
  );
  const initialPageSize = PAGE_SIZE_OPTIONS.includes(searchPageSizeParam)
    ? searchPageSizeParam
    : PAGE_SIZE_OPTIONS[0];

  const [currentPage, setCurrentPage] = useState(initialPage);
  const [itemsPerPage, setItemsPerPage] = useState(initialPageSize);
  const [totalProperties, setTotalProperties] = useState(0);
  const [propertyTypesData, setPropertyTypesData] = useState([]);
  const hasLoadedOnceRef = useRef(false);
  const filtersInitializedRef = useRef(false);
  const preparedPropertyTypes = useMemo(
    () => preparePropertyTypes(propertyTypesData),
    [propertyTypesData]
  );

  const categorizedPropertyTypes = useMemo(
    () => categorizePropertyTypes(preparedPropertyTypes),
    [preparedPropertyTypes]
  );

  const propertyTypeNameMap = useMemo(() => {
    const map = new Map();
    preparedPropertyTypes.forEach(({ name }) => {
      const normalized = normalizePropertyTypeName(name);
      if (normalized && !map.has(normalized)) {
        map.set(normalized, name);
      }
    });
    return map;
  }, [preparedPropertyTypes]);

  const propertyTypeCategories = useMemo(() => {
    const categories = {};

    if (categorizedPropertyTypes.residential.length > 0) {
      categories.Residential = categorizedPropertyTypes.residential;
    }

    if (categorizedPropertyTypes.commercial.length > 0) {
      categories.Commercial = categorizedPropertyTypes.commercial;
    }

    if (categorizedPropertyTypes.land.length > 0) {
      categories.Land = categorizedPropertyTypes.land;
    }

    if (categorizedPropertyTypes.other.length > 0) {
      categories.Other = categorizedPropertyTypes.other;
    }

    return categories;
  }, [categorizedPropertyTypes]);

  const landPropertyTypeSet = useMemo(() => {
    const set = new Set();
    categorizedPropertyTypes.land.forEach((name) => {
      const normalized = normalizePropertyTypeName(name);
      if (normalized) {
        set.add(normalized);
      }
    });
    return set;
  }, [categorizedPropertyTypes]);

  const formatPropertyAreaDisplay = useCallback(
    (property) => {
      const rawArea = Number(property?.area);

      if (!Number.isFinite(rawArea) || rawArea <= 0) {
        return null;
      }

      const unit = formatAreaUnit(property, landPropertyTypeSet);

      if (unit === 'cent') {
        const unitLabel = rawArea === 1 ? 'Cent' : 'Cents';
        return `${rawArea} ${unitLabel}`;
      }

      return `${rawArea} ${unit}`;
    },
    [landPropertyTypeSet]
  );

  const getPropertyTypeLabel = useCallback(
    (filterValue) => {
      if (!filterValue || filterValue === 'all') return null;

      const normalizedFilter = normalizePropertyTypeName(filterValue);
      return propertyTypeNameMap.get(normalizedFilter) ?? null;
    },
    [propertyTypeNameMap]
  );

  // Update the locations array with Kerala locations
  const locations = [
    'Thodupuzha, Idukki',
    'Pala, Kottayam',
    'Erattupetta, Kottayam',
    'Kaloor, Ernakulam',
    'Kochi, Ernakulam',
    'Pathanamthitta'
  ];

  // Add state for suggested locations
  const [suggestedLocations, setSuggestedLocations] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const toggleFavorite = (id) => {
    setFavorites((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Updated function to handle the case when property is not defined
  const getDirections = (e, propertyData) => {
    e.preventDefault();
    e.stopPropagation();
    const directionsUrl = propertyData?.google_maps_url || 'https://maps.app.goo.gl/TmRYmFNwSF3g5vrX8?g_st=ac';
    window.open(directionsUrl, '_blank');
  };

  // Add this function to toggle expanded filter sections
  const toggleFilterSection = (section) => {
    setExpandedFilter(expandedFilter === section ? null : section);
  };

  // Add this function to handle amenities selection
  const toggleAmenity = (amenity) => {
    setAmenitiesFilter(prev => 
      prev.includes(amenity) 
        ? prev.filter(a => a !== amenity) 
        : [...prev, amenity]
    );
  };

  // Add this function to calculate distance between two points
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const distance = R * c; // Distance in km
    return distance;
  };

  // Replace mockProperties with real properties state
  const [properties, setProperties] = useState([]);

  const apiParams = useMemo(() => {
    const params = {
      page: currentPage,
      page_size: itemsPerPage,
    };

    if (Array.isArray(priceRange)) {
      const [minPrice, maxPrice] = priceRange;
      if (Number.isFinite(minPrice) && minPrice > 0) {
        params.price_min = minPrice;
      }
      if (Number.isFinite(maxPrice) && maxPrice > 0 && maxPrice < DEFAULT_MAX_PRICE) {
        params.price_max = maxPrice;
      }
    }

    if (listingTypeFilter !== 'all') {
      params.property_for = listingTypeFilter;
    }

    if (ownershipFilter !== 'all') {
      params.ownership = ownershipFilter;
    }

    if (furnishingFilter !== 'all') {
      params.furnishing = furnishingFilter;
    }

    if (bedroomsFilter !== 'any') {
      params.bedrooms_min = bedroomsFilter === '5+' ? 5 : parseInt(bedroomsFilter, 10);
    }

    if (bathroomsFilter !== 'any') {
      params.bathrooms_min = bathroomsFilter === '4+' ? 4 : parseInt(bathroomsFilter, 10);
    }

    const isLandFilter = landPropertyTypeSet.has(
      normalizePropertyTypeName(activeFilter)
    );

    if (isLandFilter) {
      const hasAreaMin = centsRange[0] > 0;
      const hasAreaMax = centsRange[1] > 0 && centsRange[1] < 1000;

      if (hasAreaMin) {
        params.area_min = centsRange[0];
      }
      if (hasAreaMax) {
        params.area_max = centsRange[1];
      }
      if (hasAreaMin || hasAreaMax) {
        params.area_unit = 'cent';
      }
    } else {
      const hasAreaMin = squareFeetRange[0] > 0;
      const hasAreaMax = squareFeetRange[1] > 0 && squareFeetRange[1] < 10000;

      if (hasAreaMin) {
        params.area_min = squareFeetRange[0];
      }
      if (hasAreaMax) {
        params.area_max = squareFeetRange[1];
      }
      if (hasAreaMin || hasAreaMax) {
        params.area_unit = 'sqft';
      }
    }

    const trimmedSelectedLocation = selectedLocation.trim();
    const trimmedSearchQuery = searchQuery.trim();
    const propertyTypeLabel = getPropertyTypeLabel(activeFilter);
    const searchTerms = [];

    if (trimmedSelectedLocation) {
      params.location = trimmedSelectedLocation;
    }

    if (trimmedSearchQuery) {
      searchTerms.push(trimmedSearchQuery);
    }

    if (propertyTypeLabel) {
      searchTerms.push(propertyTypeLabel);
    }

    if (searchTerms.length > 0) {
      params.search = searchTerms.join(' ');
    }

    return params;
  }, [
    activeFilter,
    bathroomsFilter,
    bedroomsFilter,
    centsRange,
    currentPage,
    furnishingFilter,
    getPropertyTypeLabel,
    itemsPerPage,
    landPropertyTypeSet,
    listingTypeFilter,
    ownershipFilter,
    priceRange,
    searchQuery,
    selectedLocation,
    squareFeetRange,
  ], [
    activeFilter,
    bathroomsFilter,
    bedroomsFilter,
    centsRange,
    currentPage,
    furnishingFilter,
    getPropertyTypeLabel,
    itemsPerPage,
    landPropertyTypeSet,
    listingTypeFilter,
    ownershipFilter,
    priceRange,
    searchQuery,
    selectedLocation,
    squareFeetRange,
  ]);

  const fetchProperties = useCallback(async () => {
    setIsLoading(true);
    if (!hasLoadedOnceRef.current) {
      setIsInitialLoading(true);
    }
    setError(null);
    try {
      const data = await propertyAPI.getAllProperties({
        params: apiParams,
      });

      const results = Array.isArray(data?.results)
        ? data.results
        : Array.isArray(data)
          ? data
          : [];

      setProperties(results);
      setTotalProperties(typeof data?.count === 'number' ? data.count : results.length);
      setError(null);
    } catch (err) {
      console.error('Error fetching properties:', err);
      setError('Failed to fetch properties. Please try again later.');
      setProperties([]);
      setTotalProperties(0);
    } finally {
      hasLoadedOnceRef.current = true;
      setIsInitialLoading(false);
      setIsLoading(false);
    }
  }, [apiParams]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  useEffect(() => {
    const loadPropertyTypes = async () => {
      try {
        const types = await propertyAPI.getPropertyTypes();
        if (Array.isArray(types)) {
          setPropertyTypesData(types);
        }
      } catch (err) {
        console.error('Error loading property types:', err);
      }
    };

    loadPropertyTypes();
  }, []);

  useEffect(() => {
    if (!filtersInitializedRef.current) {
      filtersInitializedRef.current = true;
      return;
    }
    setCurrentPage(1);
  }, [
    activeFilter,
    bathroomsFilter,
    bedroomsFilter,
    centsRange,
    furnishingFilter,
    listingTypeFilter,
    ownershipFilter,
    priceRange,
    searchQuery,
    selectedLocation,
    squareFeetRange,
    itemsPerPage,
  ]);

  // Add this helper function near the top of your component
  const capitalizeFirstLetter = (string) => {
    if (!string) return '';
    return string.split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  // Function to get unique locations from properties
  const getUniqueLocations = (properties) => {
    const locations = new Set();
    properties.forEach(property => {
      if (property.location?.city) {
        locations.add(`${capitalizeFirstLetter(property.location.city)}, ${capitalizeFirstLetter(property.location.district)}, ${capitalizeFirstLetter(property.location.state)}`);
      }
    });
    return Array.from(locations);
  };

  // Initialize Fuse instance for fuzzy search
  const initializeFuseSearch = (locations) => {
    return new Fuse(locations, {
      includeScore: true,
      threshold: 0.4,
      keys: ['location'],
      distance: 200
    });
  };

  // Function to handle location search and suggestions
  const handleLocationSearch = (searchValue) => {
    setSearchQuery(searchValue);
    setSelectedLocation('');
    
    if (searchValue.length < 2) {
      setSuggestedLocations([]);
      setShowSuggestions(false);
      return;
    }

    const uniqueLocations = getUniqueLocations(properties);
    const fuse = initializeFuseSearch(uniqueLocations.map(loc => ({ location: loc })));
    const results = fuse.search(searchValue);
    
    // Get top 5 suggestions
    const suggestions = results
      .slice(0, 5)
      .map(result => result.item.location);
    
    setSuggestedLocations(suggestions);
    setShowSuggestions(true);
  };

  // Function to handle suggestion selection
  const handleSuggestionSelect = (suggestion) => {
    setSearchQuery(suggestion);
    setSelectedLocation(suggestion);
    setShowSuggestions(false);
  };

  // Add helper function to format area numbers
  const formatAreaNumber = (number) => {
    if (number >= 10000) {
      return `${(number / 1000).toFixed(1)}K`;
    }
    return number.toString();
  };

  const filteredProperties = useMemo(() => {
    if (!Array.isArray(properties) || properties.length === 0) {
      return [];
    }

    return properties.filter((property) => {
      if (furnishingFilter !== 'all') {
        const propertyFurnishing = (property.furnishing || '').toLowerCase();
        if (propertyFurnishing !== furnishingFilter.toLowerCase()) {
          return false;
        }
      }

      if (amenitiesFilter.length > 0) {
        const featureNames = (property.feature_details || []).map((feature) =>
          feature.name?.toLowerCase()
        );

        const hasAllAmenities = amenitiesFilter.every((amenity) =>
          featureNames.includes(amenity.toLowerCase())
        );

        if (!hasAllAmenities) {
          return false;
        }
      }

      return true;
    });
  }, [amenitiesFilter, furnishingFilter, properties]);

  // Update the sortedProperties logic
  const sortedProperties = useMemo(() => {
    let sorted = [...filteredProperties];
    
    switch (sortOption) {
      case 'price-asc':
        sorted.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
        break;
      case 'price-desc':
        sorted.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
        break;
      case 'newest':
        sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      case 'nearest':
        if (userLocation) {
          sorted.sort((a, b) => {
            const distanceA = calculateDistance(
              userLocation.lat,
              userLocation.lng,
              parseFloat(a.latitude),
              parseFloat(a.longitude)
            );
            const distanceB = calculateDistance(
              userLocation.lat,
              userLocation.lng,
              parseFloat(b.latitude),
              parseFloat(b.longitude)
            );
            return distanceA - distanceB;
          });
        }
        break;
      default:
        break;
    }
    
    return sorted;
  }, [filteredProperties, sortOption, userLocation]);

  // Update search query when location changes
  useEffect(() => {
    if (searchLocation) {
      setSearchQuery(searchLocation);
    }
  }, [searchLocation]);

  // Show loading state when filters change
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, [
    searchQuery,
    listingTypeFilter,
    activeFilter,
    categoryFilter,
    bedroomsFilter,
    bathroomsFilter,
    priceRange,
    ownershipFilter,
    amenitiesFilter
  ]);

  // Add this to your useEffect or create a new one
  useEffect(() => {
    // Get user's location if they allow it
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => console.log("Error getting location:", error)
      );
    }
  }, []);

  // Parse URL query parameters
  const parseQueryParams = useCallback(() => {
    const searchParams = new URLSearchParams(location.search);
    const type = searchParams.get('type');
    const category = searchParams.get('category');
    const locationParam = searchParams.get('location');
    const searchParam = searchParams.get('search');
    const pageParam = parseInt(searchParams.get('page') || '1', 10);
    const pageSizeParam = parseInt(searchParams.get('page_size') || `${itemsPerPage}`, 10);
    
    // Set listing type filter based on URL parameter
    if (type === 'rent') {
      setListingTypeFilter('rent');
    } else if (type === 'sell') {
      setListingTypeFilter('sell');
    }
    
    if (locationParam) {
      setSelectedLocation(locationParam);
      setSearchQuery(locationParam);
    } else if (searchParam) {
      setSelectedLocation('');
      setSearchQuery(searchParam);
    }

    if (Number.isFinite(pageParam) && pageParam > 0) {
      setCurrentPage(pageParam);
    }

    if (Number.isFinite(pageSizeParam) && PAGE_SIZE_OPTIONS.includes(pageSizeParam)) {
      setItemsPerPage(pageSizeParam);
    } else if (!PAGE_SIZE_OPTIONS.includes(itemsPerPage)) {
      setItemsPerPage(PAGE_SIZE_OPTIONS[0]);
    }

    // Set property type filter based on URL parameter
    if (category) {
      // Map category parameter to your activeFilter state
      const categoryMap = {
        'apartments': 'apartment',
        'villas': 'villa',
        'commercial': 'office',
        'land': 'land'
      };
      
      if (categoryMap[category]) {
        setActiveFilter(categoryMap[category]);
      }
    }
  }, [itemsPerPage, location.search]);
  
  // Apply URL parameters when component mounts or URL changes
  useEffect(() => {
    parseQueryParams();
  }, [location.search, parseQueryParams]);

  // Update URL when filters change
  const updateUrlWithFilters = useCallback(() => {
    const params = new URLSearchParams();

    Object.entries(apiParams).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') {
        return;
      }

      params.set(key, String(value));
    });

    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState(null, '', newUrl);
  }, [apiParams]);

  // Update URL when filters change
  useEffect(() => {
    updateUrlWithFilters();
  }, [updateUrlWithFilters]);

  // Show filters by default if any filter is set
  useEffect(() => {
    if (
      searchLocation ||
      searchBeds !== 'any' ||
      searchPrice !== 'Price (INR)' ||
      searchSqft !== 'Square Feet'
    ) {
      setShowFilters(true);
    }
  }, [searchLocation, searchBeds, searchPrice, searchSqft]);

  // Reset filters function
  const resetFilters = () => {
    setActiveFilter('all');
    setPriceRange(getPriceRangeFromString('Price (INR)'));
    setBedroomsFilter('any');
    setBathroomsFilter('any');
    setDistanceRange(25);
    setOwnershipFilter('all');
    setListingTypeFilter('all');
    setFurnishingFilter('all');
    setAmenitiesFilter([]);
    setCategoryFilter('residential');
    setSearchQuery('');
    setSelectedLocation('');
    setSquareFeetRange([0, 10000]);
    setCentsRange([0, 5000]);
    setSortOption('newest');
    setItemsPerPage(PAGE_SIZE_OPTIONS[0]);
    setCurrentPage(1);
    
    // Update URL to remove all parameters
    window.history.replaceState(null, '', window.location.pathname);
  };

  // Move getFilterDescription function here, before the return statement
  const getFilterDescription = () => {
    const parts = [];
    
    if (listingTypeFilter !== 'all') {
      parts.push(listingTypeFilter === 'rent' ? 'For Rent' : 'For Sale');
    }
    
    if (activeFilter !== 'all') {
      parts.push(activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1));
    }
    
    if (bedroomsFilter !== 'any') {
      parts.push(`${bedroomsFilter} Bedroom${bedroomsFilter !== '1' ? 's' : ''}`);
    }
    
    if (parts.length === 0) {
      return 'Explore our exclusive property listings';
    }
    
    return parts.join(' • ');
  };

  // Update the useEffect for getting user location
  useEffect(() => {
    if (sortOption === 'nearest' && !userLocation) {
      setShowLocationPrompt(true);
    }
  }, [sortOption, userLocation]);

  // Update the location permission handler
  const handleLocationPermission = () => {
    setLocationError(null);
    setIsLocating(true);

    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      setIsLocating(false);
      return;
    }

    const successCallback = (position) => {
      const { latitude, longitude } = position.coords;
      
      // Set user location
      setUserLocation({
        lat: latitude,
        lng: longitude
      });

      // Get address from coordinates using reverse geocoding
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`)
        .then(response => response.json())
        .then(data => {
          if (data && data.display_name) {
            // Extract city/locality from the address
            const locality = data.address.city || 
                           data.address.town || 
                           data.address.village || 
                           data.address.suburb ||
                           data.address.county;
            
            const locationString = locality ? `${locality}, ${data.address.state || ''}` : data.display_name;
            setSearchQuery(locationString);
          }
        })
        .catch(error => {
          console.error("Error getting address:", error);
          setLocationError("Could not get address from coordinates");
        })
        .finally(() => {
          setIsLocating(false);
          setShowLocationPrompt(false);
        });
    };

    const errorCallback = (error) => {
      setIsLocating(false);
      switch(error.code) {
        case error.PERMISSION_DENIED:
          setLocationError("Location permission denied. Please enable location services in your browser.");
          break;
        case error.POSITION_UNAVAILABLE:
          setLocationError("Location information is unavailable.");
          break;
        case error.TIMEOUT:
          setLocationError("Location request timed out.");
          break;
        default:
          setLocationError("An unknown error occurred while getting location.");
          break;
      }
    };

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    };

    navigator.geolocation.getCurrentPosition(
      successCallback,
      errorCallback,
      options
    );
  };

  // Update the search input in the filters section
  const searchInputSection = (
    <div className="relative w-full">
      <div className="relative flex items-center">
        <FaMapMarkerAlt className="absolute left-4 text-gray-400" />
        <input
          type="text"
          placeholder="Enter location"
          value={searchQuery}
          onChange={(e) => handleLocationSearch(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          className="w-full py-3 px-11 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-700 placeholder-gray-400"
        />
        {searchQuery && (
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedLocation('');
              setUserLocation(null);
              setSuggestedLocations([]);
              setShowSuggestions(false);
            }}
            className="absolute right-3 text-gray-400 hover:text-gray-600 p-1"
          >
            <FaTimes className="w-4 h-4" />
          </button>
        )}
      </div>
      
      {/* Location Suggestions Dropdown */}
      {showSuggestions && suggestedLocations.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {suggestedLocations.map((suggestion, index) => (
            <div
              key={index}
              className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
              onClick={() => handleSuggestionSelect(suggestion)}
            >
              <div className="flex items-center gap-3">
                <FaMapMarkerAlt className="text-green-500 flex-shrink-0" />
                <div>
                  <div className="text-gray-700">{suggestion}</div>
                  <div className="text-xs text-gray-500 mt-0.5">Click to select this location</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Find the location filter section and update it
  const locationFilterSection = (
    <div className="bg-gray-50 p-3 sm:p-4 rounded-lg border border-gray-100">
      <div 
        className="flex justify-between items-center cursor-pointer mb-3 sm:mb-4 touch-manipulation"
        onClick={() => toggleFilterSection('location')}
      >
        <h3 className="text-base sm:text-lg font-medium text-gray-800 flex items-center">
          <span className="w-1.5 h-5 bg-green-600 rounded-full mr-2 flex-shrink-0"></span>
          <span className="truncate">Location</span>
        </h3>
        <span className="flex-shrink-0 ml-2">{expandedFilter === 'location' ? <FaChevronUp className="w-4 h-4" /> : <FaChevronDown className="w-4 h-4" />}</span>
      </div>
      
      {expandedFilter === 'location' && (
        <div className="space-y-3 sm:space-y-4">
          {/* Search Input */}
          {searchInputSection}

          {/* Location Error Message */}
          {locationError && (
            <div className="text-red-500 text-xs sm:text-sm flex items-center gap-2 p-2 bg-red-50 rounded-lg">
              <FaTimes className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
              <span>{locationError}</span>
            </div>
          )}

          {/* Use Current Location Button */}
          <button 
            onClick={handleLocationPermission}
            disabled={isLocating}
            className={`w-full flex items-center justify-center gap-2 py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg transition-all duration-300 touch-manipulation text-sm sm:text-base ${
              isLocating 
                ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                : 'bg-white border border-green-500 text-green-600 hover:bg-green-50'
            }`}
          >
            {isLocating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-gray-600"></div>
                <span>Getting location...</span>
              </>
            ) : (
              <>
                <FaMapMarkerAlt className="text-green-600" />
                <span>Use my current location</span>
              </>
            )}
          </button>

          {/* Distance Range - Only show if location is set */}
          {/* {(userLocation || searchQuery) && (
            <div className="pt-4 border-t border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search radius
              </label>
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>0 km</span>
                <span>{distanceRange} km</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={distanceRange}
                onChange={(e) => setDistanceRange(parseInt(e.target.value))}
                className="w-full h-2 bg-green-100 rounded-lg appearance-none cursor-pointer accent-green-600"
              />
              <p className="mt-2 text-xs text-gray-500">
                {userLocation ? 
                  `Showing properties within ${distanceRange}km of your location` :
                  `Showing properties within ${distanceRange}km of entered location`
                }
              </p>
            </div>
          )} */}
        </div>
      )}
    </div>
  );

  // Add areaFiltersSection after the price range filter in Column 2
  const areaFiltersSection = (
    <>
      {/* Square Feet Filter */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
        <div 
          className="flex justify-between items-center cursor-pointer"
          onClick={() => toggleFilterSection('squareFeet')}
        >
          <h3 className="text-lg font-medium text-gray-800 flex items-center">
            <span className="w-1.5 h-5 bg-green-600 rounded-full mr-2"></span>
            Built-up Area (Sq.ft)
          </h3>
          <span>{expandedFilter === 'squareFeet' ? <FaChevronUp /> : <FaChevronDown />}</span>
        </div>
        
        {expandedFilter === 'squareFeet' && (
          <div className="mt-4 px-2">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>{formatAreaNumber(squareFeetRange[0])} sq.ft</span>
              <span>{formatAreaNumber(squareFeetRange[1])} sq.ft</span>
            </div>
            <div className="relative pt-1">
              <input
                type="range"
                min="0"
                max="10000"
                step="100"
                value={squareFeetRange[1]}
                onChange={(e) => setSquareFeetRange([0, parseInt(e.target.value)])}
                className="w-full h-2 bg-green-100 rounded-lg appearance-none cursor-pointer accent-green-600"
              />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {['500', '1000', '2000', '3000', '5000', '10000'].map((size) => (
                <button
                  key={size}
                  onClick={() => setSquareFeetRange([0, parseInt(size)])}
                  className={`px-2 py-1.5 rounded-lg text-sm transition-all duration-300 ${
                    squareFeetRange[1] === parseInt(size)
                      ? 'bg-green-600 text-white font-medium shadow-md'
                      : 'bg-white text-gray-700 border border-gray-200 hover:border-green-300'
                  }`}
                >
                  {`< ${formatAreaNumber(parseInt(size))}`}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Cents Filter */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
        <div 
          className="flex justify-between items-center cursor-pointer"
          onClick={() => toggleFilterSection('cents')}
        >
          <h3 className="text-lg font-medium text-gray-800 flex items-center">
            <span className="w-1.5 h-5 bg-green-600 rounded-full mr-2"></span>
            Land Area (Cents)
          </h3>
          <span>{expandedFilter === 'cents' ? <FaChevronUp /> : <FaChevronDown />}</span>
        </div>
        
        {expandedFilter === 'cents' && (
          <div className="mt-4 px-2">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>{centsRange[0]} cents</span>
              <span>{centsRange[1] >= 1000 ? '1000+ cents' : `${centsRange[1]} cents`}</span>
            </div>
            <div className="relative pt-1">
              <input
                type="range"
                min="0"
                max="1000"
                step="10"
                value={centsRange[1]}
                onChange={(e) => setCentsRange([0, parseInt(e.target.value)])}
                className="w-full h-2 bg-green-100 rounded-lg appearance-none cursor-pointer accent-green-600"
              />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {['25', '50', '100', '500', '750', '1000'].map((size) => (
                <button
                  key={size}
                  onClick={() => setCentsRange([0, parseInt(size)])}
                  className={`px-2 py-1.5 rounded-lg text-sm transition-all duration-300 ${
                    centsRange[1] === parseInt(size)
                      ? 'bg-green-600 text-white font-medium shadow-md'
                      : 'bg-white text-gray-700 border border-gray-200 hover:border-green-300'
                  }`}
                >
                  {size === '1000' ? '1000+' : `< ${size}`}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );

  // Add these helper functions before the return statement
  const currentProperties = sortedProperties;
  const totalPages = totalProperties > 0 ? Math.ceil(totalProperties / itemsPerPage) : 0;

  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePageSizeChange = (event) => {
    const newSize = parseInt(event.target.value, 10);
    if (Number.isFinite(newSize) && PAGE_SIZE_OPTIONS.includes(newSize)) {
      setItemsPerPage(newSize);
      setCurrentPage(1);
    }
  };

  // Function to generate page numbers array
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5; // Number of page buttons to show
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    // Adjust start page if we're near the end
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return pageNumbers;
  };

  // Add this NoResultsFound component inside the PropertyListing component
  const NoResultsFound = () => (
    <div className="text-center py-12 px-4">
      <div className="max-w-md mx-auto">
        {/* Illustration/Icon */}
        <div className="mb-6">
          <svg
            className="mx-auto h-24 w-24 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
        </div>

        {/* Main Message */}
        <h3 className="text-2xl font-bold text-gray-900 mb-3">No Properties Found</h3>
        <p className="text-gray-600 mb-8">
          We couldn't find any properties matching your current filters. Try adjusting your search criteria to find more options.
        </p>

        {/* Suggestions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h4 className="font-semibold text-gray-800 mb-4">Try these suggestions:</h4>
          <ul className="space-y-3 text-left text-gray-600">
            <li className="flex items-center">
              <span className="h-2 w-2 bg-green-500 rounded-full mr-3"></span>
              Expand your price range
            </li>
            <li className="flex items-center">
              <span className="h-2 w-2 bg-green-500 rounded-full mr-3"></span>
              Include more property types
            </li>
            <li className="flex items-center">
              <span className="h-2 w-2 bg-green-500 rounded-full mr-3"></span>
              Try a different location
            </li>
            <li className="flex items-center">
              <span className="h-2 w-2 bg-green-500 rounded-full mr-3"></span>
              Adjust the number of bedrooms/bathrooms
            </li>
          </ul>
        </div>

        {/* Reset Filters Button */}
        <button
          onClick={resetFilters}
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors duration-300"
        >
          Reset All Filters
        </button>
      </div>
    </div>
  );

  const pageNumbers = getPageNumbers();
  const safeTotalPages = Math.max(totalPages, 1);
  const shouldShowPagination = totalProperties > 0;

  // Add this helper function near the top of your component, after other helper functions
  const formatListedDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Listed today';
    } else if (diffDays === 1) {
      return 'Listed yesterday';
    } else if (diffDays < 7) {
      return `Listed ${diffDays} days ago`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `Listed ${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
    } else {
      return `Listed on ${date.toLocaleDateString('en-US', { 
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })}`;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="pt-20 md:pt-20 flex-grow">
        {/* Hero Section with Parallax Effect */}
        <div className="relative h-[55vh] md:h-[60vh] bg-fixed bg-center bg-cover mb-8 overflow-hidden" 
             style={{backgroundImage: 'url(https://images.prismic.io/villaplus/Z-48L3dAxsiBwQXr_3840X1500.jpg)'}}>
          {/* Enhanced gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/60 to-black/45"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/30"></div>
          
          <div className="container mx-auto px-4 h-full flex items-center">
            <div className="relative z-10 max-w-4xl w-full">
              {/* Badge/Tag above heading */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-1.5 mb-3 px-3 py-1 bg-green-500/20 backdrop-blur-sm border border-green-400/30 rounded-full"
              >
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                <span className="text-green-300 text-xs font-medium">Discover Your Dream Home</span>
              </motion.div>

              {/* Enhanced Heading with Gradient */}
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-3 leading-tight"
              >
                <span className="bg-gradient-to-r from-white via-green-50 to-white bg-clip-text text-transparent drop-shadow-2xl">
                  Find Your Perfect
                </span>
                <br />
                <span className="bg-gradient-to-r from-green-400 via-green-300 to-green-400 bg-clip-text text-transparent">
                  Property
                </span>
              </motion.h1>
              
              {/* Enhanced Subtitle */}
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-base md:text-lg text-gray-100 mb-5 font-light leading-relaxed max-w-2xl"
              >
                {getFilterDescription()}
              </motion.p>
              
              {/* Enhanced Search Bar with Modern Glassmorphism */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="bg-white/15 backdrop-blur-xl p-3 md:p-4 rounded-xl border border-white/30 shadow-2xl w-full max-w-4xl hover:bg-white/20 transition-all duration-300"
                style={{
                  boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37), 0 0 0 1px rgba(255, 255, 255, 0.1) inset'
                }}
              >
                <div className="flex flex-col md:flex-row gap-2 md:gap-3">
                  <div className="flex-grow relative">
                    <div className="relative">
                      <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10 text-sm" />
                      <input
                        type="text"
                        placeholder="Search by location, property name, or keyword"
                        className="w-full py-2.5 md:py-3 pl-10 pr-12 rounded-lg bg-white text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 placeholder-gray-400 shadow-lg transition-all duration-300 hover:shadow-xl"
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          handleLocationSearch(e.target.value);
                        }}
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                        {searchQuery && (
                          <button
                            onClick={() => {
                              setSearchQuery('');
                              setSelectedLocation('');
                              setUserLocation(null);
                              setSuggestedLocations([]);
                              setShowSuggestions(false);
                            }}
                            className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-all duration-200"
                          >
                            <FaTimes className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowFilters(!showFilters)}
                    className="bg-gradient-to-r from-green-600 to-green-500 text-white py-2.5 md:py-3 px-6 md:px-8 rounded-lg font-semibold flex items-center justify-center text-sm hover:from-green-700 hover:to-green-600 transition-all duration-300 whitespace-nowrap shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
                  >
                    <FaFilter className="mr-2 text-sm" />
                    {showFilters ? 'Hide Filters' : 'Show Filters'}
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
          
          {/* Decorative blend */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20">
            <div className="absolute inset-x-0 bottom-0 h-16 bg-white/80 blur-xl"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-white via-white/50 to-transparent"></div>
          </div>
        </div>

        <div className="container mx-auto px-4 pb-12">
          {/* Filters Section - Premium Design */}
          {showFilters && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-xl shadow-lg p-4 sm:p-5 md:p-6 mb-6 sm:mb-8 border-t-4 border-green-600"
            >
              <div className="flex justify-between items-center mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Advanced Filters</h2>
                <button 
                  onClick={() => setShowFilters(false)}
                  className="text-gray-500 hover:text-gray-700 p-2 -mr-2 touch-manipulation"
                  aria-label="Close filters"
                >
                  <FaTimes className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
                {/* Column 1: Location & Property Type */}
                <div className="space-y-4 sm:space-y-6">
                  {locationFilterSection}
                  {/* Property Type Filter */}
                  <div className="bg-gray-50 p-3 sm:p-4 rounded-lg border border-gray-100">
                    <div 
                      className="flex justify-between items-center cursor-pointer touch-manipulation"
                      onClick={() => toggleFilterSection('propertyType')}
                    >
                      <h3 className="text-base sm:text-lg font-medium text-gray-800 flex items-center">
                        <span className="w-1.5 h-5 bg-green-600 rounded-full mr-2 flex-shrink-0"></span>
                        <span className="truncate">Property Type</span>
                      </h3>
                      <span className="flex-shrink-0 ml-2">{expandedFilter === 'propertyType' ? <FaChevronUp className="w-4 h-4" /> : <FaChevronDown className="w-4 h-4" />}</span>
                    </div>
                    
                    {expandedFilter === 'propertyType' && (
                      <div className="mt-3 sm:mt-4">
                        <button
                          onClick={() => setActiveFilter('all')}
                          className={`w-full mb-3 px-4 py-2.5 sm:py-2 rounded-lg text-sm transition-all duration-300 touch-manipulation ${
                            activeFilter === 'all' 
                              ? 'bg-green-600 text-white font-medium shadow-md' 
                              : 'bg-white text-gray-700 border border-gray-200 hover:border-green-300'
                          }`}
                        >
                          All Properties
                        </button>

                        {Object.entries(propertyTypeCategories).map(([category, types]) => (
                          <div key={category} className="mb-3 sm:mb-4">
                            <h4 className="text-xs sm:text-sm font-medium text-gray-600 mb-2">{category}</h4>
                            <div className="grid grid-cols-2 gap-2">
                              {types.map((type) => {
                                const normalizedType = normalizePropertyTypeName(type);
                                return (
                                <button
                                  key={type}
                                  onClick={() => setActiveFilter(normalizedType)}
                                  className={`px-3 py-2.5 sm:py-2 rounded-lg text-xs sm:text-sm transition-all duration-300 touch-manipulation ${
                                    activeFilter === normalizedType
                                      ? 'bg-green-600 text-white font-medium shadow-md' 
                                      : 'bg-white text-gray-700 border border-gray-200 hover:border-green-300'
                                  }`}
                                >
                                  {type}
                                </button>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Column 2: Price & Area Filters */}
                <div className="space-y-4 sm:space-y-6">
                  {/* Price Range Filter */}
                  <div className="bg-gray-50 p-3 sm:p-4 rounded-lg border border-gray-100">
                    <div 
                      className="flex justify-between items-center cursor-pointer touch-manipulation"
                      onClick={() => toggleFilterSection('priceRange')}
                    >
                      <h3 className="text-base sm:text-lg font-medium text-gray-800 flex items-center">
                        <span className="w-1.5 h-5 bg-green-600 rounded-full mr-2 flex-shrink-0"></span>
                        <span className="truncate">Price Range</span>
                      </h3>
                      <span className="flex-shrink-0 ml-2">{expandedFilter === 'priceRange' ? <FaChevronUp className="w-4 h-4" /> : <FaChevronDown className="w-4 h-4" />}</span>
                    </div>
                    
                    {expandedFilter === 'priceRange' && (
                      <div className="mt-3 sm:mt-4 px-1 sm:px-2">
                        <div className="flex justify-between text-xs sm:text-sm text-gray-600 mb-2">
                          <span>₹{(priceRange[0]/100000).toFixed(1)}L</span>
                          <span>₹{priceRange[1] >= 10000000 ? `${(priceRange[1]/10000000).toFixed(1)}Cr` : `${(priceRange[1]/100000).toFixed(1)}L`}</span>
                        </div>
                        <div className="relative pt-1">
                          <input
                            type="range"
                            min="100000"
                            max="100000000"
                            step="100000"
                            value={priceRange[1]}
                            onChange={(e) => setPriceRange([100000, parseInt(e.target.value)])}
                            className="w-full h-2 bg-green-100 rounded-lg appearance-none cursor-pointer accent-green-600 touch-manipulation"
                          />
                          <div className="absolute -bottom-5 sm:-bottom-6 left-0 right-0 flex justify-between text-xs text-gray-500">
                            <span>₹1L</span>
                            <span>₹10Cr</span>
                          </div>
                        </div>
                        <div className="mt-6 sm:mt-8 grid grid-cols-2 gap-2">
                          {['Under ₹25L', '₹25L - ₹50L', '₹50L - ₹1Cr', '₹1Cr - ₹2Cr', '₹2Cr - ₹5Cr', '₹5Cr - ₹10Cr'].map((range) => (
                            <button
                              key={range}
                              onClick={() => setPriceRange(getPriceRangeFromString(range))}
                              className={`px-2 sm:px-3 py-2.5 sm:py-2 rounded-lg text-xs sm:text-sm transition-all duration-300 touch-manipulation ${
                                priceRange[1] === getPriceRangeFromString(range)[1]
                                  ? 'bg-green-600 text-white font-medium shadow-md'
                                  : 'bg-white text-gray-700 border border-gray-200 hover:border-green-300'
                              }`}
                            >
                              {range}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Square Feet Filter */}
                  <div className="bg-gray-50 p-3 sm:p-4 rounded-lg border border-gray-100">
                    <div 
                      className="flex justify-between items-center cursor-pointer touch-manipulation"
                      onClick={() => toggleFilterSection('squareFeet')}
                    >
                      <h3 className="text-base sm:text-lg font-medium text-gray-800 flex items-center">
                        <span className="w-1.5 h-5 bg-green-600 rounded-full mr-2 flex-shrink-0"></span>
                        <span className="truncate">Built-up Area (Sq.ft)</span>
                      </h3>
                      <span className="flex-shrink-0 ml-2">{expandedFilter === 'squareFeet' ? <FaChevronUp className="w-4 h-4" /> : <FaChevronDown className="w-4 h-4" />}</span>
                    </div>
                    
                    {expandedFilter === 'squareFeet' && (
                      <div className="mt-3 sm:mt-4 px-1 sm:px-2">
                        <div className="flex justify-between text-xs sm:text-sm text-gray-600 mb-2">
                          <span>{formatAreaNumber(squareFeetRange[0])} sq.ft</span>
                          <span>{formatAreaNumber(squareFeetRange[1])} sq.ft</span>
                        </div>
                        <div className="relative pt-1">
                          <input
                            type="range"
                            min="0"
                            max="10000"
                            step="100"
                            value={squareFeetRange[1]}
                            onChange={(e) => setSquareFeetRange([0, parseInt(e.target.value)])}
                            className="w-full h-2 bg-green-100 rounded-lg appearance-none cursor-pointer accent-green-600 touch-manipulation"
                          />
                        </div>
                        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {['500', '1000', '2000', '3000', '5000', '10000'].map((size) => (
                            <button
                              key={size}
                              onClick={() => setSquareFeetRange([0, parseInt(size)])}
                              className={`px-2 py-2.5 sm:py-1.5 rounded-lg text-xs sm:text-sm transition-all duration-300 touch-manipulation ${
                                squareFeetRange[1] === parseInt(size)
                                  ? 'bg-green-600 text-white font-medium shadow-md'
                                  : 'bg-white text-gray-700 border border-gray-200 hover:border-green-300'
                              }`}
                            >
                              {`< ${formatAreaNumber(parseInt(size))}`}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Cents Filter */}
                  <div className="bg-gray-50 p-3 sm:p-4 rounded-lg border border-gray-100">
                    <div 
                      className="flex justify-between items-center cursor-pointer touch-manipulation"
                      onClick={() => toggleFilterSection('cents')}
                    >
                      <h3 className="text-base sm:text-lg font-medium text-gray-800 flex items-center">
                        <span className="w-1.5 h-5 bg-green-600 rounded-full mr-2 flex-shrink-0"></span>
                        <span className="truncate">Land Area (Cents)</span>
                      </h3>
                      <span className="flex-shrink-0 ml-2">{expandedFilter === 'cents' ? <FaChevronUp className="w-4 h-4" /> : <FaChevronDown className="w-4 h-4" />}</span>
                    </div>
                    
                    {expandedFilter === 'cents' && (
                      <div className="mt-3 sm:mt-4 px-1 sm:px-2">
                        <div className="flex justify-between text-xs sm:text-sm text-gray-600 mb-2">
                          <span>{centsRange[0]} cents</span>
                          <span>{centsRange[1] >= 1000 ? '1000+ cents' : `${centsRange[1]} cents`}</span>
                        </div>
                        <div className="relative pt-1">
                          <input
                            type="range"
                            min="0"
                            max="1000"
                            step="10"
                            value={centsRange[1]}
                            onChange={(e) => setCentsRange([0, parseInt(e.target.value)])}
                            className="w-full h-2 bg-green-100 rounded-lg appearance-none cursor-pointer accent-green-600 touch-manipulation"
                          />
                        </div>
                        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {['25', '50', '100', '500', '750', '1000'].map((size) => (
                            <button
                              key={size}
                              onClick={() => setCentsRange([0, parseInt(size)])}
                              className={`px-2 py-2.5 sm:py-1.5 rounded-lg text-xs sm:text-sm transition-all duration-300 touch-manipulation ${
                                centsRange[1] === parseInt(size)
                                  ? 'bg-green-600 text-white font-medium shadow-md'
                                  : 'bg-white text-gray-700 border border-gray-200 hover:border-green-300'
                              }`}
                            >
                              {size === '1000' ? '1000+' : `< ${size}`}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Column 3: Property Features */}
                <div className="space-y-4 sm:space-y-6">
                  {/* Ownership Filter */}
                  <div className="bg-gray-50 p-3 sm:p-4 rounded-lg border border-gray-100">
                    <div 
                      className="flex justify-between items-center cursor-pointer touch-manipulation"
                      onClick={() => toggleFilterSection('ownership')}
                    >
                      <h3 className="text-base sm:text-lg font-medium text-gray-800 flex items-center">
                        <span className="w-1.5 h-5 bg-green-600 rounded-full mr-2 flex-shrink-0"></span>
                        <span className="truncate">Ownership</span>
                      </h3>
                      <span className="flex-shrink-0 ml-2">{expandedFilter === 'ownership' ? <FaChevronUp className="w-4 h-4" /> : <FaChevronDown className="w-4 h-4" />}</span>
                    </div>
                    
                    {expandedFilter === 'ownership' && (
                      <div className="mt-3 sm:mt-4 flex flex-wrap gap-2">
                        <button
                          onClick={() => setOwnershipFilter('all')}
                          className={`px-3 sm:px-4 py-2.5 sm:py-2 rounded-lg text-xs sm:text-sm transition-all duration-300 touch-manipulation ${
                            ownershipFilter === 'all' 
                              ? 'bg-green-600 text-white font-medium shadow-md' 
                              : 'bg-white text-gray-700 border border-gray-200 hover:border-green-300'
                          }`}
                        >
                          All
                        </button>
                        <button
                          onClick={() => setOwnershipFilter('direct_owner')}
                          className={`px-3 sm:px-4 py-2.5 sm:py-2 rounded-lg text-xs sm:text-sm transition-all duration-300 touch-manipulation ${
                            ownershipFilter === 'direct_owner' 
                              ? 'bg-green-600 text-white font-medium shadow-md' 
                              : 'bg-white text-gray-700 border border-gray-200 hover:border-green-300'
                          }`}
                        >
                          Direct Owner
                        </button>
                        <button
                          onClick={() => setOwnershipFilter('management')}
                          className={`px-3 sm:px-4 py-2.5 sm:py-2 rounded-lg text-xs sm:text-sm transition-all duration-300 touch-manipulation ${
                            ownershipFilter === 'management' 
                              ? 'bg-green-600 text-white font-medium shadow-md' 
                              : 'bg-white text-gray-700 border border-gray-200 hover:border-green-300'
                          }`}
                        >
                          Management
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Listing Type Filter */}
                  <div className="bg-gray-50 p-3 sm:p-4 rounded-lg border border-gray-100">
                    <div 
                      className="flex justify-between items-center cursor-pointer touch-manipulation"
                      onClick={() => toggleFilterSection('listingType')}
                    >
                      <h3 className="text-base sm:text-lg font-medium text-gray-800 flex items-center">
                        <span className="w-1.5 h-5 bg-green-600 rounded-full mr-2 flex-shrink-0"></span>
                        <span className="truncate">Listing Type</span>
                      </h3>
                      <span className="flex-shrink-0 ml-2">{expandedFilter === 'listingType' ? <FaChevronUp className="w-4 h-4" /> : <FaChevronDown className="w-4 h-4" />}</span>
                    </div>
                    
                    {expandedFilter === 'listingType' && (
                      <div className="mt-3 sm:mt-4 flex flex-wrap gap-2">
                        {['all', 'rent', 'sell'].map((type) => (
                          <button
                            key={type}
                            onClick={() => setListingTypeFilter(type)}
                            className={`px-3 sm:px-4 py-2.5 sm:py-2 rounded-lg text-xs sm:text-sm transition-all duration-300 touch-manipulation ${
                              listingTypeFilter === type 
                                ? 'bg-green-600 text-white font-medium shadow-md' 
                                : 'bg-white text-gray-700 border border-gray-200 hover:border-green-300'
                            }`}
                          >
                            {type === 'all' ? 'All' : type === 'rent' ? 'For Rent' :  'For Sale'}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Furnishing Filter */}
                  <div className="bg-gray-50 p-3 sm:p-4 rounded-lg border border-gray-100">
                    <div
                      className="flex justify-between items-center cursor-pointer touch-manipulation"
                      onClick={() => toggleFilterSection('furnishing')}
                    >
                      <h3 className="text-base sm:text-lg font-medium text-gray-800 flex items-center">
                        <span className="w-1.5 h-5 bg-green-600 rounded-full mr-2 flex-shrink-0"></span>
                        <span className="truncate">Furnishing</span>
                      </h3>
                      <span className="flex-shrink-0 ml-2">{expandedFilter === 'furnishing' ? <FaChevronUp className="w-4 h-4" /> : <FaChevronDown className="w-4 h-4" />}</span>
                    </div>

                    {expandedFilter === 'furnishing' && (
                      <div className="mt-3 sm:mt-4 flex flex-wrap gap-2">
                        {[
                          { label: 'All', value: 'all' },
                          { label: 'Furnished', value: 'furnished' },
                          { label: 'Semi-furnished', value: 'semi-furnished' },
                          { label: 'Unfurnished', value: 'unfurnished' },
                        ].map((option) => (
                          <button
                            key={option.value}
                            onClick={() => setFurnishingFilter(option.value)}
                            className={`px-3 sm:px-4 py-2.5 sm:py-2 rounded-lg text-xs sm:text-sm transition-all duration-300 touch-manipulation ${
                              furnishingFilter === option.value
                                ? 'bg-green-600 text-white font-medium shadow-md'
                                : 'bg-white text-gray-700 border border-gray-200 hover:border-green-300'
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Bedrooms Filter */}
                  <div className="bg-gray-50 p-3 sm:p-4 rounded-lg border border-gray-100">
                    <div 
                      className="flex justify-between items-center cursor-pointer touch-manipulation"
                      onClick={() => toggleFilterSection('bedrooms')}
                    >
                      <h3 className="text-base sm:text-lg font-medium text-gray-800 flex items-center">
                        <span className="w-1.5 h-5 bg-green-600 rounded-full mr-2 flex-shrink-0"></span>
                        <span className="truncate">Bedrooms</span>
                      </h3>
                      <span className="flex-shrink-0 ml-2">{expandedFilter === 'bedrooms' ? <FaChevronUp className="w-4 h-4" /> : <FaChevronDown className="w-4 h-4" />}</span>
                    </div>
                    
                    {expandedFilter === 'bedrooms' && (
                      <div className="mt-3 sm:mt-4 flex flex-wrap gap-2">
                        {['any', '1', '2', '3', '4', '5+'].map((num) => (
                          <button
                            key={num}
                            onClick={() => setBedroomsFilter(num)}
                            className={`px-3 sm:px-4 py-2.5 sm:py-2 rounded-lg text-xs sm:text-sm transition-all duration-300 touch-manipulation ${
                              bedroomsFilter === num 
                                ? 'bg-green-600 text-white font-medium shadow-md' 
                                : 'bg-white text-gray-700 border border-gray-200 hover:border-green-300'
                            }`}
                          >
                            {num === 'any' ? 'Any' : num}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Bathrooms Filter */}
                  <div className="bg-gray-50 p-3 sm:p-4 rounded-lg border border-gray-100">
                    <div 
                      className="flex justify-between items-center cursor-pointer touch-manipulation"
                      onClick={() => toggleFilterSection('bathrooms')}
                    >
                      <h3 className="text-base sm:text-lg font-medium text-gray-800 flex items-center">
                        <span className="w-1.5 h-5 bg-green-600 rounded-full mr-2 flex-shrink-0"></span>
                        <span className="truncate">Bathrooms</span>
                      </h3>
                      <span className="flex-shrink-0 ml-2">{expandedFilter === 'bathrooms' ? <FaChevronUp className="w-4 h-4" /> : <FaChevronDown className="w-4 h-4" />}</span>
                    </div>
                    
                    {expandedFilter === 'bathrooms' && (
                      <div className="mt-3 sm:mt-4 flex flex-wrap gap-2">
                        {['any', '1', '2', '3', '4+'].map((num) => (
                          <button
                            key={num}
                            onClick={() => setBathroomsFilter(num)}
                            className={`px-3 sm:px-4 py-2.5 sm:py-2 rounded-lg text-xs sm:text-sm transition-all duration-300 touch-manipulation ${
                              bathroomsFilter === num 
                                ? 'bg-green-600 text-white font-medium shadow-md' 
                                : 'bg-white text-gray-700 border border-gray-200 hover:border-green-300'
                            }`}
                          >
                            {num === 'any' ? 'Any' : num}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Amenities Filter */}
                  <div className="bg-gray-50 p-3 sm:p-4 rounded-lg border border-gray-100">
                    <div 
                      className="flex justify-between items-center cursor-pointer touch-manipulation"
                      onClick={() => toggleFilterSection('amenities')}
                    >
                      <h3 className="text-base sm:text-lg font-medium text-gray-800 flex items-center">
                        <span className="w-1.5 h-5 bg-green-600 rounded-full mr-2 flex-shrink-0"></span>
                        <span className="truncate">Amenities</span>
                      </h3>
                      <span className="flex-shrink-0 ml-2">{expandedFilter === 'amenities' ? <FaChevronUp className="w-4 h-4" /> : <FaChevronDown className="w-4 h-4" />}</span>
                    </div>
                    
                    {expandedFilter === 'amenities' && (
                      <div className="mt-3 sm:mt-4 grid grid-cols-2 gap-2 sm:gap-3">
                        {['Pool', 'Gym', 'Parking', 'Balcony', 'Garden', 'Security', 'Elevator', 'Furnished'].map((amenity) => (
                          <div key={amenity} className="flex items-center touch-manipulation">
                            <input
                              type="checkbox"
                              id={`amenity-${amenity}`}
                              checked={amenitiesFilter.includes(amenity)}
                              onChange={() => toggleAmenity(amenity)}
                              className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 rounded focus:ring-green-500 cursor-pointer"
                            />
                            <label htmlFor={`amenity-${amenity}`} className="ml-2 text-xs sm:text-sm text-gray-700 cursor-pointer">
                              {amenity}
                            </label>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-0 mt-6 sm:mt-8 border-t pt-4 sm:pt-6">
                <button 
                  onClick={resetFilters}
                  className="w-full sm:w-auto px-6 py-3 sm:py-2.5 bg-gray-100 text-gray-700 rounded-lg sm:mr-3 hover:bg-gray-200 transition-all duration-300 touch-manipulation font-medium"
                >
                  Reset All
                </button>
                <button 
                  onClick={() => setShowFilters(false)}
                  className="w-full sm:w-auto px-6 py-3 sm:py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-300 flex items-center justify-center font-medium touch-manipulation"
                >
                  <FaFilter className="mr-2" />
                  Apply Filters
                </button>
              </div>
            </motion.div>
          )}
          
          {/* Listings Header */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-6">
            <div className="mb-4 md:mb-0">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                <span className="w-1.5 h-6 bg-green-600 rounded-full mr-2"></span>
                Premium Properties
              </h2>
              <p className="text-gray-600">
                Showing <span className="font-semibold text-green-600">{currentProperties.length}</span> of{' '}
                <span className="font-semibold">{totalProperties}</span> exclusive listings
              </p>
            </div>
            
            <div className="flex items-center gap-4">

              <div className="hidden md:flex items-center space-x-2 bg-white/80 backdrop-blur-sm p-1 rounded-lg shadow-sm">
                <button 
                  onClick={() => setViewMode('grid')} 
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-green-600 text-white' : 'text-gray-500 hover:bg-gray-100'} transition-all duration-300`}
                >
                  <FaThLarge />
                </button>
                <button 
                  onClick={() => setViewMode('list')} 
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-green-600 text-white' : 'text-gray-500 hover:bg-gray-100'} transition-all duration-300`}
                >
                  <FaThList />
                </button>
              </div>
            </div>
          </div>
          
          {/* Add this before the property listings section */}
          {isInitialLoading ? (
            <div className="text-center py-8">
              <div className="animate-pulse flex flex-col items-center">
                <div className="h-24 w-24 bg-gray-200 rounded-full mb-4"></div>
                <div className="h-4 w-48 bg-gray-200 rounded mb-3"></div>
                <div className="h-3 w-36 bg-gray-200 rounded"></div>
              </div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              <p className="flex items-center">
                <FaTimes className="mr-2" />
                {error}
              </p>
            </div>
          ) : currentProperties.length === 0 ? (
            <NoResultsFound />
          ) : null}
          
          {isInitialLoading ? (
            // Show loading skeleton
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div key={item} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 animate-pulse">
                  <div className="h-56 bg-gray-200"></div>
                  <div className="p-4">
                    <div className="h-6 bg-gray-200 rounded mb-4 w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2 w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded mb-4 w-full"></div>
                    <div className="flex gap-2 mb-4">
                      <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                      <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                      <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                    </div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Show property listings
            <>
              {viewMode === 'list' ? (
                <div className="space-y-6">
                  {currentProperties.map((property) => {
                    const formattedArea = formatPropertyAreaDisplay(property) ?? 'N/A';
                    const showPerMonth = property?.property_for === 'rent';

                    return (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        key={property.id}
                        className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl border border-gray-100 cursor-pointer group relative h-auto lg:h-[320px]"
                        onClick={() => navigate(`/property/${property.id}`)}
                      >
                        {/* Large directions icon in top right corner of container */}
                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            getDirections(e, { google_maps_url: property.google_maps_url });
                          }}
                          className="absolute top-3 right-3 z-10 bg-blue-100 p-3 rounded-full shadow-md hover:bg-blue-200 transition-all duration-300"
                          title="Get directions"
                        >
                          <FaDirections className="text-blue-600 text-2xl" />
                        </button>
                        
                        <div className="flex flex-col lg:flex-row h-full">
                          <div className="relative w-full lg:w-2/5 h-[240px] lg:h-full overflow-hidden">
                            <img
                              src={property.images[0]?.image || 'default-image-url.jpg'}
                              alt={property.title}
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            <div className="absolute top-3 left-3 flex flex-col space-y-2">
                              {/* List View Badge */}
                              <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${
                                property.property_ownership === 'direct_owner'
                                  ? 'bg-gradient-to-r from-green-800 via-green-600 to-green-500 text-white'
                                  : 'bg-gradient-to-r from-green-600 via-green-500 to-green-400 text-white'
                              }`}>
                                <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 animate-shimmer"></span>
                                <span className="relative font-bold">{property.property_ownership === 'direct_owner' ? 'Direct Owner' : 'Management Property'}</span>
                              </span>
                            </div>
                            {/* Price overlay on mobile */}
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 lg:hidden">
                              <h3 className="text-xl font-bold text-white">
                                ₹ {parseFloat(property.price).toLocaleString()}
                                {showPerMonth && <span className="text-sm font-normal text-gray-200 ml-2">/month</span>}
                              </h3>
                            </div>
                          </div>
                          <div className="p-4 lg:p-6 flex flex-col justify-between w-full lg:w-3/5">
                            <div className="flex-grow">
                              {/* Price for desktop */}
                              <div className="hidden lg:flex justify-between items-start mb-2">
                                <h3 className="text-xl lg:text-2xl font-bold text-gray-800">
                                  ₹ {parseFloat(property.price).toLocaleString()}
                                  {showPerMonth && <span className="text-sm font-normal text-gray-500 ml-2">/month</span>}
                                </h3>
                              </div>
                              <div className="flex flex-wrap items-center gap-2 mb-3">
                                <span className="text-xs font-semibold px-2 py-1 rounded-md bg-green-100 text-green-800">
                                  {property.property_for === 'rent' ? 'For Rent' : 'For Sale'}
                                </span>
                                <div className="flex items-center bg-gray-50 px-2 py-1 rounded-full text-sm">
                                  <FaBed className="text-green-500 mr-1" />
                                  <span className="text-gray-700">{property.bedrooms}</span>
                                </div>
                                <div className="flex items-center bg-gray-50 px-2 py-1 rounded-full text-sm">
                                  <FaBath className="text-green-500 mr-1" />
                                  <span className="text-gray-700">{property.bathrooms}</span>
                                </div>
                                <div className="flex items-center bg-gray-50 px-2 py-1 rounded-full text-sm">
                                  <FaRulerCombined className="text-green-500 mr-1" />
                                  <span className="text-gray-700">{formattedArea}</span>
                                </div>
                              </div>
                              <div>
                                <h4 className="text-base lg:text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
                                  {property.title}
                                </h4>
                                <div className="mb-3">
                                  <ExpandableText text={property.description || "No description available"} maxLength={150} />
                                </div>
                                <div className="flex items-start mb-3">
                                  <FaMapMarkerAlt 
                                    className="text-blue-500 mr-2 mt-1 flex-shrink-0 cursor-pointer hover:text-green-700" 
                                    onClick={(e) => getDirections(e, { google_maps_url: property.google_maps_url })}
                                    title="Get directions"
                                  />
                                  <span className="text-gray-600 text-sm line-clamp-1">
                                    {`${capitalizeFirstLetter(property.location?.city)}, ${capitalizeFirstLetter(property.location?.district)}, ${capitalizeFirstLetter(property.location?.state)}`}
                                  </span>
                                </div>
                                {/* Add Listed Date - List View */}
                                <div className="flex items-center text-xs text-gray-500 mt-2">
                                  <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                                  {formatListedDate(property.created_at)}
                                </div>
                              </div>
                            </div>
                            <div className="grid grid-cols-3 gap-2 mt-4">
                              <a 
                                href={`tel:${property.phone_number}`}
                                onClick={(e) => e.stopPropagation()}
                                className="bg-[rgba(76,175,111,0.1)] border border-[#E2E8F0] hover:bg-green-100 text-blue-600 py-2 px-3 rounded-lg flex items-center justify-center transition-all duration-300 text-sm gap-1.5"
                              >
                                <FaPhone />
                                <span>Call</span>
                              </a>
                              <a 
                                href={`https://wa.me/${property.whatsapp_number}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="bg-[rgba(76,175,111,0.1)] border border-[#E2E8F0] hover:bg-green-100 text-green-600 py-2 px-3 rounded-lg flex items-center justify-center transition-all duration-300 text-sm gap-1.5"
                              >
                                <FaWhatsapp />
                                <span>Chat</span>
                              </a>
                              <a 
                                href={`mailto:${property.email}`}
                                onClick={(e) => e.stopPropagation()}
                                className="bg-[rgba(76,175,111,0.1)] border border-[#E2E8F0] hover:bg-green-100 text-red-600 py-2 px-3 rounded-lg flex items-center justify-center transition-all duration-300 text-sm gap-1.5"
                              >
                                <FaEnvelope />
                                <span>Mail</span>
                              </a>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {currentProperties.map((property) => {
                    const formattedArea = formatPropertyAreaDisplay(property) ?? 'N/A';
                    const showPerMonth = property?.property_for === 'rent';

                    return (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        key={property.id}
                        className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl border border-gray-100 cursor-pointer group relative h-[480px]"
                        onClick={() => navigate(`/property/${property.id}`)}
                      >
                        {/* Large directions icon in top right corner of container */}
                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            getDirections(e, { google_maps_url: property.google_maps_url });
                          }}
                          className="absolute top-3 right-3 z-10 bg-green-100 p-3 rounded-full shadow-md hover:bg-green-200 transition-all duration-300"
                          title="Get directions"
                        >
                          <FaDirections className="text-green-600 text-2xl" />
                        </button>
                        
                        <div className="relative h-[220px] overflow-hidden">
                          <img
                            src={property.images[0]?.image || 'default-image-url.jpg'}
                            alt={property.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                          <div className="absolute top-3 left-3 flex flex-col space-y-2">
                            {/* Grid View Badge */}
                            <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${
                              property.property_ownership === 'direct_owner'
                                ? 'bg-gradient-to-r from-green-800 via-green-600 to-green-500 text-white'
                                : 'bg-gradient-to-r from-green-600 via-green-500 to-green-400 text-white'
                            }`}>
                              <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 animate-shimmer"></span>
                              <span className="relative font-bold">{property.property_ownership === 'direct_owner' ? 'Direct Owner' : 'Management Property'}</span>
                            </span>
                          </div>

                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                            <h3 className="text-xl font-bold text-white">
                              ₹ {parseFloat(property.price).toLocaleString()}
                              {showPerMonth && <span className="text-sm font-normal text-gray-200 ml-2">/month</span>}
                            </h3>
                          </div>
                        </div>
                        <div className="p-4 flex flex-col h-[260px]">
                          <div className="flex-grow">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
                                {property.property_for === 'rent' ? 'For Rent' : 'For Sale'}
                              </span>
                            </div>
                            <h4 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
                              {property.title}
                            </h4>
                            <div className="mb-3">
                              <ExpandableText text={property.description || "No description available"} maxLength={150} />
                            </div>
                            <div className="flex flex-wrap items-center gap-2 mb-3">
                              <div className="flex items-center bg-gray-50 px-2 py-1 rounded-full text-sm">
                                <FaBed className="text-green-500 mr-1" />
                                <span className="text-gray-700">{property.bedrooms}</span>
                              </div>
                              <div className="flex items-center bg-gray-50 px-2 py-1 rounded-full text-sm">
                                <FaBath className="text-green-500 mr-1" />
                                <span className="text-gray-700">{property.bathrooms}</span>
                              </div>
                              <div className="flex items-center bg-gray-50 px-2 py-1 rounded-full text-sm">
                                <FaRulerCombined className="text-green-500 mr-1" />
                                <span className="text-gray-700">{formattedArea}</span>
                              </div>
                            </div>
                            <div className="mb-3">
                              <div className="flex items-start">
                                <FaMapMarkerAlt 
                                  className="text-green-500 mr-2 mt-1 flex-shrink-0 cursor-pointer hover:text-green-700 text-lg" 
                                  onClick={(e) => getDirections(e, { google_maps_url: property.google_maps_url })}
                                  title="Get directions"
                                />
                                <span className="text-gray-600 text-sm line-clamp-2">
                                  {`${capitalizeFirstLetter(property.location?.city)}, ${capitalizeFirstLetter(property.location?.district)}, ${capitalizeFirstLetter(property.location?.state)}`}
                                </span>
                              </div>
                              {/* Add Listed Date - Grid View */}
                              <div className="flex items-center text-xs text-gray-500 mt-2">
                                <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                                {formatListedDate(property.created_at)}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2 mt-auto">
                            <a 
                              href={`tel:${property.phone_number}`}
                              onClick={(e) => e.stopPropagation()}
                              className="flex-1 bg-white border border-green-500 hover:bg-green-50 text-green-600 py-1.5 px-2 rounded-lg flex items-center justify-center transition-all duration-300 text-sm gap-1.5"
                            >
                              <FaPhone />
                              <span>Call</span>
                            </a>
                            <a 
                              href={`https://wa.me/${property.whatsapp_number}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="flex-1 bg-white border border-green-500 hover:bg-green-50 text-green-600 py-1.5 px-2 rounded-lg flex items-center justify-center transition-all duration-300 text-sm gap-1.5"
                            >
                              <FaWhatsapp />
                              <span>Chat</span>
                            </a>
                            <a 
                              href={`mailto:${property.email}`}
                              onClick={(e) => e.stopPropagation()}
                              className="flex-1 bg-white border border-green-500 hover:bg-green-50 text-green-600 py-1.5 px-2 rounded-lg flex items-center justify-center transition-all duration-300 text-sm gap-1.5"
                            >
                              <FaEnvelope />
                              <span>Mail</span>
                            </a>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </>
          )}
          
          {/* Loading State */}
          {isLoading && !isInitialLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div key={item} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 animate-pulse">
                  <div className="h-56 bg-gray-200"></div>
                  <div className="p-4">
                    <div className="h-6 bg-gray-200 rounded mb-4 w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2 w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded mb-4 w-full"></div>
                    <div className="flex gap-2 mb-4">
                      <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                      <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                      <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                    </div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Pagination */}
          {shouldShowPagination && (
            <div className="mt-12 w-full flex flex-col items-center gap-4 lg:flex-row lg:justify-between">
              <div className="flex flex-col items-center gap-3 lg:flex-row lg:gap-4">
                <span className="text-sm text-gray-600">
                  Page {Math.min(currentPage, safeTotalPages)} of {safeTotalPages}
                </span>
                <nav className="flex flex-wrap items-center justify-center gap-2">
                  {/* Previous Page Button */}
                  <button 
                    onClick={() => currentPage > 1 && !isLoading && paginate(currentPage - 1)}
                    disabled={currentPage === 1 || isLoading}
                    className={`p-2 rounded-lg border ${
                      currentPage === 1 || isLoading
                        ? 'border-gray-200 text-gray-400 cursor-not-allowed' 
                        : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                    } transition-all duration-300`}
                  >
                    <FaChevronLeft />
                  </button>

                  {/* First Page */}
                  {pageNumbers[0] > 1 && (
                    <>
                      <button
                        onClick={() => paginate(1)}
                        className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 
                          ${currentPage === 1 
                            ? 'bg-green-600 text-white font-medium' 
                            : 'border border-gray-300 text-gray-600 hover:bg-gray-50'}`}
                      >
                        1
                      </button>
                      {pageNumbers[0] > 2 && (
                        <span className="px-2 text-gray-500">...</span>
                      )}
                    </>
                  )}

                  {/* Page Numbers */}
                  {pageNumbers.map((number) => (
                    <button
                      key={number}
                      onClick={() => !isLoading && paginate(number)}
                      className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 
                        ${currentPage === number 
                          ? 'bg-green-600 text-white font-medium' 
                          : 'border border-gray-300 text-gray-600 hover:bg-gray-50'}`}
                    >
                      {number}
                    </button>
                  ))}

                  {/* Last Page */}
                  {pageNumbers[pageNumbers.length - 1] < totalPages && (
                    <>
                      {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
                        <span className="px-2 text-gray-500">...</span>
                      )}
                      <button
                        onClick={() => !isLoading && paginate(totalPages)}
                        className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 
                          ${currentPage === totalPages 
                            ? 'bg-green-600 text-white font-medium' 
                            : 'border border-gray-300 text-gray-600 hover:bg-gray-50'}`}
                      >
                        {totalPages}
                      </button>
                    </>
                  )}

                  {/* Next Page Button */}
                  <button 
                    onClick={() => currentPage < totalPages && !isLoading && paginate(currentPage + 1)}
                    disabled={currentPage === totalPages || isLoading}
                    className={`p-2 rounded-lg border ${
                      currentPage === totalPages || isLoading
                        ? 'border-gray-200 text-gray-400 cursor-not-allowed' 
                        : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                    } transition-all duration-300`}
                  >
                    <FaChevronRight />
                  </button>
                </nav>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">Show</span>
                <select
                  value={itemsPerPage}
                  onChange={handlePageSizeChange}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {PAGE_SIZE_OPTIONS.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
                <span className="text-sm text-gray-600">per page</span>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
      {showLocationPrompt && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold mb-4">Enable Location Services</h3>
            <p className="text-gray-600 mb-6">
              To sort properties by distance, we need your current location. Would you like to enable location services?
            </p>
            <div className="flex gap-4">
              <button
                onClick={handleLocationPermission}
                className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Enable Location
              </button>
              <button
                onClick={() => {
                  setShowLocationPrompt(false);
                  setSortOption('newest');
                }}
                className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyListing;






