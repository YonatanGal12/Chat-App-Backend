import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket }  from 'socket.io'
import { type MessageDto } from "./event.dto";
import { UsersService } from "src/users/users.service";

@WebSocketGateway({namespace: 'chat', cors: true})
export class EventGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect{

    @WebSocketServer()
    server: Server;

    constructor(private userService: UsersService) {}

    afterInit(server: Server) {
        console.log(`Server running`)
    }

    handleConnection(client: Socket, ...args: any[]) {
        console.log(`Client connected: ${client.id}`);
        this.server.emit('userConnected', client.id);
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
        console.log(`Message from ${client.id}: ${messageDto.content}`);
        this.server.emit('recieveMessage', {sender: messageDto.sender, message: messageDto.content});
    }

    @SubscribeMessage('getAllUsernames')
    async handleGetAllUsernames(@ConnectedSocket() client: Socket)
    {
        const users = await this.userService.findAllUsers();
        const usernames = users.map(user => user.userName)
        client.emit('')
    }

}