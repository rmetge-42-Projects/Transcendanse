import { Controller, Get, Post, Body, Put, Req, UseGuards, Patch, Param } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateDto } from './dto/createProfile.dto';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UpdateProfileDto } from './dto/updateProfile.dto';
import { StatusDto } from './dto/status.dto';

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

  //recupere les infos de l'user
  //front = profil
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@Req() req: Request) {
    const userId = (req.user as { id: number }).id;
    return this.usersService.getProfile(userId);
  }

  //recupere les profils d'autres personnes
  // @UseGuards(JwtAuthGuard)
  // @Get('other')
  // async getOther(@Req() req: Request) {
  //   const userId = (req.user as { id: number }).id;
  //   return this.usersService.getOtherProfile(userId);
  // }

  //envoie les info du match
  @UseGuards(JwtAuthGuard)
  @Get(':userId')
  async myMatchProfile(@Param('userId') userId : string) {
    return this.usersService.myMatchProfile(+userId);
  }

  //pour apres modifier le profile en une seule fois
  //front = updateProfile
  @UseGuards(JwtAuthGuard)
  @Put('updateProfile')
  async updateProfile(@Req() req: Request, @Body() updateProfileDto: UpdateProfileDto) {
    const userId = (req.user as { id: number }).id;
    return this.usersService.updateProfile(userId, updateProfileDto);
  }

  //defini le statut
  @UseGuards(JwtAuthGuard)
  @Patch('status')
  async status(@Req() req: Request, @Body() statusDto : StatusDto){
    const userId = (req.user as { id: number }).id;
    return this.usersService.status(userId, statusDto);
  }
}