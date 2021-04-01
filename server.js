const Firebase = require('./managers/Firebase'),
    Discord = require('discord.js'),
    bot = new Discord.Client();

var servers;
bot.on('ready', async () => {
    console.log('Filosofador on');

    servers = await Firebase.getAllServers(bot.guilds.cache.map(guild => guild.id));
    Firebase.observer('servers', (result) => servers = result);
});

bot.on('message', message => {
    // console.log(message);
});

bot.login(process.env.PREFIX);