import { SendMessageDto } from './dto/sendMessage.dto';
import { PrismaService } from '../prisma/prisma.service';
import { UnauthorizedException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { MessageGateway } from './message.gateway';


@Injectable()
export class MessageService {
	constructor(
    	private prisma: PrismaService,
		private messageGateway: MessageGateway,
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

		const user1Id = Math.min(myId, otherUserId);
		const user2Id = Math.max(myId, otherUserId);

		if (myId === user1Id) {
		    await this.prisma.match.updateMany({
		        where: { user1Id: user1Id, user2Id: user2Id },
		        data: { seenByUser1: true },
		    });
		} else {
    	await this.prisma.match.updateMany({
        	where: { user1Id: user1Id, user2Id: user2Id },
        	data: { seenByUser2: true },
    	});
	}

		this.messageGateway.server.to(`user_${myId}`).emit('messagesRead', {});
		
    	const messages = await this.prisma.message.findMany({
        	where: {
            	OR: [
                	{ senderId: myId, receiverId: otherUserId, deletedForSender: false },
                	{ senderId: otherUserId, receiverId: myId, deletedForReceiver: false },
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
                	{ senderId: userId, deletedForSender: false },
                	{ receiverId: userId, deletedForReceiver: false },
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
		const user1Id = Math.min(userId, sendMessageDto.receiveId);
		const user2Id = Math.max(userId, sendMessageDto.receiveId);

		const existingMatch = await this.prisma.match.findUnique({where: {user1Id_user2Id: {user1Id: user1Id,user2Id: user2Id}}});
	
		if (!existingMatch) {
			throw new ForbiddenException("Vous devez avoir un match pour envoyer un message");
		} 

		if (!existingMatch.isActive) {
    		throw new ForbiddenException("Vous ne pouvez plus envoyer de message à cet utilisateur.");
		}

		const blocked = await this.prisma.block.findFirst({
    		where: {
        		OR: [
            		{ blockerId: userId, blockedId: sendMessageDto.receiveId },
            		{ blockerId: sendMessageDto.receiveId, blockedId: userId },
        		],
    		},
		});

		if (blocked) {
    		throw new ForbiddenException("Vous ne pouvez plus envoyer de message à cet utilisateur.");
		}

    	const newMessage = await this.prisma.message.create({
        	data: {
            	senderId: userId,
            	receiverId: sendMessageDto.receiveId,
            	content: sendMessageDto.message,
        	},
    	});

		this.messageGateway.sendNewMessage(sendMessageDto.receiveId, newMessage);
    	return newMessage;
	}

	//supprimer un msg
	async deleteMessage(userId: number, messageId: number) {
	    const message = await this.prisma.message.findUnique({
	        where: { id: messageId },
	    });

	    if (!message || (message.senderId !== userId && message.receiverId !== userId)) {
	        throw new NotFoundException("Message introuvable.");
	    }

	    if (message.senderId === userId) {
	 	    await this.prisma.message.update({
	            where: { id: messageId },
	            data: { deletedForSender: true },
	        });
	    } else {
	        await this.prisma.message.update({
	            where: { id: messageId },
	            data: { deletedForReceiver: true },
	        });
	    }

	    return { success: true, message: "Message masqué pour vous" };
	}

	async deleteDiscution(myId: number, otherUserId: number) {
    	await this.prisma.message.updateMany({
        	where: {
            	senderId: myId,
            	receiverId: otherUserId,
        	},
        	data: {
            	deletedForSender: true,
        	},
    	});

    	await this.prisma.message.updateMany({
        	where: {
            	senderId: otherUserId,
            	receiverId: myId,
        	},
        	data: {
            	deletedForReceiver: true,
        	},
    	});
		return { success: true, message: "Conversation masquée pour vous" };
		}
	}
