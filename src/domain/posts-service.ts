import {PostsView} from "../model/postsType/postsView";
import {PostsRepositories} from "../repositories/postsRepositories";
import {connectMongoDb} from "../db/connect-mongo-db";




export const PostsService = {
    //get(/)
    async findFullPosts():Promise<PostsView[]> {
        return PostsRepositories.findFullPosts()
    },
//post(/)

    async createPosts( title: string, shortDescription: string, content: string, blogId:string):Promise<PostsView> {

        async function getNameByID(id: string): Promise<string | null> {
            const blog = await connectMongoDb.getCollections().blogCollection
                .findOne({ id }, { projection: { _id: 0, name: 1 } });
            return blog ? blog.name : null;
        }
        const blogName = await getNameByID(blogId)||'';

        let newPosts = {
            id: (+new Date()).toString(),
            title: title,
            shortDescription: shortDescription,
            content: content,
            blogId: blogId,
            blogName: blogName,
            createdAt: new Date().toISOString()

        };
        const createdPosts = await PostsRepositories.createPosts(newPosts)
        let newPostsWithoutId = {...createdPosts} as any;
        delete newPostsWithoutId._id;

        return newPostsWithoutId as PostsView;
    },

//get(/id)
    async  findPostsByID(id: string):Promise<PostsView|null> {
        return PostsRepositories.findPostsByID(id)
    },
//put(/id)
    async updatePosts(id: string, title: string, shortDescription: string, content: string, blogId:string):Promise<boolean> {
        return await PostsRepositories.updatePosts(id,title,shortDescription,content,blogId)
    },
//delete(/id)
    async deletePosts(id: string): Promise<boolean> {
        return PostsRepositories.deletePosts(id)
    },

}