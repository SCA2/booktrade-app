'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var User = new Schema({
  twitter: {
    id: String,
    username: String,
    displayName: String
  },
  city: String,
  state: String,
  books: [{type: Schema.Types.ObjectId, ref: 'Book'}]
});

module.exports = mongoose.model('User', User);
