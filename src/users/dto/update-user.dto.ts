import { PartialType, ApiProperty } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import { Role } from 'src/common/enums/Role.enum';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiProperty({ example: 'newemail@example.com', required: false })
  email?: string;

  @ApiProperty({ example: 'NewPassword123!', required: false })
  password?: string;

  @ApiProperty({ example: '989123456789', required: false })
  phone?: string;

  @ApiProperty({ example: 'ADMIN', required: false })
  role?: Role;
}
