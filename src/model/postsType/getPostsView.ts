import {NewestLikeType, PostDtoType, PostLikeDto, PostOutputType, PostsLikesInfoType, PostsType} from "./postsType";
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
export const postMapper = (post: PostsType, likes: PostsLikesInfoType):PostOutputType  => {
    return {
        id: post.id,
        title: post.title,
        shortDescription: post.shortDescription,
        content: post.content,
        blogId: post.blogId,
        blogName: post.blogName,
        createdAt: post.createdAt,
        extendedLikesInfo: likes
    };
};
