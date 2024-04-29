import dotenv from "dotenv";
import * as e from "express";
import {Db, MongoClient} from "mongodb";
import {createUserAccAuth} from "../model/usersType/inputModelTypeUsers";
import {blogsView} from "../model/blogsType/blogsView";
import {PostsView} from "../model/postsType/postsView";
import {CommentView} from "../model/commentsType/commentsView";
import {apiLogSchema, OldTokenDB, SessionsAddDB} from "../model/authType/authType";
import {appConfig} from "../setting";
import {app} from "../app";


dotenv.config()

const mongoURI = process.env.MONGO_URL || 'http://localhost:27017'
console.log(process.env.MONGO_URL)
if(!mongoURI){
    throw new Error("URL doesn\'t found")
}

//логика работы MongoMemoryServer:
export const connectMongoDb = {

    client: {} as MongoClient,

    getDbName(): Db {
        return this.client.db(appConfig.DB_NAME)
    },
    async run(url: string) {//метод подключения к connectMongoDb
        try {
            this.client = new MongoClient(url)// создаём клиент монго клиент и подкидываем url

            await this.client.connect();//конектимся
            //console.log('client', this.client)
            await this.getDbName().command({ping: 1});//?
            console.log('Connected successfully to mongo server')
            //console.log('Connected successfully to mongo server', e)
        } catch (e: unknown) {
            console.error("Can't connect to mongo server", e)

            await this.client.close();
        }
    },
    async stop() {//метод стоп
        await this.client.close();
        console.log('Connected successfully closed')
    },
    async drop() { //метод берет все коллекции и чистит
        try {
            //await this.getName().dropDatabase()//для использования этого метода, нужны права админа
            const collections = await this.getDbName().listCollections().toArray()//берем все коллекции

            for (const collection of collections) {//проходим циклом и получаем имя каждой коллекции
                const collectionName = collection.name;
                await this.getDbName().collection(collectionName).deleteMany({})
            }
        } catch (e: unknown) {
            console.error('Error in drop connectMongoDb:', e)
            await this.stop()
        }
    },
    getCollections(){
        return{
            blogCollection:this.getDbName().collection<blogsView>("blogs"),
            postCollection:this.getDbName().collection<PostsView>("posts"),
            usersCollection:this.getDbName().collection<createUserAccAuth>("users"),
            commentsCollection:this.getDbName().collection<CommentView>("comments"),
            refreshTokenCollection:this.getDbName().collection<OldTokenDB>("old-old-token"),
            apiLogCollection:this.getDbName().collection<apiLogSchema>("apiLog"),
            securityCollection:this.getDbName().collection<SessionsAddDB>("SecurityDevices")

        }
    }

}
//export let dbName = connectMongoDb.getDbName();

export const connectToDB = async () => {
    try {
        await connectMongoDb.run(mongoURI)
        console.log('connected to connectMongoDb')
        return true
    } catch (e) {
        console.log(e)
        await connectMongoDb.stop()
        return false
    }
}
