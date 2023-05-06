const mongoose = require('mongoose');
require('dotenv').config()

mongoose.set('strictQuery', true);
const connection = mongoose.connect(process.env.CONNECTION_URL);

connection.then(() => console.log("connected to db successfully"))
.catch((err) => console.log(err));





