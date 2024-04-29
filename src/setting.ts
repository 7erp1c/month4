export const settings ={
    JWT_SECRET: process.env.JWT_SECRET || "123",

    interval: 10, // interval in seconds
    count:5 // count of requests in interval
}

export const appConfig = {
    DB_NAME: "DataBase"
};

export const expiresIn = {
    accessTime: "1000s",
    refreshTime: "2000s"
};

