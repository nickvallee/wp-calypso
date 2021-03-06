/** @format */

jest.mock( 'lib/abtest', () => ( {
	abtest: () => '',
} ) );

jest.mock( 'blocks/dismissible-card', () => {
	const React = require( 'react' );
	return class DismissibleCard extends React.Component {};
} );

jest.mock( 'components/card', () => {
	const React = require( 'react' );
	return class Card extends React.Component {};
} );

jest.mock( 'lib/analytics/track-component-view', () => {
	const React = require( 'react' );
	return class TrackComponentView extends React.Component {};
} );

jest.mock( 'i18n-calypso', () => ( {
	localize: Comp => props => (
		<Comp
			{ ...props }
			translate={ function( x ) {
				return x;
			} }
		/>
	),
	numberFormat: x => x,
} ) );

/**
 * External dependencies
 */
import { assert } from 'chai';
import { shallow } from 'enzyme';
import React from 'react';
import {
	PLAN_FREE,
	PLAN_BUSINESS,
	PLAN_BUSINESS_2_YEARS,
	PLAN_PREMIUM,
	PLAN_PREMIUM_2_YEARS,
	PLAN_PERSONAL,
	PLAN_PERSONAL_2_YEARS,
	PLAN_JETPACK_PERSONAL,
	PLAN_JETPACK_PERSONAL_MONTHLY,
	PLAN_JETPACK_PREMIUM,
	PLAN_JETPACK_PREMIUM_MONTHLY,
	PLAN_JETPACK_BUSINESS,
	PLAN_JETPACK_BUSINESS_MONTHLY,
} from 'lib/plans/constants';

/**
 * Internal dependencies
 */
import { Banner } from '../index';

const props = {
	callToAction: false,
	plan: PLAN_FREE,
};

describe( 'Banner basic tests', () => {
	test( 'should not blow up and have proper CSS class', () => {
		const comp = shallow( <Banner { ...props } /> );
		assert.lengthOf( comp.find( '.banner' ), 1 );
	} );

	test( 'should render Card if dismissPreferenceName is false', () => {
		const comp = shallow( <Banner { ...props } dismissPreferenceName={ false } /> );
		assert.lengthOf( comp.find( 'Card' ), 1 );
		assert.lengthOf( comp.find( 'DismissibleCard' ), 0 );
	} );

	test( 'should render DismissibleCard if dismissPreferenceName is true', () => {
		const comp = shallow( <Banner { ...props } dismissPreferenceName={ true } /> );
		assert.lengthOf( comp.find( 'Card' ), 0 );
		assert.lengthOf( comp.find( 'DismissibleCard' ), 1 );
	} );

	test( 'should have .has-call-to-action class if callToAction is true', () => {
		const comp = shallow( <Banner { ...props } callToAction={ true } /> );
		assert.lengthOf( comp.find( '.has-call-to-action' ), 1 );
	} );

	test( 'should not have .has-call-to-action class if callToAction is false', () => {
		const comp = shallow( <Banner { ...props } callToAction={ false } /> );
		assert.lengthOf( comp.find( '.has-call-to-action' ), 0 );
	} );

	test( 'should render a <Button /> when callToAction is specified', () => {
		const comp = shallow( <Banner { ...props } callToAction={ 'Buy something!' } /> );
		assert.lengthOf( comp.find( 'Button' ), 1 );
	} );

	test( 'should not render a <Button /> when callToAction is not specified', () => {
		const comp = shallow( <Banner { ...props } /> );
		assert.lengthOf( comp.find( 'Button' ), 0 );
	} );

	test( 'should render a <PlanPrice /> when price is specified', () => {
		const comp = shallow( <Banner { ...props } price={ 100 } /> );
		assert.lengthOf( comp.find( 'PlanPrice' ), 1 );
	} );

	test( 'should render two <PlanPrice /> components when there are two prices', () => {
		const comp = shallow( <Banner { ...props } price={ [ 100, 80 ] } /> );
		assert.lengthOf( comp.find( 'PlanPrice' ), 2 );
	} );

	test( 'should render no <PlanPrice /> components when there are no prices', () => {
		const comp = shallow( <Banner { ...props } /> );
		assert.lengthOf( comp.find( 'PlanPrice' ), 0 );
	} );

	test( 'should render a .banner__description when description is specified', () => {
		const comp = shallow( <Banner { ...props } description="test" /> );
		assert.lengthOf( comp.find( '.banner__description' ), 1 );
	} );

	test( 'should not render a .banner__description when description is not specified', () => {
		const comp = shallow( <Banner { ...props } /> );
		assert.lengthOf( comp.find( '.banner__description' ), 0 );
	} );

	test( 'should render a .banner__list when list is specified', () => {
		const comp = shallow( <Banner { ...props } list={ [ 'test1', 'test2' ] } /> );
		assert.lengthOf( comp.find( '.banner__list' ), 1 );
		assert.lengthOf( comp.find( '.banner__list li' ), 2 );
		assert.include(
			comp
				.find( '.banner__list li' )
				.at( 0 )
				.text(),
			'test1'
		);
		assert.include(
			comp
				.find( '.banner__list li' )
				.at( 1 )
				.text(),
			'test2'
		);
	} );

	test( 'should not render a .banner__list when description is not specified', () => {
		const comp = shallow( <Banner { ...props } /> );
		assert.lengthOf( comp.find( '.banner__list' ), 0 );
	} );

	test( 'should record Tracks event when event is specified', () => {
		const comp = shallow( <Banner { ...props } event="test" /> );
		assert.lengthOf( comp.find( 'TrackComponentView' ), 1 );
	} );

	test( 'should not record Tracks event when event is not specified', () => {
		const comp = shallow( <Banner { ...props } /> );
		assert.lengthOf( comp.find( 'TrackComponentView' ), 0 );
	} );
} );

describe( 'Banner should have a class name corresponding to appropriate plan', () => {
	[
		PLAN_PERSONAL,
		PLAN_PERSONAL_2_YEARS,
		PLAN_JETPACK_PERSONAL,
		PLAN_JETPACK_PERSONAL_MONTHLY,
	].forEach( plan => {
		test( 'Personal', () => {
			const comp = shallow( <Banner { ...props } plan={ plan } /> );
			assert.lengthOf( comp.find( '.is-upgrade-personal' ), 1 );
		} );
	} );

	[
		PLAN_PREMIUM,
		PLAN_PREMIUM_2_YEARS,
		PLAN_JETPACK_PREMIUM,
		PLAN_JETPACK_PREMIUM_MONTHLY,
	].forEach( plan => {
		test( 'Premium', () => {
			const comp = shallow( <Banner { ...props } plan={ plan } /> );
			assert.lengthOf( comp.find( '.is-upgrade-premium' ), 1 );
		} );
	} );

	[
		PLAN_BUSINESS,
		PLAN_BUSINESS_2_YEARS,
		PLAN_JETPACK_BUSINESS,
		PLAN_JETPACK_BUSINESS_MONTHLY,
	].forEach( plan => {
		test( 'Business', () => {
			const comp = shallow( <Banner { ...props } plan={ plan } /> );
			assert.lengthOf( comp.find( '.is-upgrade-business' ), 1 );
		} );
	} );
} );
