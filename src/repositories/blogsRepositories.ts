import {blogsView} from "../model/blogsType/blogsView";
import {getBlogsView} from "../model/blogsType/getBlogsView";

import {BlogModel} from "../db/mongoose/models";



export const BlogsRepositories = {
//get(/)
    async findFullBlogs() {
        const blogs: blogsView[] = await BlogModel.find({}).lean();
        return blogs.map(getBlogsView)
    },
//post(/)
    async createBlogs(newBlogs: blogsView): Promise<blogsView> {
        await BlogModel.create(newBlogs)
        return newBlogs
    },
//get(/id)
    async findBlogsByID(id: string): Promise<blogsView|null> {
        return BlogModel.findOne({id}, {projection: {_id: 0}}).lean();
    },
//put(/id)
    async updateBlogs(id:string, name: string, description: string, websiteUrl: string): Promise<boolean> {
        const result = await BlogModel
            .updateOne({id:id},{$set:{name:name,description:description,websiteUrl:websiteUrl}})
        return result.matchedCount === 1
    },
//delete(/id)
    async deleteBlogs(id: string):Promise<boolean> {
        const result = await BlogModel.deleteOne({id:id})
        return result.deletedCount === 1
    },



}


