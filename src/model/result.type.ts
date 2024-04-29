import {ResultStatus} from "../_util/enum";

export type Result<T = null> = {
    status: ResultStatus
    errorMessage?: string
    extensions?: [{ field: string, message: string }]
    data: T
}

export type ResultOrVoid = void | Result<null>
