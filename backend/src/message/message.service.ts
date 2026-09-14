import { Injectable } from '@nestjs/common';
import { SendMessageDto } from './dto/sendMessage.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MessageService {
	constructor(
    	private prisma: PrismaService,
	) {}

	//envoie tout les message eu avec userId
	//mettre les message comme lu	(unreadCount = 0)
	async discution(myId: number, otherUserId: number) {
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

	//supprimer le userId de les match
	async deleteMatch(userId?: number) {
		if (!userId)
		{
			return{
				success: false,
				message: "Un probleme avec la supression du match"
			}
		}
		return{
			success: true,
			message: "Match supprimer"
		}
	}
}
