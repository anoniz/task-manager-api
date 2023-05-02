const mongoose = require('mongoose');

mongoose.set('strictQuery', true);
const connection = mongoose.connect('mongodb://127.0.0.1:27017/task-manager-api');

connection.then(() => console.log("connected to db successfully"))
.catch((err) => console.log(err));





