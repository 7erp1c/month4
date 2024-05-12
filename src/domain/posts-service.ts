import {PostLikeDto, PostOutputType, PostsType} from "../model/postsType/postsType";
import {PostsRepositories} from "../repositories/postsRepositories";
import {BlogsService} from "./blogs-service";
import {LikeStatusType} from "../model/commentsType/commentsType";
import {PostsQueryRepository} from "../repositoriesQuery/posts-query-repository";



export const PostsService = {
    async createLikePost(postId: string, status: LikeStatusType, userId: string,userName:string) {
        const createdAt = (new Date()).toISOString()
        const updateModel: PostLikeDto = {
            postId: postId,
            likedUserId: userId,
            likedUserName:userName,
            addedAt:createdAt,
            status: status
        };
        await PostsRepositories.updatePostLike(updateModel);
    },
    //get(/)
    async findFullPosts(): Promise<PostsType[]> {
        return PostsRepositories.findFullPosts()
    },
//post(/)

    async createPosts(title: string, shortDescription: string, content: string, blogId: string,userId?:string): Promise<PostOutputType> {
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
        const createdPost = await PostsQueryRepository.getPostById(newPosts.id,userId);
        return createdPost
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
    async findPostsByIDQuery(id: string,userId:string): Promise<PostOutputType | null> {
        return PostsQueryRepository.getPostById(id,userId)
    },

}