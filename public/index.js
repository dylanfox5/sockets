var socket = io();
var player;
var ready = false;
var Htimestamp;
var Utimestamp;
var showChat = false;
var videoID;

document.getElementById("togglechat").onclick = function() {
    if (showChat == false) {
    document.getElementById("chat").style.display = "block";
    document.getElementById("togglechat").innerHTML = "Hide Chat";
    showChat = true;
    }
    else if (showChat == true) {
    document.getElementById("chat").style.display = "none";
    document.getElementById("togglechat").innerHTML = "Show Chat";
    showChat = false;
    }
};

document.getElementById("host").onclick = function() {
    Htimestamp = Date.now();
    socket.emit("host", Htimestamp); 
    socket.on("host", function() {
        player = new YT.Player('player', {
        height: '390',
        width: '640',
        videoId: videoID,
        events: {
            'onStateChange': onPlayerStateChange
            }});
        }
    );
};

document.getElementById("user").onclick = function() {
    socket.emit("user");
    socket.on("user", function(hostTimestamp) {
        Utimestamp = Date.now();
        player = new YT.Player('player', {
        height: '390',
        width: '640',
        videoId: videoID,
        playerVars: { 
            'controls': 0,
            'disablekb': 1,
            'start': Math.floor((Utimestamp - hostTimestamp)/1000)
            },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
            }});
        }
    );
};

socket.on("video id", (id) => {
    videoID = id;
});
socket.on("play", playVideo);
socket.on("pause", pauseVideo);

var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

function onPlayerReady(event) {
    event.target.playVideo();
}

function onPlayerStateChange(event) {
    if (event.data == -1) {
        console.log("unstarted");
    }
    else if (event.data == 0) {
        console.log("ended");
        socket.emit("stop");
    }
    else if (event.data == 1) {
        console.log("playing");
        socket.emit("play");
    }
    else if (event.data == 2) {
        console.log("paused");
        socket.emit("pause");
    }
    else if (event.data == 3) {
        console.log("buffering")
    }
    else if (event.data == 5) {
        console.log("cued");
    }
}
function playVideo() {
    player.playVideo();
}
function stopVideo() {
    player.stopVideo();
}
function pauseVideo() {
    player.pauseVideo();
}

$(function () {
    $('form').submit(function(e){
    e.preventDefault(); // prevents page reloading
    socket.emit('chat message', $('#m').val());
    $('#m').val('');
    return false;
    });
    socket.on('chat message', function(msg){
    $('#messages').append($('<li>').text(msg));
    });
});

function authenticate() {
    return gapi.auth2.getAuthInstance()
        .signIn({scope: "https://www.googleapis.com/auth/youtube.readonly"})
        .then(function() { console.log("Sign-in successful"); },
              function(err) { console.error("Error signing in", err); });
}
  function loadClient() {
    gapi.client.setApiKey("AIzaSyAu9ZAeh_h1uerucOZPmWoBi7AX5A1piok");
    return gapi.client.load("https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest")
        .then(function() { console.log("GAPI client loaded for API"); },
              function(err) { console.error("Error loading GAPI client for API", err);
    });
}

function execute() {
    query = document.getElementById("query").value;
    return gapi.client.youtube.search.list({
      "part": "snippet",
      "maxResults": 1,
      "q": query
    })
        .then(function(response) {
                // Handle the results here (response.result has the parsed body).
                videoID = response["result"]["items"][0]["id"]["videoId"];
                socket.emit("video id", videoID);
                console.log("First Response", response["result"]["items"][0]);
                console.log("ID", videoID);
              },
              function(err) { console.error("Execute error", err); });
  }
gapi.load("client:auth2", function() {
    gapi.auth2.init({client_id: "991473044430-fed6chse96kdfbk0qdmjfte8ps386e0p.apps.googleusercontent.com"});
});