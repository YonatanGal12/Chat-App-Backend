import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket }  from 'socket.io'
import { type MessageDto, type NewGCDto } from "./event.dto";
import { UsersService } from "src/users/users.service";
import { DatabaseService } from "src/database/database.service";
import { JwtService } from '@nestjs/jwt';
import { Client } from "node_modules/socket.io/dist/client";
import { ChatService } from "src/chats/chat.service";


@WebSocketGateway({namespace: 'chat', cors: { origin: "http://localhost:5173", credentials: true}})
export class EventGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect{

    @WebSocketServer()
    server: Server;

    constructor(private userService: UsersService,
                private databaseSerive: DatabaseService, 
                private jwtService: JwtService,
                private chatService: ChatService) {}


    private userSockets = new Map<number, Set<string>>();


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
            
            user.chatMembers.forEach(groupchatId => {
                client.join(groupchatId.toString());
            });

            console.log(`User ${user.userName} connected and joined rooms: ${user.chatMembers.map(m => m.chat.chatName)}`);
            this.server.emit('userConnected', { userId: user.id, socketId: client.id })

            const userName = user.userName;
            client.emit('getUsername', userName);

            const groupchats = await this.chatService.getAllChatsForUser(user.id);
            client.emit('userGroupchats', groupchats);      
        }
        catch(error)
        {
            console.error("JWT verification failed:", error.message);
            client.emit("authError", { message: "Invalid or expired token" });
            client.disconnect();
        }
    }

    handleDisconnect(client: Socket) {
        console.log(`Client disconnected: ${client.id}`);
        this.server.emit('userDisonnected', client.id);
    }

    @SubscribeMessage('newMessage')
    handleNewMessage(@MessageBody() messageDto: MessageDto, @ConnectedSocket() client: Socket)
    {
        console.log(`Message from ${client.id}: ${messageDto.content}`);
        this.server.emit('recieveMessage', {sender: messageDto.sender, message: messageDto.content});
    }

    @SubscribeMessage('getAllUsernames')
    async handleGetAllUsernames(@ConnectedSocket() client: Socket)
    {
        const users = await this.userService.findAllUsers();
        const usernames = users.map(user => user.userName);
        client.emit('getAllUsernames', usernames);
    }

    @SubscribeMessage('newGCCreated')
    async handleNewGroupChatCreated(@MessageBody() newGCDto: NewGCDto, @ConnectedSocket() client: Socket)
    {
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
            this.server.to(user.id.toString()).socketsJoin(chat.id.toString());
            console.log("Current user id: " + user.id)
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

}