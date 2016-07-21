READ ME
=======

This library integrates Loopback access tokens, the surrounding security involving session management, NotificationManager GUI feedback controls, and socket.io session management with web applications built using Angular.js 1.x.

REQUIREMENTS
============

The API used by this library needs a `User` model, and this model need to be exposed to your Angular application (which you can do using the Loopback Angular SDK, or the lb-ng command).

Your user model requires the following public endpoints:

- login
- getFromSession
- findById

Login
-----

Login logs in users and returns their accessToken and userId. This function can be a proxy to request an authentication request to an external API using a datasource.

getFromSession
--------------

Access tokens will be saved as browser cookies, and when pages are reloaded you will need a method to retrieve user information based on this access token. This method simply accepts the access token ID, returns the full accessToken object, including its userId.

findById
--------

Angular will usually need information about the owner of the access token. This method retreives user info by ID, or `/users/{id}`. You'll need to pass along the access token to require access to this data based on access token.

