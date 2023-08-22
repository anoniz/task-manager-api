const router = new require("express").Router();
const Task = require("../models/tasks");
const auth = require('../middleware/auth');

router.post("/tasks",auth, async (req, res) => {

 const task = new Task({
    ...req.body,
     owner: req.user._id
 })

  try {
    await task.save();
    res.status(201).send(task);
  } catch (e) {
    res.status(400).send(e);
  }
});

//GET /tasks?completed=true
//GET /tasks?limit=2&skip=2
//GET /tasks?sortBy=createdAt:desc

router.get("/tasks",auth, async (req, res) => {
  const match = {};
  const sort = {};
  req.query.completed ? match.completed = req.query.completed === 'true':false
  
  if(req.query.sortBy) {
    const parts = req.query.sortBy.split(':');
    // bracket notation for objects
    sort[parts[0]] = parts[1] === 'desc' ? -1:1
  }
  try {
       const user = await req.user.populate({ 
        path:'tasks',
        match,
        options:{
          limit: parseInt(req.query.limit),
          skip: parseInt(req.query.skip),
          sort
        }});

       res.send(user.tasks);
  } catch (e) {
    res.status(500).send("server problem");
  }
});

router.get("/tasks/:id",auth, async (req, res) => {
  const _id = req.params.id;
  try {
    // here we are searching for task by id and also 
    //checking if the owner is one who just authenticated
    //through out middleware......
    const task = await Task.findOne({_id,owner: req.user._id})
    if (!task) {
      return res.status(404).send("Unable to find task");
    }

    res.send(task);
  } catch (e) {
    res.status(500).send();
  }
});

router.patch("/tasks/:id",auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["description", "completed"];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    return res.status(400).send({ error: "Invalid updates!" });
  }

  try {
    const task = await Task.findOne({_id:req.params.id, owner:req.user._id});
    if (!task) {
      return res.status(404).send("task not found");
    }
    updates.forEach((update) => (task[update] = req.body[update]));
    await task.save();

    res.send(task);
  } catch (e) {
    res.status(400).send(e);
  }
});

router.delete("/tasks/:id",auth, async (req, res) => {
  try {
      const task = await Task.findOneAndDelete({_id:req.params.id, owner:req.user._id});
    if (!task) {
      return res.status(404).send("Task not found");
    }
    return res.send(task);
  } catch (e) {
    return res.status(505).send("servers problem");
  }
});

module.exports = router;
