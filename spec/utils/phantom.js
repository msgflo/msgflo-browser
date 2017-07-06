var webPage = require('webpage');
var page = webPage.create();

page.open('http://localhost:3000/examples/infodisplay/index.html?msgflo_broker=mqtt://localhost&msgflo_role=display', function(status) {
  console.log('Status: ' + status);
  // Do other things here...
});
