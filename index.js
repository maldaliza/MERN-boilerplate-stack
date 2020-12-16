const express = require('express');
const app = express();
const port = 5000;

const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://jaekook:wornr@1994@boilerplate.ovxc1.mongodb.net/<dbname>?retryWrites=true&w=majority', {
    useNewUrlParser: true, 
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
}).then(() => console.log('MongoDB Connected ...'))
  .catch(error => console.log(error));



app.get('/', (request, response) => {
    response.send('안녕하세요!');
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}!`);
});