import { Controller } from '@nestjs/common';
import { MatchService } from './match.service';
import { ValideteDto } from './dto/validate.dto';
import { Post, Body, Get } from '@nestjs/common';

@Controller('match')
export class MatchController {
  constructor(private readonly matchService: MatchService) {}

  @Post('validete')
  async rejected(@Body() valideteDto: ValideteDto) {
    return this.matchService.rejected(valideteDto);
  }

  @Get('other')
  getOther() {
    return this.matchService.getOtherProfile();
  }
}
