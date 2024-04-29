import {getSecuritySessions, SessionsAddDB} from "./authType";

export const getSessionsView = (dbSessions: SessionsAddDB): getSecuritySessions => {
    return {
        ip: dbSessions.ip,
        title: dbSessions.deviceTitle,
        lastActiveDate: dbSessions.lastActiveDate,
        deviceId: dbSessions.deviceId
    };
};