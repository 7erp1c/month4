import {ObjectId} from "mongodb";
import {CommentsRepositories} from "../repositories/commentsRepository";
import {CommentLikeDTO, CommentView, CommentViewOutput, LikeStatusType} from "../model/commentsType/commentsType";
import {UsersQueryRepository} from "../repositoriesQuery/user-query-repository";
import {ResultStatus} from "../_util/enum";
import {CommentsQueryRepository} from "../repositoriesQuery/comments-query-repository";
import {Result} from "../_util/result.type";
import {PostsService} from "./posts-service";
import {usersQueryRepository} from "../composition-root";


export const CommentsService = {
    async createLikeComment(commentId: string, status: LikeStatusType, userId: string) {

        const updateModel: CommentLikeDTO = {
            commentId: commentId,
            likedUserId: userId,
            status: status
        };
        await CommentsRepositories.updateCommentLike(updateModel);
    },
    async createComments(content: string, postId: string, userId: string): Promise<Result<CommentViewOutput | null>> {
        const foundPostsFromRep = await PostsService.findPostsByID(postId)
        if (!foundPostsFromRep) return {
            status: ResultStatus.NotFound,
            extensions: [{field: "foundPostsFromRep(createComments)", message: "Post not found"}],
            data: null
        }
        const user = await usersQueryRepository.findUserById(userId)
        if (!user.data) return {
            status: ResultStatus.NotFound,
            extensions:[{field:"user(createComments)",message:"User not found"}],
            data: null
        }
        let newComment: CommentView = {
            id: new ObjectId().toString(),
            content: content,
            commentatorInfo: {
                userId: user.data.userId!,
                userLogin: user.data.login
            },
            createdAt: new Date().toISOString(),
            postId: postId

        }
        const createdComment = await CommentsRepositories.createComments(newComment)
        if (!createdComment) return {
            status: ResultStatus.NotFound,
            extensions:[{field:"createdComment(createComments)",message:"Comment not create"}],
            data: null
        }
        const returnCommentWithLike = await CommentsQueryRepository
            .getCommentById(createdComment.id, createdComment.commentatorInfo.userId);
        if (!returnCommentWithLike) return {
            status: ResultStatus.NotFound,
            extensions:[{field:"returnCommentWithLike(createComments)",message:"Comment witch likes not found"}],
            data: null
        }
        return {
            status: ResultStatus.Success,
            data: returnCommentWithLike
        }

    },

    async OneCommentById(id: string) {
        return await CommentsRepositories.OneCommentsById(id);
    },

    async getCommentWitchLikes(id: string, userId: string): Promise<Result<CommentViewOutput | null>> {
        const result = await CommentsQueryRepository.getCommentById(id, userId)
        if (!result) return {
            status: ResultStatus.NotFound,
            extensions: [{field: "result", message: "Comment witch likes not found"}],
            data: null
        }
        return {
            status: ResultStatus.Success,
            data: result
        }
    },

    async deleteComments(id: string, userId: string): Promise<Result<boolean | null>> {

        const findCommentId = await this.OneCommentById(id)

        if (!findCommentId) return {
            status: ResultStatus.NotFound,
            extensions: [{field: "findCommentId", message: "Comment not found"}],
            data: null
        }
        if (userId !== findCommentId.commentatorInfo.userId) return {
            status: ResultStatus.Forbidden,
            extensions: [{
                field: 'user !== findCommentId.commentatorInfo.userId',
                message: 'You are not find your comment'
            }],
            data: false
        }
        //deleted:
        const deleteComment = await CommentsRepositories.deleteComments(id);
        if (!deleteComment) return {
            status: ResultStatus.NotFound,
            extensions: [{field: "deleteComment", message: "Comment not found, not deleted"}],
            data: null
        }
        return {
            status: ResultStatus.NoContent,
            data: true
        }
    },

    async updateComment(commentId: string, content: string, userid: string): Promise<Result<boolean | null>> {
        const idComments = await this.OneCommentById(commentId)
        if (!idComments) return {
            status: ResultStatus.NotFound,
            extensions: [{field: 'idComments', message: 'The comment was not found'}],
            data: false
        }
        if (userid !== idComments.commentatorInfo.userId) return {
            status: ResultStatus.Forbidden,
            extensions: [{
                field: 'user !== idComments.commentatorInfo.userId',
                message: 'You are not updating your comment'
            }],
            data: false
        }

        const updateComment = await CommentsRepositories.updateComment(commentId, content)
        if (!updateComment) return {
            status: ResultStatus.NotFound,
            extensions: [{field: 'idComments', message: 'The comment was not found'}],
            data: false
        }

        return {
            status: ResultStatus.Success,
            data: true
        }
    },

    async removeComment(id: string, userId: string) {
        const comment = await CommentsRepositories.OneCommentsById(id)

        if (!comment) return {
            status: ResultStatus.NotFound,
            errorMessage: 'Comment not found',
            data: null,
        }

        if (comment.commentatorInfo.userId !== userId) return {
            status: ResultStatus.Forbidden,
            errorMessage: 'Comment is not in our own',
            data: null,
        }

        const isDeleted = await CommentsRepositories.deleteComments(id);

        if (!isDeleted) return {
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