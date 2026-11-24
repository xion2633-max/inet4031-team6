# QA Report: Sprint 5 Week 9

QA is responsible for running all validation checks and signing off before deliverables are submitted. This report documents the validation process.

**QA Team Member:** Passion Xiong
**Date Completed:** 11.13.26

---

## Validation Checks

### Check 1: Seeded Row Count Is Approximately 50,000

**Test:** Run `kubectl exec deploy/db -- psql -U appuser -d statustracker -c "SELECT COUNT(*) FROM incidents;"`

**Expected:** Approximately 50,000 rows

**Actual Result:**
```
 count 
-------
 50003
(1 row)
```

**Status:** TODO: [X] Pass [ ] Fail

**Notes:** If the count is far off (e.g. near 0 or near 1), was `seed.py --rows 50000` re-run against a fresh Postgres container -- for example after a host reboot, since the `week-2` Compose stack does not restart automatically?

---

### Check 2: Sequential Scan Is Fixed by the New Index

**Test:** Run `kubectl exec deploy/db -- psql -U appuser -d statustracker -c "\di idx_incidents_status_created"`, then re-run `EXPLAIN (ANALYZE, BUFFERS)` on the status-filtered query from the runbook

**Expected:** Index listed by name; `EXPLAIN` output shows `Index Scan`, not `Seq Scan`

**Actual Result:**
```
                          List of relations
 Schema |             Name             | Type  |  Owner  |   Table   
--------+------------------------------+-------+---------+-----------
 public | idx_incidents_status_created | index | appuser | incidents
(1 row)
                                                                  QUERY PLAN                                                                   
-----------------------------------------------------------------------------------------------------------------------------------------------
 Bitmap Heap Scan on incidents  (cost=364.27..1516.13 rows=14949 width=124) (actual time=2.297..9.576 rows=14980 loops=1)
   Recheck Cond: (status = 'open'::text)
   Heap Blocks: exact=965
   Buffers: shared hit=1025
   ->  Bitmap Index Scan on idx_incidents_status_created  (cost=0.00..360.53 rows=14949 width=0) (actual time=2.093..2.095 rows=14980 loops=1)
         Index Cond: (status = 'open'::text)
         Buffers: shared hit=60
 Planning:
   Buffers: shared hit=102
 Planning Time: 0.908 ms
 Execution Time: 10.674 ms
(11 rows)
```

**Status:** TODO: [X] Pass [ ] Fail

**Notes:** Was `pg_stat_statements` confirmed loaded via `SHOW shared_preload_libraries;` before it was queried (Step 13a)? `CREATE EXTENSION IF NOT EXISTS pg_stat_statements` alone does not load it, and the stats query will error at runtime if this step was skipped.

---

### Check 3: CPU Throttle Rate Is Near Zero After the Fix

**Test:** Run the throttle-rate query from the wiki's Validation Checks section (`rate(container_cpu_cfs_throttled_periods_total{container="flask"}[5m])/rate(container_cpu_cfs_periods_total{container="flask"}[5m])`)

**Expected:** `PASS` (rate < 0.01)

**Actual Result:**
```
PASS
```

**Status:** TODO: [X] Pass [ ] Fail

**Notes:** Did the ramped load test that produced this reading actually target your team's Kubernetes port (`k6 run -e BASE_URL=http://localhost:<your Kubernetes port> ...`)? Without `-e BASE_URL`, the test defaults to `http://localhost:8080`, which never reaches the throttled pods -- that reads as a clean "no throttling" result regardless of what the CPU limit is set to. Also confirm the metric name used was `container_cpu_cfs_throttled_periods_total`, not `_seconds_total` -- the latter is cgroup v1-only and returns no data at all on cgroup v2 hosts (the default on modern Docker/k3d setups).

---

### Check 4: k6 Smoke Test Passes Its Threshold

**Test:** Run `k6 run week-9/smoke-test.js`

**Expected:** Both thresholds (`p(95)<500`, `rate<0.01`) show passing (✓) in the summary

**Actual Result:**
```
  execution: local
     script: week-9/smoke-test.js
     output: -

  scenarios: (100.00%) 1 scenario, 5 max VUs, 1m30s max duration (incl. graceful stop):
           * default: 5 looping VUs for 1m0s (gracefulStop: 30s)


     ✓ status is 200
     ✓ response time < 500ms

     checks.........................: 100.00% ✓ 570      ✗ 0  
     data_received..................: 6.1 MB  101 kB/s
     data_sent......................: 25 kB   420 B/s
     http_req_blocked...............: avg=613.96µs min=144.14µs med=550.63µs max=2.08ms   p(90)=929.74µs p(95)=1.16ms  
     http_req_connecting............: avg=464.07µs min=103.19µs med=404.69µs max=1.91ms   p(90)=720.69µs p(95)=970.34µs
   ✓ http_req_duration..............: avg=58.19ms  min=34.01ms  med=57.82ms  max=99.93ms  p(90)=70.28ms  p(95)=75.92ms 
       { expected_response:true }...: avg=58.19ms  min=34.01ms  med=57.82ms  max=99.93ms  p(90)=70.28ms  p(95)=75.92ms 
   ✓ http_req_failed................: 0.00%   ✓ 0        ✗ 285
     http_req_receiving.............: avg=573.8µs  min=102.9µs  med=241.55µs max=9.67ms   p(90)=1.19ms   p(95)=2.22ms  
     http_req_sending...............: avg=99.81µs  min=21.95µs  med=84.47µs  max=897.94µs p(90)=138.56µs p(95)=182.37µs
     http_req_tls_handshaking.......: avg=0s       min=0s       med=0s       max=0s       p(90)=0s       p(95)=0s      
     http_req_waiting...............: avg=57.52ms  min=33.63ms  med=57.42ms  max=99.16ms  p(90)=69.9ms   p(95)=75.08ms 
     http_reqs......................: 285     4.715676/s
     iteration_duration.............: avg=1.05s    min=1.03s    med=1.05s    max=1.1s     p(90)=1.07s    p(95)=1.07s   
     iterations.....................: 285     4.715676/s
     vus............................: 5       min=5      max=5
     vus_max........................: 5       min=5      max=5


running (1m00.4s), 0/5 VUs, 285 complete and 0 interrupted iterations
default ✓ [======================================] 5 VUs  1m0s
```

**Status:** TODO: [X] Pass [ ] Fail

**Notes:** Was this run against your healthy k3d application (`kubectl get pods` all `Running`), with `-e BASE_URL=http://localhost:<your Kubernetes port>`? An application that isn't up fails every request instead of failing the threshold cleanly, and can be mistaken for a performance regression.

---

### Check 5: CPU Limit Restored in the Cluster and in `flask.tf`

**Test:** Run `kubectl get deployment flask -o jsonpath='{.spec.template.spec.containers[0].resources.limits.cpu}'` and `grep -n "cpu" infrastructure/flask.tf`

**Expected:** `No changes. Your infrastructure matches the configuration.`

**Actual Result:**
```
500m
64:              cpu    = "500m"
68:              cpu    = "100m"
```

**Status:** TODO: [X] Pass [ ] Fail

**Notes:** Both should show `500m`. If the live value is still `100m`, the Step 15 `kubectl set resources` fix was not applied. Do not run `tofu plan` on the shared VM -- the OpenTofu step is predict-only this week.

---

### Check 6: Check Script Passes

**Test:** Run `chmod +x ./scripts/check-week9.sh` then `./scripts/check-week9.sh`

**Expected:** All checks pass with exit code 0

**Actual Result:**
```
==========================================
Week 9 Validation Check
==========================================

Checking database row count...
[PASS] Row count: 50003 (approximately 50,000 expected)

Checking database index...
[PASS] Index idx_incidents_status_created exists

Checking CPU throttle rate...
[PASS] CPU throttle rate: 0.0000 (< 0.01 after fix)

Checking k6 test scripts...
[PASS] smoke-test.js exists
[PASS] ramped-test.js exists

Checking runbook documentation...
[PASS] runbook.md exists
[PASS] Runbook includes Incident 1 (CPU throttling)
[PASS] Runbook includes Incident 2 (sequential scan)

Checking Flask CPU limit (live cluster and infrastructure/flask.tf)...
[PASS] Live Flask Deployment CPU limit is 500m
[PASS] infrastructure/flask.tf exists
[PASS] infrastructure/flask.tf sets a 500m CPU limit

Checking GitHub Actions CI gate...
[PASS] .github/workflows/ci.yml exists
[PASS] CI workflow includes k6 threshold gate

Checking role artifact files...
[PASS] docs/sprint-5-retrospective.md exists
[PASS] docs/qa-report-5.md exists

Checking pg_stat_statements...
[PASS] pg_stat_statements is loaded (shared_preload_libraries)

==========================================
Summary
==========================================
Passed: 16
Failed: 0

All checks passed!
```

**Status:** TODO: [X] Pass [ ] Fail

**Notes:** The script's CPU-throttle check queries Prometheus directly and requires the Step 0a port-forward (`kubectl port-forward -n monitoring service/prometheus-server <your Prometheus port>:80`) to still be running.

---

## Acceptance Criteria Verification

Review the criteria below for each part of this week's deliverables. For each criterion, record whether it was met:

### Part 1: Load the Database

TODO: [X] `seed.py --rows 50000` executed inside the `flask` container, using the app's own `DATABASE_URL`
TODO: [X] Row count verified as approximately 50,000

### Part 2: Baseline Load Test

TODO: [X] `week-9/smoke-test.js` created with `p(95)<500` and `rate<0.01` thresholds
TODO: [X] Baseline k6 run completed and screenshotted to the Google Doc

### Part 3: Ramped Load Test and USE Method Diagnosis

TODO: [X] Intentional 100m CPU limit applied to `flask` with `kubectl set resources`, per Step 9
TODO: [X] `week-9/ramped-test.js` created and run with `-e BASE_URL=http://localhost:<your Kubernetes port>`
TODO: [X] Ramped test run while re-running the USE queries with `week-5/pq.sh`
TODO: [X] Non-zero CPU throttle rate captured and screenshotted before the fix
TODO: [X] `pg_stat_statements` enabled via `shared_preload_libraries` (Step 13a) before diagnosis
TODO: [X] `EXPLAIN (ANALYZE, BUFFERS)` captured showing `Seq Scan` before the index

### Part 4: Fix Both Issues and Measure Improvement

TODO: [X] Index created with `CREATE INDEX CONCURRENTLY idx_incidents_status_created`
TODO: [X] `EXPLAIN (ANALYZE, BUFFERS)` re-run, confirms `Index Scan` replaces `Seq Scan`
TODO: [X] `infrastructure/flask.tf` CPU limit confirmed/restored to 500m
TODO: [X] Live CPU limit restored to 500m with `kubectl set resources`, `infrastructure/flask.tf` confirmed at 500m, and the [PREDICT ONLY] prediction recorded (Step 15)
TODO: [X] Ramped test re-run; RPS, P50, P95, and error rate recorded and compared to baseline
TODO: [X] CPU throttle rate re-queried and confirmed near zero

### Part 5: Add k6 Threshold Gate to CI

TODO: [X] `.github/workflows/ci.yml` has a `load-test-gate` job depending on `build-and-push`
TODO: [X] Job brings up the `week-2` Compose stack with `--wait` before running k6
TODO: [X] Job runs `k6 run week-9/smoke-test.js` as the threshold gate
TODO: [X] Teardown step runs `docker compose down -v` with `if: always()`
TODO: [X] All changes committed and pushed to `main`

---

## Deliverables Verification

### Required Files

TODO: [X] `week-9/smoke-test.js` is committed
TODO: [X] `week-9/ramped-test.js` is committed and reads its target from `BASE_URL`
TODO: [X] `week-9/runbook.md` is committed using the two-incident format, with measured values filled in (not placeholders)
TODO: [X] `infrastructure/flask.tf` reflects the corrected 500m CPU limit
TODO: [X] `.github/workflows/ci.yml` includes the `load-test-gate` job
TODO: [X] `scripts/check-week9.sh` present and runs clean

### GitHub Repository

TODO: [X] All changes are pushed to the main branch
TODO: [X] `manifests/db-deployment.yaml` committed with the `pg_stat_statements` startup flag

### Google Doc

TODO: [X] "Week 9 Baseline" k6 screenshot attached
TODO: [X] Non-zero throttle rate screenshot (before fix) attached
TODO: [X] `Seq Scan` EXPLAIN ANALYZE screenshot (before the index) attached
TODO: [X] `Index Scan` EXPLAIN ANALYZE screenshot (after the index) attached
TODO: [X] Post-fix k6 threshold-passing screenshot attached
TODO: [X] `./scripts/check-week9.sh` passing screenshot attached
TODO: [X] Discussion answers recorded for Parts 3, 4, and 5
TODO: [X] Week 9 storage check recorded

---

## Summary

**Overall Status:** [X] ALL CHECKS PASS [ ] SOME CHECKS FAIL

**Blockers:** [List any blockers that prevent submission]

**Corrective Actions Taken:** [List any fixes applied during QA]

**QA Sign-Off:**

By signing below, QA certifies that all required validation checks have been executed and all deliverables meet the acceptance criteria.

**QA Signature:** Passion Xiong    **Date:** 11.13.26

---

## Notes for Sprint 6

[Any observations or recommendations for the next sprint]
