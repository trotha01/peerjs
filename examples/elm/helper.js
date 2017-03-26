var connectedPeers = {};

function createPeer(id) {
  console.log("> CREATING A PEER")
  mypeer = new Peer(id, {
    // set api key for cloud server (you don't need this if you're running your own)
    key: 'x7fwx2kavpy6tj4i',
    id: 'inthebeginning',

    // set highest debug level (log everything!).
    debug: 3,

    // set a logging function:
    logFunction: function() {
      var copy = Array.prototype.slice.call(arguments).join(' ');
      console.log(copy);
    }
  });

  return mypeer;
}

function setupPeer(myPeer) {
  // Show this peer's ID.
  mypeer.on('open', function(id){
    console.log("> OPENED: ", id);
  });

  // Await connections from others
  mypeer.on('connection', connect);
}

function connectToPeer(mypeer, peerID) {
  console.log('> CONNECT TO PEER: ' + peerID);

  var c = mypeer.connect(peerID, {
    label: 'chat',
    serialization: 'none',
    metadata: {message: 'hi i want to chat with you!'}
  });

  c.on('open', function() {
    console.log("> CONNECTION OPEN");
    connect(c);
  });
  c.on('error', function(err) {
    console.log("> CONNECTION ERROR: " + err);
  });

  connectedPeers[peerID] = 1;
}

// Handle a connection object.
function connect(c) {
  console.log('> CONNECT: ', c.label)
  // Handle a chat connection.
  if (c.label === 'chat') {
    console.log('> WAITING FOR DATA')
    c.on('data', function(data) {
      console.log('> RECEIVED DATA: ', data)
    });

    c.on('close', function() {
          console.log(c.peer + ' has left the chat.');
          delete connectedPeers[c.peer];
        });
  }
  connectedPeers[c.peer] = 1;
}

function sendMessage(mypeer, data) {
  for (var id in connectedPeers) {
    console.log("> SENDING '" + data + "' to " + id);
    var conns = mypeer.connections[id];
    for (var i = 0, len = conns.length; i < len; i += 1) {
      var conn = conns[i];
      conn.send(data);
    }
  }
}

// Make sure things clean up properly.
window.onunload = window.onbeforeunload = function(e) {
  if (!!mypeer && !mypeer.destroyed) {
    mypeer.destroy();
  }
};


// RFC4122 version 4 compliant uuid
function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
  });
}
