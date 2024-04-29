import {MongoMemoryServer} from "mongodb-memory-server";
import {connectMongoDb} from "../../db/connect-mongo-db";
import {AuthService} from "../../domain/auth-service";
import {EmailsManager} from "../../managers/email-manager";
import {testSeader} from "../e2e/utils/test.seader";
import {UsersService} from "../../domain/users-service";
import {UsersQueryRepository} from "../../repositoriesQuery/user-query-repository";
import {delay} from "../e2e/utils/timer";

describe("AuthTest-integration", () => {
    beforeAll(async () => {
        const mongoServer = await MongoMemoryServer.create()
        await connectMongoDb.run(mongoServer.getUri())

    })
    beforeEach(async () => {
        await connectMongoDb.drop()
    })
    afterAll(async () => {
        await connectMongoDb.drop();
        //await client.close();
        // await connectMongoDb.stop(); если заюзали MongoMemoryServer
    })
    afterAll((done) => done())//гарант качества окончания тестов😁
    describe('User registration', () => {
        const registerUserCase = AuthService.createUser //проверяем создание User

        //EmailsManager.sendMessageWitchConfirmationCode = emailServiceMock.sendMessageWitchConfirmationCode//мокаем отправку на мыло, в моке возвразаем true(используем если мы не профессионалы😂)
        //EmailsManager.sendMessageWitchConfirmationCode = jest.fn() //  если функция должна отработать, ничего не передавая и не принимая
        EmailsManager.sendMessageWitchConfirmationCode = jest.fn().mockImplementation((email: string, login: string, code: string) => {
            return true
        })
        // UsersQueryRepository.findUserByIdAllModel = jest.fn().mockImplementation((registerUserCase.id) =>{
        //     return true
        // })
        it('should create user witch correct data', async () => {
            const {login, password, email} = testSeader.createUserDto()

            const result = await registerUserCase(login, password, email)

            expect(result).toEqual({
                    id: expect.any(String),
                    login,
                    email,
                    createdAt: expect.any(String)
                }
            )
            expect(EmailsManager.sendMessageWitchConfirmationCode).toBeCalled()//что метод был вызван
            expect(EmailsManager.sendMessageWitchConfirmationCode).toBeCalledTimes(1)//сколько раз вызван
            // expect(UsersQueryRepository.findUserByIdAllModel).toBeCalled()//что метод был вызван
            // expect(UsersQueryRepository.findUserByIdAllModel).toBeCalledTimes(1)//сколько раз вызван
        })
        it('should not register user twice ', async () => {
            const {login, password, email} = testSeader.createUserDto()
            await testSeader.registerUser({login, password, email})

            const result = await registerUserCase(login, password, email)

            expect(result).toBe(null)

        })
    })


})