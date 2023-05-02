const router = new require("express").Router();
const User = require("../models/users");
const auth = require("../middleware/auth");

router.post("/users", async (req, res) => {
  const user = new User(req.body);

  try {
    await user.save();
    const token = await user.generateAuthToken();
    res.status(201).send({ user, token });
  } catch (e) {
    res.status(400).send(e);
  }
});

router.post("/users/login", async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );
    if(!user) {
      return res.status(401).send("Invalid Credentials ");
    }
    const token = await user.generateAuthToken();
    res.send({ user, token });
  } catch (e) {
    res.status(500).send("something is wrong with server");
  }
});

router.post('/users/logout',auth, async (req,res) => {
   try {
       req.user.tokens = req.user.tokens.filter((token) => {
          return token.token !== req.token;
       })

       await req.user.save();
       return res.send("logout success");
   } catch(e) {
      res.status(500).send("internal server problem");
   }
})

router.post('/users/logout-all',auth, async (req,res) => {
   try {
        req.user.tokens = [];
        await req.user.save();
        return res.send("logged out from all devices");
   } catch(e) {
     return res.status(500).send("Intenal server problem");
   }
})

router.get("/users/me",auth, async (req, res) => {
    return res.send(req.user);
});

router.get("/users/:id", async (req, res) => {
  const _id = req.params.id;

  try {
    const user = await User.findById(_id);

    if (!user) {
      return res.status(404).send();
    }

    res.send(user);
  } catch (e) {
    res.status(500).send();
  }
});

router.patch("/users/me",auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["name", "email", "password", "age"];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    return res.status(400).send({ error: "Invalid updates!" });
  }

  try {
    const user = req.user;

    updates.forEach((update) => (user[update] = req.body[update]));
    await user.save();

    return res.send(user);
  } catch (e) {
    res.status(400).send(e);
  }
});

router.delete("/users/me",auth, async (req, res) => {
  try {
       await req.user.remove();
       res.send(req.user);
  } catch (e) {
       res.status(500).send();
  }
});

module.exports = router;
