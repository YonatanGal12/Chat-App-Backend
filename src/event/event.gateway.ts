import { ConnectedSocket, MessageBody, OnGatewayConnection, 
    OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket }  from 'socket.io'
import { NewGCDto, type MessageDto } from "./event.dto";
import { UsersService } from "src/users/users.service";
import { DatabaseService } from "src/database/database.service";
import { JwtService } from '@nestjs/jwt';
import { Client } from "node_modules/socket.io/dist/client";
import { ChatService } from "src/chats/chat.service";
import { UsePipes, ValidationPipe } from "@nestjs/common";
import { MessageService } from "src/messages/messages.service";
import { MessagesModule } from "src/messages/message.module";


@WebSocketGateway({namespace: 'chat', cors: { origin: "http://localhost:5173", credentials: true}})
export class EventGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect{

    @WebSocketServer()
    server: Server;

    constructor(private userService: UsersService,
                private databaseSerive: DatabaseService, 
                private jwtService: JwtService,
                private chatService: ChatService,
                private messageService: MessageService) {}



    afterInit(server: Server) {
        console.log(`Server running`)
    }

    async handleConnection(client: Socket) {

        const token = client.handshake.auth?.token;
        if (!token) {
            console.log("Client tried to connect without a token, disconnecting...");
            client.disconnect();
            return;
        }

        try{
            const payload = await this.jwtService.verifyAsync(token, {
                secret: process.env.JWT_ACCESS_TOKEN_SECRET,
            });

            const user = await this.userService.findUserById(payload.sub);
            if (!user) 
                throw new Error("User not found");

            client.join(user.id.toString());

            client.data.userId = user.id;

            await this.userService.updateUser(user.id,{ isLoggedIn:true })
            
            user.chatMembers.forEach(m => {
                client.join(m.chat.chatName);
            });

            console.log(`User ${user.userName} connected and joined rooms: ${user.chatMembers.map(m => m.chat.chatName)}`);

            const userName = user.userName;
            client.emit('getUsername', userName);

            const groupchats = await this.chatService.getAllChatsForUser(user.id);
            client.emit('userGroupchats', groupchats);      
        }
        catch(error)
        {
            client.emit("authError", { message: "Invalid or expired token" });
            client.disconnect();
        }
    }

    async handleDisconnect(client: Socket) {
        console.log(`Client disconnected: ${client.id}`);
        const userId = client.data.userId;
        if (!userId) {
            console.warn(`No userId for socket ${client.id}, skipping logout update`);
            client.disconnect();
            return;
        }
        await this.userService.updateUser(userId,{ isLoggedIn: false })
        client.disconnect();
        this.server.emit('userDisonnected', client.id);
    }

    @SubscribeMessage('newMessage')
    async handleNewMessage(@MessageBody() messageDto: MessageDto, @ConnectedSocket() client: Socket)
    {
        console.log(`Message from ${client.id}: to room: ${client.data.currentChatName}`);

        const chatId = await this.chatService.getChatIdByName(client.data.currentChatName);
        await this.messageService.createMessage(messageDto.content, client.data.userId, chatId);

        const name = client.data.currentChatName;
        const messages = await this.chatService.getAllMessagesFromChat(name);

        const user = await this.userService.findUserById(client.data.userId);
        const username = user?.userName;

        const sockets = await this.server.in(name).fetchSockets();
        for(const socket of sockets)
        {
            socket.data.currentChatName === name ? socket.emit("recieveMessage",{username,messages}) : socket.emit("notification",name);
        }
    }

    @SubscribeMessage('getAllUsernames')
    async handleGetAllUsernames(@ConnectedSocket() client: Socket)
    {
        const users = await this.userService.findAllUsers();
        const usernames = users.map(user => user.userName);
        client.emit('getAllUsernames', usernames);
    }

    @SubscribeMessage('newGCCreated')
    @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
    async handleNewGroupChatCreated(@MessageBody() newGCDto: NewGCDto, @ConnectedSocket() client: Socket)
    {
        if(newGCDto.name === " ")
        {
            console.log("Name cannot be empty");
            return;
        }
        if(newGCDto.name.length > 50)
        {
            console.log("Name too long.");
            return;
        }
        const users = await this.userService.findUsersByUserNames(newGCDto.users);
        const userIds = users.map(u => ({userId: u.id}))
        const chat = await this.databaseSerive.chat.create({
            data: {
                chatName: newGCDto.name,
                chatMembers: {
                    create: userIds
                }
            },
            include: {
                chatMembers: true
            }
        })

        for(const user of users){
            this.server.to(user.id.toString()).socketsJoin(newGCDto.name);
            const groupchats = await this.chatService.getAllChatsForUser(user.id);
            this.server.to(user.id.toString()).emit("userGroupchats",groupchats);
        }
        
    }

    @SubscribeMessage('getUserGroupChats')
    async handleGetUserGroupchats(@ConnectedSocket() client: Socket)
    {
        const userId = client.data.userId;
        const groupchats = await this.chatService.getAllChatsForUser(userId);
        client.emit('userGroupchats', groupchats);
    }

    @SubscribeMessage('getAllMessagesFromChat')
    async handleGetAllMessagesFromChat(@MessageBody() body, @ConnectedSocket() client: Socket)
    {
        const name = body.chatName;
        console.log(`User ${client.data.userId} went to room: ${name}`);
        client.data.currentChatName = name;
        const messages = await this.chatService.getAllMessagesFromChat(name);

        const user = await this.userService.findUserById(client.data.userId);
        const username = user?.userName;

       client.emit("recieveMessage",{username,messages});
    }

}