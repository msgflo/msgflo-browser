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
    element.onload = function () {
      return callback('showed', null, element.getAttribute('src'));
    };
    element.setAttribute('src', indata);
  };
  var client = new msgflo.mqtt.Client(broker, {});
  return new msgflo.participant.Participant(client, def, process, role);
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
  });
}, false);
