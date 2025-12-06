import { PartialType } from '@nestjs/swagger';
import { CreateCustomPriceDto } from './create-custom-price.dto';

export class UpdateCustomPriceDto extends PartialType(CreateCustomPriceDto) {}
