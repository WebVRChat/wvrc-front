// Custom functions

/**
 * Check if a string can be a command
 */
function isCommand(string) {
	return ["/help", "/connect", "/audio", "/tp"].includes(string.split(' ')[0]);
}

/**
 * Do stuff
 */
function processCommand(string) {
	command = string.split(' ');

	switch (command[0]) {
		case "/help":
			log("Command: help connect audio tp");
			break;

		case "/connect":
			log("Logger: Connecting to " + command[1]);
			player.connect(command[1]);
			break;
		
		case "/audio":
			toggle_audio();
			break;

		case "/tp":
			log("Logger: TP to " + command.slice(1));
			/// parse integers and all that stuff
			break;
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
