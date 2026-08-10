import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { CreateDto } from './dto/createProfile.dto';
import { ModifyDto } from './dto/modify.dto';

@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Post('login') // 2. Écoute les requêtes POST sur /auth/login
	async login(@Body() loginDto: LoginDto) {
		return this.authService.validateUser(loginDto.email, loginDto.password);
	}

	@Post('register')
	async register(@Body() registerDto: RegisterDto){
		return this.authService.registerUser(registerDto.email, registerDto.password, registerDto.validatePassword);
	}

	@Post('createProfile')
	async createProfile(@Body() createDto: CreateDto){
		return this.authService.createProfile(createDto);
	}

	@Post('modifyProfile')
	async modifyProfile(@Body() modifyDto: ModifyDto){
		return this.authService.modifyProfile(modifyDto);
	}
}
