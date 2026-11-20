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

## How to run this

How to Run This Project
1. Clone the Repository
```
git clone [<YOUR_REPOSITORY_URL>](https://github.com/xion2633-max/inet4031-team6.git)
cd inet4031-team6
```

2. Verify the Environment
```
export N=6
k3d cluster list
kubectl get nodes -o wide
kubectl get deploy,svc,pods -n default
kubectl get networkpolicy -n default
kubectl get pods -n monitoring
kubectl top nodes
```

Check application health:

```curl -i http://localhost:$((8090 + N))/health```

3. Deploy Changes

Shared VM: Apply your Kubernetes manifests after completing the required pull request workflow.

```kubectl apply -f <PATH_TO_MANIFESTS>```

4. Verify Deployments

```kubectl get deployments
kubectl get pods
kubectl get hpa
kubectl get pdb
kubectl get networkpolicy```

5. Run Load Tests

Run the autoscaling test:

```k6 run capstone/networking-cloud/k6/<AUTOSCALING_SCRIPT>.js```

Monitor autoscaling:

```kubectl get hpa -w```


Run the failure drill using the appropriate Shared VM or Local VM procedure documented in capstone/networking-cloud/RUNBOOK.md.

6. Verify Application Health

Confirm the application responds successfully:

```curl -i <YOUR_APPLICATION_HEALTH_URL>```

Expected HTTP response:

text
200 OK

7. Save Evidence

Save test results, HPA history, failure drill timestamps, and memory calculations in:

text
capstone/networking-cloud/evidence/

8. Documentation

Refer to the following files for additional information:

capstone/networking-cloud/RUNBOOK.md – Deployment, testing, and recovery instructions.
capstone/networking-cloud/ARCHITECTURE.md – Application networking and architecture.
capstone/networking-cloud/TOOL-VERSIONS.txt – Installed tool versions.
capstone/networking-cloud/REBUILD-GAPS.md – Fresh VM rebuild issues.

Important: Shared VM students must not run OpenTofu commands. Local VM students must deploy permanent infrastructure changes through OpenTofu and the Deploy gate.


