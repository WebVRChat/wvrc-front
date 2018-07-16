var player = new Player();


// Custom functions

/**
 * Print a message in the chat area.
 */
function log(message) {
    $('#message_area').append(`<li>${message}</li>`);
}

/**
 * Send the message the user wrote in the textbox.
 */
function sendMessage() {
    chat = $('#message_input').val();
    $("#message_input").val("");  // Clear the textbox.

    log(`You : ${chat}`);
    player.sendChat(chat);
};


// Position synchronisation

camera = document.querySelector('#splayer_camera');

// Send the position of the player each 0.5s.
setInterval(function() {
    player.rotation = camera.getAttribute("rotation");
    player.sendPosition();
}, 500); 

// Synchronizes the position of the player.
['x', 'y', 'z'].forEach(function(axis) {
    $("#message_" + axis).change(function() {
        player.position[axis] = $("#message_" + axis).val();
        camera.setAttribute('position', player.position);
    });
});


// Handle the events.

player.onCreation(function(id) {
    log(`Logger: Your peer ID is : ${id}.`);
});

player.onConnection(function(connection) {
    log(`Logger: ${connection.peer} is connected.`);

    // Add a new box representing the player.
    $('a-scene').append(
        `<a-box id="player_${connection.peer}" position="0 0 0" rotation="0 0 0" color="#4CC3D9"></a-box>`
    );
});

player.onDisconnection(function(connection) {
    log(`${connection.peer} disconnected.`);
});

player.onChat(function(connection, chat) {
    log(`${connection.peer} : <b>${chat}</b>`);
});

player.onPosition(function(connection, position, rotation) {
    other = document.querySelector('#player_' + connection.peer);

    other.setAttribute('position', position);
    other.setAttribute('rotation', rotation);
});

player.getAudio(
    function(stream) {
        var audio_streamer = document.querySelector('#audio_streamer');
        audio_streamer.srcObject = stream;
        audio_streamer.play();
    },
    function(error) {
        log("Logger : Audio error => " + error);
    }
);

$(window).on('unload', function() {
    player.disconnect();
});


// Handle local player actions

$('#connect_submit').click(function() {
    peer_id = $('#connect_peer').val();
    player.connect(peer_id);
});

$('#message_submit').click(sendMessage);

$('input[type=text]').on('keydown', function(e) {
    if (e.which == 13) {  // When user press enter
        sendMessage();
    }
});

$('#toggle_audio').click(function() {
    player.toggleAudioStream();

    if (player.isStreamingAudio) {
        $('#toggle_audio').text("Disable audio chat");

        player.streamAudio(
            function(stream) {
                log("Logger : Audio streaming.");
            },
            function (error) {
                log("Logger : Audio can't be streamed.");
            }
        );

    } else {
        $('#toggle_audio').text("Activate audio chat");
        log("Logger : Audio stream stopped.");
    }
});
