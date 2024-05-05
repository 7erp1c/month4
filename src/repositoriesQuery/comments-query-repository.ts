import { PostsType} from "../model/postsType/postsType";
import {getPostsView} from "../model/postsType/getPostsView";
import {
    CommentsViewModelType, CommentViewOutput, LikesInfoType, LikeStatusType,
    SortCommentsRepositoryType
} from "../model/commentsType/commentsType";
import {getCommentsView} from "../model/commentsType/getCommentsView";
import {CommentLikeModel, CommentsModel, PostLikeModel, PostModel} from "../db/mongoose/models";



export const CommentsQueryRepository = {

    async getAllCommentsWithPosts(sortData: SortCommentsRepositoryType, postId?: string,userId?:string): Promise<CommentsViewModelType> {
        let searchKey = {}
        let sortKey = {};
        let sortDirection: number;
        //как искать
        if (postId) searchKey = {postId: postId};

        // есть ли у searchNameTerm параметр создания ключа поиска
        const documentsTotalCount = await CommentsModel.countDocuments(searchKey); // Receive total count of comments
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
        const comments = await CommentsModel
            .find(searchKey)
            .sort(sortKey)
            .skip(+skippedDocuments)
            .limit(+sortData.pageSize)
            .lean();

        const mappedComments:CommentViewOutput[]=[];

        for (let i= 0; i<comments.length; i++){
            const likes:LikesInfoType = await this.getLikes(comments[i].id.toString(), userId);
            mappedComments.push(getCommentsView(comments[i], likes));
        }
        return {
            pagesCount: pageCount,
            page: +sortData.pageNumber,
            pageSize: +sortData.pageSize,
            totalCount: documentsTotalCount,
            items: mappedComments
        };

    },
    // return one post by id
    async getPostById(id: string): Promise<PostsType | null> {
        try {
            const post: PostsType | null = await PostModel.findOne({id},{ projection: { _id: 0 }});
            if (!post) {
                return null;
            }
            return getPostsView(post);
        } catch (err) {
            return null;
        }
    },
    async getLikes(commentId:string, userId?:string):Promise<LikesInfoType>{
        let likeStatus:LikeStatusType = "None";

        if (userId) {
            const userLike = await CommentLikeModel.findOne({$and: [{commentId: commentId}, {likedUserId: userId}]}).lean();
            if (userLike) {
                likeStatus = userLike.status;
            }
        }

        const likesCount =  await CommentLikeModel.countDocuments({$and: [{commentId: commentId}, {status:"Like"}]});
        const dislikesCount =  await CommentLikeModel.countDocuments({$and: [{commentId: commentId}, {status:"Dislike"}]});
        return 	{
            likesCount: likesCount,
            dislikesCount: dislikesCount,
            myStatus: likeStatus
        };
    }
}

