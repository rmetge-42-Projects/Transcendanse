import { Injectable } from '@nestjs/common';
import { ValideteDto } from './dto/validate.dto';

@Injectable()
export class MatchService {
  //valide ou non le profile de mach
  async rejected(valideteDto: ValideteDto) {
    if (valideteDto.status === 'reject') {
      //userId est le numero de profile liker ou nom
      return {
        success: true,
        message: 'Profile Reject !',
      };
    } else if (valideteDto.status === 'like') {
      return {
        success: true,
        message: 'Profile Like !',
      };
    } else {
      return {
        success: false,
        message: 'probleme',
      };
    }
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
