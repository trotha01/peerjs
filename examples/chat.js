// TODO:
  // on connection close to thisisatest123, try to become thisisatest123, or reconnect to it
  // remove jquery
  // add elm interop


// Connect to PeerJS, have server assign an ID instead of providing one
// Showing off some of the configs available with PeerJS :).
var mypeer
var leaderID = 'thisIsTheLeaderID123';

function log(msg) {
  var logs = document.getElementById('log');
  oldLogs = logs.innerHTML;
  logs.innerHTML = oldLogs + msg;
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
      log(copy + '<br>');
    }
  });
  setupPeer(mypeer);

  mypeer.on('error', function(err) {
    console.log(err);

    // If first id is taken, generate a new one
    // TODO: Maybe there's a way to use connect, to connect with a new id?
    // mypeer.connect({
    mypeer = new Peer({
      // set api key for cloud server (you don't need this if you're running your
      // own.
      key: 'x7fwx2kavpy6tj4i',

      // set highest debug level (log everything!).
      debug: 3,

      // set a logging function:
      logFunction: function() {
        var copy = Array.prototype.slice.call(arguments).join(' ');
        log(copy + '<br>');
      }
    });
    setupPeer(mypeer);
  })

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
    var pid = document.getElementById('pid');
    pid.innerHTML = id

    // connect to first user, if this is not the first user
    if (id != leaderID) {
      connectToGame()
    }
  });

  // Await connections from others
  mypeer.on('connection', connect);

}

function connectToGame() {
    console.log('connet');
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


// Handle a connection object.
function connect(c) {
  // Handle a chat connection.
  if (c.label === 'chat') {
    var chatbox = $('<div></div>').addClass('connection').addClass('active').attr('id', c.peer);
    var header = $('<h1></h1>').html('Chat with <strong>' + c.peer + '</strong>');
    var messages = $('<div><em>Peer connected.</em></div>').addClass('messages');
    chatbox.append(header);
    chatbox.append(messages);

    // Select connection handler.
    chatbox.on('click', function() {
      if ($(this).attr('class').indexOf('active') === -1) {
        $(this).addClass('active');
      } else {
        $(this).removeClass('active');
      }
    });
    $('.filler').hide();
    $('#connections').append(chatbox);

    c.on('data', function(data) {
      messages.append('<div><span class="peer">' + c.peer + '</span>: ' + data +
        '</div>');
        });
        c.on('close', function() {
          console.log(c.peer + ' has left the chat.');
          chatbox.remove();
          if ($('.connection').length === 0) {
            $('.filler').show();
          }
          delete connectedPeers[c.peer];
        });
  } else if (c.label === 'file') {
    c.on('data', function(data) {
      // If we're getting a file, create a URL for it.
      if (data.constructor === ArrayBuffer) {
        var dataView = new Uint8Array(data);
        var dataBlob = new Blob([dataView]);
        var url = window.URL.createObjectURL(dataBlob);
        $('#' + c.peer).find('.messages').append('<div><span class="file">' +
            c.peer + ' has sent you a <a target="_blank" href="' + url + '">file</a>.</span></div>');
      }
    });
  }
  connectedPeers[c.peer] = 1;
}

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
}

// Make sure things clean up properly.
window.onunload = window.onbeforeunload = function(e) {
  if (!!mypeer && !mypeer.destroyed) {
    mypeer.destroy();
  }
};

