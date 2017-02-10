
debug = require 'debug'
interfaces = require 'msgflo-nodejs/src/interfaces'

class Client extends interfaces.MessagingClient
  constructor: (address, options) ->
    @address = address
    @options = options
    @client = null 
    @subscribers = {} # queueName -> [handler1, ...]

  _onConnectionLost = (responseObject) ->
    if responseObject.errorCode != 0
      console.log "onConnectionLost:"+responseObject.errorMessage

  _onMessage = (message) ->
    debug 'onMessage', message

    return if not @client
    return if not Object.keys(@subscribers).length > 0

    msg = null
    try
      msg = JSON.parse message.toString()
    catch e
      debug 'failed to parse discovery message', e
      msg = message.toString()
    handlers = @subscribers[topic]

    debug 'message', handlers.length, msg != null
    return if not handlers
    out =
      data: msg
      mqtt: message
    for handler in handlers
      handler out

  ## Broker connection management
  connect: (callback) ->
    port = 1884
    clientId = "msgflo-browser-foo" # TODO: randomize
    @client = new Paho.MQTT.Client location.hostname, port, clientId
    @client.onConnectionLost = @_onConnectionLost;
    @client.onMessageArrived = @_onMessage;

    onConnected = () ->
      return callback null
    @client.connect onSuccess: onConnected     

  disconnect: (callback) ->
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
  sendTo: (type, topic, data, callback) ->
    message = new Paho.MQTT.Message data
    message.destinationName = topic
    @client.send message
    return callback null

  subscribeToQueue: (queueName, handler, callback) ->
    @subscribers[queueName] = [] if not @subscribers[queueName]
    @subscribers[queueName].push handler
    @client.subscribe queueName
    return callback null

  ## ACK/NACK messages
  ackMessage: (message) -> # TODO: implement
    return callback null
  nackMessage: (message) -> # TODO: implement
    return callback null

  # Participant registration
  registerParticipant: (part, callback) ->
    msg =
      protocol: 'discovery'
      command: 'participant'
      payload: part
    @sendTo 'inqueue', 'fbp', msg, callback 

module.export.Client = Client
