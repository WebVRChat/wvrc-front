var player = new Player();


// Custom functions

/**
 * Get locale of navigator
 */
function getLocale()
{
    if (navigator.languages != undefined)
        return navigator.languages[0];
    else
        return navigator.language;
}

/**
 * Print a message in the chat area.
 */
function log(message) {
    let d = new Date();
    let t = d.toLocaleTimeString(getLocale());
    $('#message_area').append(`<li>[${t}] ${message}</li>`);
    $("#message_area")[0].scrollTop = $("#message_area")[0].scrollHeight;
}

/**
 * Starting audio sharing
 */
function toggle_audio() {
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
}


// Position synchronisation

camera = document.querySelector('#splayer_camera');

// Send the position of the player each 0.5s.
setInterval(function() {
    player.rotate(camera.getAttribute("rotation"));
}, 50);

// Synchronizes the position of the player.
['x', 'y', 'z'].forEach(function(axis) {
    $("#message_" + axis).change(function() {
        var new_position = Object.assign({}, player.position);
        new_position[axis] = $("#message_" + axis).val();

        player.move(new_position, function() {
            camera.setAttribute('position', player.position);
        });
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
