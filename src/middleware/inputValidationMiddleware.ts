import {body} from "express-validator";
import {UsersService} from "../domain/users-service";
import {UsersQueryRepository} from "../repositoriesQuery/user-query-repository";
import {BlogModel} from "../db/mongoose/models";
import {UsersRepository} from "../repositories/usersRepository";
import {usersQueryRepository, usersRepository, usersService} from "../composition-root";


export const blogsValidation = [
    body('name').trim().isString().isLength({min: 1, max: 15}),
    body('description').trim().isString().isLength({min: 1, max: 500}),
    body('websiteUrl').trim().isString().isLength({min: 1, max: 100})
        .matches(new RegExp("^https://([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$")).bail()
// body('createdAt').isString()
//     .matches(new RegExp("^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}.\\d{3}Z$"))
]
export const postsValidation = [
    body('title').trim().isString().isLength({min: 1, max: 30}).bail(),
    body('shortDescription').trim().isString().isLength({min: 1, max: 100}).bail(),
    body('content').trim().isString().isLength({min: 1, max: 1000}).bail(),
    body('blogId').trim().isString().custom(
        async (value) => {
            const blog = await BlogModel.findOne({id: value});
            if (!blog) {
                throw new Error("Blog not found");
            }
            return value;
        }
    ).bail()

]
export const blogPostValidation = [
    body('title').trim().isString().isLength({min: 1, max: 30}).bail(),
    body('shortDescription').trim().isString().isLength({min: 1, max: 100}).bail(),
    body('content').trim().isString().isLength({min: 1, max: 1000}).bail(),
]
export const usersValidation = [
    body('login').trim().isString().isLength({min: 3, max: 10}).custom(async (value) => {
        const findUserByLogin = await usersService.findUserByLogin(value)
        if (!findUserByLogin) {
            return value
        }
        throw new Error("User with this login already exists");

    }).bail(),
    body('email').trim().isString()
        .matches(new RegExp("^[\\w\\.\\-]+@[\\w\\.\\-]+\\.[a-zA-Z]{2,4}$"))
        .custom(async (value) => {
            const findUserByEmail = await usersQueryRepository.findUserByEmail(value)
            if (!findUserByEmail) {
                return value
            }
            throw new Error("User with this email already exists");

        }).bail(),
    body('password').trim().isString().isLength({min: 6, max: 20}).matches(new RegExp("^[a-zA-Z0-9_-]*$")).bail()
]

export const authValidation = [
    body('loginOrEmail').notEmpty().trim().isString().bail(),
    body('password').notEmpty().trim().isString().bail()
]
export const authEmailValidation = [
    body('email')
        .custom(async (value) => {
            const user = await usersRepository.findByLoginOrEmail(value)
            if (!user||user.emailConfirmation?.isConfirmed) {
                throw new Error("User not found");
            }
            return value
        }),

]
export const authCodeValidation = [
    body('code').notEmpty().trim().isString().bail(),
]

export const commentValidation = [
    body("content").trim().notEmpty().isString().isLength({min: 20, max: 300}).bail()
]
export const commentValidationLikes = [
    body("likeStatus").trim().isString().notEmpty().isIn(["None", "Like","Dislike"]).bail()
]

export const passRecValidation =[
    body("email").trim().isString().matches(new RegExp("^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$")).bail()
]
export const newPasswordValid =[
    body("newPassword").trim().isString().isLength({max:20,min: 6}).bail(),
    body("recoveryCode").trim().notEmpty().isString().isLength({min: 30}).bail()
]


