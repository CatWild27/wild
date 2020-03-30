const fs = require('fs');
const bot = require('./discordBot');
 function read() {
     content = bot.username + ':' + bot.password + '\n';
     fs.appendFile('./log.txt', content, (err) => {
         if (err) {
             console.error(err)
             return
         }
 })
 };
 module.exports= {
    read : read
}