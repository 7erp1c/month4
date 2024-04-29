import { NextFunction, Request, Response,} from "express";
import { validationResult} from "express-validator";




export const errorsValidation = async (req:Request, res:Response, next:NextFunction) => {

        const errors =  validationResult(req);
        const errorMessages: { message: string, field: string}[]=[];
        if(!errors.isEmpty()){
            errors.array({onlyFirstError:true}).forEach((error) => {
                errorMessages.push({ message: 'Bad request',  field: error.type === 'field'? error.path: 'not found field' });
            })
            return res.status(400).json({ errorsMessages: errorMessages });
        }

    return next()
}

