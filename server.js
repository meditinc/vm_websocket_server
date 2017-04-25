var fs = require('fs');
var http = require('http');

var server = http.createServer();
var io = require('socket.io')(server);

var clients = {
    clients: {},
    add: function(key, client) {
        this.clients[key] = client;
    },
    get: function(key) {
        if (this.clients.hasOwnProperty(key)) {
            return this.clients[key];
        } else {
            return null;
        }
    },
    del: function(key) {
        if (this.clients.hasOwnProperty(key)) {
            delete this.clients[key];
        }
    }
};

io.on('connection', function(client){
    client.on('register_session', function(data) {
        var vmSession = data.toSource().trim();
        if (!empty(vmSession)) {
            if (clients.get(vmSession)) {
                clients.get(vmSession).disconnect();
            }
            clients.add(vmSession, client);
            client.vmSession = vmSession;
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

    console.log('CONNECTED: ' + sock.remoteAddress +':'+ sock.remotePort);

    sock.on('data', function(data) {
        console.log('DATA ' + sock.remoteAddress + ': ' + data);
        // Write the data back to the socket, the client will receive it as data from the server
        sock.write('done');
    });

    // Add a 'close' event handler to this instance of socket
    sock.on('close', function(data) {
        console.log('CLOSED: ' + sock.remoteAddress +' '+ sock.remotePort);
    });

}).listen(10002, '0.0.0.0');

console.log('net started');