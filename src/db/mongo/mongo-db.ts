// import dotenv from "dotenv";
// import {connectMongoDb} from "./connectMongoDb";
//
//
// dotenv.config()
//
//  const mongoURI = process.env.MONGO_URL || 'http://localhost:27017'
// console.log(process.env.MONGO_URL)
// if(!mongoURI){
//     throw new Error("URL doesn\'t found")
// }
//
//
// //export const client: MongoClient = await connectMongoDb.run(mongoURI)
//
//
// export let dbName = connectMongoDb.getDbName();

// export const blogCollection: Collection<blogsView> = dbName.collection<blogsView>("blogs")
// export const postCollection: Collection<PostsView> = dbName.collection<PostsView>("posts")
// export const usersCollection: Collection<createUserAccountThroughAuth> = dbName.collection<createUserAccountThroughAuth>("users")
// export const commentsCollection: Collection<CommentView> = dbName.collection<CommentView>("comments")
// export  const refreshTokenCollection:Collection<OldTokenDB> = dbName.collection<OldTokenDB>("old-old-token")
// export const connectToDB = async () => {
//     try {
//         await connectMongoDb.run(mongoURI)
//         console.log('connected to connectMongoDb')
//         return true
//     } catch (e) {
//         console.log(e)
//         await connectMongoDb.stop()
//         return false
//     }
// }


