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
  @UseGuards(JwtAuthGuard)
  @Post('createProfile')
  async createProfile(@Body() createDto: CreateDto, @Req() req: Request) {
      const userId = (req.user as { id: number }).id;
      return this.usersService.createProfile(userId, createDto);
  }
  
  //requette pour modifier les infos du profil
  //front = modifyProfile
  @UseGuards(JwtAuthGuard)
  @Post('modifyProfile')
  async modifyProfile(@Body() modifyProfileDto: ModifyProfileDto, @Req() req: Request){
      const userId = (req.user as { id: number }).id;
      return this.usersService.modifyProfile(userId, modifyProfileDto,);
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
  @UseGuards(JwtAuthGuard)
  @Get('other')
  async getOther(@Req() req: Request) {
    const userId = (req.user as { id: number }).id;
   return this.usersService.getOtherProfile(userId);
  }
}
