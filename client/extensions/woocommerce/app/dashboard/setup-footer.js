/**
 * External dependencies
 */
import React, { PropTypes } from 'react';

/**
 * Internal dependencies
 */
import Button from '@automattic/simple-components/button';

const SetupFooter = ( { disabled, label, onClick, primary } ) => {
	return (
		<div className="dashboard__setup-footer">
			<Button disabled={ disabled } onClick={ onClick } primary={ primary }>{ label }</Button>
		</div>
	);
};

SetupFooter.propTypes = {
	disabled: PropTypes.bool,
	label: PropTypes.string.isRequired,
	onClick: PropTypes.func.isRequired,
	primary: PropTypes.bool,
};

export default SetupFooter;
