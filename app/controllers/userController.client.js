'use strict';

(function () {

  var profileId = document.querySelector('#profile-id') || null;
  var profileUsername = document.querySelector('#profile-username') || null;
  var profileBooks = document.querySelector('#profile-books') || null;
  var displayName = document.querySelector('#display-name');
  var apiUrl = appUrl + '/api/:id';

  function updateHtmlElement (data, element, userProperty) {
    element.innerHTML = data[userProperty];
  }

  ajaxFunctions.ready(ajaxFunctions.ajaxRequest('GET', apiUrl, function (data) {
    var userObject = JSON.parse(data);
    console.log(userObject);

    if (userObject.displayName !== null) {
      updateHtmlElement(userObject['twitter'], displayName, 'displayName');
    } else {
      updateHtmlElement(userObject['twitter'], displayName, 'username');
    }

    if (profileId !== null) {
      updateHtmlElement(userObject['twitter'], profileId, 'id');   
    }

    if (profileUsername !== null) {
      updateHtmlElement(userObject['twitter'], profileUsername, 'username');   
    }

    if (profileBooks !== null) {
      updateHtmlElement(userObject, profileBooks, 'books');   
    }

  }));
})();
