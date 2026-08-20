import { Controller } from '@nestjs/common';
import { MatchService } from './match.service';
import { ValideteDto } from './dto/validate.dto';
import { Post, Body } from '@nestjs/common';

@Controller('match')
export class MatchController {
  constructor(private readonly matchService: MatchService) {}

  @Post('validete')
  async rejected(@Body() valideteDto: ValideteDto) {
    return this.matchService.rejected(valideteDto);
  }
}
