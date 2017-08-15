'use strict';

var path = process.cwd();
var BookHandler = require(path + '/app/controllers/bookHandler.server.js');

module.exports = function (app, passport) {

	function isLoggedIn (req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    } else {
      res.redirect('/login');
    }
  }

  var bookHandler = new BookHandler();

  app.route('/')
    .get(function (req, res) {
      res.redirect('/books');
    });

  app.route('/login')
    .get(function (req, res) {
      res.redirect('/auth/twitter');
    });

  app.route('/logout')
    .get(function (req, res) {
      req.logout();
      res.redirect('/books');
    });

  app.route('/profile')
    .get(function (req, res) {
      res.redirect('/users/:user_id');
    })

  app.route('/search')
    .post(isLoggedIn, bookHandler.searchForBook);

  app.route('/auth/twitter/callback')
    .get(passport.authenticate('twitter', {
      successRedirect: '/',
      failureRedirect: '/login'
    }));

  app.route('/auth/twitter')
    .get(passport.authenticate('twitter'));

  app.route('/books')
    .get(bookHandler.getBooks)
    .post(isLoggedIn, bookHandler.createBook);

  app.route('/books/:book_id')
    .get(bookHandler.getBook)
    .delete(isLoggedIn, bookHandler.deleteBook);

  app.route('/books/:book_id/request')
    .post(isLoggedIn, bookHandler.createBookRequest)
    .put(isLoggedIn, bookHandler.acceptBookRequest)
    .patch(isLoggedIn, bookHandler.denyBookRequest)
    .delete(isLoggedIn, bookHandler.cancelBookRequest);

  app.route('/users/:user_id')
    .get(isLoggedIn, bookHandler.getUser)
    .post(isLoggedIn, bookHandler.updateUser);

  app.route('/users/:user_id/books')
    .get(isLoggedIn, bookHandler.getUserBooks)

  app.route('/users/:user_id/trades')
    .get(isLoggedIn, bookHandler.getUserTrades)

  app.route('/api/:id')
    .get(isLoggedIn, function (req, res) {
      res.json(req.user);
    });
};
