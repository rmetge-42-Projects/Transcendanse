import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { CreateDto } from '../users/dto/createProfile.dto';
import { ModifyProfileDto } from '../users/dto/modifyProfile.dto';
import { ModifyPasswordDto } from './dto/modifyPassword.dto';

@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	//requette post pour se connecter
	//front = login
	@Post('login') // 2. Écoute les requêtes POST sur /auth/login
	async login(@Body() loginDto: LoginDto) {
		return this.authService.validateUser(loginDto.email, loginDto.password);
	}

	//requette post pour s'inscrire et commencer a cree sont profile
	//front = register
	@Post('register')
	async register(@Body() registerDto: RegisterDto){
		return this.authService.registerUser(registerDto.email, registerDto.password, registerDto.validatePassword);
	}

	//requette pour modifier le mdp
	//modifyPassword
	@Post('modifyPassword')
	async modifyPassword(@Body() modifyPasswordDto: ModifyPasswordDto)
	{
		return this.authService.modifyPassword(modifyPasswordDto);
	}
}
