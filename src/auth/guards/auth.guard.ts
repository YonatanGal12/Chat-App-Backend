import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class AuthGuard implements CanActivate{

    constructor(private jwtService: JwtService) {}

    async canActivate(context: ExecutionContext){
        const request = context.switchToHttp().getRequest();
        const authorization = request.headers.authorization; //Bearer <token>
        const token = authorization?.split(' ')[1];
        
        if(!token)
            throw new UnauthorizedException("Token not sent.");

        try{
            const tokenPayload = await this.jwtService.verifyAsync(token);
            request.user = {
                userId: tokenPayload.sub,
                userName: tokenPayload.userName
            }
            return true;
        }
        catch{
            throw new UnauthorizedException("Token invalid.");
        }
    }
}