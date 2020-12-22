const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const config = require('./config/key');
const { auth } = require('./middleware/auth');
const { User } = require('./models/User');

// application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
    extended: true
}));

// application/json
app.use(bodyParser.json());
app.use(cookieParser());

// MongoDB Connect
const mongoose = require('mongoose');
mongoose.connect(config.mongoURI, {
    useNewUrlParser: true, 
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
}).then(() => console.log('MongoDB Connected ...'))
  .catch(error => console.log(error));


// 기본 라우터
app.get('/', (request, response) => {
    response.send('안녕하세요!');
});

// 회원가입 라우터
app.post('/api/users/register', (request, response) => {
    /*
        회원가입할 때 필요한 정보들을 client에서 가져오면
        그것들을 데이터베이스에 넣어준다.
    */
    const user = new User(request.body);        // request.body를 User 모델에 넣는다.

    // mongoDB에서 제공하는 save() 메소드를 사용하여 정보들을 user 모델에 저장
    user.save((err, userInfo) => {
        if(err) return response.json({ 
            success: false, 
            err 
        });
        return response.status(200).json({
            success: true
        });
    });
});

// 로그인 라우터
app.post('/api/users/login', (request, response) => {
    // 1. 요청된 이메일이 DB에 있는지 확인
    // mongoDB에서 제공하는 findOne() 메소드 사용
    User.findOne({ email: request.body.email }, (err, user) => {
        // 요청된 이메일이 없는 경우
        if(!user) {
            return response.json({
                loginSuccess: false,
                message: "제공된 이메일에 해당하는 유저가 없습니다."
            });
        }

        // 2. 요청된 이메일이 DB에 있다면 비밀번호가 맞는지 확인
        user.comparePassword(request.body.password, (err, isMatch) => {
            if(!isMatch) {
                return response.json({ 
                    loginSuccess: false, 
                    message: "비밀번호가 틀렸습니다." 
                });
            }
            
            // 3. 비밀번호가 맞다면 토큰을 생성.
            user.generateToken((err, user) => {
                if(err) return response.status(400).send(err);

                // 토큰을 저장한다. 어디에? 쿠키, 로컬스토리지 ... => 여기선 쿠키에 저장!
                response.cookie('x_auth', user.token)
                .status(200)
                .json({ loginSuccess: true, userId: user._id });
            });
        });
    });
});

// 인증 라우터
app.get('/api/users/auth', auth, (request, response) => {
    // 여기까지 미들웨어를 통과해 왔다는 얘기는 Authentication이 True라는 말.
    response.status(200).json({
        _id: request.user._id,
        isAdmin: request.user.role === 0 ? false : true,        // role이 0이면 일반유저, 0이 아니면 관리자
        isAuth: true,
        email: request.user.email,
        name: request.user.name,
        lastname: request.user.lastname,
        role: request.user.role,
        image: request.user.image
    });
});

// 로그아웃 라우터
app.get('/api/users/logout', auth, (request, response) => {
    User.findOneAndUpdate({ _id: request.user._id }, { token: "" }, (err, user) => {
        if(err) return response.json({ success: false, err });
        return response.status(200).send({
            success: true
        });
    });
});


app.listen(5000, () => {
    console.log('Example app listening on port 5000!');
});