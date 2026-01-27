# Database Migration System

## Overview

This document describes the database migration system for the Renaissance API backend. Migrations provide a structured, version-controlled approach to managing database schema changes across all environments (development, staging, production).

**Key Principle:** In production, the database schema evolves exclusively through migrations—automatic synchronization is strictly disabled to prevent data loss and unexpected schema modifications.

---

## 🏗️ Architecture

### Configuration Files

1. **[database/data-source.ts](src/database/data-source.ts)** - TypeORM CLI configuration
   - Used by the TypeORM CLI to run migration commands
   - Always has `synchronize: false`
   - Loads environment variables from `.env` files

2. **[database/typeorm.config.ts](src/database/typeorm.config.ts)** - NestJS Runtime Configuration
   - Provides database config to the NestJS application
   - In development: `synchronize: true` (for rapid iteration)
   - In production: `synchronize: false` + `migrationsRun: true` (auto-execute pending migrations)
   - Respects `NODE_ENV` environment variable

3. **[app.module.ts](src/app.module.ts)** - NestJS Module Setup
   - Initializes TypeORM with runtime configuration
   - All entities registered in `TypeOrmModule.forFeature([])`

### Migration Directory

```
backend/src/migrations/
├── 001-create-initial-schema.ts        # Baseline: core tables
├── 002-create-betting-schema.ts        # Betting domain tables
├── 003-add-wallet-transactions.ts      # Wallet & transaction tracking
├── 004-add-reconciliation-reports.ts   # Reconciliation data
├── 004-create-free-bet-vouchers.ts     # Free bet system
├── 005-create-admin-audit-logs.ts      # Admin moderation audit trail
├── 1769120075412-003-add-soft-delete-columns.ts  # Soft delete timestamps
├── 1769263285299-add-spin-table.ts     # Spin/gamification feature
├── 1769272603000-add-performance-indexes.ts      # Query optimization
└── 1769293685000-add-spin-session-table.ts       # Spin session tracking
```

**Naming Convention:**
- Prefix: Sequential number (e.g., `001`, `002`) or Unix timestamp
- Description: Kebab-case, descriptive action
- Extension: `.ts` for TypeScript source files

---

## 🚀 CLI Commands

### Generate a New Migration

Generate a new migration file by comparing your entity definitions against the current database schema:

```bash
npm run migration:generate -- -n AddNewFeatureTable
```

**Output:** Creates file like `1234567890123-add-new-feature-table.ts`

**Best Practices:**
- Keep migrations focused on a single feature or change
- Always review generated migrations before committing
- Add comments explaining complex schema changes
- Test migrations locally before merging to main branch

### Run Migrations

Execute all pending migrations:

```bash
npm run migration:run
```

**When Used:**
- Manual execution in development/staging
- Automatic execution in production (via `migrationsRun: true`)
- Initial database setup

**Output:** Shows each migration executed with timestamp

### Revert a Migration

Undo the last migration:

```bash
npm run migration:revert
```

**When Used:**
- Development only
- Fixing incorrect migrations
- Testing rollback scenarios

**CAUTION:** Not recommended in production. Instead, create a new migration that undoes the problematic changes.

### Database Setup (Initial)

For fresh database initialization:

```bash
npm run db:setup
```

Runs SQL script: [scripts/setup-database.sql](../scripts/setup-database.sql)

---

## 📋 Development Workflow

### 1. Create or Modify Entities

Update entity files in `src/**/*.entity.ts`:

```typescript
// Example: src/users/entities/user.entity.ts
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  phone: string; // NEW FIELD
}
```

### 2. Generate Migration

```bash
npm run migration:generate -- -n AddPhoneToUsers
```

TypeORM compares your entity definitions with the actual schema and generates:

```typescript
// 1640123456789-add-phone-to-users.ts
export class AddPhoneToUsers1640123456789 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'phone',
        type: 'varchar',
        length: '20',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('users', 'phone');
  }
}
```

### 3. Review & Test

1. Review the generated migration for accuracy
2. Run migration locally: `npm run migration:run`
3. Test your feature with the new schema
4. If issues, fix the migration and test again
5. Revert if needed: `npm run migration:revert`

### 4. Commit

```bash
git add src/migrations/*
git commit -m "migration: add phone field to users table"
```

---

## 🔒 Production Deployment

### Pre-Deployment Checklist

✅ All migrations tested in development environment  
✅ Migrations successfully run against staging database  
✅ `synchronize: false` confirmed in production config  
✅ `migrationsRun: true` confirmed for production  
✅ Rollback plan documented (if needed)  

### Deployment Process

1. **Code Deployment:** Push code with new migrations
2. **Automatic Execution:** On production startup, migrations auto-run
   - Controlled by `migrationsRun: true` in `typeorm.config.ts`
   - Only pending migrations execute (tracked in `typeorm_metadata` table)
3. **Verification:** Monitor logs for migration success
   - Success: "Migrations executed successfully"
   - Failure: Application fails fast—no partial schema

### Rollback (if needed)

If a migration causes issues in production:

1. **Do NOT use `migration:revert`** - this is not safe for production
2. **Create a new migration** that reverts the problematic changes:

```typescript
// Example: 1640123456790-revert-phone-field.ts
export class RevertPhoneField1640123456790 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Undo the previous migration
    await queryRunner.dropColumn('users', 'phone');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Recreate the column if this rollback is reverted
    await queryRunner.addColumn('users', ...);
  }
}
```

3. Deploy the new rollback migration
4. Test thoroughly before pushing to production

---

## ⚙️ Environment Configuration

### Development (`.env.local` or `.env`)

```env
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_DATABASE=renaissance_api_dev
```

**Behavior:**
- `synchronize: true` - Entity changes auto-sync to schema
- `migrationsRun: false` - Migrations optional (auto-sync preferred for speed)
- Migration commands work normally

### Staging

```env
NODE_ENV=staging
DB_HOST=staging-db.example.com
DB_PORT=5432
DB_USERNAME=renaissance_staging
DB_PASSWORD=<secure-password>
DB_DATABASE=renaissance_api_staging
```

**Behavior:**
- `synchronize: false` - Like production
- `migrationsRun: false` - Run migrations manually before app startup
- Test all migrations here before production

### Production

```env
NODE_ENV=production
DB_HOST=prod-db.example.com
DB_PORT=5432
DB_USERNAME=renaissance_prod
DB_PASSWORD=<secure-password>
DB_DATABASE=renaissance_api_prod
```

**Behavior:**
- `synchronize: false` - STRICT: no auto-sync
- `migrationsRun: true` - Auto-execute pending migrations on startup
- Only migrations allowed to modify schema

---

## 🔍 Migration Metadata

TypeORM automatically tracks migrations in the `typeorm_metadata` table:

```sql
SELECT * FROM typeorm_metadata 
WHERE type = 'migration' 
ORDER BY timestamp DESC;
```

This table records:
- Migration name
- Execution timestamp
- Success/failure status

Example output:
```
id  | name                              | timestamp
----|-----------------------------------|------------------
1   | CreateInitialSchema1640000000001  | 1640000000001
2   | CreateBettingSchema1640000001000  | 1640000001000
3   | AddPhoneToUsers1640123456789      | 1640123456789
```

---

## 💡 Best Practices

### ✅ DO

- ✅ Keep migrations focused (one feature/table per migration)
- ✅ Always write both `up()` and `down()` methods
- ✅ Test migrations locally before committing
- ✅ Review generated migrations for accuracy
- ✅ Use descriptive names: `AddPaymentMethodTable` not `Migration123`
- ✅ Add comments for complex schema logic
- ✅ Use transactions for multi-step migrations
- ✅ Test rollback scenarios in development

### ❌ DON'T

- ❌ Manually modify the database schema in production
- ❌ Use `migration:revert` in production
- ❌ Enable `synchronize: true` in production
- ❌ Skip testing migrations before deployment
- ❌ Combine multiple unrelated changes in one migration
- ❌ Commit migrations without review
- ❌ Delete migration files after execution (keep for history/audit)
- ❌ Modify existing migrations after commit (create rollback migrations instead)

---

## 🐛 Troubleshooting

### Migration Fails with "Column Already Exists"

**Cause:** Migration already executed; metadata out of sync

**Solution:**
```bash
# Check what TypeORM thinks was executed
npm run migration:run -- --dry-run

# Manually verify typeorm_metadata table
psql -U postgres -d renaissance_api -c "SELECT * FROM typeorm_metadata WHERE type = 'migration';"
```

### Cannot Find Migration File

**Cause:** Path patterns don't match migration files

**Check:** Paths in both `database/data-source.ts` and `typeorm.config.ts` match:
```
migrations: [__dirname + '/../migrations/*{.ts,.js}']
```

### synchronize: true in Production

**Danger:** Could drop tables or corrupt schema

**Check Environment:**
```bash
# Verify production config
NODE_ENV=production node -e "console.log(process.env.NODE_ENV)"

# Check running config
curl http://localhost:3000/health  # Check if includes env info
```

### Entity Changes Not Reflected

**Cause:** Automatic sync disabled; migrations required

**Solution:**
```bash
# Generate new migration
npm run migration:generate -- -n UpdateEntityName

# Run migration
npm run migration:run

# Test application
npm run start:dev
```

---

## 📚 Migration Examples

### Example 1: Create New Table

```typescript
import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreatePaymentsTable1640000000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'payments',
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
            name: 'amount',
            type: 'decimal',
            precision: 10,
            scale: 2,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['pending', 'completed', 'failed'],
            default: `'pending'`,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
        foreignKeys: [
          {
            columnNames: ['user_id'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
        ],
        indices: [
          {
            columnNames: ['user_id'],
          },
          {
            columnNames: ['status'],
          },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('payments');
  }
}
```

### Example 2: Add Column with Constraints

```typescript
import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddPhoneToUsers1640000000002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'phone',
        type: 'varchar',
        length: '20',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('users', 'phone');
  }
}
```

### Example 3: Create Index

```typescript
import { MigrationInterface, QueryRunner, TableIndex } from 'typeorm';

export class AddIndexesToBets1640000000003 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createIndex(
      'bets',
      new TableIndex({
        name: 'idx_bets_user_status',
        columnNames: ['user_id', 'status'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('bets', 'idx_bets_user_status');
  }
}
```

---

## 📞 Support

For migration issues, questions, or contributions:

1. Check this documentation
2. Review existing migrations for patterns
3. Test locally first
4. Ask in team channels
5. File an issue with reproduction steps

---

**Last Updated:** January 27, 2026  
**Migration System Version:** 1.0.0
