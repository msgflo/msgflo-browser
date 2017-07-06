
debug = require 'debug'
interfaces = require 'msgflo-nodejs/src/interfaces.coffee'
Paho = require 'paho.mqtt.js'
url = require 'url'

class Client extends interfaces.MessagingClient
  constructor: (address, options = {}) ->
    @address = address
    @options = options
    @options.connectTimeout = 10 if not @options.connectTimeout
    @client = null 
    @subscribers = {} # queueName -> [handler1, ...]

  _onConnectionLost: (responseObject) =>
    if responseObject.errorCode != 0
      console.log "onConnectionLost:"+responseObject.errorMessage

  _onMessage: (message) =>
    debug 'onMessage', message
    return if not @client
    return if not Object.keys(@subscribers).length > 0

    topic = message.destinationName

    msg = null
    try
      msg = JSON.parse message.payloadString
    catch e
      debug 'failed to parse discovery message', e
      msg = message.payloadBuffer or message.payloadString
    handlers = @subscribers[topic]

    debug 'message', handlers.length, msg != null
    return if not handlers
    out =
      data: msg
      mqtt: message
    for handler in handlers
      handler out

  ## Broker connection management
  connect: (callback) =>
    parsed = url.parse @address
    parsed.port = 1884 if not parsed.port # one more than default MQTT, quite common Mosquitto config 
    parsed.hostname = 'localhost' if not parsed.hostname
    clientId = "msgflo-browser-foo2" # TODO: randomize
    @client = new Paho.Client parsed.hostname, parsed.port, clientId
    @client.onConnectionLost = @_onConnectionLost;
    @client.onMessageArrived = @_onMessage;

    onConnected = (response) ->
      return callback null
    onFailure = (response) ->
      return callback new Error "Failed to connect to MQTT broker: #{response.errorCode} #{response.errorMessage}"
    o =
      onSuccess: onConnected
      onFailure: onFailure
      timeout: @options.connectTimeout
    @client.connect o   

  disconnect: (callback) =>
    @client = null
    @subscribers = {}
    return callback null

  ## Manipulating queues
  createQueue: (type, queueName, options, callback) ->
    # In MQTT, can send/receive on any queue without explicity creating it
    return callback null
  removeQueue: (type, queueName, callback) ->
    # In MQTT, can send/receive on any queue without explicity creating it
    return callback null

  ## Sending/Receiving messages
  sendTo: (type, topic, value, callback) =>
    data = JSON.stringify value
    message = new Paho.Message data
    message.destinationName = topic
    @client.send message
    return callback null

  subscribeToQueue: (queueName, handler, callback) =>
    @subscribers[queueName] = [] if not @subscribers[queueName]
    @subscribers[queueName].push handler
    @client.subscribe queueName
    return callback null

  ## ACK/NACK messages
  ackMessage: (message) => # TODO: implement
    return null
  nackMessage: (message) => # TODO: implement
    return null

  # Participant registration
  registerParticipant: (part, callback) =>
    msg =
      protocol: 'discovery'
      command: 'participant'
      payload: part
    @sendTo 'inqueue', 'fbp', msg, callback 

module.exports.Client = Client
