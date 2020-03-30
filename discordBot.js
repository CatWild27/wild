// to make sure webserver works correctly
// read the creds
// reqs
var http = require("http");
var queuing = require('./main.js');
var auth = require('./auth.json');
var sleep = require('sleep');
var Discord = require('discord.js');
var Author1 = 'CatWild';
var dta = require('./data.js');
var client = new Discord.Client();
client.on('ready', () => {
   console.log(`Logged in as ${client.user.tag}!`)
})

client.on('message', msg => {
    const args = msg.content.split(' ');
    const command = args.shift().toLowerCase();
    if(command === 'login'){
        if (!args.length) {
            return msg.channel.send(`Error ${msg.author}!`);
        };
        dta.up1();
        console.log( args[0] + ' ' + args[1] );
        module.exports.username = args[0];
        module.exports.password = args[1];
        queuing.startQueue()
        msg.channel.send({
            embed: {
                color: 3447003,
                title: "Бот запущен",
                description: "Чтобы узнать информацию напишите update",
            }
        });
    }
    if (msg.content === 'update') {
        var time = dta.t;
        var place = dta.p;
        msg.channel.send({
            embed: {
                color: 3447003,
                title: "Информация",
                description: "",
                fields: [{
                    name: "Место",
                    value:  `**${place}**`
                },
                    {
                        name: "Примерное время ожидания",
                        value:  `**${time}**`
                     },
                ],
                timestamp: new Date(),
                footer: {
                    icon_url: client.user.avatarURL,
                    text: "Author:  "+ Author1
                }
            }
        });
    }
    if (msg.content === "stop") {
        queuing.stop();
        msg.channel.send({
            embed: {
                color: 3447003,
                author: {
                    name: client.user.username,
                    icon_url: client.user.avatarURL
                },
                fields: [{
                    name: "Queue",
                    value: `Queue is **stopped**.`
                }
                ],
                timestamp: new Date(),
                footer: {
                    icon_url: client.user.avatarURL,
                    text: "Author: "+ Author1
                }
            }
        });

    }

})
client.login(auth.token)
