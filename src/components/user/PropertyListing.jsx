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
import { motion, AnimatePresence } from 'framer-motion';
import { propertyAPI } from '../../Services/api';

// Add Fuse.js for fuzzy search
import Fuse from 'fuse.js';
import ExpandableText from '../shared/ExpandableText';

const PropertyListing = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  
  // Get search parameters from URL with proper parsing
  const searchLocation = searchParams.get('search') || '';
  const searchType = searchParams.get('type') || 'all';
  const searchPropertyType = searchParams.get('propertyType') || 'all';
  const searchCategory = searchParams.get('category') ? decodeURIComponent(searchParams.get('category')) : 'all';
  const bedroomsParamFromUrl = searchParams.get('bedrooms_min');
  const searchBedrooms = useMemo(() => {
    if (!bedroomsParamFromUrl) return 'any';
    const parsed = parseInt(bedroomsParamFromUrl, 10);
    if (Number.isNaN(parsed)) return 'any';
    if (parsed >= 5) return '5+';
    return parsed.toString();
  }, [bedroomsParamFromUrl]);
  const bathroomsParamFromUrl = searchParams.get('bathrooms_min');
  const searchBathrooms = useMemo(() => {
    if (!bathroomsParamFromUrl) return 'any';
    const parsed = parseInt(bathroomsParamFromUrl, 10);
    if (Number.isNaN(parsed)) return 'any';
    if (parsed >= 4) return '4+';
    return parsed.toString();
  }, [bathroomsParamFromUrl]);
  const legacyPriceParam = searchParams.get('price');
  const priceMinParam = searchParams.get('price_min');
  const priceMaxParam = searchParams.get('price_max');
  const searchPriceRange = useMemo(() => {
    if (legacyPriceParam && legacyPriceParam.includes(',')) {
      const [legacyMin, legacyMax] = legacyPriceParam.split(',');
      const parsedLegacyMin = parseInt(legacyMin, 10);
      const parsedLegacyMax = parseInt(legacyMax, 10);
      return [
        Number.isNaN(parsedLegacyMin) ? 0 : parsedLegacyMin,
        Number.isNaN(parsedLegacyMax) ? 1000000000 : parsedLegacyMax
      ];
    }
    const parsedMin = priceMinParam ? parseInt(priceMinParam, 10) : 0;
    const parsedMax = priceMaxParam ? parseInt(priceMaxParam, 10) : 1000000000;
    return [
      Number.isNaN(parsedMin) ? 0 : parsedMin,
      Number.isNaN(parsedMax) ? 1000000000 : parsedMax
    ];
  }, [legacyPriceParam, priceMinParam, priceMaxParam]);
  const areaUnitParam = searchParams.get('area_unit');
  const areaMinParam = searchParams.get('area_min');
  const areaMaxParam = searchParams.get('area_max');
  const searchSqft = searchParams.get('sqft') || 'Square Feet';
  const searchCents = searchParams.get('cents') || 'Any';
  const searchLat = searchParams.get('lat') || '';
  const searchLng = searchParams.get('lng') || '';

  // Parse price range from the price string
  const getPriceRangeFromString = (priceStr) => {
    const priceRanges = {
      'Under ₹25L': [100000, 2500000],
      '₹25L - ₹50L': [2500000, 5000000],
      '₹50L - ₹1Cr': [5000000, 10000000],
      '₹1Cr - ₹2Cr': [10000000, 20000000],
      '₹2Cr - ₹5Cr': [20000000, 50000000],
      '₹5Cr - ₹10Cr': [50000000, 100000000],
      'Under ₹50L': [100000, 5000000],
      'Above ₹5Cr': [50000000, 1000000000],
      'Price (INR)': [0, 1000000000] // Default range - very wide
    };
    return priceRanges[priceStr] || priceRanges['Price (INR)'];
  };

  // Parse square feet range from the banner
  const getSquareFeetRangeFromString = (sqftStr) => {
    const sqftRanges = {
      'Any Sq.ft': [0, 100000],
      '0-500': [0, 500],
      '500-1000': [500, 1000],
      '1000-2000': [1000, 2000],
      '2000-5000': [2000, 5000],
      '5000-10000': [5000, 10000],
      '10000+': [10000, 100000],
      'Square Feet': [0, 100000]
    };
    return sqftRanges[sqftStr] || sqftRanges['Any Sq.ft'];
  };

  // Parse cents range from the banner
  const getCentsRangeFromString = (centsStr) => {
    const centsRanges = {
      'Any Cents': [0, 10000],
      '0-5': [0, 5],
      '5-10': [5, 10],
      '10-20': [10, 20],
      '20-50': [20, 50],
      '50-100': [50, 100],
      '100+': [100, 10000]
    };
    return centsRanges[centsStr] || centsRanges['Any Cents'];
  };

  // Initialize state with URL parameters
  const [viewMode, setViewMode] = useState('list');
  const [favorites, setFavorites] = useState({});
  const [activeFilter, setActiveFilter] = useState(() => {
    // Priority: category parameter from dropdown > propertyType parameter
    let initialFilter;
    if (searchCategory && searchCategory !== 'all') {
      initialFilter = searchCategory.toLowerCase();
    } else if (searchPropertyType && searchPropertyType !== 'all') {
      initialFilter = searchPropertyType.toLowerCase();
    } else {
      initialFilter = 'all';
    }
    
    return initialFilter;
  });

  // Update activeFilter when URL parameters change
  useEffect(() => {
    let newFilter;
    if (searchCategory && searchCategory !== 'all') {
      newFilter = searchCategory.toLowerCase();
    } else if (searchPropertyType && searchPropertyType !== 'all') {
      newFilter = searchPropertyType.toLowerCase();
    } else {
      newFilter = 'all';
    }
    
    setActiveFilter(newFilter);
  }, [searchCategory, searchPropertyType]);

  const [priceRange, setPriceRange] = useState(() => searchPriceRange || [0, 1000000000]);
  const [searchQuery, setSearchQuery] = useState(searchLocation);
  const [pendingSearch, setPendingSearch] = useState(searchLocation);
  const [showFilters, setShowFilters] = useState(false);
  const [sortOption, setSortOption] = useState('newest');
  const [isLoading, setIsLoading] = useState(false);
  const [ownershipFilter, setOwnershipFilter] = useState('all');
  const [listingTypeFilter, setListingTypeFilter] = useState(searchType);
  const [distanceRange, setDistanceRange] = useState(25);
  const [userLocation, setUserLocation] = useState(searchLat && searchLng ? { lat: parseFloat(searchLat), lng: parseFloat(searchLng) } : null);
  const [expandedFilter, setExpandedFilter] = useState(null);
  const [bedroomsFilter, setBedroomsFilter] = useState(searchBedrooms);
  const [bathroomsFilter, setBathroomsFilter] = useState(searchBathrooms);
  const [amenitiesFilter, setAmenitiesFilter] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState(searchCategory);
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [error, setError] = useState(null);
  const [squareFeetRange, setSquareFeetRange] = useState(() => {
    if (areaUnitParam === 'sqft' && areaMaxParam) {
      const parsedMax = parseInt(areaMaxParam, 10);
      return [0, Number.isNaN(parsedMax) ? 100000 : parsedMax];
    }
    if (searchSqft !== 'Square Feet') {
      return getSquareFeetRangeFromString(searchSqft);
    }
    return [0, 100000];
  });
  const [centsRange, setCentsRange] = useState(() => {
    if (areaUnitParam === 'cent' && areaMinParam) {
      const parsedMin = parseInt(areaMinParam, 10);
      return [Number.isNaN(parsedMin) ? 0 : parsedMin, 1000];
    }
    if (searchCents !== 'Any') {
      const [minValue, maxValue] = getCentsRangeFromString(searchCents);
      return [minValue, Math.min(maxValue, 1000)];
    }
    return [0, 1000];
  });

  const applyPriceRangeState = useCallback((min, max) => {
    setPriceRange(prevRange =>
      prevRange[0] === min && prevRange[1] === max ? prevRange : [min, max]
    );
  }, []);

  const applySquareFeetRangeState = useCallback((min, max) => {
    setSquareFeetRange(prevRange =>
      prevRange[0] === min && prevRange[1] === max ? prevRange : [min, max]
    );
  }, []);

  const applyCentsRangeState = useCallback((min, max) => {
    setCentsRange(prevRange =>
      prevRange[0] === min && prevRange[1] === max ? prevRange : [min, max]
    );
  }, []);

  const isScrollingRef = useRef(false);
  const scrollAnimationFrameRef = useRef(null);

  const smoothScrollTo = useCallback((targetY = 0, duration = 600) => {
    if (typeof window === 'undefined') return;
    if (isScrollingRef.current && scrollAnimationFrameRef.current) {
      cancelAnimationFrame(scrollAnimationFrameRef.current);
      scrollAnimationFrameRef.current = null;
    }

    const startY = window.scrollY || window.pageYOffset;
    const distance = targetY - startY;
    const startTime = performance.now();

    const easeInOutCubic = (t) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    isScrollingRef.current = true;

    const step = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(1, elapsed / duration);
      const easedProgress = easeInOutCubic(progress);
      window.scrollTo(0, startY + distance * easedProgress);

      if (progress < 1) {
        scrollAnimationFrameRef.current = requestAnimationFrame(step);
      } else {
        isScrollingRef.current = false;
        scrollAnimationFrameRef.current = null;
      }
    };

    scrollAnimationFrameRef.current = requestAnimationFrame(step);
  }, []);
  const [currentPage, setCurrentPage] = useState(1);
  const lastRequestedPageRef = useRef(1);
  const initialPageSize = (() => {
    const pageSizeParam = searchParams.get('page_size');
    const parsed = pageSizeParam ? parseInt(pageSizeParam, 10) : 10;
    const validSizes = [5, 10, 15, 20, 50];
    return validSizes.includes(parsed) ? parsed : 10;
  })();
  const [itemsPerPage, setItemsPerPage] = useState(initialPageSize);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);
  const [isApiPaginated, setIsApiPaginated] = useState(false);
const [isPageTransitioning, setIsPageTransitioning] = useState(false);
const previousFiltersSignatureRef = useRef(null);
const suppressPageSyncRef = useRef(false);
const initialLoadRef = useRef(true);
const lastRequestedSignatureRef = useRef(null);
const shouldScrollToTopRef = useRef(false);

  // Property types state
  const [propertyTypes, setPropertyTypes] = useState([]);
  const [propertyTypesLoading, setPropertyTypesLoading] = useState(true);

  // Group property types by category dynamically
  const propertyTypeCategories = useMemo(() => {
    if (propertyTypesLoading || propertyTypes.length === 0) {
      return {
        'Land Properties': [],
        'Buildings': []
      };
    }
    
    return {
      'Land Properties': propertyTypes.filter(type => 
        type.name.toLowerCase().includes('land')
      ).map(type => type.name),
      'Buildings': propertyTypes.filter(type => 
        !type.name.toLowerCase().includes('land')
      ).map(type => type.name)
    };
  }, [propertyTypes, propertyTypesLoading]);

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

  // Function to handle filter changes and update URL
  const handleFilterChange = (filterType, value) => {
    const currentParams = new URLSearchParams(location.search);
    
    switch (filterType) {
      case 'category':
        if (value && value !== 'all') {
          currentParams.set('category', encodeURIComponent(value.toLowerCase()));
        } else {
          currentParams.delete('category');
        }
        break;
      case 'type':
        if (value && value !== 'all') {
          currentParams.set('type', value);
        } else {
          currentParams.delete('type');
        }
        break;
      case 'location':
        if (value) {
          currentParams.set('search', value);
        } else {
          currentParams.delete('search');
        }
        break;
      default:
        break;
    }
    
    // Update the URL without reloading the page
    const newUrl = `${location.pathname}?${currentParams.toString()}`;
    navigate(newUrl, { replace: true });
  };

  // Replace mockProperties with real properties state
  const [properties, setProperties] = useState([]);
  
  // Helper function to get property type ID from name
  const getPropertyTypeId = (propertyTypeName) => {
    if (!propertyTypeName || propertyTypeName === 'all') return null;
    const propertyType = propertyTypes.find(
      pt => pt.name.toLowerCase().trim() === propertyTypeName.toLowerCase().trim()
    );
    return propertyType?.id || null;
  };

  // Build query parameters from filters
  const buildQueryParams = useCallback(() => {
    const params = {};
    
    // Pagination
    params.page = currentPage;
    params.page_size = itemsPerPage;
    
    // Price filters
    if (!(priceRange[0] === 0 && priceRange[1] === 1000000000)) {
      if (priceRange[0] > 0) {
        params.price_min = priceRange[0];
      }
      if (priceRange[1] < 1000000000) {
        params.price_max = priceRange[1];
      }
    }
    
    // Property type - convert name to ID
    if (activeFilter && activeFilter !== 'all') {
      const propertyTypeId = getPropertyTypeId(activeFilter);
      if (propertyTypeId) {
        params.property_type = propertyTypeId;
      }
    }
    
    // Bedrooms filter
    if (bedroomsFilter && bedroomsFilter !== 'any') {
      if (bedroomsFilter === '5+') {
        params.bedrooms_min = 5;
      } else {
        const beds = parseInt(bedroomsFilter);
        if (!isNaN(beds)) {
          params.bedrooms_min = beds;
        }
      }
    }
    
    // Bathrooms filter
    if (bathroomsFilter && bathroomsFilter !== 'any') {
      if (bathroomsFilter === '4+') {
        params.bathrooms_min = 4;
      } else {
        const baths = parseInt(bathroomsFilter);
        if (!isNaN(baths)) {
          params.bathrooms_min = baths;
        }
      }
    }
    
    // Ownership filter
    if (ownershipFilter && ownershipFilter !== 'all') {
      params.ownership = ownershipFilter;
    }
    
    // Area filters - prioritize built-up area (sqft) over land area (cent)
    const isSquareFeetActive = squareFeetRange[1] > 0 && squareFeetRange[1] < 100000;
    const isCentsActive = centsRange[0] > 0;
    if (isSquareFeetActive) {
      params.area_max = squareFeetRange[1];
      params.area_unit = 'sqft';
    } else if (isCentsActive) {
      params.area_min = centsRange[0];
      params.area_unit = 'cent';
    }
    
    // Location search
    const trimmedSearch = searchQuery?.trim();
    if (trimmedSearch) {
      params.search = trimmedSearch;
    }
    
    // Property for (rent/sell) - map 'buy' to 'sell'
    if (listingTypeFilter && listingTypeFilter !== 'all') {
      if (listingTypeFilter === 'buy' || listingTypeFilter === 'sell') {
        params.property_for = 'sell';
      } else if (listingTypeFilter === 'rent') {
        params.property_for = 'rent';
      }
    }
    
    return params;
  }, [
    currentPage,
    itemsPerPage,
    priceRange,
    activeFilter,
    bedroomsFilter,
    bathroomsFilter,
    ownershipFilter,
    squareFeetRange,
    centsRange,
    searchQuery,
    listingTypeFilter,
    propertyTypes
  ]);

  const baseFilterParams = useMemo(() => {
    const params = buildQueryParams();
    const { page: _ignoredPage, ...rest } = params || {};
    return JSON.parse(JSON.stringify(rest || {}));
  }, [buildQueryParams]);

  const filtersSignature = useMemo(
    () => JSON.stringify(baseFilterParams),
    [baseFilterParams]
  );

  const fetchParams = useMemo(
    () => ({
      ...baseFilterParams,
      page: currentPage
    }),
    [baseFilterParams, currentPage]
  );

  useEffect(() => {
    if (previousFiltersSignatureRef.current === null) {
      previousFiltersSignatureRef.current = filtersSignature;
      return;
    }

    if (previousFiltersSignatureRef.current !== filtersSignature) {
      previousFiltersSignatureRef.current = filtersSignature;
      suppressPageSyncRef.current = true;
      shouldScrollToTopRef.current = true;
      setCurrentPage(1);
    }
  }, [filtersSignature]);

  // Fetch properties from API with filters and pagination
  useEffect(() => {
    const fetchProperties = async () => {
      let shouldHideSkeleton = false;
      let shouldStopPageTransition = false;
      try {
        const previousSignature = lastRequestedSignatureRef.current;
        const previousPage = lastRequestedPageRef.current;
        const currentSignature = filtersSignature;
        const isFilterChange = previousSignature !== null && previousSignature !== currentSignature;
        const isPageChange = previousPage !== undefined && previousPage !== currentPage;

        if (initialLoadRef.current) {
          setIsInitialLoading(true);
          shouldHideSkeleton = true;
        } else if (isFilterChange || isPageChange) {
          setIsPageTransitioning(true);
          shouldStopPageTransition = true;
        }

        setError(null);

        lastRequestedSignatureRef.current = currentSignature;
        lastRequestedPageRef.current = currentPage;

        setError(null);

        const response = await propertyAPI.getAllProperties(fetchParams);

        if (response?.error === 'invalid-page') {
          if (currentPage !== 1) {
            suppressPageSyncRef.current = true;
            shouldScrollToTopRef.current = true;
            setCurrentPage(1);
          }
          setIsApiPaginated(false);
          setProperties([]);
          setTotalCount(0);
          setHasNextPage(false);
          setHasPreviousPage(false);
          setIsInitialLoading(false);
          return;
        }
        
        // Handle paginated response
        if (response && response.results) {
          const resultsArray = Array.isArray(response.results) ? response.results : [];
          setProperties(resultsArray);
          const responseCount = typeof response.count === 'number' ? response.count : resultsArray.length;
          setTotalCount(responseCount);
          setHasNextPage(!!response.next);
          setHasPreviousPage(!!response.previous);
          setIsApiPaginated(true);
        } else {
          // Fallback for non-paginated response
          const data = Array.isArray(response) ? response : (response?.data || []);
          setProperties(data);
          setTotalCount(data.length);
          setHasNextPage(false);
          setHasPreviousPage(false);
          setIsApiPaginated(false);
        }
      } catch (err) {
        console.error('Error fetching properties:', err);
        setProperties([]);
        setTotalCount(0);
        setHasNextPage(false);
        setHasPreviousPage(false);
        setIsApiPaginated(false);
        setError('Failed to fetch properties. Please try again later.');
      } finally {
        if (initialLoadRef.current) {
          setIsInitialLoading(false);
          initialLoadRef.current = false;
        } else if (shouldHideSkeleton) {
          setIsInitialLoading(false);
        }
        if (shouldStopPageTransition) {
          setIsPageTransitioning(false);
        }
      }
    };

    fetchProperties();
  }, [fetchParams, filtersSignature, currentPage]);

  // Fetch property types from API
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

  // Create a function to normalize text for comparison
  const normalizeText = (text) => {
    return text.toLowerCase().replace(/\s+/g, ' ').trim();
  };

  // Helper function to extract numeric value from price text
  const extractPriceValue = (priceText) => {
    if (!priceText) return 0;
    
    // Remove currency symbols and spaces
    const cleanPrice = priceText.toString().replace(/[₹,\s]/g, '').toLowerCase();
    
    // Handle different formats
    if (cleanPrice.includes('lakh') || cleanPrice.includes('l')) {
      const num = parseFloat(cleanPrice.replace(/[^\d.]/g, '')) || 0;
      return num * 100000; // Convert lakh to actual number
    } else if (cleanPrice.includes('crore') || cleanPrice.includes('cr')) {
      const num = parseFloat(cleanPrice.replace(/[^\d.]/g, '')) || 0;
      return num * 10000000; // Convert crore to actual number
    } else {
      // Try to parse as regular number
      return parseFloat(cleanPrice) || 0;
    }
  };

  // Helper function to get property type from property data
  const getPropertyType = (property) => {
    // Primary: Check property_type_details.name (API structure)
    if (property.property_type_details && property.property_type_details.name) {
      return property.property_type_details.name.trim();
    }
    
    // Fallback: Try other possible fields
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
    
    return 'Unknown';
  };

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
    setPendingSearch(searchValue);
    
    const trimmedValue = searchValue.trim();
    if (trimmedValue.length < 2) {
      setSuggestedLocations([]);
      setShowSuggestions(false);
      return;
    }

    const uniqueLocations = getUniqueLocations(properties);
    const fuse = initializeFuseSearch(uniqueLocations.map(loc => ({ location: loc })));
    const results = fuse.search(trimmedValue);
    
    // Get top 5 suggestions
    const suggestions = results
      .slice(0, 5)
      .map(result => result.item.location);
    
    setSuggestedLocations(suggestions);
    setShowSuggestions(true);
  };

  // Function to handle suggestion selection
  const handleSuggestionSelect = (suggestion) => {
    setPendingSearch(suggestion);
    setShowSuggestions(false);
    setSuggestedLocations([]);
  };

  const applySearch = useCallback(() => {
    const trimmedSearch = pendingSearch.trim();
    setSearchQuery(trimmedSearch);
    setPendingSearch(trimmedSearch);
    setShowSuggestions(false);
    setSuggestedLocations([]);
  }, [pendingSearch]);

  // Add helper function to format area numbers
  const formatAreaNumber = (number) => {
    if (number >= 10000) {
      return `${(number / 1000).toFixed(1)}K`;
    }
    return number.toString();
  };

  // Helper function to check if property is Land type
  const isLandProperty = (property) => {
    const propertyType = getPropertyType(property).toLowerCase();
    return propertyType === 'land' || propertyType.includes('land');
  };

  // Helper function to format area with correct unit
  const formatAreaWithUnit = (property) => {
    const area = property.area;
    if (!area || area === '' || area === '0') return null;
    
    if (isLandProperty(property)) {
      return `${area} cents`;
    } else {
      return `${area} sqft`;
    }
  };

  // Update filteredProperties to include area filters
  // Properties are now filtered by API, so we use them directly
  const filteredProperties = useMemo(() => {
    // API handles all filtering, so we just return the properties as-is
    return properties || [];
  }, [properties]);

  // Legacy filter code removed - API handles filtering now
  // Removed client-side filtering as API now handles all filtering

  const sortedProperties = useMemo(() => {
    let sorted = [...filteredProperties];
    
    switch (sortOption) {
      case 'price-asc':
        sorted.sort((a, b) => extractPriceValue(a.price) - extractPriceValue(b.price));
        break;
      case 'price-desc':
        sorted.sort((a, b) => extractPriceValue(b.price) - extractPriceValue(a.price));
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

  // Sync pending search with applied search when URL parameter changes
  useEffect(() => {
    setSearchQuery(searchLocation);
    setPendingSearch(searchLocation);
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
        (error) => {}
      );
    }
  }, []);

  // Parse URL query parameters
  const parseQueryParams = useCallback(() => {
    try {
      // Safely get search params
      const searchParams = new URLSearchParams(location?.search || '');
      
      // Safely extract parameters with null checks
      const type = searchParams.get('type') || null;
      const category = searchParams.get('category') || null;
      const propertyType = searchParams.get('propertyType') || null;
      const locationParam = searchParams.get('search') || null;
      const price = searchParams.get('price') || null;
      const priceMin = searchParams.get('price_min') || null;
      const priceMax = searchParams.get('price_max') || null;
      const areaUnit = searchParams.get('area_unit') || null;
      const areaMin = searchParams.get('area_min') || null;
      const areaMax = searchParams.get('area_max') || null;
      const sqft = searchParams.get('sqft') || null;
      const cents = searchParams.get('cents') || null;
      const lat = searchParams.get('lat') || null;
      const lng = searchParams.get('lng') || null;
      const pageSizeParam = searchParams.get('page_size') || null;
      const bedroomsMinParam = searchParams.get('bedrooms_min') || null;
      const bathroomsMinParam = searchParams.get('bathrooms_min') || null;
      const pageParam = searchParams.get('page') || null;
      

      
      // Set listing type filter based on URL parameter
      if (type === 'rent') {
        setListingTypeFilter('rent');
      } else if (type === 'buy') {
        setListingTypeFilter('buy'); // Banner sends 'buy', we'll map it to 'sell' in filtering
      } else if (type === 'sell') {
        setListingTypeFilter('sell');
      }
      
      // Set property type filter based on URL parameter
      // Priority: category parameter from dropdown > propertyType parameter
      if (category && category !== 'all') {
        // Category parameter from dropdown (e.g., 'apartments', 'villas', etc.)
        const categoryFilter = category.toLowerCase();
        setActiveFilter(categoryFilter);

      } else if (propertyType && propertyType.toLowerCase() !== 'all') {
        // PropertyType parameter from other sources
        const propertyTypeFilter = propertyType.toLowerCase();
        setActiveFilter(propertyTypeFilter);
      } else {
        // If no property type is specified, set to 'all' to show all property types
        setActiveFilter('all');
        
      }
      
      // Set location search
      const normalizedLocation = locationParam || '';
      setSearchQuery(normalizedLocation);
      setPendingSearch(normalizedLocation);
      
      // Set price range
      if (priceMin || priceMax) {
        const parsedMin = priceMin ? parseInt(priceMin, 10) : 0;
        const parsedMax = priceMax ? parseInt(priceMax, 10) : 1000000000;
        const normalizedMin = Number.isNaN(parsedMin) ? 0 : parsedMin;
        const normalizedMax = Number.isNaN(parsedMax) ? 1000000000 : parsedMax;
        applyPriceRangeState(normalizedMin, normalizedMax);
      } else if (price && price.includes(',')) {
        const [minStr, maxStr] = price.split(',');
        const min = parseInt(minStr, 10);
        const max = parseInt(maxStr, 10);
        if (!Number.isNaN(min) && !Number.isNaN(max)) {
          applyPriceRangeState(min, max);
        } else {
          applyPriceRangeState(0, 1000000000);
        }
      } else {
        applyPriceRangeState(0, 1000000000);
      }
      
      // Set area filters
      if (areaUnit === 'sqft' && areaMax) {
        const parsedAreaMax = parseInt(areaMax, 10);
        if (!Number.isNaN(parsedAreaMax)) {
          applySquareFeetRangeState(0, parsedAreaMax);
          applyCentsRangeState(0, 1000);
        }
      } else if (areaUnit === 'cent' && areaMin) {
        const parsedAreaMin = parseInt(areaMin, 10);
        if (!Number.isNaN(parsedAreaMin)) {
          applyCentsRangeState(parsedAreaMin, 1000);
          applySquareFeetRangeState(0, 100000);
        }
      } else {
        if (sqft && sqft !== 'Square Feet') {
          const [sqftMin, sqftMax] = getSquareFeetRangeFromString(sqft);
          applySquareFeetRangeState(sqftMin, sqftMax);
        } else {
          applySquareFeetRangeState(0, 100000);
        }
        if (cents && cents !== 'Any') {
          const [minValue, maxValue] = getCentsRangeFromString(cents);
          applyCentsRangeState(minValue, Math.min(maxValue, 1000));
        } else {
          applyCentsRangeState(0, 1000);
        }
      }
      
      // Set user location if coordinates provided
      if (lat && lng) {
        try {
          const latFloat = parseFloat(lat);
          const lngFloat = parseFloat(lng);
          if (!isNaN(latFloat) && !isNaN(lngFloat)) {
            setUserLocation({ lat: latFloat, lng: lngFloat });
          }
        } catch (error) {
          console.error('Error parsing coordinates:', error);
        }
      }
      
      if (pageSizeParam) {
        const parsedPageSize = parseInt(pageSizeParam, 10);
        const allowedSizes = [5, 10, 15, 20, 50];
        if (allowedSizes.includes(parsedPageSize)) {
          setItemsPerPage(parsedPageSize);
        }
      }
      
      if (bedroomsMinParam) {
        const parsedBedrooms = parseInt(bedroomsMinParam, 10);
        if (!Number.isNaN(parsedBedrooms)) {
          setBedroomsFilter(parsedBedrooms >= 5 ? '5+' : parsedBedrooms.toString());
        }
      } else {
        setBedroomsFilter('any');
      }
      
      if (bathroomsMinParam) {
        const parsedBathrooms = parseInt(bathroomsMinParam, 10);
        if (!Number.isNaN(parsedBathrooms)) {
          setBathroomsFilter(parsedBathrooms >= 4 ? '4+' : parsedBathrooms.toString());
        }
      } else {
        setBathroomsFilter('any');
      }

      if (pageParam) {
        const parsedPage = parseInt(pageParam, 10);
        if (!Number.isNaN(parsedPage) && parsedPage > 0) {
          if (suppressPageSyncRef.current) {
            suppressPageSyncRef.current = false;
          } else {
            setCurrentPage(prevPage => (prevPage === parsedPage ? prevPage : parsedPage));
          }
        }
      } else {
        if (suppressPageSyncRef.current) {
          suppressPageSyncRef.current = false;
        } else {
          setCurrentPage(prevPage => (prevPage === 1 ? prevPage : 1));
        }
      }
      
    } catch (error) {
      console.error('Error parsing URL parameters:', error);
      console.error('Error stack:', error.stack);
      // Don't crash the component, just log the error
    }
  }, [location.search, applyPriceRangeState, applySquareFeetRangeState, applyCentsRangeState]);
  
  // Apply URL parameters when component mounts or URL changes
  useEffect(() => {
    parseQueryParams();
  }, [location.search, parseQueryParams]);

  const filterQueryString = useMemo(() => {
    const params = new URLSearchParams();
    if (listingTypeFilter && listingTypeFilter !== 'all') params.set('type', listingTypeFilter);
    if (activeFilter && activeFilter !== 'all') {
      params.set('propertyType', activeFilter);
    }
    if (bedroomsFilter && bedroomsFilter !== 'any') {
      const normalizedBedrooms = bedroomsFilter === '5+' ? '5' : bedroomsFilter;
      params.set('bedrooms_min', normalizedBedrooms);
    }
    if (bathroomsFilter && bathroomsFilter !== 'any') {
      const normalizedBathrooms = bathroomsFilter === '4+' ? '4' : bathroomsFilter;
      params.set('bathrooms_min', normalizedBathrooms);
    }
    if (!(priceRange[0] === 0 && priceRange[1] === 1000000000)) {
      if (priceRange[0] > 0) {
        params.set('price_min', priceRange[0].toString());
      }
      if (priceRange[1] < 1000000000) {
        params.set('price_max', priceRange[1].toString());
      }
    }
    const isSquareFeetActive = squareFeetRange[1] > 0 && squareFeetRange[1] < 100000;
    const isCentsActive = centsRange[0] > 0;
    if (isSquareFeetActive) {
      params.set('area_unit', 'sqft');
      params.set('area_max', squareFeetRange[1].toString());
    } else if (isCentsActive) {
      params.set('area_unit', 'cent');
      params.set('area_min', centsRange[0].toString());
    }
    if (ownershipFilter && ownershipFilter !== 'all') params.set('ownership', ownershipFilter);
    if (searchQuery && searchQuery.trim()) params.set('search', searchQuery.trim());
    if (itemsPerPage) params.set('page_size', itemsPerPage.toString());
    if (currentPage && currentPage !== 1) params.set('page', currentPage);
    return params.toString();
  }, [
    listingTypeFilter,
    activeFilter,
    bedroomsFilter,
    bathroomsFilter,
    priceRange,
    squareFeetRange,
    centsRange,
    ownershipFilter,
    searchQuery,
    itemsPerPage,
    currentPage
  ]);

  // Update URL when filters change
  useEffect(() => {
    const currentSearch = location.search.startsWith('?') ? location.search.slice(1) : location.search;
    if (filterQueryString !== currentSearch) {
      const queryString = filterQueryString ? `?${filterQueryString}` : '';
      navigate(`${location.pathname}${queryString}`, { replace: true });
    }
  }, [filterQueryString, navigate, location.pathname]);

  // Show filters by default if any filter is set
  useEffect(() => {
    if (
      searchLocation ||
      searchBedrooms !== 'any' ||
      priceMinParam ||
      priceMaxParam ||
      (areaUnitParam === 'sqft' && areaMaxParam) ||
      (areaUnitParam === 'cent' && areaMinParam) ||
      searchSqft !== 'Square Feet'
    ) {
      setShowFilters(true);
    }
  }, [
    searchLocation,
    searchBedrooms,
    priceMinParam,
    priceMaxParam,
    areaUnitParam,
    areaMinParam,
    areaMaxParam,
    searchSqft
  ]);

  // Reset filters function
  const resetFilters = () => {
    
    
    // Force reset all filters to their default values
    setActiveFilter('all');
    setPriceRange([0, 1000000000]); // Set a very wide range to include all properties
    setBedroomsFilter('any');
    setBathroomsFilter('any');
    setDistanceRange(25);
    setOwnershipFilter('all');
    setListingTypeFilter('all');
    setAmenitiesFilter([]);
    setCategoryFilter('residential');
    setSearchQuery('');
    setPendingSearch('');
    setSortOption('newest');
    setSquareFeetRange([0, 100000]); // Set a very wide range
    setCentsRange([0, 1000]); // Set a very wide range
    suppressPageSyncRef.current = true;
    setCurrentPage(1);
    setUserLocation(null); // Reset user location
    
    
    
    // Update URL to remove all parameters
    window.history.replaceState(null, '', window.location.pathname);
    
    // Force a re-render by updating the state again
    setTimeout(() => {
      
      setActiveFilter('all');
      setListingTypeFilter('all');
      setSearchQuery('');
      setPendingSearch('');
    }, 100);
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
            setPendingSearch(locationString);
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
          value={pendingSearch}
          onChange={(e) => handleLocationSearch(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              applySearch();
            }
          }}
          className="w-full py-3 pl-11 pr-28 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-700 placeholder-gray-400"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {pendingSearch && (
            <button
              onClick={() => {
                setSearchQuery('');
                setPendingSearch('');
                setUserLocation(null);
                setSuggestedLocations([]);
                setShowSuggestions(false);
              }}
              className="text-gray-400 hover:text-gray-600 p-1"
            >
              <FaTimes className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={applySearch}
            className="px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200 flex items-center gap-1"
          >
            <FaSearch className="w-4 h-4" />
            <span className="text-sm font-medium">Search</span>
          </button>
        </div>
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

  const getFilterCardClasses = (section) =>
    `w-full bg-gray-50 p-4 rounded-lg border border-gray-100 transition-all duration-300 self-start ${
      expandedFilter === section ? 'shadow-lg border-green-200' : ''
    }`;

  // Find the location filter section and update it
  const locationFilterSection = (
    <motion.div layout className={getFilterCardClasses('location')}>
      <div 
        className="flex justify-between items-center cursor-pointer mb-4"
        onClick={() => toggleFilterSection('location')}
      >
        <h3 className="text-lg font-medium text-gray-800 flex items-center">
          <span className="w-1.5 h-5 bg-green-600 rounded-full mr-2"></span>
          Location
        </h3>
        <span>{expandedFilter === 'location' ? <FaChevronUp /> : <FaChevronDown />}</span>
      </div>
      
      <AnimatePresence initial={false}>
        {expandedFilter === 'location' && (
          <motion.div
            key="location-content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="space-y-4">
              {/* Search Input */}
              {searchInputSection}

              {/* Location Error Message */}
              {locationError && (
                <div className="text-red-500 text-sm flex items-center gap-2 p-2 bg-red-50 rounded-lg">
                  <FaTimes className="w-4 h-4 flex-shrink-0" />
                  <span>{locationError}</span>
                </div>
              )}

              {/* Use Current Location Button */}
              <button 
                onClick={handleLocationPermission}
                disabled={isLocating}
                className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg transition-all duration-300 ${
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
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
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
                value={centsRange[0]}
                onChange={(e) => setCentsRange([parseInt(e.target.value), 1000])}
                className="w-full h-2 bg-green-100 rounded-lg appearance-none cursor-pointer accent-green-600"
              />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {['25', '50', '100', '500', '750', '1000'].map((size) => (
                <button
                  key={size}
                  onClick={() => setCentsRange([parseInt(size), 1000])}
                  className={`px-2 py-1.5 rounded-lg text-sm transition-all duration-300 ${
                    centsRange[0] === parseInt(size)
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

  // When API provides paginated data, use it directly.
  // Otherwise, manually paginate the client-side fallback data.
  const currentProperties = useMemo(() => {
    if (isApiPaginated) {
      return sortedProperties;
    }
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedProperties.slice(startIndex, startIndex + itemsPerPage);
  }, [isApiPaginated, sortedProperties, currentPage, itemsPerPage]);
  const totalPages = Math.ceil(totalCount / itemsPerPage);
  
  

  const paginate = (pageNumber) => {
    if (totalPages === 0) return;
    if (pageNumber === currentPage) return;
    const clampedPage = Math.min(Math.max(pageNumber, 1), totalPages);
    shouldScrollToTopRef.current = true;
    setCurrentPage(clampedPage);
  };

  const pageSizeOptions = [5, 10, 15, 20, 50];

  const handlePageSizeChange = (event) => {
    const selectedSize = parseInt(event.target.value, 10);
    if (!Number.isNaN(selectedSize) && pageSizeOptions.includes(selectedSize)) {
      if (selectedSize === itemsPerPage) {
        return;
      }
      shouldScrollToTopRef.current = true;
      if (currentPage !== 1) {
        suppressPageSyncRef.current = true;
        setCurrentPage(1);
      }
      setItemsPerPage(selectedSize);
    }
  };

  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      suppressPageSyncRef.current = true;
      shouldScrollToTopRef.current = true;
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  useEffect(() => {
    if (
      !showFilters &&
      !isPageTransitioning &&
      !isInitialLoading &&
      shouldScrollToTopRef.current
    ) {
      shouldScrollToTopRef.current = false;
      smoothScrollTo(0, 700);
    }
  }, [showFilters, isPageTransitioning, isInitialLoading, smoothScrollTo]);

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

  // Add error boundary for the component
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-20 md:pt-20 flex-grow">
          <div className="container mx-auto px-4 py-12">
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Something went wrong</h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="pt-20 md:pt-20 flex-grow">

        {/* Hero Section with Parallax Effect */}
        <div className="relative h-[50vh] bg-fixed bg-center bg-cover mb-8 overflow-hidden" 
             style={{backgroundImage: 'url(https://images.prismic.io/villaplus/Z-48L3dAxsiBwQXr_3840X1500.jpg)'}}>
          <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/60 to-black/30"></div>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-green-500/20 blur-3xl"
          />
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            transition={{ duration: 1.2, delay: 0.2 }}
            className="absolute -bottom-20 -right-24 w-80 h-80 rounded-full bg-emerald-400/20 blur-3xl"
          />
          <div className="container mx-auto container-padding h-full flex items-center">
            <div className="relative z-10 max-w-3xl">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="heading-1 mb-4 text-white leading-tight text-left"
              >
                Find Your Perfect Asset
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="body-medium text-gray-200 mb-8 text-left"
              >
                {getFilterDescription()}
              </motion.p>
              
              {/* Search Bar */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                whileHover={{ scale: 1.01 }}
                className="bg-white/10 backdrop-blur-lg p-5 rounded-2xl border border-white/25 shadow-2xl w-full max-w-4xl transition-transform duration-300"
              >
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-grow relative">
                    <input
                      type="text"
                      placeholder="Search by location, property name, or keyword"
                      className="w-full py-3 px-4 pr-36 rounded-lg bg-white/95 text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 placeholder-gray-500 shadow-inner"
                      value={pendingSearch}
                      onChange={(e) => handleLocationSearch(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          applySearch();
                        }
                      }}
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                      {pendingSearch && (
                        <button
                          onClick={() => {
                            setSearchQuery('');
                            setPendingSearch('');
                            setUserLocation(null);
                            setSuggestedLocations([]);
                            setShowSuggestions(false);
                          }}
                          className="text-gray-400 hover:text-gray-600 p-1"
                        >
                          <FaTimes className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={applySearch}
                        className="px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-500 transition-all duration-200 flex items-center gap-2 shadow-lg"
                      >
                        <FaSearch className="w-4 h-4" />
                        <span className="text-sm font-semibold">Search</span>
                      </button>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowFilters(!showFilters)}
                    className="bg-white/15 text-white py-3 px-8 rounded-lg font-medium flex items-center justify-center hover:bg-white/25 transition-all duration-300 whitespace-nowrap border border-white/20 backdrop-blur-sm shadow-lg"
                  >
                    <FaFilter className="mr-2" />
                    {showFilters ? 'Hide Filters' : 'Show Filters'}
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        <div className="container mx-auto container-padding pb-12">
          {/* Filters Section - Premium Design */}
          {showFilters && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-xl shadow-lg p-6 mb-8 border-t-4 border-green-600"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Advanced Filters</h2>
                <button 
                  onClick={() => setShowFilters(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FaTimes />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-start">
                {locationFilterSection}

                {/* Property Type Filter */}
                <motion.div layout className={getFilterCardClasses('propertyType')}>
                  <div 
                    className="flex justify-between items-center cursor-pointer"
                    onClick={() => toggleFilterSection('propertyType')}
                  >
                    <h3 className="text-lg font-medium text-gray-800 flex items-center">
                      <span className="w-1.5 h-5 bg-green-600 rounded-full mr-2"></span>
                      Property Type
                    </h3>
                    <span>{expandedFilter === 'propertyType' ? <FaChevronUp /> : <FaChevronDown />}</span>
                  </div>
                  
                  <AnimatePresence initial={false}>
                    {expandedFilter === 'propertyType' && (
                      <motion.div
                        key="propertyType-content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                        className="overflow-hidden"
                      >
                        <div className="mt-4">
                          <button
                            onClick={() => setActiveFilter('all')}
                            className={`w-full mb-3 px-4 py-2 rounded-lg text-sm transition-all duration-300 ${
                              activeFilter === 'all' 
                                ? 'bg-green-600 text-white font-medium shadow-md' 
                                : 'bg-white text-gray-700 border border-gray-200 hover-border-green-300'
                            }`}
                          >
                            All Properties
                          </button>

                          {Object.entries(propertyTypeCategories).map(([category, types]) => (
                            <div key={category} className="mb-4">
                              <h4 className="text-sm font-medium text-gray-600 mb-2">{category}</h4>
                              <div className="grid grid-cols-2 gap-2">
                                {types.map((type) => (
                                  <button
                                    key={type}
                                    onClick={() => setActiveFilter(type.toLowerCase())}
                                    className={`px-3 py-2 rounded-lg text-sm transition-all duration-300 ${
                                      activeFilter === type.toLowerCase()
                                        ? 'bg-green-600 text-white font-medium shadow-md' 
                                        : 'bg-white text-gray-700 border border-gray-200 hover-border-green-300'
                                    }`}
                                  >
                                    {type}
                                  </button>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Price Range Filter */}
                <motion.div layout className={getFilterCardClasses('priceRange')}>
                  <div 
                    className="flex justify-between items-center cursor-pointer"
                    onClick={() => toggleFilterSection('priceRange')}
                  >
                    <h3 className="text-lg font-medium text-gray-800 flex items-center">
                      <span className="w-1.5 h-5 bg-green-600 rounded-full mr-2"></span>
                      Price Range
                    </h3>
                    <span>{expandedFilter === 'priceRange' ? <FaChevronUp /> : <FaChevronDown />}</span>
                  </div>
                  
                  <AnimatePresence initial={false}>
                    {expandedFilter === 'priceRange' && (
                      <motion.div
                        key="priceRange-content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                        className="overflow-hidden"
                      >
                        <div className="mt-4 px-2">
                          <div className="flex justify-between text-sm text-gray-600 mb-2">
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
                              className="w-full h-2 bg-green-100 rounded-lg appearance-none cursor-pointer accent-green-600"
                            />
                            <div className="absolute -bottom-6 left-0 right-0 flex justify-between text-xs text-gray-500">
                              <span>₹1L</span>
                              <span>₹10Cr</span>
                            </div>
                          </div>
                          <div className="mt-8 grid grid-cols-2 gap-2">
                            {['Under ₹25L', '₹25L - ₹50L', '₹50L - ₹1Cr', '₹1Cr - ₹2Cr', '₹2Cr - ₹5Cr', '₹5Cr - ₹10Cr'].map((range) => (
                              <button
                                key={range}
                                onClick={() => setPriceRange(getPriceRangeFromString(range))}
                                className={`px-3 py-2 rounded-lg text-sm transition-all duration-300 ${
                                  priceRange[1] === getPriceRangeFromString(range)[1]
                                    ? 'bg-green-600 text-white font-medium shadow-md'
                                    : 'bg-white text-gray-700 border border-gray-200 hover-border-green-300'
                                }`}
                              >
                                {range}
                              </button>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Square Feet Filter */}
                <motion.div layout className={getFilterCardClasses('squareFeet')}>
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
                  
                  <AnimatePresence initial={false}>
                    {expandedFilter === 'squareFeet' && (
                      <motion.div
                        key="squareFeet-content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                        className="overflow-hidden"
                      >
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
                                    : 'bg-white text-gray-700 border border-gray-200 hover-border-green-300'
                                }`}
                              >
                                {`< ${formatAreaNumber(parseInt(size))}`}
                              </button>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Cents Filter */}
                <motion.div layout className={getFilterCardClasses('cents')}>
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
                  
                  <AnimatePresence initial={false}>
                    {expandedFilter === 'cents' && (
                      <motion.div
                        key="cents-content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                        className="overflow-hidden"
                      >
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
                              value={centsRange[0]}
                              onChange={(e) => setCentsRange([parseInt(e.target.value), 1000])}
                              className="w-full h-2 bg-green-100 rounded-lg appearance-none cursor-pointer accent-green-600"
                            />
                          </div>
                          <div className="mt-4 grid grid-cols-3 gap-2">
                            {['25', '50', '100', '500', '750', '1000'].map((size) => (
                              <button
                                key={size}
                                onClick={() => setCentsRange([parseInt(size), 1000])}
                                className={`px-2 py-1.5 rounded-lg text-sm transition-all duration-300 ${
                                  centsRange[0] === parseInt(size)
                                    ? 'bg-green-600 text-white font-medium shadow-md'
                                    : 'bg-white text-gray-700 border border-gray-200 hover-border-green-300'
                                }`}
                              >
                                {size === '1000' ? '1000+' : `< ${size}`}
                              </button>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Ownership Filter */}
                <motion.div layout className={getFilterCardClasses('ownership')}>
                  <div 
                    className="flex justify-between items-center cursor-pointer"
                    onClick={() => toggleFilterSection('ownership')}
                  >
                    <h3 className="text-lg font-medium text-gray-800 flex items-center">
                      <span className="w-1.5 h-5 bg-green-600 rounded-full mr-2"></span>
                      Ownership
                    </h3>
                    <span>{expandedFilter === 'ownership' ? <FaChevronUp /> : <FaChevronDown />}</span>
                  </div>
                  
                  <AnimatePresence initial={false}>
                    {expandedFilter === 'ownership' && (
                      <motion.div
                        key="ownership-content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                        className="overflow-hidden"
                      >
                        <div className="mt-4 flex flex-wrap gap-2">
                          <button
                            onClick={() => setOwnershipFilter('all')}
                            className={`px-4 py-2 rounded-lg text-sm transition-all duration-300 ${
                              ownershipFilter === 'all' 
                                ? 'bg-green-600 text-white font-medium shadow-md' 
                                : 'bg-white text-gray-700 border border-gray-200 hover-border-green-300'
                            }`}
                          >
                            All
                          </button>
                          <button
                            onClick={() => setOwnershipFilter('direct_owner')}
                            className={`px-4 py-2 rounded-lg text-sm transition-all duration-300 ${
                              ownershipFilter === 'direct_owner' 
                                ? 'bg-green-600 text-white font-medium shadow-md' 
                                : 'bg-white text-gray-700 border border-gray-200 hover-border-green-300'
                            }`}
                          >
                            Direct Owner
                          </button>
                          <button
                            onClick={() => setOwnershipFilter('management')}
                            className={`px-4 py-2 rounded-lg text-sm transition-all duration-300 ${
                              ownershipFilter === 'management' 
                                ? 'bg-green-600 text-white font-medium shadow-md' 
                                : 'bg-white text-gray-700 border border-gray-200 hover-border-green-300'
                            }`}
                          >
                            Management
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Listing Type Filter */}
                <motion.div layout className={getFilterCardClasses('listingType')}>
                  <div 
                    className="flex justify-between items-center cursor-pointer"
                    onClick={() => toggleFilterSection('listingType')}
                  >
                    <h3 className="text-lg font-medium text-gray-800 flex items-center">
                      <span className="w-1.5 h-5 bg-green-600 rounded-full mr-2"></span>
                      Listing Type
                    </h3>
                    <span>{expandedFilter === 'listingType' ? <FaChevronUp /> : <FaChevronDown />}</span>
                  </div>
                  
                  <AnimatePresence initial={false}>
                    {expandedFilter === 'listingType' && (
                      <motion.div
                        key="listingType-content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                        className="overflow-hidden"
                      >
                        <div className="mt-4 flex flex-wrap gap-2">
                          {['all', 'rent', 'buy'].map((type) => (
                            <button
                              key={type}
                              onClick={() => setListingTypeFilter(type)}
                              className={`px-4 py-2 rounded-lg text-sm transition-all duration-300 ${
                                listingTypeFilter === type 
                                  ? 'bg-green-600 text-white font-medium shadow-md' 
                                  : 'bg-white text-gray-700 border border-gray-200 hover-border-green-300'
                              }`}
                            >
                              {type === 'all' ? 'All' : type === 'rent' ? 'For Rent' : 'For Sale'}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Bedrooms Filter */}
                <motion.div layout className={getFilterCardClasses('bedrooms')}>
                  <div 
                    className="flex justify-between items-center cursor-pointer"
                    onClick={() => toggleFilterSection('bedrooms')}
                  >
                    <h3 className="text-lg font-medium text-gray-800 flex items-center">
                      <span className="w-1.5 h-5 bg-green-600 rounded-full mr-2"></span>
                      Bedrooms
                    </h3>
                    <span>{expandedFilter === 'bedrooms' ? <FaChevronUp /> : <FaChevronDown />}</span>
                  </div>
                  
                  <AnimatePresence initial={false}>
                    {expandedFilter === 'bedrooms' && (
                      <motion.div
                        key="bedrooms-content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                        className="overflow-hidden"
                      >
                        <div className="mt-4 flex flex-wrap gap-2">
                          {['any', '1', '2', '3', '4', '5+'].map((num) => (
                            <button
                              key={num}
                              onClick={() => setBedroomsFilter(num)}
                              className={`px-4 py-2 rounded-lg text-sm transition-all duration-300 ${
                                bedroomsFilter === num 
                                  ? 'bg-green-600 text-white font-medium shadow-md' 
                                  : 'bg-white text-gray-700 border border-gray-200 hover-border-green-300'
                              }`}
                            >
                              {num === 'any' ? 'Any' : num}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Bathrooms Filter */}
                <motion.div layout className={getFilterCardClasses('bathrooms')}>
                  <div 
                    className="flex justify-between items-center cursor-pointer"
                    onClick={() => toggleFilterSection('bathrooms')}
                  >
                    <h3 className="text-lg font-medium text-gray-800 flex items-center">
                      <span className="w-1.5 h-5 bg-green-600 rounded-full mr-2"></span>
                      Bathrooms
                    </h3>
                    <span>{expandedFilter === 'bathrooms' ? <FaChevronUp /> : <FaChevronDown />}</span>
                  </div>
                  
                  <AnimatePresence initial={false}>
                    {expandedFilter === 'bathrooms' && (
                      <motion.div
                        key="bathrooms-content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                        className="overflow-hidden"
                      >
                        <div className="mt-4 flex flex-wrap gap-2">
                          {['any', '1', '2', '3', '4+'].map((num) => (
                            <button
                              key={num}
                              onClick={() => setBathroomsFilter(num)}
                              className={`px-4 py-2 rounded-lg text-sm transition-all duration-300 ${
                                bathroomsFilter === num 
                                  ? 'bg-green-600 text-white font-medium shadow-md' 
                                  : 'bg-white text-gray-700 border border-gray-200 hover-border-green-300'
                              }`}
                            >
                              {num === 'any' ? 'Any' : num}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Amenities Filter */}
                {/*
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <div 
                    className="flex justify-between items-center cursor-pointer"
                    onClick={() => toggleFilterSection('amenities')}
                  >
                    <h3 className="text-lg font-medium text-gray-800 flex items-center">
                      <span className="w-1.5 h-5 bg-green-600 rounded-full mr-2"></span>
                      Amenities
                    </h3>
                    <span>{expandedFilter === 'amenities' ? <FaChevronUp /> : <FaChevronDown />}</span>
                  </div>
                  
                  {expandedFilter === 'amenities' && (
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      {['Pool', 'Gym', 'Parking', 'Balcony', 'Garden', 'Security', 'Elevator', 'Furnished'].map((amenity) => (
                        <div key={amenity} className="flex items-center">
                          <input
                            type="checkbox"
                            id={`amenity-${amenity}`}
                            checked={amenitiesFilter.includes(amenity)}
                            onChange={() => toggleAmenity(amenity)}
                            className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                          />
                          <label htmlFor={`amenity-${amenity}`} className="ml-2 text-sm text-gray-700">
                            {amenity}
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                */}
              </div>
              
              <div className="flex justify-end mt-8 border-t pt-6">
                <button 
                  onClick={resetFilters}
                  className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg mr-3 hover:bg-gray-200 transition-all duration-300"
                >
                  Reset All
                </button>
                <button 
                  onClick={() => setShowFilters(false)}
                  className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-300 flex items-center"
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
                <span className="font-semibold">{sortedProperties.length}</span> exclusive listings
                {properties.length !== sortedProperties.length && (
                  <span className="text-sm text-gray-500 ml-2">
                    (Filtered from {properties.length} total)
                  </span>
                )}
              </p>
                             {properties.length !== sortedProperties.length && (
                 <button
                   onClick={resetFilters}
                   className="text-sm text-green-600 hover:text-green-700 font-medium mt-1"
                 >
                   Show All Properties
                 </button>
               )}
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
          ) : sortedProperties.length === 0 ? (
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
            <div
              className={`relative transition-all duration-300 transform ${
                isPageTransitioning ? 'opacity-95 scale-[0.997]' : 'opacity-100 scale-100'
              }`}
            >
              {isPageTransitioning && (
                <div className="absolute inset-0 rounded-2xl bg-white/40 backdrop-blur-[1px] pointer-events-none" />
              )}
              {viewMode === 'list' ? (
                <div className="space-y-6">
                  {currentProperties.map((property) => (
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
                              ₹ {property.price}
                              {property.property_for === 'rent' && <span className="text-sm font-normal text-gray-200 ml-2">/month</span>}
                            </h3>
                          </div>
                        </div>
                        <div className="p-4 lg:p-6 flex flex-col justify-between w-full lg:w-3/5">
                          <div className="flex-grow">
                            {/* Price for desktop */}
                            <div className="hidden lg:flex justify-between items-start mb-2">
                              <h3 className="text-xl lg:text-2xl font-bold text-gray-800">
                                ₹ {property.price}
                                {property.property_for === 'rent' && <span className="text-sm font-normal text-gray-500 ml-2">/month</span>}
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
                              {formatAreaWithUnit(property) && (
                                <div className="flex items-center bg-gray-50 px-2 py-1 rounded-full text-sm">
                                  <FaRulerCombined className="text-green-500 mr-1" />
                                  <span className="text-gray-700">{formatAreaWithUnit(property)}</span>
                                </div>
                              )}
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
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {currentProperties.map((property) => (
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
                            {property.property_for === 'rent' && <span className="text-sm font-normal text-gray-200 ml-2">/month</span>}
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
                              {property.bedrooms && property.bedrooms !== '0' && property.bedrooms !== '' && !isLandProperty(property) && (
                                <div className="flex items-center bg-gray-50 px-2 py-1 rounded-full text-sm">
                                  <FaBed className="text-green-500 mr-1" />
                                  <span className="text-gray-700">{property.bedrooms}</span>
                                </div>
                              )}
                              {property.bathrooms && property.bathrooms !== '0' && property.bathrooms !== '' && !isLandProperty(property) && (
                                <div className="flex items-center bg-gray-50 px-2 py-1 rounded-full text-sm">
                                  <FaBath className="text-green-500 mr-1" />
                                  <span className="text-gray-700">{property.bathrooms}</span>
                                </div>
                              )}
                              {formatAreaWithUnit(property) && (
                                <div className="flex items-center bg-gray-50 px-2 py-1 rounded-full text-sm">
                                  <FaRulerCombined className="text-green-500 mr-1" />
                                  <span className="text-gray-700">{formatAreaWithUnit(property)}</span>
                                </div>
                              )}
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
                  ))}
                </div>
              )}
            </div>
          )}
          
          {/* Loading State */}
          {isInitialLoading && (
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

          {/* No Results State */}
          {!isInitialLoading && currentProperties.length === 0 && (
            <div className="text-center py-12">
              <div className="bg-white rounded-xl shadow-lg p-8 max-w-md mx-auto">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">No properties found</h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your filters or search criteria to find more properties.
                </p>
                <button 
                  onClick={resetFilters}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Reset Filters
                </button>
              </div>
            </div>
          )}
          
          {/* Pagination */}
          {totalCount > 0 && (
            <div className="mt-8 flex flex-col lg:flex-row items-center lg:justify-between gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>Results per page:</span>
                <select
                  value={itemsPerPage}
                  onChange={handlePageSizeChange}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  {pageSizeOptions.map((size) => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
              </div>

              <nav className="flex items-center gap-2" aria-label="Pagination">
                {/* Previous Page Button */}
                <button 
                  onClick={() => currentPage > 1 && paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`p-2 rounded-lg border ${
                    currentPage === 1 
                      ? 'border-gray-200 text-gray-400 cursor-not-allowed' 
                      : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                  } transition-all duration-300`}
                >
                  <FaChevronLeft />
                </button>

                {/* First Page */}
                {getPageNumbers()[0] > 1 && (
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
                    {getPageNumbers()[0] > 2 && (
                      <span className="px-2 text-gray-500">...</span>
                    )}
                  </>
                )}

                {/* Page Numbers */}
                {getPageNumbers().map((number) => (
                  <button
                    key={number}
                    onClick={() => paginate(number)}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 
                      ${currentPage === number 
                        ? 'bg-green-600 text-white font-medium' 
                        : 'border border-gray-300 text-gray-600 hover:bg-gray-50'}`}
                  >
                    {number}
                  </button>
                ))}

                {/* Last Page */}
                {getPageNumbers()[getPageNumbers().length - 1] < totalPages && (
                  <>
                    {getPageNumbers()[getPageNumbers().length - 1] < totalPages - 1 && (
                      <span className="px-2 text-gray-500">...</span>
                    )}
                    <button
                      onClick={() => paginate(totalPages)}
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
                  onClick={() => currentPage < totalPages && paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`p-2 rounded-lg border ${
                    currentPage === totalPages 
                      ? 'border-gray-200 text-gray-400 cursor-not-allowed' 
                      : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                  } transition-all duration-300`}
                >
                  <FaChevronRight />
                </button>
              </nav>
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






