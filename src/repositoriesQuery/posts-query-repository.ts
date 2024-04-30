import {PostsView, PostsViewModelType, SortPostRepositoryType} from "../model/postsType/postsView";
import {getPostsView} from "../model/postsType/getPostsView";
//import {connectMongoDb} from "../db/mongo-memory-server/connect-mongo-db";
import {PostModel} from "../db/mongoose/models";


export const PostsQueryRepository = {

     async getAllPosts(sortData: SortPostRepositoryType, blogId?: string): Promise<PostsViewModelType> {
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
        const posts: PostsView[] = await PostModel.find(searchKey).sort(sortKey).skip(+skippedDocuments).limit(+sortData.pageSize).lean();

        return {
            pagesCount: pageCount,
            page: +sortData.pageNumber,
            pageSize: +sortData.pageSize,
            totalCount: documentsTotalCount,
            items: posts.map(getPostsView)
        };

    },


    // return one post by id
    async getPostById(id: string): Promise<PostsView | null> {
        try {
            const post: PostsView | null = await PostModel.findOne({id},{ projection: { _id: 0 }});
            if (!post) {
                return null;
            }
            return getPostsView(post);
        } catch (err) {
            return null;
        }


    }


}

