var msgflo = window.msgflo;
var urls = [
    "http://c-beam.cbrp3.c-base.org/events",
    "https://c-beam.cbrp3.c-base.org/c-base-map",
    "https://c-beam.cbrp3.c-base.org/weather",
    "http://c-beam.cbrp3.c-base.org/bvg",
    "http://openmct.cbrp3.c-base.org/#/browse/mine/b358cd1c-7b59-4e84-9d8c-d1a584a9ef86",
    "http://openmct.cbrp3.c-base.org/#/browse/mine/9f398f6a-5afc-4301-85f9-8d2bf03886a3",
    "https://c-beam.cbrp3.c-base.org/sensors",
    "https://c-beam.cbrp3.c-base.org/ceitloch",
    "http://app.flowhub.io#runtime/endpoint?protocol%3Dwebsocket%26address%3Dws%3A%2F%2Fc-flo.cbrp3.c-base.org%3A3569%26id%3Da9dca883-c07f-4cd7-b369-180fa9b52b68",
];
var getRotationUrl = function () {
  return urls[Math.floor(Math.random() * urls.length)];
};

var DisplayParticipant = function (broker, role) {
  var element = document.getElementById('iframe');
  var def = {
    component: 'msgflo-browser/infodisplay',
    label: 'Browser-based information display',
    icon: 'television',
    inports: [
      {
        id: 'show',
        type: 'string'
      },
      {
        id: 'urls',
        type: 'array'
      }
    ],
    outports: [
      {
        id: 'showed',
        type: 'string'
      },
      {
        id: 'urls',
        type: 'array',
        hidden: true
      }
    ]
  };
  var process = function (inport, indata, callback) {
    if (inport === 'urls') {
      // Update URL listing
      urls = indata;
      return callback('urls', null, urls);
    }
    element.onload = function () {
      return callback('showed', null, element.getAttribute('src'));
    };
    element.setAttribute('src', indata);
    // Rotate internal URLs list
    setTimeout(function () {
      participant.send('show', getRotationUrl());
    }, 120000);
  };
  var client = new msgflo.mqtt.Client(broker, {});
  var participant = new msgflo.participant.Participant(client, def, process, role);
  return participant;
}

window.addEventListener('load', function () {
  var params = msgflo.options({
    broker: 'mqtt://localhost',
    role: 'infodisplay'
  });
  var p = DisplayParticipant(params.broker, params.role);
  p.start(function (err) {
    if (err) {
      console.error(err);
      return;
    }
    console.log('Started');
    p.send('show', getRotationUrl());
  });
}, false);
