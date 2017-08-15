'use strict';

var https = require('https');
var querystring = require('querystring');

// https://developers.google.com/books/docs/v1/using#st_params
var defaultOptions = {
  key: null,          // Google API key
  field: null,        // Search in a specified field
  offset: 0,          // Start index into the collection (startIndex)
  limit: 10,          // Maximum number of elements returned with this request (Max 40) (maxResults)
  type: 'all',        // Restrict results to books or magazines (or both) (printType)
  order: 'relevance', // Order results by relevance or newest (orderBy)
  lang: 'en',         // Restrict results to a specified language (two-letter ISO-639-1 code) (langRestrict)
  country: 'US'       // Country code
};

// Special Keywords
var fields = {
  title: 'intitle:',
  author: 'inauthor:',
  publisher: 'inpublisher:',
  subject: 'subject:',
  isbn: 'isbn:'
};

// Base url for Google Books API
var API_BASE_URL = 'https://www.googleapis.com/books/v1';

/**
 * Search Google Books
 *
 * https://developers.google.com/books/docs/v1/reference/volumes/list
 *
 * @param  {String}   query
 * @param  {object}   options
 * @param  {Function} callback
 */
var search = function(query, options, callback) {

  // Make the options object optional
  if (typeof callback !== 'function') {
    callback = options;
    options = {};
  }

  var options = Object.assign({}, defaultOptions, options);

  // Validate options
  if (!query) {
    return callback(new Error('Query is required'));
  }

  if (options.offset < 0) {
    return callback(new Error('Offset cannot be below 0'));
  }

  if (options.limit < 1 || options.limit > 40) {
    return callback(new Error('Limit must be between 1 and 40'));
  }

  // Set any special keywords
  if (options.field) {
    query = fields[options.field] + query;
  }

  // Create the request uri
  var query = {
    q: '"' + query + '"',
    startIndex: options.offset,
    maxResults: options.limit,
    printType: options.type,
    orderBy: options.order,
    langRestrict: options.lang,
    country: options.country
  };

  if (options.key) {
    query.key = options.key;
  }

  sendRequest('/volumes', query, function(err, response) {
    if (err) {
      return callback(err);
    }

    if (!Array.isArray(response.items)) {
      return callback(null, []);
    }

    const results = response.items.map(parseBook).filter(i => i);

    callback(null, results, response);
  });
};


// Send a Google Books API request
// @return {void}
var sendRequest = function(path, params, callback) {
  var url = API_BASE_URL;

  if (path) {
    url += path;
  }

  if (params) {
    url += '?' + querystring.stringify(params);
  }

  https.get(url, function(response) {
    if (response.statusCode !== 200) {
      console.log(response);
      return callback(new Error('Google Books API error. Status Code: ' + response.statusCode + ', Status Message: ' + response.statusMessage));
    }

    var body = '';

    response.on('data', function(data) {
      body += data;
    });

    response.on('end', function() {
      var err, data;
      try {
        data = JSON.parse(body);
      } catch (e) {
        err = new Error('Invalid response from Google Books API.');
      }

      if (data.error) {
        callback(new Error(data.error.message));
      } else {
        callback(err, data);
      }            
    });

  }).on('error', function(error) {
    callback(error);
  });
};

var pick = function(object, array) {
  let picked = {};

  array.forEach(key => {
    if(object && object.hasOwnProperty(key)) {
      picked[key] = object[key];
    }
  });

  return picked;
}

var get = function(object, string) {
  let picked = object;

  string.split('.').every(key => {
    if(picked && picked.hasOwnProperty(key)) {
      picked = picked[key];
      return true;
    } else {
      picked = {};
      return false;
    };
  });

  return picked;
};

var parseBook = function(data) {
  // console.log(data);

  let book = pick(data.volumeInfo, ['title', 'subtitle', 'authors', 'publisher', 'publishedDate', 'description', 'industryIdentifiers', 'pageCount', 'printType', 'categories', 'averageRating', 'ratingsCount', 'maturityRating', 'language']);

  Object.assign(book, {
    id: data.id,
    link: data.volumeInfo.canonicalVolumeLink,
    thumbnail: get(data, 'volumeInfo.imageLinks.thumbnail'),
    images: pick(data.volumeInfo.imageLinks, ['small', 'medium', 'large', 'extraLarge'])
  });

  return book;
};


module.exports.search = search;
