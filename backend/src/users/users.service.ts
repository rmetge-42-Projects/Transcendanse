import { Injectable } from '@nestjs/common';
import { CreateDto } from './dto/createProfile.dto';
import { UpdateProfileDto } from './dto/updateProfile.dto';


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
  //put donc c'est pas tout a fait comme post faire attention
  async   updateProfile(userId, updateProfileDto: UpdateProfileDto)
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

}