
import {PostLikeDto, PostOutputType, PostsType} from "../model/postsType/postsType";
//import {connectMongoDb} from "../db/mongo-memory-server/connect-mongo-db";
import {PostLikeModel, PostModel} from "../db/mongoose/models";


export const PostsRepositories = {
    //get(/)
    async findFullPosts():Promise<PostOutputType[]> {
        return PostModel.find({},{ projection: { _id: 0 }}).lean()
    },
//post(/)

    async createPosts(newPosts:PostsType):Promise<PostsType> {
        await PostModel.create(newPosts)
        return newPosts

    },
//get(/id)
    async  findPostsByID(id: string):Promise<PostsType|null> {
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
    },
    async updatePostLike(updateModel: PostLikeDto) {

        const post = await PostModel.findOne({id:updateModel.postId});
        if (!post) throw new Error();
        // const like = await PostLikeModel.findOne({$and: [{likedUserId: updateModel.likedUserId}, {postId: updateModel.postId}]});

        const like = await PostLikeModel.findOneAndUpdate({$and: [{likedUserName: updateModel.likedUserName}, {postId: updateModel.postId}]},updateModel );
        //если нет лака:
        if (!like) {
            await PostLikeModel.create(updateModel);
        }
    }
}