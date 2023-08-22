const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Task = require('./tasks');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true,
    lowercase: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error("Email is invalid");
      }
    },
  },
  password: {
    type: String,
    required: true,
    minlength: 7,
    trim: true,
    validate(value) {
      if (value.toLowerCase().includes("password")) {
        throw new Error('Password cannot contain "password"');
      }
    },
  },
  age: {
    type: Number,
    default: 0,
    validate(value) {
      if (value < 0) {
        throw new Error("Age must be a postive number");
      }
    },
  },
  avatar: {
    type: Buffer
  },
  tokens: [
    {
      token: {
        type: String,
        required: true,
      },
    }, 
  ],
}, {
  timestamps: true
});

userSchema.methods.generateAuthToken = async function () {
  const user = this;
  const token = jwt.sign({ _id: user._id.toString() }, process.env.secret);
 // console.log(process.env.secret);

  user.tokens = user.tokens.concat({ token });
  await user.save();
  return token;
};

userSchema.methods.toJSON = function () {
   const user = this;
   const userObject = user.toObject();
   delete userObject.password;
   delete userObject.tokens;
   delete userObject.avatar;
   return userObject;
}

userSchema.statics.findByCredentials = async (email, pass) => {
  const user = await User.findOne({ email });
  if (!user) return;
  const isMatch = await bcrypt.compare(pass, user.password);
  if (!isMatch)  return
  return user;
  
};


//Setting Up a virtual task property 'task' to access
// the tasks created by a user, its virtual , just a reference.
// not an actual task..

userSchema.virtual('tasks', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'owner'
})


// Hash the plain text password before saving
userSchema.pre("save", async function (next) {
  const user = this;

  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }

  next();
});

// delete all the tasks of user before deleting his profile
userSchema.pre("remove", async function(next) {
  const user = this;
  await Task.deleteMany({owner: user._id});

  next();
})

const User = mongoose.model("User", userSchema);

module.exports = User;
