const passport = require('passport');
const bcrypt = require('bcrypt');

module.exports = function (app, myDataBase){

    const ensureAuthenticated = (req, res, next) => {
        if(req.isAuthenticated()) return next();
        res.redirect('/');
      }

    app.route('/').get((req, res) => {
        res.render('index', {title: 'Connected to Database', message: 'Please login', showLogin: true, showRegistration: true});
      });

    app.route('/login').post(passport.authenticate('local', {failureRedirect: '/'}), (req, res) => {
        res.redirect('/profile')
      })
    
    app.route('/profile').get(ensureAuthenticated, (req, res) => {
        res.render('profile', {username: req.user.username});
      })
    
    app.route('/logout').get((req, res) => {
        req.logOut();
        res.redirect('/');
      })

    app.route('/register').post((req, res, next) => {
        const hash = bcrypt.hashSync(req.body.password, 12);
        myDataBase.findOne({username: req.body.username} ,(err, user) => {
          if(err) next(err);
          if(user) res.redirect('/');
          else myDataBase.insertOne({
            username: req.body.username,
            password: hash
          }, (err, doc) => {
            if(err) res.redirect('/');
            else next(null, doc.ops[0]);
          })
        })
      }, passport.authenticate('local', {failureRedirect: '/'}), (req, res, next) => {
        res.redirect('/profile');
      });
}