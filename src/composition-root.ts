import {UsersRepository} from "./repositories/usersRepository";
import {UsersService} from "./domain/users-service";
import {UsersController} from "./router/controllers/user-controller";
import {UsersQueryRepository} from "./repositoriesQuery/user-query-repository";
import {EmailAdapter} from "./adapters/email-adapter";
import {EmailsManager} from "./managers/email-manager";
import {AuthController} from "./router/controllers/auth-controller";
import {AuthService} from "./domain/auth-service";
import {RefreshTokenRepository} from "./repositories/refreshTokenRepository";
import {JwtService} from "./application/jwt-service";
import {SecurityService} from "./domain/security/security-service";
import {SecurityQueryRepository} from "./repositoriesQuery/security-query-repository";
import {SecurityRepository} from "./repositories/securityRepository";
import {SecurityController} from "./router/controllers/security-controller";
//SECURITY


//USERS
export const usersRepository = new UsersRepository()
export const usersQueryRepository = new UsersQueryRepository()
export const usersService = new UsersService(usersRepository)
export const usersController = new UsersController(usersService,usersQueryRepository)
//AUTH
export const authService = new AuthService(usersService,usersRepository,usersQueryRepository)
export const authController = new AuthController(authService,usersQueryRepository)
//SECURITY
export const securityRepository = new SecurityRepository()
export const securityQueryRepository = new SecurityQueryRepository()
export const securityService = new SecurityService(securityRepository,securityQueryRepository)
export const securityController = new SecurityController(securityQueryRepository,securityService)
//JWT
export const refreshTokenRepository = new RefreshTokenRepository()
export const jwtService = new JwtService(refreshTokenRepository,securityService)
//EMAIL
export const emailAdapter = new EmailAdapter()
export const emailsManager = new EmailsManager(emailAdapter)
