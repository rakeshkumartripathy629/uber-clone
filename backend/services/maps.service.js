const axios = require('axios');
const captainModel = require('../models/captain.model');

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API;

// Fetch coordinates for a given address
module.exports.getAddressCoordinate = async (address) => {
    if (!address) {
        throw new Error('Address is required');
    }

    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_MAPS_API_KEY}`;

    try {
        const response = await axios.get(url);

        if (response.data.status === 'OK') {
            const location = response.data.results[0].geometry.location;
            return {
                lat: location.lat, // Corrected `ltd` to `lat` for clarity
                lng: location.lng
            };
        } else {
            console.error('Error response from Google API:', response.data);
            throw new Error('Unable to fetch coordinates. Please check the address.');
        }
    } catch (error) {
        console.error('Error fetching address coordinates:', error.message);
        throw new Error('Failed to fetch coordinates from Google Maps API');
    }
};

// Fetch distance and time between two locations
module.exports.getDistanceTime = async (origin, destination) => {
    if (!origin || !destination) {
        throw new Error('Origin and destination are required');
    }

    const apiKey = process.env.GOOGLE_MAPS_API;
    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(origin)}&destinations=${encodeURIComponent(destination)}&key=${apiKey}`;

    try {
        const response = await axios.get(url);

        if (response.data.status === 'OK') {
            const element = response.data.rows[0].elements[0];

            if (element.status === 'ZERO_RESULTS') {
                throw new Error('No routes found between the given locations');
            }

            return {
                distance: element.distance, // Object contains 'value' (meters) and 'text' (human-readable)
                duration: element.duration  // Object contains 'value' (seconds) and 'text'
            };
        } else {
            console.error('Google API Error Response:', response.data); // Log full error response
            throw new Error('Unable to fetch distance and time. Please check the locations.');
        }
    } catch (error) {
        console.error('Error fetching distance and time:', error.message);
        console.error('Error Details:', error.response ? error.response.data : error.message); // Log error details
        throw new Error('Failed to fetch distance and time from Google Maps API');
    }
}

// Fetch autocomplete suggestions for a search query
module.exports.getAutoCompleteSuggestions = async (input) => {
    if (!input) {
        throw new Error('Input query is required');
    }

    const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&key=${GOOGLE_MAPS_API_KEY}`;

    try {
        const response = await axios.get(url);

        if (response.data.status === 'OK') {
            return response.data.predictions
                .map(prediction => prediction.description)
                .filter(value => value); // Filter out any null or undefined values
        } else {
            console.error('Error response from Google API:', response.data);
            throw new Error('Unable to fetch autocomplete suggestions. Please refine the input.');
        }
    } catch (error) {
        console.error('Error fetching autocomplete suggestions:', error.message);
        throw new Error('Failed to fetch autocomplete suggestions from Google Maps API');
    }
};

// Fetch captains within a given radius from a location
module.exports.getCaptainsInTheRadius = async (lat, lng, radius) => {
    if (!lat || !lng || !radius) {
        throw new Error('Latitude, longitude, and radius are required');
    }

    // Radius is converted to radians for MongoDB geospatial query
    const captains = await captainModel.find({
        location: {
            $geoWithin: {
                $centerSphere: [[lng, lat], radius / 6371] // Radius in kilometers; 6371 is Earth's radius
            }
        }
    });

    return captains;
};
