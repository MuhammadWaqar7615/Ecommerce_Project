// Cache for city coordinates to avoid repeated API calls
const cityCoordinatesCache = new Map();

// Predefined coordinates for major Pakistani cities
const PAKISTAN_CITIES = {
  'karachi': { longitude: 67.0011, latitude: 24.8607, bbox: '66.9232,24.7727,67.1956,25.0373' },
  'lahore': { longitude: 74.3587, latitude: 31.5204, bbox: '74.2317,31.4477,74.4497,31.6289' },
  'islamabad': { longitude: 73.0479, latitude: 33.6844, bbox: '72.9018,33.5510,73.2128,33.7715' },
  'rawalpindi': { longitude: 73.0479, latitude: 33.6007, bbox: '72.9518,33.5510,73.1128,33.6715' },
  'peshawar': { longitude: 71.5249, latitude: 34.0151, bbox: '71.4249,33.9151,71.6249,34.1151' },
  'quetta': { longitude: 67.0011, latitude: 30.1798, bbox: '66.9011,30.0798,67.1011,30.2798' },
  'multan': { longitude: 71.4782, latitude: 30.1575, bbox: '71.3782,30.0575,71.5782,30.2575' },
  'faisalabad': { longitude: 73.1333, latitude: 31.4504, bbox: '73.0333,31.3504,73.2333,31.5504' },
  'gujranwala': { longitude: 74.1861, latitude: 32.1617, bbox: '74.0861,32.0617,74.2861,32.2617' },
  'sialkot': { longitude: 74.5433, latitude: 32.4945, bbox: '74.4433,32.3945,74.6433,32.5945' },
  'hyderabad': { longitude: 68.3739, latitude: 25.3960, bbox: '68.2739,25.2960,68.4739,25.4960' },
};

/**
 * Get precise location suggestions when city is already selected
 * @param {string} query - The search query (address, colony, area)
 * @param {string} city - Pre-selected city name
 * @param {Object} options - Additional options
 */
export async function getLocationSuggestions(query, city, options = {}) {
  if (!query || query.trim().length < 2) {
    return [];
  }

  // If no city is provided, fall back to general search
  if (!city || !city.trim()) {
    return getGeneralSuggestions(query, options);
  }

  const {
    limit = 10,
    types = 'address,poi,neighborhood,locality',
    country = 'PK'
  } = options;

  try {
    // Get city coordinates (from cache or predefined)
    const cityData = await getCityData(city.toLowerCase().trim());
    
    if (!cityData) {
      console.warn(`City "${city}" not found, falling back to general search`);
      return getGeneralSuggestions(query, { ...options, country });
    }

    // Build the search query with city context
    // Don't append city name if it might already be in the query
    const searchQuery = query.toLowerCase().includes(city.toLowerCase()) 
      ? query 
      : `${query}, ${city}`;

    let url = `${MAPBOX_GEOCODING_URL}/${encodeURIComponent(searchQuery)}.json`;
    
    const params = new URLSearchParams({
      access_token: MAPBOX_API_KEY,
      limit: limit.toString(),
      types: types,
      autocomplete: 'true',
      language: 'en',
      country: country,
      // Crucial: Bias results heavily towards city center
      proximity: `${cityData.longitude},${cityData.latitude}`,
      // Optional: Restrict to city bounding box
      ...(cityData.bbox && { bbox: cityData.bbox }),
      // Get more precise results
      fuzzyMatch: 'false',
      // Prioritize results within the city
      worldview: 'pk'
    });

    url += `?${params.toString()}`;

    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Geocoding API error: ${response.statusText}`);
    }

    const data = await response.json();

    // Process and filter results specifically for the selected city
    const suggestions = data.features
      .filter(feature => {
        // Multiple checks to ensure result is within the selected city
        const placeName = feature.place_name.toLowerCase();
        const cityLower = city.toLowerCase();
        
        // Check if city name appears in the place name
        if (!placeName.includes(cityLower)) {
          // Check context fields
          const cityContext = feature.context?.find(ctx => 
            ctx.id.includes('place') || 
            ctx.id.includes('region')
          );
          if (!cityContext || !cityContext.text.toLowerCase().includes(cityLower)) {
            return false;
          }
        }

        // Check if coordinates are within city bounds (if available)
        if (cityData.bbox) {
          const [minLng, minLat, maxLng, maxLat] = cityData.bbox.split(',').map(Number);
          const [lng, lat] = feature.center;
          if (lng < minLng || lng > maxLng || lat < minLat || lat > maxLat) {
            return false;
          }
        }

        return true;
      })
      .map(feature => {
        // Extract detailed context
        const address = feature.properties?.address || '';
        const neighborhood = feature.context?.find(c => 
          c.id.includes('neighborhood') || c.id.includes('locality')
        )?.text || '';
        const district = feature.context?.find(c => 
          c.id.includes('district')
        )?.text || '';
        
        // Build a clean, formatted address
        let formattedAddress = feature.text;
        if (address) {
          formattedAddress = `${address}, ${neighborhood || city}`;
        } else if (neighborhood) {
          formattedAddress = `${feature.text}, ${neighborhood}`;
        }

        return {
          id: feature.id,
          placeName: feature.place_name,
          formattedAddress: formattedAddress,
          text: feature.text,
          center: feature.center,
          latitude: feature.center[1],
          longitude: feature.center[0],
          placeType: feature.place_type[0],
          address: address,
          neighborhood: neighborhood,
          city: city, // Use the pre-selected city
          district: district,
          relevance: feature.relevance,
          // Additional details for better display
          details: {
            street: feature.properties?.street || feature.text,
            houseNumber: feature.properties?.housenumber,
            block: feature.properties?.block,
          },
          context: feature.context?.map(ctx => ({
            id: ctx.id,
            text: ctx.text,
            shortCode: ctx.short_code
          })),
          fullData: feature
        };
      });

    // Sort by relevance and specificity
    suggestions.sort((a, b) => {
      // Prioritize specific address types
      const typePriority = {
        'address': 3,
        'poi': 2,
        'neighborhood': 1,
        'locality': 1,
        'place': 0
      };
      
      const aPriority = typePriority[a.placeType] || 0;
      const bPriority = typePriority[b.placeType] || 0;
      
      return bPriority - aPriority || b.relevance - a.relevance;
    });

    return suggestions;
  } catch (error) {
    console.error('Error fetching location suggestions:', error);
    return [];
  }
}

// Fallback function for when no city is selected
async function getGeneralSuggestions(query, options = {}) {
  const { limit = 5, types = 'place,locality', country = 'PK' } = options;
  
  try {
    const url = `${MAPBOX_GEOCODING_URL}/${encodeURIComponent(query)}.json`;
    const params = new URLSearchParams({
      access_token: MAPBOX_API_KEY,
      limit: limit.toString(),
      types: types,
      autocomplete: 'true',
      language: 'en',
      country: country
    });

    const response = await fetch(`${url}?${params.toString()}`);
    const data = await response.json();

    return data.features.map(feature => ({
      id: feature.id,
      placeName: feature.place_name,
      text: feature.text,
      center: feature.center,
      latitude: feature.center[1],
      longitude: feature.center[0],
      placeType: feature.place_type[0],
      fullData: feature
    }));
  } catch (error) {
    console.error('Error in general suggestions:', error);
    return [];
  }
}

// Get city data (coordinates and bounding box)
async function getCityData(cityName) {
  // Check cache first
  if (cityCoordinatesCache.has(cityName)) {
    return cityCoordinatesCache.get(cityName);
  }

  // Check predefined cities
  if (PAKISTAN_CITIES[cityName]) {
    cityCoordinatesCache.set(cityName, PAKISTAN_CITIES[cityName]);
    return PAKISTAN_CITIES[cityName];
  }

  // If not found, geocode the city
  try {
    const url = `${MAPBOX_GEOCODING_URL}/${encodeURIComponent(cityName + ', Pakistan')}.json`;
    const params = new URLSearchParams({
      access_token: MAPBOX_API_KEY,
      types: 'place',
      limit: '1',
      country: 'PK'
    });

    const response = await fetch(`${url}?${params.toString()}`);
    const data = await response.json();

    if (data.features && data.features.length > 0) {
      const [longitude, latitude] = data.features[0].center;
      const bbox = data.features[0].bbox?.join(',');
      
      const cityData = { longitude, latitude, bbox };
      cityCoordinatesCache.set(cityName, cityData);
      return cityData;
    }
  } catch (error) {
    console.error('Error geocoding city:', error);
  }

  return null;
}