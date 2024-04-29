import {blogsView} from "./blogsView";

export const getBlogsView = (dbBlogs: blogsView): blogsView => {
    return {
        id: dbBlogs.id,
        name: dbBlogs.name,
        description: dbBlogs.description,
        websiteUrl: dbBlogs.websiteUrl,
        createdAt: dbBlogs.createdAt,
        isMembership: dbBlogs.isMembership,

    }
}