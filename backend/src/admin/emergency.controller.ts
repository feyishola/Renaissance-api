import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { EmergencyPauseGuard, EMERGENCY_PAUSE_KEY } from '../auth/guards/emergency-pause.guard';
import { EmergencyPauseAction } from '../auth/decorators/contract-roles.decorator';
import { SetMetadata } from '@nestjs/common';

// Emergency action metadata decorator
export const EmergencyAction = (action: string, description: string) =>
  SetMetadata(EMERGENCY_PAUSE_KEY, { action, description });

class EmergencyPauseDto {
  reason: string;
  contractAddress?: string;
}

class EmergencyUnpauseDto {
  reason: string;
  contractAddress?: string;
}

@ApiTags('Emergency Actions')
@Controller('admin/emergency')
@UseGuards(JwtAuthGuard, EmergencyPauseGuard)
@ApiBearerAuth('JWT-auth')
export class EmergencyController {
  private readonly logger = new Logger(EmergencyController.name);

  /**
   * Emergency pause all contract operations
   * POST /admin/emergency/pause
   * Requires EMERGENCY_PAUSE or ADMIN role
   */
  @Post('pause')
  @EmergencyPauseAction('emergency_pause_contracts')
  @EmergencyAction('pause_contracts', 'Emergency pause of all smart contract operations')
  @ApiOperation({
    summary: 'Emergency pause contracts',
    description: 'Immediately pause all smart contract operations. Requires EMERGENCY_PAUSE or ADMIN role.',
  })
  @ApiResponse({
    status: 200,
    description: 'Contracts paused successfully',
    schema: {
      example: {
        success: true,
        action: 'emergency_pause',
        timestamp: '2026-01-22T10:30:00Z',
        pausedBy: 'user-id',
        reason: 'Security incident detected',
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - requires EMERGENCY_PAUSE or ADMIN role',
  })
  async emergencyPause(
    @Body() dto: EmergencyPauseDto,
    @Req() req: Request,
  ): Promise<{
    success: boolean;
    action: string;
    timestamp: string;
    pausedBy: string;
    reason: string;
    contractAddress?: string;
  }> {
    const userId = (req as any).user?.id;

    this.logger.warn(`EMERGENCY PAUSE initiated by user ${userId}: ${dto.reason}`);

    // TODO: Implement actual contract pause logic via SorobanService
    // await this.sorobanService.emergencyPause(dto.contractAddress);

    return {
      success: true,
      action: 'emergency_pause',
      timestamp: new Date().toISOString(),
      pausedBy: userId,
      reason: dto.reason,
      contractAddress: dto.contractAddress,
    };
  }

  /**
   * Emergency unpause contract operations
   * POST /admin/emergency/unpause
   * Requires EMERGENCY_PAUSE or ADMIN role
   */
  @Post('unpause')
  @EmergencyPauseAction('emergency_unpause_contracts')
  @EmergencyAction('unpause_contracts', 'Emergency unpause of smart contract operations')
  @ApiOperation({
    summary: 'Emergency unpause contracts',
    description: 'Resume smart contract operations after emergency pause. Requires EMERGENCY_PAUSE or ADMIN role.',
  })
  @ApiResponse({
    status: 200,
    description: 'Contracts unpaused successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - requires EMERGENCY_PAUSE or ADMIN role',
  })
  async emergencyUnpause(
    @Body() dto: EmergencyUnpauseDto,
    @Req() req: Request,
  ): Promise<{
    success: boolean;
    action: string;
    timestamp: string;
    unpausedBy: string;
    reason: string;
    contractAddress?: string;
  }> {
    const userId = (req as any).user?.id;

    this.logger.warn(`EMERGENCY UNPAUSE initiated by user ${userId}: ${dto.reason}`);

    // TODO: Implement actual contract unpause logic via SorobanService
    // await this.sorobanService.emergencyUnpause(dto.contractAddress);

    return {
      success: true,
      action: 'emergency_unpause',
      timestamp: new Date().toISOString(),
      unpausedBy: userId,
      reason: dto.reason,
      contractAddress: dto.contractAddress,
    };
  }

  /**
   * Emergency freeze user account
   * POST /admin/emergency/freeze-user
   * Requires EMERGENCY_PAUSE or ADMIN role
   */
  @Post('freeze-user')
  @EmergencyPauseAction('emergency_freeze_user')
  @EmergencyAction('freeze_user', 'Emergency freeze of user account and funds')
  @ApiOperation({
    summary: 'Emergency freeze user account',
    description: 'Immediately freeze a user account and prevent all transactions. Requires EMERGENCY_PAUSE or ADMIN role.',
  })
  @ApiResponse({
    status: 200,
    description: 'User account frozen successfully',
  })
  async emergencyFreezeUser(
    @Body() dto: { userId: string; reason: string },
    @Req() req: Request,
  ): Promise<{
    success: boolean;
    action: string;
    timestamp: string;
    frozenBy: string;
    userId: string;
    reason: string;
  }> {
    const adminId = (req as any).user?.id;

    this.logger.warn(`EMERGENCY FREEZE initiated by admin ${adminId} for user ${dto.userId}: ${dto.reason}`);

    // TODO: Implement user freeze logic

    return {
      success: true,
      action: 'emergency_freeze_user',
      timestamp: new Date().toISOString(),
      frozenBy: adminId,
      userId: dto.userId,
      reason: dto.reason,
    };
  }

  /**
   * Emergency status check
   * GET /admin/emergency/status
   * Check current emergency pause status
   */
  @Post('status')
  @EmergencyPauseAction('emergency_status_check')
  @EmergencyAction('status_check', 'Check emergency pause status')
  @ApiOperation({
    summary: 'Emergency status check',
    description: 'Check the current emergency pause status of contracts.',
  })
  async emergencyStatus(): Promise<{
    paused: boolean;
    pausedAt?: string;
    pausedBy?: string;
    reason?: string;
  }> {
    // TODO: Implement status check logic
    return {
      paused: false,
    };
  }
}
