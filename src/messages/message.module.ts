import { Module } from "@nestjs/common";
import { MessageService } from "./messages.service";

@Module({
    providers: [MessageService],
    exports: [MessageService]
})
export class MessagesModule{}