import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
  ParseIntPipe,
  DefaultValuePipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { MatchesService, PaginatedMatches } from './matches.service';
import { Match, MatchStatus } from './entities/match.entity';
import {
  CreateMatchDto,
  UpdateMatchDto,
  UpdateMatchStatusDto,
} from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/guards/roles.guard';
import { UserRole } from '../users/entities/user.entity';

@Controller('matches')
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  /**
   * Create a new match (Admin only)
   */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async createMatch(@Body() createMatchDto: CreateMatchDto): Promise<Match> {
    return this.matchesService.createMatch(createMatchDto);
  }

  /**
   * Get all matches with pagination and filters (Public)
   */
  @Get()
  async getMatches(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('status') status?: MatchStatus,
    @Query('league') league?: string,
    @Query('season') season?: string,
    @Query('homeTeam') homeTeam?: string,
    @Query('awayTeam') awayTeam?: string,
    @Query('startTimeFrom') startTimeFrom?: string,
    @Query('startTimeTo') startTimeTo?: string,
  ): Promise<PaginatedMatches> {
    const filters = {
      status,
      league,
      season,
      homeTeam,
      awayTeam,
      startTimeFrom: startTimeFrom ? new Date(startTimeFrom) : undefined,
      startTimeTo: startTimeTo ? new Date(startTimeTo) : undefined,
    };

    // Remove undefined values
    Object.keys(filters).forEach(
      (key) => filters[key] === undefined && delete filters[key],
    );

    return this.matchesService.getMatches(page, limit, filters);
  }

  /**
   * Get upcoming matches (Public)
   */
  @Get('upcoming')
  async getUpcomingMatches(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ): Promise<PaginatedMatches> {
    return this.matchesService.getUpcomingMatches(page, limit);
  }

  /**
   * Get live matches (Public)
   */
  @Get('live')
  async getLiveMatches(): Promise<Match[]> {
    return this.matchesService.getLiveMatches();
  }

  /**
   * Get finished matches (Public)
   */
  @Get('finished')
  async getFinishedMatches(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ): Promise<PaginatedMatches> {
    return this.matchesService.getFinishedMatches(page, limit);
  }

  /**
   * Get a specific match by ID (Public)
   */
  @Get(':id')
  async getMatchById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<Match> {
    return this.matchesService.getMatchById(id);
  }

  /**
   * Update a match (Admin only)
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async updateMatch(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateMatchDto: UpdateMatchDto,
  ): Promise<Match> {
    return this.matchesService.updateMatch(id, updateMatchDto);
  }

  /**
   * Update match status and scores (Admin only)
   */
  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async updateMatchStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateStatusDto: UpdateMatchStatusDto,
  ): Promise<Match> {
    return this.matchesService.updateMatchStatus(id, updateStatusDto);
  }

  /**
   * Cancel a match (Admin only)
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  async deleteMatch(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{ message: string }> {
    return this.matchesService.deleteMatch(id);
  }
}
