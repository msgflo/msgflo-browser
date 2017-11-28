
const debug = require('debug');
const interfaces = require('msgflo-nodejs/lib/interfaces');
const Paho = require('paho.mqtt.js');
const url = require('url');
const uuid = require('uuid');

class Client extends interfaces.MessagingClient {
  constructor(address, options) {
    super(address, options);
    this._onConnectionLost = this._onConnectionLost.bind(this);
    this._onMessage = this._onMessage.bind(this);
    this.connect = this.connect.bind(this);
    this.disconnect = this.disconnect.bind(this);
    this.sendTo = this.sendTo.bind(this);
    this.subscribeToQueue = this.subscribeToQueue.bind(this);
    this.ackMessage = this.ackMessage.bind(this);
    this.nackMessage = this.nackMessage.bind(this);
    this.registerParticipant = this.registerParticipant.bind(this);
    if (options == null) { options = {}; }
    this.address = address;
    this.options = options;
    if (!this.options.connectTimeout) { this.options.connectTimeout = 10; }
    this.client = null; 
    this.subscribers = {}; // queueName -> [handler1, ...]
  }

  _onConnectionLost(responseObject) {
    if (responseObject.errorCode !== 0) {
      return console.log(`onConnectionLost:${responseObject.errorMessage}`);
    }
  }

  _onMessage(message) {
    debug('onMessage', message);
    if (!this.client) { return; }
    if (!Object.keys(this.subscribers).length > 0) { return; }

    const topic = message.destinationName;

    let msg = null;
    try {
      msg = JSON.parse(message.payloadString);
    } catch (e) {
      debug('failed to parse discovery message', e);
      msg = message.payloadBuffer || message.payloadString;
    }
    const handlers = this.subscribers[topic];

    debug('message', handlers.length, msg !== null);
    if (!handlers) { return; }
    const out = {
      data: msg,
      mqtt: message
    };
    return Array.from(handlers).map((handler) =>
      handler(out));
  }

  //# Broker connection management
  connect(callback) {
    const parsed = url.parse(this.address);
    if (parsed.port) {
      parsed.port = parseInt(parsed.port);
    } else {
      parsed.port = 1884; // one more than default MQTT, quite common Mosquitto config
    }
    if (!parsed.hostname) { parsed.hostname = 'localhost'; }
    const clientId = `msgflo-browser-${uuid.v4()}`;
    this.client = new Paho.Client(parsed.hostname, parsed.port, clientId);
    this.client.onConnectionLost = this._onConnectionLost;
    this.client.onMessageArrived = this._onMessage;

    const onConnected = response => callback(null);
    const onFailure = response => callback(new Error(`Failed to connect to MQTT broker: ${response.errorCode} ${response.errorMessage}`));
    const o = {
      onSuccess: onConnected,
      onFailure,
      timeout: this.options.connectTimeout
    };
    return this.client.connect(o);   
  }

  disconnect(callback) {
    this.client = null;
    this.subscribers = {};
    return callback(null);
  }

  //# Manipulating queues
  createQueue(type, queueName, options, callback) {
    // In MQTT, can send/receive on any queue without explicity creating it
    return callback(null);
  }
  removeQueue(type, queueName, callback) {
    // In MQTT, can send/receive on any queue without explicity creating it
    return callback(null);
  }

  //# Sending/Receiving messages
  sendTo(type, topic, value, callback) {
    const data = JSON.stringify(value);
    const message = new Paho.Message(data);
    message.destinationName = topic;
    this.client.send(message);
    return callback(null);
  }

  subscribeToQueue(queueName, handler, callback) {
    if (!this.subscribers[queueName]) { this.subscribers[queueName] = []; }
    this.subscribers[queueName].push(handler);
    this.client.subscribe(queueName);
    return callback(null);
  }

  //# ACK/NACK messages
  ackMessage(message) { // TODO: implement
    return null;
  }
  nackMessage(message) { // TODO: implement
    return null;
  }

  // Participant registration
  registerParticipant(part, callback) {
    const msg = {
      protocol: 'discovery',
      command: 'participant',
      payload: part
    };
    return this.sendTo('inqueue', 'fbp', msg, callback); 
  }
}

module.exports.Client = Client;
