import {runMongoose} from "./mongoose/mongoose";


export const connectToDB = async () => {
	// const mongo = await db.run();
	const mongoose = await runMongoose();
	return /*mongo &&*/ mongoose;
};
