import {CommentView} from "../../model/commentsType/commentsView";
import {connectMongoDb} from "../../db/connect-mongo-db";

export const CommentsRepositories = {
    async createComments(newComment: CommentView): Promise<CommentView> {
        await connectMongoDb.getCollections().commentsCollection.insertOne(newComment)
        return newComment
    },
    async allComments(id:string){
        return await connectMongoDb.getCollections().commentsCollection.findOne({id}, {projection: {_id: 0, postId: 0}})
    },
    async deleteComments(id: string): Promise<boolean> {
        const result = await connectMongoDb.getCollections().commentsCollection.deleteOne({id:id})
        return result.deletedCount === 1
    },
    async updateComment(id:string,content:string): Promise<boolean>{
        const result = await connectMongoDb.getCollections().commentsCollection
            .updateOne({id:id},{$set:{content:content}})
        return result.matchedCount === 1
    }

}