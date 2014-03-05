var canvas,			// Canvas DOM element
	ctx,			// Canvas rendering context
	keys,			// Keyboard input
	localPlayer,	
	remotePlayers,
	socket;         // Connects the Socket

function init() {
	// Declare the canvas and rendering context
	canvas = document.getElementById("gameCanvas");
	ctx = canvas.getContext("2d");

	// Maximise the canvas
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;

	// Initialise keyboard controls
	keys = new Keys();

	// Calculate a random start position for the local player
	// The minus 5 (half a player size) stops the player being
	// placed right on the egde of the screen
	var startX = Math.round(Math.random()*(canvas.width-5)),
		startY = Math.round(Math.random()*(canvas.height-5));

	// Initialise the local player
	localPlayer = new Player(startX, startY);

    // Socket connection
	socket = io.connect("http://localhost", {port: 8000, transports: ["websocket"]});
    
    // Initialize remotePlayers
    remotePlayers = [];

	// Start listening for events
	setEventHandlers();
};

var setEventHandlers = function() {
	// Keyboard
	window.addEventListener("keydown", onKeydown, false);
	window.addEventListener("keyup", onKeyup, false);

	// Window resize
	window.addEventListener("resize", onResize, false);

	socket.on("connect", onSocketConnected); // Socket connection
    socket.on("disconnect", onSocketDisconnect); // Socket disconnect
    socket.on("new player", onNewPlayer); // New player message received
    socket.on("move player", onMovePlayer); // Player move message
    socket.on("remove player", onRemovePlayer); // Player remove message
};

function onKeydown(e) {
	if (localPlayer) {
		keys.onKeyDown(e);
	};
};

function onKeyup(e) {
	if (localPlayer) {
		keys.onKeyUp(e);
	};
};

// Browser window resize
function onResize(e) {
	// Maximise the canvas
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
};

function onSocketConnected() {
    console.log("Connected to socket server");
    socket.emit("new player", {x: localPlayer.getX(), y: localPlayer.getY()});
};

function onSocketDisconnect() {
    console.log("Disconnected from socket server");
};

function onNewPlayer(data) {
    console.log("New player connected: "+data.id);

    var newPlayer = new Player(data.x, data.y); // Initialize new Player
    newPlayer.id = data.id;
    
    remotePlayers.push(newPlayer); // Add the new player
};

function onMovePlayer(data) {

};

function onRemovePlayer(data) {
	var removePlayer = playerById(data.id);

    // if player not found
    if (!removePlayer) {
        console.log("Player not found: "+data.id);
        return;
    };

    remotePlayers.splice(remotePlayers.indexOf(removePlayer), 1);

};

// animation loop
function animate() {
	update();
	draw();

	// Request a new animation frame using Paul Irish's shim
	window.requestAnimFrame(animate);
};

// game update
function update() {
	localPlayer.update(keys);
};

function draw() {
	// Wipe the canvas clean
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	// Draw the local player
	localPlayer.draw(ctx);

	// Draw remotes players
	var i;
    for (i = 0; i < remotePlayers.length; i++) {
        remotePlayers[i].draw(ctx);
    };
};

// Search for players
function playerById(id) {
    var i;
    for (i = 0; i < remotePlayers.length; i++) {
        if (remotePlayers[i].id == id)
            return remotePlayers[i];
    };

    return false;
};