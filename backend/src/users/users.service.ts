import { Injectable } from '@nestjs/common';
import { CreateDto } from './dto/createProfile.dto';
import { ModifyProfileDto } from './dto/modifyProfile.dto';


@Injectable()
export class UsersService {

  
  //implemente les info du nouvelle utilisateur dans la db
  async   createProfile(createDto: CreateDto)
  {
    return {
      success: true,
      message: "Profile Create !"
    }
  }
  //modifier les info du profile (ex: username, bio ...) dans la db
  async   modifyProfile(modifyProfileDto: ModifyProfileDto)
  {
    return {
      success: true,
      message: "Profile Modify"
    }
  }

  //envoie les info de l'utilisateur
  getProfile() {
    return {
      id: 42,
      username: 'name test',
      email: 'norminet@student.42.fr',
      birthday: 12/12/2005,
      kind: 'man',
      orientation: 'all',
      biography: 'Étudiant à 42 en plein sur Transcendence !',
    };
  }

  //envoie les infos des profil des match
  getOtherProfile() {
    return [
      {
        id: 12,
        username: 'Sophie',
        kind: 'woman',
        orientation: 'man',
        biography: 'Passionnée de danse contemporaine, de voyages et de bon café !',
      },
      {
        id: 13,
        username: 'Alexandre',
        kind: 'man',
        orientation: 'woman',
        biography: 'Danseur de salsa et grand amateur de musique électronique.',
      },
      {
        id: 14,
        username: 'Camille',
        kind: 'other',
        orientation: 'all',
        biography: 'Toujours partant pour tester de nouvelles chorégraphies et sorties.',
      },
      {
        id: 15,
        username: 'Lucas',
        kind: 'man',
        orientation: 'all',
        biography: 'Étudiant à 42, aime le tango, les échecs et le code propre.',
      },
      {
        id: 16,
        username: 'Léa',
        kind: 'woman',
        orientation: 'all',
        biography: 'Fan de hip-hop, de cuisine italienne et de randonnée.',
      },
    ];
  }
}