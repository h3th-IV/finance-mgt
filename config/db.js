const mongoose = require("mongoose");
mongoose.set('strictQuery', true);


module.exports.connectDB = async () => {
  if (process.env.NODE_ENV === "development") {
    mongoose.connect("connectionURL here", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
 console.log("staging db connected");
  } else if (process.env.NODE_ENV === "production") {
    mongoose.connect("connectionURL here", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("production db connected");
   
  } else {
    mongoose.connect("connectionURL here", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
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
