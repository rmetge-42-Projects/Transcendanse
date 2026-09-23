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
  UseInterceptors, 
  UploadedFile, 
  ParseFilePipe, 
  MaxFileSizeValidator,
  FileTypeValidator
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateDto } from './dto/createProfile.dto';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UpdateProfileDto } from './dto/updateProfile.dto';
import { StatusDto } from './dto/status.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import 'multer'


@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  //requette post, remplissage des infos du profil pour la creation de compte
  //front = createProfile
  // a revoir, j'ai ajouter les photo
  @UseGuards(JwtAuthGuard)
  @Post('createProfile')
  @UseInterceptors(FileInterceptor('photo'))
  async createProfile(
  //   @Body() createDto: CreateDto, @Req() req: Request) {
  //     const userId = (req.user as { id: number }).id;
  //     return this.usersService.createProfile(userId, createDto);
  // }
  @Body() createDto: CreateDto, @Req() req: Request,
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5 Mo max
                    new FileTypeValidator({ fileType: 'image/(jpeg|png|webp|jpg)' }),
                ],
                fileIsRequired: false, // Défini sur false si la photo est optionnelle
            }),
        ) file: Express.Multer.File,
    ) {
        // dto contient : { name, username, birthday, kind, orientation, biography }
        // file contient le fichier (buffer, originalname, mimetype, etc.)
        
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
  @UseGuards(JwtAuthGuard)
  @Get('other')
  async getOther(@Req() req: Request) {
    const userId = (req.user as { id: number }).id;
    return this.usersService.getOtherProfile(userId);
  }

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

  //enlever le status en ligne ou le mettre en fonction du satsus recu
  @UseGuards(JwtAuthGuard)
  @Patch('status')
  async status(@Body() statusDto : StatusDto){
    return this.usersService.status(statusDto.isOnline);
  }
}