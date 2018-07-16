function escape_output(input) {
    // XSS protection
    return input.replace(/\&/g, '&amp;')
        .replace(/\</g, '&lt;')
        .replace(/\>/g, '&gt;')
        .replace(/\"/g, '&quot;')
        .replace(/\'/g, '&#x27')
        .replace(/\//g, '&#x2F');
}


class Server {
    constructor(configuration=null) {
        this.peer = new Peer(configuration);
        this.connections = {};
    }

    on_creation(handler) {
        this.peer.on('open', handler);
    }

    connect(peer_id) {
        this.connections[peer_id] = {
            data: this.peer.connect(peer_id),
            media: null
        };
    }

    on_connection(handler) {
        var that = this;

        that.peer.on('connection', function(connection) {
            if (!(connection.peer in that.connections)) {
                that.connect(connection.peer);
            }
            handler(connection);
        });
    }

    on_data(handler) {
        this.peer.on('connection', function(connection) {
            connection.on('data', function(message) {
                handler(connection, message);
            });
        });
    }

    send_data(message) {
        for (var peer in this.connections) {
            this.connections[peer].data.send(message);
        }
    }

    stream_audio(success_handler, error_handler) {
        var that = this;

        for (var peer in that.connections) {
            if (!that.connections[peer].media) {
                navigator.mediaDevices.getUserMedia({video: false, audio: true}).then(stream => {
                    var call = that.peer.call(peer, stream);
                    that.connections[peer].media = stream;
                    call.on('stream', success_handler);
                }).catch(err => error_handler(err));
            }
        }
    }

    get_audio(success_handler, error_handler) {
        this.peer.on('call', function(call) {
            navigator.mediaDevices.getUserMedia({video: false, audio: true}).then(stream => {
                call.answer(stream);
                call.on('stream', success_handler);
            }).catch(err => error_handler(err));
        });
    }

    toggle_audio_stream() {
        for (var peer in this.connections) {
            if (this.connections[peer].media) {
                this.connections[peer].media.getAudioTracks()[0].enabled = 
                    !(this.connections[peer].media.getAudioTracks()[0].enabled);
            }
        }
    }
}


node = new Server();
var audio_toggle_mode = 1;
var x = 0;
var y = 0;
var z = 0;

function send_pos(chat='') {
    camera = document.querySelector('#splayer_camera');

    message = {
        chat: escape_output(chat),
        x: $('#message_x').val(),
        y: $('#message_y').val(),
        z: $('#message_z').val(),
        rx: camera.getAttribute('rotation').x,
        ry: camera.getAttribute('rotation').y,
        rz: camera.getAttribute('rotation').z
    };

    if (([x, y, z] != [message.x, message.y, message.z]) || chat) {
        if (chat) {
            $('#message_area').append(`<li>You (${message.x}, ${message.y}, ${message.z}): ${message.chat} </li>`);
        }

        x = message.x;
        y = message.y;
        z = message.z;

        node.send_data(message);
    }

    camera.setAttribute('position', {x: message.x, y: message.y, z: message.z});
}

/*async function cyclic_send_pos() {
    await send_pos();
    setInterval(cyclic_send_pos, 1000);
}*/

$("#message_x").change(send_pos());
$("#message_y").change(send_pos());
$("#message_z").change(send_pos());

node.on_creation(function(id) {
    $('#peer_id_message').text('Your peer ID is : ' + id);
    cyclic_send_pos();
});

node.on_connection(function(connection) {
    $('#message_area').append(
        "<li> Logger : " + connection.peer + " is connected.</li>"
    );
    $('a-scene').append(
        `<a-box id="player_${connection.peer}" position="0 0 0" rotation="0 0 0" color="#4CC3D9"></a-box>`
    );
});

node.on_data(function(connection, data) {
    if (data.chat) {
        $('#message_area').append(
            `<li>${connection.peer} (${data.x}, ${data.y}, ${data.z}): <b>${escape_output(data.chat)}</b></li>`
        );
    }

    player = document.querySelector('#player_' + connection.peer);
    player.setAttribute('position', {x: data.x, y: data.y, z: data.z});
    player.setAttribute('rotation', {x: data.rx, y: data.ry, z: data.rz});

});

$('#toggle_audio').click(function() {
    node.toggle_audio_stream();

    if (audio_toggle_mode == 1) {
        audio_toggle_mode = 0;
        $('#toggle_audio').text("Disable audio chat");
        node.stream_audio(
            function(stream) {$('#message_area').append("<li> Logger : Audio streaming.</li>");},
            function(err) {$('#message_area').append("<li> Logger : Audio can't be streamed.</li>");}
        );
    } else {
        audio_toggle_mode = 1;
        $('#toggle_audio').text("Activate audio chat");
        $('#message_area').append("<li> Logger : Audio stream stopped.</li>");
    }
});

node.get_audio(
    function(stream) {
        var player = document.querySelector('#audio_streamer');
        player.srcObject = stream;
        player.play();
    },
    function(error) {
        $('#message_area').append("<li> Logger : Audio error => " + error + "</li>");
    }
);

$('#connect_submit').click(function() {
    peer_id = $('#connect_peer').val();
    node.connect(peer_id);
});

$('#message_submit').click(
    send_pos(
        $('#message_input').val()
    )
);
