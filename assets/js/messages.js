// Custom functions

/**
 * Check if a string can be a command
 */
function isCommand(string) {
	if (string === "/help")
		return true;
	else if (string.substr(0, 8) === "/connect")
		return true;
	else if (string === "/audio")
		return true;
	else if (string.substr(0, 3) === "/tp")
		return true;
	return false;
}

/**
 * Do stuff
 */
function processCommand(command) {
	if (command === "/help") {
		log("Command: help connect audio tp")
	} else if (command.substr(0, 8) === "/connect") {
		log("Logger: Connecting to " + command.substr(9));
		player.connect(command.substr(9));
	} else if (command === "/audio") {
		toggle_audio();
	} else if (command.substr(0, 3) === "/tp") {
		log("Logger: TP to " + command.substr(4));
		/// parse integers and all that stuff
	}
}

/**
 * Send the message the user wrote in the textbox.
 */
function sendMessage() {
    chat = $('#message_input').val();
    $("#message_input").val("");  // Clear the textbox.

    log(`You : ${chat}`);
    player.sendChat(chat);

	if (isCommand(chat))
		processCommand(chat);
};


// Custom events

$('#message_submit').click(sendMessage);

$('input[type=text]').on('keydown', function(e) {
    if (e.which == 13) {  // When user press enter
        sendMessage();
    }
});
