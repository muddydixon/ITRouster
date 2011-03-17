var qs = require('querystring'),
    config = require('../config.js'),
    http = require('http'),
    basicauth = require('../lib/http-basic-auth/http-basic-auth'),
    basicauthclient = basicauth.createClient(80, 'stream.twitter.com', false, false, config.twitter),
    req = basicauthclient.request('GET', '/1/statuses/filter.json?track=anpi', {'host': 'stream.twitter.com'}),
    mongoose = module.exports.mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/ninsoku');

var models = require(process.cwd() + '/models');

var MONTH = {'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
             'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11};

req.end();
req.on('response', function (res) {
  res.setEncoding('utf8');
  res.on('data', function(chunk) {
    try{
      var data = JSON.parse(chunk);
      if(data.retweeted_status){
        models.Entry.findOne({tid: data.retweeted_status.id_str}, function(err, entry){
          if(err){
            console.log('db find failure');
            return false;
          }
          if(!entry){
            return false;
          }
console.log('RT with '+entry.tid +' RT: '+entry.rts);
          entry.rts++;
          entry.save();
        });
      }else{
      console.log(data.id_str);
        var entry = new models.Entry({
          user: [{
            name: data.user.name,
            screen_name: data.user.screen_name,
            uid: data.user.id,
            profile_image_url: data.user.profile_image_url,
            loc: data.user.location
          }],
          tid: data.id_str,
          text: data.text,
          helpcnt: 0,
          helpers: [],
          rts: 0,
          created_at: data.created_at,
          stat: 'wanted',
        });
        entry.save();
      }
    }catch(ex){
    }
  })
})

