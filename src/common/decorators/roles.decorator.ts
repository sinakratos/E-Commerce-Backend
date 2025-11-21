import { SetMetadata } from '@nestjs/common';
import { Role } from 'src/common/enums/Role.enum';

export const Roles = (...roles: Role[]) => SetMetadata('roles', roles);
