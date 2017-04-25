var fs = require('fs');
var http = require('http');

var server = http.createServer();
var io = require('socket.io')(server);

var clients = {
    sockets: {},
    add: function(key, client) {
        this.sockets[key] = client;
    },
    get: function(key) {
        if (this.sockets.hasOwnProperty(key)) {
            return this.sockets[key];
        } else {
            return null;
        }
    },
    del: function(key) {
        if (this.sockets.hasOwnProperty(key)) {
            delete this.sockets[key];
        }
    }
};

io.on('connection', function(client){
    client.on('register_session', function(data) {
        if (data) {
            var vmSession = data.toString().trim();
            if (vmSession) {
                if (clients.get(vmSession)) {
                    clients.get(vmSession).disconnect();
                }
                clients.add(vmSession, client);
                client.vmSession = vmSession;
            }
        }
    });
    client.on('disconnect', function(){
        if (client.hasOwnProperty('vmSession')) {
            clients.del(client.vmSession);
        }
    });
});

server.listen(10001);


var net = require('net');
net.createServer(function(sock) {
    sock.on('data', function(data) {
        try {
            data = JSON.parse(data);
            var eventName = 'message',
                eventData;
            if (data.hasOwnProperty('event')) {
                eventName = data.event;
            } else {
                eventData = data;
            }
            if (data.hasOwnProperty('data')) {
                eventData = data.data;
            }
            if (data.hasOwnProperty('vmSession')) {
                var client = clients.get(data.vmSession);
                if (client) {
                    client.emit(eventName, eventData);
                }
            } else {
                io.emit(eventName, eventData);
            }
        } catch (e) { console.log(e); }
        sock.write('done');
    });
}).listen(10002, '0.0.0.0');