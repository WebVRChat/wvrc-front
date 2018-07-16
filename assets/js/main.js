var player = new Player();
camera = document.querySelector('#splayer_camera');

setInterval(() => {
    player.rotation = camera.getAttribute("rotation");
    player.sendPosition();
}, 500); // Send the position of the player each 0.5s.

$(camera).change(function () {
    console.log(document.querySelector('#splayer_camera'));
});

for (let i=120; i < 123; i++) {
    let L = String.fromCharCode(i);
    $("#message_" + L).change(function() {
        player.position[L] = $("#message_" + L).val();
        camera.setAttribute('position', player.position);
    });
}

const log = ((msg) => {
    $('#message_area').append(`<li>${msg}</li>`)
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

// Handle local player actions

$('#connect_submit').click(function() {
    peer_id = $('#connect_peer').val();
    player.connect(peer_id);
});

let sendMsg = function() {
    chat = $('#message_input').val();
    $("#message_input").val("");

    log(`You : ${chat}`);
    player.sendChat(chat);
};

$('#message_submit').click(sendMsg);

$('input[type=text]').on('keydown', function(e) {
    if (e.which == 13)
        sendMsg();
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

$(window).on('unload', function () {
    player.disconnect();
});
