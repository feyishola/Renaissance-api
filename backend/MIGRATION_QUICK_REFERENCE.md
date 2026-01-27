# Database Migration Quick Reference

## 🚀 Most Common Tasks

### When You Modify an Entity

```bash
# 1. Add/change @Column in entity file
# 2. Generate migration automatically
npm run migration:generate -- -n AddNewFieldName

# 3. Test locally
npm run migration:run

# 4. Start app to verify
npm run start:dev

# 5. Revert if needed
npm run migration:revert

# 6. Commit
git add src/migrations/*.ts
git commit -m "migration: add new field"
```

### Before Deploying

```bash
# Quick checklist (full list in MIGRATION_CHECKLIST.md)
- [ ] Tested locally with migration:run
- [ ] App boots successfully after migration
- [ ] Rollback tested with migration:revert
- [ ] Migration file reviewed for SQL errors
- [ ] Migration file committed to git
- [ ] All team members notified
```

### Emergency: Rollback (Development Only)

```bash
# ⚠️ DEVELOPMENT ONLY
npm run migration:revert

# ❌ DO NOT USE IN PRODUCTION
# Instead: Create new migration that undoes changes
npm run migration:generate -- -n RevertPreviousChange
```

---

## 📋 Migration States

### Development (`NODE_ENV=development`)
```
✅ Auto-sync enabled (for speed)
✅ Migrations run manually
✅ Revert safe (migration:revert works)
✅ Test environment
```

### Staging (`NODE_ENV=staging`)
```
✅ Auto-sync disabled (like production)
✅ Migrations run manually
✅ Test all migrations here first
✅ Gateway to production
```

### Production (`NODE_ENV=production`)
```
❌ Auto-sync disabled (REQUIRED)
✅ Migrations auto-run on startup
❌ No manual intervention needed
⚠️ Requires careful review before deployment
```

---

## 🔧 CLI Commands

| Command | Purpose | Safety |
|---------|---------|--------|
| `npm run migration:generate -- -n Name` | Auto-generate from entities | ✅ Safe (creates file only) |
| `npm run migration:run` | Execute pending migrations | ⚠️ Modifies DB (test first) |
| `npm run migration:revert` | Undo last migration | ❌ DEV ONLY (dangerous) |
| `npm run schema:sync` | Sync without migrations | ❌ DEV ONLY (risky) |
| `npm run schema:drop` | Delete all tables | 💀 EXTREMELY DANGEROUS |

---

## ⚠️ Do's and Don'ts (Quick Version)

### ✅ DO
- Generate migrations when you change entities
- Test migrations locally before pushing
- Write both `up()` and `down()` methods
- Include reason in migration comments

### ❌ DON'T
- Manually modify database schema in production
- Skip testing migrations locally
- Delete migration files after execution
- Use `migration:revert` in production
- Enable `synchronize: true` in production

---

## 🆘 When Things Go Wrong

### Migration Fails to Execute
```bash
# Check what TypeORM thinks was run
npm run migration:run -- --dry-run

# Check database metadata table
psql -U postgres -d renaissance_api -c \
  "SELECT * FROM typeorm_metadata WHERE type = 'migration';"
```

### Entity Changes Not Applied
```bash
# Verify migration was generated
ls -la src/migrations/

# Ensure migration was run
npm run migration:run

# Check app config
grep "synchronize" src/database/typeorm.config.ts
```

### Production Issues
1. Check logs for migration errors
2. Do NOT use `migration:revert`
3. Create new migration that undoes changes
4. Restore from backup if data corrupted
5. Test rollback in staging first

---

## 📞 Need Help?

1. **Full Documentation:** Read `backend/MIGRATIONS.md`
2. **Before Deployment:** Use `backend/MIGRATION_CHECKLIST.md`
3. **Examples:** Check existing migrations in `src/migrations/`
4. **Questions:** Ask team in #database-migrations channel

---

**Remember:** Migrations = Controlled schema evolution. Always test locally first!

---

**Quick Fact:** Your migration system is now **production-ready** with auto-sync disabled and migrations as the single source of schema truth. ✅
