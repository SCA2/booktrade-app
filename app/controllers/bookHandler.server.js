'use strict';

var User = require('../models/user');
var Book = require('../models/book');

function BookHandler () {
  this.searchForBook = (req, res) => {
    Book.searchForBook(req.body.query, book => {
      res.render('../views/books/new.pug', { book: book });
    });
  };

  this.getBooks = function (req, res) {
    Book.getBooks((err, books) => {
      if (err) { throw err; }
      res.render('../views/books/index.pug', { books: books });
    });
  };

  this.getUserBooks = function (req, res) {
    Book
      .find({ '_id' : { $in : req.user.books }})
      .exec(function (err, books) {
        if (err) { throw err; }
        res.render('../views/books/index.pug', { books: books });
      });
  };

  this.getUserTrades = function (req, res) {
    Book
      .find({ '_id' : { $in : req.user.books }, request: { $ne: null} })
      .exec(function (err, booksOthersWant) {
        if (err) { throw err; }
        Book
          .find({ request: req.user })
          .exec(function (err, booksUserWants) {
            if (err) { throw err; }
            res.render('../views/trades/index.pug', { booksUserWants: booksUserWants, booksOthersWant: booksOthersWant });
          });
      });
  };

  this.getBook = function (req, res) {
    Book.findById(req.params.book_id, (err, book) => {
      let isOwnedBy = req.isAuthenticated() && req.user && (req.user.books.indexOf(book._id) != -1);
      res.render('../views/books/show.pug', { book: book, user: req.user, isOwnedBy: isOwnedBy });
    });
  };

  this.createBook = (req, res) => {
    Book
      .findOneAndUpdate(
        { 'id': req.body.id },
        { $set: req.body },
        { new: true, upsert: true }
      ).exec((err, doc) => {
        req.user.books.addToSet(doc);
        req.user.save().then( res.redirect('/books') );
      });
  };

  this.deleteBook = function (req, res) {
    Book
      .findById(req.params.book_id)  
      .exec((err, book) => {
        if (err) { throw err; }
        req.user.update({ $pull: { books: book._id }}, err => {
          book.remove();
          res.redirect('/books');
        });
      });
  };

  this.createBookRequest = (req, res) => {
    Book
      .findOne({ '_id': req.params.book_id, request: null })
      .exec((err, book) => {
        book.update({ $set: { request: req.body.requestor }}, err => {
          res.redirect('/books');
        });
      });
  };

  this.acceptBookRequest = (req, res) => {
    Book
      .findOne({ '_id': req.params.book_id, '_id' : { $in : req.user.books }, request: { $ne: null} })
      .exec((err, book) => {
        User.findOne({'_id': book.request}).exec((err, requestor) => {
          requestor.update({ $addToSet: { books: book._id }}, err => {
            req.user.update({ $pull: { books: book._id }}, err => {
              book.update({ request: null }, { new: true }, (err, book) => {
                res.redirect('/books');
              });
            });
          });
        });
      });
  };

  this.cancelBookRequest = (req, res) => {
    Book
      .findOne({ '_id': req.params.book_id, request: req.user._id })
      .exec((err, book) => {
        book.update({ request: null }, err => {
          res.redirect('/books');
        });
      });
  };

  this.denyBookRequest = (req, res) => {
    Book
      .findOne({ '_id': req.params.book_id, '_id' : { $in : req.user.books }, request: { $ne: null } })
      .exec((err, book) => {
        book.update({ request: null }, err => {
          res.redirect('/books');
        });
      });
  };

  this.getUser = (req, res) => {
    res.render('../views/users/new.pug');
  };

  this.updateUser = (req, res) => {
    req.user.update(
      { $set: { city: req.body.city, state: req.body.state }},
      { new: true, upsert: false },
      (err, doc) => {
        res.redirect('/books');
      }
    );
  };

}

module.exports = BookHandler;
