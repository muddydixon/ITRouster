var base64 = require('base64'),
    http = require('http');

function Client() {
    var self = this;
    this.request = function(method, path, request_headers) {
        var rh = request_headers || {};
        rh['Authorization'] = 'Basic ' + base64.encode(new Buffer(this.basic_auth.username + ':' + this.basic_auth.password));
        var request = this.client.request(method, path, rh);
        return request;
    };
};

exports.createClient = function(port, host, secure, credentials, basic_auth) {
    var c = new Client();
    c.client = http.createClient(port, host, secure, credentials);
    c.basic_auth = basic_auth || {
        username: undefined,
        password: undefined
    };
    return c;
};