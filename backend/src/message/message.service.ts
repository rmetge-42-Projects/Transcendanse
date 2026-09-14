import { Injectable } from '@nestjs/common';
import { SendMessageDto } from './dto/sendMessage.dto';

@Injectable()
export class MessageService {

	//envoyer toute les personne avec les quel je discute
	async conversation(){
		return[
			{
			"userId": 12,
			"userName": "Sophie",
			"lastMessage": "Salut ! Tu danses ce soir ?",
			"lastMessageDate": "14:32",
			"unreadCount": 0,
			"isOnline": true
			},
			{
			"userId": 13,
			"userName": "Alexandre",
			"lastMessage": "À demain !",
			"lastMessageDate": "Hier",
			"unreadCount": 3,
			"isOnline": false
			}
		]
	}

	//envoie tout les message eu avec userId (dans l'ordre le preference)
	//normalement une fonction existe pour les envoyer dans l'ordre cronolagique
	//mettre les message comme lu	(unreadCount = 0)
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

	//j'envoie un message (enregistrer dans la db)
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
