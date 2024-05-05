import {PostsType} from "../model/postsType/postsType";
import {PostsRepositories} from "../repositories/postsRepositories";
import {BlogModel} from "../db/mongoose/models";
import {BlogsService} from "./blogs-service";


export const PostsService = {
    //get(/)
    async findFullPosts(): Promise<PostsType[]> {
        return PostsRepositories.findFullPosts()
    },
//post(/)

    async createPosts(title: string, shortDescription: string, content: string, blogId: string): Promise<PostsType> {
        const blog = await BlogsService.findBlogsByID(blogId)

        let newPosts = {
            id: (+new Date()).toString(),
            title: title,
            shortDescription: shortDescription,
            content: content,
            blogId: blogId,
            blogName: blog!.name,
            createdAt: new Date().toISOString()

        };
        const createdPosts = await PostsRepositories.createPosts(newPosts)
        let newPostsWithoutId = {...newPosts} as any;
        delete newPostsWithoutId._id;

        return newPostsWithoutId as PostsType;
    },

//get(/id)
    async findPostsByID(id: string): Promise<PostsType | null> {
        return PostsRepositories.findPostsByID(id)
    },
//put(/id)
    async updatePosts(id: string, title: string, shortDescription: string, content: string, blogId: string): Promise<boolean> {
        return await PostsRepositories.updatePosts(id, title, shortDescription, content, blogId)
    },
//delete(/id)
    async deletePosts(id: string): Promise<boolean> {
        return PostsRepositories.deletePosts(id)
    },

}