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
  let userName;
  try{
    const token = req.headers.cookie.match('(^|;) ?' + "jwt" + '=([^;]*)(;|$)')[2];
    const key = process.env.JWT_SECRET;

    const identity = jwt.verify(token, key);
    const user = await db.Users.findOne({
        where:{
            id: identity.id,
            userId: identity.userId,
            authority: identity.authority
        }
    });

    if(!user){
      return res.render('./common/error', {message: "관리자 계정 로그인이 유효하지 않습니다.", "error": {status: "401"}});
    }
    if(identity.authority != 3){
      return res.render('./common/error', {message: "관리자 계정 로그인이 유효하지 않습니다.", "error": {status: "401"}});
    }

    userName = identity.name;

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
      return res.render('./admin/index', { 
        userName: userName,
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
      if(productList[i].status == 1){
        temp.status = "경매 판매 중";
      }else if(productList[i].status == 2){
        temp.status = "판매 완료";
      }
      content.push(temp);
    }

    return res.render('./admin/index', { 
      userName: userName,
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

/* 상품 검색 기능 */
router.get('/search', async function(req, res, next) {
  try{
    const token = req.headers.cookie.match('(^|;) ?' + "jwt" + '=([^;]*)(;|$)')[2];
    const key = process.env.JWT_SECRET;

    const identity = jwt.verify(token, key);
    const user = await db.Users.findOne({
        where:{
            id: identity.id,
            userId: identity.userId,
            authority: identity.authority
        }
    });

    if(!user){
      return res.render('./common/error', {message: "관리자 계정 로그인이 유효하지 않습니다.", "error": {status: "401"}});
    }
    if(identity.authority != 3){
      return res.render('./common/error', {message: "관리자 계정 로그인이 유효하지 않습니다.", "error": {status: "401"}});
    }

  }catch(err){
    return res.render('./common/error', {message: "내부 시스템 오류!! 다시 요청해주세요", "error": {status: "500"}});
  }

  const pageNumber = req.query.pageNumber ? parseInt(req.query.pageNumber) : 1;
  const pageSize = req.query.pageSize? parseInt(req.query.pageSize) : 12;
  let content = [];
  try{
    filter = [];
    if(req.query.searchText != ""){
      filter.push({name: {[Op.substring]: req.query.searchText}});
    }
    if(req.query.seller != ""){
      filter.push({seller: {[Op.substring]: req.query.seller}});
    }
    if(req.query.minPrice != ""){
      let minPrice = parseInt(req.query.minPrice);
      filter.push({price: {[Op.gte]: minPrice}});
    }
    if(req.query.maxPrice != ""){
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
    return res.render('./common/error', {message: "내부 시스템 오류!! 다시 요청해주세요", "error": {status: "500"}});
  }
});

/* 상품 세부 정보 페이지로 이동  */
router.get('/item/:id', async function(req, res, next) {
  try{
    const token = req.headers.cookie.match('(^|;) ?' + "jwt" + '=([^;]*)(;|$)')[2];
    const key = process.env.JWT_SECRET;
    
    const identity = jwt.verify(token, key);
    const user = await db.Users.findOne({
        where:{
            id: identity.id,
            userId: identity.userId,
            authority: identity.authority
        }
    });

    if(!user){
      return res.render('./common/error', {message: "관리자 계정 로그인이 유효하지 않습니다.", "error": {status: "401"}});
    }
    if(identity.authority != 3){
      return res.render('./common/error', {message: "관리자 계정 로그인이 유효하지 않습니다.", "error": {status: "401"}});
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
      return res.render('./common/error', {message: "존재하지 않는 페이지 입니다.", "error": {status: "404"}});
    }

    let temp = new Object();
    temp.userName = identity.name;
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

    return res.render('./admin/productDetails', temp);
  }catch(err){
    return res.render('./common/error', {message: "내부 시스템 오류!! 다시 요청해주세요", "error": {status: "500"}});
  }
});

/* 상품 제거 하기  */
router.delete('/item/:id', async function(req, res, next) {
  try{
    const token = req.headers.cookie.match('(^|;) ?' + "jwt" + '=([^;]*)(;|$)')[2];
    const key = process.env.JWT_SECRET;
    
    const identity = jwt.verify(token, key);
    const user = await db.Users.findOne({
        where:{
            id: identity.id,
            userId: identity.userId,
            authority: identity.authority
        }
    });

    if(!user){
      return res.render('./common/error', {message: "관리자 계정 로그인이 유효하지 않습니다.", "error": {status: "401"}});
    }
    if(identity.authority != 3){
      return res.render('./common/error', {message: "관리자 계정 로그인이 유효하지 않습니다.", "error": {status: "401"}});
    }

    const product = await db.Products.findOne({
      where:{
        id: req.params.id,
      }
    });

    if(!product){
      return res.render('./common/error', {message: "존재하지 않는 상품입니다.", "error": {status: "404"}});
    }

    try{
      await db.Biddings.destroy({where: {product: req.params.id}});
      await db.Wishes.destroy({where: {product: req.params.id}});
      await db.Products.destroy({where:{id: req.params.id}});
    }catch(err){
      return res.render('./common/error', {message: "내부 시스템 오류!! 다시 요청해주세요", "error": {status: "500"}});
    }

    return res.json({"success": true, "reason": "상품을 삭제하였습니다."});
  }catch(err){
    return res.render('./common/error', {message: "내부 시스템 오류!! 다시 요청해주세요", "error": {status: "500"}});
  }
});

/* 사용자 세부 정보 수정 페이지로 이동  */
router.get('/user/:id', async function(req, res, next) {
  try{
    const token = req.headers.cookie.match('(^|;) ?' + "jwt" + '=([^;]*)(;|$)')[2];
    const key = process.env.JWT_SECRET;
    
    const identity = jwt.verify(token, key);
    const user = await db.Users.findOne({
        where:{
            id: identity.id,
            userId: identity.userId,
            authority: identity.authority
        }
    });

    if(!user){
      return res.render('./common/error', {message: "관리자 계정 로그인이 유효하지 않습니다.", "error": {status: "401"}});
    }
    if(identity.authority != 3){
      return res.render('./common/error', {message: "관리자 계정 로그인이 유효하지 않습니다.", "error": {status: "401"}});
    }

    const targetUser = await db.Users.findOne({
      where:{
        id: req.params.id,
      }
    });

    if(!targetUser){
      return res.render('./common/error', {message: "존재하지 않는 사용자 계정 입니다.", "error": {status: "404"}});
    }

    let temp = new Object();
    temp.id = targetUser.dataValues.id;
    temp.name = targetUser.dataValues.name;
    temp.userId = targetUser.dataValues.userId;
    temp.userType = "1";
    if(targetUser.dataValues.authority == 2){
      temp.userType = "2";
    }
    else if(targetUser.dataValues.authority == 3){
      temp.userType = "3";
    }

    temp.userStatus = "1";
    if(!targetUser.dataValues.isActive){
      temp.userStatus = "2";
    }
    
    return res.render('./admin/userInfoEdit', temp);
  }catch(err){
    return res.render('./common/error', {message: "내부 시스템 오류!! 다시 요청해주세요", "error": {status: "500"}});
  }
});

/* 사용자 세부 정보 수정  */
router.post('/user/:id', async function(req, res, next) {
  try{
    const token = req.headers.cookie.match('(^|;) ?' + "jwt" + '=([^;]*)(;|$)')[2];
    const key = process.env.JWT_SECRET;
    
    const identity = jwt.verify(token, key);
    const user = await db.Users.findOne({
        where:{
            id: identity.id,
            userId: identity.userId,
            authority: identity.authority
        }
    });
  
    if(!user){
      return res.render('./common/error', {message: "관리자 계정 로그인이 유효하지 않습니다.", "error": {status: "401"}});
    }
    if(identity.authority != 3){
      return res.render('./common/error', {message: "관리자 계정 로그인이 유효하지 않습니다.", "error": {status: "401"}});
    }
  
    const targetUser = await db.Users.findOne({
      where:{
        id: req.params.id
      }
    });

    if(!targetUser){
      return res.render('./common/error', {message: "존재하지 않는 사용자 계정 입니다.", "error": {status: "403"}});
    }

    if(req.body.name){
      await db.Users.update({name: req.body.name},{where:{id: req.params.id}});
    }
    if(req.body.userId){
      await db.Users.update({userId: req.body.userId},{where:{id: req.params.id}});
    }
    if(req.body.password){
      const hashedPassword = crypto.createHash("sha512").update(req.body.userId + req.body.password).digest("base64");
      await db.Users.update({password: hashedPassword},{where:{id: req.params.id}});
    }
    if(req.body.userType){
      if(req.body.userType == "1"){
        await db.Users.update({authority: 1},{where:{id: req.params.id}});
      }
      else if(req.body.userType == "2"){
        await db.Users.update({authority: 2},{where:{id: req.params.id}});
      }
      else{
        await db.Users.update({authority: 3},{where:{id: req.params.id}});
      }
    }
    if(req.body.userStatus){
      if(req.body.userStatus == "1"){
        await db.Users.update({isActive: true},{where:{id: req.params.id}});
      }
      else{
        await db.Users.update({isActive: false},{where:{id: req.params.id}});
      }
    }

    return res.json({"success": true, "reason": "정보를 수정했습니다."});
  }catch(err){
    return res.render('./common/error', {message: "시스템 오류 발생!! 다시 요청해주세요", "error": {status: "500"}});
  }
});

/* 사용자 계정 삭제  */
router.delete('/user/:id', async function(req, res, next) {
  try{
    const token = req.headers.cookie.match('(^|;) ?' + "jwt" + '=([^;]*)(;|$)')[2];
    const key = process.env.JWT_SECRET;
    
    const identity = jwt.verify(token, key);
    const user = await db.Users.findOne({
        where:{
            id: identity.id,
            userId: identity.userId,
            authority: identity.authority
        }
    });

    if(!user){
      return res.render('./common/error', {message: "관리자 계정 로그인이 유효하지 않습니다.", "error": {status: "401"}});
    }
    if(identity.authority != 3){
      return res.render('./common/error', {message: "관리자 계정 로그인이 유효하지 않습니다.", "error": {status: "401"}});
    }

    const targetUser = await db.Users.findOne({
      where:{
        id: req.params.id,
      }
    });

    if(!targetUser){
      return res.render('./common/error', {message: "존재하지 않는 계정입니다.", "error": {status: "404"}});
    }

    try{

      let productList = await db.Products.findAll({
        raw: true,
        where:{
          seller: req.query.id
        }
      });

      for(let i = 0 ; i < products.length ; i++){
        await db.Biddings.destroy({where: {product: productList[i].id}});
        await db.Wishes.destroy({where: {product: productList[i].id}});
        await db.Products.destroy({where: {id: productList[i].id}});
      }

      await db.Biddings.destroy({where: {user: req.params.id}});
      await db.Wishes.destroy({where: {user: req.params.id}});
      await db.Users.destroy({where:{id: req.params.id}});
    }catch(err){
      return res.render('./common/error', {message: "내부 시스템 오류!! 다시 요청해주세요", "error": {status: "500"}});
    }

    return res.json({"success": true, "reason": "계정을 삭제하였습니다."});
  }catch(err){
    return res.render('./common/error', {message: "내부 시스템 오류!! 다시 요청해주세요", "error": {status: "500"}});
  }
});

/* 사용자 목록 페이지로 이동 */
router.get('/users', async function(req, res, next) {
  let userName;
  try{
    const token = req.headers.cookie.match('(^|;) ?' + "jwt" + '=([^;]*)(;|$)')[2];
    const key = process.env.JWT_SECRET;

    const identity = jwt.verify(token, key);
    const user = await db.Users.findOne({
        where:{
            id: identity.id,
            userId: identity.userId,
            authority: identity.authority
        }
    });

    if(!user){
      return res.render('./common/error', {message: "관리자 계정 로그인이 유효하지 않습니다.", "error": {status: "401"}});
    }
    if(identity.authority != 3){
      return res.render('./common/error', {message: "관리자 계정 로그인이 유효하지 않습니다.", "error": {status: "401"}});
    }

    userName = identity.name;

  }catch(err){
    return res.render('./common/error', {message: "내부 시스템 오류!! 다시 요청해주세요", "error": {status: "500"}});
  }

  const pageNumber = 1;
  const pageSize = 12;
  let content = [];

  try{
    let totalCount = await db.Users.count({});
    totalCount = parseInt(totalCount);

    let totalPages = parseInt(totalCount / pageSize);
    if(totalCount % pageSize > 0){
      totalPages = totalPages + 1;
    }

    if(totalCount == 0){
      return res.render('./admin/admin', { 
        userName: userName,
        totalItems: totalCount,
        pageNumber: pageNumber,
        pageSize: pageSize,
        totalPages: totalPages,
        prevPage: pageNumber - 1,
        nextPage: pageNumber + 1,
        content: content,
        searchText: "",
        adminCheck: "true",
        sellerCheck: "true",
        buyerCheck: "true",
      });
    }

    let offset = (pageNumber - 1) * pageSize;
    let userList = await db.Users.findAll({
      raw: true,
      offset: offset,
      limit: pageSize,
      order:[['id', 'ASC']],
    });

    for(let i = 0; i < userList.length ; i++){
      let temp = new Object();
      temp.id = userList[i].id;
      temp.userId = userList[i].userId;
      temp.name = userList[i].name;
      temp.authority = "구매자";
      if(userList[i].authority == 2){
        temp.authority = "판매자";
      }
      else if(userList[i].authority == 3){
        temp.authority = "관리자";
      }
      content.push(temp);
    }

    return res.render('./admin/admin', { 
      userName: userName,
      totalItems: totalCount,
      pageNumber: pageNumber,
      pageSize: pageSize,
      totalPages: totalPages,
      prevPage: pageNumber - 1,
      nextPage: pageNumber + 1,
      content: content,
      searchText: "",
      adminCheck: "true",
      sellerCheck: "true",
      buyerCheck: "true",
    });
  }catch(err){
    return res.render('./common/error', {message: "내부 시스템 오류!! 다시 요청해주세요", "error": {status: "500"}});
  }
});

/* 사용자 계정 검색 기능 */
router.get('/users/search', async function(req, res, next) {
  try{
    const token = req.headers.cookie.match('(^|;) ?' + "jwt" + '=([^;]*)(;|$)')[2];
    const key = process.env.JWT_SECRET;

    const identity = jwt.verify(token, key);
    const user = await db.Users.findOne({
        where:{
            id: identity.id,
            userId: identity.userId,
            authority: identity.authority
        }
    });

    if(!user){
      return res.render('./common/error', {message: "관리자 계정 로그인이 유효하지 않습니다.", "error": {status: "401"}});
    }
    if(identity.authority != 3){
      return res.render('./common/error', {message: "관리자 계정 로그인이 유효하지 않습니다.", "error": {status: "401"}});
    }

  }catch(err){
    return res.render('./common/error', {message: "내부 시스템 오류!! 다시 요청해주세요", "error": {status: "500"}});
  }

  const pageNumber = req.query.pageNumber ? parseInt(req.query.pageNumber) : 1;
  const pageSize = req.query.pageSize? parseInt(req.query.pageSize) : 12;
  let content = [];
  try{
    let filter = [];
    if(req.query.searchText != ""){
      filter.push({
        [Op.or]: [
          {name: {[Op.substring]: req.query.searchText}},
          {userId: {[Op.substring]: req.query.searchText}},
        ]
      });
    }

    let targetType = [];
    if(req.query.adminCheck == "true"){
      targetType.push(3);
    }
    if(req.query.sellerCheck == "true"){
      targetType.push(2);
    }
    if(req.query.buyerCheck == "true"){
      targetType.push(1);
    }
    filter.push({authority: {[Op.or]: targetType}});

    let totalCount = 0;
    if(targetType.length > 0){
      totalCount = await db.Users.count({
        where:{[Op.and]: filter}
      });
    }

    totalCount = parseInt(totalCount);
    
    totalPages = parseInt(totalCount / pageSize);
    if(totalCount % pageSize > 0){
      totalPages = totalPages + 1;
    }

    if(totalCount == 0){
      return res.json({ 
        totalItems: totalCount,
        pageNumber: pageNumber,
        pageSize: pageSize,
        totalPages: totalPages,
        prevPage: pageNumber - 1,
        nextPage: pageNumber + 1,
        content: content,
        searchText: req.query.searchText,
        adminCheck: req.query.adminCheck,
        sellerCheck: req.query.sellerCheck,
        buyerCheck: req.query.buyerCheck,
      });
    }

    if(totalPages < pageNumber || pageNumber < 1){
      return res.render('./common/error', {message: "존재하지 않는 페이지 입니다.", "error": {status: "400"}});
    }

    let offset = (pageNumber - 1) * pageSize;
    let userList = await db.Users.findAll({
      subQuery: false,
      offset: offset,
      limit: pageSize,
      order: [['id', 'ASC']],
      where:{
        [Op.and]: filter,
      },
    });
    for(let i = 0; i < userList.length ; i++){
      userList[i] = userList[i].dataValues;
    }

    for(let i = 0; i < userList.length ; i++){
      let temp = new Object();
      temp.id = userList[i].id;
      temp.userId = userList[i].userId;
      temp.name = userList[i].name;
      temp.authority = "구매자";
      if(userList[i].authority == 2){
        temp.authority = "판매자";
      }
      else if(userList[i].authority == 3){
        temp.authority = "관리자";
      }
      content.push(temp);
    }

    return res.json({ 
      totalItems: totalCount,
      pageNumber: pageNumber,
      pageSize: pageSize,
      totalPages: totalPages,
      prevPage: pageNumber - 1,
      nextPage: pageNumber + 1,
      content: content,
      searchText: req.query.searchText,
      adminCheck: req.query.adminCheck,
      sellerCheck: req.query.sellerCheck,
      buyerCheck: req.query.buyerCheck,
    });
  }catch(err){
    console.error(err);
    return res.render('./common/error', {message: "내부 시스템 오류!! 다시 요청해주세요", "error": {status: "500"}});
  }
});

module.exports = router;
