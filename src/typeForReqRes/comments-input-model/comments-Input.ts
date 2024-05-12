import {LikeStatusType} from "../../model/commentsType/commentsType";

export type commentsIdPutParams = {
    commentId:string
}

export type commentsPutBodyStatus = {
    likeStatus:LikeStatusType
}
export type commentsPutBodyContent = {
    content:string
}

export type commentsGetParams = {
    id:string
}