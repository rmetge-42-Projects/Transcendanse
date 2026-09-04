import { Injectable } from '@nestjs/common';

@Injectable()
export class MessageService {
    async conversation(){
        return[
            {
              "userId": 12,
              "userName": "Sophie",
              "lastMessage": "Salut ! Tu danses ce soir ?",
              "lastMessageDate": "14:32",
              "unreadCount": 1
            },
            {
              "userId": 13,
              "userName": "Alexandre",
              "lastMessage": "À demain !",
              "lastMessageDate": "Hier",
              "unreadCount": 0
            }
        ]
    }

    // async message(){
    //     return[
    //         {
    //           "id": 101,
    //           "senderId": 12,
    //           "content": "Salut ! Trop cool ton profil.",
    //           "createdAt": "14:30"
    //         },
    //         {
    //           "id": 102,
    //           "senderId": 42,
    //           "content": "Merci Sophie ! Tu aimes la salsa ?",
    //           "createdAt": "14:32"
    //         }
    //     ]
    // }

      async message(userId?: number) {
        return [
            {
              id: 101,
              senderId: 12,
              message: "Salut ! Trop cool ton profil.",
              messageDate: new Date().toISOString()
            },
            {
              id: 102,
              senderId: 42,
              message: "Merci Sophie ! Tu aimes la salsa ?",
              messageDate: new Date().toISOString()
            }
        ];
    }
}
