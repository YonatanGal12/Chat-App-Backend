import { Injectable } from "@nestjs/common";
import { DatabaseService } from "src/database/database.service";

@Injectable()
export class MessageService{

    constructor(private databaseService: DatabaseService){}

    async createMessage(content: string, userId: number, chatId: number){
        
        const message = await this.databaseService.message.create({
            data:{
                content,
                userId,
                chatId
            },
            include:{
                user: true,
                chat: true
            }
        })

        return message;
    }

}