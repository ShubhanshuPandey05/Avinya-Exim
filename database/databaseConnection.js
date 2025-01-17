import mongoose from "mongoose";

const connectionToDatabase = async() => {
    try {
        await mongoose.connect(process.env.MONGODB)
        console.log("Connection succesfull");
    } catch (error) {
        console.log("error in code");
        console.log(error);
    }
}
export default connectionToDatabase;