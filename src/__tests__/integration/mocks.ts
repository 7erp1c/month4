import {EmailsManager} from "../../managers/email-manager";

export const emailServiceMock: typeof EmailsManager ={
    async sendMessageWitchConfirmationCode(email:string,login:string,code:string){
        return true
    },
    async EmailsManagerPass(email:string,code:string){
        return true
    }
}