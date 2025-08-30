require("dotenv").config();
const mongoose = require("mongoose");

mongoose.connect(process.env.MONGO_URI);

const userSchema = new mongoose.Schema({
  name: String,
  id: {type: mongoose.Schema.Types.ObjectId},
  log_sts: Boolean,
  email: String,
  password: String,
  posts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }]
});

module.exports = mongoose.model("user", userSchema);
