import { query } from "express-validator";
export const paginatorValidator = [
 query("pageNumber").toInt().default(1),
 query("pageSize").toInt().default(10),
 query("sortBy").default("createdAt")
]