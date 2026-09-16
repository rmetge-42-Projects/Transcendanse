import { MatchService } from './match.service';
import { ValidateDto } from './dto/validate.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Controller, Get, Param, Post, Body, Delete, UseGuards, Req } from '@nestjs/common';



@Controller('match')
export class MatchController {
  constructor(private readonly matchService: MatchService) {}

  //valide ou non le match (like)
  @UseGuards(JwtAuthGuard)
  @Post('validate')
  async rejected(@Req() request, @Body() validateDto: ValidateDto) {
    return this.matchService.rejected(request.user.id, validateDto);
  }

  //recuperer la liste des machs 
  @UseGuards(JwtAuthGuard)
  @Get()
  async getMatches(@Req() request) {
    return this.matchService.getMatches(request.user.id);
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
