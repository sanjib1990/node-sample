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

let items = [426937,426893,426889,426886,426852,399859,399827,399824,399805,399804,399689,399671,399669,399650,399632,399628,399612,399600,399596,399592,399588,399584,399573,399569,399565,399560,399556,399551,399546,399517,399439,399435,399425,399420,399413,398128,398024,397988,397966,397965,397964,397960,397959,397957,397955,397948,397943,397942,397613,396200,396199,396197,396191,396183,396177,396168,396158,396155,396151,396147,396140,396135,396133,396132,396130,396128,396122,396120,396116,396115,396114,396111,396104,396097,396093,396083,396081,396077,396074,396073,396068,396066,396063,396062,396060,396056,396053,396050,396046,396043,396040,396039,396035,396031,396028,396023,396019,396016,396012,396009,396007,396004,396003,396001,395998,395993,395989,395954,395950,395946]

export default function() {
  const __id = items[Math.floor(Math.random()*items.length)];
  let res = {}
  let __data = {}
  let startDate = new Date();
  try {
    res = http.get(`https://nebula-master-stag-service.internal.staging.k8s.neontech.cloud:443/api/get_product/${__id}`);
    __data = JSON.parse(res.body);
    // sleep(1);
    console.log(res.timings.duration, __data.data.product.name);
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
    'status was 200': r => r.status === 200,
    'data status was 200': r => __data.status === 200,
    'data is not empty': r => Object.keys(__data.data).length > 5,
    'transaction time OK': r => r.timings.duration < 600,
  });
}
