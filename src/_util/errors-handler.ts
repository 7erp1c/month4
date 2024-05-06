import {Response} from "express";


export const newError = (message: string) => {
	const err = new Error();
	err.message = message;
	return err;
};
export const errorsHandler = (res: Response, err: any) => {
	res.status(404).send("If comment with specified id doesn't exists");
};
export const ERRORS = {
	NOT_FOUND_404: "not_found",
	BAD_REQUEST_400: "bad_request"
};
