import { MatchService } from './match.service';
import { ValidateDto } from './dto/validate.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Controller, Get, Param, Post, Body, Delete, UseGuards, Req, ParseIntPipe } from '@nestjs/common';

@Controller('match')
export class MatchController {
  constructor(private readonly matchService: MatchService) {}

  @UseGuards(JwtAuthGuard)
  @Post('validate')
  async rejected(@Req() request, @Body() validateDto: ValidateDto) {
    return this.matchService.rejected(request.user.id, validateDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getMatches(@Req() request) {
    return this.matchService.getMatches(request.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('activity')
  async getActivity(@Req() request) {
    return this.matchService.getActivity(request.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('other')
  getOther(@Req() request) {
    return this.matchService.getOtherProfile(request.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':userId')
  async deleteMatch(@Req() request, @Param('userId', ParseIntPipe) userId: number){
      return this.matchService.deleteMatch(request.user.id, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('block/:userId')
  async block(@Param('userId') userId: string, @Req() request) {
    return this.matchService.blockUser(request.user.id, +userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('block/:userId')
  async unblock(@Param('userId') userId: string, @Req() request) {
    return this.matchService.unblockUser(request.user.id, +userId);
  }
}


