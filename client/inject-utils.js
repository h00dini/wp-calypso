/**
 * External dependencies
 */
import * as react from 'react';
import * as redux from 'redux';
import * as reactRedux from 'react-redux';

const components = {};

window.react = react;
window.redux = redux;
window.reactRedux = reactRedux;

window.downloadStuff = ( callback ) => {
	const scriptTag = document.createElement( 'script' ),
		firstScriptTag = document.getElementsByTagName( 'script' )[ 0 ];

	scriptTag.onload = () => {
		callback && callback();
	};

	scriptTag.src = 'http://localhost:8888/wp-content/plugins/woocommerce-services/dist/wc-test.js';
	firstScriptTag.parentNode.insertBefore( scriptTag, firstScriptTag );
};

window.getComponent = ( key ) => ( components[ key ] );

window.injectComponent = ( key, component ) => {
	components[ key ] = component;
};