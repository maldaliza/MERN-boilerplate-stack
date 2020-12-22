const { User } = require("../models/User");

let auth = (request, response, next) => {
    // 인증 처리를 하는 곳

    // 1. Client cookie에서 토큰을 가져온다.
    let token = request.cookies.x_auth;

    // 2. 토큰을 복호화한 후, user를 찾는다.
    User.findByToken(token, (err, user) => {
        if(err) throw err;
        if(!err) return response.json({ isAuth: false, error: true });

        request.token = token;
        request.user = user;
        next();
    });

    // 3. user가 있으면 인증 okay

    // 4. user가 없으면 인증 No!
}

module.exports = { auth };