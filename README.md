# Getting Started

## Import module
```javascript
  var Jqueue = require('jqueue');
```

## Create jqueue
- dependency: [node-mysql] (https://www.npmjs.com/package/node-mysql)

```javascript
  var Jqueue = require('jqueue');
  var db = require('node-mysql');
    
  var conncetionInfo = {
    host     : 'set host here',
    user     : 'set user here',
    password : 'set password here',
    database : 'jqueue'
  };

  var dataSource = new db.DB(conncetionInfo);

  var jqueue = new Jqueue(dataSource);
```

## Use

**parameters:** queueName, noCreate, ephemeral, callback;
- queueName: (STRING) name of the queue to be used, if the queue does not exist it will be created (mandatory);
- noCreate (BOOLEAN) if true the queue will not be created if it not exist (optional);
- ephemeral: (BOOLEAN) if true the queue will stored in memory, default: false (optional);
- callback (FUNCTION) is the callback function (mandatory).

```javascript
  // disk storage, queue will be created if it not exist
  jqueue.use('myqueue', function(error, queue) {
    if(!error) {
      console.log('I am a queue object', queue);
    }
  });
```

```javascript
  // disk storage, queue will not be created if it not exist
  jqueue.use('myqueue', false, function(error, queue) {
    if(!error) {
      console.log('I am a queue object', queue);
    }
  });
```

```javascript
  // disk storage, queue will be created if it not exist
  jqueue.use('myqueue', true, function(error, queue) {
    if(!error) {
      console.log('I am a queue object', queue);
    }
  });
```

```javascript
  // disk storage, queue will be created if it not exist
  jqueue.use('myqueue', true, false, function(error, queue) {
    if(!error) {
      console.log('I am a queue object', queue);
    }
  });
```

```javascript
  // if you want to set memory storage you need to set noCreate parameter

  // memory storage, queue will be created if it not exist
  jqueue.use('myqueue', true, true, function(error, queue) {
    if(!error) {
      console.log('I am a queue object', queue);
    }
  });
```

# Queue

## Queue Object

### Getters
- getName(): will return the name of the queue.

### Put

Parameters: message, delay, priority, callback.
- message: (STRING) the message data (mandatory);
- delay: (INT) delay in seconds, default: 0 (optional);
- priority: (INT) priority of the message, default: 0 (optional);
- tag: (STRING) tag of the message, default: null (optional);
- callback (FUNCTION) the callback function (mandatory).

**Important:** Message data needs to be less or equal 4096 bytes.

```javascript
// not delayed and priority default
queue.put('my message data', function(error, messageId) {
  if(!error) {
    console.log('success, message id = ' + messageId);
  }
});
```

```javascript
// 5 seconds delayed and priority default
queue.put('my message data', 5, function(error, messageId) {
  if(!error) {
    console.log('success, message id = ' + messageId);
  }
});
```

```javascript
// 5 seconds delayed and priority 1 (higher than default 0)
queue.put('my message data', 5, 1, function(error, messageId) {
  if(!error) {
    console.log('success, message id = ' + messageId);
  }
});
```

```javascript
// 5 seconds delayed, priority 1 and tag 'testTag'
queue.put('my message data', 5, 1, 'testTag', function(error, messageId) {
  if(!error) {
    console.log('success, message id = ' + messageId);
  }
});
```

```javascript
// you need set delay if you want to set priority,
// if you do not want to delay message set delay to 0

// not delayed and priority 1 (higher than default 0)
queue.put('my message data', 0, 1, function(error, messageId) {
  if(!error) {
    console.log('success, message id = ' + messageId);
  }
});
```

```javascript
// you need set delay and priority if you want to set tag,
// if you do not want to delay message set delay to 0
// if you do not want to priority message set priority to 0

// not delayed, no priority and tag 'testTag'
queue.put('my message data', 0, 0, 'testTag', function(error, messageId) {
  if(!error) {
    console.log('success, message id = ' + messageId);
  }
});
```
### Reserve

Parameters: timeToRun, callback.
- timeToRun: (INT) time to process message in seconds, default: 5 (optional);
- tag: (STRING) tag of the message, default: null (optional);
- callback (FUNCTION) the callback function (mandatory).

**Important:** If there is no message in queue, the message object in callback will be undefined.
timeToRun is the time that the message will be reserved. 

```javascript
// default time to run (5 seconds)
queue.reserve(function(error, message) {
  if(!error && message) {
    console.log('I am a message object', message);
  }
});
```

```javascript
// time to run of 3 seconds
queue.reserve(3, function(error, message) {
  if(!error && message) {
    console.log('I am a message object', message);
  }
});
```

```javascript
// time to run of 3 seconds and tag 'testTag'
queue.reserve(3, 'testTag', function(error, message) {
  if(!error && message) {
    console.log('I am a message object', message);
  }
});
```

```javascript
// you have to set time to run to set tag
// if you do not want time to run set time to run to 5

// not set time to run and tag 'testTag'
queue.reserve(5, 'testTag', function(error, message) {
  if(!error && message) {
    console.log('I am a message object', message);
  }
});
```

### Watch

Parameters: timeToRun, intervalTime, callback.
- timeToRun: (INT) time to process message in seconds, default: 5 (optional);
- intervalTime: (INT) period of check for new messages in milliseconds, default: 1000 (optional);
- tag: (STRING) tag of the message, default: null (optional);
- callback (FUNCTION) the callback function (mandatory).

**Important:** timeToRun is the time that the message will be reserved.
When a message is reserved the watching is stopped, so you need to call watch again if you want a new message

```javascript
// default time to run (5 seconds), default interval time (1000 milliseconds)
queue.watch(function(error, message) {
  if(!error && message) {
    console.log('I am a message object', message);
  }
});
```

```javascript
// time to run of 3 seconds, default interval time (1000 milliseconds)
queue.watch(3, function(error, message) {
  if(!error && message) {
    console.log('I am a message object', message);
  }
});
```

```javascript
// you need set timeToRun if you want to set intervalTime

// time to run of 3 seconds, interval time of 500 millisenconds
queue.watch(3, 500, function(error, message) {
  if(!error && message) {
    console.log('I am a message object', message);
  }
});
```

```javascript
// you need set timeToRun and intervalTime if you want to set tag

// time to run of 3 seconds, interval time of 500 millisenconds and tag 'testTag'
queue.watch(3, 500, 'testTag', function(error, message) {
  if(!error && message) {
    console.log('I am a message object', message);
  }
});
```

```javascript
// watch retuns a function that you can call to interrupt watch
var watcher = queue.watch(function(error, message) {
  if(!error && message) {
    console.log('I am a message object', message);
  }
});

watcher.cancel(); // Stop watching
```

### Kick

Parameters: max, delay, callback.
- max: (INT) maximun number of buried messages to change to ready status (optional);
- delay: (INT) delay in seconds, default: 0 (optional);
- callback (FUNCTION) the callback function (mandatory).

```javascript
// if you do not set a max number, all buried messages will be kicked

// max default (all), not delayed
queue.kick(function(error) {
  if(!error) {
    console.log('success');
  }
});
```

```javascript
// max of 20 messages, not delayed
queue.kick(20, function(error) {
  if(!error) {
    console.log('success');
  }
});
```

```javascript
// you need set max if you want to set delay

// max of 20 messages, 3 seconds delayed
queue.kick(20, 3, function(error) {
  if(!error) {
    console.log('success');
  }
});
```

### KickMessage

Parameters: id, delay, callback.
- id: (INT) id of the buried message (mandatory);
- delay: (INT) delay in seconds, default: 0 (optional);
- callback (FUNCTION) the callback function (mandatory).

```javascript
// id 123, not delayed
queue.kickMessage(123, function(error) {
  if(!error) {
    console.log('success');
  }
});
```

```javascript
// id 123, 5 seconds delayed
queue.kickMessage(123, 5, function(error) {
  if(!error) {
    console.log('success');
  }
});
```

### Pick

Parameters: id, timeToRun, callback.
- id: (INT) id of the message (mandatory);
- timeToRun: (INT) time to process message in seconds, default: 5 (optional);
- callback: (FUNCTION) the callback function (mandatory).

```javascript
// id 123
queue.pick(123, function(error, message) {
  if(!error && message) {
    console.log('I am a message object', message);
  }
});
```

```javascript
// id 123, time to run 3
queue.pick(123, 3, function(error, message) {
  if(!error && message) {
    console.log('I am a message object', message);
  }
});
```

# Message

## Message Object

### Getters
- getId(): will return the message id;
- getData(): will return the content of the message;
- getStatus(): will return the status of the message;
- getDelay(): will return the delay of the message, if it not have been inserted into a queue;
- getPriority(): will return the priority of the message;
- getDateTime(): will return the time when the message was ready;
- getTimeToRun(): will return the time to run;
- getQueueName(): will return the name of the queue.
- getTag(): will return the tag of the message.

### Release

Parameters: delay, callback.

- delay: (INT) delay in seconds, default: 0 (optional);
- tag: (STRING) new tag to the message, default: null;
- callback (FUNCTION) the callback function (mandatory).

Obs: if delay is set to 0, the delay will not be changed

```javascript
// not delayed
message.release(function(error) {
  if(!error) {
    console.log('success');
  }
});
```

```javascript
// 3 seconds delayed
message.release(3, function(error) {
  if(!error) {
    console.log('success');
  }
});
```

```javascript
// 3 seconds delayed and tag 'testTag'
message.release(3, 'testTag', function(error) {
  if(!error) {
    console.log('success');
  }
});
```

```javascript
// you have to set delay to set tag
// if you do not want delay set delay to 0

// not delayed and tag 'testTag'
message.release(0, 'testTag', function(error, message) {
  if(!error && message) {
    console.log('I am a message object', message);
  }
});
```

### Touch

Parameters: callback.

- callback (FUNCTION) the callback function (mandatory).

```javascript
message.touch(function(error) {
  if(!error) {
    console.log('success');
  }
});
```

### Delete

Parameters: callback.

- callback (FUNCTION) the callback function (mandatory).

```javascript
message.delete(function(error) {
  if(!error) {
    console.log('success');
  }
});
```

### Bury

Parameters: callback.

- callback (FUNCTION) the callback function (mandatory).

```javascript
message.bury(function(error) {
  if(!error) {
    console.log('success');
  }
});
```

# Callbacks standard 

The callbacks functions need to respect the callback standard (error, data). So, when you set a callback function, make sure that there at least an error parameter. Even if no error occurs, the error parameter needs to be set, but in this case, the error value will be null.
