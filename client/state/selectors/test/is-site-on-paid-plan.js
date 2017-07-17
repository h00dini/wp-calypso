jest.mock( 'state/sites/plans/selectors', () => ( { getCurrentPlan: require( 'sinon' ).stub() } ) );

/**
 * External dependencies
 */
import deepFreeze from 'deep-freeze';
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	PLAN_BUSINESS,
	PLAN_FREE
} from 'lib/plans/constants';
import { getCurrentPlan } from 'state/sites/plans/selectors';
import isSiteOnPaidPlan from '../is-site-on-paid-plan';

describe( 'isSiteOnPaidPlan', () => {
	const state = deepFreeze( {} );

	it( 'should return false when plan is not known', () => {
		getCurrentPlan.returns( null );
		expect( isSiteOnPaidPlan( state, 'site1' ) ).to.be.false;
	} );

	it( 'should return false when on free plan', () => {
		getCurrentPlan.returns( { productSlug: PLAN_FREE } );
		expect( isSiteOnPaidPlan( state, 'site1' ) ).to.be.false;
	} );

	it( 'should return true when on paid plan', () => {
		getCurrentPlan.returns( { productSlug: PLAN_BUSINESS } );
		expect( isSiteOnPaidPlan( state, 'site1' ) ).to.be.true;
	} );
} );
