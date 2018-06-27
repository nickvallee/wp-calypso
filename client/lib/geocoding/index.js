/** @format */

/**
 * External dependencies
 */

import request from 'superagent';

/**
+ * Internal dependencies
+ */
import config from 'config';

/**
 * Module variables
 */
const GOOGLE_MAPS_API_BASE_URL = 'https://maps.googleapis.com/maps/api/geocode/json';
const GOOGLE_MAPS_API_KEY = config( 'google_maps_and_places_api_key' );

function queryGoogleMapsApi( queryParams ) {
	return new Promise( ( resolve, reject ) => {
		request
			.get( GOOGLE_MAPS_API_BASE_URL )
			.query( queryParams )
			.end( ( error, response ) => {
				if ( error || ! response.ok || 'OK' !== response.body.status ) {
					return reject( error );
				}

				resolve( response.body.results );
			} );
	} );
}

export function geocode( address ) {
	return queryGoogleMapsApi( { address, key: GOOGLE_MAPS_API_KEY } );
}

export function reverseGeocode( latitude, longitude ) {
	return queryGoogleMapsApi( { latlng: latitude + ',' + longitude, key: GOOGLE_MAPS_API_KEY } );
}
