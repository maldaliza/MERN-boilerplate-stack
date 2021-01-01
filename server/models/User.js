const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 10;      // 10자리인 salt를 만든다.
const jwt = require('jsonwebtoken');

const userSchema = mongoose.Schema({
    name: {
        type: String,
        maxlength: 50
    }, 
    email: {
        type: String,
        trim: true,     // 띄어쓰기 삭제 용도
        unique: 1
    }, 
    password: {
        type: String,
        minlength: 5
    }, 
    lastname: {
        type: String,
        maxlength: 50
    }, 
    role: {
        type: Number,
        default: 0
    }, 
    image: String, 
    token: {            // 유효성 관리 용도
        type: String
    }, 
    tokenExp: {         // 토큰의 유효기간
        type: Number
    }
});


// 회원가입할 때, user 모델에 user 정보를 저장하기 전에 호출되는 메소드
userSchema.pre('save', function(next) {
    var user = this;
    /*
        salt를 이용해서 비밀번호를 암호화 해야한다.
        -> salt를 먼저 생성
        -> saltRounds(salt가 몇 글자인지)
    */

    // 패스워드를 바꿀 때만 bcrypt를 이용해서 암호화한다.
    if(user.isModified('password')) {
        bcrypt.genSalt(saltRounds, function(err, salt) {
            if(err) return next(err);
            bcrypt.hash(user.password, salt, function(err, hash) {      // hash가 암호화된 비밀번호다.
                if(err) return next(err);
                user.password = hash;
                next();
            });
        });
    } else {
        next();
    }
});

// 입력받는 비밀번호와 저장된 비밀번호를 비교하는 사용지 정의 메소드
userSchema.methods.comparePassword = function(plainPassword, cb) {
    bcrypt.compare(plainPassword, this.password, function(err, isMatch) {
        if(err) return cb(err);
        cb(null, isMatch);
    });
}

// Token을 만들어 합쳐주는 메소드
userSchema.methods.generateToken = function(cb) {
    var user = this;

    // jsonwebtoken을 이용해서 token을 생성하기
    var token = jwt.sign(user._id.toHexString(), 'secretToken');

    /*
        user._id + 'secretToken' = token
        'secretToken' -> user._id
    */

    user.token = token;
    user.save(function(err, user) {
        if(err) return cb(err);
        cb(null, user);         // user 안에 토큰이 존재
    });
}

// 토큰의 복호화를 통해서 유저를 찾는 사용자 정의 메소드
userSchema.statics.findByToken = function(token, cb) {
    var user = this;
    
    // 토큰을 복호화(decode)한다.
    jwt.verify(token, 'secretToken', function(err, decoded) {       // decoded 값은 user._id이다.
        /*
            유저 아이디를 이용해서 유저를 찾은 다음에
            클라이언트에서 가져온 token과 DB에 보관된 토큰이 일치하는지 확인
        */
        user.findOne({ "_id": decoded, "token": token }, function(err, user) {
            if(err) return cb(err);
            cb(null, user);
        });
    });
}

// 스키마를 모델로 감싸준다.
const User = mongoose.model('User', userSchema);

module.exports = { User };