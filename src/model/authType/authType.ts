import {ObjectId} from "mongodb";
import {v4 as uuidv4} from "uuid";
import {add} from "date-fns";

export type authView = {
    loginOrEmail: string,
    password: string
    ip:string
}

export type getAuthTypeEndpointMe = {
    email: string,
    login: string,
    userId: string
}
export type twoTokenType = {
    access: string
    refresh: string
}
export type LoginData = {
    loginOrEmail: string,
    password: string,
    ip: string,
    deviceTitle: string
}
export interface OldTokenDB {
    oldToken: string,
    userId?: string,
    deviceId?: string,
    isValid: boolean
}

export type apiLogSchema = {
    IP: string,
    URL: string,
    date: Date
}
export type RefreshTokenPayloadType = {
    userId: string
    deviceId: string
    iat: string
    exp: string
}
export type SessionsAddDB = {
    userId: string,
    deviceId: string,
    deviceTitle: string,
    ip: string,
    lastActiveDate: string,
    refreshToken: {
        createdAt: string,
        expiredAt: string,
    }
}
export type getSecuritySessions = {
    ip: string,
    title: string,
    lastActiveDate: string,
    deviceId: string
}