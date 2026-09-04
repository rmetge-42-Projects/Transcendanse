import { Controller, Get, Param } from '@nestjs/common';
import { MessageService } from './message.service';

@Controller('message')
export class MessageController {
    constructor(private readonly messageService: MessageService) {}
    
    //envoie les differente pessonne avec qui je discute
    @Get('conversation')
    async conversation(){
        return this.messageService.conversation();
    }

    //envoie mes echange avec la personne
    // @Get('message')
    // async message(){
    //     return this.messageService.message();
    // }
     @Get(':userId')
    async message(@Param('userId') userId: string) {
        return this.messageService.message(+userId);
    }
}
