import {ObjectId} from "mongodb";
import {JwtService} from "../../application/jwt-service";
import {CommentsRepositories} from "../../repositories/comments/commentsRepository";
import {CommentViewOutput} from "../../model/commentsType/commentsView";
import {UsersQueryRepository} from "../../repositoriesQuery/user-query-repository";
import {ResultStatus} from "../../_util/enum";


export const CommentsService = {
    async createComments(content: string, foundPostId: string, token: string): Promise<CommentViewOutput> {
        const userId = await JwtService.getIdFromToken(token);
        if(!userId){
            throw new Error("message: CommentsService, createComments, not userId")
        }

        const user = await UsersQueryRepository.findUserById(userId)

        let newComment = {
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
        return {
            id: createdComment.id,
            content: createdComment.content,
            commentatorInfo: {
                userId: createdComment.commentatorInfo.userId,
                userLogin: createdComment.commentatorInfo.userLogin
            },
            createdAt: createdComment.createdAt
        }
    },

    async allComments(id: string) {
        return await CommentsRepositories.allComments(id);
    },

    async deleteComments(id:string){
        return await CommentsRepositories.deleteComments(id);
    },

    async updateComment(commentId:string,content:string){
        return await CommentsRepositories.updateComment(commentId,content)
    },

    async removeComment(id: string, userId: string){
        const comment = await CommentsRepositories.allComments(id)

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