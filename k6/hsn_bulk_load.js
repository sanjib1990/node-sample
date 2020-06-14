import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend, Counter, Rate } from 'k6/metrics';

let myTrend = new Trend('waiting_time');
let myCounter = new Counter('my_counter');
let errorRate = new Rate('my_rate');

export let options = {
  vus: 100,
  // duration: '60s',
  iterations: 1000
};

let items = [
  '30049074', '30049034','30049079', '30045036', '30045039', '30049069', '30043919',
  '2106', '30045020', '30042070', '30049011', '3004', '21069099', '30049020',
  '30049082', '30033900', '30049081', '21061000', '30045090', '21013090', '30049039', '30031000',
  '30043190', '30049099', '3001', '30042039']

export default function() {
  const __id = [];
  for (let i=0; i< 10; i++) {
    __id.push(items[Math.floor(Math.random()*items.length)])
  }
  // sleep(2);
  let res = {}
  let __data = {}
  let startDate = new Date();
  try {
    res = http.post(`https://spectre-stag-service.staging.k8s.neontech.cloud/api/elastic/in-ward/hsn/bulk`, JSON.stringify(__id), {
      "headers": {
        "Content-Type": "application/json"
      }
    });
    __data = JSON.parse(res.body);
    errorRate.add(0)
    console.log(res.timings.duration, __data.data);
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
    'status was 200': r => r.status === 200,
    'data status was 200': r => __data.status === 200,
    'data is not empty': r => __data.data.response.length >= 1,
    // 'transaction time OK': r => r.timings.duration < 150,
  });
}
