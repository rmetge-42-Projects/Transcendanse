import { Injectable } from '@nestjs/common';
import { SendMessageDto } from './dto/sendMessage.dto';

@Injectable()
export class MessageService {
	async conversation(){
		return[
			{
			"userId": 12,
			"userName": "Sophie",
			"lastMessage": "Salut ! Tu danses ce soir ?",
			"lastMessageDate": "14:32",
			"unreadCount": 1,
      "isOnline": true
			},
			{
			"userId": 13,
			"userName": "Alexandre",
			"lastMessage": "À demain !",
			"lastMessageDate": "Hier",
			"unreadCount": 0,
      "isOnline": false
			}
		]
	}

	async discution(userId?: number) {
		if (!userId)
		{
			return{
				success: false,
				message: "Un probleme avec les contact"
			}
		}
		return [
			{
			id: 1,
			receiveId: 13,
			senderId: 12,
			message: "Salut ! Trop cool ton profil.",
			// messageDate: "test"
			messageDate: new Date('2026-09-07T14:30:00').toISOString()
			},
			{
			id: 2,
			receiveId: 12,
			senderId: 13,
			message: "Merci Sophie ! Tu aimes la salsa ?",
			messageDate: new Date().toISOString()
			},
			{
			id: 3,
			receiveId: 12,
			senderId: 13,
			message: "???",
			messageDate: new Date().toISOString()
			}
		];
	}

	async sendMessage(sendMessageDto : SendMessageDto){

		if (!sendMessageDto.message){
			return {
				success: false,
				message: "Probleme avec le message!",
			};
		}
		return {
			success: true,
			message: "Message envoyer !",
		};
	}

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
