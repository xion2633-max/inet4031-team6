# QA Report: Sprint 4 Week 8

QA is responsible for running all validation checks and signing off before deliverables are submitted. This report documents the validation process.

**QA Team Member:** Passion Xiong
**Date Completed:** November 10, 2026

---

## Validation Checks

### Check 1: MinIO Is Running

**Test:** Run `kubectl get pods -n backup -l app=minio`

**Expected:** one pod, `1/1 Running`

**Actual Result:**
```
NAME                     READY   STATUS    RESTARTS   AGE
minio-7bbd847df6-xrjzx   1/1     Running   0          4d19h
```

**Status:** TODO: [X] Pass [ ] Fail

**Notes:** If it is not running, check `kubectl describe pod -n backup -l app=minio`. A missing `minio-credentials` Secret (Step 3) is the most common cause.

---

### Check 2: At Least One restic Snapshot Exists

**Test:** Run `source week-8/restic-env.sh && restic snapshots`

**Expected:** At least one snapshot row

**Actual Result:**
```
repository a3bd3b53 opened (version 2, compression level auto)
ID        Time                 Host                                  Tags                Paths               Size
----------------------------------------------------------------------------------------------------------------------
302d046b  2026-11-05 19:27:17  caps-inet4031-dev-app-02.oit.umn.edu  postgres,manual     /statustracker.sql  2.337 KiB
a6f6f253  2026-11-07 10:47:28  caps-inet4031-dev-app-02.oit.umn.edu  postgres,pre-drill  /statustracker.sql  2.650 KiB
----------------------------------------------------------------------------------------------------------------------
Timestamps shown in local time
2 snapshots
```

**Status:** TODO: [X] Pass [ ] Fail

**Notes:** `restic-env.sh` reads the passwords from `week-8/.env.backup` itself, so that file must exist on the VM. The MinIO port-forward from Step 5 must also be running, or restic reports a connection error.

---

### Check 3: Recovery Drill Succeeded

**Test:** Compare the row count recorded before the drill (Step 15) to the row count after recovery (Step 22)

**Expected:** Post-restore count matches pre-drill count

**Actual Result:**
```
TODO: Pre-drill count: ___
TODO: Post-restore count: 3
```

**Status:** TODO: [X] Pass [ ] Fail

**Notes:** If the count came back as `0` instead of matching, the restore in Step 21 most likely replayed an empty dump. Check `restic dump --tag pre-drill latest /statustracker.sql | wc -l` -- a count of `0` means the pre-drill backup itself was empty. Flask's own `CREATE TABLE IF NOT EXISTS` recreates an empty table when it starts, which can look like a successful recovery but isn't.

---

### Check 4: Check Script Passes

**Test:** Run `chmod +x ./scripts/check-week8.sh` then `./scripts/check-week8.sh`

**Expected:** All checks pass with exit code 0

**Actual Result:**
```
=========================================
Week 8 Validation Checks
=========================================

Check 1: Required Files Exist
-----------------------------------
[PASS] week-8/restic-env.sh exists
[PASS] week-8/runbook.md exists
[PASS] week-8/minio.yaml exists
[PASS] .github/workflows/backup.yml exists

Check 2: Credentials Not Committed
----------------------------------------
[PASS] week-8/.env.backup is in .gitignore
[PASS] week-8/restic-env.sh contains no literal passwords (they are read from week-8/.env.backup)
[PASS] week-8/.env.backup is not tracked by git

Check 3: GitHub Actions Backup Workflow
---------------------------------------------
[PASS] backup.yml has a cron trigger
[PASS] backup.yml references restic

Check 4: Runbook Contains Required Sections
---------------------------------------------------
[PASS] Runbook contains section: Symptom
[PASS] Runbook contains section: Root Cause
[PASS] Runbook contains section: Fix
[PASS] Runbook contains section: Measured Before/After

Check 5: MinIO Is Running in the Cluster
-----------------------------------------
[PASS] MinIO pod is running and ready in the backup namespace
[PASS] MinIO Service exposes port 9000

Check 6: restic Is Installed
------------------------------
[PASS] restic is installed (restic 0.19.1 compiled with go1.26.4 (Red Hat 1.26.4-1.el9_8) on linux/amd64)

Check 7: At Least One restic Snapshot Exists
----------------------------------------------------
[PASS] At least one restic snapshot exists (3 found)

=========================================
Validation Summary
=========================================
Passed: 17
Failed: 0

Status: ALL CHECKS PASSED
```

**Status:** TODO: [X] Pass [ ] Fail

**Notes:** This script cannot verify the recovery drill itself (Check 3) -- that's confirmed manually and recorded in the Google Doc and runbook.

---

## Acceptance Criteria Verification

Review the criteria below for each part of this week's deliverables. For each criterion, record whether it was met:

### Part 1: Provision MinIO

TODO: [ ] `week-8/.env.backup` created with `MINIO_ROOT_USER`, `MINIO_ROOT_PASSWORD`, and `RESTIC_PASSWORD`, added to `.gitignore`
TODO: [ ] `minio-credentials` Secret created in the `backup` namespace
TODO: [ ] `week-8/minio.yaml` applied; MinIO pod `1/1 Running` in the `backup` namespace
TODO: [ ] MinIO port-forward running on the team's assigned MinIO port
TODO: [ ] `backups` bucket created (via a single combined `docker run` session -- two separate `docker run --rm` calls will not share an `mc` alias between them)

### Part 2: Configure restic Backups

TODO: [ ] `week-8/restic-env.sh` updated with the team's MinIO port, and contains no literal passwords
TODO: [ ] restic repository initialized (`restic init`)
TODO: [ ] At least one test backup taken by piping `kubectl exec deploy/db -- pg_dump ...` into `restic backup --stdin`, and `restic dump latest /statustracker.sql | wc -l` shows a non-zero line count
TODO: [ ] Retention policy applied (`restic forget --prune --keep-daily 7 --keep-weekly 4 --keep-monthly 3`)

### Part 3: Automated Backups via GitHub Actions

TODO: [ ] `.github/workflows/backup.yml` committed with a daily cron trigger and `workflow_dispatch`
TODO: [ ] `RESTIC_REPOSITORY`, `RESTIC_PASSWORD`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` stored as GitHub Actions secrets
TODO: [ ] Workflow manually triggered; screenshot captured of the run **failing** at `restic snapshots` with a connection-refused error -- this is the expected, correct result. `RESTIC_REPOSITORY` points at `http://localhost:<your MinIO port>`, which only resolves to your team's own machine locally; a GitHub-hosted runner has no path to reach it. A green checkmark here would actually indicate something is misconfigured, not the reverse.

### Part 4: Recovery Drill

TODO: [ ] Application healthy in the k3d cluster, MinIO port-forward running, and Flask replica count recorded before starting the drill
TODO: [ ] Pre-drill row count recorded (Step 16)
TODO: [ ] Fresh pre-drill backup taken with the `pre-drill` tag (Step 17)
TODO: [ ] `incidents` table dropped; `curl http://localhost:<your Kubernetes port>/incidents` confirmed an error response (Steps 18-19)
TODO: [ ] Flask scaled to 0 replicas before restoring (Step 20); `db` stays running, since a SQL restore goes through Postgres itself
TODO: [ ] Pre-drill dump replayed into the database with `restic dump ... | kubectl exec -i deploy/db -- psql ...` (Step 21)
TODO: [ ] Flask scaled back to its recorded replica count; post-restore row count matches pre-drill count (Steps 22-23)
TODO: [ ] RTO measured and recorded, compared against the 15-minute target (Step 24)

---

## Deliverables Verification

### Required Files

TODO: [ ] `week-8/minio.yaml` committed
TODO: [ ] `week-8/restic-env.sh` committed (MinIO port set, no passwords in it)
TODO: [ ] `.github/workflows/backup.yml` committed
TODO: [ ] `week-8/runbook.md` committed using the required format (Symptom, Root Cause, Fix, Measured Before/After)
TODO: [ ] `scripts/check-week8.sh` present and runs clean

### GitHub Repository

TODO: [ ] All changes merged into `main` through a pull request
TODO: [ ] No real MinIO/restic credentials appear anywhere in git history

### Google Doc

TODO: [ ] Screenshot of `restic snapshots` showing at least one snapshot is attached
TODO: [ ] Screenshot of the application error after `DROP TABLE` is attached
TODO: [ ] Screenshot of the application returning the correct row count after restore is attached
TODO: [ ] Screenshot of the backup workflow failing at `restic snapshots` (connection refused) is attached, with the reachability discussion answered
TODO: [ ] Screenshot of `./scripts/check-week8.sh` passing is attached
TODO: [ ] Recovery drill results recorded: start time, end time, measured RTO, row count before and after
TODO: [ ] Discussion answers recorded for Parts 1-4 (backup target failure domain, retention policy risk, RPO, RTO vs. target)
TODO: [ ] Week 8 storage check recorded, compared to Week 7 baseline

---

## Summary

**Overall Status:** [ ] ALL CHECKS PASS [ ] SOME CHECKS FAIL

**Blockers:** [List any blockers that prevent submission]

**Corrective Actions Taken:** [List any fixes applied during QA]

**QA Sign-Off:**

By signing below, QA certifies that all required validation checks have been executed and all deliverables meet the acceptance criteria.

**QA Signature:** _________________    **Date:** __________

---

## Notes for Sprint 5

[Any observations or recommendations for the next sprint]
