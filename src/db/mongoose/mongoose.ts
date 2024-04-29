import mongoose from "mongoose";
import {appConfig, settings} from "../../setting";



export const runMongoose = async ()=>{
	try{
		await mongoose.connect(process.env.MONGO_URL+"/"+appConfig.DB_NAME);
		console.log("Mongoose connection successful");
		console.log("Mongoose connected to" + process.env.MONGO_URL +"/"+appConfig.DB_NAME);
		return true;
	}catch {
		await mongoose.disconnect();
		console.log("Mongoose connection failed");
		return false;
	}
};
