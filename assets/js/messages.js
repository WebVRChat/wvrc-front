// Custom functions

/**
 * Check if a string can be a command
 */
function isCommand(string) {
	if (string === "/help")
		return true;
	return false;
}

/**
 * Do stuff
 */
function processCommand(command) {
	if (command === "/help")
		log("Command: help")
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
