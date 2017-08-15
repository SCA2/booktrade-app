'use strict';

process.env.NODE_ENV = 'test';

const mongoose = require("mongoose");
const User = require('../app/models/user');
const Book = require('../app/models/book');

const chai = require('chai');
const chaiHttp = require('chai-http');
const passportStub = require('passport-stub');

const server = require('../server');
const expect = chai.expect;

chai.use(chaiHttp);
passportStub.install(server);

describe('Book', () => {

  var user, book_1, book_2;

  beforeEach(done => {
    Book.count({}, (err, count) => {
      if(count > 0) {
        console.log('Deleting ' + count + ' books...');
        Book.remove({}, (err, raw) => {
          console.log('Mongo: ' + raw);
        });
      }

      Book.count({}, (err, count) => {
        console.log('Books at start: ' + count);

        user = new User({
          twitter: {
            id: '1234',
            displayName: 'Joe Tester',
            username: 'joe.tester'
          },
          books: []
        });

        // book_2 = new Book({
        //   id        : 'book_2',
        //   title     : '1984',
        //   authors   : ['George Orwell'],
        //   publisher : 'Doubleday',
        //   thumbnail : 'thumbnail_url_2@example.com',
        //   link      : 'link_2@example.com',
        //   owner     : 0
        // });

        done();         
      });
    });
  });

  describe('instance', () => {
    it('starts with no books in the database', done => {
      Book.count({}, (err, count) => {
        expect(count).to.eql(0);
        done();         
      })
    });

    it('creates a valid book', done => {
      let book = new Book({
        id        : 'book_1',
        title     : 'Cujo',
        authors   : ['Stephen King'],
        publisher : 'Doubleday',
        thumbnail : 'thumbnail_url_1@example.com',
        link      : 'link_1@example.com',
        _owner    : user._id
      });

      book.save((err) => {
        expect(book.id).to.eql('book_1');
        expect(book.title).to.eql('Cujo');
        expect(book.authors).to.eql(['Stephen King']);
        expect(book.publisher).to.eql('Doubleday');
        expect(book.thumbnail).to.eql('thumbnail_url_1@example.com');
        expect(book.link).to.eql('link_1@example.com');
        expect(book._owner).to.eql(user._id);
        done();
      });
    });

    it('can set owner id', done => {
      let book = new Book({
        id        : 'book_1',
        title     : 'Cujo',
        authors   : ['Stephen King'],
        publisher : 'Doubleday',
        thumbnail : 'thumbnail_url_1@example.com',
        link      : 'link_1@example.com',
        _owner    : null
      });

      book.save(err => {
        book.setOwnerId(user, function(doc) {
          expect(doc._owner).to.eql(user._id);
          done();
        });
      });
    });

    it('can get book owner id', done => {
      let book = new Book({
        id        : 'book_1',
        title     : 'Cujo',
        authors   : ['Stephen King'],
        publisher : 'Doubleday',
        thumbnail : 'thumbnail_url_1@example.com',
        link      : 'link_1@example.com',
        _owner    : user
      });

      book.save(err => {
        book.getOwnerId(doc => {
          expect(doc).to.eql(user._id)
          done();
        });
      });
    });

  });

  describe('class', () => {
    it('starts with no books in the database', done => {
      Book.count({}, (err, count) => {
        expect(count).to.eql(0);
        done();
      })
    });

    it.skip('can get a book from google books', done => {
      let apiTestBook = require('./test-data.json');
      Book.searchForBook('The Plague, Albert Camus', book => {
        // console.log(book);
        expect(book.id).to.eql(apiTestBook.id);
        done();
      });
    });
  });
});

describe('UI', () => {
  beforeEach(done => {
    
    user = new User({
      twitter: {
        id: '1234',
        displayName: 'Joe Tester',
        username: 'joe.tester'
      },
      books: []
    });

    passportStub.logout();
  })

  describe('/profile', () => {
    it('redirects to /login if user not logged in', (done) => {
      chai.request(server)
      .get('/profile')
      .redirects(0)
      .end((err, res) => {
        expect(res).to.redirect;
        expect(res.header.location).to.eql('/login');
        done();
      });
    });
    it('GETs a logged-in user profile', (done) => {
      passportStub.login( user );
      chai.request(server)
      .get('/profile')
      .end((err, res) => {
        expect(res.status).to.eql(200);
        expect(res.type).to.eql('text/html');
        done();
      });
    });
  });
});

// describe('API', () => {


//   describe('/api/polls', () => {
//     it('GETs all of the polls', (done) => {
//       chai.request(server)
//       .get('/api/polls')
//       .end((err, res) => {
//         expect(res.text).to.include('President');
//         expect(res.text).to.include('Superheroes');
//         done();
//       });
//     });

//     it('redirects on POST if not logged in', (done) => {
//       chai.request(server)
//       .post('/api/polls')
//       .redirects(0)
//       .end((err, res) => {
//         expect(res).to.redirect;
//         expect(res.header.location).to.eql('/login');
//         done();
//       });
//     });

    // it('can create a book', done => {
    //   Book.createBook('FNSR', book => {
    //     expect(book.ticker).to.eql('FNSR');
    //     Book.count({}, (err, count) => {
    //       expect(count).to.eql(2)
    //       done();
    //     });
    //   });
    // });

    // it('can delete a book', done => {
    //   Book.deleteBook(book, book => {
    //     expect(book.ticker).to.eql('AAPL');
    //     Book.count({}, (err, count) => {
    //       expect(count).to.eql(0)
    //       done();
    //     });
    //   });
    // });

//     it('POSTs a new book', (done) => {
//       passportStub.login(user);
//       chai.request(server)
//       .post('/api/polls')
//       .send({poll_name: 'Ice Cream', option_1: 'Chocolate', option_2: 'Vanilla'})
//       .end((err, res) => {
//         expect(res).to.have.status(200);
//         expect(res.text).to.include('Ice Cream');
//         done();
//       });
//     });
//   });

//   describe('/api/polls/new', () => {
//     it('redirects to /login if user not logged in', (done) => {
//       chai.request(server)
//       .get('/api/polls/new')
//       .redirects(0)
//       .end((err, res) => {
//         expect(res).to.redirect;
//         expect(res.header.location).to.eql('/login');
//         done();
//       });
//     });

//     it('GETs new book form', (done) => {
//       passportStub.login(user);
//       chai.request(server)
//       .get('/api/polls/new')
//       .end((err, res) => {
//         expect(res.text).to.include('New Book');
//         done();
//       })
//     });
//   });

//   describe('/api/polls/:id', () => {
//     it('GETs :poll_id', (done) => {
//       passportStub.login(user);
//       chai.request(server)
//       .get('/api/polls/' + book_1._id)
//       .end((err, res) => {
//         expect(res.text).to.include('President');
//         expect(res.text).to.include('Clinton');
//         expect(res.text).to.include('Trump');
//         done();
//       });
//     });

//     it('redirects on PUT if user not logged in', (done) => {
//       chai.request(server)
//       .put('/api/polls/' + 'President')
//       .redirects(0)
//       .end((err, res) => {
//         expect(res).to.redirect;
//         expect(res.header.location).to.eql('/login');
//         done();
//       });
//     });

//     it('PUTs update to :poll_id', (done) => {
//       passportStub.login(user);
//       chai.request(server)
//       .put('/api/polls/' + book_1._id)
//       .send({book: {'President': {'Sanders':0, 'Trump':0}}})
//       .end((err, res) => {
//         expect(res.text).to.include('President');
//         expect(res.text).to.include('Sanders');
//         expect(res.text).to.include('Trump');
//         done();
//       });
//     });

//     it('redirects on DELETE if user not logged in', (done) => {
//       chai.request(server)
//       .delete('/api/polls/' + 'President')
//       .redirects(0)
//       .end((err, res) => {
//         expect(res).to.redirect;
//         expect(res.header.location).to.eql('/login');
//         done();
//       });
//     });

//     it('DELETEs :poll_id', (done) => {
//       passportStub.login(user);
//       chai.request(server)
//       .delete('/api/polls/' + book_1._id)
//       .end((err, res) => {
//         expect(res.text).not.to.include('President');
//         expect(res.text).to.include('Superheroes');
//         done();
//       });
//     });
//   });

//   describe('/api/polls/:poll_id/options', () => {
//     it('redirects on POST if user not logged in', (done) => {
//       chai.request(server)
//       .post('/api/polls/' + book_2.id + '/options')
//       .redirects(0)
//       .end((err, res) => {
//         expect(res).to.redirect;
//         expect(res.header.location).to.eql('/login');
//         done();
//       });
//     });

//     it('POSTs new option to :poll_id', (done) => {
//       var option = { new_option: 'Wonder Woman' };
//       passportStub.login(user);
//       chai.request(server)
//       .post('/api/polls/' + book_2._id + '/options')
//       .send(option)
//       .end((err, res) => {
//         // console.log(res.text)
//         expect(res.text).to.include('Wonder Woman');
//         // expect(res.text).to.include('Batman');
//         done();
//       });
//     });
//   });

//   describe('/api/:user_id/polls/:poll_id/options/:option_id', () => {
//     it('gets votes for :option_id in :poll_id', (done) => {
//       passportStub.login(user);
//       chai.request(server)
//       .get('/api/polls/' + book_2._id + '/options/' + 'Batman')
//       .end((err, res) => {
//         expect(res.body).to.equal(2);
//         done();
//       });
//     });

//     it('increments votes for :option_id in :poll_id', (done) => {
//       passportStub.login(user);
//       chai.request(server)
//       .put('/api/polls/' + book_2._id + '/options/' + 'Batman')
//       .end((err, res) => {
//         expect(res.body).to.equal(3);
//         done();
//       });
//     });

//     it('redirects on DELETE if user not logged in', (done) => {
//       chai.request(server)
//       .delete('/api/polls/' + book_2._id + '/options/' + 'Batman')
//       .redirects(0)
//       .end((err, res) => {
//         expect(res).to.redirect;
//         expect(res.header.location).to.eql('/login');
//         done();
//       });
//     });

//     it('DELETEs :option_id from :poll_id', (done) => {
//       passportStub.login(user);
//       chai.request(server)
//       .delete('/api/polls/' + book_2._id + '/options/' + 'Batman')
//       .end((err, res) => {
//         expect(res.text).to.include('Superheroes');
//         expect(res.text).to.not.include('Batman');
//         expect(res.text).to.include('Superman');
//         done();
//       });
//     });
//   });
// });