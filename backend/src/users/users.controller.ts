import { Controller, Get, Post, Body, Put, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateDto } from './dto/createProfile.dto';
// import { ModifyProfileDto } from './dto/modifyProfile.dto';
import { UpdateProfileDto } from './dto/updateProfile.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

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
  // @Post('modifyProfile')
  // async modifyProfile(@Body() modifyProfileDto: ModifyProfileDto){
  //   return this.usersService.modifyProfile(modifyProfileDto);
  // }

  //recupere les info de l'user
  //front = profile
  @Get('me')
  getMe() {
    return this.usersService.getProfile();
  }

  //pour apres modifier le profile en une seule fois
  //front = updateProfile
  // @UseGuards(JwtAuthGuard) // ⚠️ INDISPENSABLE pour que req.user existe ! 
  //jsp ce que c'est mais apparament c'est important
  @Put('updateProfile')
    async updateProfile(@Req() req: any, @Body() updateProfileDto: UpdateProfileDto) {
        const userId = req.user?.id || 42; // Récupère l'ID de l'utilisateur connecté via le token
        //a modifier, c'etais juste pour le test => const userId = req.user.id
        return this.usersService.updateProfile(userId, updateProfileDto);
    }
}
