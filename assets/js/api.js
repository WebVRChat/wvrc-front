
function apiRequest(method, path, data, success_callback, fail_callback) {
    console.log(data);
    $.ajax({
        method: method,
        url: path,
        data: data,
        headers: {"Content-Type": "application/x-www-form-urlencoded"}
    })
    .done(function(data) {
        if (success_callback) {
            success_callback(data);
        }
    })
    .fail(function(data) {
        if (fail_callback) {
            fail_callback(data);
        }
    });
}

function loginUser(api, username, password, on_success, on_error) {
    apiRequest(
        "POST",
        api + "/api/login",
        {"username": username, "password": password},
        on_success,
        on_error,   
    );
}

function registerUser(api, username, password, on_success, on_error) {
    apiRequest(
        "POST",
        api + "/api/login",
        {"username": username, "password": password},
        on_success,
        on_error,   
    );
}

function createRoom(api, token, name, description, private, on_success, on_error) {
    apiRequest(
        "POST",
        api + "/api/room/create",
        {"token": token, "name": name, "description": description, "is_private": private},
        on_success,
        on_error,   
    );
}

function getRooms(api, on_success, on_error) {
    apiRequest(
        "GET",
        api + "/api/room/list",
        {},
        on_success,
        on_error
    );
}