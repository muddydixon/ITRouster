
/**
 * Module dependencies.
 */

var express = require('express'),
    app = module.exports = express.createServer(),
    config = module.exports = require('./config.js'),
    locals = require('./locals').jp,
    OAuth = require('oauth').OAuth,
    mongoose = module.exports.mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/ninsoku');
var models = require(process.cwd() + '/models');

var oauth = new OAuth(config.oauth.requestTokenUrl, config.oauth.accessTokenUrl, config.oauth.key, config.oauth.secret, '1.0', null, 'HMAC-SHA1');

// Configuration

app.configure(function(){
  app.set('port', 8080);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({secret: 'ninsoku'}));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.set('port', 80);
  app.use(express.errorHandler()); 
});

// Utils
var merge = function(target, source, deep){
  deep = deep || false;
  for(var i in source){
    if(source.hasOwnProperty(i)){
      if(deep || !target.hasOwnProperty(i)){
        target[i] = source[i];
      }
    }
  }
  return target;
};

var isJoined = function(user, entry){
  for(var j = 0, m = entry.helpers.length; j < m; j++){
    if(entry.helpers[j].uid === (''+user.id)){
      return true; 
    }
  }
  return false;
};

// Routes

app.get('/', function(req, res){
  var sort = {};
  if(req.query.rt){
    sort['rts'] = -1;
  }else if(req.query.helpers){
    sort['helpcnt'] = -1;
  }
  sort['created_at'] = -1;
  
  models.Entry.find({stat: 'wanted'}, {}, {sort: sort, limit: 10}, function(err, entries){
    if(err) res.render('index', merge({error: {code: 500, message: 'cannot connect database'}}, locals));

    if(req.session.login && req.session.login.user){
      var user = req.session.login.user;
      for(var i = 0, l = entries.length; i < l; i++){
        if(isJoined(user, entries[i])){
          entries[i].join = true;
        }
      }
    }
    res.render('index', merge({
      login: req.session.login,
      entries: entries
    }, locals));
  });
});

app.get('/oauth', function(req, res){
  if(req.session.auth){
    var auth = req.session.auth;

    oauth.getOAuthAccessToken(auth.oauth_token, auth.oauth_secret, req.query.oauth_verifier, function(error, oauth_access_token, oauth_access_token_secret, results2) {
      req.session.auth = undefined;
      oauth.getProtectedResource('http://api.twitter.com/1/account/verify_credentials.json', 'GET',
                                 oauth_access_token, oauth_access_token_secret, function(err, data, response){
        var user = JSON.parse(data);
       
        req.session.login = {
          user: user,
          token: oauth_access_token,
          secret: oauth_access_token_secret
        };
        res.redirect('/');
      });
    });
  }else{
    res.redirect('/');
  }
});

app.post('/entry/:id?', function(req, res){
  if(req.params.id){
    console.log(req.params.id);
  }else{
    console.log(req.body);
    res.send('hogehoge');
  }
});

app.put('/entry/:id', function(req, res){
  res.redirect('/');
});

app.get('/join', function(req, res){
  if(req.session.login){
    var user = req.session.login.user;
    models.Entry.findById(req.query.id, function(err, entry){
      if(err){
        return res.send({id:null, result: null, error: err});
      }else if(!entry){
        return res.send({id:null, result: null, error: {code:404, message: 'no entry '+req.query.id}});
      }
      if(isJoined(user, entry)){
        return res.send({id:null, error: null, result: {message: 'has joined'}});
      }
      if(!entry.helpers){
        entry.helpers = [];
      }
      entry.helpers.push({
        name: user.name,
        screen_name: user.screen_name,
        uid: user.id,
        profile_image_url: user.profile_image_url,
        loc: user.location
      });
      entry.helpcnt++;
      entry.save(function(err){
        if(err){
        }else{
          res.send({id:null, error:null, result: {message: 'join OK'}});
        }
      });
    });
  }else{
    res.redirect('/');
  }
});

app.get('/login', function(req, res){
  oauth.getOAuthRequestToken(function(err, oauth_token, oauth_token_secret, results){
    if(err){
      res.redirect('/');
    }else{
      req.session.auth = {
        id: req.query.id,
        oauth_token: oauth_token,
        oauth_token_secret: oauth_token_secret
      };
      res.redirect(config.oauth.authUrl+'?oauth_token='+oauth_token);
    }
  });
});


// Only listen on $ node app.js

if (!module.parent) {
  app.listen(app.settings.port);
  console.log("Express server listening on port %d", app.address().port);
}
