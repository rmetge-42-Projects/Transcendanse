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
}
