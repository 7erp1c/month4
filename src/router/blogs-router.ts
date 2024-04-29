import {Request, Response, Router} from "express";
import {_delete_all_, blogsCreateAndPutModel} from "../typeForReqRes/blogsCreateAndPutModel";
import {
    RequestWithBlogsPOST,
    RequestWithDelete,
    RequestWithPut
} from "../typeForReqRes/helperTypeForReq";
import {BlogsService} from "../domain/blogs-service";
import {authGuardMiddleware} from "../middleware/authGuardMiddleware";
import {errorsValidation} from "../middleware/errorsValidation";
import {blogPostValidation, blogsValidation} from "../middleware/inputValidationMiddleware";
import {postCreateForBlog, postsCreateAndPutModel} from "../typeForReqRes/postsCreateAndPutModel";
import {PostsService} from "../domain/posts-service";
import {QueryBlogRequestType, SearchBlogRepositoryType, SortBlogRepositoryType} from "../model/blogsType/blogsView";
import {BlogsQueryRepository} from "../repositoriesQuery/blogs-query-repository";
import {ParamsId, SortPostRepositoryType} from "../model/postsType/postsView";
import {PostsQueryRepository} from "../repositoriesQuery/posts-query-repository";


export const blogsRouter = Router({})
blogsRouter.get('/', async (req: RequestWithBlogsPOST<QueryBlogRequestType>, res: Response) => {
    const query: QueryBlogRequestType = req.query
    const sortData: SortBlogRepositoryType = {
        sortBy: query.sortBy || "createdAt",
        sortDirection: query.sortDirection || "desc",
        pageNumber: query.pageNumber || 1,
        pageSize: query.pageSize || 10
    }
    const searchData: SearchBlogRepositoryType = {
        searchNameTerm: query.searchNameTerm || null
    }
    const blogs = await BlogsQueryRepository.findFullBlogs(sortData, searchData);
    if (!blogs) {
        res.sendStatus(404);
        return
    }
    res.status(200).json(blogs);
})

blogsRouter.post('/', authGuardMiddleware, blogsValidation, errorsValidation,
    async (req: RequestWithBlogsPOST<blogsCreateAndPutModel>, res: Response) => {
        const newBlogsFromRep = await BlogsService.createBlogs(req.body.name, req.body.description, req.body.websiteUrl)
       if(newBlogsFromRep) {
            res.status(201).send(newBlogsFromRep)
       }
    })

blogsRouter.get('/:blogId/posts', async (req: RequestWithPut<ParamsId, postsCreateAndPutModel>, res: Response) => {
    const blogId = req.params.blogId
    const query: QueryBlogRequestType = req.query
        const sortData: SortPostRepositoryType = {
            sortBy: query.sortBy || "createdAt",
            sortDirection: query.sortDirection || "desc",
            pageNumber: query.pageNumber || 1,
            pageSize: query.pageSize || 10
        }
    const posts = await PostsQueryRepository.getAllPosts(sortData, req.params.blogId);

    const blog = await BlogsService.findBlogsByID(blogId);
    if (!blog) {
        res.sendStatus(404); // Возвращаем статус 404, если blogId не найден
        return;
    }
        return res.status(200).json(posts);
    })

blogsRouter.post('/:blogId/posts', authGuardMiddleware, blogPostValidation, errorsValidation,
    async (req: RequestWithPut<postCreateForBlog, postsCreateAndPutModel>, res: Response) => {
        const {title, shortDescription, content} = req.body;
        const blogId = req.params.blogId;
        // process.env.BLOG_ID = blogId.toString()

        const blog = await BlogsService.findBlogsByID(blogId);
        if (!blog) {
            res.sendStatus(404); // Возвращаем статус 404, если blogId не найден
            return;
        }
        const newPostForBlog = await PostsService.createPosts(title, shortDescription, content, blogId)
        res.status(201).send(newPostForBlog)

    })
blogsRouter.get('/:id', async (req: Request, res: Response) => {
    const foundBlogsFromRep = await BlogsService.findBlogsByID(req.params.id)
    if (!foundBlogsFromRep) {
        res.sendStatus(404)
        return;
    } else {
        res.send(foundBlogsFromRep)
        return;
    }
})


blogsRouter.put('/:id', authGuardMiddleware, blogsValidation, errorsValidation, async (req: Request, res: Response) => {
    const isUpdateBlogs = await BlogsService.updateBlogs(req.params.id, req.body.name, req.body.description, req.body.websiteUrl)
    if (isUpdateBlogs) {
        res.status(204).send()
        return
    }
    if (!isUpdateBlogs) {
        res.status(404).send()
        return
    }
})

blogsRouter.delete('/:id', authGuardMiddleware,errorsValidation, async (req: RequestWithDelete<_delete_all_>, res: Response) => {

    const isDelete = await BlogsService.deleteBlogs(req.params.id)
    if (isDelete) {
        res.sendStatus(204);
        return
    } else {
        res.sendStatus(404);
        return
    }
})


