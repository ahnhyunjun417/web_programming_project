var express = require('express');
var router = express.Router();

/* GET list(user list). */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* GET user details */
router.get('/:id', function(req, res, next) {
  res.send('respond with a resource');
});

/* PATCH user detail update  */
router.patch('/:id', function(req, res, next) {
  res.send('respond with a resource');
});

/* DELETE user account */
router.delete(':id', function(req, res, next) {
  res.send('respond with a resource');
});

module.exports = router;
