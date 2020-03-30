
// imports
const mc = require('minecraft-protocol'); // to handle minecraft login session
const opn = require('opn'); //to open a browser window
const config = require('./config.json'); // read the config
const log = require('./logi');
var bob = require('./discordBot.js');
let proxyClient; // a reference to the client that is the actual minecraft game
let client; // the client to connect to 2b2t
let server; // the minecraft server to pass packets

// function to disconnect from the server
function stop(){
	client.end(); // disconnect
	if (proxyClient) {
		proxyClient.end("Stopped the proxy."); // boot the player from the server
	}
	server.close(); // close the server
}

// function to start the whole thing
	function startQueuing(req) {
		client = mc.createClient({ // connect to 2b2t
			host: "2b2t.org",
			port: "",
			username: bob.username,
			password: bob.password,
			version: config.MCversion
		});
		let finishedQueue = false;
		client.on("packet", (data, meta) => { // each time 2b2t sends a packet
			if (!finishedQueue && meta.name === "playerlist_header") { // if the packet contains the player list, we can use it to see our place in the queue
				let headermessage = JSON.parse(data.header);
				module.exports.eta = headermessage.text.split("\n")[6].substring(27);
				module.exports.queue = headermessage.text.split("\n")[5].substring(25);
				server.motd =  headermessage.text.split("\n")[5].substring(25); // set the MOTD because why not
				log.read();
			}
			if (finishedQueue === false && meta.name === "chat") { // we can know if we're about to finish the queue by reading the chat message
				// we need to know if we finished the queue otherwise we crash when we're done, because the queue info is no longer in packets the server sends us.
				let chatMessage = JSON.parse(data.message);
				if (chatMessage.text && chatMessage.text === "Connecting to the server...") {
					if (proxyClient == null) { //if we have no client connected and we should restart
						stop();
						setTimeout(startQueuing, 100); // reconnect after 100 ms
					} else {
						finishedQueue = true;
						exports.queue = "FINISHED";
						exports.time = "NOW";
					}
				}
			}

			if (proxyClient) { // if we are connected to the proxy, forward the packet we recieved to our game.
				filterPacketAndSend(data, meta, proxyClient);
			}
		});

		// set up actions in case we get disconnected.
		client.on('end', () => {
			if (proxyClient) {
				proxyClient.end("Connection reset by 2b2t server.\nReconnecting...");
				proxyClient = null
			}
			stop();
			// setTimeout(startQueuing, 100); // reconnect after 100 ms
		});

		client.on('error', (err) => {
			if (proxyClient) {
				proxyClient.end(`Connection error by 2b2t server.\n Error message: ${err}\nReconnecting...`);
				proxyClient = null
			}
			stop();
			// setTimeout(startQueuing, 100); // reconnect after 100 ms
		});

		server = mc.createServer({ // create a server for us to connect to
			'online-mode': false,
			encryption: true,
			host: config.minecraft.ip,
			port: config.minecraft.port,
			version: config.MCversion,
			'max-players': maxPlayers = 1
		});

		server.on('login', (newProxyClient) => { // handle login
			newProxyClient.write('login', {
				entityId: newProxyClient.id,
				levelType: 'default',
				gameMode: 0,
				dimension: 0,
				difficulty: 2,
				maxPlayers: server.maxPlayers,
				reducedDebugInfo: false
			});
			newProxyClient.write('position', {
				x: 0,
				y: 1.62,
				z: 0,
				yaw: 0,
				pitch: 0,
				flags: 0x00
			});

			newProxyClient.on('packet', (data, meta) => { // redirect everything we do to 2b2t
				filterPacketAndSend(data, meta, client);
			});

			proxyClient = newProxyClient;
		});
	}

function filterPacketAndSend(data, meta, dest) {
	if (meta.name !="keep_alive" && meta.name !="update_time") { //keep alive packets are handled by the client we created, so if we were to forward them, the minecraft client would respond too and the server would kick us for responding twice.
		dest.write(meta.name, data);
	}
}

module.exports = {
        startQueue: function () {
                startQueuing();
        },
        filterPacketAndSend: function () {
                filterPacketAndSend();
        },
        stop: function() {
                stop();
        }
};
