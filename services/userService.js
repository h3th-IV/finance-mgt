const User = require("../models/user");

module.exports = class UserService {
    static async createUser(data) {
        try {
            const newUser = {
                full_name: data.name,
                email: data.email,
                phone_number: data.number,
                password: data.password
            }
            const response = await new User(newUser).save();
            return response;
        } catch (error) {
            return error;
        }
    }

    static async getUserByEmail(email) {
        try {
            const user = await User.findOne({ email: email });
            return user;
        } catch (error) {
            return error;
        }
    }

    static async getUserByID(_id) {
        try {
            const user = await User.findById(_id);
            return user;
        } catch (error) {
            return error;
        }
    }

    static async getUsers(){
        try {
            const users = User.find();
            return users;
        } catch (error) {
            
        }
    }
};