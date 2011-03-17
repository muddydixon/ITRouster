var mongoose = module.parent.exports.mongoose,
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var User = new Schema({
  name: String,
  sceen_name: String,
  uid: {type: String, index: {unique: true}},
  profile_image_url: String,
  loc: String
});

var Entry = new Schema({
  tid: {type: String, index: {unique: true}},
  user: [User],
  text: String,
  rts: Number,
  //created_at:{type: Date, default: Date.now},
  created_at: String,
  helpcnt: Number,
  helpers: [User],
  geo: [Number],
  stat: String 
});
mongoose.model('User', User);
mongoose.model('Entry', Entry);

module.exports = exports = {
  Entry : mongoose.model('Entry'),
  User: mongoose.model('User')
};
