/** @format */

/**
 * Internal dependencies
 */
import { shouldServerSideRender, setShouldServerSideRender } from '..';
import { setShouldServerSideRenderLogin } from '../../../client/login/ssr';

/**
 * A mutable hashmap that is used to create the current context (i.e. the values set here can be used as return
 * values for some specific methods that are being called). Each test can override these values by calling the remock
 * function.
 *
 * @see remock function for the default values.
 *
 * @type {{ojbect}}
 */
let mockReturnValues = {};

/**
 * Updates the values returned by the mocks. Combines the given parameters with the default ones, such that the the
 * tests can focus on what they really want to change and express that in the code.
 *
 * @see mockReturnValues
 *
 * @param {{object}} newReturnValues A key value set of properties that are combined with the defaults.
 */
function remock( newReturnValues ) {
	mockReturnValues = Object.assign(
		{
			isDefaultLocale: true,
			isSectionIsomorphic: true,
			configServerSideRender: true,
		},
		newReturnValues
	);
}

jest.mock( 'lib/i18n-utils', () => {
	return {
		isDefaultLocale: () => mockReturnValues.isDefaultLocale,
	};
} );

jest.mock( 'state/ui/selectors', () => {
	return {
		isSectionIsomorphic: () => mockReturnValues.isSectionIsomorphic,
	};
} );

jest.mock( 'config', () => {
	const fn = () => {};
	fn.isEnabled = feature_key =>
		feature_key === 'server-side-rendering' ? mockReturnValues.configServerSideRender : false;
	return fn;
} );

const ssrCompatibleContext = {
	layout: 'hello',
	user: null,
	store: {
		getState: () => {},
	},
	lang: 'en',
};

const ssrEnabledContext = {
	...ssrCompatibleContext,
	serverSideRender: true,
};

const ssrDisabledContext = {
	...ssrCompatibleContext,
	serverSideRender: false,
};

describe( 'shouldServerSideRender', () => {
	beforeEach( () => remock() );

	test( 'feature-flag server-side-render should enable SSR (default behavior)', () => {
		expect( shouldServerSideRender( ssrEnabledContext ) ).toBe( true );
	} );

	test( 'feature-flag server-side-render should disable SSR', () => {
		remock( { configServerSideRender: false } );
		expect( shouldServerSideRender( ssrEnabledContext ) ).toBe( false );
	} );

	test( 'context.serverSideRender should alter the result', () => {
		expect( shouldServerSideRender( ssrCompatibleContext ) ).toBe( false ); // due to undefined
		expect( shouldServerSideRender( ssrEnabledContext ) ).toBe( true );
		expect( shouldServerSideRender( ssrDisabledContext ) ).toBe( false );
	} );

	test( 'context.layout should alter the result', () => {
		expect( shouldServerSideRender( ssrEnabledContext ) ).toBe( true );

		const SsrEnabledContextWithoutLayout = {
			...ssrEnabledContext,
			layout: undefined,
		};
		expect( shouldServerSideRender( SsrEnabledContextWithoutLayout ) ).toBe( false );
	} );

	test( 'context.user should alter the result', () => {
		expect( shouldServerSideRender( ssrEnabledContext ) ).toBe( true );

		const ssrEnabledContextWithUser = {
			...ssrEnabledContext,
			user: {
				name: 'hello-world',
			},
		};
		expect( shouldServerSideRender( ssrEnabledContextWithUser ) ).toBe( false );
	} );

	test( 'isSectionIsomorphic should alter the result', () => {
		expect( shouldServerSideRender( ssrEnabledContext ) ).toBe( true );

		remock( { isSectionIsomorphic: false } );
		expect( shouldServerSideRender( ssrEnabledContext ) ).toBe( false );
	} );

	test( 'isDefaultLocale should alter the result', () => {
		expect( shouldServerSideRender( ssrEnabledContext ) ).toBe( true );

		remock( { isDefaultLocale: false } );
		expect( shouldServerSideRender( ssrEnabledContext ) ).toBe( false );
	} );
} );

describe( 'setShouldServerSideRender', () => {
	test( 'when query is empty, then sets context.serverSideRender to TRUE - and calls next()', () => {
		const next = jest.fn();
		const contextWithoutQueryKeys = {
			query: {},
		};

		setShouldServerSideRender( contextWithoutQueryKeys, next );
		expect( contextWithoutQueryKeys.serverSideRender ).toBe( true );
		expect( next.mock.calls.length ).toBe( 1 );
	} );

	test( 'when query has values, then sets context.serverSideRender to FALSE - and calls next()', () => {
		const next = jest.fn();
		const contextWithQueryKeys = {
			query: {
				hello: 'world',
			},
		};

		setShouldServerSideRender( contextWithQueryKeys, next );
		expect( contextWithQueryKeys.serverSideRender ).toBe( false );
		expect( next.mock.calls.length ).toBe( 1 );
	} );
} );

// doing also the setShouldServerSideRenderLogin the test here because it seems adding it on the client side requires more effort
function getSomeCleanLoginContext( queryValues ) {
	return {
		query: queryValues,
	};
}

describe( 'setShouldServerSideRenderLogin', () => {
	test( 'when query is empty, then sets context.serverSideRender to TRUE - and calls next()', () => {
		const next = jest.fn();
		const contextWithoutQueryKeys = getSomeCleanLoginContext( {} );

		setShouldServerSideRenderLogin( contextWithoutQueryKeys, next );
		expect( contextWithoutQueryKeys.serverSideRender ).toBe( true );
		expect( next.mock.calls.length ).toBe( 1 );
	} );

	test( 'when query has only INVALID keys, then sets context.serverSideRender to FALSE - and calls next()', () => {
		const next = jest.fn();
		const contextWithQueryKeys = {
			query: {
				hello: 'world',
			},
		};

		setShouldServerSideRenderLogin( contextWithQueryKeys, next );
		expect( contextWithQueryKeys.serverSideRender ).toBe( false );
		expect( next.mock.calls.length ).toBe( 1 );
	} );

	test( 'when query has only valid keys, then serverSideRender is TRUE, but when invalid keys are added, it fails', () => {
		const next = jest.fn();
		let contextWithQueryKeys = getSomeCleanLoginContext( { client_id: 1234 } );
		setShouldServerSideRenderLogin( contextWithQueryKeys, next );
		expect( contextWithQueryKeys.serverSideRender ).toBe( true );

		// add one valid key, signup_flow
		contextWithQueryKeys = getSomeCleanLoginContext( {
			client_id: 1288,
			signup_flow: 'avbsdaf',
		} );
		setShouldServerSideRenderLogin( contextWithQueryKeys, next );
		expect( contextWithQueryKeys.serverSideRender ).toBe( true );

		// add another valid key, redirect_to
		contextWithQueryKeys = getSomeCleanLoginContext( {
			client_id: 87357,
			signup_flow: 'xsa',
			redirect_to: 'https://wordpress.com/theme',
		} );
		setShouldServerSideRenderLogin( contextWithQueryKeys, next );
		expect( contextWithQueryKeys.serverSideRender ).toBe( true );

		// add another random key and expect SSR to stop
		contextWithQueryKeys = getSomeCleanLoginContext( {
			client_id: 87357,
			signup_flow: 'xsa',
			redirect_to: 'https://wordpress.com/theme',
			hello: 'world',
		} );
		setShouldServerSideRenderLogin( contextWithQueryKeys, next );
		expect( contextWithQueryKeys.serverSideRender ).toBe( false );

		// add do one more test in which only a few of the keys are set and then the invalid key is set
		contextWithQueryKeys = getSomeCleanLoginContext( { client_id: '5678', hello: 'world' } );
		setShouldServerSideRenderLogin( contextWithQueryKeys, next );
		expect( contextWithQueryKeys.serverSideRender ).toBe( false );

		// for all of the above cases, expect that next was called
		expect( next.mock.calls.length ).toBe( 5 ); // becauase we have 5 tests and we did not check for each of them
	} );

	test( 'when query has redirect_to, then only the ones starting with the prefix make SSR true', () => {
		const contextWithThemePrefix = getSomeCleanLoginContext( {
			redirect_to: 'https://wordpress.com/theme/something',
		} );
		setShouldServerSideRenderLogin( contextWithThemePrefix, () => {} );
		expect( contextWithThemePrefix.serverSideRender ).toBe( true );

		const contextWithGoPrefix = getSomeCleanLoginContext( {
			redirect_to: 'https://wordpress.com/go/something',
		} );
		setShouldServerSideRenderLogin( contextWithGoPrefix, () => {} );
		expect( contextWithGoPrefix.serverSideRender ).toBe( true );

		const contextWithInvalidPrefix = getSomeCleanLoginContext( {
			redirect_to: 'https://blue.com/go/something',
		} );
		setShouldServerSideRenderLogin( contextWithInvalidPrefix, () => {} );
		expect( contextWithInvalidPrefix.serverSideRender ).toBe( false );
	} );
} );
