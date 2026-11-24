import http from 'k6/http';
import { sleep } from 'k6';
import { check } from 'k6';

export const options = {
    stages: [
        { duration: '30s', target: 10 },
        { duration: '1m', target: 30 },
        { duration: '30s', target: 0 },
    ],
};

export default function () {
    const response = http.get('http://localhost:8096/incidents');

    check(response, {
        'incidents request succeeded': (r) => r.status === 200,
    });

    sleep(0.2);
}