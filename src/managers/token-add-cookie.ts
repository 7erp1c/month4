import {Response} from "express";
export const addTokenInCookie = (res:Response, refreshToken:string)=>{
    res.cookie('refreshToken', refreshToken, {httpOnly: true, secure: true})//передаем в cookie token
}
module.exports = {
    addTokenInCookie
};