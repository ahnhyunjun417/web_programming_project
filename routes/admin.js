var express = require('express');
var router = express.Router();

const db = require('../models');
const {uploadImage} = require('../utils/multer');
const {Op} = require('sequelize');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { sequelize, Sequelize } = require('../models');
require('dotenv').config();

/* 메인 페이지 */
router.get('/', async function(req, res, next) {
  try{
    const token = req.cookies.jwt;
    const key = process.env.JWT_SECRET;

    const identity = jwt.verify(token, key);
    const user = await db.Users.findOne({
        where:{
            id: identity.id,
            userId: identity.userId,
            authority: identity.authority
        }
    });

    if(user){
      res.render('./common/error', {message: "관리자 계정 로그인이 유효하지 않습니다.", "error": {status: "401"}});
    }
    if(identity.authority != 3){
      res.render('./common/error', {message: "관리자 계정 로그인이 유효하지 않습니다.", "error": {status: "401"}});
    }

  }catch(err){
    res.render('./common/error', {message: "내부 시스템 오류!! 다시 요청해주세요", "error": {status: "500"}});
  }

  const pageNumber = 1;
  const pageSize = 12;
  let content = [];

  try{
    let totalCount = await db.Products.count({});
    totalCount = parseInt(totalCount);

    let totalPages = parseInt(totalCount / pageSize);
    if(totalCount % pageSize > 0){
      totalPages = totalPages + 1;
    }

    if(totalCount == 0){
      res.render('./admin/index', { 
        totalItems: totalCount,
        pageNumber: pageNumber,
        pageSize: pageSize,
        totalPages: totalPages,
        prevPage: pageNumber - 1,
        nextPage: pageNumber + 1,
        content: content,
        order: "option1",
        searchText: "",
        seller: "",
        minPrice: "",
        maxPrice: "",
      });
    }

    let offset = (pageNumber - 1) * pageSize;
    let productList = await db.Products.findAll({
      raw: true,
      offset: offset,
      limit: pageSize,
      order:[['createdAt', 'DESC']],
    });

    for(let i = 0; i < productList.length ; i++){
      let temp = new Object();
      temp.id = productList[i].id;
      temp.name = productList[i].name;
      temp.image = productList[i].image1;
      temp.price = productList[i].price;
      let seller = await db.Users.findOne({
        where:{
          id: productList[i].seller,
        }
      });
      temp.seller = seller.dataValues.name;
      temp.phone = productList[i].phone;
      temp.location = productList[i].location;
      temp.status = "일반 판매 중";
      if(productList[i].status == 1){
        temp.status = "경매 판매 중";
      }else if(productList[i].status == 2){
        temp.status = "판매 완료";
      }
      content.push(temp);
    }

    res.render('./admin/index', { 
      totalItems: totalCount,
      pageNumber: pageNumber,
      pageSize: pageSize,
      totalPages: totalPages,
      prevPage: pageNumber - 1,
      nextPage: pageNumber + 1,
      content: content,
      order: "option1",
      searchText: "",
      seller: "",
      minPrice: "",
      maxPrice: "",
    });
  }catch(err){
    res.render('./common/error', {message: "내부 시스템 오류!! 다시 요청해주세요", "error": {status: "500"}});
  }
});

/* 상품 검색 기능 */
router.get('/search', async function(req, res, next) {
  try{
    const token = req.cookies.jwt;
    const key = process.env.JWT_SECRET;

    const identity = jwt.verify(token, key);
    const user = await db.Users.findOne({
        where:{
            id: identity.id,
            userId: identity.userId,
            authority: identity.authority
        }
    });

    if(user){
      res.render('./common/error', {message: "관리자 계정 로그인이 유효하지 않습니다.", "error": {status: "401"}});
    }
    if(identity.authority != 3){
      res.render('./common/error', {message: "관리자 계정 로그인이 유효하지 않습니다.", "error": {status: "401"}});
    }

  }catch(err){
    res.render('./common/error', {message: "내부 시스템 오류!! 다시 요청해주세요", "error": {status: "500"}});
  }

  if(!req.query.pageSize || !req.query.pageNumber){
    res.render('common/error', {message: "내부 시스템 오류!! 다시 요청해주세요", "error": {status: "500"}});
  }
  const pageNumber = parseInt(req.query.pageNumber);
  const pageSize = parseInt(req.query.pageSize);
  let content = [];
  try{
    filter = [];
    if(req.query.searchText != ""){
      filter.append({name: {[Op.substring]: req.query.searchText}});
    }
    if(req.query.seller != ""){
      filter.append({seller: {[Op.substring]: req.query.seller}});
    }
    if(req.query.minPrice != ""){
      minPrice = parseInt(minPrice);
      filter.append({price: {[Op.gte]: minPrice}});
    }
    if(req.query.maxPrice != ""){
      minPrice = parseInt(maxPrice);
      filter.append({price: {[Op.lte]: maxPrice}});
    }

    let orderStandard = 'createdAt';
    let order = 'desc';
    if(req.query.order == "option2"){
      orderStandard = 'stars';
    }else if(req.query.order == "option3"){
      orderStandard = 'price';
      order = 'asc';
    }else if(req.query.order == "option4"){
      orderStandard = 'price';
    }

    order = [[orderStandard, order]];

    totalCount = await db.Products.count({
      where:{
        [Op.and]: filter,
      }
    });
    totalCount = parseInt(totalCount);
    
    totalPages = parseInt(totalCount / pageSize);
    if(totalCount % pageSize > 0){
      totalPages = totalPages + 1;
    }

    if(totalCount == 0){
      res.send({ 
        totalItems: totalCount,
        pageNumber: pageNumber,
        pageSize: pageSize,
        totalPages: totalPages,
        prevPage: pageNumber - 1,
        nextPage: pageNumber + 1,
        content: content,
        order: req.query.order,
        searchText: req.query.searchText,
        seller: req.query.seller,
        minPrice: req.query.minPrice,
        maxPrice: req.query.maxPrice,
      });
    }

    if(totalPages < pageNumber || pageNumber < 1){
      res.render('common/error', {message: "존재하지 않는 페이지 입니다.", "error": {status: "400"}});
    }

    let offset = (pageNumber - 1) * pageSize;
    let productList = await db.Products.findAll({
      subQuery: false,
      offset: offset,
      limit: pageSize,
      order: order,
      where:{
        [Op.and]: filter,
      },
      attributes: {
        include: [[Sequelize.fn('COUNT', Sequelize.col('wishes.product')), 'stars']]
      },
      include: [{
        model: db.Wishes, attributes: []
      }],
      group: ['wishes.product']
    });
    for(let i = 0; i < productList.length ; i++){
      productList[i] = productList[i].dataValues;
    }

    for(let i = 0; i < productList.length ; i++){
      let temp = new Object();
      temp.id = productList[i].id;
      temp.name = productList[i].name;
      temp.image = productList[i].image1;
      temp.price = productList[i].price;
      let seller = await db.Users.findOne({
        where:{
          id: productList[i].seller,
        }
      });
      temp.seller = seller.dataValues.name;
      temp.phone = productList[i].phone;
      temp.location = productList[i].location;
      temp.status = "일반 판매 중";
      if(productList[i].status == 1){
        temp.status = "경매 판매 중";
      }else if(productList[i].status == 2){
        temp.status = "판매 완료";
      }
      content.push(temp);
    }

    res.send({ 
      totalItems: totalCount,
      pageNumber: pageNumber,
      pageSize: pageSize,
      totalPages: totalPages,
      prevPage: pageNumber - 1,
      nextPage: pageNumber + 1,
      content: content,
      order: req.query.order,
      searchText: req.query.searchText,
      seller: req.query.seller,
      minPrice: req.query.minPrice,
      maxPrice: req.query.maxPrice,
    });
  }catch(err){
    res.render('common/error', {message: "내부 시스템 오류!! 다시 요청해주세요", "error": {status: "500"}});
  }
});

/* 상품 세부 정보 페이지로 이동  */
router.get('/item/:id', async function(req, res, next) {
  try{
    const token = req.cookies.jwt;
    const key = process.env.JWT_SECRET;
    
    const identity = jwt.verify(token, key);
    const user = await db.Users.findOne({
        where:{
            id: identity.id,
            userId: identity.userId,
            authority: identity.authority
        }
    });

    if(user){
      res.render('./common/error', {message: "관리자 계정 로그인이 유효하지 않습니다.", "error": {status: "401"}});
    }
    if(identity.authority != 3){
      res.render('./common/error', {message: "관리자 계정 로그인이 유효하지 않습니다.", "error": {status: "401"}});
    }

    const product = await db.Products.findOne({
      where:{
        id: req.params.id
      },
      attributes: {
        include: [[Sequelize.fn('COUNT', Sequelize.col('wishes.product')), 'stars']]
      },
      include: [{
        model: db.Wishes, attributes: []
      }],
      group: ['wishes.product']
    });

    if(!product){
      res.render('common/error', {message: "존재하지 않는 페이지 입니다.", "error": {status: "404"}});
    }

    let temp = new Object();
    temp.id = product.dataValues.id;
    temp.name = product.dataValues.name;
    temp.price = product.dataValues.price.toLocaleString('ko-KR');
    let seller = await db.Users.findOne({
      where:{
        id: product.dataValues.seller,
      }
    });
    temp.seller = seller.dataValues.name;
    temp.location = product.dataValues.location;
    temp.phone = product.dataValues.phone;
    temp.stars = product.dataValues.stars;
    temp.images = [];
    if(product.dataValues.image1){
      temp.images.append(product.dataValues.image1);
    }
    if(product.dataValues.image2){
      temp.images.append(product.dataValues.image2);
    }
    if(product.dataValues.image3){
      temp.images.append(product.dataValues.image3);
    }

    temp.isAuction = "일반 판매";
    if(product.dataValues.isAuction){
      temp.isAuction = "경매 판매"
    }

    temp.status = "일반 판매 중";
    if(product.dataValues.status == 1){
      temp.status = "경매 판매 중";
    }else if(product.dataValues.status == 2){
      temp.status = "판매 완료";
    }

    res.render('admin/productDetails', temp);
  }catch(err){
    res.render('common/error', {message: "내부 시스템 오류!! 다시 요청해주세요", "error": {status: "500"}});
  }
});

/* 상품 제거 하기  */
router.delete('/item/:id', function(req, res, next) {
  res.send('respond with a resource');
});

/* 사용자 세부 정보 수정 페이지로 이동  */
router.get('/user/:id', function(req, res, next) {
  res.send('respond with a resource');
});

/* 사용자 세부 정보 수정  */
router.patch('/user/:id', function(req, res, next) {
  res.send('respond with a resource');
});

/* 사용자 계정 삭제  */
router.delete('/user/:id', function(req, res, next) {
  res.send('respond with a resource');
});

/* 사용자 목록 페이지로 이동 */
router.get('/users', function(req, res, next) {
  res.send('respond with a resource');
});

/* 사용자 계정 검색 기능 */
router.get('/users/search', function(req, res, next) {
  res.send('respond with a resource');
});

module.exports = router;
