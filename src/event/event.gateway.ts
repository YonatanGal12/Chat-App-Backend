import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket }  from 'socket.io'
import { type MessageDto, type NewGCDto } from "./event.dto";
import { UsersService } from "src/users/users.service";
import { DatabaseService } from "src/database/database.service";
import { JwtService } from '@nestjs/jwt';


@WebSocketGateway({namespace: 'chat', cors: true})
export class EventGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect{

    @WebSocketServer()
    server: Server;

    constructor(private userService: UsersService, private databaseSerive: DatabaseService, private jwtService: JwtService) {}

    onlineUsers = new Map<number, string[]>();

    afterInit(server: Server) {
        console.log(`Server running`)
    }

    async handleConnection(client: Socket) {

        console.log("sdfsdfsd")
        const token = client.handshake.auth?.token;
        if (!token) {
            console.log("Client tried to connect without a token, disconnecting...");
            client.disconnect();
            return;
        }

        const payload = await this.jwtService.verifyAsync(token, {
            secret: process.env.JWT_ACCESS_TOKEN_SECRET,
        });

        const user = await this.userService.findUserById(payload.sub);
        if (!user) throw new Error("User not found");


        user.chatMembers.forEach(groupchatId => {
            client.join(groupchatId.toString());
        });

        console.log(`User ${user.userName} connected and joined rooms: ${user.chatMembers}`);
        this.server.emit('userConnected', { userId: user.id, socketId: client.id })
    }

    handleDisconnect(client: Socket) {
        console.log(`Client dicconnected: ${client.id}`);
        this.server.emit('userDisonnected', client.id);
    }

    @SubscribeMessage('newMessage')
    handleNewMessage(@MessageBody() messageDto: MessageDto, @ConnectedSocket() client: Socket)
    {
        console.log(`Message from ${client.id}: ${messageDto.content}`);
        this.server.emit('recieveMessage', {sender: messageDto.sender, message: messageDto.content});
    }

    @SubscribeMessage('getUsername')
    handleGetUsername(@MessageBody() messageDto: MessageDto, @ConnectedSocket() client: Socket)
    {

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

        const chat = await this.databaseSerive.chat.create({
            data: {
                chatName: newGCDto.name,
                chatType: 'GROUP',
                chatMembers: {
                    create: users.map(u => ({userId: u.id, role: 'MEMBER'}))
                }
            },
            include: {
                chatMembers: true
            }
        })

    }

}