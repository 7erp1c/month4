import {ObjectId} from "mongodb";
import {JwtService} from "../../application/jwt-service";
import {CommentsRepositories} from "../../repositories/comments/commentsRepository";
import {CommentLikeDTO, CommentView, CommentViewOutput, LikeStatusType} from "../../model/commentsType/commentsType";
import {UsersQueryRepository} from "../../repositoriesQuery/user-query-repository";
import {ResultStatus} from "../../_util/enum";
import {CommentsQueryRepository} from "../../repositoriesQuery/comments-query-repository";
import {Result} from "../../model/result.type";
import {UnauthorizedError} from "express-jwt";


export const CommentsService = {
    async createLikeComment(commentId:string,status:LikeStatusType,userId:string){

        const updateModel: CommentLikeDTO = {
            commentId: commentId,
            likedUserId: userId,
            status: status
        };
        await CommentsRepositories.updateCommentLike(updateModel);
    },
    async createComments(content: string, foundPostId: string, userId: string): Promise<CommentViewOutput|null> {
        const user = await UsersQueryRepository.findUserById(userId)

        let newComment:CommentView = {
            id: new ObjectId().toString(),
            content: content,
            commentatorInfo: {
                userId: user.data?.userId,
                userLogin: user?.data?.login
            },
            createdAt: new Date().toISOString(),
            postId: foundPostId

        }
        const createdComment = await CommentsRepositories.createComments(newComment)
        const returnCommentWithLike = await CommentsQueryRepository.getCommentById(createdComment.id,createdComment.commentatorInfo.userId);
        if (!returnCommentWithLike) return null;
        return returnCommentWithLike
        //{
            // id: createdComment.id,
            // content: createdComment.content,
            // commentatorInfo: {
            //     userId: createdComment.commentatorInfo.userId,
            //     userLogin: createdComment.commentatorInfo.userLogin
            // },
            // createdAt: createdComment.createdAt,
            // likesInfo:{
            //     likesCount:createdComment.likesInfo.likesCount,
            //     dislikesCount: createdComment.likesInfo.dislikesCount,
            //     myStatus:createdComment.likesInfo.myStatus
            // }
        //}
    },

    async OneCommentById(id: string) {
        return await CommentsRepositories.OneCommentsById(id);
    },
    async getCommentWitchLikes(id: string,userId:string) {
    //     const userId = await this.OneCommentById(id)
    //     console.log("*****************")
    //     console.log(userId)
    //     if(!userId){
    //         return null
    // }
        return CommentsQueryRepository.getCommentById(id,userId)
    },

    async deleteComments(id:string){
        return await CommentsRepositories.deleteComments(id);
    },

    async updateComment(commentId:string,content:string){
        return await CommentsRepositories.updateComment(commentId,content)
    },

    async removeComment(id: string, userId: string){
        const comment = await CommentsRepositories.OneCommentsById(id)

        if(!comment) return {
            status: ResultStatus.NotFound,
            errorMessage: 'Comment not found',
            data: null,
        }

        if(comment.commentatorInfo.userId !== userId) return {
            status: ResultStatus.Forbidden,
            errorMessage: 'Comment is not in our own',
            data: null,
        }

       const isDeleted =  await CommentsRepositories.deleteComments(id);

        if(!isDeleted) return {
            status: ResultStatus.NotFound,
            errorMessage: 'Comment not found',
            data: null,
        }

        return {
            status: ResultStatus.Success,
            data: null,
        }

    }

}