export const DEFAULT_PROPERTY_TYPES = Object.freeze([
  { id: 'land', name: 'Land' },
  { id: 'commercial-land', name: 'Commercial Land' },
  { id: 'agriculture-land', name: 'Agriculture Land' },
  { id: 'industrial-land', name: 'Industrial Land' },
  { id: 'house', name: 'House' },
  { id: 'apartment', name: 'Apartment' },
  { id: 'shop', name: 'Shop' },
  { id: 'office', name: 'Office' },
  { id: 'commercial-building', name: 'Commercial Building' },
  { id: 'industrial-building', name: 'Industrial Building' },
]);

export const normalizePropertyTypeName = (name) =>
  typeof name === 'string' ? name.trim().toLowerCase() : '';

const createFallbackId = (name) =>
  normalizePropertyTypeName(name).replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

export const preparePropertyTypes = (types) => {
  if (!Array.isArray(types) || types.length === 0) {
    return DEFAULT_PROPERTY_TYPES;
  }

  return types
    .map((type) => {
      const name = typeof type?.name === 'string' ? type.name.trim() : '';
      const normalizedName = normalizePropertyTypeName(name);

      if (!normalizedName) {
        return null;
      }

      return {
        id: type?.id ?? createFallbackId(name),
        name,
      };
    })
    .filter(Boolean);
};

const LAND_KEYWORDS = ['land', 'plot', 'acre', 'agricultur', 'farm', 'estate'];
const RESIDENTIAL_KEYWORDS = ['house', 'apartment', 'villa', 'flat', 'residential', 'bungalow'];
const COMMERCIAL_KEYWORDS = ['commercial', 'office', 'shop', 'industrial', 'warehouse', 'factory'];

export const categorizePropertyTypes = (types) => {
  const categories = {
    land: [],
    residential: [],
    commercial: [],
    other: [],
  };

  if (!Array.isArray(types)) {
    return categories;
  }

  const seen = new Set();

  types.forEach(({ name }) => {
    const normalized = normalizePropertyTypeName(name);
    if (!normalized || seen.has(normalized)) {
      return;
    }

    seen.add(normalized);

    if (LAND_KEYWORDS.some((keyword) => normalized.includes(keyword))) {
      categories.land.push(name);
    } else if (RESIDENTIAL_KEYWORDS.some((keyword) => normalized.includes(keyword))) {
      categories.residential.push(name);
    } else if (COMMERCIAL_KEYWORDS.some((keyword) => normalized.includes(keyword))) {
      categories.commercial.push(name);
    } else {
      categories.other.push(name);
    }
  });

  return categories;
};

export const isLandPropertyType = (typeName, categories) => {
  const normalizedType = normalizePropertyTypeName(typeName);
  if (!normalizedType) {
    return false;
  }

  const landTypes = categories?.land ?? [];

  return landTypes.some(
    (name) => normalizePropertyTypeName(name) === normalizedType
  );
};

const PROPERTY_TYPE_CANDIDATE_KEYS = [
  'property_type_details',
  'property_type_name',
  'property_type',
  'type',
];

const extractPropertyTypeName = (property) => {
  if (!property || typeof property !== 'object') {
    return '';
  }

  for (const key of PROPERTY_TYPE_CANDIDATE_KEYS) {
    const value = property[key];

    if (!value) {
      continue;
    }

    if (typeof value === 'string') {
      const normalized = normalizePropertyTypeName(value);
      if (normalized) {
        return normalized;
      }
    } else if (typeof value === 'object' && typeof value.name === 'string') {
      const normalized = normalizePropertyTypeName(value.name);
      if (normalized) {
        return normalized;
      }
    }
  }

  return '';
};

const matchesLandKeywords = (normalizedType) =>
  LAND_KEYWORDS.some((keyword) => normalizedType.includes(keyword));

export const isLandProperty = (property, landTypes) => {
  const normalizedType = extractPropertyTypeName(property);

  if (!normalizedType) {
    return false;
  }

  if (landTypes instanceof Set && landTypes.has(normalizedType)) {
    return true;
  }

  if (Array.isArray(landTypes)) {
    const hasMatch = landTypes.some(
      (name) => normalizePropertyTypeName(name) === normalizedType
    );

    if (hasMatch) {
      return true;
    }
  } else if (landTypes && typeof landTypes === 'object') {
    const landList = landTypes.land;

    if (Array.isArray(landList)) {
      const hasMatch = landList.some(
        (name) => normalizePropertyTypeName(name) === normalizedType
      );

      if (hasMatch) {
        return true;
      }
    }
  }

  return matchesLandKeywords(normalizedType);
};

export const formatAreaUnit = (property, landTypes, fallbackUnit = 'sqft') => {
  const isLand = isLandProperty(property, landTypes);

  if (isLand) {
    return 'cent';
  }

  return fallbackUnit;
};

