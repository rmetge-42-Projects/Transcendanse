import { Controller, Get, Post, Body } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateDto } from './dto/createProfile.dto';
import { ModifyProfileDto } from './dto/modifyProfile.dto';
import { Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  //requette post, remplissage des infos du profil pour la creation de compte
  //front = createProfile
  @Post('createProfile')
  async createProfile(@Body() createDto: CreateDto){
    return this.usersService.createProfile(createDto);
  }
  
  //requette pour modifier les infos du profil
  //front = modifyProfile
  @Post('modifyProfile')
  async modifyProfile(@Body() modifyProfileDto: ModifyProfileDto){
    return this.usersService.modifyProfile(modifyProfileDto);
  }

  //recupere les infos de l'user
  //front = profil
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@Req() req: Request) {
    const userId = (req.user as { id: number }).id;
    return this.usersService.getProfile(userId);
  }

  //recupere les profils d'autres personnes
  @Get('other')
  getOther() {
    return this.usersService.getOtherProfile();
  }
}
