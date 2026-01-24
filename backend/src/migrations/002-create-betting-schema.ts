import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

export class CreateBettingSchema1640000000002 implements MigrationInterface {
  name = 'CreateBettingSchema1640000000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create matches table
    await queryRunner.createTable(
      new Table({
        name: 'matches',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'home_team',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'away_team',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'start_time',
            type: 'timestamp',
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['upcoming', 'live', 'finished', 'cancelled', 'postponed'],
            default: `'upcoming'`,
          },
          {
            name: 'home_score',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'away_score',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'outcome',
            type: 'enum',
            enum: ['home_win', 'away_win', 'draw'],
            isNullable: true,
          },
          {
            name: 'league',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'season',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'home_odds',
            type: 'decimal',
            precision: 5,
            scale: 2,
            default: 1.5,
          },
          {
            name: 'draw_odds',
            type: 'decimal',
            precision: 5,
            scale: 2,
            default: 3.0,
          },
          {
            name: 'away_odds',
            type: 'decimal',
            precision: 5,
            scale: 2,
            default: 2.5,
          },
          {
            name: 'metadata',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Create bets table
    await queryRunner.createTable(
      new Table({
        name: 'bets',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'user_id',
            type: 'uuid',
          },
          {
            name: 'match_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'stake_amount',
            type: 'decimal',
            precision: 18,
            scale: 8,
          },
          {
            name: 'predicted_outcome',
            type: 'enum',
            enum: ['home_win', 'away_win', 'draw'],
          },
          {
            name: 'odds',
            type: 'decimal',
            precision: 5,
            scale: 2,
          },
          {
            name: 'potential_payout',
            type: 'decimal',
            precision: 18,
            scale: 8,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['pending', 'won', 'lost', 'cancelled'],
            default: `'pending'`,
          },
          {
            name: 'settled_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'metadata',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Add foreign key for user_id
    await queryRunner.createForeignKey(
      'bets',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
        name: 'FK_bets_user_id',
      }),
    );

    // Add foreign key for match_id (SET NULL on delete to preserve historical bets)
    await queryRunner.createForeignKey(
      'bets',
      new TableForeignKey({
        columnNames: ['match_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'matches',
        onDelete: 'SET NULL',
        name: 'FK_bets_match_id',
      }),
    );

    // Create unique index to prevent duplicate bets per user per match
    await queryRunner.createIndex(
      'bets',
      new TableIndex({
        name: 'IDX_BETS_USER_MATCH_UNIQUE',
        columnNames: ['user_id', 'match_id'],
        isUnique: true,
      }),
    );

    // Create indexes for better query performance
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS IDX_MATCHES_STATUS ON matches(status)`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS IDX_MATCHES_START_TIME ON matches(start_time)`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS IDX_MATCHES_LEAGUE ON matches(league)`,
    );

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS IDX_BETS_USER_ID ON bets(user_id)`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS IDX_BETS_MATCH_ID ON bets(match_id)`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS IDX_BETS_STATUS ON bets(status)`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS IDX_BETS_CREATED_AT ON bets(created_at)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX IF EXISTS IDX_BETS_CREATED_AT`);
    await queryRunner.query(`DROP INDEX IF EXISTS IDX_BETS_STATUS`);
    await queryRunner.query(`DROP INDEX IF EXISTS IDX_BETS_MATCH_ID`);
    await queryRunner.query(`DROP INDEX IF EXISTS IDX_BETS_USER_ID`);
    await queryRunner.query(`DROP INDEX IF EXISTS IDX_MATCHES_LEAGUE`);
    await queryRunner.query(`DROP INDEX IF EXISTS IDX_MATCHES_START_TIME`);
    await queryRunner.query(`DROP INDEX IF EXISTS IDX_MATCHES_STATUS`);

    // Drop unique index
    await queryRunner.dropIndex('bets', 'IDX_BETS_USER_MATCH_UNIQUE');

    // Drop foreign keys
    await queryRunner.dropForeignKey('bets', 'FK_bets_match_id');
    await queryRunner.dropForeignKey('bets', 'FK_bets_user_id');

    // Drop tables
    await queryRunner.dropTable('bets');
    await queryRunner.dropTable('matches');
  }
}
