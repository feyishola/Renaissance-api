# Migration Pre-Deployment Checklist

Use this checklist before deploying database migrations to any environment.

## 🔍 Pre-Commit (Local Development)

- [ ] Migration generated with: `npm run migration:generate -- -n DescriptiveName`
- [ ] Generated migration file reviewed for accuracy and correctness
- [ ] Migration includes both `up()` and `down()` methods
- [ ] Migration tested locally: `npm run migration:run`
- [ ] Application started successfully after migration: `npm run start:dev`
- [ ] Database state verified (use `psql` or GUI tool)
- [ ] Rollback tested: `npm run migration:revert` (if safe)
- [ ] Migration re-applied to verify idempotency
- [ ] Migration file named following convention: `NNN-description.ts` or `TIMESTAMP-description.ts`
- [ ] No hardcoded credentials or secrets in migration code
- [ ] Complex migrations include explanatory comments

## 📝 Pre-PR (Code Review)

- [ ] Migration included in PR/commit
- [ ] Migration diff reviewed by teammate
- [ ] Migration logic aligns with entity changes
- [ ] No SQL injection vulnerabilities
- [ ] Large migrations have performance impact analysis
- [ ] Rollback plan documented (if high-risk)
- [ ] Migration doesn't violate business logic constraints

## 🧪 Pre-Staging Deployment

- [ ] All migrations tested in development
- [ ] Code changes deployed to staging
- [ ] Migration run against staging database: `npm run migration:run`
- [ ] Application boots successfully in staging
- [ ] Database state verified in staging
- [ ] No errors in application logs post-migration
- [ ] Related features tested end-to-end in staging
- [ ] Rollback procedure documented for emergencies

## 🔐 Pre-Production Deployment

- [ ] Migration successfully tested in staging ✅
- [ ] Database backup created (DBA/DevOps responsibility)
- [ ] Maintenance window scheduled (if needed)
- [ ] Rollback plan communicated to team
- [ ] `NODE_ENV=production` confirmed in config
- [ ] `synchronize: false` verified in typeorm.config.ts
- [ ] `migrationsRun: true` verified in typeorm.config.ts
- [ ] Production database credentials secured
- [ ] Monitoring/alerting configured for migration execution
- [ ] Team notified of deployment schedule
- [ ] On-call support available during deployment

## ⚡ Deployment Execution

- [ ] Pre-deployment backup verified
- [ ] Application deployment started
- [ ] Migration auto-executes on startup (migrationsRun: true)
- [ ] Monitor logs: "Migrations executed successfully"
- [ ] No errors or warnings in application logs
- [ ] Critical endpoints tested (health check, API calls)
- [ ] Database queries execute normally
- [ ] Monitor performance metrics post-deployment

## ✅ Post-Deployment

- [ ] All features working as expected
- [ ] No data corruption observed
- [ ] No performance regressions
- [ ] Application logs clean (no warnings)
- [ ] Database backup retained for 7 days
- [ ] Migration tracked in `typeorm_metadata` table
- [ ] Deployment documented in changelog
- [ ] Team notified of successful deployment

## 🚨 If Issues Occur

- [ ] Identify root cause of failure
- [ ] Do NOT use `migration:revert` in production
- [ ] If safe: Restore from backup
- [ ] If rollback needed: Create new migration to undo changes
- [ ] Test rollback migration in development/staging
- [ ] Deploy rollback migration to production
- [ ] Post-incident review scheduled
- [ ] Lessons learned documented

---

## High-Risk Migration Signs ⚠️

Be extra cautious with these scenarios:

- ⚠️ **Large table migrations** - Can lock tables during off-peak hours
- ⚠️ **Data type changes** - May cause data loss if not careful
- ⚠️ **Foreign key additions** - Can fail if constraint violations exist
- ⚠️ **Enum changes** - May require data cleanup
- ⚠️ **Index creation on large tables** - Can cause downtime
- ⚠️ **Dropping columns with data** - Irreversible; ensure backup exists

For high-risk migrations:
1. Plan maintenance window
2. Notify users of potential downtime
3. Have rollback migration ready
4. Test extensively in staging
5. Have DBA review migration
6. Execute during low-traffic period

---

## Migration Categories

### 🟢 Low-Risk
- Adding nullable columns
- Adding new tables with no foreign keys
- Dropping unused columns (already soft-deleted)
- Creating indexes
- Modifying column comments

### 🟡 Medium-Risk
- Adding foreign key constraints
- Modifying enum values (expansion)
- Renaming columns
- Changing column size (varchar limits)
- Changing NOT NULL constraints on empty columns

### 🔴 High-Risk
- Dropping tables
- Dropping columns (data loss)
- Changing column types
- Removing enum values
- Modifying primary keys
- Mass data transformations

---

## Rollback Decision Matrix

| Scenario | Action |
|----------|--------|
| Migration failed immediately (app won't boot) | Restore from backup |
| Migration succeeded but broke feature | Create rollback migration |
| Data corruption discovered | Restore from backup + create fix migration |
| Performance degradation | Analyze indexes, consider rebuild |
| Partial data loss | Investigate + restore if backup exists |

---

**Last Updated:** January 27, 2026
