const HttpError = require('../models/http-error');

async function getCoordsForAddress(address) {
  // Dummy / fake coordinates
  // (You can use any valid latitude & longitude)
  return {
    lat: 28.6139,   // Delhi latitude
    lng: 77.2090    // Delhi longitude
  };
}

module.exports = getCoordsForAddress;
