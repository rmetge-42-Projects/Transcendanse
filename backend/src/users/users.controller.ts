import { Controller, Get, Post, Body } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateDto } from './dto/createProfile.dto';
import { ModifyProfileDto } from './dto/modifyProfile.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  //requette post, remplissage des info du profile pour le creation de compte
  //front = createProfile
  @Post('createProfile')
  async createProfile(@Body() createDto: CreateDto){
    return this.usersService.createProfile(createDto);
  }
  
  //requette pour modifier les info du profile
  //front = modifyProfile
  @Post('modifyProfile')
  async modifyProfile(@Body() modifyProfileDto: ModifyProfileDto){
    return this.usersService.modifyProfile(modifyProfileDto);
  }

  //recupere les info de l'user
  //front = profile
  @Get('me')
  getMe() {
    return this.usersService.getProfile();
  }

  //recupere les profile d'autre personne
  @Get('other')
  getOther() {
    return this.usersService.getOtherProfile();
  }
}
