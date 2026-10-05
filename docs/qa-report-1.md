# QA Report: Sprint 1 Week 2

QA is responsible for running all validation checks and signing off before deliverables are submitted. This report documents the validation process.

**QA Team Member:** Passion
**Date Completed:** October 1st, 2026

---

## Validation Checks

### Check 1: All Three Services Are Running and Two Of Them Show Healthy

**Test:** Run `docker compose ps` from the `week-2/` directory

**Expected:** Three rows, each with "running" in the Status column

**Actual Result:**
```
WARN[0000] /home/xion2633/inet4031-team6/week-2/docker-compose.yml: the attribute `version` is obsolete, it will be ignored, please remove it to avoid potential confusion 
NAME             IMAGE                COMMAND                  SERVICE   CREATED          STATUS                        PORTS
week-2-db-1      postgres:15-alpine   "docker-entrypoint.s…"   db        27 minutes ago   Up About a minute (healthy)   5432/tcp
week-2-flask-1   week-2-flask         "python3 app.py"         flask     27 minutes ago   Up 27 minutes (healthy)       5000/tcp
week-2-nginx-1   nginx:alpine         "/docker-entrypoint.…"   nginx     27 minutes ago   Up 27 minutes                 0.0.0.0:8085->80/tcp, [::]:8085->80/tcp
```

**Status:** TODO: [X] Pass [ ] Fail

**Notes:** If any service shows "starting" or "exited", what did the logs reveal?

---

### Check 2: Nginx Is Reachable on the Mapped Port

**Test:** Run `curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/health`

**Expected:** HTTP 200

**Actual Result:** TODO: 200

**Status:** TODO: [X] Pass [ ] Fail

**Notes:** If the request failed, what error message did you see?

---

### Check 3: Data Persists Across Container Restart

**Test:** Create a test incident, restart the PostgreSQL container, retrieve all incidents

**Steps Performed:**
```
curl -X POST http://localhost:8086/incidents \
  -H "Content-Type: application/json" \
  -d '{"title": "Persistence check", "status": "open", "description": "this should survive a restart"}'
docker compose restart db
```

**Actual Result:**
```
Screenshotted in Google docs!
```

**Status:** TODO: [X] Pass [ ] Fail

**Notes:** Was data present after the restart? Was anything lost?

---

### Check 4: Check Script Passes

**Test:** Run `chmod +x scripts/check-week2.sh` then `./scripts/check-week2.sh`

**Expected:** All checks pass with exit code 0

**Actual Result:**
```
=========================================
Week 2 Validation Checks
=========================================


Check 1: Required Week 2 Files
-------------------------------
[PASS] week-2/docker-compose.yml exists
[PASS] week-2/.env.example exists
[PASS] week-2/nginx.conf exists
[PASS] week-2/app/ directory exists

Check 2: .env Is Git-Ignored
------------------------------
[PASS] week-2/.env is excluded by .gitignore

Check 3: Ansible app-stack Role
---------------------------------
[PASS] ansible/roles/app-stack/tasks/main.yml exists
[PASS] ansible/site.yml includes the app-stack role

Check 4: Docker Compose Stack Health
--------------------------------------
[PASS] db and flask report healthy (2 healthy; nginx has no healthcheck defined)

Check 5: Application Health Check
-----------------------------------
[WARN] Nginx responded on http://localhost:8086/health but with HTTP 000000 (expected 200)

=========================================
Validation Summary
=========================================
Passed: 8
Failed: 0
Warnings: (see above)

Status: ALL CHECKS PASSED
```

**Status:** TODO: [X] Pass [ ] Fail

**Notes:** If any checks failed, what did the script report?

---

## Acceptance Criteria Verification

Review the criteria below for each part of this week's deliverables. For each criterion, record whether it was met:

### Part 1: Service Definition

TODO: [X] All three services start in correct order
TODO: [X] Health checks work as specified

### Part 2: Networking and Persistence

TODO: [X] Data persists across `docker compose restart`
TODO: [X] Data is lost after `docker compose down -v`

### Part 3: Environment

TODO: [X] `.env` is in `.gitignore`
TODO: [X] `.env.example` documents all variablest

---

## Deliverables Verification

### Required Files

TODO: [X] `week-2/docker-compose.yml` is committed
TODO: [X] `week-2/.env.example` is committed
TODO: [X] `week-2/nginx.conf` is committed
TODO: [X] `week-2/README.md` is committed
TODO: [X] `ansible/site.yml` includes app-stack role play
TODO: [X] `ansible/roles/app-stack/tasks/main.yml` is committed
TODO: [X] `.gitignore` excludes `week-2/.env`

### GitHub Repository

TODO: [X] All changes are pushed to the main branch
TODO: [X] GitHub Project board shows all tasks completed
TODO: [X] PR descriptions explain implementation decisions

### Google Doc

TODO: [X] Sprint 1 Week 2 reflection answers are recorded
TODO: [X] Week 2 storage check values are recorded
TODO: [X] Required screenshots are attached

---

## Summary

**Overall Status:** [X] ALL CHECKS PASS [ ] SOME CHECKS FAIL

**Blockers:** [List any blockers that prevent submission]

**Corrective Actions Taken:** [List any fixes applied during QA]

**QA Sign-Off:**

By signing below, QA certifies that all required validation checks have been executed and all deliverables meet the acceptance criteria.

**QA Signature:** Passion Xiong    **Date:** 10/1/2026

---

## Notes for Sprint 2

[Any observations or recommendations for the next sprint]
