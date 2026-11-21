// Node failure drill (Networking and Cloud capstone, Team 6) - Criterion 2
// Sends steady traffic to /health for 5 minutes. During the run, one k3d agent
// node is stopped for at least 3 minutes, then started again.
// Pass = http_req_failed stays under 1% for the whole run.
import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8096';

export const options = {
  vus: 5,
  duration: '5m',
  thresholds: {
    http_req_failed: ['rate<0.01'],
  },
};

export default function () {
  const res = http.get(`${BASE_URL}/health`, { timeout: '5s' });
  check(res, { 'status is 200': (r) => r.status === 200 });
  sleep(1);
}
