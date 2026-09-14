import { Controller } from '@nestjs/common';
import { MatchService } from './match.service';
import { ValideteDto } from './dto/validate.dto';
import { Post, Body, Get } from '@nestjs/common';

@Controller('match')
export class MatchController {
  constructor(private readonly matchService: MatchService) {}

  //valide ou non le match (like)
  @Post('validete')
  async rejected(@Body() valideteDto: ValideteDto) {
    return this.matchService.rejected(valideteDto);
  }

  //recupere les info du profile
  @Get('other')
  getOther() {
    return this.matchService.getOtherProfile();
  }
}
