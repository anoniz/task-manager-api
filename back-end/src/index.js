require("./db/mongoose");
const express = require("express");
const app = express();
const port = process.env.PORT;
const userRouter = require("./Routers/users");
const taskRouter = require("./Routers/tasks");

// app.use((req,res,next) => {
   
//   return res.send("SYSTEM IS UNDER MAINTANANCE ")
// })

app.use(express.json());
app.use(userRouter);
app.use(taskRouter);

app.get("/", (req, res) => {
  return res.send("APPLICATION IS UNDER DEVELOPEMENT PHASE ...");
});


app.listen(port, () => console.log(`listening on port ${port}`));
