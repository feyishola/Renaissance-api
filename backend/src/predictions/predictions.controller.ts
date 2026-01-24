import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { PredictionsService } from './predictions.service';
import { CreatePredictionDto } from './dto/create-prediction.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('predictions')
@UseGuards(JwtAuthGuard)
export class PredictionsController {
  constructor(private readonly predictionsService: PredictionsService) {}

  @Post()
  create(@Request() req, @Body() createPredictionDto: CreatePredictionDto) {
    return this.predictionsService.create(req.user.id, createPredictionDto);
  }

  @Get('me')
  findAll(@Request() req) {
    return this.predictionsService.findAllByUser(req.user.id);
  }
}
