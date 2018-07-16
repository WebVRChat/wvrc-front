var player = new Player();

setInterval(function() {player.sendPosition();}, 1000); // Send the position of the player each seconds.

// TODO: DRY and add support for rotation.
camera = document.querySelector('#splayer_camera');

$("#message_x").change(function() {
    player.position.x = $('#message_x').val();
    camera.setAttribute('position', player.position);
});
$("#message_y").change(function() {
    player.position.y = $('#message_y').val();
    camera.setAttribute('position', player.position);
});
$("#message_z").change(function() {
    player.position.z = $('#message_z').val();
    camera.setAttribute('position', player.position);
});


// Handle the events.

player.onCreation(function(id) {
    $('#message_area').append(`<li> Logger : Your peer ID is : ${id}.</li>`);
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

$('#message_submit').click(function() {
    chat = $('#message_input').val();

    $('#message_area').append(`<li> You : ${chat}</li>`);
    player.sendChat(chat);
});

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