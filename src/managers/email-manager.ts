import {EmailAdapter} from "../adapters/email-adapter";



export const EmailsManager = {
    async sendMessageWitchConfirmationCode(email: string, login: string, code: string) {
//отправку сообщения лучше обернуть в try-catch, чтобы при ошибке(например отвалиться отправка) приложение не падало
        try {
            await EmailAdapter.sendEmail(//отправить сообщение на почту юзера с кодом подтверждения
                email,
                login,
                code
            )

        } catch (e: unknown) {
            console.error('Send email error', e); //залогировать ошибку при отправке сообщения
        }
        return true

    },

    async EmailsManagerPass(email: string, code:string) {
      //отправку сообщения лучше обернуть в try-catch, чтобы при ошибке(например отвалиться отправка) приложение не падало
        try {
            await EmailAdapter.sendPassOnEmail(//отправить сообщение на почту юзера с кодом подтверждения
                email,
                code
            )
        } catch (e: unknown) {
            console.error('Send email error', e); //залогировать ошибку при отправке сообщения
        }
        return true
    }
}
