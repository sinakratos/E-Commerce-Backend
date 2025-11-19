import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, MinLength } from 'class-validator';
import { Role } from 'src/common/enums/Role.enum';

export class CreateUserDto {
  @ApiProperty({ example: 'sina' })
  @IsNotEmpty()
  username: string;

  @ApiProperty({ example: 'sina@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'StrongPass123!' })
  @MinLength(6)
  password: string;

  @ApiProperty({ enum: Role, example: Role.USER })
  @IsEnum(Role)
  role: Role;
}
