
import {PostsView} from "../model/postsType/postsView";
import {connectMongoDb} from "../db/connect-mongo-db";


export const PostsRepositories = {
    //get(/)
    async findFullPosts():Promise<PostsView[]> {
        return connectMongoDb.getCollections().postCollection.find({},{ projection: { _id: 0 }}).toArray()
    },
//post(/)

    async createPosts(newPosts:PostsView):Promise<PostsView> {
        await connectMongoDb.getCollections().postCollection.insertOne(newPosts)
        return newPosts

    },
//get(/id)
    async  findPostsByID(id: string):Promise<PostsView|null> {
        return  await connectMongoDb.getCollections().postCollection.findOne({id}, { projection: { _id: 0 }});

    },
//put(/id)
    async updatePosts(id: string, title: string, shortDescription: string, content: string, blogId:string):Promise<boolean> {
        const result = await connectMongoDb.getCollections().postCollection
            .updateOne({id:id},{$set:{title:title,shortDescription:shortDescription,content:content,blogId:blogId}})
        return result.matchedCount === 1

    },
//delete(/id)
    async deletePosts(id: string): Promise<boolean> {
        const result = await connectMongoDb.getCollections().postCollection.deleteOne({id:id})
        return result.deletedCount === 1
    }
}