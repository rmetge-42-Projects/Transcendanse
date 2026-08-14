import { Injectable } from '@nestjs/common';
import { CreateDto } from './dto/createProfile.dto';
import { ModifyProfileDto } from './dto/modifyProfile.dto';


@Injectable()
export class UsersService {

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
}