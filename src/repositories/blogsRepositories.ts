import {blogsView} from "../model/blogsType/blogsView";
import {getBlogsView} from "../model/blogsType/getBlogsView";
import {connectMongoDb} from "../db/connect-mongo-db";



export const BlogsRepositories = {
//get(/)
    async findFullBlogs() {
        const blogs: blogsView[] = await connectMongoDb.getCollections().blogCollection.find({}).toArray();
        return blogs.map(getBlogsView)
    },
//post(/)
    async createBlogs(newBlogs: blogsView): Promise<blogsView> {
        await connectMongoDb.getCollections().blogCollection.insertOne(newBlogs)
        return newBlogs
    },
//get(/id)
    async findBlogsByID(id: string): Promise<blogsView|null> {
        return await connectMongoDb.getCollections().blogCollection.findOne({id}, {projection: {_id: 0}})
    },
//put(/id)
    async updateBlogs(id:string, name: string, description: string, websiteUrl: string): Promise<boolean> {
        const result = await connectMongoDb.getCollections().blogCollection
            .updateOne({id:id},{$set:{name:name,description:description,websiteUrl:websiteUrl}})
        return result.matchedCount === 1
    },
//delete(/id)
    async deleteBlogs(id: string):Promise<boolean> {
        const result = await connectMongoDb.getCollections().blogCollection.deleteOne({id:id})
        return result.deletedCount === 1
    },



}


