const { token, clientId, guildId } = require('./config.json');
const { Client, Intents } = require('discord.js');
const fs = require('fs');

let rawdata;

if (fs.existsSync("goals.json")) {
  rawdata = fs.readFileSync("goals.json");
} else {
  fs.writeFileSync("goals.json", "[]")
  rawdata = fs.readFileSync("goals.json");
}


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
      case "add":

        if (ValidateAdd(command, goals, prefix, message)) {
          if (goals.find(obj => obj.goal == command[1]).progress == undefined) {
            goals.find(obj => {
              return obj.goal == command[1]
            }).progress = Number(command[2])
          } else {
            goals.find(obj => {
              return obj.goal == command[1]
            }).progress += Number(command[2])
          }
          Save(goals);
          message.channel.send(command[2] + ", added to progress meter.")
        }
        break;
      case "create":
        if (ValidateCreate(command, goals, prefix, message)) {
          goals.push({ goal: command[1], progress: 0, goalAmount: command[2] })
          Save(goals)
          message.channel.send(`Goal created.`);
        }
        break;
      case "remove":
        if (ValidateRemove(command, goals, prefix, message)) {
          goals = goals.filter(data => data.goal != command[1]);
          Save(goals);
          message.channel.send(`Goal has been removed`);
        }
        break;
      case "progress":
        if (ValidateProgress(command, goals, prefix, message)) {
          let goal = goals.find(obj => obj.goal == command[1])
          message.channel.send(`${goal.goal}: ${NumberWithCommas(goal.progress)} / ${NumberWithCommas(goal.goalAmount)}`);
        }
        break;
      case "list":
        if (ValidateList(command, goals, prefix, message)) {
          let messageString = "";
          for (let i = 0; i < goals.length; i++) {
            messageString += `${goals[i].goal}: ${NumberWithCommas(goals[i].progress)} / ${NumberWithCommas(goals[i].goalAmount)} \n`;
          }
          message.channel.send(messageString)
        }
        break;
      default:
        message.channel.send("Invalid request.");
        break;
    }
  }
});

client.login(token);

function Save(data) {
  rawData = JSON.stringify(data)
  fs.writeFileSync('goals.json', rawData);
}

function ValidateAdd(command, goals, prefix, message) {
  if (command.length == 3) {
    if (!isNaN(Number(command[2]))) {
      if (goals.find(obj => obj.goal == command[1]) != undefined) {
        return true;
      } else message.channel.send(command[1] + `, goal doesn't exist. Use \`${prefix}create <goal> <amount>\``); return false;
    } else message.channel.send(command[2] + ", is not a number."); return false;
  } else message.channel.send(`Add format is incorrect. Format is \`${prefix}add <goal> <amount>\``); return false;
}

function ValidateCreate(command, goals, prefix, message) {
  if (command.length == 3) {
    if (!isNaN(Number(command[2]))) {
      if (goals.find(obj => obj.goal == command[1]) == undefined) {
        return true;
      } else message.channel.send(`A goal with the name of ${command[1]} already exists. Use a different name or remove the existing one with \`${prefix}remove <goal>\``); return false;
    } else message.channel.send(`${command[2]} is not a number. <amount> must be a number`); return false;
  } else message.channel.send(`Create format is incorrect. Format is \`${prefix}create <goal> <amount>\``); return false;
}

function ValidateRemove(command, goals, prefix, message) {
  if (command.length == 2) {
    if (goals.find(obj => obj.goal == command[1]) != undefined) {
      return true;
    } else message.channel.send(`The goal you want to remove doesn't exist.`); return false;
  } else message.channel.send(`Remove format is incorrect. Format is \`${prefix}remove <goal>\``); return false;
}

function ValidateProgress(command, goals, prefix, message) {
  if (command.length == 2) {
    if (goals.find(obj => obj.goal == command[1]) != undefined) {
      console.log(goals.find(obj => obj.goal == command[1]))
      return true;
    } else message.channel.send(`The goal doesn't exist.`); return false;
  } else message.channel.send(`Progress format is incorrect. Format is \`${prefix}progress <goal>\``); return false;
}

function ValidateList(command, goals, prefix, message) {
  if (command.length == 1) {
    if (goals.length != 0) {
      return true;
    } else message.channel.send(`There are no goals at the moment. Create a goal with the following command \`${prefix}create <goal> <amount>\``); return false;
  } else message.channel.send(`Progress format is incorrect. Format is \`${prefix}list\``); return false;
}

function NumberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}