import {createUserAccAuth, UsersInputType} from "../model/usersType/inputModelTypeUsers";
import bcrypt from 'bcrypt'
import {UsersRepository} from "../repositories/usersRepository";
import {ObjectId} from "mongodb";
import {v4 as uuidv4} from "uuid";
import {add} from "date-fns";
import {ResultStatus} from "../_util/enum";
import {Result} from "../model/result.type";



export class UsersService  {
    constructor(protected usersRepository: UsersRepository) {}

//post(user)
    async createUser(login: string,password: string, email: string ): Promise<UsersInputType> {
        const passwordSalt = await bcrypt.genSalt(3)
        const passwordHash = await this._generateHash(password, passwordSalt)
        let newUser: createUserAccAuth = {
            id: new ObjectId().toString(),
            accountData: {
                login: login,
                email: email,
                passwordHash:passwordHash,
                passwordSalt: passwordSalt,
                createdAt: new Date().toISOString()
            },
            emailConfirmation:{
                confirmationCode: uuidv4(),
                expirationDate: add(new Date(),{hours:48}).toISOString(),//дата истечения срока
                isConfirmed: false
            },
            recoveryPassword:{
                recoveryCode: uuidv4(),
                expirationDate: add(new Date(),{hours:48}).toISOString(),//дата истечения срока
                isUsed: false
            }
        }
        const createdUser = await this.usersRepository.createUser(newUser)

        return   {
            id: createdUser.id,
            login: createdUser.accountData.login,
            email: createdUser.accountData.email,
            createdAt: createdUser.accountData.createdAt
        }

    }
    async loginUser(loginOrEmail:string, password:string):Promise<Result<createUserAccAuth| null>> {
        const user = await this.usersRepository.findByLoginOrEmail(loginOrEmail)
        console.log(user, "user")
        if(!user||!user.accountData?.passwordSalt) return {
            status: ResultStatus.Unauthorized,
            errorMessage: 'User was not found by email and login',
            data: null,
        }
        const passwordHash = await this._generateHash(password, user.accountData.passwordSalt)
        if(user.accountData.passwordHash !== passwordHash)return{
            status: ResultStatus.Unauthorized,
            errorMessage: 'User passwordHash not found',
            data: null,
        }

        return{
            status: ResultStatus.Success,
            data: user
        }




    }
    async _generateHash(password: string, salt: string) {
        if (!password || !salt) {
            throw new Error('data and salt arguments required');
        }
        const hash = await bcrypt.hash(password, salt);
        console.log('hash' + hash);
        return hash;
    }
//delete(/id)
    async deleteUser(id: string): Promise<boolean> {
        return await this.usersRepository.deleteUser(id)
    }
//get(id)
    async findUserByLogin(login:string){
        return   await this.usersRepository.findUserByLogin(login)
    }

}

