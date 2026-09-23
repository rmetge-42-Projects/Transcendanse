import { MatchService } from './match.service';
import { ValidateDto } from './dto/validate.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Controller, Get, Param, Post, Body, Delete, UseGuards, Req, ParseIntPipe } from '@nestjs/common';

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
  @UseGuards(JwtAuthGuard)
  @Get('other')
  getOther(@Req() request) {
    return this.matchService.getOtherProfile(request.user.id);
  }

  //supprimer le match
  @UseGuards(JwtAuthGuard)
  @Delete(':userId')
  async deleteMatch(@Req() request, @Param('userId', ParseIntPipe) userId: number){
      return this.matchService.deleteMatch(request.user.id, userId);
  }
}


