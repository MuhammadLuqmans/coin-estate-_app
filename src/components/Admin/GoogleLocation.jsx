import React, { useCallback, useRef, useState } from 'react';
import { GoogleMap, Marker, useLoadScript } from '@react-google-maps/api';

const libraries = ['places'];

const mapContainerStyle = {
  height: '400px',
  width: '100%',
};

const options = {
  disableDefaultUI: true,
  zoomControl: true,
  fullscreenControl: false,
};

const defaultCenter = { lat: 3.488739139266961, lng: -73.12580392802624 };

export default function GoogleMapAdmin({ setSelectedLocation, selectedLocation }) {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY,
    libraries,
  });

  const mapRef = useRef();

  const onMapLoad = useCallback((map) => {
    mapRef.current = map;

    // console.log({ map, lat: mapRef?.current?.lat(), lng: mapRef?.current?.lng() });
  }, []);

  // Handle user clicks and store the selected location
  const onMapClick = useCallback((event) => {
    if (event && event.latLng) {
      const newLocation = {
        Latitude: event.latLng.lat(),
        Longitude: event.latLng.lng(),
      };
      setSelectedLocation(newLocation);
    }
  }, [setSelectedLocation]);

  if (loadError) return 'Error loading maps';
  if (!isLoaded) return 'Loading maps...';

  // Convert selectedLocation format for map center and marker
  const mapCenter = selectedLocation 
    ? { lat: selectedLocation.Latitude, lng: selectedLocation.Longitude }
    : defaultCenter;

  return (
    <div>
      <GoogleMap
        id='map'
        mapContainerStyle={mapContainerStyle}
        zoom={7}
        center={mapCenter}
        options={options}
        onLoad={onMapLoad}
        onClick={onMapClick} // Listen for user clicks
      >
        {selectedLocation && (
          <Marker
            position={{
              lat: selectedLocation.Latitude,
              lng: selectedLocation.Longitude,
            }}
          />
        )}
      </GoogleMap>
    </div>
  );
}
