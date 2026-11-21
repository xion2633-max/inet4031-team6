# Capstone Notes: Networking and Cloud Infrastructure (Team 6)

Every command that worked, in the order we ran it. This file becomes our RUNBOOK and rebuild script for Week 13.

**Rule:** if you run a command that changes the cluster or the repo, add it here (or in a script in git) with the date and your name.

## Team 6 Settings

| Setting | Value |
|---|---|
| VM | `caps-inet4031-dev-app-02.oit.umn.edu` (Shared VM, RHEL) |
| Repo | `github.com/xion2633-max/inet4031-team6` (branch: `main`, changes by PR only) |
| k3d cluster | `team6` (3 nodes: `k3d-team6-server-0`, `k3d-team6-agent-0`, `k3d-team6-agent-1`) |
| Kubernetes (k3d load balancer) port | `8096` (8090 + 6) |
| Prometheus port-forward | `9096` (9090 + 6) |
| Compose app port | `8086` (8080 + 6) |
| Memory budget | 768Mi extra beyond baseline; Flask maxReplicas 4, Nginx maxReplicas 3; database not scaled |

## Every New Terminal

```bash
ssh <x500>@caps-inet4031-dev-app-02.oit.umn.edu
cd ~/inet4031-team6
export KUBECONFIG=~/.config/k3d/kubeconfig-team6.yaml   # points kubectl at our cluster, not myapp
export N=6
export PROM_URL=http://localhost:9096
git switch main && git pull
```

If `kubectl` says "connection refused" or "current-context is not set," the `export KUBECONFIG` line was skipped.

## Saving Evidence

Save output to a file as well as the screen:

```bash
mkdir -p capstone/networking-cloud/evidence
<command> | tee capstone/networking-cloud/evidence/<name>.txt
```

## Git (Shared VM rules)

```bash
git switch -c <branch-name>
git add <files>
git commit -m "<message>"
git push -u origin <branch-name>
# then open a PR on GitHub, wait for build-and-push, get an approval, merge
```

Never push to `main` directly. Use your GitHub username and a personal access token (with `repo` and `workflow` scopes) as the password.

## Session Log

Add a new entry for every working session. Copy the block below.

### YYYY-MM-DD, (name): (what you worked on)

```bash
# commands that worked, in order
```

Result / notes:

---

### Week 11, First Working Session

**1. Environment Checkpoint** (save output to `evidence/env-checkpoint.txt`)

```bash
{
  k3d cluster list
  kubectl get nodes -o wide
  kubectl get deploy,svc,pods -n default
  kubectl get networkpolicy -n default
  kubectl get pods -n monitoring
  curl -s -o /dev/null -w "%{http_code}\n" http://localhost:$((8090 + N))/health
  kubectl top nodes
  docker ps --filter name=k3d-team6-
} 2>&1 | tee capstone/networking-cloud/evidence/env-checkpoint.txt
```

Expected: 3 nodes `Ready`, Deployments available, NetworkPolicies listed, Prometheus Running, `200` from the health check.

**2. Tool versions** (save to `TOOL-VERSIONS.txt`)

```bash
{
  kubectl version --client
  k3d version
  k6 version
  helm version --short
  docker --version
  jq --version
  curl --version | head -1
  dig -v
} 2>&1 | tee capstone/networking-cloud/TOOL-VERSIONS.txt
```

Do not run any `tofu` command on the Shared VM.

**3. Baseline** (before changing anything): request rate, P95, replica count, memory

```bash
kubectl get deploy -n default | tee capstone/networking-cloud/evidence/baseline-replicas.txt
kubectl top pods -n default | tee capstone/networking-cloud/evidence/baseline-memory.txt
```

Week 9 baseline for reference: about 4.77 requests/sec, P50 46.48 ms, P95 62.24 ms, 0% errors. 3x baseline is about 15 requests/sec.

## Known Gotchas

- `export KUBECONFIG=...` resets every login. Run it in every new terminal.
- Pasting into a fresh PowerShell SSH session can add junk characters (`^[[200~`). If a command fails with "command not found," type it instead.
- Port-forwards run in the foreground in their own terminal (no `&`). Clean up with `pkill -u $USER -f "kubectl port-forward"`.
- No `sudo` on the Shared VM.
- Node drills: only stop our own containers (`k3d-team6-agent-*`), never the server node or load balancer, and always `docker start` them again.
- Debug pods need a memory limit of 64Mi or less and must be deleted afterward.


## Criterion 2: Node Failure Drill (not run yet)

Run only after nginx has 2+ pods on different nodes and readiness probes are in place. Tell the team before starting, since it stops one of our nodes.

Terminal 1 (start traffic first):

    k6 run --no-color capstone/networking-cloud/k6/drill.js | tee capstone/networking-cloud/evidence/drill-k6.txt

Terminal 2 (watch pods):

    kubectl get pods -o wide -w | tee capstone/networking-cloud/evidence/drill-pods.txt

Terminal 3 (about 30 seconds after k6 starts):

    docker ps --filter name=k3d-team6-
    echo "STOP: $(date)" | tee capstone/networking-cloud/evidence/drill-times.txt
    docker stop k3d-team6-agent-0
    # wait at least 3 minutes
    echo "START: $(date)" | tee -a capstone/networking-cloud/evidence/drill-times.txt
    docker start k3d-team6-agent-0
    kubectl get nodes

Rules: only stop k3d-team6-agent-0 or k3d-team6-agent-1. Never stop the server node or the load balancer. Always start the node again.
Pass: k6 summary shows http_req_failed under 1%.
