import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { CalculationHistoryService } from './calculation-history.service';
import { CreateCalculationHistoryDto } from './dto/create-calculation-history.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';

@ApiTags('Calculation History')
@Controller('api/calculations')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class CalculationHistoryController {
  constructor(
    private readonly calculationHistoryService: CalculationHistoryService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Save calculation (User)' })
  @ApiResponse({ status: 201, description: 'Calculation saved' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Variant not found' })
  async create(
    @Request() req,
    @Body() createDto: CreateCalculationHistoryDto,
  ) {
    return this.calculationHistoryService.create(req.user.id, createDto);
  }

  @Get('my')
  @ApiOperation({ summary: 'Get my calculations (User)' })
  @ApiResponse({ status: 200, description: 'List of user calculations' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findMyCalculations(@Request() req) {
    return this.calculationHistoryService.findMyCalculations(req.user.id);
  }

  @Delete(':calculationId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete calculation (User)' })
  @ApiParam({ name: 'calculationId', description: 'Calculation ID' })
  @ApiResponse({ status: 204, description: 'Calculation deleted' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Calculation not found' })
  async remove(
    @Request() req,
    @Param('calculationId', ParseUUIDPipe) calculationId: string,
  ) {
    return this.calculationHistoryService.remove(req.user.id, calculationId);
  }
}
