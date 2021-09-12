const { WebSocketServer } = require('ws');
const readlineSync = require('readline-sync');
let heartRate = '123';
let utf8decoder = new TextDecoder()

function init(clockPort, webPort) {
  console.log('')
  console.log('-----------------')
  console.log('OBS-HR-MON-SERVER')
  console.log('----By Timmy-----')
  console.log('-----------------')
  console.log('')
  console.log(`Using ${clockPort} for the watch.`)
  console.log(`Using ${webPort} for the web page.`)
}
function getClockPort() {
  console.log('-----------------')
  console.log('Set the port to which the watch will connect to.')
  console.log('Press ENTER for default port (3666)')
  return readlineSync.questionInt('Set the port: ', { defaultInput: 3666 });
}

function getWebPort() {
  console.log('')
  console.log('-----------------')
  console.log('Set the port to which the web page will connect to.')
  console.log('Press ENTER for default port (3667)')
  return readlineSync.questionInt('Set the port: ', { defaultInput: 3667 });
}

console.log('Set the ports for the WebSockets to connect to')
let clockPort = getClockPort()
let webPort = getWebPort()
init(clockPort, webPort)

const wss = new WebSocketServer({ port: clockPort });
wss.on('connection', (ws) => {
  console.log('WATCH CONNECTED')
  let triggered = false;
  ws.on('message', (message) => {
    if (message.data instanceof ArrayBuffer) {
      // binary frame
      const view = new DataView(message.data);
      console.log(view.getInt32(0));
    } else {
      // text frame
      utf8msg = utf8decoder.decode(message)
      heartRate = utf8msg
      if (heartRate > 40) {
        console.log('Heart Rate acquired from the Watch!')
      }
    }
  });
  ws.on('close', (message) => {
    console.log('WATCH DISCONNECTED')
    triggered = true;
  });
  ws.send('something cool');
});

const wss2 = new WebSocketServer({ port: webPort });
wss2.on('connection', function connection(wsConnection) {
  console.log('WEB BROWSER CONNECTED')
  wsConnection.on('message', function incoming(message) {
    wsConnection.send(heartRate);
  });
  wsConnection.on('close', (message) => {
    console.log('WEB BROWSER DISCONNECTED')
  });

})
