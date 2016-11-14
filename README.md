READ ME
=======

This library provides support for managing oAuth2 and Loopback-style API sessions based on access tokens, NotificationManager GUI feedback controls, and file upload capabilities (untested) using Angular.js 1.x.

REQUIREMENTS
============

APIs for providing oAuth2 and/or login services are required by this library. This API can be a single API with models exposed via the Loopback Angular SDK, or a secondary API to supplement a Loopback Angular SDK exposed API. For internal portals such as the HSM Server Admin, it does not make sense to send requests to a public-facing API (like the main API), nor does it make sense to duplicate authentication functionality within these internal APIs. If you wish to provide a secondary API, simply provide this as an argument in your website's environment.js:

`mainApiUrl: 'http://localhost:3002/api'`

When this variable is present, this API will be used for all authentication functions. Authentication functions are defined in the included `APISupport` factory.

AUTHENTICATION MODES
====================

This module supports both oAuth2 logins and simple Loopback-style password logins. oAuth2 logins should be used as much as possible to support useful oAuth2 concepts such as scopes and application/client registrations. 

oAuth2
------

To support oAuth2 logins, simply include your authorization URL in your `loginRedirect` environment.js variable. For example:

`logoutRedirect: 'http://ourAuth2AuthPage/#/oauthLogin/client_id/mintchip-invoice-portal/redirect_uri/http%3A%2F%2Flocalhost%3A9000/response_type/code/scope/invoice-read-write'`

The client_id, redirect_uri and scope must match your defined client registration. The redirect_uri is a URI encoded URL which you can derive in your browser's console by entering:

`encodeURIComponent('http://yoururl')`

This will redirect to our centralized oAuth2 authorization page, and on authorization redirect back to redirect_uri. A cookie will also be set using your environment.js' cookieName variable, e.g.:

`cookieName: 'mcAccessToken'`

this cookie contains your oAuth2 bearer token. When your cookie is missing or expired, your app will redirect to your logoutRedirect simply by having the loopback-angular-loader module installed and loaded (via your script tag).

Environment specific hostnames and redirect URIs should be defined in your Gruntfile.js.


Loopback-style passwords
------------------------

Loopback passwords work the same way, except your project needs its own login page. Your login page should show a NotificationManager message when this module has redirected here because of an expired/missing cookie:

	if ($cookies.getObject(Environment.getConfig('cookieName') + '_loginref')) {
		NotificationManager.error('Permission required to access resource');
	}
	
To login and logout, use `ApplicationSecurity.login()` and `ApplicationSecurity.logout()`, respectfully. The login function also supports page specific login redirect URLs, as defined in your `environment.js`:

	loginRedirect: function(user, refUrl) {
		if (refUrl) {
			return refUrl;
		}
		else {
			return '/'; 
		}
	}
	
This way, your app can support context-specific login redirects, or a generic site-wide one.
