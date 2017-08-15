'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Book = new Schema({
  id        : String,
  title     : String,
  authors   : [Schema.Types.String],
  publisher : String,
  thumbnail : String,
  link      : String,
  request   : Schema.Types.ObjectId
});

Book.methods.setOwnerId = function(user, cb) {
  this.model('Book').findOneAndUpdate(
    { _id: this._id },
    { _owner : user._id },
    { new: true, upsert: false },
    function(error, doc) {
      if(error) { console.log('Mongo error: ' + error.message) }
      cb(doc);
    }
  );
}

Book.methods.getOwnerId = function(cb) {
  cb(this._owner);
}

Book.statics.searchForBook = function(searchTerm, cb) {
  const googleBooks = require('../common/google-books-search');
  const model = this;

  const searchOptions = {
    key     : process.env.GOOGLE_KEY,
    // field   : 'title',
    offset  : 0,
    limit   : 1,
    type    : 'books',
    // order   : 'relevance',
    lang    : 'en',
    country : 'US'
  };

  googleBooks.search(searchTerm, searchOptions, (error, books) => {
    if ( ! error ) {
      let book = books[0];
      model.findOneAndUpdate(
        { 'id': book.id },
        { $set: {
          'id'        : book.id,
          'title'     : book.title,
          'authors'   : book.authors,
          'publisher' : book.publisher,
          'thumbnail' : book.thumbnail,
          'link'      : book.link
          }
        },
        { upsert: true, new: true },
        (error, doc) => {
          if(error) { console.log('mongoose error: ' + error.message) }
          cb(doc);
        }
      );
    } else {
      console.log(error.message);
    }
  });
}

Book.statics.getBooks = function(cb) {
  this
    .find({}).sort({title: 'ascending'})
    .exec((err, books) => {
      cb(err, books);
    });
}

module.exports = mongoose.model('Book', Book);


