import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PublicApiGuard } from './public-api.guard';
import { publicApiDocs } from './public-api.docs';
import { PublicApiService } from './public-api.service';
import { CreatePublicUserDto } from './dto/create-public-user.dto';
import { UpdatePublicUserDto } from './dto/update-public-user.dto';

@Controller('public')
@UseGuards(PublicApiGuard)
export class PublicApiController {
  constructor(private readonly publicApiService: PublicApiService) {}

  @Get('docs')
  docs() {
    return publicApiDocs;
  }

  @Get('users')
  listUsers(@Query('limit') limit?: string, @Query('offset') offset?: string) {
    return this.publicApiService.listUsers(Number(limit), Number(offset));
  }

  @Get('users/:id')
  getUser(@Param('id', ParseIntPipe) id: number) {
    return this.publicApiService.getUser(id);
  }

  @Post('users')
  createUser(@Body() dto: CreatePublicUserDto) {
    return this.publicApiService.createUser(dto);
  }

  @Put('users/:id')
  updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePublicUserDto,
  ) {
    return this.publicApiService.updateUser(id, dto);
  }

  @Delete('users/:id')
  deleteUser(@Param('id', ParseIntPipe) id: number) {
    return this.publicApiService.deleteUser(id);
  }
}
