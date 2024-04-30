
import {PostsView} from "../model/postsType/postsView";
//import {connectMongoDb} from "../db/mongo-memory-server/connect-mongo-db";
import {PostModel} from "../db/mongoose/models";


export const PostsRepositories = {
    //get(/)
    async findFullPosts():Promise<PostsView[]> {
        return PostModel.find({},{ projection: { _id: 0 }}).lean()
    },
//post(/)

    async createPosts(newPosts:PostsView):Promise<PostsView> {
        await PostModel.create(newPosts)
        return newPosts

    },
//get(/id)
    async  findPostsByID(id: string):Promise<PostsView|null> {
        return PostModel.findOne({id}, { projection: { _id: 0 }});

    },
//put(/id)
    async updatePosts(id: string, title: string, shortDescription: string, content: string, blogId:string):Promise<boolean> {
        const result = await PostModel
            .updateOne({id:id},{$set:{title:title,shortDescription:shortDescription,content:content,blogId:blogId}})
        return result.matchedCount === 1

    },
//delete(/id)
    async deletePosts(id: string): Promise<boolean> {
        const result = await PostModel.deleteOne({id:id})
        return result.deletedCount === 1
    }
}