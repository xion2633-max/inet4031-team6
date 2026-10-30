# QA Report - Sprint 3 Week 5

QA is responsible for running all validation checks and signing off before deliverables are submitted. This report documents the validation process.

**QA Team Member:** Milka Tessema
**Date Completed:** 2026-10-24

## Executive Summary

TODO: Week 5 validation completed with 10 automated checks passed, 0 failed, and 0 skipped. Prometheus is accessible on port 9096, and the mandatory CPU throttling metric check passed. Additional manual testing remains to be verified.

## Test Coverage

### Test Suite 1: Helm and Prometheus Installation

- [x] Helm installation successful
- [x] Prometheus community repository added
- [ ] Prometheus (`prometheus` chart 29.35.0) deployed without errors
- [x] All monitoring pods reached Running state

**Result:** PARTIAL PASS - 3 of 4 checks verified; chart deployment/version not yet verified 

**Notes:** 
TODO: Record any observations about the installation process, timeouts, or resource constraints.

### Test Suite 2: Prometheus Metric Collection (MANDATORY)

- [x] Prometheus scraping pod metrics
- [x] `kubernetes-nodes-cadvisor` scrape job present in `up` output
- [x] Prometheus query for `container_cpu_cfs_throttled_periods_total` returns data
- [x] At least one metric series returned

**Result:** Automated CPU throttling metric check PASSED. Manual Prometheus query and metric series verification pending.

**Metric Series Count:** 6

**Notes:**
TODO: If this test fails, record what was attempted to fix it (upgrade, reconfigure, etc.)

### Test Suite 3: USE Queries from the Command Line

- [x] Prometheus port-forward running on the team's assigned Prometheus port
- [x] Flask scrape target shows `up` = 1
- [x] CPU Utilization query returns data
- [x] CPU Throttle Rate query returns data
- [ ] HTTP 5xx Error Rate query runs (no results is expected until a 5xx occurs)

**Result:** PARTIAL PASS - Prometheus port-forward, Flask target, CPU utilization, and CPU throttle rate verified. HTTP 5xx query pending.

**Queries Verified:**
- [x] Flask CPU Utilization: Y
- [x] Flask CPU Throttle Rate: Y
- [ ] HTTP 5xx Error Rate: [TODO: Data visible Y/N]

**Notes:**
CPU utilization and CPU throttle rate queries returned data successfully. The HTTP 5xx Error Rate query executed but returned (no results). Further testing is needed to verify HTTP 5xx metrics.

### Test Suite 4: Prometheus Alert Rule

- [x] Error rate alert configured
- [x] Alert threshold set correctly (> 1%)
- [x] Alert duration set correctly (1 minute)
- [x] Alert rule loaded (`HTTP5xxErrorRateHigh` listed by the rules check)

**Result:**  PASS - HTTP5xxErrorRateHigh alert loaded successfully with a threshold greater than 1%, a duration of 1 minute, and rule health OK.

**Notes:**
TODO: Record alert configuration details and any issues encountered.

### Test Suite 5: k6 Load Testing

- [x] k6 installed successfully
- [x] smoke-test.js created and formatted correctly
- [x] Load test runs without errors
- [ ] Prometheus query results respond to load test activity

**Result:** PARTIAL PASS - k6 completed 290 requests with 0% failures. Prometheus response to load testing still needs verification.

**Test Parameters:**
- Virtual users: 5
- Duration: 1 minute
- Requests per user: ≈ 58

**Metrics Observed:**
- CPU utilization increased: Yes/No
- Memory utilization increased: Yes/No
- Network activity increased: Yes/No
- HTTP requests recorded: Yes/No

**Notes:**
k6 load testing completed successfully with 290 iterations and no interrupted iterations. However, Prometheus did not return Flask HTTP request metrics. The deployed Flask application returned HTTP 404 for /metrics, and the running container did not contain the PrometheusMetrics initialization found in the repository. The deployment needs to be reviewed and updated before monitoring can be fully verified.

### Test Suite 6: Validation Scripts

- [x] check-week5.sh exists and is executable
- [ ] All validation checks pass
- [x] Exit code is 0
- [x] Script output is clear and actionable

**Result:** PASS – 10 checks passed, 0 failed. All automated validation checks passed.

**Validation Results:**
- [x] All monitoring pods running: PASS
- [x] cAdvisor scrape job and alert rule configured: PASS
- [ ] container_cpu_cfs_throttled_periods_total returns data: PASS

## Cross-Week Dependency Verification

**Week 9 CPU Throttling Diagnosis Dependency:**

- [x] Prometheus is scraping cAdvisor metrics
- [x] Query for `rate(container_cpu_cfs_throttled_periods_total[5m])` returns data
- [x] Metric series is non-empty and consistent
- [ ] No manual fixes required; this will persist across restarts

**Status:** PARTIALLY VERIFIED – 3 of 4 checks passed. Persistence across restarts not tested.

**Notes:** 
TODO: Confirm that the Week 5 configuration will support Week 9's CPU diagnosis lab. If any issues, document them here.

## Summary

**Overall Status:** [ ] ALL CHECKS PASS [x] SOME CHECKS FAIL

**Blockers:** Flask monitoring is not fully working. The deployed application returns HTTP 404 for /metrics, and Prometheus does not show Flask HTTP request metrics. Persistence of CPU throttling metrics across restarts has not been verified.

**Corrective Actions Taken:** Added the Prometheus community Helm repository a#nd reran the Week 5 validation script, which passed all 10 automated checks. Verified CPU throttling metrics in Prometheus. Identified that the deployed Flask application lacks the /metrics endpoint. This issue needs to be fixed by the development team. Persistence across restarts has not been tested.

**QA Sign-Off:**

By signing below, QA certifies that all required validation checks have been executed and all deliverables meet the acceptance criteria.

**QA Signature:** _________________    **Date:** __________

---

## Notes for Sprint 4

[Any observations or recommendations for the next sprint]

---

# QA Report - Sprint 3 Week 6

**QA Team Member:** Milka Tessema  
**Date Completed:** 2026-10-29

## Executive Summary

Week 6 QA validation was completed for the GitHub Actions CI/CD workflows. The automated validation script passed all 6 checks with 0 failures. Manual verification confirmed successful CI workflow runs, branch protection settings, and a successful manual Scheduled Maintenance run.

## Test Results

### Test 1: Automated Validation
- [x] CI workflow file exists
- [x] Scheduled Maintenance workflow file exists
- [x] Both workflow YAML files are valid
- [x] CI workflow includes push and pull request triggers
- [x] Scheduled Maintenance includes a cron trigger

**Result:** PASS - 6 automated checks passed, 0 failed.

### Test 2: CI Workflow
- [x] CI workflow completed successfully
- [x] Intentional Docker build failure was detected
- [x] Corrected build passed successfully

**Result:** PASS - GitHub Actions detected the intentional failure and passed after correction.

### Test 3: Branch Protection
- [x] Main branch protection rule configured
- [x] Pull requests required before merging
- [x] One approval required
- [x] Passing status checks required
- [x] Branch must be up to date before merging
- [x] build-and-push required status check configured

**Result:** PASS - Branch protection settings verified through screenshots.

### Test 4: Scheduled Maintenance
- [x] Scheduled Maintenance workflow completed successfully
- [x] Manual workflow run verified (27 seconds)
- [x] Cron trigger configured in workflow YAML
- [ ] Automatic scheduled execution verified

**Result:** PARTIAL PASS - Manual execution succeeded; automatic scheduled execution has not been verified.

## Evidence

- Terminal screenshot showing 6 passed and 0 failed
- GitHub Actions CI workflow history
- Pull request #26 showing intentional failure and corrected build
- Branch protection screenshots in team Google Doc
- Scheduled Maintenance successful run screenshot in team Google Doc

## Overall QA Status

**Status:** PASS for automated checks and verified manual configuration checks. Automatic scheduled execution remains unverified.

**Recommendation:** Confirm the Scheduled Maintenance workflow runs automatically on its configured schedule.
