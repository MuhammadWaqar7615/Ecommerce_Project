// mapboxUtils.js

const MAPBOX_API_KEY = import.meta.env.VITE_MAPBOX_API_KEY; // Replace with your actual API key
const MAPBOX_GEOCODING_URL = 'https://api.mapbox.com/geocoding/v5/mapbox.places';
const MAPBOX_DIRECTIONS_URL = 'https://api.mapbox.com/directions/v5/mapbox/driving';

/**
 * Get location suggestions based on search query
 * @param {string} query - The search text input
 * @param {Object} options - Optional parameters
 * @param {number} options.limit - Maximum number of suggestions (default: 5)
 * @param {string} options.country - Limit results to specific country (e.g., 'US', 'IN')
 * @param {string} options.types - Types of results (e.g., 'place,locality,address')
 * @returns {Promise<Array>} Array of suggestion objects
 */
export async function getLocationSuggestions(query, options = {}) {
  if (!query || query.trim().length < 2) {
    return [];
  }

  const {
    limit = 5,
    country = '',
    types = 'place,locality,address,poi'
  } = options;

  try {
    // Build the URL with query parameters
    let url = `${MAPBOX_GEOCODING_URL}/${encodeURIComponent(query)}.json`;
    
    const params = new URLSearchParams({
      access_token: MAPBOX_API_KEY,
      limit: limit.toString(),
      types: types,
      autocomplete: 'true',
      language: 'en'
    });

    // Add country filter if specified
    if (country) {
      params.append('country', country);
    }

    url += `?${params.toString()}`;

    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Geocoding API error: ${response.statusText}`);
    }

    const data = await response.json();

    // Transform the response into a clean suggestion format
    const suggestions = data.features.map(feature => ({
      id: feature.id,
      placeName: feature.place_name,
      text: feature.text,
      center: feature.center, // [longitude, latitude]
      latitude: feature.center[1],
      longitude: feature.center[0],
      placeType: feature.place_type[0],
      address: feature.properties?.address,
      category: feature.properties?.category,
      context: feature.context?.map(ctx => ({
        id: ctx.id,
        text: ctx.text,
        shortCode: ctx.short_code
      })),
      fullData: feature // Original feature for complete access if needed
    }));

    return suggestions;
  } catch (error) {
    console.error('Error fetching location suggestions:', error);
    return [];
  }
}

/**
 * Calculate distance between two locations in kilometers
 * @param {Array|Object} origin - Origin coordinates [longitude, latitude] or {lat, lng} object
 * @param {Array|Object} destination - Destination coordinates [longitude, latitude] or {lat, lng} object
 * @param {Object} options - Optional parameters
 * @param {string} options.unit - Unit of measurement ('km' or 'mi', default: 'km')
 * @returns {Promise<Object>} Object containing distance information
 */
export async function calculateDistance(origin, destination, options = {}) {
  if (!origin || !destination) {
    throw new Error('Both origin and destination coordinates are required');
  }

  const { unit = 'km' } = options;

  // Normalize coordinates to format [longitude, latitude]
  const originCoords = normalizeCoordinates(origin);
  const destinationCoords = normalizeCoordinates(destination);

  if (!originCoords || !destinationCoords) {
    throw new Error('Invalid coordinates format');
  }

  try {
    const coordinates = `${originCoords.join(',')};${destinationCoords.join(',')}`;
    const url = `${MAPBOX_DIRECTIONS_URL}/${coordinates}`;
    
    const params = new URLSearchParams({
      access_token: MAPBOX_API_KEY,
      geometries: 'geojson',
      overview: 'false'
    });

    const response = await fetch(`${url}?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error(`Directions API error: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.routes || data.routes.length === 0) {
      throw new Error('No route found between the locations');
    }

    const route = data.routes[0];
    
    // Convert distance from meters to kilometers (or miles)
    const distanceInMeters = route.distance;
    let distance;
    let unitLabel;

    if (unit === 'mi') {
      distance = distanceInMeters * 0.000621371;
      unitLabel = 'miles';
    } else {
      distance = distanceInMeters / 1000;
      unitLabel = 'kilometers';
    }

    return {
      distance: Math.round(distance * 100) / 100, // Round to 2 decimal places
      distanceInMeters: distanceInMeters,
      unit: unitLabel,
      duration: route.duration, // Duration in seconds
      durationInMinutes: Math.round(route.duration / 60),
      origin: {
        coordinates: originCoords,
        ...(data.waypoints?.[0])
      },
      destination: {
        coordinates: destinationCoords,
        ...(data.waypoints?.[1])
      }
    };
  } catch (error) {
    console.error('Error calculating distance:', error);
    throw error;
  }
}

/**
 * Helper function to calculate straight-line distance (Haversine formula)
 * Use this for quick calculations without API calls
 * @param {Array|Object} origin - Origin coordinates
 * @param {Array|Object} destination - Destination coordinates
 * @returns {number} Distance in kilometers
 */
export function calculateHaversineDistance(origin, destination) {
  const originCoords = normalizeCoordinates(origin);
  const destinationCoords = normalizeCoordinates(destination);

  if (!originCoords || !destinationCoords) {
    throw new Error('Invalid coordinates format');
  }

  // Extract latitude and longitude (note: coordinates are [lng, lat])
  const [lng1, lat1] = originCoords;
  const [lng2, lat2] = destinationCoords;

  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lng2 - lng1);
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 100) / 100; // Round to 2 decimal places
}

/**
 * Normalize coordinates to [longitude, latitude] array format
 * @param {Array|Object} coords - Input coordinates
 * @returns {Array|null} Normalized coordinates or null if invalid
 */
function normalizeCoordinates(coords) {
  if (Array.isArray(coords) && coords.length === 2) {
    // Assume it's already [longitude, latitude]
    return coords;
  }
  
  if (coords && typeof coords === 'object') {
    // Handle {lat, lng}, {lat, lon}, {latitude, longitude} formats
    const lat = coords.lat || coords.latitude;
    const lng = coords.lng || coords.lon || coords.longitude;
    
    if (lat !== undefined && lng !== undefined) {
      return [lng, lat];
    }
  }
  
  return null;
}

/**
 * Convert degrees to radians
 * @param {number} degrees
 * @returns {number}
 */
function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}