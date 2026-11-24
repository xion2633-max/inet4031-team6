# INET 4031: Team 6 Repository

This is the semester-long repository for our team's INET 4031 Systems Administration
project: an incident-tracking application built and operated across nine weeks,
moving from Docker Compose through Kubernetes, Infrastructure as Code, CI/CD,
observability, security hardening, and backup/recovery.

**The full in-depth lab instructions for every week are in the "Wiki" tab of each week's lab repository.**

## Team

**Team Name:** Scrum Team 6

**Team Number:** 6

**Roster:**

| Name |
|------|
| Passion Xiong |
| Milka D Tessema|
| Ayden v Chhunn|
| Trisha Xiong |

See `team-charter.md` for role assignments and the 7-sprint rotation schedule.

## Directory Structure

```
README.md              - this file
team-charter.md         - team roles, rotation schedule, operating agreements
ansible/                - playbook that grows one role per week (Weeks 1-4)
scripts/                - validation check scripts, one per week
docs/                   - sprint retrospectives, environment log, acceptance criteria, QA reports
week-1/ .. week-9/      - per-week working directories (some weeks' real deliverables
                          live in top-level dirs instead - manifests/, infrastructure/,
                          .github/workflows/ - see each week-N README for specifics)
```

## Getting Each Week's Starter Content

Starting Week 2, each week has a corresponding `inet4031-week0N` repo with starter
and reference files for that week. You pull only what you need from it into this one
repo, it will never replace this repository.

## Team Documents

**Google Doc:** https://docs.google.com/document/d/1J4TtaxulsHYQAvP6ec-7hOidk5_1yIrxYDrR5t0MFgM/edit?tab=t.0 

All sprint reflections, screenshots, and storage-check output are recorded in this
document as each week's wiki directions require.

**Project Board:** https://github.com/users/xion2633-max/projects/1/views/1

## Getting Started

1. Read the Week 1 wiki directions completely before beginning.
2. Follow Part 1, then Part 2, then Part 3 in order.
3. Before submitting, run `./scripts/check-week1.sh` from the repo root to verify
   all Week 1 requirements are met.
4. Reference `docs/qa-report-1.md` for the sign-off checklist.

## Questions or Issues

1. Check the troubleshooting notes in the wiki.
2. Consult with your team's System Admin and QA roles.
3. Contact the course instructor if blocked.

## How to Run This Project

### 1. Clone the Repository

```
git clone https://github.com/xion2633-max/inet4031-team6.git
cd inet4031-team6
```

### 2. Verify the Environment

The example configuration uses port `8096`.

```
k3d cluster list
kubectl get nodes -o wide
kubectl get deploy,svc,pods -n default
kubectl get networkpolicy -n default
kubectl get pods -n monitoring
kubectl top nodes
```

Check application health:

```
curl -i http://localhost:8096/health
```

Expected response: `HTTP 200 OK`.

### 3. Deploy Kubernetes Manifests

After completing the required pull request workflow, apply the application manifests:

```
kubectl apply -f manifests/
```

### 4. Verify Deployments

```
kubectl get deployments
kubectl get pods
kubectl get hpa
kubectl get pdb
kubectl get networkpolicy
```

### 5. Run Load Tests

**Run the baseline test** to measure application performance under normal traffic:

```
k6 run capstone/networking-cloud/k6/baseline.js
```

**Run the autoscaling test** to generate increased traffic and demonstrate Kubernetes Horizontal Pod Autoscaling:

```
k6 run load-test.js
```

In a separate terminal, monitor the HPA:

```
kubectl get hpa -w
```

The Flask deployment should scale between 1 and 5 replicas based on CPU utilization.

### 6. Run the Node Failure Drill

Run the failure drill:

```
k6 run capstone/networking-cloud/k6/drill.js
```

Follow the node-stop and recovery procedure documented for the appropriate environment.

### 7. Verify Application Health

```
curl -i http://localhost:8096/health
```

Expected response: `HTTP 200 OK`.

### 8. Save Evidence

Save test results, HPA history, failure drill timestamps, and memory calculations in:

```
capstone/networking-cloud/evidence/
```

### 9. Additional Documentation

- `capstone/networking-cloud/ARCHITECTURE.md` – Application networking and architecture.
- `capstone/networking-cloud/TOOL-VERSIONS.txt` – Installed tool versions.
- `capstone/networking-cloud/REBUILD-GAPS.md` – Fresh VM rebuild issues.
- `capstone/networking-cloud/NOTES.md` – Additional project notes.