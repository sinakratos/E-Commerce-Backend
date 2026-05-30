import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserEntity } from 'src/users/entities/user.entity';

export const UserDecorator = createParamDecorator(
  (
    _data: keyof Express.User | undefined,
    ctx: ExecutionContext,
  ): UserEntity => {
    return ctx.switchToHttp().getRequest().user;
  },
);
