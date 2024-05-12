import {
    PostDtoType,
    PostLikeDto,
    PostOutputType, PostsLikesInfoType,
    PostsType,
    PostsViewModelType,
    SortPostRepositoryType
} from "../model/postsType/postsType";
import {getPostsView, postMapper} from "../model/postsType/getPostsView";
//import {connectMongoDb} from "../db/mongo-memory-server/connect-mongo-db";
import {PostLikeModel, PostModel} from "../db/mongoose/models";
import {LikeStatusType} from "../model/commentsType/commentsType";
import {postLikesMapper} from "../model/commentsType/getCommentsView";
import {WithId} from "mongodb";



export const PostsQueryRepository = {

    async getAllPosts(sortData: SortPostRepositoryType, blogId?: string,userId?:string): Promise<PostsViewModelType> {
        let searchKey = {}
        let sortKey = {};
        let sortDirection: number;
        //как искать
        if (blogId) searchKey = {blogId: blogId};

        // есть ли у searchNameTerm параметр создания ключа поиска
        const documentsTotalCount = await PostModel.countDocuments(searchKey); // Receive total count of blogs
        const pageCount = Math.ceil(documentsTotalCount / +sortData.pageSize); // Calculate total pages count according to page size
        const skippedDocuments = (+sortData.pageNumber - 1) * +sortData.pageSize;

        //  имеет ли SortDirection значение "desc", присвойте SortDirection значение -1, в противном случае присвойте 1
        if (sortData.sortDirection === "desc") sortDirection = -1;
        else sortDirection = 1;

        // существуют ли поля, если нет, добавить createdAt
        if (sortData.sortBy === "title") sortKey = {title: sortDirection};
        else if (sortData.sortBy === "shortDescription") sortKey = {shortDescription: sortDirection};
        else if (sortData.sortBy === "content") sortKey = {content: sortDirection};
        else if (sortData.sortBy === "blogId") sortKey = {blogId: sortDirection};
        else if (sortData.sortBy === "blogName") sortKey = {blogName: sortDirection};
        else sortKey = {createdAt: sortDirection};

        // Получать документы из DB
        const posts: PostsType[] = await PostModel
            .find(searchKey)
            .sort(sortKey)
            .skip(+skippedDocuments)
            .limit(+sortData.pageSize)
            .lean();

        const mappedPosts: PostOutputType[] = [];

        for (let i = 0; i < posts.length; i++) {
            console.log(posts[i].id+ "  " + userId);
            const likes = await this.getLikes(posts[i].id, userId);
            mappedPosts.push(postMapper(posts[i], likes));
        }

        return {
            pagesCount: pageCount,
            page: +sortData.pageNumber,
            pageSize: +sortData.pageSize,
            totalCount: documentsTotalCount,
            items: mappedPosts
        };

    },
    // return one post by id
    async getPostById(id: string, userId?: string): Promise<PostOutputType> {

        const post: PostsType | null = await PostModel.findOne({id: id});
        if (!post) throw new Error("not_found");
        const likes = await this.getLikes(id, userId);
        return postMapper(post, likes);
    },
    async getLikes(postId: string, userId: string|null = null): Promise<PostsLikesInfoType> {
        let likeStatus: LikeStatusType = "None";
        console.log(userId);
        if (userId) {
            const userLike = await PostLikeModel.findOne({$and: [{postId: postId}, {likedUserId: userId}]}).lean();
            if (userLike) {
                likeStatus = userLike.status;
            }
        }

        const likesCount = await PostLikeModel.countDocuments({$and: [{postId: postId}, {status: "Like"}]});
        const dislikesCount = await PostLikeModel.countDocuments({$and: [{postId: postId}, {status: "Dislike"}]});
        const newestLikes: Array<PostLikeDto> = await PostLikeModel.find({$and: [{postId: postId}, {status: "Like"}]}).sort({"addedAt": "desc"}).limit(3).lean();

        return {
            likesCount: likesCount,
            dislikesCount: dislikesCount,
            myStatus: likeStatus,
            newestLikes: newestLikes.map(postLikesMapper)
        };
    }


}

