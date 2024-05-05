import mongoose from "mongoose";
import {appConfig, settings} from "../../setting";
import dotenv from "dotenv"
dotenv.config()

const dbName =appConfig.DB_NAME
const mongoURI = /*process.env.MONGO_URL! ||*/ `mongodb://0.0.0.0:27017/${dbName}`

export const runMongoose = async ()=>{
	console.log(mongoURI)
	try{
		//mongodb+srv://7erp1c:qwe4534@cluster0.goaut3o.mongodb.net/?retryWrites=true&w=majority
		//mongodb+srv://7erp1c:qwe4534@cluster0.goaut3o.mongodb.net/DataBase?retryWrites=true&w=majority
		await mongoose.connect(mongoURI);
		console.log("Mongoose connection successful");
		console.log("Mongoose connected to" + process.env.MONGO_URL +"/"+appConfig.DB_NAME);
		return true;
	}catch(error) {
		console.log(error)
		await mongoose.disconnect();
		console.log("Mongoose connection failed");
		return false;
	}
};
