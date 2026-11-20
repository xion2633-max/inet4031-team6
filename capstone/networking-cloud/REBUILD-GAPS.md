# Rebuild Gap Log: Networking and Cloud Infrastructure (Team 6)

Fill this in **during** the Week 13 rebuild slot, as you go, not afterward. Every time the rebuild stops or needs a step the README or NOTES.md did not mention, add a row. Fix each gap by pull request and update the README.

Rebuild date: YYYY-MM-DD
VM: Shared VM queue slot
Started from commit: `git rev-parse --short HEAD` = ________
Team members present: ________

## Gap Log

| # | Step in README / NOTES.md | What happened | Root cause | Fix (PR link) |
|---|---|---|---|---|
| 1 | | | | |
| 2 | | | | |
| 3 | | | | |

## What we would do differently

(two or three sentences)

---

## Before the Rebuild: What Lives Outside Git

Check each item **before** the rebuild slot. Anything not committed is a gap waiting to happen.

| Item | Where it must be documented | Done? |
|---|---|---|
| GitHub sign-in on the rebuild VM (`gh auth login`, then `gh auth logout` at the end) | README | [ ] |
| Who on the team signs in during the slot | README | [ ] |
| Exact `k3d cluster create` command with every flag, including `--subnet 100.97.6.0/24` | Script or NOTES.md | [ ] |
| Which kube context / kubeconfig the commands expect (`kubeconfig-team6.yaml`) | NOTES.md | [ ] |
| Prometheus `helm install` command and `week-5/prometheus-values.yaml` | NOTES.md | [ ] |
| Docker image build and `k3d image import` commands for every image tag our manifests use | NOTES.md | [ ] |
| Database seed command (Week 9 dataset) and any schema changes, and whether each is safe to run twice | NOTES.md | [ ] |
| Secrets and `.env` files: example file with placeholder values and how to create the real one | README / NOTES.md | [ ] |
| Python `requirements.txt` committed, and how to create the venv | README | [ ] |
| GitHub settings (branch protection, repo secrets) recorded | NOTES.md or `evidence/` | [ ] |
| Port-forward commands and ports (Prometheus `9096:80`) | NOTES.md | [ ] |
| Database index from Week 9 (`idx_incidents_status_created`) and `pg_stat_statements` setting come back | NOTES.md / manifests | [ ] |
| Capstone objects (HPA, PodDisruptionBudgets, probes, NetworkPolicies) applied from files in the repo | NOTES.md | [ ] |
| File permissions: `COPY --chmod=644` in Dockerfiles, or a `chmod` step (`umask 077`) | Dockerfile / NOTES.md | [ ] |
| Ansible playbooks and OpenTofu code labeled **reference-only / [PREDICT ONLY]**, and bring-up does not depend on them | README | [ ] |

**Rebuild rules (Shared VM):** no `sudo`, do not run Ansible or `tofu`, use the same `--subnet 100.97.6.0/24` flag.

---

## Proof of Life (run at the end of the rebuild)

| Check | Command | Result |
|---|---|---|
| Three nodes `Ready` | `kubectl get nodes` | [ ] Pass [ ] Fail |
| HPA exists | `kubectl get hpa` | [ ] Pass [ ] Fail |
| PodDisruptionBudgets exist | `kubectl get pdb` | [ ] Pass [ ] Fail |
| `/health` returns 200 on our Kubernetes port | `curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8096/health` | [ ] Pass [ ] Fail |
| A 60-second k6 run completes | `k6 run -e BASE_URL=http://localhost:8096 <smoke script>` | [ ] Pass [ ] Fail |

## Rebuild Checklist

- [ ] Repo cloned into a fresh location on a clean VM
- [ ] Every step taken from the README or NOTES.md, nothing from memory
- [ ] Every app change came back (schema, routes, new services, images)
- [ ] Gap log filled in as we went, not afterward
- [ ] Every gap fixed by pull request, and the README updated
- [ ] Proof of life passed
- [ ] Rehearsed once more from the fixed README before Week 14
