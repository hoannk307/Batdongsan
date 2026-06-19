import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách user (có filter keyword)' })
  findAll(@Query('keyword') keyword?: string) {
    return this.usersService.findAll(keyword);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin chi tiết 1 user theo ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật thông tin user' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { full_name?: string; phone?: string; role?: string },
  ) {
    return this.usersService.update(id, body);
  }

  @Patch(':id/block')
  @ApiOperation({ summary: 'Toggle block/unblock user' })
  toggleBlock(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.toggleBlock(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa user' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }
}
