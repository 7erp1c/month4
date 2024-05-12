import {CommentView, CommentViewOutput, LikesInfoType} from "./commentsType";
import {WithId} from "mongodb";
import {NewestLikeType, PostLikeDto} from "../postsType/postsType";

export const getCommentsView = (dbComments: CommentViewOutput, likes:LikesInfoType): CommentViewOutput => {
    return {
        id: dbComments.id,
        content: dbComments.content,
        commentatorInfo: {
            userId: dbComments.commentatorInfo.userId,
            userLogin: dbComments.commentatorInfo.userLogin
        },
        createdAt: dbComments.createdAt,
        likesInfo:likes
    }
}
export const postLikesMapper =(like:PostLikeDto):NewestLikeType=>{
    return{
        addedAt: like.addedAt,
        userId: like.likedUserId,
        login: like.likedUserName
    };
};