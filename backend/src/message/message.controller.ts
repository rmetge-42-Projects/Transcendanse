import { Controller } from '@nestjs/common';
import { MessageService } from './message.service';
import { Get } from '@nestjs/common';

@Controller('message')
export class MessageController {
    constructor(private readonly messageService: MessageService) {}
    
    @Get('conversation')
    async conversation(){
        return this.messageService.conversation();
    }


    //   @Post('validete')
    //   async rejected(@Body() valideteDto: ValideteDto) {
    //     return this.matchService.rejected(valideteDto);
    //   }
}
