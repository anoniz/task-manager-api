const bcrypt = require("bcrypt");

const userpass = "pass1234";

const fun = async () => {
  const hash = await bcrypt.hash(userpass, 8);
  console.log(typeof hash);
  const isMatch = await bcrypt.compare(userpass, hash);
  console.log(isMatch);
};

fun();
