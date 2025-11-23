import { PartialType, ApiProperty } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import { Role } from 'src/common/enums/Role.enum';

export class UpdateUserDto extends PartialType(CreateUserDto) {}
