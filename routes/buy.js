var express = require('express');
var router = express.Router();

/* GET list(shopping list, wish list, auction participation list). */
router.get('/:option', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* GET item details */
router.get('/item/:id', function(req, res, next) {
  res.send('respond with a resource');
});

/* POST item purchase and bidding by detecting body option  */
router.post('/item/:id', function(req, res, next) {
  res.send('respond with a resource');
});

/* PATCH cancel the purchase */
router.patch('/item/:id', function(req, res, next) {
  res.send('respond with a resource');
});

module.exports = router;
