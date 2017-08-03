/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import SectionHeader from 'components/section-header';
import { getSelectedDomain } from 'lib/domains';
import Button from 'components/button';
import { requestTransferCode, cancelTransferRequest } from 'lib/upgrades/actions';
import notices from 'notices';
import { displayRequestTransferCodeResponseNotice } from './shared';
import support from 'lib/url/support';

class Unlocked extends React.Component {

	constructor( props ) {
		super( props );

		const {
			pendingTransfer,
			domainLockingAvailable,
			hasPrivacyProtection,
		} = getSelectedDomain( this.props );

		this.state = { submitting: false, canceled: false };

		if ( ! ( pendingTransfer || domainLockingAvailable || hasPrivacyProtection ) ) {
			// This domain doesn't need any fanfare, so we will have come
			// straight here (bypassing the "locked" step) and we can just
			// send the auth code request.
			this.state = { submitting: true, canceled: false };
			this.sendConfirmationCode();
		}
	}

	handleCancelTransferClick = () => {
		const { translate } = this.props;
		const {
			privateDomain,
			hasPrivacyProtection,
			pendingTransfer,
			domainLockingAvailable,
		} = getSelectedDomain( this.props );

		this.setState( { submitting: true } );

		const enablePrivacy = hasPrivacyProtection && ! privateDomain;
		const lockDomain = domainLockingAvailable;

		cancelTransferRequest( {
			domainName: this.props.selectedDomainName,
			declineTransfer: pendingTransfer,
			siteId: this.props.selectedSite.ID,
			enablePrivacy,
			lockDomain,
		}, ( error ) => {
			if ( error ) {
				const contactLink = <a href={ support.CALYPSO_CONTACT } target="_blank" rel="noopener noreferrer" />;
				let errorMessage;

				switch ( error.error ) {
					case 'enable_private_reg_failed':
						errorMessage = translate( 'We were unable to enable Privacy Protection for your domain. ' +
							'Please try again or {{contactLink}}Contact Support{{/contactLink}} if you continue to have trouble.',
							{ components: { contactLink } } );
						break;
					case 'decline_transfer_failed':
						errorMessage = translate( 'We were unable to stop the transfer for your domain. ' +
							'Please try again or {{contactLink}}Contact Support{{/contactLink}} if you continue to have trouble.',
							{ components: { contactLink } } );
						break;
					case 'lock_domain_failed':
						errorMessage = translate( 'We were unable to lock your domain. ' +
							'Please try again or {{contactLink}}Contact Support{{/contactLink}} if you continue to have trouble.',
							{ components: { contactLink } } );
						break;
					default:
						errorMessage = translate(
							'Oops! Something went wrong and your request could not be ' +
							'processed. Please try again or {{contactLink}}Contact Support{{/contactLink}} if ' +
							'you continue to have trouble.', { components: { contactLink } }
						);
						break;
				}
				notices.error( errorMessage );
			} else {
				// Success.
				this.setState( { canceled: true } );

				let successMessage;
				if ( enablePrivacy && lockDomain ) {
					successMessage = translate( 'We\'ve canceled your domain transfer. Your domain is now re-locked and ' +
						'Privacy Protection has been enabled.' );
				} else if ( enablePrivacy ) {
					successMessage = translate( 'We\'ve canceled your domain transfer and ' +
						'Privacy Protection has been re-enabled.' );
				} else if ( lockDomain ) {
					successMessage = translate( 'We\'ve canceled your domain transfer and ' +
						're-locked your domain.' );
				} else {
					successMessage = translate( 'We\'ve canceled your domain transfer. ' );
				}

				notices.success( successMessage );
			}

			this.setState( { submitting: false } );
		} );
	};

	handleResendConfirmationCodeClick = () => {
		this.setState( { submitting: true } );
		this.sendConfirmationCode();
	}

	sendConfirmationCode() {
		const options = {
			siteId: this.props.selectedSite.ID,
			domainName: this.props.selectedDomainName,
			unlock: false,
			disablePrivacy: false
		};

		requestTransferCode( options, ( error ) => {
			this.setState( { submitting: false, canceled: false } );
			displayRequestTransferCodeResponseNotice( error, getSelectedDomain( this.props ) );
		} );
	}

	render() {
		const { translate } = this.props;
		const { submitting, canceled } = this.state;
		const {
			privateDomain,
			hasPrivacyProtection,
			manualTransferRequired,
			pendingTransfer,
			domainLockingAvailable,
		} = getSelectedDomain( this.props );

		let domainStateMessage, statusMessage;

		if ( canceled ) {
			domainStateMessage = null;
		} else if ( pendingTransfer ) {
			domainStateMessage = translate( 'Your domain is pending transfer.' );
		} else if ( domainLockingAvailable && hasPrivacyProtection && ! privateDomain ) {
			domainStateMessage = translate( 'Your domain is unlocked and Privacy Protection has been disabled' +
				' to prepare for transfer.' );
		} else if ( domainLockingAvailable ) {
			domainStateMessage = translate( 'Your domain is unlocked to prepare for transfer.' );
		}
		// If the domain doesn't support locking don't even mention it, it would
		// just confuse the user.

		if ( submitting ) {
			statusMessage = translate( 'Sending request…' );
		} else if ( canceled ) {
			// If we've enabled privacy we'll be redirected
			// to the locked page, so we only need the base message here.
			statusMessage = translate( 'We\'ve canceled your domain transfer.' );
		} else if ( manualTransferRequired ) {
			statusMessage = translate( 'The registry for your domain requires a special process for transfers. ' +
				'Our Happiness Engineers have been notified about your transfer request and will be in touch ' +
				'shortly to help you complete the process.' );
		} else {
			statusMessage = translate( 'We have sent the transfer authorization code to the domain registrant\'s' +
				' email address. You must provide your registrar with your domain name and transfer code to complete' +
				' the transfer process.' );
		}

		return (
			<div>
				<SectionHeader label={ translate( 'Transfer Domain' ) } className="transfer-out__section-header">
					<Button
							onClick={ this.handleCancelTransferClick }
							disabled={ this.state.submitting }
							compact>{ translate( 'Cancel Transfer' ) }</Button>
					{ ! manualTransferRequired && <Button
							onClick={ this.handleResendConfirmationCodeClick }
							disabled={ this.state.submitting }
							compact
							primary>{ translate( 'Resend Transfer Code' ) }</Button> }
				</SectionHeader>

				<Card className="transfer-card">
					<div>
						{ domainStateMessage && <p>{ domainStateMessage }</p> }
						<p>
							{ statusMessage } <a
							href={ support.TRANSFER_DOMAIN_REGISTRATION }
							target="_blank"
							rel="noopener noreferrer">{ translate( 'Learn More.' ) }</a>
						</p>
					</div>
				</Card>
			</div>
		);
	}
}

export default localize( Unlocked );
