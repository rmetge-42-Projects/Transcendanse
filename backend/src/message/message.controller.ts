import { Controller, Get, Param, Post, Body, Delete } from '@nestjs/common';
import { MessageService } from './message.service';
import { SendMessageDto } from './dto/sendMessage.dto';

@Controller('message')
export class MessageController {
    constructor(private readonly messageService: MessageService) {}
    
    //envoie les differente pessonne avec qui je discute
    @Get('conversation')
    async conversation(){
        return this.messageService.conversation();
    }

    //envoie mes echange avec la personne
    @Get(':userId')
    async discution(@Param('userId') userId: string) {
        return this.messageService.discution(+userId);
    }

    //recupere le message envoyer et j'enregiste dans la db
    @Post('sendMessage')
    async sendMessage(@Body() sendMessageDto:SendMessageDto){
        return this.messageService.sendMessage(sendMessageDto);
    }

    //supprimer le match
    @Delete(':userId')
    async deleteMatch(@Param('userId') userId: string){
        return this.messageService.deleteMatch(+userId);
    }
}
