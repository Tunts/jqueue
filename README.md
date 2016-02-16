Welcome to the jqueue wiki!

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

# Callbacks standard 

The callbacks functions need to respect the callback standard (error, data). So, when you set a callback function, make sure that there at least an error parameter. Even if no error occurs, the error parameter needs to be set, but in this case, the error value will be null.
