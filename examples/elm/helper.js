// TODO:
  // on connection close to thisisatest123, try to become thisisatest123, or reconnect to it
  // remove jquery
  // add elm interop


// Connect to PeerJS, have server assign an ID instead of providing one
// Showing off some of the configs available with PeerJS :).
var mypeer
var leaderID = 'ElmLeaderID123';

function log(msg) {
  console.log(msg);
}

function createPeer() {
  console.log("creating a peer")
  mypeer = new Peer(leaderID, {
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
  setupPeer(myPeer);

  return mypeer;
}

// RFC4122 version 4 compliant uuid
function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
  });
}

var connectedPeers = {};

function setupPeer(myPeer) {
  // Show this peer's ID.
  mypeer.on('open', function(id){
    // connect to first user, if this is not the first user
    if (id != leaderID) {
      connectToGame()
    }
  });

  // Await connections from others
  mypeer.on('connection', connect);

}

function connectToGame() {
    console.log('connectToGame');
    if (!connectedPeers[leaderID]) {

      // Create 2 connections, one labelled chat and another labelled file.
      var c = mypeer.connect(leaderID, {
        label: 'chat',
        serialization: 'none',
        metadata: {message: 'hi i want to chat with you!'}
      });
      c.on('open', function() {
        connect(c);
      });
      c.on('error', function(err) { alert(err); });

      var f = mypeer.connect(leaderID, { label: 'file', reliable: true });
      f.on('open', function() {
        connect(f);
      });
      f.on('error', function(err) { alert(err); });
    }
    connectedPeers[leaderID] = 1;
}

function newChatbox(c) {
  cbox = document.createElement('div');
  cbox.className = 'connection active';
  cbox.id = c.peer;
  return cbox
}

function newHeader(c) {
  // var header = $('<h1></h1>').html('Chat with <strong>' + c.peer + '</strong>');
  header = document.createElement('h1');
  header.innerHTML= 'Chat with <strong>' + c.peer + '</strong>';
  return header
}

function newMessages(c) {
  // var messages = $('<div><em>Peer connected.</em></div>').addClass('messages');
  header = document.createElement('div');
  em = document.createElement('em');
  em.innerHTML= 'Peer connected.';
  em.className = 'messages';
  header.appendChild(em);
  return header
}

function remove(element) {
      element.parentNode.removeChild(element);
}

function appendMessage(c,  messages, data) {
      wrapper = document.createElement('div');
      peerSpan = document.createElement('span');
      dataSpan = document.createElement('span');
      peerSpan.className = 'peer';
      peerSpan.innerHTML = c.peer;
      dataSpan.innerHTML = ': ' + data;
      wrapper.appendChild(peerSpan);
      wrapper.appendChild(dataSpan);
      messages.appendChild(wrapper);
}

// Handle a connection object.
function connect(c) {
  console.log('> CONNECTED')
  // Handle a chat connection.
  if (c.label === 'chat') {
    console.log('chat', data)
    /*
    var chatbox = newChatbox(c);
    var header = newHeader(c);
    var messages = newMessages(c);
    chatbox.appendChild(header);
    chatbox.appendChild(messages);

    document.getElementById('filler').style.display = 'none';
    document.getElementById('connections').appendChild(chatbox);
    */

    c.on('data', function(data) {
      console.log('received data', data)
      // appendMessage(c, messages, data);
    });

    c.on('close', function() {
          console.log(c.peer + ' has left the chat.');
          /* remove(chatbox);
          if (Object.keys(connectedPeers).length === 0) {
            document.getElementById('filler').style.display = 'block';
          }
          */
          delete connectedPeers[c.peer];
        });
  }
  connectedPeers[c.peer] = 1;
}

function sendMessage(data) {
  for (var id in connectedPeers) {
    console.log("> SENDING '" + data + "' to " + id);
    var conns = mypeer.connections[id];
    for (var i = 0, len = conns.length; i < len; i += 1) {
      var conn = conns[i];
      conn.send(data);
    }
  }
}

/*
function eachActiveConnection(fn) {
  var actives = $('.active');
  var checkedIds = {};
  actives.each(function() {
    var peerId = $(this).attr('id');

    if (!checkedIds[peerId]) {
      var conns = mypeer.connections[peerId];
      for (var i = 0, ii = conns.length; i < ii; i += 1) {
        var conn = conns[i];
        fn(conn, $(this));
      }
    }

    checkedIds[peerId] = 1;
  });
}
*/

/*
window.onload = function() {
  // Create peer for webRTC
  console.log("create a peer")
  createPeer()

  // Send a chat message to all active connections.
  $('#send').submit(function(e) {
    e.preventDefault();
    // For each active connection, send the message.
    var msg = $('#text').val();
    eachActiveConnection(function(c, $c) {
      if (c.label === 'chat') {
        c.send(msg);
        $c.find('.messages').append('<div><span class="you">You: </span>' + msg
          + '</div>');
      }
    });
    $('#text').val('');
    $('#text').focus();
  });

  // Goes through each active peer and calls FN on its connections.
}
*/

// Make sure things clean up properly.
window.onunload = window.onbeforeunload = function(e) {
  if (!!mypeer && !mypeer.destroyed) {
    mypeer.destroy();
  }
};

