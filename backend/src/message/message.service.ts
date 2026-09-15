import { Injectable } from '@nestjs/common';
import { SendMessageDto } from './dto/sendMessage.dto';
import { PrismaService } from '../prisma/prisma.service';
import { UnauthorizedException } from '@nestjs/common';

@Injectable()
export class MessageService {
	constructor(
    	private prisma: PrismaService,
	) {}

	//envoie tout les message eu avec userId
	//mettre les message comme lu	(unreadCount = 0)
	async discution(myId: number, otherUserId: number) {
    	await this.prisma.message.updateMany({
        	where: {
            	senderId: otherUserId,
            	receiverId: myId,
        	},
        	data: {
            	isRead: true,
        	},
    	});

    	const messages = await this.prisma.message.findMany({
        	where: {
        	    OR: [
        	        { senderId: myId, receiverId: otherUserId },
        	        { senderId: otherUserId, receiverId: myId },
        	    ],
    			},
			orderBy: {
        		createdAt: 'asc',
        	},
    	});
    	return messages;
	}

	//envoyer toute les personne avec les quel je discute
	async conversation(userId: number){
		const list = await this.prisma.message.findMany({
        	where: {
        	    OR: [
        	        { senderId: userId},
        	        { receiverId: userId},
        	    ],
    			},
			orderBy: {
        		createdAt: 'asc',
        	},
    	});
    	return list;
	}

	//j'envoie un message
	// TODO: une fois match.service.ts fait par Emma, 
	// vérifier qu'un match accepté existe entre userId et sendMessageDto.receiveId avant d'autoriser l'envoi
	async sendMessage(userId: number, sendMessageDto: SendMessageDto) {
    	const newMessage = await this.prisma.message.create({
        	data: {
            	senderId: userId,
            	receiverId: sendMessageDto.receiveId,
            	content: sendMessageDto.message,
        	},
    	});
    	return newMessage;
	}

	//supprimer un msg
	async deleteMessage(userId: number, messageId: number) {
    	const message = await this.prisma.message.findUnique({
        	where: { id: messageId },
    	});

    	if (!message || (message.senderId !== userId && message.receiverId !== userId)) {
        	throw new UnauthorizedException("Message introuvable.");
    	}

    	const sup = await this.prisma.message.delete({
        	where: { id: messageId },
    	});
    	return sup;
	}

	async deleteDiscution(myId: number, otherUserId: number) {
    	const messages = await this.prisma.message.deleteMany({
        	where: {
        	    OR: [
        	        { senderId: myId, receiverId: otherUserId },
        	        { senderId: otherUserId, receiverId: myId },
        	    ],
        	},
    	});
    	return messages;
	}
}
