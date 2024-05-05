import {CommentView, CommentViewInput, CommentViewOutput} from "../../model/commentsType/commentsType";
import {CommentsModel} from "../../db/mongoose/models";

export const CommentsRepositories = {
    async createComments(newComment: CommentViewOutput): Promise<CommentViewInput> {
        await CommentsModel.create(newComment)
        return newComment
    },
    async allComments(id:string){
        return CommentsModel.findOne({id}, {projection: {_id: 0, postId: 0}}).lean()
    },
    async deleteComments(id: string): Promise<boolean> {
        const result = await CommentsModel.deleteOne({id:id})
        return result.deletedCount === 1
    },
    async updateComment(id:string,content:string): Promise<boolean>{
        const result = await CommentsModel
            .updateOne({id:id},{$set:{content:content}})
        return result.matchedCount === 1
    }

}