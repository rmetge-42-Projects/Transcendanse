import { Controller, Get, Param, Post, Body, Delete } from '@nestjs/common';
import { Req, UseGuards } from '@nestjs/common';
import { MessageService } from './message.service';
import { SendMessageDto } from './dto/sendMessage.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { Request } from 'express';

@Controller('message')
export class MessageController {
    constructor(private readonly messageService: MessageService) {}

    //envoie toute mes conv
    @UseGuards(JwtAuthGuard)
    @Get('conversation')
    async conversation(@Req() req: Request) {
        const userId = (req.user as { id: number }).id;
        return this.messageService.conversation(userId);
    }

        //envoie mes echange avec la personne
    @UseGuards(JwtAuthGuard)
    @Get(':userId')
    async discution(@Param('userId') userId: string, @Req() req: Request) {
        const myId = (req.user as { id: number }).id;
        return this.messageService.discution(myId, +userId);
    }
    //recupere le message envoyer et j'enregiste dans la db
    @UseGuards(JwtAuthGuard)
    @Post('sendMessage')
    async sendMessage(@Body() sendMessageDto:SendMessageDto, @Req() req: Request){
        const userId = (req.user as { id: number }).id;
        return this.messageService.sendMessage(userId, sendMessageDto);
    }

    //supprimer le match
    @Delete(':userId')
    async deleteMatch(@Param('userId') userId: string){
        return this.messageService.deleteMatch(+userId);
    }
}
