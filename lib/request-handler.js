var request = require('request');
var crypto = require('crypto');
var bcrypt = require('bcrypt-nodejs');
var util = require('../lib/utility');

// var db = require('../app/config');
var User = require('../app/models/user');
var Link = require('../app/models/link');
// var Users = require('../app/collections/users');
// var Links = require('../app/collections/links');

exports.renderIndex = function(req, res) {
  res.render('index');
};

exports.signupUserForm = function(req, res) {
  res.render('signup');
};

exports.loginUserForm = function(req, res) {
  res.render('login');
};

exports.logoutUser = function(req, res) {
  req.session.destroy(function(){
    res.redirect('/login');
  });
};

exports.fetchLinks = function(req, res) {
  Link.find(function(err, link) {
    if (err) return handleError(err);
    res.send(200, link);
  });
};

exports.saveLink = function(req, res) {
  console.log('in save link');
  var uri = req.body.url;

  //if not a valid url, give an error message
  if (!util.isValidUrl(uri)) {
    console.log('Not a valid url: ', uri);
    return res.send(404);
  } else {

  //otherwise, try to find the link in the database
  Link.find({url: uri}, function(err, link) {
    console.log('in link find', link);

      //if it's found, give back the attributes
      if (link[0]) {
        console.log('attributes, ', link, link.code);
        res.send(200, link[0]);


      //if it's not found, try to get its title
    } else {
      util.getUrlTitle(uri, function(err, title) {
          //if can't get title, error
          if (err) {
            console.log('Error reading URL heading: ', err);
            return res.send(404);
          } else {

          //if you can get the title, create the database record
          Link.create({
            url: uri,
            title: title,
            base_url: req.headers.origin,
            visits: 0
          }, function(err, link) {
            console.log('creating link, ',  link);
            link.save();
            res.json(200, link);
          });
        }
      });
    }
  });
}
};

exports.loginUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  User.find({ username: username }, function(err, user) {
    if (!user) {
      res.redirect('/login');
    } else {
      user.comparePassword(password, function(match) {
        if (match) {
          util.createSession(req, res, user);
        } else {
          res.redirect('/login');
        }
      });
    }
  });
};

exports.signupUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  User.find({ username: username }, function(err, user) {
    if (user[0]) {
      console.log('Account already exists');
      res.redirect('/signup');
    } else {
      console.log("getting to hear")
      console.log(req.body)
      console.log(username, password)
      var user = new User({
        username: username,
        password: password
      });

      // function(err, user) {
        //   if (err) {
        //     console.log('there was an error', err);
        //     console.log('wowowowo', user);
        //   } else {
      console.log('user' , user);
        //util.createSession(req, res, user);
      user.save(util.createSession(req, res, user))
    }
  });

};

exports.navToLink = function(req, res) {
  Link.find({ code: req.params[0] }, function(err, link) {
    if (!link[0]) {
      res.redirect('/');
    } else {
      Link.update({code: req.params[0]}, {$inc: {visits: + 1 }}, {multi: false});
      return res.redirect(link[0].url);
    }
  });
};
