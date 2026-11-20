// Baseline load test (Networking and Cloud capstone, Team 6)
// Steady traffic BEFORE any capstone changes: 5 virtual users for 2 minutes.
// The http_reqs rate from this run is our "1x"; criterion 1 needs 3x this rate.
import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8096';

export const options = {
  vus: 5,
  duration: '2m',
};

export default function () {
  const res = http.get(`${BASE_URL}/incidents`);
  check(res, { 'status is 200': (r) => r.status === 200 });
  sleep(1);
}

