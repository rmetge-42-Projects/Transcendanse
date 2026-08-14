import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { PasswordDto } from './dto/password.dto';
import { EmailDto } from './dto/email.dto';

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
	//front = composant/password
	@Post('password')
	async modifyPassword(@Body() passwordDto: PasswordDto)
	{
		return this.authService.password(passwordDto);
	}

	//requette pour modifier l'email
	//front = composant/email
	@Post('email')
	async modifyEmail(@Body() emailDto: EmailDto)
	{
		return this.authService.email(emailDto);
	}

}
