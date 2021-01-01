const { User } = require("../models/User");

// 인증 처리를 하는 곳
let auth = (request, response, next) => {
    // 1. 클라이언트 쿠키에서 토큰을 가져온다.
    let token = request.cookies.x_auth;

    // 2. 토큰을 복호화한 후 유저를 찾는다.
    User.findByToken(token, (err, user) => {
        if(err) throw err;

        // 유저가 없으면
        if(!user) return response.json({ isAuth: false, error: true });

        // 유저가 있으면
        request.token = token;
        request.user = user;
        next();
    });
}

module.exports = { auth };