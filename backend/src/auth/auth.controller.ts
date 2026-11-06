
import { Controller, Post, Body, Get } from '@nestjs/common';
import { Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { PasswordDto } from './dto/password.dto';
import { EmailDto } from './dto/email.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import type { Request } from 'express';

@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Post('login')
	async login(@Body() loginDto: LoginDto) {
		return this.authService.validateUser(loginDto.email, loginDto.password);
	}

	@Post('register')
	async register(@Body() registerDto: RegisterDto){
		return this.authService.registerUser(registerDto.email, registerDto.password, registerDto.validatePassword);
	}

	@UseGuards(JwtAuthGuard)
	@Post('password')
	async modifyPassword(@Body() passwordDto: PasswordDto, @Req() req: Request)
	{
    	const userId = (req.user as { id: number }).id;
    	return this.authService.password(userId, passwordDto);
	}

	@UseGuards(JwtAuthGuard)
	@Post('email')
	async modifyEmail(@Body() emailDto: EmailDto, @Req() req: Request)
	{
    	const userId = (req.user as { id: number }).id;
    	return this.authService.email(userId, emailDto);
	}


	@UseGuards(JwtAuthGuard)
	@Post('2fa/generate')
	async generateTwoFactor(@Req() req: Request) {
    	const userId = (req.user as { id: number }).id;
    	return this.authService.generateTwoFactorSecret(userId);
	}

	@UseGuards(JwtAuthGuard)
	@Post('2fa/disable')
	async disableTwoFactor(@Req() req: Request) {
    	const userId = (req.user as { id: number }).id;
    	return this.authService.disableTwoFactor(userId);
	}

	@UseGuards(JwtAuthGuard)
	@Post('2fa/confirm')
	async confirmTwoFactor(@Body() body: { token: string }, @Req() req: Request) {
		const userId = (req.user as { id: number }).id;
    	return this.authService.confirmTwoFactor(userId, body.token);
	}

	@Post('2fa/verify-login')
	async verifyTwoFactorLogin(@Body() body: { email: string; token: string }) {
    	return this.authService.verifyTwoFactorLogin(body.email, body.token);
}
}