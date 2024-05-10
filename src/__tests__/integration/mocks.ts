//
//
// import {EmailAdapter} from "../../adapters/email-adapter";
// import {emailsManager} from "../../composition-root";
// import {EmailsManager} from "../../managers/email-manager";
//
//
// // Создаем объект emailServiceMock, чтобы замокать класс EmailsManager
// export const emailServiceMock: EmailsManager = {
//    // Добавляем emailAdapter с экземпляром EmailAdapter
//     async sendMessageWitchConfirmationCode(email: string, login: string, code: string): Promise<true> {
//         return true;
//     },
//     async emailsManagerRecovery(email: string, code: string): Promise<true> {
//         return true;
//     }
// };