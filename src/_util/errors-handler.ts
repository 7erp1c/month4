import {Response} from "express";


export const newError = (message: string) => {
	const err = new Error();
	err.message = message;
	return err;
};
export const errorsHandler404 = (res: Response, err: any) => {
	res.sendStatus(404)
};
export const errorsHandler400 = (res: Response, err: any) => {
	res.sendStatus(400)
};
export const ERRORS = {
	NOT_FOUND_404: "not_found",
	BAD_REQUEST_400: "bad_request"
};
