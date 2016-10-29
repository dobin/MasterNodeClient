"use strict";

var ws1;
var ws2;

var state = 0;

$(window).on('beforeunload', function(){
    ws1.close();
    ws2.close();
});

var NetworkHandler = function(i) {
  this.id = i;

}
NetworkHandler.prototype.constructor = NetworkHandler;


NetworkHandler.prototype.handleRegisterAnswer = function(data) {
  log.info(this.id + ": " + "Handle register answer");

  if (state == 1) {
    log.info("OK Received registerAnswer!");
  }
}


NetworkHandler.prototype.handleRegisterClient = function(data) {
  log.info(this.id + ": " + "Handle Register Client");

  if (state == 1) {
    log.info("OK Received registerClient!");
  }
}


NetworkHandler.prototype.handleClientKeys = function(data) {
  log.info(this.id + ": " + "Handle Client keys");

  if (state == 2) {
    log.info("OK Client keys");
  }
}


NetworkHandler.prototype.handleChatMessage = function(data) {
  log.info(this.id + ": " + "Handle Chat Message");

  if (state == 3) {
    log.info("OK Client Position");
  }
}

NetworkHandler.prototype.handlePlayerLocation = function(data) {
  log.info(this.id + ": " + "Handle Client Position");

  if (state == 4) {
    log.info("OK Client Position");
  }
}



///////////

function startServerTest() {
  log.info("Test the server shizzle");

  ws1 = new NetworkSocket("1", new NetworkHandler("1"));
  ws2 = new NetworkSocket("2", new NetworkHandler("2"));

  ws1.connect();
  ws2.connect();

  // Wait a bit till its connected...
  setTimeout(startTest, 200);
}

function startTest() {
  log.info("StartTest: 1");
  state = 1;
  ws1.register("Username1");
  ws2.register("Username2");

  setTimeout(startTest2, 200);

}


function startTest2() {
  log.info("StartTest: 2");
  state = 2;


  var keys = {
    left: 0,
    right: 0,
    up: 0,
    down: 0,
    space: 0,
    mouseX: 0,
    mouseY: 0,
  };

  log.info("Expect: WS2 clientKeys")
  ws1.sendPlayerKeys(keys);

  setTimeout(startTest3, 200);
}



function startTest3() {
  log.info("StartTest: 4");
  ws1.sendChatMessage("hoi");

  setTimeout(startTest4, 200);
}

function startTest4() {
  log.info("StartTest: 4");
  state = 3;

  var data = {
    position: {
      x: 1,
      y: 2,
    },
    velocity: {
      x: 3,
      y: 4,
    },
  };

}