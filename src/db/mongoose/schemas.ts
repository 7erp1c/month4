import mongoose from "mongoose";
import {createUserAccAuth} from "../../model/usersType/inputModelTypeUsers";
import {blogsView} from "../../model/blogsType/blogsView";
import {PostsView} from "../../model/postsType/postsView";
import {CommentView} from "../../model/commentsType/commentsView";
import {apiLogSchema, RefreshTokenPayloadType, SessionsAddDB} from "../../model/authType/authType";


export const userSchema = new mongoose
    .Schema<createUserAccAuth>({
        id: {type: String, required: true},
        accountData: {
            login: {type: String, required: true},
            email: {type: String, required: true},
            passwordHash: String,
            createdAt: Date,
        },
        emailConfirmation: {
            confirmationCode: String,
            isConfirmed: {type: String, default: false},
        }
    });

export const blogSchema = new mongoose
    .Schema<blogsView>({
        id: {type: String, required: true},
        name: {type: String, required: true},
        description: {type: String, required: true},
        websiteUrl: {type: String, required: true},
        createdAt: Date,
        isMembership: {type: Boolean, default: false}
    });

export const postSchema = new mongoose
    .Schema<PostsView>({
        id: {type: String, required: true},
        title: {type: String, required: true},
        shortDescription: {type: String, required: true},
        content: {type: String, required: true},
        blogId: {type: String, required: true},
        blogName: String,
        createdAt: Date
    });

export const commentSchema = new mongoose
    .Schema<CommentView>({
        id: {type: String, required: true},
        content: {type: String, required: true},
        postId: {type: String, required: true},
        commentatorInfo: {
            userId: {type: String, required: true},
            userLogin: {type: String, required: true},
        },
        createdAt: Date,

    });

export const refreshTokenSchema = new mongoose
    .Schema<RefreshTokenPayloadType>({
        userId: {type: String, required: true},
        deviceId: {type: String, required: true},
        iat: {type: String, required: true},
        exp: {type: String, required: true},
    });

export const securitySchema = new mongoose
    .Schema<SessionsAddDB>({
        userId: {type: String, required: true},
        deviceId: {type: String, required: true},
        deviceTitle: {type: String, required: true},
        ip: {type: String, required: true},
        lastActiveDate: Date,
        refreshToken: {
            createdAt: {type: Number, required: true},
            expiredAt: {type: Number, required: true},
        }
    });

export const apiRequestSchema = new mongoose
    .Schema<apiLogSchema>({
        IP: String,
        URL: String,
        date: Date,
    });













// export const commentLikeSchema = new mongoose.Schema<CommentLikeDTO>({
//     commentId: String,
//     likedUserId: String,
//     status: String,
// });
//
// export const postLikeSchema = new mongoose.Schema<PostLikeDto>({
//     postId: String,
//     likedUserId: String,
//     likedUserName: String,
//     addedAt: String,
//     status: String,
// });
