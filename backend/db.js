const mongoose = require("mongoose");
require("dotenv").config();

const mongodburl =
  "mongodb+srv://sheethalh083:XWJ2EfP0vH1jsAO7@cluster0.qwfzqvz.mongodb.net/EduConnectHubv2?retryWrites=true&w=majority&appName=Cluster0";
console.log("mongodburl", mongodburl);

const connectDB = async () => {
  try {
    await mongoose.connect(mongodburl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1); // Exit process with failure
  }
};
module.exports = connectDB;
