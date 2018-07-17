class Player {
    /*
        Handle the communication between players.
    */

    constructor(configuration=null) {
        this.peer = new Peer(configuration);
        this.others = {};

        this.position = {x: 0, y: 0, z: 0};
        this.rotation = {rx: 0, ry: 0, rz: 0};

        this.isStreamingAudio = false;
    }

    /**
     * Escape input to avoid XSS exploitation
     * @param {string} input
     *  Input string
     * @return
     *  Escaped string
     */
    _escape(input) {
        // XSS protection
        return input.replace(/\&/g, '&amp;')
            .replace(/\</g, '&lt;')
            .replace(/\>/g, '&gt;')
            .replace(/\"/g, '&quot;')
            .replace(/\'/g, '&#x27')
            .replace(/\//g, '&#x2F');
    }

    /**
     * Handle peer creation
     * @param {function} handler
     *  Function that handle the creation event
     */
    onCreation(handler) {
        this.peer.on('open', handler);
    }

    /**
     * Handle other peer connection
     * @param {function} handler
     *  Function that handle the connection event
     */
    onConnection(handler) {
        var that = this;
        that.peer.on('connection', function(connection) {
            if (!(connection.peer in that.others)) {
                that.connect(connection.peer);
            }
            handler(connection);
        });
    }

    /**
     * Handle other peer disconnection
     * @param {function} handler
     *  Function that handle disconnection event
     */
    onDisconnection(handler) {
        var that = this;
        that.onData(function(connection, message) {
            if (message.status == 'disconnected') {
                delete that.others[connection.peer];
                handler(connection);
            }
        });
    }

    /**
     * Handle data sended by other peer
     * @param {function} handler
     *  Function that handle the receive event
     */
    onData(handler) {
        this.onConnection(function(connection) {
            connection.on('data', function(message) {
                handler(connection, message);
            });
        });
    }

    /**
     * Handle chat message sent by other peer
     * @param {function} handler
     *  Function that handle the message sent
     */
    onChat(handler) {
        var that = this;
        this.onData(function(connection, message) {
            if (message.chat) {
                handler(connection, that._escape(message.chat));
            }
        });
    }

    /**
     * Handle position sent by other peer
     * @param {function} handler   
     *  Function that handle the position sent
     */
    onPosition(handler) {
        this.onData(function(connection, message) {
            if (message.position && message.rotation) {
                handler(connection, message.position, message.rotation);
            }
        });
    }

    /**
     * Connect to a peer
     * @param {string} peer_id
     *  Other peer string id
     */
    connect(peer_id) {
        this.others[peer_id] = {
            data: this.peer.connect(peer_id),
            media: null,
            position: {x: 0, y: 0, z: 0}
        };
    }

    /**
     * Disconnect all other peers
     */
    disconnect() {
        for (let peer in this.others) {
            this.others[peer].data.send({status: 'disconnected'});
        }
    }

     /**
     * Send message to a peer
     * @param {string} message
     *  Message to send
     */
    sendChat(message) {
        for (let peer in this.others) {
            this.others[peer].data.send({chat: this._escape(message)});
        }
    }

    /**
     * Send position to all peers
     */
    sendPosition() {
        for (let peer in this.others) {
            this.others[peer].data.send({
                position: this.position,
                rotation: this.rotation
            });
        }
    }

    /**
     * Move the player and send its position to all peers.
     * @param {object} new_position
     *  Position '{x, y, z}' to send.
     * @param {function} callback
     *  Function executed after the player moved.
     */
    move(new_position, callback=null) {
        this.position = new_position;

        this.sendPosition();

        if (callback != null) {callback();}
    }

    /**
     * Move the player and send its rotation to all peers.
     * @param {object} new_rotation
     *  Rotation '{rx, ry, rz}' to send.
     * @param {function} callback
     *  Function executed after the player rotated.
     */
    rotate(new_rotation, callback=null) {
        this.rotation = new_rotation;

        this.sendPosition();

        if (callback != null) {callback();}
    }

    /**
     * Send audio to a peer
     * @param {function} success_handler
     *  Function that handle the stream on success
     * @param {function} error_handler
     *  Function that handle the exception on error
     */
    streamAudio(success_handler, error_handler) {
        var that = this; // TODO: Check if useful or not here
        that.isStreamingAudio = true;

        for (var peer in that.others) {
            if (!that.others[peer].media) {
                navigator.mediaDevices.getUserMedia({video: false, audio: true}).then(stream => {
                    var call = that.peer.call(peer, stream);
                    that.others[peer].media = stream;
                    call.on('stream', success_handler);
                }).catch(err => error_handler(err));
            }
        }
    }

    /**
     * Receive audio sent by a peer
     * @param {function} success_handler
     *  Function that handle the stream on success
     * @param {function} error_handler
     *  Function that handle exception on error
     */
    getAudio(success_handler, error_handler) {
        this.peer.on('call', function(call) {
            navigator.mediaDevices.getUserMedia({video: false, audio: true}).then(stream => {
                call.answer(stream);
                call.on('stream', success_handler);
            }).catch(err => error_handler(err));
        });
    }

    /**
     * Enable/Disable audio stream
     */
    toggleAudioStream() {
        this.isStreamingAudio = !this.isStreamingAudio;

        for (var peer in this.others) {
            if (this.others[peer].media) {
                this.others[peer].media.getAudioTracks()[0].enabled = this.isStreamingAudio;
            }
        }
    }
}