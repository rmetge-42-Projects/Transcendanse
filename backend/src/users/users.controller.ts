import { 
  Controller,
  Get,
  Post,
  Body,
  Req,
  Patch,
  Put,
  UseGuards,
  Param,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateDto } from './dto/createProfile.dto';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UpdateProfileDto } from './dto/updateProfile.dto';
import { StatusDto } from './dto/status.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Requête POST: enregistrement du profil utilisateur
  // Front = createProfile
  @UseGuards(JwtAuthGuard)
  @Post('createProfile')
  async createProfile(
    @Body() createDto: CreateDto,
    @Req() req: Request,
  ) {
    const userId = (req.user as { id: number }).id;
    return this.usersService.createProfile(userId, createDto);
  }

  // Récupère les infos du profil connecté
  // Front = profil (myProfile)
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@Req() req: Request) {
    const userId = (req.user as { id: number }).id;
    return this.usersService.getProfile(userId);
  }

  //envoie les info du match
  @UseGuards(JwtAuthGuard)
  @Get(':userId')
  async myMatchProfile(@Param('userId') userId: string, @Req() req: Request) {
      const currentUserId = (req.user as { id: number }).id;
      return this.usersService.myMatchProfile(currentUserId, +userId);
  }

  // Mise à jour du profil
  // Front = updateProfile
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