import { Injectable } from '@nestjs/common';

@Injectable()
export class MessageService {
    async conversation(){
        return[
            {
              "userId": 12,
              "username": "Sophie",
              "lastMessage": "Salut ! Tu danses ce soir ?",
              "lastMessageDate": "14:32",
              "unreadCount": 1
            },
            {
              "userId": 13,
              "username": "Alexandre",
              "lastMessage": "À demain !",
              "lastMessageDate": "Hier",
              "unreadCount": 0
            }
        ]
    }
}
