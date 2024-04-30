import mongoose from "mongoose";
import {appConfig, settings} from "../../setting";



export const runMongoose = async ()=>{
	try{
		//mongodb+srv://7erp1c:qwe4534@cluster0.goaut3o.mongodb.net/?retryWrites=true&w=majority
		//mongodb+srv://7erp1c:qwe4534@cluster0.goaut3o.mongodb.net/DataBase?retryWrites=true&w=majority
		await mongoose.connect(process.env.MONGO_URL!);
		console.log("Mongoose connection successful");
		console.log("Mongoose connected to" + process.env.MONGO_URL +"/"+appConfig.DB_NAME);
		return true;
	}catch {
		await mongoose.disconnect();
		console.log("Mongoose connection failed");
		return false;
	}
};
