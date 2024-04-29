import {UsersInputType} from "../usersType/inputModelTypeUsers";
import {getAuthTypeEndpointMe} from "./authType";


export const convertToGetAuthType = (userAuth: UsersInputType): getAuthTypeEndpointMe => {
    return {
        email: userAuth.email,
        login: userAuth.login,
        userId: userAuth.id
    };
};


