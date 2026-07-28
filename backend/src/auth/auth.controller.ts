import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {

  constructor(private readonly authService: AuthService) {}
  

  @Post('login') // 2. Écoute les requêtes POST sur /auth/login
  async login(@Body() loginDto: LoginDto) {
    console.log('Données reçues depuis le Frontend :');

    // 3. Simulation : On vérifie avec de fausses données (Mock data)
    return this.authService.validateUser(loginDto.email, loginDto.password);
  }
}
