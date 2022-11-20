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
      return res.render('./common/error', {message: "구매자 계정 로그인이 유효하지 않습니다.", "error": {status: "401"}});
    }
    if(identity.authority != 1){
      return res.render('./common/error', {message: "구매자 계정 로그인이 유효하지 않습니다.", "error": {status: "401"}});
    }

  }catch(err){
    return res.render('./common/error', {message: "내부 시스템 오류!! 다시 요청해주세요", "error": {status: "500"}});
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
      return res.render('./buyer/index', { 
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

    return res.render('./buyer/index', { 
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

/* 검색 및 페이지네이션 */
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
      return res.render('./common/error', {message: "구매자 계정 로그인이 유효하지 않습니다.", "error": {status: "401"}});
    }
    if(identity.authority != 1){
      return res.render('./common/error', {message: "구매자 계정 로그인이 유효하지 않습니다.", "error": {status: "401"}});
    }

  }catch(err){
    return res.render('./common/error', {message: "내부 시스템 오류!! 다시 요청해주세요", "error": {status: "500"}});
  }

  if(!req.query.pageSize || !req.query.pageNumber){
    return res.render('common/error', {message: "내부 시스템 오류!! 다시 요청해주세요", "error": {status: "500"}});
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
      return res.render('common/error', {message: "존재하지 않는 페이지 입니다.", "error": {status: "400"}});
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
    return res.render('common/error', {message: "내부 시스템 오류!! 다시 요청해주세요", "error": {status: "500"}});
  }
});

/* 쇼핑 리스트 페이지 받기 */
router.get('/shopping/:page', async function(req, res, next) {
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
      return res.render('./common/error', {message: "구매자 계정 로그인이 유효하지 않습니다.", "error": {status: "401"}});
    }
    if(identity.authority != 1){
      return res.render('./common/error', {message: "구매자 계정 로그인이 유효하지 않습니다.", "error": {status: "401"}});
    }

  }catch(err){
    return res.render('./common/error', {message: "내부 시스템 오류!! 다시 요청해주세요", "error": {status: "500"}});
  }

  const pageNumber = req.params.page;
  const pageSize = 12;
  let content = [];

  try{
    let totalCount = await db.Products.count({
      where:{
        [Op.or]: [
          {user: identity.id,},
          {buyer: identity.id,},
        ]
      },
      include:[{
        model: db.Biddings,
        where:{user: identity.id},
        required: false
      }],
    });
    totalCount = parseInt(totalCount);

    let totalPages = parseInt(totalCount / pageSize);
    if(totalCount % pageSize > 0){
      totalPages = totalPages + 1;
    }

    let payment = 0;
    let productList = await db.Products.findAll({
      order:[['updatedAt', 'DESC']],
      where:{
        [Op.or]: [
          {user: identity.id,},
          {buyer: identity.id,},
        ]
      },
      include:[{
        model: db.Biddings,
        where:{user: identity.id},
        required: false
      }],
    });
    for(let i = 0; i < productList.length ; i++){
      if(productList[i].dataValues.status == 2){
        payment = payment + productList[i].dataValues.price;
      }
    }

    if(totalCount == 0){
      return res.render('./buyer/index', { 
        totalItems: totalCount,
        pageNumber: pageNumber,
        pageSize: pageSize,
        totalPages: totalPages,
        prevPage: pageNumber - 1,
        nextPage: pageNumber + 1,
        content: content,
        payment: payment,
      });
    }

    let offset = (pageNumber - 1) * pageSize;
    productList = await db.Products.findAll({
      subQuery: false,
      offset: offset,
      limit: pageSize,
      order:[['updatedAt', 'DESC']],
      where:{
        [Op.or]: [
          {user: identity.id,},
          {buyer: identity.id,},
        ]
      },
      include:[{
        model: db.Biddings,
        where:{user: identity.id},
        required: false
      }],
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

    return res.render('./buyer/index', { 
      totalItems: totalCount,
      pageNumber: pageNumber,
      pageSize: pageSize,
      totalPages: totalPages,
      prevPage: pageNumber - 1,
      nextPage: pageNumber + 1,
      content: content,
      payment: payment,
    });
  }catch(err){
    return res.render('./common/error', {message: "내부 시스템 오류!! 다시 요청해주세요", "error": {status: "500"}});
  }
});

/* 위시 리스트 페이지 받기 */
router.get('/wish/:page', async function(req, res, next) {
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
      return res.render('./common/error', {message: "구매자 계정 로그인이 유효하지 않습니다.", "error": {status: "401"}});
    }
    if(identity.authority != 1){
      return res.render('./common/error', {message: "구매자 계정 로그인이 유효하지 않습니다.", "error": {status: "401"}});
    }

  }catch(err){
    return res.render('./common/error', {message: "내부 시스템 오류!! 다시 요청해주세요", "error": {status: "500"}});
  }

  const pageNumber = req.params.page;
  const pageSize = 12;
  let content = [];

  try{
    let totalCount = await db.Products.count({
      subQuery: false,
      where:{
        user: identity.id
      },
      include:[{
        model: db.Wishes,
        where:{user: identity.id}
      }],
    });
    totalCount = parseInt(totalCount);

    let totalPages = parseInt(totalCount / pageSize);
    if(totalCount % pageSize > 0){
      totalPages = totalPages + 1;
    }

    if(totalCount == 0){
      return res.render('./buyer/index', { 
        totalItems: totalCount,
        pageNumber: pageNumber,
        pageSize: pageSize,
        totalPages: totalPages,
        prevPage: pageNumber - 1,
        nextPage: pageNumber + 1,
        content: content,
      });
    }

    let offset = (pageNumber - 1) * pageSize;
    let productList = await db.Products.findAll({
      subQuery: false,
      offset: offset,
      limit: pageSize,
      order:[['updatedAt', 'DESC']],
      where:{
        user: identity.id
      },
      include:[{
        model: db.Wishes,
        where:{user: identity.id}
      }],
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

    return res.render('./buyer/index', { 
      totalItems: totalCount,
      pageNumber: pageNumber,
      pageSize: pageSize,
      totalPages: totalPages,
      prevPage: pageNumber - 1,
      nextPage: pageNumber + 1,
      content: content
    });
  }catch(err){
    return res.render('./common/error', {message: "내부 시스템 오류!! 다시 요청해주세요", "error": {status: "500"}});
  }
});

/* 위시리스트에 추가하기 */
router.post('/wish/:id', async function(req, res, next) {
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
      return res.render('./common/error', {message: "구매자 계정 로그인이 유효하지 않습니다.", "error": {status: "401"}});
    }
    if(identity.authority != 1){
      return res.render('./common/error', {message: "구매자 계정 로그인이 유효하지 않습니다.", "error": {status: "401"}});
    }

    const product = await db.Products.findOne({
      where:{
        id: req.params.id
      }
    });

    if(!product){
      return res.render('common/error', {message: "존재하지 않는 페이지 입니다.", "error": {status: "404"}});
    }

    const isStar = await db.Wishes.findOne({
      where:{
        user: identity.id,
        product: req.params.id
      }
    });
    if(isStar){
      return res.json({"success": false, "reason": "위시리스트에 이미 추가된 상품입니다."});
    }

    await db.Wishes.create({
      product: req.params.id, user: identity.id
    }).then( result => {
      return res.json({"success":true, "reason": "위시리스트에 추가했습니다."});
    }).catch(err => {
      return res.render('common/error', {message: "내부 시스템 오류!! 다시 요청해주세요", "error": {status: "500"}});
    });
    
  }catch(err){
    return res.render('common/error', {message: "내부 시스템 오류!! 다시 요청해주세요", "error": {status: "500"}});
  }
});

/* 위시리스트에서 제거하기 */
router.delete('/wish/:id', async function(req, res, next) {
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
      return res.render('./common/error', {message: "구매자 계정 로그인이 유효하지 않습니다.", "error": {status: "401"}});
    }
    if(identity.authority != 1){
      return res.render('./common/error', {message: "구매자 계정 로그인이 유효하지 않습니다.", "error": {status: "401"}});
    }

    const product = await db.Products.findOne({
      where:{
        id: req.params.id
      }
    });

    if(!product){
      return res.render('common/error', {message: "존재하지 않는 페이지 입니다.", "error": {status: "404"}});
    }

    const isStar = await db.Wishes.findOne({
      where:{
        user: identity.id,
        product: req.params.id
      }
    });
    if(!isStar){
      return res.json({"success": false, "reason": "위시리스트에 이미 존재하지 않습니다."});
    }

    await db.Wishes.destroy({
      where: {product: req.params.id, user: identity.id}
    }).then( result => {
      return res.json({"success":true, "reason": "위시리스트에서 삭제했습니다."});
    }).catch(err => {
      return res.render('common/error', {message: "내부 시스템 오류!! 다시 요청해주세요", "error": {status: "500"}});
    });
    
  }catch(err){
    return res.render('common/error', {message: "내부 시스템 오류!! 다시 요청해주세요", "error": {status: "500"}});
  }
});

/* 아이템 세부 정보 페이지로 이동 */
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
      return res.render('./common/error', {message: "구매자 계정 로그인이 유효하지 않습니다.", "error": {status: "401"}});
    }
    if(identity.authority != 1){
      return res.render('./common/error', {message: "구매자 계정 로그인이 유효하지 않습니다.", "error": {status: "401"}});
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
      return res.render('common/error', {message: "존재하지 않는 페이지 입니다.", "error": {status: "404"}});
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

    temp.isStar = false;
    let isStar = await db.Wishes.findOne({
      where:{
        user: identity.id,
        product: product.dataValues.id
      }
    });
    if(isStar){
      temp.isStar = true;
    }

    return res.render('buyer/productDetails', temp);
  }catch(err){
    return res.render('common/error', {message: "내부 시스템 오류!! 다시 요청해주세요", "error": {status: "500"}});
  }
});

/* 상품 구매 */
router.post('/item/:id', async function(req, res, next) {
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
      return res.render('./common/error', {message: "구매자 계정 로그인이 유효하지 않습니다.", "error": {status: "401"}});
    }
    if(identity.authority != 1){
      return res.render('./common/error', {message: "구매자 계정 로그인이 유효하지 않습니다.", "error": {status: "401"}});
    }

    const product = await db.Products.findOne({
      where:{
        id: req.params.id
      }
    });

    if(!product){
      return res.render('common/error', {message: "존재하지 않는 페이지 입니다.", "error": {status: "404"}});
    }

    if(product.dataValues.status == 2){
      return res.json({"success": false, "reason": "이미 구매된 상품입니다."});
    }
    else if(product.dataValues.status == 1){
      if(!req.body){
        return res.json({"success": false, "reason": "경매 입찰 금액이 입력되지 않았습니다."});
      }
      else if(req.body.price > product.dataValues.price){
        let bidding = {
          price: req.body.price,
          user: identity.id,
          product: product.dataValues.id
        };

        await db.Products.update({price: req.body.price, buyer: identity.id},{where:{id: product.dataValues.id}});
        await db.Biddings.create(bidding).then( result => {
          return res.json({"success":true, "reason": "경매 입찰이 성공적으로 이루어졌습니다."});
        }).catch(err => {
          return res.render('common/error', {message: "내부 시스템 오류!! 다시 요청해주세요", "error": {status: "500"}});
        });
      }
      else{
        return res.json({"success": false, "reason": "경매 입찰 금액이 기존 최고가보다 낮습니다."});
      }
    }
    else if(product.dataValues.status == 0){
      await db.Products.update({buyer: identity.id},{where:{id: product.dataValues.id}});
      await db.Products.update({status: 2},{where:{id: product.dataValues.id}});

      return res.json({"success": true, "reason": "상품을 구매하였습니다."});
    }
  }catch(err){
    return res.render('common/error', {message: "내부 시스템 오류!! 다시 요청해주세요", "error": {status: "500"}});
  }
});

module.exports = router;
