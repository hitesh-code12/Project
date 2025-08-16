import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Plus } from 'lucide-react';

const GooglePlacesSearch = ({ onVenueSelect, onVenueCreate, existingVenues = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [predictions, setPredictions] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPredictions, setShowPredictions] = useState(false);
  const autocompleteService = useRef(null);
  const placesService = useRef(null);
  const searchBoxRef = useRef(null);

  useEffect(() => {
    // Initialize Google Maps services
    if (window.google && window.google.maps) {
      autocompleteService.current = new window.google.maps.places.AutocompleteService();
      placesService.current = new window.google.maps.places.PlacesService(
        document.createElement('div')
      );
    }
  }, []);

  const searchPlaces = async (input) => {
    if (!input || input.length < 3) {
      setPredictions([]);
      setShowPredictions(false);
      return;
    }

    if (!autocompleteService.current) {
      console.error('Google Maps Autocomplete service not available');
      return;
    }

    try {
      setLoading(true);
      const request = {
        input: input,
        types: ['establishment'],
        componentRestrictions: { country: 'in' }, // Restrict to India
      };

      autocompleteService.current.getPlacePredictions(request, (predictions, status) => {
        setLoading(false);
        if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
          setPredictions(predictions);
          setShowPredictions(true);
        } else {
          setPredictions([]);
          setShowPredictions(false);
        }
      });
    } catch (error) {
      console.error('Error searching places:', error);
      setLoading(false);
      setPredictions([]);
      setShowPredictions(false);
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    searchPlaces(value);
  };

  const handlePlaceSelect = (prediction) => {
    if (!placesService.current) {
      console.error('Google Maps Places service not available');
      return;
    }

    setLoading(true);
    placesService.current.getDetails(
      {
        placeId: prediction.place_id,
        fields: ['name', 'formatted_address', 'geometry', 'place_id', 'types']
      },
      (place, status) => {
        setLoading(false);
        if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
          const venueData = {
            name: place.name,
            address: {
              street: place.formatted_address,
              city: extractCity(place.formatted_address),
              state: extractState(place.formatted_address),
              zipCode: extractZipCode(place.formatted_address),
              country: 'India'
            },
            location: {
              type: 'Point',
              coordinates: [place.geometry.location.lng(), place.geometry.location.lat()]
            },
            googlePlaceId: place.place_id,
            types: place.types
          };

          setSelectedPlace(venueData);
          setSearchTerm(place.name);
          setShowPredictions(false);
          
          // Check if venue already exists
          const existingVenue = existingVenues.find(v => 
            v.googlePlaceId === place.place_id || 
            v.name.toLowerCase() === place.name.toLowerCase()
          );

          if (existingVenue) {
            onVenueSelect(existingVenue);
          } else {
            onVenueCreate(venueData);
          }
        }
      }
    );
  };

  const extractCity = (address) => {
    // Simple extraction - you might want to use a more sophisticated approach
    const parts = address.split(',');
    return parts[parts.length - 3]?.trim() || 'Unknown City';
  };

  const extractState = (address) => {
    const parts = address.split(',');
    return parts[parts.length - 2]?.trim() || 'Unknown State';
  };

  const extractZipCode = (address) => {
    const zipMatch = address.match(/\b\d{6}\b/);
    return zipMatch ? zipMatch[0] : '000000';
  };

  const handleExistingVenueSelect = (venue) => {
    setSelectedPlace(venue);
    setSearchTerm(venue.name);
    setShowPredictions(false);
    onVenueSelect(venue);
  };

  const clearSelection = () => {
    setSearchTerm('');
    setSelectedPlace(null);
    setPredictions([]);
    setShowPredictions(false);
  };

  return (
    <div className="relative">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          ref={searchBoxRef}
          type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          onFocus={() => setShowPredictions(true)}
          className="input-field pl-10 pr-10"
          placeholder="Search for a venue or select from existing..."
        />
        {selectedPlace && (
          <button
            onClick={clearSelection}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
          >
            <span className="text-sm">Clear</span>
          </button>
        )}
      </div>

      {/* Loading indicator */}
      {loading && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
          <div className="p-3 text-center text-gray-500">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mx-auto"></div>
            <span className="ml-2">Searching...</span>
          </div>
        </div>
      )}

      {/* Predictions dropdown */}
      {showPredictions && !loading && (predictions.length > 0 || existingVenues.length > 0) && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {/* Google Places predictions */}
          {predictions.length > 0 && (
            <div>
              <div className="px-3 py-2 text-xs font-medium text-gray-500 bg-gray-50 border-b">
                Google Places Results
              </div>
              {predictions.map((prediction) => (
                <button
                  key={prediction.place_id}
                  onClick={() => handlePlaceSelect(prediction)}
                  className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center space-x-2"
                >
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <div>
                    <div className="font-medium text-gray-900">{prediction.structured_formatting.main_text}</div>
                    <div className="text-sm text-gray-500">{prediction.structured_formatting.secondary_text}</div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Existing venues */}
          {existingVenues.length > 0 && (
            <div>
              <div className="px-3 py-2 text-xs font-medium text-gray-500 bg-gray-50 border-b">
                Existing Venues
              </div>
              {existingVenues.map((venue) => (
                <button
                  key={venue._id}
                  onClick={() => handleExistingVenueSelect(venue)}
                  className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center space-x-2"
                >
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <div>
                    <div className="font-medium text-gray-900">{venue.name}</div>
                    <div className="text-sm text-gray-500">{venue.address?.street || venue.address}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* No results */}
      {showPredictions && !loading && predictions.length === 0 && existingVenues.length === 0 && searchTerm.length >= 3 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
          <div className="p-3 text-center text-gray-500">
            No venues found. Try a different search term.
          </div>
        </div>
      )}
    </div>
  );
};

export default GooglePlacesSearch; 