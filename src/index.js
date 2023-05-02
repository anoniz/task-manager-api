require("./db/mongoose");
const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const userRouter = require("./Routers/users");
const taskRouter = require("./Routers/tasks");

// app.use((req,res,next) => {
   
//   return res.send("SYSTEM IS UNDER MAINTANANCE ")
// })

app.use(express.json());
app.use(userRouter);
app.use(taskRouter);

app.get("/", (req, res) => {
  return res.status(200).send("APPLICATION IS UNDER DEVELOPEMENT PHASE ...");
});


app.listen(port, () => console.log(`listening on port ${port}`));


const multer = require('multer');


const upload = new multer({
  dest: 'images',
  limits: {
    fileSize: 2000_000
  },
  fileFilter(req,file,callback) {
     if(!file.originalname.match(/\.(doc|docx)$/)) {
        return callback(new Error('please upload a word document'));
     }
     callback(undefined,true);
  }
});

app.post('/upload', upload.single('upload'), (req,res) => {

     res.send("ok done");
})
