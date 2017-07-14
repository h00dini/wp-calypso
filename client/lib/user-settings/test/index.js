/**
 * @jest-environment jsdom
 */
jest.mock( 'lib/wp', () => require( './mocks/wp' ) );
jest.mock( 'lib/user/utils', () => require( './mocks/user-utils' ) );

/**
 * External dependencies
 */
import { assert } from 'chai';

/**
 * Internal dependencies
 */
import userSettings from '..';

describe( 'User Settings', () => {
	before( () => {
		userSettings.fetchSettings();
	} );

	it( 'should consider overridden settings as saved', done => {
		assert.isTrue( userSettings.updateSetting( 'test', true ) );
		assert.isTrue( userSettings.updateSetting( 'lang_id', true ) );

		assert.isTrue( userSettings.unsavedSettings.test );
		assert.isTrue( userSettings.unsavedSettings.lang_id );

		userSettings.saveSettings( assertCorrectSettingIsRemoved, { test: true } );

		function assertCorrectSettingIsRemoved() {
			assert.isUndefined( userSettings.unsavedSettings.test );
			assert.isTrue( userSettings.unsavedSettings.lang_id );
			done();
		}
	} );
} );
