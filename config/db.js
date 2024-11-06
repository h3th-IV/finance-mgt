const mongoose = require("mongoose");
const color = require("colors");
mongoose.set('strictQuery', true);

//all test dbs
module.exports.connectDB = async () => {
  if (process.env.NODE_ENV === "development") {
    mongoose.connect(process.env.MONGO_URI);
 console.log("staging db connected".blue);
  } else if (process.env.NODE_ENV === "production") {
    mongoose.connect(process.env.MONGO_URI);
    console.log("production db connected".bgBlue);
   
  } else {
    mongoose.connect(process.env.MONGO_URI);
  }
};

module.exports.closeDatabase = async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
};

module.exports.clearDatabase = async () => {
  const collections = mongoose.connection.collections;

  for (const key in collections) {
    const collection = collections[key];
    collection.deleteMany();
  }
};
