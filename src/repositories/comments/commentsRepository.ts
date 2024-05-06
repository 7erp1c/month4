import {CommentLikeDTO, CommentView, CommentViewInput, CommentViewOutput} from "../../model/commentsType/commentsType";
import {CommentLikeModel, CommentsModel} from "../../db/mongoose/models";

export const CommentsRepositories = {
    async createComments(newComment: CommentView): Promise<CommentView> {
        await CommentsModel.create(newComment)
        return newComment
    },
    async OneCommentsById(id:string){
        return CommentsModel.findOne({id}, {projection: {_id: 0, postId: 0,__v:0}})
    },
    async deleteComments(id: string): Promise<boolean> {
        const result = await CommentsModel.deleteOne({id:id})
        return result.deletedCount === 1
    },
    async updateComment(id:string,content:string): Promise<boolean>{
        const result = await CommentsModel
            .updateOne({id:id},{$set:{content:content}})
        return result.matchedCount === 1
    },
    async updateCommentLike(updateModel: CommentLikeDTO) {

        const comment = await CommentsModel
            .findOne({id: updateModel.commentId});
        if (!comment) throw new Error();
        const like = await CommentLikeModel
            .findOne({$and: [{likedUserId: updateModel.likedUserId}, {commentId: updateModel.commentId}]});

        if (like) {
            // like.status = updateModel.status;
            // like.save();
            await CommentLikeModel.updateOne({_id: like._id}, {
            	$set: {
            		status: updateModel.status
            	}
            });
        } else {
            await CommentLikeModel.create(updateModel);
        }

    }

}