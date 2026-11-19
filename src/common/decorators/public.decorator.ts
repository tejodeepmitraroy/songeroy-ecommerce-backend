import type { CustomDecorator } from '@nestjs/common';
import { SetMetadata } from '@nestjs/common';

import { IS_PUBLIC_KEY } from '../constants/metadata.constant.js';

export const Public = (): CustomDecorator<string> => SetMetadata(IS_PUBLIC_KEY, true);
