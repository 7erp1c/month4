import {PostsView} from "../model/postsType/postsView";
import {getPostsView} from "../model/postsType/getPostsView";
import {
    CommentsViewModelType,
    CommentView,
    SortCommentsRepositoryType
} from "../model/commentsType/commentsView";
import {getCommentsView} from "../model/commentsType/getCommentsView";
import {connectMongoDb} from "../db/connect-mongo-db";


export const CommentsQueryRepository = {

    async getAllCommentsWithPosts(sortData: SortCommentsRepositoryType, postId?: string): Promise<CommentsViewModelType> {
        let searchKey = {}
        let sortKey = {};
        let sortDirection: number;
        //как искать
        if (postId) searchKey = {postId: postId};

        // есть ли у searchNameTerm параметр создания ключа поиска
        const documentsTotalCount = await connectMongoDb.getCollections().commentsCollection.countDocuments(searchKey); // Receive total count of comments
        const pageCount = Math.ceil(documentsTotalCount / +sortData.pageSize); // Calculate total pages count according to page size
        const skippedDocuments = (+sortData.pageNumber - 1) * +sortData.pageSize;

        //  имеет ли SortDirection значение "desc", присвойте SortDirection значение -1, в противном случае присвойте 1
        if (sortData.sortDirection === "desc") sortDirection = -1;
        else sortDirection = 1;

        // существуют ли поля, если нет, добавить createdAt
        if (sortData.sortBy === "content") sortKey = {content: sortDirection};
        else if (sortData.sortBy === "commentatorInfo") sortKey = {commentatorInfo: sortDirection};
        else if (sortData.sortBy === "commentatorInfo.userId") sortKey = {userId: sortDirection};
        else if (sortData.sortBy === "commentatorInfo.userLogin") sortKey = {userLogin: sortDirection};
        else sortKey = {createdAt: sortDirection};

        // Получаем comments из DB
        const comments: CommentView[] = await connectMongoDb.getCollections().commentsCollection.find(searchKey).sort(sortKey).skip(+skippedDocuments).limit(+sortData.pageSize).toArray();

        return {
            pagesCount: pageCount,
            page: +sortData.pageNumber,
            pageSize: +sortData.pageSize,
            totalCount: documentsTotalCount,
            items: comments.map(getCommentsView)
        };

    },
    // return one post by id
    async getPostById(id: string): Promise<PostsView | null> {
        try {
            const post: PostsView | null = await connectMongoDb.getCollections().postCollection.findOne({id},{ projection: { _id: 0 }});
            if (!post) {
                return null;
            }
            return getPostsView(post);
        } catch (err) {
            return null;
        }
    }
}

