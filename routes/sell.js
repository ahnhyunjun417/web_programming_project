var express = require('express');
var router = express.Router();

/* GET list of selling products */
router.get('/:option', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* POST new product to sell */
router.post('/register', function(req, res, next) {
  res.send('respond with a resource');
});

/* GET details of the item */
router.post('/:id', function(req, res, next) {
  res.send('respond with a resource');
});

/* PATCH update the information of the item */
router.patch('/:id', function(req, res, next) {
  res.send('respond with a resource');
});

/* DELETE update the information of the item */
router.delete('/:id', function(req, res, next) {
    res.send('respond with a resource');
});

module.exports = router;
