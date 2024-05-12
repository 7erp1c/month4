import {
    BlogOutputType,
    blogsView,
    BlogViewModelType,
    SearchBlogRepositoryType,
    SortBlogRepositoryType
} from "../model/blogsType/blogsView";
import {getBlogsView} from "../model/blogsType/getBlogsView";
//import {connectMongoDb} from "../db/mongo-memory-server/connect-mongo-db";
import {BlogModel} from "../db/mongoose/models";



export const BlogsQueryRepository = {

     async findFullBlogs(sortData: SortBlogRepositoryType, searchData: SearchBlogRepositoryType): Promise<BlogViewModelType> {
        //Определяются ключи для поиска и сортировки в зависимости от переданных данных.
        let searchKey = {};
        let sortKey = {};
        let sortDirection: number;

        // есть ли у searchNameTerm параметр создания ключа поиска
        if (searchData.searchNameTerm) searchKey = {name: {$regex: searchData.searchNameTerm,$options:"i"}};

        // рассчитать лимиты для запроса к DB
        const documentsTotalCount = await BlogModel.countDocuments(searchKey); // Получите общее количество блогов
        const pageCount = Math.ceil(documentsTotalCount / +sortData.pageSize); // Рассчитайте общее количество страниц в соответствии с размером страницы
        const skippedDocuments = (+sortData.pageNumber - 1) * +sortData.pageSize; // Подсчитать количество пропущенных документов перед запрошенной страницей

        // имеет ли SortDirection значение "desc", присвойте SortDirection значение -1, в противном случае присвойте 1
        if (sortData.sortDirection === "desc") sortDirection = -1;
        else sortDirection = 1;

        // существуют ли поля
        if (sortData.sortBy === "description") sortKey = {description: sortDirection};
        else if (sortData.sortBy === "websiteUrl") sortKey = {websiteUrl: sortDirection};
        else if (sortData.sortBy === "name") sortKey = {name: sortDirection};
        else if (sortData.sortBy === "isMembership") sortKey = {isMembership: sortDirection};
        else sortKey = {createdAt: sortDirection};

        // Получать документы из DB
        const blogs: blogsView[] = await BlogModel.find(searchKey).sort(sortKey).skip(+skippedDocuments).limit(+sortData.pageSize).lean();

        return {
            pagesCount: pageCount,
            page: +sortData.pageNumber,
            pageSize: +sortData.pageSize,
            totalCount: documentsTotalCount,
            items: blogs.map(getBlogsView)
        }
    },

    async getBlogById(id: string): Promise<BlogOutputType> {
        const blog: blogsView|null= await BlogModel.findOne({id: id});
        if (!blog) throw new Error();
        return getBlogsView(blog);
    }


}

