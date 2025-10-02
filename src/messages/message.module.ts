import { Module } from "@nestjs/common";
import { MessageService } from "./messages.service";
import { DatabaseModule } from "src/database/database.module";

@Module({
    imports: [DatabaseModule],
    providers: [MessageService],
    exports: [MessageService]
})
export class MessagesModule{}