import {PostsView} from "./postsView";


export const getPostsView = (dbPosts: PostsView): PostsView => {
    return {
        id: dbPosts.id,
        title: dbPosts.title,
        shortDescription: dbPosts.shortDescription,
        content: dbPosts.content,
        blogId: dbPosts.blogId,
        blogName: dbPosts.blogName,
        createdAt: dbPosts.createdAt

    }
};