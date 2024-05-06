import {Request} from "express";


export type RequestWithBlogsPOST<T> = Request<{},{},T>

export type RequestWithPostsPOST<T> = Request<{},{},T>

export type RequestWithDelete<T> = Request<T>

export type RequestWithPut<T,B> = Request<T,{},B>
//Users
export type RequestWithUsers<T> = Request<{},{},T>

//comments
export type RequestCommentsPut<T,B> = Request<T,{},B,{}>
export type RequestCommentsGet<T> = Request<T>