var express = require('express');
var router = express.Router();

const db = require('../models');
const {uploadImage} = require('../utils/multer');
const {Op} = require('sequelize');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { sequelize, Sequelize } = require('../models');
require('dotenv').config();

/* 메인 페이지로 이동 */
router.get('/', async function(req, res, next) {
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
      return res.render('./common/index', { 
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
      temp.price = productList[i].price.toLocaleString('ko-KR');
      let seller = await db.Users.findOne({
        where:{
          id: productList[i].seller,
        }
      });
      temp.seller = seller.dataValues.name;
      temp.phone = productList[i].phone;
      temp.location = productList[i].location;
      temp.status = "일반 판매 중";
      if(productList[i] == 1){
        temp.status = "경매 판매 중";
      }else if(productList[i] == 2){
        temp.status = "판매 완료";
      }
      content.push(temp);
    }

    return res.render('./common/index', { 
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
    return res.render('./common/error', {message: "내부 시스템 오류!! 다시 요청해주세요", "error": {status: "500"}});
  }
});

/* 회원가입 페이지로 이동 */
router.get('/register', async function(req, res, next) {
  return res.render('./common/signup', {});
});

/* 회원가입 시도 */
router.post('/register', async function(req, res, next) {
  let body = req.body;
  console.log(body);
  if( !body.userId || !body.password || !body.name || !body.authority){
    return res.render('./common/error', {message: "회원가입을 위한 필수 값이 제출되지 않았습니다.", "error": {status: "400"}});
  }

  let exUser = await db.Users.findOne({
      where:{
          userId: body.userId
      }
  });
  if (exUser){
      return res.json({"success": false, "reason": "중복된 아이디가 사용 중입니다."});
  }

  const hashedPassword = crypto.createHash("sha512").update(body.userId + body.password).digest("base64");

  authority = 1;
  if(body.authority == "2"){
    authority = 2;
  }else if(body.authority == "3"){
    authority = 3;
  }

  const userInfo = {
      userId: body.userId,
      password: hashedPassword,
      name: body.name,
      authority: authority,
  };
  
  await db.Users.create(userInfo).then( result => {
    return res.json({"success":true, "reason": "회원가입되었습니다."});
  }).catch(err => {
    return res.render('./common/error', {message: "시스템 오류가 발생했습니다!! 다시 요청해주세요", "error": {status: "500"}});
  });
});

/* 로그인 페이지 이동 */
router.get('/login', function(req, res, next) {
  return res.render('./common/login', {});
});

/* 로그인 시도 */
router.post('/login', async function(req, res, next) {
  let body = req.body;
  //1. Input이 충분하지 않았을 경우
  if(!body.id || !body.password){
      return res.json({"success": false, "reason": "아이디 비밀번호가 제대로 입력되지 않았습니다."});
  }

  let user = await db.Users.findOne({
    where:{
        userId: body.id
    }
  });
  if (!user){
    return res.json({"success": false, "token": "", "reason": "아이디가 없습니다."});
  }
  else{
    const hashedPassword = crypto.createHash("sha512").update(body.id + body.password).digest("base64");
    
    if(user.dataValues.password !== hashedPassword){
      return res.json({"success": false, "token": "", "reason": "비밀번호가 틀렸습니다."});
    }
    else{
      const token = jwt.sign({
          userId: user.dataValues.userId,
          id: user.dataValues.id,
          name: user.dataValues.name,
          authority: user.dataValues.authority
        },
        process.env.JWT_SECRET, 
        {
          subject: "hyunjun",
          expiresIn: "60m",
          issuer: "hyunjun"
      });

      res.cookie("jwt", token, {maxAge: 3600});
      res.setHeader('Set-Cookie', "jwt=" + token);

      return res.status(201).json({"success": true, "token": token, "reason": "로그인 성공!!", "authority": user.dataValues.authority});
    }
  }
});

/* 아이디만 중복 확인 */
router.post('/validId', async function(req, res, next) {
  let body = req.body;
  if(!body.id){
    return res.render('./common/error', {message: "시스템 오류가 발생했습니다! 다시 요청해주세요", "error": {status: "500"}});
  }

  let exUser = await db.Users.findOne({
      where:{
          userId: body.id
      }
  });
  if (exUser){
    return res.json({"success": false, "reason": "중복된 아이디가 사용 중입니다."});
  }
  else{
    return res.json({"success": true, "reason": "사용가능한 아이디입니다."});
  }
});

/* 로그아웃 */
router.get('/logout', function(req, res, next) {
  res.setHeader('Set-Cookie','jwt=;Max-age=0');
  return res.redirect('/');
});

/* 검색 기능 구현 */
router.get('/search', async function(req, res, next) {
  const pageNumber = req.query.pageNumber ? parseInt(req.query.pageNumber) : 1;
  const pageSize = req.query.pageSize? parseInt(req.query.pageSize) : 12;
  let content = [];

  try{
    let filter = [];
    if(req.query.searchText != ''){
      console.log(req.query.searchText);
      filter.push({name: {[Op.substring]: req.query.searchText}});
    }
    if(req.query.seller != ''){
      let expectedSellers = await db.Users.findAll({
        raw: true,
        where: {
          name:  {[Op.substring]: req.query.seller}
        }
      });

      let sellers = [];
      for(let i = 0 ; i < expectedSellers.length; i++){
        sellers.push(expectedSellers[i].id);
      }

      if(sellers.length < 1){
        filter.push({seller: {[Op.eq]: 0}});
      }
      else{
        filter.push({seller: {[Op.or]: sellers}});
      }
    }
    if(req.query.minPrice != ''){
      let minPrice = parseInt(req.query.minPrice);
      filter.push({price: {[Op.gte]: minPrice}});
    }
    if(req.query.maxPrice != ''){
      let maxPrice = parseInt(req.query.maxPrice);
      filter.push({price: {[Op.lte]: maxPrice}});
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
      return res.send({ 
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
      return res.render('./common/error', {message: "존재하지 않는 페이지 입니다.", "error": {status: "400"}});
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
      temp.price = productList[i].price.toLocaleString('ko-KR');
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

    return res.send({ 
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
    console.log(err);
    return res.render('./common/error', {message: "내부 시스템 오류!! 다시 요청해주세요", "error": {status: "500"}});
  }
});

/* 상품 세부 정보 페이지로 이동 */
router.get('/item/:id', async function(req, res, next) {
  try{
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
      return res.render('./common/error', {message: "존재하지 않는 페이지 입니다.", "error": {status: "404"}});
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
      temp.images.push(product.dataValues.image1);
    }
    if(product.dataValues.image2){
      temp.images.push(product.dataValues.image2);
    }
    if(product.dataValues.image3){
      temp.images.push(product.dataValues.image3);
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

    return res.render('./common/productDetails', temp);
  }catch(err){
    return res.render('./common/error', {message: "내부 시스템 오류!! 다시 요청해주세요", "error": {status: "500"}});
  }
});

module.exports = router;
