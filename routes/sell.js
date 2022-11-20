var express = require('express');
var router = express.Router();

const db = require('../models');
const {uploadImage} = require('../utils/multer');
const {Op} = require('sequelize');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { sequelize, Sequelize } = require('../models');
require('dotenv').config();

/* 메인페이지 */
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
      return res.render('./common/error', {message: "판매자 계정 로그인이 유효하지 않습니다.", "error": {status: "401"}});
    }
    if(identity.authority != 2){
      return res.render('./common/error', {message: "판매자 계정 로그인이 유효하지 않습니다.", "error": {status: "401"}});
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
      return res.render('./seller/index', { 
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

    return res.render('./seller/index', { 
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

/* 검색 기능 구현 */
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
      return res.render('./common/error', {message: "판매자 계정 로그인이 유효하지 않습니다.", "error": {status: "401"}});
    }
    if(identity.authority != 2){
      return res.render('./common/error', {message: "판매자 계정 로그인이 유효하지 않습니다.", "error": {status: "401"}});
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
    return res.render('common/error', {message: "내부 시스템 오류!! 다시 요청해주세요", "error": {status: "500"}});
  }
});

/* 상품 세부 정보 페이지로 이동 */
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
      return res.render('./common/error', {message: "판매자 계정 로그인이 유효하지 않습니다.", "error": {status: "401"}});
    }
    if(identity.authority != 2){
      return res.render('./common/error', {message: "판매자 계정 로그인이 유효하지 않습니다.", "error": {status: "401"}});
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

    temp.isMine = false;
    if(product.dataValues.seller == identity.id){
      temp.isMine = true;
    }

    return res.render('seller/productDetails', temp);
  }catch(err){
    return res.render('common/error', {message: "내부 시스템 오류!! 다시 요청해주세요", "error": {status: "500"}});
  }
});

/* 상품 세부 정보 수정 기능 */
router.post('/item/:id', uploadImage.array('image'), async function(req, res, next) {
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
      return res.render('./common/error', {message: "판매자 계정 로그인이 유효하지 않습니다.", "error": {status: "401"}});
    }
    if(identity.authority != 2){
      return res.render('./common/error', {message: "판매자 계정 로그인이 유효하지 않습니다.", "error": {status: "401"}});
    }
  
    const product = await db.Products.findOne({
      where:{
        id: req.params.id,
        seller: identity.id
      }
    });

    if(!product){
      return res.render('./common/error', {message: "상품 정보 수정 권한이 없습니다.", "error": {status: "403"}});
    }

    if(req.files){
      await db.Products.update({image1: null},{where:{id: product.dataValues.id}});
      await db.Products.update({image2: null},{where:{id: product.dataValues.id}});
      await db.Products.update({image3: null},{where:{id: product.dataValues.id}});

      for(let i = 0 ; i < req.files.length ; i++){
        if(i == 0){
          await db.Products.update({image1: req.files[i].filename},{where:{id: product.dataValues.id}});
        }
        else if(i == 1){
          await db.Products.update({image2: req.files[i].filename},{where:{id: product.dataValues.id}});
        }
        else if(i == 2){
          await db.Products.update({image3: req.files[i].filename},{where:{id: product.dataValues.id}});
        }
      }
    }
    if(req.body.name){
      await db.Products.update({name: req.body.name},{where:{id: product.dataValues.id}});
    }
    if(req.body.location){
      await db.Products.update({location: req.body.location},{where:{id: product.dataValues.id}});
    }
    if(req.body.phone){
      await db.Products.update({phone: req.body.phone},{where:{id: product.dataValues.id}});
    }
    if(req.body.price){
      await db.Products.update({name: req.body.price},{where:{id: product.dataValues.id}});
    }
    if(req.body.isAuction){
      if(req.body.isAuction == "true"){
        await db.Products.update({isAuction: true},{where:{id: product.dataValues.id}});
      }
      else{
        await db.Products.update({isAuction: false},{where:{id: product.dataValues.id}});
      }
    }

    return res.json({"success": true, "reason": "정보를 수정했습니다."});
  }catch(err){
    return res.render('./common/error', {message: "시스템 오류 발생!! 다시 요청해주세요", "error": {status: "500"}});
  }

});

/* 경매 종료 시키기 */
router.patch('/item/:id', async function(req, res, next) {
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
      return res.render('./common/error', {message: "판매자 계정 로그인이 유효하지 않습니다.", "error": {status: "401"}});
    }
    if(identity.authority != 2){
      return res.render('./common/error', {message: "판매자 계정 로그인이 유효하지 않습니다.", "error": {status: "401"}});
    }

    const product = await db.Products.findOne({
      where:{
        id: req.params.id,
        seller: identity.id
      }
    });

    if(!product){
      return res.render('common/error', {message: "판매자 권한이 없습니다.", "error": {status: "404"}});
    }

    try{
      const topBidder = await db.Biddings.findAll({
        limit: 1,
        order: [['price', 'DESC']],
        where:{
          product: product.dataValues.id
        }
      });

      if(topBidder){
        await db.Products.update({buyer: topBidder.dataValues.user},{where:{id: product.dataValues.id}});
      }
      await db.Products.update({status: 2},{where:{id: product.dataValues.id}});

    }catch(err){
      return res.render('common/error', {message: "내부 시스템 오류!! 다시 요청해주세요", "error": {status: "500"}});
    }

    return res.json({"success": true, "reason": "상품 경매를 성공적으로 종료했습니다!!"});
  }catch(err){
    return res.render('common/error', {message: "내부 시스템 오류!! 다시 요청해주세요", "error": {status: "500"}});
  }
});

/* 상품 제거 */
router.delete('/item/:id', async function(req, res, next) {
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
      return res.render('./common/error', {message: "판매자 계정 로그인이 유효하지 않습니다.", "error": {status: "401"}});
    }
    if(identity.authority != 2){
      return res.render('./common/error', {message: "판매자 계정 로그인이 유효하지 않습니다.", "error": {status: "401"}});
    }

    const product = await db.Products.findOne({
      where:{
        id: req.params.id,
        seller: identity.id
      }
    });

    if(!product){
      return res.render('common/error', {message: "판매자 권한이 없습니다.", "error": {status: "404"}});
    }

    try{
      await db.Biddings.destroy({where: {product: req.params.id}});
      await db.Wishes.destroy({where: {product: req.params.id}});
      await db.Products.destroy({where:{id: req.params.id}});
    }catch(err){
      return res.render('common/error', {message: "내부 시스템 오류!! 다시 요청해주세요", "error": {status: "500"}});
    }

    return res.json({"success": true, "reason": "상품을 삭제하였습니다."});
  }catch(err){
    return res.render('common/error', {message: "내부 시스템 오류!! 다시 요청해주세요", "error": {status: "500"}});
  }
});

/* 상품 세부 정보 수정 페이지로 이동 */
router.get('/item/:id/edit', async function(req, res, next) {
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
      return res.render('./common/error', {message: "판매자 계정 로그인이 유효하지 않습니다.", "error": {status: "401"}});
    }
    if(identity.authority != 2){
      return res.render('./common/error', {message: "판매자 계정 로그인이 유효하지 않습니다.", "error": {status: "401"}});
    }

    const product = await db.Products.findOne({
      where:{
        id: req.params.id,
        seller: identity.id
      }
    });

    if(!product){
      return res.render('common/error', {message: "판매자 자격이 없습니다.", "error": {status: "404"}});
    }

    let temp = new Object();
    temp.id = product.dataValues.id;
    temp.name = product.dataValues.name;
    temp.location = product.dataValues.location;
    temp.phone = product.dataValues.phone;
    temp.price = product.dataValues.price;

    temp.isAuction = "일반 판매";
    if(product.dataValues.isAuction){
      temp.isAuction = "경매 판매"
    }

    return res.render('/seller/productInfoEdit', {temp});
  }catch(err){
    return res.render('common/error', {message: "내부 시스템 오류!! 다시 요청해주세요", "error": {status: "500"}});
  }
});

/* 상품 판매 등록 페이지로 이동 */
router.get('/register', async function(req, res, next) {
  return res.render('/seller/productRegister', {});
});

/* 상품 판매 등록 */
router.post('/register', uploadImage.array('image'), async function(req, res, next) {
  try{
    const token = req.cookies.jwt;
    const key = process.env.JWT_SECRET;
    const body = req.body;

    if (!body.name || !body.location || !body.phone || !body.price || !body.isAuction || !req.files)
        return res.json({"success": false, "reason": "입력 값이 부족합니다."});

    const identity = jwt.verify(token, key);
    const user = await db.Users.findOne({
        where:{
          id: identity.id,
          authority: identity.authority
        }
    });
    
    if(!user){
        return res.json({"success": false, "reason": "판매자 게정이 없습니다."});
    }
    else{
        const product = {
            name: body.name,
            location: body.location,
            phone: body.phone,
            price: body.price,
            seller: identity.id,
            buyer: null,
            isAuction: req.body.isAuction == "true" ? true : false,
            status: req.body.isAuction == "true" ? 1 : 0,
            image1: req.files.length > 0 ? req.files[0].filename : null,
            image2: req.files.length > 1 ? req.files[1].filename : null,
            image3: req.files.length > 2 ? req.files[2].filename : null
        };
        
        await db.Project.create(product).then( result => {
            return res.json({"success":true, "reason": "상품을 성공적으로 등록했습니다.", "projectId": result.dataValues.id});
        }).catch(err => {
          return res.render('common/error', {message: "내부 시스템 오류!! 다시 요청해주세요", "error": {status: "500"}});
        });
        
    }
} catch (err) {
    return res.render('common/error', {message: "내부 시스템 오류!! 다시 요청해주세요", "error": {status: "500"}});
}
});

/* 마이페이지 이동 */
router.get('/me', async function(req, res, next) {
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
      return res.render('./common/error', {message: "판매자 계정 로그인이 유효하지 않습니다.", "error": {status: "401"}});
    }
    if(identity.authority != 2){
      return res.render('./common/error', {message: "판매자 계정 로그인이 유효하지 않습니다.", "error": {status: "401"}});
    }

    const pageNumber = 1;
    const pageSize = 12;
    let content = [];
    
    try{
      let totalCount = await db.Products.count({
        where:{seller: identity.id}
      });
      totalCount = parseInt(totalCount);

      let totalPages = parseInt(totalCount / pageSize);
      if(totalCount % pageSize > 0){
        totalPages = totalPages + 1;
      }

      if(totalCount == 0){
        return res.render('./seller/index', { 
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
        subQuery: false,
        offset: offset,
        limit: pageSize,
        order:[['createdAt', 'DESC']],
        where:{seller: identity.id},
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
        temp.stars = productList[i].stars;
        temp.phone = productList[i].phone;
        temp.location = productList[i].location;
        temp.status = "일반 판매 중";
        if(productList[i].status == 1){
          temp.status = "경매 판매 중";
        }else if(productList[i].status == 2){
          temp.status = "판매 완료";
        }
        temp.isAuction = "일반 판매";
        if(productList[i].isAuction){
          temp.isAuction = "경매 판매"
        }

        content.push(temp);
      }

      return res.render('./seller/index', { 
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
  }catch(err){
    return res.render('./common/error', {message: "내부 시스템 오류!! 다시 요청해주세요", "error": {status: "500"}});
  }
});

/* 마이페이지 검색 기능 */
router.get('/me/search', async function(req, res, next) {
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
      return res.render('./common/error', {message: "판매자 계정 로그인이 유효하지 않습니다.", "error": {status: "401"}});
    }
    if(identity.authority != 2){
      return res.render('./common/error', {message: "판매자 계정 로그인이 유효하지 않습니다.", "error": {status: "401"}});
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
          seller: identity.id
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
          seller: identity.id
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
        temp.stars = productList[i].stars;
        temp.phone = productList[i].phone;
        temp.location = productList[i].location;
        temp.status = "일반 판매 중";
        if(productList[i].status == 1){
          temp.status = "경매 판매 중";
        }else if(productList[i].status == 2){
          temp.status = "판매 완료";
        }
        temp.isAuction = "일반 판매";
        if(productList[i].isAuction){
          temp.isAuction = "경매 판매"
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
      return res.render('common/error', {message: "내부 시스템 오류!! 다시 요청해주세요", "error": {status: "500"}});
    }
  }catch(err){
    return res.render('common/error', {message: "내부 시스템 오류!! 다시 요청해주세요", "error": {status: "500"}});
  }
});

/* 경매 기록 리스트 불러오기 */
router.get('/item/:id/bidders', async function(req, res, next) {
  try{
    const token = req.cookies.jwt;
    const key = process.env.JWT_SECRET;
    let content = [];
    
    const identity = jwt.verify(token, key);
    const user = await db.Users.findOne({
        where:{
            id: identity.id,
            userId: identity.userId,
            authority: identity.authority
        }
    });

    if(user){
      return res.render('./common/error', {message: "판매자 계정 로그인이 유효하지 않습니다.", "error": {status: "401"}});
    }
    if(identity.authority != 2){
      return res.render('./common/error', {message: "판매자 계정 로그인이 유효하지 않습니다.", "error": {status: "401"}});
    }

    const product = await db.Products.findOne({
      where:{
        id: req.params.id,
        seller: identity.id
      }
    });

    if(!product){
      return res.render('common/error', {message: "판매자 자격이 없습니다.", "error": {status: "404"}});
    }

    let bidders = await db.Biddings.findAll({
      limit: 10,
      order: [['price', 'DESC']],
      where:{
        product: product.dataValues.id
      }
    });
    for(let i = 0; i < bidders.length ; i++){
      bidders[i] = bidders[i].dataValues;
    }

    for(let i = 0; i < bidders.length ; i++){
      let temp = new Object();
      temp.rank = i + 1;
      temp.price = bidders[i].price.toLocaleString('ko-KR');
      temp.time = bidders[i].createdAt;
      let buyer = await db.Users.findOne({
        where:{
          id: bidders[i].user
        }
      });
      temp.userId = buyer.dataValues.userId;
      temp.name = buyer.dataValues.name;
      
      content.push(temp);
    }

    return res.send({content: content});
  }catch(err){
    return res.render('common/error', {message: "내부 시스템 오류!! 다시 요청해주세요", "error": {status: "500"}});
  }
});

module.exports = router;
