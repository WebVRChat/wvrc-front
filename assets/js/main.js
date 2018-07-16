player = new Player();

setInterval(player.sendPosition, 1000); // Send the position of the player each seconds.

// TODO: DRY and add support for rotation.
$("#message_x").change(function() {
    player.position.x = $('#message_x').val();
});
$("#message_y").change(function() {
    player.position.y = $('#message_y').val();
});
$("#message_z").change(function() {
    player.position.z = $('#message_z').val();
});


// Handle the events.

player.onCreation(function(id) {
    $('#peer_id_message').text('Your peer ID is : ' + id);
});

player.onConnection(function(connection) {
    $('#message_area').append(`<li> Logger : ${connection.peer} is connected.</li>`);

    // Add a new box representing the player.
    $('a-scene').append(
        `<a-box id="player_${connection.peer}" position="0 0 0" rotation="0 0 0" color="#4CC3D9"></a-box>`
    );
});

player.onChat(function(connection, chat) {
    $('#message_area').append(`<li>${connection.peer} : <b>${chat}</b></li>`);
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
        $('#message_area').append("<li> Logger : Audio error => " + error + "</li>");  
    }
);

// Handle local player actions

$('#connect_submit').click(function() {
    peer_id = $('#connect_peer').val();
    player.connect(peer_id);
});

$('#message_submit').click(
    player.sendChat($('#message_input').val())
);

$('#toggle_audio').click(function() {
    player.toggleAudioStream();

    if (player.isStreamingAudio) {
        $('#toggle_audio').text("Disable audio chat");

        player.streamAudio(
            function(stream) {
                $('#message_area').append("<li> Logger : Audio streaming.</li>");
            },
            function (error) {
                $('#message_area').append("<li> Logger : Audio can't be streamed.</li>");
            }
        );

    } else {
        $('#toggle_audio').text("Activate audio chat");
        $('#message_area').append("<li> Logger : Audio stream stopped.</li>");
    }
});