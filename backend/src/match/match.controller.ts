import { Controller, Get, Param, Post, Body, Delete } from '@nestjs/common';
import { MatchService } from './match.service';
import { ValideteDto } from './dto/validate.dto';

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

    //supprimer le match
    @Delete(':userId')
    async deleteMatch(@Param('userId') userId: string){
        return this.matchService.deleteMatch(+userId);
    }
}
