var msgflo = window.msgflo;
var timeout = null;

var getRotationUrl = function (urls) {
  return urls[Math.floor(Math.random() * urls.length)];
};

var DisplayParticipant = function (broker, role, defaultUrls) {
  var element = document.getElementById('iframe');
  var urls = defaultUrls;
  var def = {
    component: 'msgflo-browser/infodisplay',
    label: 'Browser-based information display',
    icon: 'television',
    inports: [
      {
        id: 'open',
        type: 'string'
      },
      {
        id: 'urls',
        type: 'array'
      }
    ],
    outports: [
      {
        id: 'opened',
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
      return callback('opened', null, element.getAttribute('src'));
    };
    element.setAttribute('src', indata);
    // Rotate internal URLs list
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(function () {
      participant.send('open', getRotationUrl(urls));
    }, 120000);
  };
  var client = new msgflo.mqtt.Client(broker, {});
  var participant = new msgflo.participant.Participant(client, def, process, role);
  return participant;
}

window.addEventListener('load', function () {
  var params = msgflo.options({
    broker: 'mqtt://localhost',
    role: 'infodisplay',
    urls: [
      "https://msgflo.org",
      "https://flowhub.io/iot/"
    ],
  });
  var p = DisplayParticipant(params.broker, params.role, params.urls);
  p.start(function (err) {
    if (err) {
      console.error(err);
      return;
    }
    console.log('Started');
    p.send('open', getRotationUrl(params.urls));
  });
}, false);
