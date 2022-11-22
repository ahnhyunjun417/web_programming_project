const multer = require("multer");
const path = require("path");
const fs = require('fs');

try{
    fs.readdirSync( path.join(__dirname, "../public/images"));
}catch(err){
    console.error("img 폴더가 없어서 폴더를 생성합니다");
    fs.mkdirSync(path.join(__dirname, "../public/images"));
}


const fileFilter = (req, file, cb) => {
    if(file.mimetype === "image/png" || file.mimetype === "image/jpg" || file.mimetype === "image/jpeg"){
        cb(null, true);
    }
    else{
        req.fileValidationError = "이미지 파일 확장자 확인 부탁드립니다(허용 확장자: jpg, jpeg, png, gif)";
        cb(null, false);
    }
};

const uploadImage = multer({
    storage: multer.diskStorage({
        destination: (req, file, done) => {
            done(null, path.join(__dirname, "../public/images"));
        },
        filename: (req, file, done) => {
            const ext = path.extname(file.originalname);
            const fileName = path.basename(file.originalname, ext) + Date.now() + ext;
            done(null, fileName);
        },
    }),
    fileFilter: fileFilter,
    limits: {fileSize: 3*1024*1024},
});

module.exports = {uploadImage};