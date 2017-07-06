var msgflo = window.msgflo;
var DisplayParticipant = function (broker, role) {
  var element = document.getElementById('iframe');
  var def = {
    component: 'msgflo-browser/infodisplay',
    inports: [
      {
        id: 'show',
        type: 'string'
      }
    ],
    outports: [
      {
        id: 'showed',
        type: 'string'
      }
    ]
  };
  var process = function (inport, indata, callback) {
    console.log(inport, indata);
    element.onload = function () {
      return callback('showed', null, element.getAttribute('src'));
    };
    element.setAttribute('src', indata);
  };
  var client = new msgflo.mqtt.Client(broker, {});
  return new msgflo.participant.Participant(client, def, process, role);
}

window.addEventListener('load', function () {
  var params = {
    broker: 'mqtt://localhost',
    role: 'infodisplay'
  }
  if (window.location.search) {
    window.location.search.substr(1).split('&').forEach(function (p) {
      var split = p.split('=');
      params[split[0]] = decodeURIComponent(split[1]);
    });
  }
  console.log(params);
  var p = DisplayParticipant(params.broker, params.role);
  p.start(function (err) {
    if (err) {
      console.error(err);
      return;
    }
    console.log('Started');
  });
}, false);
