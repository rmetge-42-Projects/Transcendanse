//recoit les demandes du front et defini les routes

import { Controller, Post, Body, Get } from '@nestjs/common';
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

	//pour l'authentification42
	@Get('login42') 
	async login42() {
		return this.authService.login42();
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

	//genere la double authentification pour la premiere fois
	@UseGuards(JwtAuthGuard)
	@Post('2fa/generate')
	async generateTwoFactor(@Req() req: Request) {
    	const userId = (req.user as { id: number }).id;
    	return this.authService.generateTwoFactorSecret(userId);
	}

	//regarde si le user veux la 2fa
	@UseGuards(JwtAuthGuard)
	@Post('2fa/confirm')
	async confirmTwoFactor(@Body() body: { token: string }, @Req() req: Request) {
		const userId = (req.user as { id: number }).id;
    	return this.authService.confirmTwoFactor(userId, body.token);
	}

	//genere la 2fa pour les connexion
	@Post('2fa/verify-login')
	async verifyTwoFactorLogin(@Body() body: { email: string; token: string }) {
    	return this.authService.verifyTwoFactorLogin(body.email, body.token);
}
}