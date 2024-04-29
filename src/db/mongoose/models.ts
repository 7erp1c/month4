import mongoose from "mongoose";
import {
    apiRequestSchema,
    blogSchema,
    commentSchema,
    postSchema,
    refreshTokenSchema,
    securitySchema,
    userSchema
} from "./schemas";


export const UserModel = mongoose.model("users", userSchema);
export const BlogModel = mongoose.model("blogs", blogSchema);
export const PostModel = mongoose.model("posts", postSchema);
export const CommentsModel = mongoose.model("comments", commentSchema);
export const RefreshTokenModel = mongoose.model("refreshTokens", refreshTokenSchema);
export const ApiRequestModel = mongoose.model("apiRequests", apiRequestSchema);
export const SecurityModel = mongoose.model("security", securitySchema);

















// export const CommentLikeModel = mongoose.model("commentsLikes", commentLikeSchema);
// export const PostLikeModel = mongoose.model("postsLikes", postLikeSchema);

