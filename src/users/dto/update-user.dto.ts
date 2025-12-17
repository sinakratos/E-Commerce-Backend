import { PartialType } from '@nestjs/swagger';
import { RegisterDto } from '../../auth/dto/registerDto';

export class UpdateUserDto extends PartialType(RegisterDto) {}
