const router = new require("express").Router();
const multer = require('multer');
const sharp = require('sharp');
const User = require("../models/users");
const auth = require("../middleware/auth");
const { sendWelcomeEmail,sendCancellationEmail } = require('../utils/mail');

router.post("/users", async (req, res) => {
  const user = new User(req.body);
  try {
    await user.save();
    sendWelcomeEmail(user.email,user.name);
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
       sendCancellationEmail(req.user.email,req.user.name);
       res.send(req.user);
  } catch (e) {
       res.status(500).send();
  }
});


const upload = new multer({
      limits: {
        fileSize: 2000_000
      },
      fileFilter(req,file,callback) {
         if(!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return callback(new Error('Please Upload An Image..'));
         }
         callback(undefined,true);
      }
  });

// upload profile picture..
router.post('/users/me/avatar',auth, upload.single('avatar'), async (req,res) => {
     const buffer = await sharp(req.file.buffer).resize({width:250,height:250}).png().toBuffer();
     req.user.avatar = buffer;
     await req.user.save();
     res.send("uploaded pic success");
}, (err,req,res,next) => {
   res.status(400).send({err:err.message})
})

// delete profile picture..
router.delete('/users/me/avatar',auth, async(req,res) => {
    if(req.user.avatar) {
      req.user.avatar = undefined;
      await req.user.save();
      return res.send("Avatar Deleted");
    }
    return res.status(404).send("Avatar Not Found");

})

// fetch avatar by id
router.get('/users/:id/avatar', async(req,res) => {
  try  {
    const user = await User.findById(req.params.id);
    if(!user || !user.avatar) {
      throw new Error();
    }
    // setting header for sending image
    res.set('Content-Type','image/png');
    return res.send(user.avatar);
  } catch(e) {
    return res.status(400).send("something went wrong");
  }
    

})

module.exports = router;
