
function createPeer(id) {
  console.log("> CREATING A PEER")
  myPeer = new Peer(id, {
    // host: 'localhost',
    // port: 9000,
    // path: '/',

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

  return myPeer;
}

function connectToPeer(myPeer, peerID, f) {
  console.log('> CONNECT TO PEER: ' + peerID);

  var c = myPeer.connect(peerID, {
    label: 'chat',
    serialization: 'none',
    metadata: {message: 'hi i want to chat with you!'}
  });

  c.on('open', function() {
    console.log("> CONNECTION OPEN");
    connectedPeers[peerID] = 1;
    connect(myPeer, c, f);
  });

  c.on('error', function(err) {
    console.log("> CONNECTION ERROR: " + err);
  });

}

// Handle a connection object.
// When data is recieved, call f([id, data])
function connect(myPeer, c, f) {
  console.log('> RECEIVED A CONNECTION FROM ' + c.peer)
  // Handle a chat connection.
  if (c.label === 'chat') {

    console.log('> WAITING FOR DATA')
    c.on('data', function(data) {
      console.log('> RECEIVED DATA: ', data)
      f([c.peer, data])
    });

    c.on('close', function() {
      console.log(c.peer + ' has left the chat.');
      delete connectedPeers[c.peer];
    });

    connectedPeers[c.peer] = c;
  }
}

function sendMessage(data) {
  if (Object.keys(connectedPeers).length === 0) {
    console.log("no peers to send to :(");
    return
  }
  for (var id in connectedPeers) {
    console.log("> SENDING '" + data + "' to " + id);
    var conn = connectedPeers[id];
    conn.send(data);
  }
}

// Make sure things clean up properly.
window.onunload = window.onbeforeunload = function(e) {
  if (!!myPeer && !myPeer.destroyed) {
    myPeer.destroy();
  }
};


// RFC4122 version 4 compliant uuid
function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
  });
}
