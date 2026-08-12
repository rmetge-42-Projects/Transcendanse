import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersService {
  getProfile() {
    return {
      id: 42,
      username: 'name test',
      email: 'norminet@student.42.fr',
      kind: 'man',
      orientation: 'man',
      biography: 'Étudiant à 42 en plein sur Transcendence !',
    };
  }
}