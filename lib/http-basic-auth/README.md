Node.JS HTTP client with basic access authentication support
============================================================

This little library provides a support for basic access authentication
for Node.JS http client.

Installation
------------

    npm install http-basic-auth

Usage
-----

    var http = require('http-basic-auth');
    var client = http.createClient(port, host, secure, credentials, {
        username: 'myname',
        password: 'verysecret'
    });

_`port`_, _`host`_, _`secure`_ and _`credentials`_ are same as in
the default Node.JS HTTP client.

Contributing
------------

1. Email me

[1]: http://en.wikipedia.org/wiki/Basic_access_authentication