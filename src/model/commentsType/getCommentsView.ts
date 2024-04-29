import {CommentView, CommentViewOutput} from "./commentsView";

export const getCommentsView = (dbComments: CommentViewOutput): CommentViewOutput => {
    return {
        id: dbComments.id,
        content: dbComments.content,
        commentatorInfo: {
            userId: dbComments.commentatorInfo.userId,
            userLogin: dbComments.commentatorInfo.userLogin
        },
        createdAt: dbComments.createdAt
    }
}