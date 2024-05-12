export type authInput = {
    loginOrEmail: string
    password: string
    ip:string
}
export type authInputEmail = {
    email:string
}
export type authInputRecovery = {
    newPassword:string
    recoveryCode:string
}
export type authInputRegistration = {
    login:string
    email:string
    password:string
}
export type authInputCode = {
    code:string
}