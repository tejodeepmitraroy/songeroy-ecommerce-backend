import type { CustomDecorator } from '@nestjs/common';
import { SetMetadata } from '@nestjs/common';
import type { RoleName } from '@prisma/client';

import { ROLES_KEY } from '../constants/metadata.constant.js';

export const Roles = (...roles: RoleName[]): CustomDecorator<string> =>
  SetMetadata(ROLES_KEY, roles);
