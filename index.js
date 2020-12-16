const express = require('express');
const app = express();
const port = 5000;
const bodyParser = require('body-parser');

const config = require('./config/key');

const { User } = require('./models/User');

// application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: true}));

// application/json
app.use(bodyParser.json());


const mongoose = require('mongoose');
mongoose.connect(config.mongoURI, {
    useNewUrlParser: true, 
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
}).then(() => console.log('MongoDB Connected ...'))
  .catch(error => console.log(error));


app.get('/', (request, response) => {
    response.send('안녕하세요! 이재국입니다 :)');
});

app.post('/register', (request, response) => {
    /*
        회원가입할 때 필요한 정보들을 client에서 가져오면
        그것들을 데이터베이스에 넣어준다.
    */
    const user = new User(request.body);

    user.save((err, userInfo) => {
        if(err) return response.json({ success: false, err });
        return response.status(200).json({
            success: true
        });
    });
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}!`);
});