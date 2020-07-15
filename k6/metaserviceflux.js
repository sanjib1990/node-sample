import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend, Counter, Rate } from 'k6/metrics';

let myTrend = new Trend('waiting_time');
let myCounter = new Counter('my_counter');
let errorRate = new Rate('my_rate');

export let options = {
  vus: 100,
  // duration: '60s',
  iterations: 2000
};

let items = ["5ef5ba83e7922bce42f9fcf2", "5ef5b411e7922bcc32967a16"]

export default function() {
  const __id = items[Math.floor(Math.random()*items.length)];
  let res = {}
  let __data = {}
  let startDate = new Date();

  try {
    res = http.get(`http://localhost:8888/api/tasks/all?key=${__id}`);
    // sleep(2);
    __data = JSON.parse(res.body);
    console.log(res.timings.duration, __data.data);
    errorRate.add(0)
  } catch (e) {
    let endDate   = new Date();
    res.status = 500
    __data.status = 500
    __data.data = {response: []}
    res.timings = {duration: (endDate.getTime() - startDate.getTime()) / 1000}
    myCounter.add(1);
    errorRate.add(1)
    console.log("ERROR ====================> ", res.timings.duration, __data.data);
  }
  myTrend.add(res.timings.duration);
  check(res, {
    'status was 200': r => r.status === 200
  });
}
