import {NewestLikeType, PostLikeDto, PostOutputType, PostsLikesInfoType, PostsType} from "./postsType";
import {WithId} from "mongodb";


export const getPostsView = (dbPosts: PostsType,): PostsType => {
    return {
        id: dbPosts.id,
        title: dbPosts.title,
        shortDescription: dbPosts.shortDescription,
        content: dbPosts.content,
        blogId: dbPosts.blogId,
        blogName: dbPosts.blogName,
        createdAt: dbPosts.createdAt,
    }
};

