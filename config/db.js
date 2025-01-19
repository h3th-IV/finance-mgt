const mongoose = require("mongoose");
const color = require("colors");
mongoose.set('strictQuery', true);

//all test dbs
module.exports.connectDB = async () => {
  if (process.env.NODE_ENV === "development") {
    mongoose.connect("mongodb+srv://victor:Maythird1.!@test.4f52hfp.mongodb.net/capitalwise?retryWrites=true&w=majority&appName=test");

    console.log("staging db connected".blue);
  } else if (process.env.NODE_ENV === "production") {
    mongoose.connect("mongodb+srv://victor:Maythird1.!@test.4f52hfp.mongodb.net/capitalwise?retryWrites=true&w=majority&appName=test");
    console.log("production db connected".blue);
   
  } else {
    mongoose.connect("mongodb+srv://victor:Maythird1.!@test.4f52hfp.mongodb.net/capitalwise?retryWrites=true&w=majority&appName=test");
  }
};

module.exports.closeDatabase = async () => {
  try {
    await mongoose.connection.dropDatabase();
    console.log("Database dropped successfully".yellow);
    await mongoose.disconnect();
    console.log("Database connection closed".yellow);
  } catch (error) {
    console.error("Error dropping database:".red, error);
  }
};


module.exports.clearDatabase = async () => {
  try {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany();
      console.log(`Cleared all documents from ${key} collection`.cyan);
    }
    console.log("All collections cleared successfully".rainbow);
  } catch (error) {
    console.error("Error clearing database:".red, error);
  }
};

