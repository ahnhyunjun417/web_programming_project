var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* POST users login. */
router.post('/login', function(req, res, next) {
  res.send('respond with a resource');
});

/* POST users logout. */
router.post('/logout', function(req, res, next) {
  res.send('respond with a resource');
});

/* POST users register. */
router.post('/register', function(req, res, next) {
  res.send('respond with a resource');
});

/* DELETE users withdraw. */
router.delete('/withdraw', function(req, res, next) {
  res.send('respond with a resource');
});

module.exports = router;
