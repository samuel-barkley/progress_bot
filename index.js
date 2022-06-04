const { REST } = require('@discordjs/rest');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { Routes } = require('discord-api-types/v9');
const { token, clientId, guildId } = require('./config.json');
const { Client, Intents } = require('discord.js');
const fs = require('fs');

let rawdata = fs.readFileSync('goals.json');
let goals = JSON.parse(rawdata);

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES,] })
const prefix = '+'

client.once('ready', () => {
  console.log('Ready!');
});

client.on("messageCreate", (message) => {
  if (message.content.startsWith(prefix)) {
    var command = message.content.substring(prefix.length).split(" ");

    switch (command[0]) {
      case "ping":
        message.channel.send("pong");
        break;
      case "add":
        if (command.length == 3) {
          if (isNaN(Number(command[2]))) {
            message.channel.send(command[2] + ", is not a number.")
          } else {
            goals.push({ name: command[1] })
            Save(goals);
            message.channel.send(command[2] + ", added to progress meter.")
          }
        } else {
          message.channel.send(`Add format is incorrect. Format is \`${prefix}add <goal> <amount>\``)
        }
        break;
      default:
        break;
    }
  }
});

client.login(token);

function Save(data) {
  rawData = JSON.stringify(data)
  fs.writeFileSync('goals.json', rawData);
}