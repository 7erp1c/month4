import {Request} from "express";
//Auth
export type RequestWithAuth<T> = Request<{},{},T>
//Blog&Posts
export type RequestWithBlogsPOST<T> = Request<{},{},T>
export type RequestWithPut<T,B> = Request<T,{},B>
//Users
export type RequestWithUsers<T> = Request<{},{},T>
//Posts
export type RequestWithPostsPOST<T> = Request<{},{},T>
export type RequestPostsComments<T,B> = Request<T,{},{},B>
//comments
export type RequestCommentsPut<T,B> = Request<T,{},B,{}>
export type RequestCommentsGet<T> = Request<T>
//ALL
export type RequestWithDelete<T> = Request<T>