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
  FaChevronDown,
} from "react-icons/fa";
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import Header from "../shared/Header";
import Footer from "../shared/Footer";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { propertyAPI } from "../../Services/api";

// Add Fuse.js for fuzzy search
import Fuse from "fuse.js";
import ExpandableText from "../shared/ExpandableText";

const PropertyListing = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Get search parameters from URL with proper parsing
  const searchLocation = searchParams.get("search") || "";
  const searchType = searchParams.get("type") || "all";
  const searchPropertyType = searchParams.get("propertyType") || "all";
  const searchCategory = searchParams.get("category")
    ? decodeURIComponent(searchParams.get("category"))
    : "all";
  const bedroomsMinParamFromUrl = searchParams.get("bedrooms_min");
  const bedroomsMaxParamFromUrl = searchParams.get("bedrooms_max");
  const searchBedrooms = useMemo(() => {
    if (!bedroomsMinParamFromUrl) return "any";
    const parsedMin = parseInt(bedroomsMinParamFromUrl, 10);
    const parsedMax = bedroomsMaxParamFromUrl
      ? parseInt(bedroomsMaxParamFromUrl, 10)
      : null;
    if (Number.isNaN(parsedMin)) return "any";
    if (parsedMin >= 5) return "5+";
    // If exact match was provided, honor it. If max is missing, treat as exact for our UI.
    if (
      parsedMax == null ||
      Number.isNaN(parsedMax) ||
      parsedMax === parsedMin
    ) {
      return parsedMin.toString();
    }
    return "any";
  }, [bedroomsMinParamFromUrl, bedroomsMaxParamFromUrl]);
  const bathroomsMinParamFromUrl = searchParams.get("bathrooms_min");
  const bathroomsMaxParamFromUrl = searchParams.get("bathrooms_max");
  const searchBathrooms = useMemo(() => {
    if (!bathroomsMinParamFromUrl) return "any";
    const parsedMin = parseInt(bathroomsMinParamFromUrl, 10);
    const parsedMax = bathroomsMaxParamFromUrl
      ? parseInt(bathroomsMaxParamFromUrl, 10)
      : null;
    if (Number.isNaN(parsedMin)) return "any";
    if (parsedMin >= 4) return "4+";
    if (
      parsedMax == null ||
      Number.isNaN(parsedMax) ||
      parsedMax === parsedMin
    ) {
      return parsedMin.toString();
    }
    return "any";
  }, [bathroomsMinParamFromUrl, bathroomsMaxParamFromUrl]);
  const legacyPriceParam = searchParams.get("price");
  const priceMinParam = searchParams.get("price_min");
  const priceMaxParam = searchParams.get("price_max");
  const searchPriceRange = useMemo(() => {
    if (legacyPriceParam && legacyPriceParam.includes(",")) {
      const [legacyMin, legacyMax] = legacyPriceParam.split(",");
      const parsedLegacyMin = parseInt(legacyMin, 10);
      const parsedLegacyMax = parseInt(legacyMax, 10);
      return [
        Number.isNaN(parsedLegacyMin) ? 0 : parsedLegacyMin,
        Number.isNaN(parsedLegacyMax) ? 1000000000 : parsedLegacyMax,
      ];
    }
    const parsedMin = priceMinParam ? parseInt(priceMinParam, 10) : 0;
    const parsedMax = priceMaxParam ? parseInt(priceMaxParam, 10) : 1000000000;
    return [
      Number.isNaN(parsedMin) ? 0 : parsedMin,
      Number.isNaN(parsedMax) ? 1000000000 : parsedMax,
    ];
  }, [legacyPriceParam, priceMinParam, priceMaxParam]);
  const areaUnitParam = searchParams.get("area_unit");
  const areaMinParam = searchParams.get("area_min");
  const areaMaxParam = searchParams.get("area_max");
  const searchSqft = searchParams.get("sqft") || "Square Feet";
  const searchCents = searchParams.get("cents") || "Any";
  const _searchLat =
    searchParams.get("latitude") || searchParams.get("lat") || "";
  const _searchLng =
    searchParams.get("longitude") || searchParams.get("lng") || "";

  // Parse price range from the price string
  const getPriceRangeFromString = (priceStr) => {
    const priceRanges = {
      "Under ₹25L": [100000, 2500000],
      "₹25L - ₹50L": [2500000, 5000000],
      "₹50L - ₹1Cr": [5000000, 10000000],
      "₹1Cr - ₹2Cr": [10000000, 20000000],
      "₹2Cr - ₹5Cr": [20000000, 50000000],
      "₹5Cr - ₹10Cr": [50000000, 100000000],
      "Under ₹50L": [100000, 5000000],
      "Above ₹5Cr": [50000000, 1000000000],
      "Price (INR)": [0, 1000000000], // Default range - very wide
    };
    return priceRanges[priceStr] || priceRanges["Price (INR)"];
  };

  // Parse square feet range from the banner
  const getSquareFeetRangeFromString = (sqftStr) => {
    const sqftRanges = {
      "Any Sq.ft": [0, 100000],
      "0-500": [0, 500],
      "500-1000": [500, 1000],
      "1000-2000": [1000, 2000],
      "2000-5000": [2000, 5000],
      "5000-10000": [5000, 10000],
      "10000+": [10000, 100000],
      "Square Feet": [0, 100000],
    };
    return sqftRanges[sqftStr] || sqftRanges["Any Sq.ft"];
  };

  // Parse cents range from the banner
  const getCentsRangeFromString = (centsStr) => {
    const centsRanges = {
      "Any Cents": [0, 100000],
      "0-5": [0, 5],
      "5-10": [5, 10],
      "10-20": [10, 20],
      "20-50": [20, 50],
      "50-100": [50, 100],
      "100+": [100, 100000],
    };
    return centsRanges[centsStr] || centsRanges["Any Cents"];
  };

  // Initialize state with URL parameters
  const [viewMode, setViewMode] = useState("list");
  const [_favorites, setFavorites] = useState({});
  const [activeFilter, setActiveFilter] = useState(() => {
    // Priority: category parameter from dropdown > propertyType parameter
    let initialFilter;
    if (searchCategory && searchCategory !== "all") {
      initialFilter = searchCategory.toLowerCase();
    } else if (searchPropertyType && searchPropertyType !== "all") {
      initialFilter = searchPropertyType.toLowerCase();
    } else {
      initialFilter = "all";
    }

    return initialFilter;
  });

  // Update activeFilter when URL parameters change
  useEffect(() => {
    let newFilter;
    if (searchCategory && searchCategory !== "all") {
      newFilter = searchCategory.toLowerCase();
    } else if (searchPropertyType && searchPropertyType !== "all") {
      newFilter = searchPropertyType.toLowerCase();
    } else {
      newFilter = "all";
    }

    setActiveFilter(newFilter);
  }, [searchCategory, searchPropertyType]);

  const [priceRange, setPriceRange] = useState(
    () => searchPriceRange || [0, 1000000000],
  );
  // Debounced price range for API/URL: updates after user stops moving the slider to avoid many API calls
  const [debouncedPriceRange, setDebouncedPriceRange] = useState(
    () => searchPriceRange || [0, 1000000000],
  );
  useEffect(() => {
    const t = setTimeout(() => setDebouncedPriceRange(priceRange), 400);
    return () => clearTimeout(t);
  }, [priceRange]);
  const [searchQuery, setSearchQuery] = useState(searchLocation);
  const [pendingSearch, setPendingSearch] = useState(searchLocation);
  const [showFilters, setShowFilters] = useState(false);
  const [sortOption, setSortOption] = useState("newest");
  const [_isLoading, setIsLoading] = useState(false);
  const [ownershipFilter, setOwnershipFilter] = useState("all");
  const [listingTypeFilter, setListingTypeFilter] = useState(searchType);
  const [_distanceRange, setDistanceRange] = useState(25);
  // Start with no location-based filtering; userLocation is only set when user explicitly selects/uses location
  const [userLocation, setUserLocation] = useState(null);
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
    if (areaUnitParam === "sqft" && (areaMinParam || areaMaxParam)) {
      const parsedMin = areaMinParam ? parseInt(areaMinParam, 10) : 0;
      const parsedMax = areaMaxParam ? parseInt(areaMaxParam, 10) : 100000;
      return [
        Number.isNaN(parsedMin) ? 0 : Math.max(0, parsedMin),
        Number.isNaN(parsedMax) ? 100000 : Math.min(100000, parsedMax),
      ];
    }
    if (searchSqft !== "Square Feet") {
      return getSquareFeetRangeFromString(searchSqft);
    }
    return [0, 100000];
  });
  const [centsRange, setCentsRange] = useState(() => {
    if (areaUnitParam === "cent" && (areaMinParam || areaMaxParam)) {
      const parsedMin = areaMinParam ? parseInt(areaMinParam, 10) : 0;
      const parsedMax = areaMaxParam ? parseInt(areaMaxParam, 10) : 100000;
      return [
        Number.isNaN(parsedMin) ? 0 : Math.max(0, parsedMin),
        Number.isNaN(parsedMax) ? 100000 : Math.min(100000, parsedMax),
      ];
    }
    if (searchCents !== "Any") {
      const [minValue, maxValue] = getCentsRangeFromString(searchCents);
      return [minValue, Math.min(maxValue, 100000)];
    }
    return [0, 100000];
  });

  const applyPriceRangeState = useCallback((min, max) => {
    setPriceRange((prevRange) =>
      prevRange[0] === min && prevRange[1] === max ? prevRange : [min, max],
    );
  }, []);

  const applySquareFeetRangeState = useCallback((min, max) => {
    setSquareFeetRange((prevRange) =>
      prevRange[0] === min && prevRange[1] === max ? prevRange : [min, max],
    );
  }, []);

  const applyCentsRangeState = useCallback((min, max) => {
    setCentsRange((prevRange) =>
      prevRange[0] === min && prevRange[1] === max ? prevRange : [min, max],
    );
  }, []);

  const isScrollingRef = useRef(false);
  const scrollAnimationFrameRef = useRef(null);

  const smoothScrollTo = useCallback((targetY = 0, duration = 600) => {
    if (typeof window === "undefined") return;
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
    const pageSizeParam = searchParams.get("page_size");
    const parsed = pageSizeParam ? parseInt(pageSizeParam, 10) : 10;
    const validSizes = [5, 10, 15, 20, 50];
    return validSizes.includes(parsed) ? parsed : 10;
  })();
  const [itemsPerPage, setItemsPerPage] = useState(initialPageSize);
  const [totalCount, setTotalCount] = useState(0);
  const [_hasNextPage, setHasNextPage] = useState(false);
  const [_hasPreviousPage, setHasPreviousPage] = useState(false);
  const [isApiPaginated, setIsApiPaginated] = useState(false);
  const [isPageTransitioning, setIsPageTransitioning] = useState(false);
  const previousFiltersSignatureRef = useRef(null);
  const suppressPageSyncRef = useRef(false);
  const initialLoadRef = useRef(true);
  const lastRequestedSignatureRef = useRef(null);
  const shouldScrollToTopRef = useRef(false);
  // Skip one fetch when URL (e.g. from home search) just changed so state can sync first and we only make one API call
  const lastLocationSearchRef = useRef(null);

  // Property types state
  const [propertyTypes, setPropertyTypes] = useState([]);
  const [propertyTypesLoading, setPropertyTypesLoading] = useState(true);

  // Group property types by category dynamically
  const propertyTypeCategories = useMemo(() => {
    if (propertyTypesLoading || propertyTypes.length === 0) {
      return {
        "Land Properties": [],
        Buildings: [],
      };
    }

    return {
      "Land Properties": propertyTypes
        .filter((type) => type.name.toLowerCase().includes("land"))
        .map((type) => type.name),
      Buildings: propertyTypes
        .filter((type) => !type.name.toLowerCase().includes("land"))
        .map((type) => type.name),
    };
  }, [propertyTypes, propertyTypesLoading]);

  // Update the locations array with Kerala locations
  const _locations = [
    "Thodupuzha, Idukki",
    "Pala, Kottayam",
    "Erattupetta, Kottayam",
    "Kaloor, Ernakulam",
    "Kochi, Ernakulam",
    "Pathanamthitta",
  ];

  // Add state for suggested locations
  const [_suggestedLocations, setSuggestedLocations] = useState([]);
  const [_showSuggestions, setShowSuggestions] = useState(false);
  // Locations from properties/locations API (shown in "Existing locations" when Location filter is expanded)
  const [locationsFromApi, setLocationsFromApi] = useState([]);
  const [locationsLoading, setLocationsLoading] = useState(false);
  const [locationsError, setLocationsError] = useState(null);
  const [locationsPage, setLocationsPage] = useState(1);
  const [locationsHasMore, setLocationsHasMore] = useState(false);
  const [locationsLoadingMore, setLocationsLoadingMore] = useState(false);
  const locationsListScrollRef = useRef(null);

  const _toggleFavorite = (id) => {
    setFavorites((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Updated function to handle the case when property is not defined
  const getDirections = (e, propertyData) => {
    e.preventDefault();
    e.stopPropagation();
    const directionsUrl =
      propertyData?.google_maps_url ||
      "https://maps.app.goo.gl/TmRYmFNwSF3g5vrX8?g_st=ac";
    window.open(directionsUrl, "_blank");
  };

  // Add this function to toggle expanded filter sections
  const toggleFilterSection = (section) => {
    setExpandedFilter(expandedFilter === section ? null : section);
  };

  // Add this function to handle amenities selection
  const _toggleAmenity = (amenity) => {
    setAmenitiesFilter((prev) =>
      prev.includes(amenity)
        ? prev.filter((a) => a !== amenity)
        : [...prev, amenity],
    );
  };

  // Add this function to calculate distance between two points
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the earth in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km
    return distance;
  };

  // Function to handle filter changes and update URL
  const _handleFilterChange = (filterType, value) => {
    const currentParams = new URLSearchParams(location.search);

    switch (filterType) {
      case "category":
        if (value && value !== "all") {
          currentParams.set(
            "category",
            encodeURIComponent(value.toLowerCase()),
          );
        } else {
          currentParams.delete("category");
        }
        break;
      case "type":
        if (value && value !== "all") {
          currentParams.set("type", value);
        } else {
          currentParams.delete("type");
        }
        break;
      case "location":
        if (value) {
          currentParams.set("search", value);
        } else {
          currentParams.delete("search");
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
  const getPropertyTypeId = useCallback(
    (propertyTypeName) => {
      if (!propertyTypeName || propertyTypeName === "all") return null;
      const propertyType = propertyTypes.find(
        (pt) =>
          pt.name.toLowerCase().trim() ===
          propertyTypeName.toLowerCase().trim(),
      );
      return propertyType?.id || null;
    },
    [propertyTypes],
  );

  // Build query parameters from filters
  const buildQueryParams = useCallback(() => {
    const params = {};

    // Pagination
    params.page = currentPage;
    params.page_size = itemsPerPage;

    // Price filters (use debounced value so slider doesn't trigger many API calls)
    if (
      !(debouncedPriceRange[0] === 0 && debouncedPriceRange[1] === 1000000000)
    ) {
      if (debouncedPriceRange[0] > 0) {
        params.price_min = debouncedPriceRange[0];
      }
      if (debouncedPriceRange[1] < 1000000000) {
        params.price_max = debouncedPriceRange[1];
      }
    }

    // Property type - convert name to ID
    if (activeFilter && activeFilter !== "all") {
      const propertyTypeId = getPropertyTypeId(activeFilter);
      if (propertyTypeId) {
        params.property_type = propertyTypeId;
      }
    }

    // Bedrooms filter
    if (bedroomsFilter && bedroomsFilter !== "any") {
      if (bedroomsFilter === "5+") {
        params.bedrooms_min = 5;
      } else {
        const beds = parseInt(bedroomsFilter);
        if (!isNaN(beds)) {
          params.bedrooms_min = beds;
          params.bedrooms_max = beds;
        }
      }
    }

    // Bathrooms filter
    if (bathroomsFilter && bathroomsFilter !== "any") {
      if (bathroomsFilter === "4+") {
        params.bathrooms_min = 4;
      } else {
        const baths = parseInt(bathroomsFilter);
        if (!isNaN(baths)) {
          params.bathrooms_min = baths;
          params.bathrooms_max = baths;
        }
      }
    }

    // Ownership filter
    if (ownershipFilter && ownershipFilter !== "all") {
      params.ownership = ownershipFilter;
    }

    // Area filters - prioritize built-up area (sqft) over land area (cent); send area_min and area_max
    const sqftMin =
      squareFeetRange[0] === ""
        ? 0
        : Math.max(0, Math.min(100000, Number(squareFeetRange[0]) || 0));
    const sqftMax =
      squareFeetRange[1] === ""
        ? 100000
        : Math.max(0, Math.min(100000, Number(squareFeetRange[1]) || 100000));
    const centsMin =
      centsRange[0] === ""
        ? 0
        : Math.max(0, Math.min(100000, Number(centsRange[0]) || 0));
    const centsMax =
      centsRange[1] === ""
        ? 100000
        : Math.max(0, Math.min(100000, Number(centsRange[1]) || 100000));
    const isSquareFeetActive = sqftMin > 0 || (sqftMax > 0 && sqftMax < 100000);
    const isCentsActive = centsMin > 0 || centsMax < 100000;
    if (isSquareFeetActive) {
      params.area_unit = "sqft";
      params.area_min = sqftMin;
      params.area_max = sqftMax;
    } else if (isCentsActive) {
      params.area_unit = "cent";
      params.area_min = centsMin;
      params.area_max = centsMax;
    }

    // Location: when user chose "Use my current location", send only latitude/longitude (no search param)
    const hasUserLocation =
      userLocation &&
      typeof userLocation.lat === "number" &&
      typeof userLocation.lng === "number";
    if (hasUserLocation) {
      params.latitude = userLocation.lat;
      params.longitude = userLocation.lng;
    } else {
      const trimmedSearch = searchQuery?.trim();
      if (trimmedSearch) {
        params.search = trimmedSearch;
      }
    }

    // Property for (rent/sell) - map 'buy' to 'sell'
    if (listingTypeFilter && listingTypeFilter !== "all") {
      if (listingTypeFilter === "buy" || listingTypeFilter === "sell") {
        params.property_for = "sell";
      } else if (listingTypeFilter === "rent") {
        params.property_for = "rent";
      }
    }

    return params;
  }, [
    currentPage,
    itemsPerPage,
    debouncedPriceRange,
    activeFilter,
    bedroomsFilter,
    bathroomsFilter,
    ownershipFilter,
    squareFeetRange,
    centsRange,
    searchQuery,
    listingTypeFilter,
    userLocation,
    getPropertyTypeId,
  ]);

  const baseFilterParams = useMemo(() => {
    const params = buildQueryParams();
    const { page: _ignoredPage, ...rest } = params || {};
    return JSON.parse(JSON.stringify(rest || {}));
  }, [buildQueryParams]);

  const filtersSignature = useMemo(
    () => JSON.stringify(baseFilterParams),
    [baseFilterParams],
  );

  const fetchParams = useMemo(
    () => ({
      ...baseFilterParams,
      page: currentPage,
    }),
    [baseFilterParams, currentPage],
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

  // Fetch locations from API when Location filter is expanded (for "Existing locations" section)
  useEffect(() => {
    if (expandedFilter !== "location") return;
    let cancelled = false;
    setLocationsPage(1);
    setLocationsHasMore(false);
    const fetchLocations = async () => {
      setLocationsLoading(true);
      setLocationsError(null);
      try {
        const data = await propertyAPI.getLocations({ page: 1 });
        if (!cancelled && data?.results) {
          setLocationsFromApi(data.results);
          setLocationsHasMore(!!data.next);
          setLocationsPage(2);
        } else if (!cancelled) {
          setLocationsFromApi([]);
        }
      } catch (err) {
        if (!cancelled) {
          setLocationsError(err?.message || "Failed to load locations");
          setLocationsFromApi([]);
        }
      } finally {
        if (!cancelled) setLocationsLoading(false);
      }
    };
    fetchLocations();
    return () => {
      cancelled = true;
    };
  }, [expandedFilter]);

  // Fetch properties from API with filters and pagination
  useEffect(() => {
    // When URL just changed: skip this run so state can sync from URL first — unless we're the
    // ones who pushed (e.g. "Use my location" or user changed a filter); then fetch with new params.
    if (location.search !== lastLocationSearchRef.current) {
      lastLocationSearchRef.current = location.search;
      const weJustPushedUrl = justPushedUrlRef.current;
      if (weJustPushedUrl) {
        justPushedUrlRef.current = false;
      } else {
        const hasQueryParams =
          location.search &&
          location.search.trim() !== "" &&
          location.search.trim() !== "?";
        if (hasQueryParams) return;
      }
    }

    // Don't fetch if the URL has filter params (area, price) that aren't in fetchParams yet —
    // state from parseQueryParams hasn't committed, so we'd fetch with wrong (default) params.
    const urlParams = new URLSearchParams(
      location.search.startsWith("?")
        ? location.search.slice(1)
        : location.search,
    );
    const urlAreaMin = urlParams.get("area_min");
    const urlAreaMax = urlParams.get("area_max");
    const urlPriceMin = urlParams.get("price_min");
    const urlPriceMax = urlParams.get("price_max");
    const urlHasArea =
      (urlAreaMin && Number(urlAreaMin) > 0) ||
      (urlAreaMax && Number(urlAreaMax) < 100000);
    const urlHasPrice =
      (urlPriceMin && Number(urlPriceMin) > 0) ||
      (urlPriceMax && Number(urlPriceMax) < 1000000000);
    const paramsHasArea =
      fetchParams.area_min != null &&
      fetchParams.area_max != null &&
      (Number(fetchParams.area_min) > 0 ||
        Number(fetchParams.area_max) < 100000);
    const paramsHasPrice =
      (fetchParams.price_min != null && Number(fetchParams.price_min) > 0) ||
      (fetchParams.price_max != null &&
        Number(fetchParams.price_max) < 1000000000);
    if ((urlHasArea && !paramsHasArea) || (urlHasPrice && !paramsHasPrice)) {
      return;
    }

    const fetchProperties = async () => {
      let shouldHideSkeleton = false;
      let shouldStopPageTransition = false;
      try {
        const previousSignature = lastRequestedSignatureRef.current;
        const previousPage = lastRequestedPageRef.current;
        const currentSignature = filtersSignature;
        const isFilterChange =
          previousSignature !== null && previousSignature !== currentSignature;
        const isPageChange =
          previousPage !== undefined && previousPage !== currentPage;

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

        if (response?.error === "invalid-page") {
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
          const resultsArray = Array.isArray(response.results)
            ? response.results
            : [];
          setProperties(resultsArray);
          const responseCount =
            typeof response.count === "number"
              ? response.count
              : resultsArray.length;
          setTotalCount(responseCount);
          setHasNextPage(!!response.next);
          setHasPreviousPage(!!response.previous);
          setIsApiPaginated(true);
        } else {
          // Fallback for non-paginated response
          const data = Array.isArray(response)
            ? response
            : response?.data || [];
          setProperties(data);
          setTotalCount(data.length);
          setHasNextPage(false);
          setHasPreviousPage(false);
          setIsApiPaginated(false);
        }
      } catch (err) {
        console.error("Error fetching properties:", err);
        setProperties([]);
        setTotalCount(0);
        setHasNextPage(false);
        setHasPreviousPage(false);
        setIsApiPaginated(false);
        setError("Failed to fetch properties. Please try again later.");
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
  }, [fetchParams, filtersSignature, currentPage, location.search]);

  // Fetch property types from API
  useEffect(() => {
    const fetchPropertyTypes = async () => {
      try {
        const response = await propertyAPI.getPropertyTypes();
        setPropertyTypes(response);
        setPropertyTypesLoading(false);
      } catch (error) {
        console.error("Error fetching property types:", error);
        setPropertyTypesLoading(false);
      }
    };

    fetchPropertyTypes();
  }, []);

  // Create a function to normalize text for comparison
  const _normalizeText = (text) => {
    return text.toLowerCase().replace(/\s+/g, " ").trim();
  };

  // Helper function to extract numeric value from price text
  const extractPriceValue = (priceText) => {
    if (!priceText) return 0;

    // Remove currency symbols and spaces
    const cleanPrice = priceText
      .toString()
      .replace(/[₹,\s]/g, "")
      .toLowerCase();

    // Handle different formats
    if (cleanPrice.includes("lakh") || cleanPrice.includes("l")) {
      const num = parseFloat(cleanPrice.replace(/[^\d.]/g, "")) || 0;
      return num * 100000; // Convert lakh to actual number
    } else if (cleanPrice.includes("crore") || cleanPrice.includes("cr")) {
      const num = parseFloat(cleanPrice.replace(/[^\d.]/g, "")) || 0;
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
      "property_type_name",
      "property_type",
      "type",
      "category",
    ];

    for (const field of possibleFields) {
      if (
        property[field] &&
        typeof property[field] === "string" &&
        property[field].trim()
      ) {
        return property[field].trim();
      }
    }

    return "Unknown";
  };

  // Add this helper function near the top of your component
  const capitalizeFirstLetter = (string) => {
    if (!string) return "";
    return string
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  // Function to get unique locations from properties (with latitude/longitude for each)
  const _getUniqueLocations = (properties) => {
    const seen = new Set();
    const list = [];
    properties.forEach((property) => {
      if (!property.location?.city) return;
      const lat =
        property.latitude != null ? parseFloat(property.latitude) : null;
      const lng =
        property.longitude != null ? parseFloat(property.longitude) : null;
      if (lat == null || lng == null || isNaN(lat) || isNaN(lng)) return;
      const displayText =
        `${capitalizeFirstLetter(property.location.city)}, ${capitalizeFirstLetter(property.location.district || "")}, ${capitalizeFirstLetter(property.location.state || "")}`
          .replace(/,\s*,/g, ",")
          .replace(/,?\s*$/, "");
      if (seen.has(displayText)) return;
      seen.add(displayText);
      list.push({ displayText, latitude: lat, longitude: lng });
    });
    return list;
  };

  // Initialize Fuse instance for fuzzy search on location objects
  const _initializeFuseSearch = (locationObjs) => {
    return new Fuse(locationObjs, {
      includeScore: true,
      threshold: 0.4,
      keys: ["displayText"],
      distance: 200,
    });
  };

  // Function to handle location search and suggestions (from existing properties)
  const handleLocationSearch = (searchValue) => {
    setPendingSearch(searchValue);
    // Autocomplete suggestions are disabled; only search via button/Enter.
    setSuggestedLocations([]);
    setShowSuggestions(false);
  };

  // Function to handle suggestion selection — pass only latitude/longitude (no search param). Search is only sent when user types and clicks Search.
  const handleSuggestionSelect = (locationItem) => {
    const displayText =
      typeof locationItem === "string"
        ? locationItem
        : locationItem.displayText;
    setPendingSearch(displayText); // Show selected location in input for display only
    setSearchQuery(""); // Do not send search param when selecting from dropdown; only lat/lng are sent
    setShowSuggestions(false);
    setSuggestedLocations([]);
    const rawLat =
      typeof locationItem === "object" && locationItem != null
        ? locationItem.latitude
        : null;
    const rawLng =
      typeof locationItem === "object" && locationItem != null
        ? locationItem.longitude
        : null;
    const parsedLat =
      typeof rawLat === "number"
        ? rawLat
        : rawLat != null
          ? parseFloat(rawLat)
          : NaN;
    const parsedLng =
      typeof rawLng === "number"
        ? rawLng
        : rawLng != null
          ? parseFloat(rawLng)
          : NaN;
    const hasValidCoords =
      Number.isFinite(parsedLat) && Number.isFinite(parsedLng);

    if (hasValidCoords) {
      setUserLocation({ lat: parsedLat, lng: parsedLng });
      suppressPageSyncRef.current = true;
      setCurrentPage(1);

      // Keep other filters, but remove ?search= and ensure only latitude/longitude are passed
      const nextParams = new URLSearchParams(location.search || "");
      nextParams.delete("search");
      nextParams.delete("lat");
      nextParams.delete("lng");
      nextParams.delete("page");
      nextParams.set("latitude", parsedLat.toString());
      nextParams.set("longitude", parsedLng.toString());
      const qs = nextParams.toString();
      navigate(`${location.pathname}${qs ? `?${qs}` : ""}`, { replace: true });
    }
    setShowFilters(false); // Close Advanced Filters so results are visible
  };

  const applySearch = useCallback(() => {
    const trimmedSearch = pendingSearch.trim();
    setSearchQuery(trimmedSearch);
    setPendingSearch(trimmedSearch);
    setShowSuggestions(false);
    setSuggestedLocations([]);
  }, [pendingSearch]);

  // Fetch locations from API with optional search (used when user presses Enter or clicks Search in location filter)
  const fetchLocationsWithSearch = useCallback(async () => {
    const searchValue = pendingSearch.trim();
    setLocationsLoading(true);
    setLocationsError(null);
    try {
      const params = searchValue
        ? { search: searchValue, page: 1 }
        : { page: 1 };
      const data = await propertyAPI.getLocations(params);
      if (data?.results) {
        setLocationsFromApi(data.results);
        setLocationsHasMore(!!data.next);
        setLocationsPage(2);
      } else {
        setLocationsFromApi([]);
        setLocationsHasMore(false);
      }
    } catch (err) {
      setLocationsError(err?.message || "Failed to search locations");
      setLocationsFromApi([]);
    } finally {
      setLocationsLoading(false);
    }
  }, [pendingSearch]);

  // Load more locations when user scrolls to the end of the Existing locations list
  const loadMoreLocations = useCallback(async () => {
    if (locationsLoadingMore || !locationsHasMore || locationsPage < 2) return;
    const searchValue = pendingSearch.trim();
    setLocationsLoadingMore(true);
    try {
      const params = { page: locationsPage };
      if (searchValue) params.search = searchValue;
      const data = await propertyAPI.getLocations(params);
      if (data?.results && data.results.length > 0) {
        setLocationsFromApi((prev) => [...prev, ...data.results]);
      }
      setLocationsHasMore(!!data.next);
      setLocationsPage((p) => p + 1);
    } catch (err) {
      setLocationsError(err?.message || "Failed to load more locations");
    } finally {
      setLocationsLoadingMore(false);
    }
  }, [locationsLoadingMore, locationsHasMore, locationsPage, pendingSearch]);

  // Scroll handler for Existing locations list: fetch next page when near bottom
  const handleLocationsListScroll = useCallback(() => {
    const el = locationsListScrollRef.current;
    if (!el || locationsLoadingMore || !locationsHasMore) return;
    const { scrollTop, clientHeight, scrollHeight } = el;
    const threshold = 60;
    if (scrollTop + clientHeight >= scrollHeight - threshold) {
      loadMoreLocations();
    }
  }, [locationsLoadingMore, locationsHasMore, loadMoreLocations]);

  // Add helper function to format area numbers
  const _formatAreaNumber = (number) => {
    if (number >= 10000) {
      return `${(number / 1000).toFixed(1)}K`;
    }
    return number.toString();
  };

  // Helper: land-type properties (e.g. Land for Sale) often have no bedrooms/bathrooms
  const isLandProperty = (property) => {
    const type = getPropertyType(property).toLowerCase();
    return type === "land" || type.includes("land");
  };

  // Helper function to format area with correct unit (uses API area_unit: 'cent' or 'sqft')
  const formatAreaWithUnit = (property) => {
    const area = property?.area;
    if (area == null || area === "" || area === "0") return null;
    const unit = (property?.area_unit || "sqft").toLowerCase();
    return unit === "cent" ? `${area} cent` : `${area} sq ft`;
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
      case "price-asc":
        sorted.sort(
          (a, b) => extractPriceValue(a.price) - extractPriceValue(b.price),
        );
        break;
      case "price-desc":
        sorted.sort(
          (a, b) => extractPriceValue(b.price) - extractPriceValue(a.price),
        );
        break;
      case "newest":
        sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      case "nearest":
        if (userLocation) {
          sorted.sort((a, b) => {
            const distanceA = calculateDistance(
              userLocation.lat,
              userLocation.lng,
              parseFloat(a.latitude),
              parseFloat(a.longitude),
            );
            const distanceB = calculateDistance(
              userLocation.lat,
              userLocation.lng,
              parseFloat(b.latitude),
              parseFloat(b.longitude),
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
    const params = new URLSearchParams(location.search || "");
    const hasSearchParam = params.has("search");
    if (hasSearchParam) {
      setSearchQuery(searchLocation);
      setPendingSearch(searchLocation);
    } else {
      // When URL has no ?search= (e.g. location chosen via lat/lng), do not wipe the display text.
      // We still clear the applied searchQuery so we don't send ?search= to the backend.
      setSearchQuery("");
    }
  }, [searchLocation, location.search]);

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
    amenitiesFilter,
  ]);

  // Note: we no longer auto-fetch geolocation on mount.
  // Location is only set when the user explicitly selects a location
  // from the dropdown or clicks "Use my current location".

  // Parse URL query parameters
  const parseQueryParams = useCallback(() => {
    try {
      // Safely get search params
      const searchParams = new URLSearchParams(location?.search || "");

      // Safely extract parameters with null checks
      const type = searchParams.get("type") || null;
      const category = searchParams.get("category") || null;
      const propertyType = searchParams.get("propertyType") || null;
      const locationParam = searchParams.get("search") || null;
      const price = searchParams.get("price") || null;
      const priceMin = searchParams.get("price_min") || null;
      const priceMax = searchParams.get("price_max") || null;
      const areaUnit = searchParams.get("area_unit") || null;
      const areaMin = searchParams.get("area_min") || null;
      const areaMax = searchParams.get("area_max") || null;
      const sqft = searchParams.get("sqft") || null;
      const cents = searchParams.get("cents") || null;
      const lat =
        searchParams.get("latitude") || searchParams.get("lat") || null;
      const lng =
        searchParams.get("longitude") || searchParams.get("lng") || null;
      const pageSizeParam = searchParams.get("page_size") || null;
      const bedroomsMinParam = searchParams.get("bedrooms_min") || null;
      const bedroomsMaxParam = searchParams.get("bedrooms_max") || null;
      const bathroomsMinParam = searchParams.get("bathrooms_min") || null;
      const bathroomsMaxParam = searchParams.get("bathrooms_max") || null;
      const pageParam = searchParams.get("page") || null;

      // Set listing type filter based on URL parameter
      if (type === "rent") {
        setListingTypeFilter("rent");
      } else if (type === "buy") {
        setListingTypeFilter("buy"); // Banner sends 'buy', we'll map it to 'sell' in filtering
      } else if (type === "sell") {
        setListingTypeFilter("sell");
      }

      // Set property type filter based on URL parameter
      // Priority: category parameter from dropdown > propertyType parameter
      if (category && category !== "all") {
        // Category parameter from dropdown (e.g., 'apartments', 'villas', etc.)
        const categoryFilter = category.toLowerCase();
        setActiveFilter(categoryFilter);
      } else if (propertyType && propertyType.toLowerCase() !== "all") {
        // PropertyType parameter from other sources
        const propertyTypeFilter = propertyType.toLowerCase();
        setActiveFilter(propertyTypeFilter);
      } else {
        // If no property type is specified, set to 'all' to show all property types
        setActiveFilter("all");
      }

      // Set location search
      const hasSearchParam = searchParams.has("search");
      if (hasSearchParam) {
        const normalizedLocation = locationParam || "";
        setSearchQuery(normalizedLocation);
        setPendingSearch(normalizedLocation);
      } else {
        // If URL does not include ?search= (e.g. user selected a location item that sets lat/lng),
        // keep the input display text as-is and ensure we don't send a search param.
        setSearchQuery("");
      }

      // Set price range
      if (priceMin || priceMax) {
        const parsedMin = priceMin ? parseInt(priceMin, 10) : 0;
        const parsedMax = priceMax ? parseInt(priceMax, 10) : 1000000000;
        const normalizedMin = Number.isNaN(parsedMin) ? 0 : parsedMin;
        const normalizedMax = Number.isNaN(parsedMax) ? 1000000000 : parsedMax;
        applyPriceRangeState(normalizedMin, normalizedMax);
      } else if (price && price.includes(",")) {
        const [minStr, maxStr] = price.split(",");
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

      // Set area filters (area_min and area_max)
      if (areaUnit === "sqft" && (areaMin || areaMax)) {
        const parsedMin = areaMin ? parseInt(areaMin, 10) : 0;
        const parsedMax = areaMax ? parseInt(areaMax, 10) : 100000;
        if (!Number.isNaN(parsedMin) || !Number.isNaN(parsedMax)) {
          applySquareFeetRangeState(
            Number.isNaN(parsedMin) ? 0 : Math.max(0, parsedMin),
            Number.isNaN(parsedMax) ? 100000 : Math.min(100000, parsedMax),
          );
          applyCentsRangeState(0, 100000);
        }
      } else if (areaUnit === "cent" && (areaMin || areaMax)) {
        const parsedMin = areaMin ? parseInt(areaMin, 10) : 0;
        const parsedMax = areaMax ? parseInt(areaMax, 10) : 100000;
        if (!Number.isNaN(parsedMin) || !Number.isNaN(parsedMax)) {
          applyCentsRangeState(
            Number.isNaN(parsedMin) ? 0 : Math.max(0, parsedMin),
            Number.isNaN(parsedMax) ? 100000 : Math.min(100000, parsedMax),
          );
          applySquareFeetRangeState(0, 100000);
        }
      } else {
        if (sqft && sqft !== "Square Feet") {
          const [sqftMin, sqftMax] = getSquareFeetRangeFromString(sqft);
          applySquareFeetRangeState(sqftMin, sqftMax);
        } else {
          applySquareFeetRangeState(0, 100000);
        }
        if (cents && cents !== "Any") {
          const [minValue, maxValue] = getCentsRangeFromString(cents);
          applyCentsRangeState(minValue, Math.min(maxValue, 100000));
        } else {
          applyCentsRangeState(0, 100000);
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
          console.error("Error parsing coordinates:", error);
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
          if (parsedBedrooms >= 5) {
            setBedroomsFilter("5+");
          } else {
            const parsedBedroomsMax = bedroomsMaxParam
              ? parseInt(bedroomsMaxParam, 10)
              : null;
            // Treat as exact only when min==max (or max missing)
            if (
              parsedBedroomsMax == null ||
              Number.isNaN(parsedBedroomsMax) ||
              parsedBedroomsMax === parsedBedrooms
            ) {
              setBedroomsFilter(parsedBedrooms.toString());
            } else {
              setBedroomsFilter("any");
            }
          }
        }
      } else {
        setBedroomsFilter("any");
      }

      if (bathroomsMinParam) {
        const parsedBathrooms = parseInt(bathroomsMinParam, 10);
        if (!Number.isNaN(parsedBathrooms)) {
          if (parsedBathrooms >= 4) {
            setBathroomsFilter("4+");
          } else {
            const parsedBathroomsMax = bathroomsMaxParam
              ? parseInt(bathroomsMaxParam, 10)
              : null;
            if (
              parsedBathroomsMax == null ||
              Number.isNaN(parsedBathroomsMax) ||
              parsedBathroomsMax === parsedBathrooms
            ) {
              setBathroomsFilter(parsedBathrooms.toString());
            } else {
              setBathroomsFilter("any");
            }
          }
        }
      } else {
        setBathroomsFilter("any");
      }

      if (pageParam) {
        const parsedPage = parseInt(pageParam, 10);
        if (!Number.isNaN(parsedPage) && parsedPage > 0) {
          if (suppressPageSyncRef.current) {
            suppressPageSyncRef.current = false;
          } else {
            setCurrentPage((prevPage) =>
              prevPage === parsedPage ? prevPage : parsedPage,
            );
          }
        }
      } else {
        if (suppressPageSyncRef.current) {
          suppressPageSyncRef.current = false;
        } else {
          setCurrentPage((prevPage) => (prevPage === 1 ? prevPage : 1));
        }
      }
    } catch (error) {
      console.error("Error parsing URL parameters:", error);
      console.error("Error stack:", error.stack);
      // Don't crash the component, just log the error
    }
  }, [
    location.search,
    applyPriceRangeState,
    applySquareFeetRangeState,
    applyCentsRangeState,
  ]);

  // On mount: reset filters on refresh (reload); preserve URL params when navigating in-app (e.g. Search Properties, Properties dropdown).
  const skipNextParseRef = useRef(true); // Skip parsing URL on first run so defaults stick
  const justAppliedDefaultsRef = useRef(false); // So sync effect doesn't re-push params before state flushes
  const hasResetOnMountRef = useRef(false);
  const justPushedUrlRef = useRef(false); // Skip parsing once after we pushed state to URL (avoids update loop)
  const lastAcceptedLocationSearchRef = useRef(null); // When URL changes from outside (e.g. header Rent/Buy), don't overwrite it
  const appliedUrlParamsOnMountRef = useRef(false); // Skip pushing URL once after we applied home-page params (state not committed yet)
  useEffect(() => {
    if (location.pathname !== "/property-listing" || hasResetOnMountRef.current)
      return;
    hasResetOnMountRef.current = true;

    const navEntry = performance.getEntriesByType?.("navigation")?.[0];
    const isPageReload = navEntry?.type === "reload";

    if (isPageReload) {
      // User refreshed the page: reset all filters and clear URL
      justAppliedDefaultsRef.current = true;
      setActiveFilter("all");
      setPriceRange([0, 1000000000]);
      setDebouncedPriceRange([0, 1000000000]);
      setBedroomsFilter("any");
      setBathroomsFilter("any");
      setOwnershipFilter("all");
      setListingTypeFilter("all");
      setSearchQuery("");
      setPendingSearch("");
      setUserLocation(null);
      setSquareFeetRange([0, 100000]);
      setCentsRange([0, 100000]);
      setSuggestedLocations([]);
      setShowSuggestions(false);
      suppressPageSyncRef.current = true;
      setCurrentPage(1);
      applyPriceRangeState(0, 1000000000);
      applySquareFeetRangeState(0, 100000);
      applyCentsRangeState(0, 100000);
      navigate(location.pathname, { replace: true });
      return;
    }

    // In-app navigation: preserve URL params if any (e.g. from Search Properties or Properties dropdown)
    const hasQueryParams =
      location.search &&
      location.search.trim() !== "" &&
      location.search.trim() !== "?";
    if (!hasQueryParams) {
      justAppliedDefaultsRef.current = true;
      setActiveFilter("all");
      setPriceRange([0, 1000000000]);
      setDebouncedPriceRange([0, 1000000000]);
      setBedroomsFilter("any");
      setBathroomsFilter("any");
      setOwnershipFilter("all");
      setListingTypeFilter("all");
      setSearchQuery("");
      setPendingSearch("");
      setUserLocation(null);
      setSquareFeetRange([0, 100000]);
      setCentsRange([0, 100000]);
      setSuggestedLocations([]);
      setShowSuggestions(false);
      suppressPageSyncRef.current = true;
      setCurrentPage(1);
      applyPriceRangeState(0, 1000000000);
      applySquareFeetRangeState(0, 100000);
      applyCentsRangeState(0, 100000);
      navigate(location.pathname, { replace: true });
    } else {
      // Apply home-page (or other) URL params to state so the first fetch uses them
      appliedUrlParamsOnMountRef.current = true;
      parseQueryParams();
    }
  }, [
    location.pathname,
    location.search,
    applyPriceRangeState,
    applySquareFeetRangeState,
    applyCentsRangeState,
    navigate,
    parseQueryParams,
  ]);

  // Apply URL parameters when URL changes (skip first run so default-no-filter state is not overwritten)
  useEffect(() => {
    if (skipNextParseRef.current) {
      skipNextParseRef.current = false;
      return;
    }
    if (justPushedUrlRef.current) {
      justPushedUrlRef.current = false;
      return;
    }
    parseQueryParams();
  }, [location.search, parseQueryParams]);

  const filterQueryString = useMemo(() => {
    const params = new URLSearchParams();
    if (listingTypeFilter && listingTypeFilter !== "all")
      params.set("type", listingTypeFilter);
    if (activeFilter && activeFilter !== "all") {
      params.set("propertyType", activeFilter);
    }
    if (bedroomsFilter && bedroomsFilter !== "any") {
      if (bedroomsFilter === "5+") {
        params.set("bedrooms_min", "5");
      } else {
        params.set("bedrooms_min", bedroomsFilter);
        params.set("bedrooms_max", bedroomsFilter);
      }
    }
    if (bathroomsFilter && bathroomsFilter !== "any") {
      if (bathroomsFilter === "4+") {
        params.set("bathrooms_min", "4");
      } else {
        params.set("bathrooms_min", bathroomsFilter);
        params.set("bathrooms_max", bathroomsFilter);
      }
    }
    if (
      !(debouncedPriceRange[0] === 0 && debouncedPriceRange[1] === 1000000000)
    ) {
      if (debouncedPriceRange[0] > 0) {
        params.set("price_min", debouncedPriceRange[0].toString());
      }
      if (debouncedPriceRange[1] < 1000000000) {
        params.set("price_max", debouncedPriceRange[1].toString());
      }
    }
    const sqftMin =
      squareFeetRange[0] === ""
        ? 0
        : Math.max(0, Math.min(100000, Number(squareFeetRange[0]) || 0));
    const sqftMax =
      squareFeetRange[1] === ""
        ? 100000
        : Math.max(0, Math.min(100000, Number(squareFeetRange[1]) || 100000));
    const centsMin =
      centsRange[0] === ""
        ? 0
        : Math.max(0, Math.min(100000, Number(centsRange[0]) || 0));
    const centsMax =
      centsRange[1] === ""
        ? 100000
        : Math.max(0, Math.min(100000, Number(centsRange[1]) || 100000));
    const isSquareFeetActive = sqftMin > 0 || (sqftMax > 0 && sqftMax < 100000);
    const isCentsActive = centsMin > 0 || centsMax < 100000;
    if (isSquareFeetActive) {
      params.set("area_unit", "sqft");
      params.set("area_min", sqftMin.toString());
      params.set("area_max", sqftMax.toString());
    } else if (isCentsActive) {
      params.set("area_unit", "cent");
      params.set("area_min", centsMin.toString());
      params.set("area_max", centsMax.toString());
    }
    if (ownershipFilter && ownershipFilter !== "all")
      params.set("ownership", ownershipFilter);
    // When user chose "Use my current location", URL gets only latitude/longitude (no search param)
    const hasUserLocation =
      userLocation &&
      typeof userLocation.lat === "number" &&
      typeof userLocation.lng === "number";
    if (hasUserLocation) {
      params.set("latitude", userLocation.lat.toString());
      params.set("longitude", userLocation.lng.toString());
    } else if (searchQuery && searchQuery.trim()) {
      params.set("search", searchQuery.trim());
    }
    if (itemsPerPage) params.set("page_size", itemsPerPage.toString());
    if (currentPage && currentPage !== 1) params.set("page", currentPage);
    return params.toString();
  }, [
    listingTypeFilter,
    activeFilter,
    bedroomsFilter,
    bathroomsFilter,
    debouncedPriceRange,
    squareFeetRange,
    centsRange,
    ownershipFilter,
    searchQuery,
    userLocation,
    itemsPerPage,
    currentPage,
  ]);

  // Normalize query string (sort keys) so we don't navigate when only param order differs (avoids update loop)
  const normalizeQuery = (search) => {
    if (!search || !search.trim()) return "";
    const params = new URLSearchParams(
      search.startsWith("?") ? search.slice(1) : search,
    );
    const entries = [...params.entries()].sort((a, b) =>
      a[0].localeCompare(b[0]),
    );
    const sorted = new URLSearchParams(entries);
    return sorted.toString();
  };

  // Update URL when filters change (skip pushing state to URL right after we applied defaults, so lat/lng don't reappear)
  useEffect(() => {
    if (justAppliedDefaultsRef.current) {
      justAppliedDefaultsRef.current = false;
      navigate(location.pathname, { replace: true });
      lastAcceptedLocationSearchRef.current = "";
      return;
    }
    const currentSearch = location.search.startsWith("?")
      ? location.search.slice(1)
      : location.search;
    const normalizedFilter = normalizeQuery(filterQueryString);
    const normalizedCurrent = normalizeQuery(currentSearch);

    // Don't overwrite URL until state has caught up with the URL we landed with (e.g. from home search).
    // Otherwise we'd push stale (default) state and drop area/price params, then re-parse would reset state.
    if (appliedUrlParamsOnMountRef.current) {
      lastAcceptedLocationSearchRef.current = normalizedCurrent || "";
      if (normalizedFilter === normalizedCurrent) {
        appliedUrlParamsOnMountRef.current = false;
      }
      return;
    }

    // URL was changed from outside (e.g. user clicked Rent/Buy in header) — don't overwrite; let parseQueryParams sync state
    if (normalizedCurrent !== lastAcceptedLocationSearchRef.current) {
      lastAcceptedLocationSearchRef.current = normalizedCurrent;
      return;
    }
    if (normalizedFilter !== normalizedCurrent) {
      justPushedUrlRef.current = true;
      lastAcceptedLocationSearchRef.current = normalizedFilter;
      const queryString = filterQueryString ? `?${filterQueryString}` : "";
      navigate(`${location.pathname}${queryString}`, { replace: true });
    }
  }, [filterQueryString, navigate, location.pathname, location.search]);

  // Filters section stays closed by default (including when landing from Search Properties or Properties dropdown).

  // Reset filters function
  const resetFilters = () => {
    // Force reset all filters to their default values
    setActiveFilter("all");
    setPriceRange([0, 1000000000]); // Set a very wide range to include all properties
    setDebouncedPriceRange([0, 1000000000]);
    setBedroomsFilter("any");
    setBathroomsFilter("any");
    setDistanceRange(25);
    setOwnershipFilter("all");
    setListingTypeFilter("all");
    setAmenitiesFilter([]);
    setCategoryFilter("residential");
    setSearchQuery("");
    setPendingSearch("");
    setSortOption("newest");
    setSquareFeetRange([0, 100000]); // Set a very wide range
    setCentsRange([0, 100000]); // Set a very wide range
    suppressPageSyncRef.current = true;
    setCurrentPage(1);
    setUserLocation(null); // Reset user location

    // Update URL to remove all parameters
    window.history.replaceState(null, "", window.location.pathname);

    // Force a re-render by updating the state again
    setTimeout(() => {
      setActiveFilter("all");
      setListingTypeFilter("all");
      setSearchQuery("");
      setPendingSearch("");
    }, 100);
  };

  // Move getFilterDescription function here, before the return statement
  const getFilterDescription = () => {
    const parts = [];

    if (listingTypeFilter !== "all") {
      parts.push(listingTypeFilter === "rent" ? "For Rent" : "For Sale");
    }

    if (activeFilter !== "all") {
      parts.push(activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1));
    }

    if (bedroomsFilter !== "any") {
      parts.push(
        `${bedroomsFilter} Bedroom${bedroomsFilter !== "1" ? "s" : ""}`,
      );
    }

    if (parts.length === 0) {
      return "Explore our exclusive property listings";
    }

    return parts.join(" • ");
  };

  // Update the useEffect for getting user location
  useEffect(() => {
    if (sortOption === "nearest" && !userLocation) {
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

      // Set user location (this triggers fetch with lat/lng and updates URL)
      setUserLocation({
        lat: latitude,
        lng: longitude,
      });

      // Close the filters section so the user sees the results
      setExpandedFilter(null);
      setShowFilters(false);

      // Get address from coordinates using reverse geocoding (for display in the input)
      fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
      )
        .then((response) => response.json())
        .then((data) => {
          if (data && data.display_name) {
            // Extract city/locality from the address
            const locality =
              data.address.city ||
              data.address.town ||
              data.address.village ||
              data.address.suburb ||
              data.address.county;

            const locationString = locality
              ? `${locality}, ${data.address.state || ""}`
              : data.display_name;
            setSearchQuery(locationString);
            setPendingSearch(locationString);
          }
        })
        .catch((error) => {
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
      switch (error.code) {
        case error.PERMISSION_DENIED:
          setLocationError(
            "Location permission denied. Please enable location services in your browser.",
          );
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
      maximumAge: 0,
    };

    navigator.geolocation.getCurrentPosition(
      successCallback,
      errorCallback,
      options,
    );
  };

  // Update the search input in the filters section
  const searchInputSection = (
    <div className="relative w-full">
      <div className="w-full rounded-lg border border-gray-200 bg-white overflow-hidden flex items-stretch">
        <div className="flex items-center pl-4 pr-2 text-gray-400">
          <FaMapMarkerAlt className="w-4 h-4" />
        </div>
        <input
          type="text"
          placeholder="Enter location"
          value={pendingSearch}
          onChange={(e) => handleLocationSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              fetchLocationsWithSearch();
            }
          }}
          className="flex-1 py-3 pr-3 text-gray-700 placeholder-gray-400 outline-none ring-0 border-0 min-w-0 focus:outline-none focus:ring-0 focus:border-0 caret-gray-800"
        />
        {pendingSearch && (
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setPendingSearch("");
              setUserLocation(null);
              setSuggestedLocations([]);
              setShowSuggestions(false);
            }}
            className="px-3 text-gray-400 hover:text-gray-600"
            aria-label="Clear location"
          >
            <FaTimes className="w-4 h-4" />
          </button>
        )}
        <button
          type="button"
          onClick={fetchLocationsWithSearch}
          className="px-4 bg-green-600 text-white hover:bg-green-700 transition-colors duration-200 flex items-center gap-2 whitespace-nowrap"
        >
          <FaSearch className="w-4 h-4" />
          <span className="text-sm font-medium">Search</span>
        </button>
      </div>

      {/* Autocomplete suggestions intentionally disabled */}
    </div>
  );

  const getFilterCardClasses = (section) =>
    `w-full bg-gray-50 p-4 rounded-lg border transition-all duration-300 self-stretch min-h-[5rem] ${
      expandedFilter === section
        ? "shadow-lg border-gray-200"
        : "border-gray-100"
    }`;
  const filterHeaderClasses =
    "flex justify-between items-center cursor-pointer min-h-12";

  // Find the location filter section and update it
  const locationFilterSection = (
    <Motion.div layout className={getFilterCardClasses("location")}>
      <div
        className={filterHeaderClasses}
        onClick={() => toggleFilterSection("location")}
      >
        <h3 className="text-lg font-medium text-gray-800 flex items-center">
          <span className="w-1.5 h-5 bg-green-600 rounded-full mr-2"></span>
          Location
        </h3>
        <span>
          {expandedFilter === "location" ? <FaChevronUp /> : <FaChevronDown />}
        </span>
      </div>

      <AnimatePresence initial={false}>
        {expandedFilter === "location" && (
          <Motion.div
            key="location-content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="space-y-4 pb-6">
              {/* Search Input */}
              {searchInputSection}

              {/* Existing locations from properties/locations API */}
              <div className="pt-2 border-t border-gray-100">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Existing locations
                </p>
                {locationsLoading ? (
                  <div className="border border-gray-200 rounded-lg bg-white p-4 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-green-600"></div>
                    <span className="ml-2 text-gray-500 text-sm">
                      Loading locations...
                    </span>
                  </div>
                ) : locationsError ? (
                  <div className="border border-gray-200 rounded-lg bg-red-50 p-3 text-red-600 text-sm">
                    {locationsError}
                  </div>
                ) : locationsFromApi.length === 0 ? (
                  <div className="border border-gray-200 rounded-lg bg-white p-3 text-gray-500 text-sm">
                    No locations found. Please update your location keyword.
                  </div>
                ) : (
                  <div
                    ref={locationsListScrollRef}
                    onScroll={handleLocationsListScroll}
                    className="border border-gray-200 rounded-lg bg-white max-h-48 overflow-y-auto shadow-inner"
                  >
                    {locationsFromApi.map((loc, index) => {
                      const item = {
                        displayText:
                          loc.location_name ||
                          `${loc.city || ""}, ${loc.district || ""}, ${loc.state || ""}`
                            .replace(/^,\s*|,\s*$/g, "")
                            .trim() ||
                          "Unknown",
                        latitude: parseFloat(loc.latitude),
                        longitude: parseFloat(loc.longitude),
                      };
                      return (
                        <div
                          key={loc.id != null ? loc.id : index}
                          className="px-3 py-2.5 hover:bg-green-50 cursor-pointer border-b border-gray-100 last:border-b-0 flex items-center gap-2"
                          onClick={() => handleSuggestionSelect(item)}
                        >
                          <FaMapMarkerAlt className="text-green-500 flex-shrink-0" />
                          <span className="text-gray-700 text-sm">
                            {item.displayText}
                          </span>
                        </div>
                      );
                    })}
                    {locationsLoadingMore && (
                      <div className="px-3 py-2.5 flex items-center justify-center gap-2 text-gray-500 text-sm border-t border-gray-100">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-green-600" />
                        <span>Loading more...</span>
                      </div>
                    )}
                    {locationsHasMore &&
                      !locationsLoadingMore &&
                      locationsFromApi.length > 0 && (
                        <div className="px-3 py-1.5 text-center text-gray-400 text-xs border-t border-gray-100">
                          Scroll for more
                        </div>
                      )}
                  </div>
                )}
              </div>

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
                    ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                    : "bg-white border border-green-500 text-green-600 hover:bg-green-50"
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
          </Motion.div>
        )}
      </AnimatePresence>
    </Motion.div>
  );

  // Add areaFiltersSection after the price range filter in Column 2
  const _areaFiltersSection = (
    <>
      {/* Square Feet Filter */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
        <div
          className={filterHeaderClasses}
          onClick={() => toggleFilterSection("squareFeet")}
        >
          <h3 className="text-lg font-medium text-gray-800 flex items-center">
            <span className="w-1.5 h-5 bg-green-600 rounded-full mr-2"></span>
            Built-up Area (Sq.ft)
          </h3>
          <span>
            {expandedFilter === "squareFeet" ? (
              <FaChevronUp />
            ) : (
              <FaChevronDown />
            )}
          </span>
        </div>

        {expandedFilter === "squareFeet" && (
          <div className="mt-4 px-2 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Area (min) sq.ft
              </label>
              <input
                type="number"
                min="0"
                max="100000"
                step="100"
                value={squareFeetRange[0] === "" ? "" : squareFeetRange[0]}
                onChange={(e) => {
                  const raw = e.target.value;
                  if (raw === "") {
                    setSquareFeetRange((prev) => ["", prev[1]]);
                    return;
                  }
                  const v = parseInt(raw, 10);
                  const num = Number.isNaN(v)
                    ? 0
                    : Math.max(0, Math.min(100000, v));
                  setSquareFeetRange((prev) => [num, prev[1]]);
                }}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Area (max) sq.ft
              </label>
              <input
                type="number"
                min="0"
                max="100000"
                step="100"
                value={squareFeetRange[1] === "" ? "" : squareFeetRange[1]}
                onChange={(e) => {
                  const raw = e.target.value;
                  if (raw === "") {
                    setSquareFeetRange((prev) => [prev[0], ""]);
                    return;
                  }
                  const v = parseInt(raw, 10);
                  const num = Number.isNaN(v)
                    ? 100000
                    : Math.max(0, Math.min(100000, v));
                  setSquareFeetRange((prev) => [prev[0], num]);
                }}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>
        )}
      </div>

      {/* Cents Filter */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
        <div
          className={filterHeaderClasses}
          onClick={() => toggleFilterSection("cents")}
        >
          <h3 className="text-lg font-medium text-gray-800 flex items-center">
            <span className="w-1.5 h-5 bg-green-600 rounded-full mr-2"></span>
            Land Area (Cents)
          </h3>
          <span>
            {expandedFilter === "cents" ? <FaChevronUp /> : <FaChevronDown />}
          </span>
        </div>

        {expandedFilter === "cents" && (
          <div className="mt-4 px-2 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Area (min) cents
              </label>
              <input
                type="number"
                min="0"
                max="100000"
                step="1"
                value={centsRange[0] === "" ? "" : centsRange[0]}
                onChange={(e) => {
                  const raw = e.target.value;
                  if (raw === "") {
                    setCentsRange((prev) => ["", prev[1]]);
                    return;
                  }
                  const v = parseInt(raw, 10);
                  const num = Number.isNaN(v)
                    ? 0
                    : Math.max(0, Math.min(100000, v));
                  setCentsRange((prev) => [num, prev[1]]);
                }}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Area (max) cents
              </label>
              <input
                type="number"
                min="0"
                max="100000"
                step="1"
                value={centsRange[1] === "" ? "" : centsRange[1]}
                onChange={(e) => {
                  const raw = e.target.value;
                  if (raw === "") {
                    setCentsRange((prev) => [prev[0], ""]);
                    return;
                  }
                  const v = parseInt(raw, 10);
                  const num = Number.isNaN(v)
                    ? 100000
                    : Math.max(0, Math.min(100000, v));
                  setCentsRange((prev) => [prev[0], num]);
                }}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
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
        <h3 className="text-2xl font-bold text-gray-900 mb-3">
          No Properties Found
        </h3>
        <p className="text-gray-600 mb-8">
          We couldn't find any properties matching your current filters. Try
          adjusting your search criteria to find more options.
        </p>

        {/* Suggestions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h4 className="font-semibold text-gray-800 mb-4">
            Try these suggestions:
          </h4>
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
      return "Listed today";
    } else if (diffDays === 1) {
      return "Listed yesterday";
    } else if (diffDays < 7) {
      return `Listed ${diffDays} days ago`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `Listed ${weeks} ${weeks === 1 ? "week" : "weeks"} ago`;
    } else {
      return `Listed on ${date.toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
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
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Something went wrong
              </h2>
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
        <div
          className="relative h-[50vh] bg-fixed bg-center bg-cover mb-8 overflow-hidden"
          style={{
            backgroundImage:
              "url(https://images.prismic.io/villaplus/Z-48L3dAxsiBwQXr_3840X1500.jpg)",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/60 to-black/30"></div>
          <Motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-green-500/20 blur-3xl"
          />
          <Motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            transition={{ duration: 1.2, delay: 0.2 }}
            className="absolute -bottom-20 -right-24 w-80 h-80 rounded-full bg-emerald-400/20 blur-3xl"
          />
          <div className="container mx-auto container-padding h-full flex items-center">
            <div className="relative z-10 max-w-3xl">
              <Motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="heading-1 mb-4 text-white leading-tight text-left"
              >
                Find Your Perfect Asset
              </Motion.h1>
              <Motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="body-medium text-gray-200 mb-8 text-left"
              >
                {getFilterDescription()}
              </Motion.p>

              {/* Search Bar */}
              <Motion.div
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
                        if (e.key === "Enter") {
                          e.preventDefault();
                          applySearch();
                        }
                      }}
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                      {pendingSearch && (
                        <button
                          onClick={() => {
                            setSearchQuery("");
                            setPendingSearch("");
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
                    {showFilters ? "Hide Filters" : "Show Filters"}
                  </button>
                </div>
              </Motion.div>
            </div>
          </div>
        </div>

        <div className="container mx-auto container-padding pb-12">
          {/* Filters Section - Premium Design */}
          {showFilters && (
            <Motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-xl shadow-lg p-6 mb-8 border-t-4 border-green-600"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">
                  Advanced Filters
                </h2>
                <button
                  onClick={() => setShowFilters(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FaTimes />
                </button>
              </div>

              <div
                className={`grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-stretch ${expandedFilter ? "pb-20" : ""}`}
              >
                {locationFilterSection}

                {/* Property Type Filter */}
                <Motion.div
                  layout
                  className={getFilterCardClasses("propertyType")}
                >
                  <div
                    className={filterHeaderClasses}
                    onClick={() => toggleFilterSection("propertyType")}
                  >
                    <h3 className="text-lg font-medium text-gray-800 flex items-center">
                      <span className="w-1.5 h-5 bg-green-600 rounded-full mr-2"></span>
                      Property Type
                    </h3>
                    <span>
                      {expandedFilter === "propertyType" ? (
                        <FaChevronUp />
                      ) : (
                        <FaChevronDown />
                      )}
                    </span>
                  </div>

                  <AnimatePresence initial={false}>
                    {expandedFilter === "propertyType" && (
                      <Motion.div
                        key="propertyType-content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="mt-4 pb-6">
                          <button
                            onClick={() => setActiveFilter("all")}
                            className={`w-full mb-3 px-4 py-2 rounded-lg text-sm transition-all duration-300 ${
                              activeFilter === "all"
                                ? "bg-green-600 text-white font-medium shadow-md"
                                : "bg-white text-gray-700 border border-gray-200 hover-border-green-300"
                            }`}
                          >
                            All Properties
                          </button>

                          {Object.entries(propertyTypeCategories).map(
                            ([category, types]) => (
                              <div key={category} className="mb-4">
                                <h4 className="text-sm font-medium text-gray-600 mb-2">
                                  {category}
                                </h4>
                                <div className="grid grid-cols-2 gap-2">
                                  {types.map((type) => (
                                    <button
                                      key={type}
                                      onClick={() =>
                                        setActiveFilter(type.toLowerCase())
                                      }
                                      className={`px-3 py-2 rounded-lg text-sm transition-all duration-300 ${
                                        activeFilter === type.toLowerCase()
                                          ? "bg-green-600 text-white font-medium shadow-md"
                                          : "bg-white text-gray-700 border border-gray-200 hover-border-green-300"
                                      }`}
                                    >
                                      {type}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            ),
                          )}
                        </div>
                      </Motion.div>
                    )}
                  </AnimatePresence>
                </Motion.div>

                {/* Price Range Filter */}
                <Motion.div
                  layout
                  className={getFilterCardClasses("priceRange")}
                >
                  <div
                    className={filterHeaderClasses}
                    onClick={() => toggleFilterSection("priceRange")}
                  >
                    <h3 className="text-lg font-medium text-gray-800 flex items-center">
                      <span className="w-1.5 h-5 bg-green-600 rounded-full mr-2"></span>
                      Price Range
                    </h3>
                    <span>
                      {expandedFilter === "priceRange" ? (
                        <FaChevronUp />
                      ) : (
                        <FaChevronDown />
                      )}
                    </span>
                  </div>

                  <AnimatePresence initial={false}>
                    {expandedFilter === "priceRange" && (
                      <Motion.div
                        key="priceRange-content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="mt-4 px-2 pb-6">
                          <div className="flex justify-between text-sm text-gray-600 mb-2">
                            <span>₹{(priceRange[0] / 100000).toFixed(1)}L</span>
                            <span>
                              ₹
                              {priceRange[1] >= 10000000
                                ? `${(priceRange[1] / 10000000).toFixed(1)}Cr`
                                : `${(priceRange[1] / 100000).toFixed(1)}L`}
                            </span>
                          </div>
                          <div className="relative pt-1">
                            <input
                              type="range"
                              min="100000"
                              max="100000000"
                              step="100000"
                              value={priceRange[1]}
                              onChange={(e) =>
                                setPriceRange([
                                  100000,
                                  parseInt(e.target.value),
                                ])
                              }
                              className="w-full h-2 bg-green-100 rounded-lg appearance-none cursor-pointer accent-green-600"
                            />
                            <div className="absolute -bottom-6 left-0 right-0 flex justify-between text-xs text-gray-500">
                              <span>₹1L</span>
                              <span>₹10Cr</span>
                            </div>
                          </div>
                          <div className="mt-8 grid grid-cols-2 gap-2">
                            {[
                              "Under ₹25L",
                              "₹25L - ₹50L",
                              "₹50L - ₹1Cr",
                              "₹1Cr - ₹2Cr",
                              "₹2Cr - ₹5Cr",
                              "₹5Cr - ₹10Cr",
                            ].map((range) => (
                              <button
                                key={range}
                                onClick={() =>
                                  setPriceRange(getPriceRangeFromString(range))
                                }
                                className={`px-3 py-2 rounded-lg text-sm transition-all duration-300 ${
                                  priceRange[1] ===
                                  getPriceRangeFromString(range)[1]
                                    ? "bg-green-600 text-white font-medium shadow-md"
                                    : "bg-white text-gray-700 border border-gray-200 hover-border-green-300"
                                }`}
                              >
                                {range}
                              </button>
                            ))}
                          </div>
                        </div>
                      </Motion.div>
                    )}
                  </AnimatePresence>
                </Motion.div>

                {/* Square Feet Filter */}
                <Motion.div
                  layout
                  className={getFilterCardClasses("squareFeet")}
                >
                  <div
                    className={filterHeaderClasses}
                    onClick={() => toggleFilterSection("squareFeet")}
                  >
                    <h3 className="text-lg font-medium text-gray-800 flex items-center">
                      <span className="w-1.5 h-5 bg-green-600 rounded-full mr-2"></span>
                      Built-up Area (Sq.ft)
                    </h3>
                    <span>
                      {expandedFilter === "squareFeet" ? (
                        <FaChevronUp />
                      ) : (
                        <FaChevronDown />
                      )}
                    </span>
                  </div>

                  <AnimatePresence initial={false}>
                    {expandedFilter === "squareFeet" && (
                      <Motion.div
                        key="squareFeet-content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="mt-4 px-2 pb-6 space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Area (min) sq.ft
                            </label>
                            <input
                              type="number"
                              min="0"
                              max="100000"
                              step="100"
                              value={
                                squareFeetRange[0] === ""
                                  ? ""
                                  : squareFeetRange[0]
                              }
                              onChange={(e) => {
                                const raw = e.target.value;
                                if (raw === "") {
                                  setSquareFeetRange((prev) => ["", prev[1]]);
                                  return;
                                }
                                const v = parseInt(raw, 10);
                                const num = Number.isNaN(v)
                                  ? 0
                                  : Math.max(0, Math.min(100000, v));
                                setSquareFeetRange((prev) => [num, prev[1]]);
                              }}
                              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Area (max) sq.ft
                            </label>
                            <input
                              type="number"
                              min="0"
                              max="100000"
                              step="100"
                              value={
                                squareFeetRange[1] === ""
                                  ? ""
                                  : squareFeetRange[1]
                              }
                              onChange={(e) => {
                                const raw = e.target.value;
                                if (raw === "") {
                                  setSquareFeetRange((prev) => [prev[0], ""]);
                                  return;
                                }
                                const v = parseInt(raw, 10);
                                const num = Number.isNaN(v)
                                  ? 100000
                                  : Math.max(0, Math.min(100000, v));
                                setSquareFeetRange((prev) => [prev[0], num]);
                              }}
                              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                          </div>
                        </div>
                      </Motion.div>
                    )}
                  </AnimatePresence>
                </Motion.div>

                {/* Cents Filter */}
                <Motion.div layout className={getFilterCardClasses("cents")}>
                  <div
                    className={filterHeaderClasses}
                    onClick={() => toggleFilterSection("cents")}
                  >
                    <h3 className="text-lg font-medium text-gray-800 flex items-center">
                      <span className="w-1.5 h-5 bg-green-600 rounded-full mr-2"></span>
                      Land Area (Cents)
                    </h3>
                    <span>
                      {expandedFilter === "cents" ? (
                        <FaChevronUp />
                      ) : (
                        <FaChevronDown />
                      )}
                    </span>
                  </div>

                  <AnimatePresence initial={false}>
                    {expandedFilter === "cents" && (
                      <Motion.div
                        key="cents-content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="mt-4 px-2 pb-6 space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Area (min) cents
                            </label>
                            <input
                              type="number"
                              min="0"
                              max="100000"
                              step="1"
                              value={centsRange[0] === "" ? "" : centsRange[0]}
                              onChange={(e) => {
                                const raw = e.target.value;
                                if (raw === "") {
                                  setCentsRange((prev) => ["", prev[1]]);
                                  return;
                                }
                                const v = parseInt(raw, 10);
                                const num = Number.isNaN(v)
                                  ? 0
                                  : Math.max(0, Math.min(100000, v));
                                setCentsRange((prev) => [num, prev[1]]);
                              }}
                              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Area (max) cents
                            </label>
                            <input
                              type="number"
                              min="0"
                              max="100000"
                              step="1"
                              value={centsRange[1] === "" ? "" : centsRange[1]}
                              onChange={(e) => {
                                const raw = e.target.value;
                                if (raw === "") {
                                  setCentsRange((prev) => [prev[0], ""]);
                                  return;
                                }
                                const v = parseInt(raw, 10);
                                const num = Number.isNaN(v)
                                  ? 100000
                                  : Math.max(0, Math.min(100000, v));
                                setCentsRange((prev) => [prev[0], num]);
                              }}
                              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                          </div>
                        </div>
                      </Motion.div>
                    )}
                  </AnimatePresence>
                </Motion.div>

                {/* Ownership Filter */}
                <Motion.div
                  layout
                  className={getFilterCardClasses("ownership")}
                >
                  <div
                    className={filterHeaderClasses}
                    onClick={() => toggleFilterSection("ownership")}
                  >
                    <h3 className="text-lg font-medium text-gray-800 flex items-center">
                      <span className="w-1.5 h-5 bg-green-600 rounded-full mr-2"></span>
                      Ownership
                    </h3>
                    <span>
                      {expandedFilter === "ownership" ? (
                        <FaChevronUp />
                      ) : (
                        <FaChevronDown />
                      )}
                    </span>
                  </div>

                  <AnimatePresence initial={false}>
                    {expandedFilter === "ownership" && (
                      <Motion.div
                        key="ownership-content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="mt-4 pb-6 flex flex-wrap gap-2">
                          <button
                            onClick={() => setOwnershipFilter("all")}
                            className={`px-4 py-2 rounded-lg text-sm transition-all duration-300 ${
                              ownershipFilter === "all"
                                ? "bg-green-600 text-white font-medium shadow-md"
                                : "bg-white text-gray-700 border border-gray-200 hover-border-green-300"
                            }`}
                          >
                            All
                          </button>
                          <button
                            onClick={() => setOwnershipFilter("direct_owner")}
                            className={`px-4 py-2 rounded-lg text-sm transition-all duration-300 ${
                              ownershipFilter === "direct_owner"
                                ? "bg-green-600 text-white font-medium shadow-md"
                                : "bg-white text-gray-700 border border-gray-200 hover-border-green-300"
                            }`}
                          >
                            Direct Owner
                          </button>
                          <button
                            onClick={() => setOwnershipFilter("management")}
                            className={`px-4 py-2 rounded-lg text-sm transition-all duration-300 ${
                              ownershipFilter === "management"
                                ? "bg-green-600 text-white font-medium shadow-md"
                                : "bg-white text-gray-700 border border-gray-200 hover-border-green-300"
                            }`}
                          >
                            Management
                          </button>
                        </div>
                      </Motion.div>
                    )}
                  </AnimatePresence>
                </Motion.div>

                {/* Listing Type Filter */}
                <Motion.div
                  layout
                  className={getFilterCardClasses("listingType")}
                >
                  <div
                    className={filterHeaderClasses}
                    onClick={() => toggleFilterSection("listingType")}
                  >
                    <h3 className="text-lg font-medium text-gray-800 flex items-center">
                      <span className="w-1.5 h-5 bg-green-600 rounded-full mr-2"></span>
                      Listing Type
                    </h3>
                    <span>
                      {expandedFilter === "listingType" ? (
                        <FaChevronUp />
                      ) : (
                        <FaChevronDown />
                      )}
                    </span>
                  </div>

                  <AnimatePresence initial={false}>
                    {expandedFilter === "listingType" && (
                      <Motion.div
                        key="listingType-content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="mt-4 pb-6 flex flex-wrap gap-2">
                          {["all", "rent", "buy"].map((type) => (
                            <button
                              key={type}
                              onClick={() => setListingTypeFilter(type)}
                              className={`px-4 py-2 rounded-lg text-sm transition-all duration-300 ${
                                listingTypeFilter === type
                                  ? "bg-green-600 text-white font-medium shadow-md"
                                  : "bg-white text-gray-700 border border-gray-200 hover-border-green-300"
                              }`}
                            >
                              {type === "all"
                                ? "All"
                                : type === "rent"
                                  ? "For Rent"
                                  : "For Sale"}
                            </button>
                          ))}
                        </div>
                      </Motion.div>
                    )}
                  </AnimatePresence>
                </Motion.div>

                {/* Bedrooms Filter */}
                <Motion.div layout className={getFilterCardClasses("bedrooms")}>
                  <div
                    className={filterHeaderClasses}
                    onClick={() => toggleFilterSection("bedrooms")}
                  >
                    <h3 className="text-lg font-medium text-gray-800 flex items-center">
                      <span className="w-1.5 h-5 bg-green-600 rounded-full mr-2"></span>
                      Bedrooms
                    </h3>
                    <span>
                      {expandedFilter === "bedrooms" ? (
                        <FaChevronUp />
                      ) : (
                        <FaChevronDown />
                      )}
                    </span>
                  </div>

                  <AnimatePresence initial={false}>
                    {expandedFilter === "bedrooms" && (
                      <Motion.div
                        key="bedrooms-content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="mt-4 pb-6 flex flex-wrap gap-2">
                          {["any", "1", "2", "3", "4", "5+"].map((num) => (
                            <button
                              key={num}
                              onClick={() => setBedroomsFilter(num)}
                              className={`px-4 py-2 rounded-lg text-sm transition-all duration-300 ${
                                bedroomsFilter === num
                                  ? "bg-green-600 text-white font-medium shadow-md"
                                  : "bg-white text-gray-700 border border-gray-200 hover-border-green-300"
                              }`}
                            >
                              {num === "any" ? "Any" : num}
                            </button>
                          ))}
                        </div>
                      </Motion.div>
                    )}
                  </AnimatePresence>
                </Motion.div>

                {/* Bathrooms Filter */}
                <Motion.div
                  layout
                  className={getFilterCardClasses("bathrooms")}
                >
                  <div
                    className={filterHeaderClasses}
                    onClick={() => toggleFilterSection("bathrooms")}
                  >
                    <h3 className="text-lg font-medium text-gray-800 flex items-center">
                      <span className="w-1.5 h-5 bg-green-600 rounded-full mr-2"></span>
                      Bathrooms
                    </h3>
                    <span>
                      {expandedFilter === "bathrooms" ? (
                        <FaChevronUp />
                      ) : (
                        <FaChevronDown />
                      )}
                    </span>
                  </div>

                  <AnimatePresence initial={false}>
                    {expandedFilter === "bathrooms" && (
                      <Motion.div
                        key="bathrooms-content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="mt-4 pb-6 flex flex-wrap gap-2">
                          {["any", "1", "2", "3", "4+"].map((num) => (
                            <button
                              key={num}
                              onClick={() => setBathroomsFilter(num)}
                              className={`px-4 py-2 rounded-lg text-sm transition-all duration-300 ${
                                bathroomsFilter === num
                                  ? "bg-green-600 text-white font-medium shadow-md"
                                  : "bg-white text-gray-700 border border-gray-200 hover-border-green-300"
                              }`}
                            >
                              {num === "any" ? "Any" : num}
                            </button>
                          ))}
                        </div>
                      </Motion.div>
                    )}
                  </AnimatePresence>
                </Motion.div>

                {/* Amenities Filter */}
                {/*
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <div 
                    className={filterHeaderClasses}
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
            </Motion.div>
          )}

          {/* Listings Header */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-6">
            <div className="mb-4 md:mb-0">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                <span className="w-1.5 h-6 bg-green-600 rounded-full mr-2"></span>
                Premium Properties
              </h2>
              <p className="text-gray-600">
                Showing{" "}
                <span className="font-semibold text-green-600">
                  {currentProperties.length}
                </span>{" "}
                of{" "}
                <span className="font-semibold">{sortedProperties.length}</span>{" "}
                exclusive listings
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
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded ${viewMode === "grid" ? "bg-green-600 text-white" : "text-gray-500 hover:bg-gray-100"} transition-all duration-300`}
                >
                  <FaThLarge />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded ${viewMode === "list" ? "bg-green-600 text-white" : "text-gray-500 hover:bg-gray-100"} transition-all duration-300`}
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
                <div
                  key={item}
                  className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 animate-pulse"
                >
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
                isPageTransitioning
                  ? "opacity-95 scale-[0.997]"
                  : "opacity-100 scale-100"
              }`}
            >
              {isPageTransitioning && (
                <div className="absolute inset-0 rounded-2xl bg-white/40 backdrop-blur-[1px] pointer-events-none" />
              )}
              {viewMode === "list" ? (
                <div className="space-y-6">
                  {currentProperties.map((property) => (
                    <Motion.div
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
                          getDirections(e, {
                            google_maps_url: property.google_maps_url,
                          });
                        }}
                        className="absolute top-3 right-3 z-10 bg-blue-100 p-3 rounded-full shadow-md hover:bg-blue-200 transition-all duration-300"
                        title="Get directions"
                      >
                        <FaDirections className="text-blue-600 text-2xl" />
                      </button>

                      <div className="flex flex-col lg:flex-row h-full">
                        <div className="relative w-full lg:w-2/5 h-[240px] lg:h-full overflow-hidden">
                          <img
                            src={
                              property.images[0]?.image ||
                              "default-image-url.jpg"
                            }
                            alt={property.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                          <div className="absolute top-3 left-3 flex flex-col space-y-2">
                            {/* List View Badge */}
                            <span
                              className={`text-xs font-bold px-3 py-1.5 rounded-full ${
                                property.property_ownership === "direct_owner"
                                  ? "bg-gradient-to-r from-green-800 via-green-600 to-green-500 text-white"
                                  : "bg-gradient-to-r from-green-600 via-green-500 to-green-400 text-white"
                              }`}
                            >
                              <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 animate-shimmer"></span>
                              <span className="relative font-bold">
                                {property.property_ownership === "direct_owner"
                                  ? "Direct Owner"
                                  : "Management Property"}
                              </span>
                            </span>
                          </div>
                          {/* Price overlay on mobile */}
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 lg:hidden">
                            <h3 className="text-xl font-bold text-white">
                              ₹ {property.price}
                              {property.property_for === "rent" && (
                                <span className="text-sm font-normal text-gray-200 ml-2">
                                  /month
                                </span>
                              )}
                            </h3>
                          </div>
                        </div>
                        <div className="p-4 lg:p-6 flex flex-col justify-between w-full lg:w-3/5">
                          <div className="flex-grow">
                            {/* Price for desktop */}
                            <div className="hidden lg:flex justify-between items-start mb-2">
                              <h3 className="text-xl lg:text-2xl font-bold text-gray-800">
                                ₹ {property.price}
                                {property.property_for === "rent" && (
                                  <span className="text-sm font-normal text-gray-500 ml-2">
                                    /month
                                  </span>
                                )}
                              </h3>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 mb-3">
                              <span className="text-xs font-semibold px-2 py-1 rounded-md bg-green-100 text-green-800">
                                {property.property_for === "rent"
                                  ? "For Rent"
                                  : "For Sale"}
                              </span>
                              <div className="flex items-center bg-gray-50 px-2 py-1 rounded-full text-sm">
                                <FaBed className="text-green-500 mr-1" />
                                <span className="text-gray-700">
                                  {property.bedrooms}
                                </span>
                              </div>
                              <div className="flex items-center bg-gray-50 px-2 py-1 rounded-full text-sm">
                                <FaBath className="text-green-500 mr-1" />
                                <span className="text-gray-700">
                                  {property.bathrooms}
                                </span>
                              </div>
                              {formatAreaWithUnit(property) && (
                                <div className="flex items-center bg-gray-50 px-2 py-1 rounded-full text-sm">
                                  <FaRulerCombined className="text-green-500 mr-1" />
                                  <span className="text-gray-700">
                                    {formatAreaWithUnit(property)}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div>
                              <h4 className="text-base lg:text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
                                {property.title}
                              </h4>
                              <div className="mb-3">
                                <ExpandableText
                                  text={
                                    property.description ||
                                    "No description available"
                                  }
                                  maxLength={150}
                                />
                              </div>
                              <div className="flex items-start mb-3">
                                <FaMapMarkerAlt
                                  className="text-blue-500 mr-2 mt-1 flex-shrink-0 cursor-pointer hover:text-green-700"
                                  onClick={(e) =>
                                    getDirections(e, {
                                      google_maps_url: property.google_maps_url,
                                    })
                                  }
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
                    </Motion.div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {currentProperties.map((property) => (
                    <Motion.div
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
                          getDirections(e, {
                            google_maps_url: property.google_maps_url,
                          });
                        }}
                        className="absolute top-3 right-3 z-10 bg-green-100 p-3 rounded-full shadow-md hover:bg-green-200 transition-all duration-300"
                        title="Get directions"
                      >
                        <FaDirections className="text-green-600 text-2xl" />
                      </button>

                      <div className="relative h-[220px] overflow-hidden">
                        <img
                          src={
                            property.images[0]?.image || "default-image-url.jpg"
                          }
                          alt={property.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute top-3 left-3 flex flex-col space-y-2">
                          {/* Grid View Badge */}
                          <span
                            className={`text-xs font-bold px-3 py-1.5 rounded-full ${
                              property.property_ownership === "direct_owner"
                                ? "bg-gradient-to-r from-green-800 via-green-600 to-green-500 text-white"
                                : "bg-gradient-to-r from-green-600 via-green-500 to-green-400 text-white"
                            }`}
                          >
                            <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 animate-shimmer"></span>
                            <span className="relative font-bold">
                              {property.property_ownership === "direct_owner"
                                ? "Direct Owner"
                                : "Management Property"}
                            </span>
                          </span>
                        </div>

                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                          <h3 className="text-xl font-bold text-white">
                            ₹ {parseFloat(property.price).toLocaleString()}
                            {property.property_for === "rent" && (
                              <span className="text-sm font-normal text-gray-200 ml-2">
                                /month
                              </span>
                            )}
                          </h3>
                        </div>
                      </div>
                      <div className="p-4 flex flex-col h-[260px]">
                        <div className="flex-grow">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
                              {property.property_for === "rent"
                                ? "For Rent"
                                : "For Sale"}
                            </span>
                          </div>
                          <h4 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
                            {property.title}
                          </h4>
                          <div className="mb-3">
                            <ExpandableText
                              text={
                                property.description ||
                                "No description available"
                              }
                              maxLength={150}
                            />
                          </div>
                          <div className="flex flex-wrap items-center gap-2 mb-3">
                            {property.bedrooms &&
                              property.bedrooms !== "0" &&
                              property.bedrooms !== "" &&
                              !isLandProperty(property) && (
                                <div className="flex items-center bg-gray-50 px-2 py-1 rounded-full text-sm">
                                  <FaBed className="text-green-500 mr-1" />
                                  <span className="text-gray-700">
                                    {property.bedrooms}
                                  </span>
                                </div>
                              )}
                            {property.bathrooms &&
                              property.bathrooms !== "0" &&
                              property.bathrooms !== "" &&
                              !isLandProperty(property) && (
                                <div className="flex items-center bg-gray-50 px-2 py-1 rounded-full text-sm">
                                  <FaBath className="text-green-500 mr-1" />
                                  <span className="text-gray-700">
                                    {property.bathrooms}
                                  </span>
                                </div>
                              )}
                            {formatAreaWithUnit(property) && (
                              <div className="flex items-center bg-gray-50 px-2 py-1 rounded-full text-sm">
                                <FaRulerCombined className="text-green-500 mr-1" />
                                <span className="text-gray-700">
                                  {formatAreaWithUnit(property)}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="mb-3">
                            <div className="flex items-start">
                              <FaMapMarkerAlt
                                className="text-green-500 mr-2 mt-1 flex-shrink-0 cursor-pointer hover:text-green-700 text-lg"
                                onClick={(e) =>
                                  getDirections(e, {
                                    google_maps_url: property.google_maps_url,
                                  })
                                }
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
                    </Motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Loading State */}
          {isInitialLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div
                  key={item}
                  className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 animate-pulse"
                >
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
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  No properties found
                </h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your filters or search criteria to find more
                  properties.
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
                    <option key={size} value={size}>
                      {size}
                    </option>
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
                      ? "border-gray-200 text-gray-400 cursor-not-allowed"
                      : "border-gray-300 text-gray-600 hover:bg-gray-50"
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
                        ${
                          currentPage === 1
                            ? "bg-green-600 text-white font-medium"
                            : "border border-gray-300 text-gray-600 hover:bg-gray-50"
                        }`}
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
                      ${
                        currentPage === number
                          ? "bg-green-600 text-white font-medium"
                          : "border border-gray-300 text-gray-600 hover:bg-gray-50"
                      }`}
                  >
                    {number}
                  </button>
                ))}

                {/* Last Page */}
                {getPageNumbers()[getPageNumbers().length - 1] < totalPages && (
                  <>
                    {getPageNumbers()[getPageNumbers().length - 1] <
                      totalPages - 1 && (
                      <span className="px-2 text-gray-500">...</span>
                    )}
                    <button
                      onClick={() => paginate(totalPages)}
                      className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 
                        ${
                          currentPage === totalPages
                            ? "bg-green-600 text-white font-medium"
                            : "border border-gray-300 text-gray-600 hover:bg-gray-50"
                        }`}
                    >
                      {totalPages}
                    </button>
                  </>
                )}

                {/* Next Page Button */}
                <button
                  onClick={() =>
                    currentPage < totalPages && paginate(currentPage + 1)
                  }
                  disabled={currentPage === totalPages}
                  className={`p-2 rounded-lg border ${
                    currentPage === totalPages
                      ? "border-gray-200 text-gray-400 cursor-not-allowed"
                      : "border-gray-300 text-gray-600 hover:bg-gray-50"
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
            <h3 className="text-xl font-semibold mb-4">
              Enable Location Services
            </h3>
            <p className="text-gray-600 mb-6">
              To sort properties by distance, we need your current location.
              Would you like to enable location services?
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
                  setSortOption("newest");
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
