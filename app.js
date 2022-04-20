let surl = document.getElementById("serverurl");
let serverurl = surl.value;
let socket = new WebSocket(serverurl);
let di = document.getElementById("status");
let mousedata;
let touchdata = 0;
let canDraw = false;

var width = screen.width;
var height = screen.height;

function log(msg) {
  di.innerHTML = msg;
}

function countTouches(event) {
  var x = event.touches.length;
  if (x > 0) {
    if (canDraw) {
      touchdata = "1"
    }
    else { touchdata = "0" }
  } else {
    touchdata = "0"
  }

  mousedata = event.touches[0].clientX + "," + event.touches[0].clientY + ",";
  
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(mousedata + touchdata);
  }
}

function toggleDraw() {
  if (canDraw == false) canDraw = true
  else canDraw = false
}

function initSock() {
  serverurl = surl.value;
  socket = new WebSocket(serverurl);

  socket.onopen = function (e) {
    log("Connected to server.")
    surl.style.position = "absolute";
    surl.style.visibility = "hidden";
    socket.send(width + "," + height);
  };

  socket.onmessage = function (event) {
    log(`[message] Data received from server: ${event.data}`);
  };

  socket.onclose = function (event) {
    if (event.wasClean) {
      log(`[close] Connection closed cleanly! Refresh the page.`);
    } else {
      // e.g. server process killed or network down
      // event.code is usually 1006 in this case
      log('[close] Connection died. Retrying in 2 seconds: ' + serverurl);
      surl.style.position = "relative";
      surl.style.visibility = "visible";

      setTimeout(() => {
        initSock();
      }, 2000);
    }
  };

  socket.onerror = function (error) {
    log(`[error] ${error.message}`);
  };
}

document.addEventListener('mousemove', (event) => {
  mousedata = event.clientX + "," + event.clientY + ","
  
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(mousedata + touchdata);
  }
});

document.addEventListener('mousedown', (event) => {
  touchdata = "1"
});

document.addEventListener('mouseup', (event) => {
  touchdata = "0"
});

initSock();