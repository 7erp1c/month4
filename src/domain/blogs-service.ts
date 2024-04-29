import {BlogsRepositories} from "../repositories/blogsRepositories";
import {blogsView} from "../model/blogsType/blogsView";




export const BlogsService = {
//get(/)
     async findFullBlogs(): Promise<blogsView[]> {
        return BlogsRepositories.findFullBlogs()
        },
//post(/)
    async createBlogs(name: string, description: string, websiteUrl: string): Promise<blogsView> {

        let newBlogs = {
            id: (+(new Date())).toString(),
            name: name,
            description: description,
            websiteUrl: websiteUrl,
            createdAt: new Date().toISOString(),
            isMembership: false,
        };
        const createdBlogs = await BlogsRepositories.createBlogs(newBlogs)
        let newBlogsWithoutId = {...newBlogs} as any;
        delete newBlogsWithoutId._id;

        return newBlogsWithoutId as blogsView;

    },
//get(/id)
    async findBlogsByID(id: string): Promise<blogsView | null> {
        return BlogsRepositories.findBlogsByID(id);

    },
//put(/id)
    async updateBlogs(id: string, name: string, description: string, websiteUrl: string): Promise<boolean> {
        return await BlogsRepositories.updateBlogs(id, name, description, websiteUrl)

    },
//delete(/id)
    async deleteBlogs(id: string): Promise<boolean> {
        return await BlogsRepositories.deleteBlogs(id)
    }

}
