//recoit les demandes du front et defini les routes

import { Controller, Post, Body } from '@nestjs/common';
import { Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { PasswordDto } from './dto/password.dto';
import { EmailDto } from './dto/email.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { generateSecret, generateURI } from 'otplib';
import * as qrcode from 'qrcode';
import type { Request } from 'express';

@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	//requette post pour se connecter
	//front = login
	@Post('login') // 2. Écoute les requêtes POST sur /auth/login
	async login(@Body() loginDto: LoginDto) {
		return this.authService.validateUser(loginDto.email, loginDto.password);
	}

	//requette post pour s'inscrire et commencer a creer son profil
	//front = register
	@Post('register')
	async register(@Body() registerDto: RegisterDto){
		return this.authService.registerUser(registerDto.email, registerDto.password, registerDto.validatePassword);
	}

	//requette pour modifier le mdp
	//front = composant/password
	@UseGuards(JwtAuthGuard)
	@Post('password')
	async modifyPassword(@Body() passwordDto: PasswordDto)
	{
		return this.authService.password(passwordDto);
	}

	//requette pour modifier l'email
	//front = composant/email
	@UseGuards(JwtAuthGuard)
	@Post('email')
	async modifyEmail(@Body() emailDto: EmailDto)
	{
		return this.authService.email(emailDto);
	}

	//genere la double authentification
	@UseGuards(JwtAuthGuard)
	@Post('2fa/generate')
	async generateTwoFactor(@Req() req: Request) {
    	const userId = (req.user as { id: number }).id;
    	return this.authService.generateTwoFactorSecret(userId);
	}
}