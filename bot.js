require('dotenv').config();
const Discord = require('discord.js');
const fetch = require('node-fetch');
const ms = require("ms");
const fs = require('fs');
const bot = new Discord.Client();
const TOKEN = process.env.TOKEN;
bot.login(TOKEN);

const TIMEZONE_OFFSET_GMT = 4;
const TIMEZONE_OFFSET_FINLAND = 6;

const clawTrigger = ["706819836071903275", "662301446036783108", "707600524727418900"];
const pinballTrigger = ["613630308931207198", "702578486199713872", "707600524727418900"];
const arcadeTrigger = clawTrigger.concat(pinballTrigger);
const raceTrigger = ["589484542214012963", "707600524727418900"];
const sumoTrigger = ["627919045420646401", "707600524727418900"];
const kartTrigger = ["768112471860576297", "707600524727418900"];
const generalTrigger = ["586955337870082082", "571390705117954049", "571600581936939049", "631391110966804510", "589485632984973332", "571388780058247185", "710104643996352633", "707600524727418900"];
const sneakTrigger = ["631134966163701761", "662642212789551124", "707600524727418900"];
const communityTrigger = ["751846589039116360", "751846612937998356", "707600524727418900"];
const botSpamID = "710104643996352633";
const modBotSpamID = "593000239841935362";

const testChannelID = "707600524727418900";
const surrogateChannelID = "710104643996352633";

//Game Announcements
async function announcement(game, image, numImage, channel) {
	while (true) {
		let at = "";
		if (game.toLowerCase().includes("sumobots")) {
			at = "<@&744956818073190471>";
		} else if (game.toLowerCase().includes("racerealcars143")) {
			at = "<@&744956844233064449>";
		} else if (game.toLowerCase().includes("mariokartlive")) {
			at = "<@&768263821739032578>";
		}
		const {list} = fetch("https://g9b1fyald3.execute-api.eu-west-1.amazonaws.com/master/games/?shortId=" + game.toLowerCase(), {
			method: 'GET', headers: {
				'Content-Type': 'application/json',
			},
		}).then(response => response.json())
			.then((x) => {
				if (x == null || x.result == null || x.result.schedule == null) {
					let scheduleHour = null;
				} else {
					const date = getDateObject(TIMEZONE_OFFSET_GMT);
					let output = "";
					let adjustedMinute = date.minute + date.hour * 60 +( date.weekdayNr-1) * 1440;
					let nearestStartTime = x.result.schedule.findIndex(z => Math.abs(adjustedMinute - z.startTime) < 20);
					let rand = Math.floor(Math.random() * numImage) + 1;
					if (!(nearestStartTime === -1)) {
						let	startTime = x.result.schedule[nearestStartTime].startTime;
						// console.log(startTime-adjustedMinute)
						if (startTime - adjustedMinute === 15 ) {
							let out = at + " **" + game + "** goes live in 15 minutes! You can play here:\nhttps://surrogate.tv/game/" + game.toLowerCase() + "\n";
							bot.channels.get(channel).send(out, {
								files: [{
									attachment: './gifs/' + image + '/' + image + '_' + rand + '.gif', name: image + '.gif',
								}],
							})
								.then(bot.channels.get(channel).send("**NOTE** Notifications for games are being changed to a role based system. You can get a role by reacting to the message in <#745097595692515380>"));
							logBotActions(null, game + " Pre-Announcement");
						} else if (startTime - adjustedMinute === 0 ) {
							let out = at + " **" + game + "** is live and you can start to queue up! You can play here:\nhttps://surrogate.tv/game/" + game.toLowerCase() + "\n";
							bot.channels.get(channel).send(out, {
								files: [{
									attachment: './gifs/' + image + '/' + image + '_' + rand + '.gif', name: image + '.gif',
								}],
							})
								.then(bot.channels.get(channel).send("**NOTE** Notifications for games are being changed to a role based system. You can get a role by reacting to the message in <#745097595692515380>"));
							logBotActions(null, game + " Announcement");
						}
					}
				}
			});
		await Sleep(60000); //1 minute
	}
}

function Sleep(milliseconds) {
	return new Promise(resolve => setTimeout(resolve, milliseconds));
}

function logBotActions(message, action) {
	const date = getDateObject(0);
	if (message == null) {
		let out = date.timeString + " EST | AUTO ANNOUNCE | " + action;
		console.log(out);
		fs.appendFile("./bot_logs/logs_" + date.dateString_MDY_noLead + ".txt", out + "\n", function (err) {
			if (err) throw err;
		});
	} else if (message === "AUTO UNMUTE") {
		let out = date.timeString + " EST | AUTO UNMUTE | " + action;
		console.log(out);
		fs.appendFile("./bot_logs/logs_" + date.dateString_MDY_noLead + ".txt", out + "\n", function (err) {
			if (err) throw err;
		});
	} else if (message === "ERROR") {
		let out = date.timeString + " EST | ERROR | " + action;
		console.log(out);
		fs.appendFile("./bot_logs/logs_" + date.dateString_MDY_noLead + ".txt", out + "\n", function (err) {
			if (err) throw err;
		});
	} else {
		let out = date.timeString + " EST | " + message.member.user.tag + " | " + action;
		console.log(date.timeString + " EST | " + message.member.user.tag + " | " + action);
		fs.appendFile("./bot_logs/logs_" + date.dateString_MDY_noLead + ".txt", out + "\n", function (err) {
			if (err) throw err;
		});
	}
}

function logReactActions(user, event) {
	const date = getDateObject(0);
	console.log(date.timeString + " EST | " + user.tag + " | " + event);
	fs.appendFile("./bot_logs/logs_" + date.dateString_MDY_noLead + ".txt", date.timeString + " EST | " + user.tag + " | " + event + "\n", function (err) {
		if (err) throw err;
	});
}

async function newDayCheck() {
	let startingDate = getDateObject(0);
	
	fs.open("./bot_logs/logs_" + startingDate.dateString_MDY_noLead + ".txt", 'a', function (err, file) {
		if (err) throw err;
	});
	
	while (true) {
		const checkDate = getDateObject(0);
		if (checkDate.day > startingDate.day || checkDate.month > startingDate.month || checkDate.year > startingDate.year) {
			fs.appendFile("./bot_logs/logs_" + startingDate.dateString_MDY_noLead + ".txt", "Starting a new day and restarting the bot", function (err) {
				if (err) throw err;
			});
			console.log("Starting a new day\n\n\n\n\n");
			startingDate=checkDate;
			if (startingDate.weekday == "Wednesday") {
				bot.channels.get("668884637694558228").send("<@!120618883219587072> , <@152200419043442688> , and <@161617853819125760> \n Are you good to host SumoBots this weekend for your normal sessions?");
			}
			fs.open("./bot_logs/logs_" + startingDate.dateString_MDY_noLead + ".txt", 'a', function (err, file) {
				if (err) throw err;
			});
		}
		await Sleep(ms("1m"));
	}
}

async function checkToUnmute() {
	let testServer = bot.guilds.get("707047722208854098");
	let bromBotServer = bot.guilds.get("664556796576268298");
	let surrogateServer = bot.guilds.get("571388780058247179");
	let role = surrogateServer.roles.find(r => r.name === "muted");
	while (true) {
		let date = getDateObject(0);
		let tempMin = date.minute + ((date.hour + (date.day * 24)) * 60);
		fs.exists("./database/mute.dat", (exists) => {
			if (exists) {
				fs.readFile("./database/mute.dat", 'ascii', function (err, file) {
					if (err) throw err;
					let testData = file.toString().split("\n");
					for (let i = 0; i < testData.length; i++) {
						if (testData[i].length!=0) {
							let remove = testData[i].split("|");
							let removeTime = remove[1].split("~");
							let removeDate = removeTime[0].split("/");
							let removeSpecificTime = removeTime[1].split(":");
							let success = false;
							let removeMin = parseInt(removeSpecificTime[1]) + ((parseInt(removeSpecificTime[0]) + (parseInt(removeDate[1]) * 24)) * 60);
							if (removeMin <= tempMin) {
								surrogateServer.members.forEach(u => {
									if (!u.user.bot) {
										if (remove[0] === u.user.id) {
											u.removeRole(role.id);
											bot.channels.get(modBotSpamID).send(`<@${u.user.id}> has been unmuted!`);
											logBotActions("AUTO UNMUTE", u.user.tag + " unmuted automatically");
											success = true;
										}
									}
								});
							}
							if (success) {
								let reinsert = "";
								for (let j = 0; j < testData.length; j++) {
									if (i === j || testData[j] === "\n") {
									} else if (j < testData.length - 1) {
										reinsert += testData[j];
									} else {
										reinsert += testData[j] + "\n";
									}
								}
								fs.writeFile("./database/mute.dat", reinsert, (err) => {
									if (err) throw err;
								});
							}
						}
					}
				});
			}
		});
		await Sleep(ms("1m"));
	}
}

const events = {
	MESSAGE_REACTION_ADD: 'messageReactionAdd', MESSAGE_REACTION_REMOVE: 'messageReactionRemove',
};

bot.on('raw', async event => {
	if (!events.hasOwnProperty(event.t)) return;
	const {d: data} = event;
	const user = bot.users.get(data.user_id);
	const channel = bot.channels.get(data.channel_id) || await user.createDM();
	if (channel.messages.has(data.message_id)) return;
	const message = await channel.fetchMessage(data.message_id);
	const emojiKey = (data.emoji.id) ? `${data.emoji.name}:${data.emoji.id}` : data.emoji.name;
	const reaction = message.reactions.get(emojiKey);
	bot.emit(events[event.t], reaction, user);
});

bot.on('messageReactionAdd', (reaction, user) => {
	const emoji = ["Battling", "RRC", "Pinball", "ClawGames", "Experiences", "GameConsoles", "Other"];
	const role = ["SumoBots", "RRC", "Pinball", "ClawGames", "Experiences", "GameConsoles", "Other"];
	if (user && !user.bot && reaction.message.channel.guild && reaction.message.content === "" && reaction.message.id === "745995420617932830") { //CHANGE AFTER GEN
		for (let o in emoji) {
			if (reaction.emoji.name === emoji[o]) {
				let i = reaction.message.guild.roles.find(e => e.name === role[o]);
				reaction.message.guild.member(user).addRole(i).catch(console.error);
				console.log("Given " + user.tag + " role of \"" + i.name + "\"");
				logReactActions(user, "Given role of \"" + i.name + "\"");
			}
		}
		console.log(`${reaction.message.author.tag}'s message "${reaction.message.content}" gained a reaction from ${user.tag}`);
		console.log(`${reaction.count} user(s) have given the same reaction to this message!`);
	}
});

bot.on('messageReactionRemove', (reaction, user) => {
	const emoji = ["Battling", "RRC", "Pinball", "ClawGames", "Experiences", "GameConsoles", "Other"];
	const role = ["SumoBots", "RRC", "Pinball", "ClawGames", "Experiences", "GameConsoles", "Other"];
	if (user && !user.bot && reaction.message.channel.guild && reaction.message.content === "" && reaction.message.id === "745995420617932830") { //CHANGE AFTER GEN
		for (let o in emoji) {
			if (reaction.emoji.name === emoji[o]) {
				let i = reaction.message.guild.roles.find(e => e.name === role[o]);
				reaction.message.guild.member(user).removeRole(i).catch(console.error);
				console.log("Taken " + user.tag + "'s' role of \"" + i.name + "\"");
				logReactActions(user, "Taken role of \"" + i.name + "\"");
			}
		}
		console.log(`${reaction.message.author.tag}'s message "${reaction.message.content}" lost a reaction from ${user.tag}`);
		console.log(`${reaction.count} user(s) have given the same reaction to this message!`);
	}
});

bot.once('ready', () => {
	announcement("SumoBots", "sumo", 15, "627919045420646401");
	announcement("RaceRealCars143", "race", 4, "589484542214012963");
	announcement("MarioKartLive", "mario", 4, "768112471860576297");
	// announcement("SumoBots", "sumo", 10, "707047722208854101"); //Testing
	// announcement("SumoBots", "sumo", 10, "700390885984043188"); //Broom Bot
	fs.exists("./database/mute.dat", (exists) => {
		if (!exists) {
			fs.open("./database/mute.dat", "w+", (err) => {
				if (err) throw err;
			});
		}
	});
	fs.exists("./database/connect.dat", (exists) => {
		if (!exists) {
			fs.open("./database/connect.dat", "w+", (err) => {
				if (err) throw err;
			});
		}
	});
	checkToUnmute();
	newDayCheck();
	bot.user.setActivity("Surrogate.tv", {type: "WATCHING", url: "https://www.surrogate.tv"});
	const date = getDateObject(0);
	let info = "We are up and running as " + bot.user.tag + " at " + date.timeStringAMPM + " EST\n";
	info += "=======================================================";
	console.info(info);
});

bot.on('message', message => {
	if (message.author.bot || message.author.id === "381655612335063040" || message.guild.id == null || !((message.guild.id === ("707047722208854098") || message.guild.id === ("664556796576268298") || message.guild.id === ("571388780058247179")))) {
		return;
	}
	
	let testServer = bot.guilds.get("707047722208854098");
	let broomBotServer = bot.guilds.get("664556796576268298");
	let surrogateServer = bot.guilds.get("571388780058247179");
	
	checkLevel(message);
	
	//Setup triggers for channels
	let triggerClawResponse = false;
	let triggerArcadeResponse = false;
	let triggerRaceResponse = false;
	let triggerSumoResponse = false;
	let triggerKartResponse = false;
	let triggerGeneralResponse = false;
	let triggerSneakResponse = false;
	let triggerPinballResponse = false;
	let triggerCommunityResponse = false;
	let maxCheck = Math.max(clawTrigger.length, arcadeTrigger.length, raceTrigger.length, sumoTrigger.length, kartTrigger.length, generalTrigger.length, sneakTrigger.length, pinballTrigger.length, communityTrigger.length);
	for (let i = 0; i < maxCheck; i++) {
		if (clawTrigger[i] != null && clawTrigger[i] === message.channel.id) {
			triggerClawResponse = true;
		}
		if (pinballTrigger[i] != null && pinballTrigger[i] === message.channel.id) {
			triggerPinballResponse = true;
		}
		if (arcadeTrigger[i] != null && arcadeTrigger[i] === message.channel.id) {
			triggerArcadeResponse = true;
		}
		if (raceTrigger[i] && raceTrigger[i] === message.channel.id) {
			triggerRaceResponse = true;
		}
		if (sumoTrigger[i] != null && sumoTrigger[i] === message.channel.id) {
			triggerSumoResponse = true;
		}
		if (kartTrigger[i] != null && kartTrigger[i] === message.channel.id) {
			triggerKartResponse = true;
		}
		if (generalTrigger[i] != null && generalTrigger[i] === message.channel.id) {
			triggerGeneralResponse = true;
		}
		if (sneakTrigger[i] != null && sneakTrigger[i] === message.channel.id) {
			triggerSneakResponse = true;
		}
		if (communityTrigger[i] != null && communityTrigger[i] === message.channel.id) {
			triggerCommunityResponse = true;
		}
	}
	
	if (message.member.user.tag === "Mordecai#3257" && message.content.includes("!test")) {
		//some test I want to do
		//707047722208854101
		
		let args = message.content.substring(1).split(' ');
		let cmd = args[0].toLowerCase();
		
		return;
	}
	
	if (message.member.user.tag === "Mordecai#3257" && message.content.includes("!gen")) {
		message.delete();
		
		const sumo = bot.emojis.get("744962246848807002").toString();
		const rrc = bot.emojis.get("744960028427157565").toString();
		const pin = bot.emojis.get("744965333151907970").toString();
		const claw = bot.emojis.get("744963655443021846").toString();
		const experience = bot.emojis.get("745993436620128326").toString();
		const consoles = bot.emojis.get("770308599045029889").toString();
		const other = bot.emojis.get("770308616800043048").toString();
		
		const embed = new Discord.RichEmbed()
			.setTitle("Notification Subsciption")
			.setColor(0x220e41)
			.setDescription("React on this post to receive a role which will enable you to receive notifications about a specific game!")
			.addField(sumo + " SumoBots " + sumo, "Get notified of any SumoBots news and when the game is about to go live.")
			.addField(rrc + " RaceRealCars " + rrc, "Get notified of any RRC news and when the game is about to go live.")
			.addField(pin + " Pinball Games " + pin, "Get notified of any Pinball news and when a game goes offline or online for maitenance. Recieve information about tournaments. ")
			.addField(claw + " Claw Games " + claw, "Get notified of any Claw Game news or related events.")
			.addField(experience + " Experiences " + experience, "Get notified of any special experiences happening.")
			.addField(consoles + " Game Consoles " + consoles, "Get notified of any Game Console news and when games are about to go live.")
			.addField(other + " Other " + other, "Get notified of anything of games and experiences in the Other category")
			.addField("All of these fields will also be notified of any behind the scenes related content through this way for a given game.", "⠀")
			.setFooter("To disable notification, un-react. If it appears that you haven't reacted, just react and un-react to disable them.");
		
		// bot.channels.get("593000239841935362").send({embed}).then(sentEmbed => {
		//     sentEmbed.react("744962246848807002")
		//         .then(() => sentEmbed.react("744960028427157565"))
		//         .then(() => sentEmbed.react("744965333151907970"))
		//         .then(() => sentEmbed.react("744963655443021846"))
		//         .then(() => sentEmbed.react("745993436620128326"));
		// });

        message.channel.fetchMessage("745995420617932830")
          .then(msg => {
            msg.edit(embed).then(sentEmbed => {
            	sentEmbed.react("770308599045029889")
            		.then(() => sentEmbed.react("770308616800043048"));
            });
          })
          .catch(console.error);
		
		logReactActions(message.member.user, "Edited embed");
		
		return;
	}
	
	//scraper for getting channel info
	if (message.member.user.tag === "Mordecai#3257" && message.content.startsWith("!scrape")) {
		console.log("ID: " + message.channel.id);
		console.log("Type: " + message.channel.type);
		console.log("Guild_ID: " + message.channel.guild_id);
		console.log("Position: " + message.channel.position);
		console.log("permissio_overwrites: " + message.channel.permission_overwrites);
		console.log("name: " + message.channel.name);
		console.log("topic: " + message.channel.topic);
		console.log("nsfw: " + message.channel.nsfw);
		console.log("last_message_id: " + message.channel.last_message_id);
		console.log("bitrate: " + message.channel.bitrate);
		console.log("user_limit: " + message.channel.user_limit);
		console.log("rate_limit_per_user: " + message.channel.rate_limit_per_user);
		console.log("recipients: " + message.channel.recipients);
		console.log("icon: " + message.channel.icon);
		console.log("owner_id: " + message.channel.owner_id);
		console.log("application_id: " + message.channel.application_id);
		console.log("parent_id: " + message.channel.parent_id);
		console.log("last_pin_timestamp: " + message.channel.last_pin_timestamp);
		console.log("=========================================");
		return;
	}
	
	//(12:34) command
	if ((message.member.roles.find(r => r.name.toLowerCase() === "mod squad") || message.member.roles.find(r => r.name.toLowerCase() === "surrogate team"))) {
		let detectColon = (message.content.includes(":"));
		let detectLeft = "";
		let detectRight = "";
		if (detectColon) {
			detectLeft = (message.content.substring((message.content.indexOf(":") - 3), (message.content.indexOf(":") - 2)));
			detectRight = (message.content.substring((message.content.indexOf(":") + 3), (message.content.indexOf(":") + 4)));
		}
		if (detectLeft === "(" && detectRight === ")") {
			let today = new Date();
			let day = today.getDate();
			let month = today.getMonth() + 1;
			let year = today.getFullYear();
			let hours = message.content.substring((message.content.indexOf(":") - 2), message.content.indexOf(":"));
			let minutes = message.content.substring(message.content.indexOf(":") + 1, message.content.indexOf(":") + 3);
			if (minutes > 59) {
				hours++;
			}
			if (hours > 23) {
				day++;
			}
			minutes %= 60;
			hours %= 24;
			if (!(isNaN(minutes) || isNaN(hours))) {
				if (hours < 10) {
					hours = "0" + hours;
				}
				if (minutes < 10) {
					minutes = "0" + minutes;
				}
				if (day < 10) {
					day = "0" + day;
				}
				if (month < 10) {
					month = "0" + month;
				}
				let sendOut = "*Beep boop*\nThe time is given in GMT+2 (Finland). See what time that is for you here:\nhttps://www.timeanddate.com/worldclock/fixedtime.html?iso=" + year + "" + month + "" + day + "T" + hours + "" + minutes + "&p1=101\n*Beep boop*";
				message.channel.send(sendOut);
				logBotActions(message, "Link");
			}
		}
	}
	if (message.content.substring(0, 1) === '!') {
		let args = message.content.substring(1).split(' ');
		let cmd = args[0].toLowerCase();
		// args=args.splice(1);
		switch (cmd) {
			// !ping
			case 'ping': {
				if (message.member.user.tag === "Mordecai#3257") {
					message.channel.send("Pong!");
				}
				break;
			}
			// !time
			case 'time': {
				const date = getDateObject(TIMEZONE_OFFSET_FINLAND);
				let sendOut = "It is currently **" + date.timeStringAMPM + " " + date.dateString_DMY_slash + "** in Finland (Where the games are located).";
				message.channel.send(sendOut);
				logBotActions(message, "!time");
				break;
			}
			// !roll xdy / !roll
			case 'roll': {
				if (args[1] != null && args[1].includes("d")) {
					let output = 0;
					if (isNaN(args[1].substring(0, args[1].indexOf("d"))) || isNaN(args[1].substring(args[1].indexOf("d") + 1)) || args[1].substring(0, args[1].indexOf("d")).toLowerCase().includes("e") || args[1].substring(args[1].indexOf("d") + 1).toLowerCase().includes("e") || args[1].substring(0, args[1].indexOf("d")) > 2000000000 || args[1].substring(args[1].indexOf("d") + 1) > 2000000000) {
						if (message.channel.id !== botSpamID) {
							message.delete();
							bot.channels.get(botSpamID).send("<@" + message.member.user.id + "> Please use this channel for bot commands!\n\tError: Invalid format");
						} else {
							bot.channels.get(botSpamID).send("\tError: Invalid format");
						}
						logBotActions(message, "!roll error");
					} else {
						for (let i = 0; i < args[1].substring(0, args[1].indexOf("d")); i++) {
							let roll = Math.floor(Math.random() * args[1].substring(args[1].indexOf("d") + 1)) + 1;
							output += roll;
							if (output > 2000000000) {
								if (message.channel.id !== botSpamID) {
									message.delete();
									bot.channels.get(botSpamID).send("<@" + message.member.user.id + "> Please use this channel for bot commands!\nThat was too many roles, try a smaller number!");
								} else {
									bot.channels.get(botSpamID).send("That was too many roles, try a smaller number!");
								}
								logBotActions(message, "!roll xdy error");
								return;
							}
						}
						if (message.channel.id !== botSpamID) {
							message.delete();
							bot.channels.get(botSpamID).send("<@" + message.member.user.id + "> Please use this channel for bot commands!\nRolling " + args[1] + ":\n\tTotal: " + output);
						} else {
							bot.channels.get(botSpamID).send("Rolling " + args[1] + ":\n\tTotal: " + output);
						}
						logBotActions(message, "!roll xdy");
					}
				} else if (args[1] != null) {
					if (message.channel.id !== botSpamID) {
						message.delete();
						bot.channels.get(botSpamID).send("<@" + message.member.user.id + "> Please use this channel for bot commands!\n\tError: Invalid format or too big of a number");
					} else {
						bot.channels.get(botSpamID).send("\tError: Invalid format or too big of a number");
					}
					logBotActions(message, "!roll error");
				} else {
					let roll = Math.floor(Math.random() * 20) + 1;
					if (message.channel.id !== botSpamID) {
						message.delete();
						bot.channels.get(botSpamID).send("<@" + message.member.user.id + "> Please use this channel for bot commands!\nRolling 1d20:\n\tTotal: " + roll);
					} else {
						bot.channels.get(botSpamID).send("Rolling 1d20:\n\tTotal: " + roll);
					}
					logBotActions(message, "!roll");
				}
				break;
			}
			// !getHelp
			case 'gethelp': {
				if ((message.member.roles.find(r => r.name.toLowerCase() === "mod squad") || message.member.roles.find(r => r.name.toLowerCase() === "surrogate team"))) {
					const embed = new Discord.RichEmbed()
						.setTitle("Hello, I am the NinjaHelp bot")
						.setColor(0x220e41)
						.setDescription("You have access to the following commands")
						.addField("`!time`", "Will tell the current time and day in Finland")
						.addField("`!roll` | `!roll xdy`", "Will roll a d20 on an unmodified command or will roll **x** number of **y** sided dice on a modified command")
						.addField("`!game`", "Will give the current channel category/topic's game link. If used outside of those channels, will give all current links to games")
						.addField("`!schedule` | `!schedule <GAME>`", "Will give the current channel category/topic's schedule if it exists. When used outside of those channels, the game needs to be specified")
						.addField("`!top` | `!top <GAME> ?month?`", "Will give the current channel category/topic's top players. If you want the current top players of the month, put month after the game name")
						.addField("`!mute <USER> <TIME>`", "If <USER> is muted, will unmute them and remove them from the database")
						.addField("`!unmute <USER>`", "If <USER> is muted, will unmute them and remove them from the database")
						.addField("`(ab:cd)`", "When you have a time formated as such, it will paste a Timezone conversion link to that time in Finland")
						.addField("`!name`", "Gives the SumoBots that have names other than their esports team")
						.addField("`!connect <USERNAME>`", "Connect your Discord account to your Surrogate.TV (STV) account. `<USERNAME>` should be your STV username. Should you change your STV username at any point, just type the command with the new username.")
						.addField("`!modupdate <DISCORD_USER_@> <USERNAME>`", "Force update `<DISCORD_USER_@>`'s connection to discord with STV account associated with `<USERNAME>`")
						.addField("`!modremove <DISCORD_USER_@>`", "Remove the connection associated with `<DISCORD_USER_@>`")
						.addField("`!search <USERNAME>`", "Get information on the STV account associated with `<USERNAME>.")
						.setFooter("These commands are for Mod Squad and Surrogate Team");
					bot.channels.get(modBotSpamID).send({embed});
				} else {
					const embed = new Discord.RichEmbed()
						.setTitle("Hello, I am the NinjaHelp bot")
						.setColor(0x220e41)
						.setDescription("You have access to the following commands")
						.addField("`!time`", "Will tell the current time and day in Finland")
						.addField("`!roll` | `!roll xdy`", "Will roll a d20 on an unmodified command or will roll **x** number of **y** sided dice on a modified command")
						.addField("`!game`", "Will give the current channel category/topic's game link. If used outside of those channels, will give all current links to games")
						.addField("`!schedule` | `!schedule <GAME>`", "Will give the current channel category/topic's schedule if it exists. When used outside of those channels, the game needs to be specified")
						.addField("`!top` | `!top <GAME> ?month?`", "Will give the current channel category/topic's top players. If you want the current top players of the month, put month after the game name")
						.addField("`!name`", "Gives the SumoBots that have names other than their esports team")
						.addField("`!connect <USERNAME>`", "Connect your Discord account to your Surrogate.TV (STV) account. `<USERNAME>` should be your STV username. Should you change your STV username at any point, just type the command with the new username.")
						.addField("`!search <USERNAME>`", "Get information on the STV account associated with `<USERNAME>`.")
						.setFooter("These commands are for everyone");
					bot.channels.get(botSpamID).send({embed});
				}
				message.delete();
				logBotActions(message, "!getHelp");
				break;
			}
			// !game <GAME>
			case 'game': {
				if (triggerSumoResponse) {
					message.reply("Here you go!\nhttps://surrogate.tv/game/sumobots");
					message.delete();
				} else if (triggerKartResponse) {
					message.reply("Here you go!\nhttps://surrogate.tv/game/mariokartlive");
					message.delete();
				}else if (triggerRaceResponse) {
					message.reply("Here you go!\nhttps://surrogate.tv/game/racerealcars143");
					message.delete();
				} else if (triggerPinballResponse) {
					let out = "There are multiple games here. Here are the links!\n";
					out += "https://surrogate.tv/game/batman66\n";
					out += "https://surrogate.tv/game/oktoberfest\n";
					message.reply(out);
					message.delete();
				} else if (triggerClawResponse) {
					let out = "There are multiple games here. Here are the links!\n";
					out += "https://surrogate.tv/game/forceclaw\n";
					message.reply(out);
					message.delete();
				} else if (triggerGeneralResponse) {
					let out = "Here are all the links to the current games:\n";
					out += "https://surrogate.tv/game/sumobots\n";
					out += "https://surrogate.tv/game/mariokartlive\n"
					out += "https://surrogate.tv/game/racerealcars143\n";
					out += "https://surrogate.tv/game/batman66\n";
					out += "https://surrogate.tv/game/oktoberfest\n";
					out += "https://surrogate.tv/game/forceclaw\n";
					message.reply(out);
					message.delete();
				} else {
					return;
				}
				logBotActions(message, "!game");
				break;
			}
			// !schedule
			case 'schedule': {
				let url = "https://g9b1fyald3.execute-api.eu-west-1.amazonaws.com/master/games/?shortId=";
				let command = "";
				let image = "";
				if (triggerSumoResponse || message.content.toLowerCase().includes("sumobots")) {
					url += "sumobots";
					command = "SumoBots";
					image = "https://www.surrogate.tv/img/sumo/logo_sumo.png";
				} else if (triggerKartResponse || message.content.toLowerCase().includes("mariokartlive")) {
					url += "mariokartlive";
					command = "MarioKartLive";
					image = "https://assets.surrogate.tv/game/7488f823-4fb2-468f-9100-a092a46d4de4/0849495794-Asset22x.png";
				} else if (triggerRaceResponse || message.content.toLowerCase().includes("racerealcars143")) {
					url += "racerealcars143";
					command = "RaceRealCars143";
					image = "https://i.imgur.com/XETrUAa.png";
				} else if ((triggerClawResponse && message.channel.id === "706819836071903275") || message.content.toLowerCase().includes("forceclaw")) {
					url += "forceclaw";
					command = "ForceClaw";
					image = "https://assets.surrogate.tv/game/ca0b4cc3-d25d-463e-b3f6-ecf96427ffe0/3458917638-48hreventforceclaw-01.png";
				} else if ((triggerPinballResponse && message.channel.id === "613630308931207198") || message.content.toLowerCase().includes("batman66")) {
					url += "batman66";
					command = "Batman66 Pinball";
					image = "https://www.surrogate.tv/img/pinball/pinball_logo.png";
				} else if ((triggerPinballResponse && message.channel.id === "702578486199713872") || message.content.toLowerCase().includes("oktoberfest")) {
					url += "oktoberfest";
					command = "Oktoberfest Pinball";
					image = "https://www.american-pinball.com/s/i/h/pinslide/oktoberfest/oktoberfest-logo-tap_shadow.png";
				} else {
					if (message.channel.id !== botSpamID) {
						if ((message.member.roles.find(r => r.name.toLowerCase() === "mod squad") || message.member.roles.find(r => r.name.toLowerCase() === "surrogate team"))) {
							bot.channels.get(modBotSpamID).send("<@" + message.member.user.id + "> Can't find that game");
							message.delete();
						} else {
							bot.channels.get(botSpamID).send("<@" + message.member.user.id + "> Please use this channel for bot commands!\nCan't find that game. Try a different one.");
							message.delete();
						}
					} else {
						bot.channels.get(botSpamID).send("<@" + message.member.user.id + "> Can't find that game. Try a different one.");
					}
					return;
				}
				const minDay = 1440;
				let {list} = fetch(url, {
					method: 'GET', headers: {
						'Content-Type': 'application/json',
					},
				}).then(response => response.json())
					.then((x) => {
						if (x.result.schedule == null) {
							message.channel.send("There is no schedule for " + command + ".");
						} else {
							let output = "";
							x.result.schedule.sort((a, b) => a.startTime - b.startTime)
							for (let i = 0; i < x.result.schedule.length; i++) {
								let startTime = x.result.schedule[i].startTime + (2 * 60);
								let duration = x.result.schedule[i].duration;
								let endTime = startTime + duration;
								let day = Math.floor(startTime / minDay);
								let startHour = Math.floor((startTime - (day * minDay)) / 60);
								let startMinute = startTime - (startHour * 60) - (day * minDay);
								if (startMinute <= 0) {
									startMinute = "0" + startMinute;
								}
								if (startHour > 23) {
									let addToDay = Math.floor(startHour / 24);
									startHour %= 24;
									day += addToDay;
								}
								let endHour = Math.floor((endTime - day * minDay) / 60);
								let endMinute = (startTime + duration) % 60;
								let endDay = day;
								if (endMinute <= 0) {
									endMinute = "0" + endMinute;
								}
								if (endHour > 23 || endHour <= 0) {
									let addToDay = Math.floor(endHour / 24);
									if (endHour < 0) {
										endHour = 0;
										addToDay = 3;//Don't talk about it
									}
									endHour %= 24;
									endDay += addToDay;
								}
								switch (day) {
									case 0:
										output += "Monday:         ";
										break;
									case 1:
										output += "Tuesday:         ";
										break;
									case 2:
										output += "Wednesday:  ";
										break;
									case 3:
										output += "Thursday:       ";
										break;
									case 4:
										output += "Friday:             ";
										break;
									case 5:
										output += "Saturday:        ";
										break;
									case 6:
										output += "Sunday:           ";
										break;
									default:
										break;
								}
								if (startHour >= 12) {
									if (startHour % 12 < 10 && startHour !== 12) {
										output += "0" + (startHour % 12) + ":" + startMinute + " PM - ";
									} else if (startHour === 12) {
										output += (startHour) + ":" + startMinute + " PM - ";
									} else {
										output += (startHour % 12) + ":" + startMinute + " PM - ";
									}
								} else if (startHour === 0) {
									output += "12:" + startMinute + " AM - ";
								} else {
									if (startHour < 10) {
										output += "0" + startHour + ":" + startMinute + " AM - ";
									} else {
										output += startHour + ":" + startMinute + " AM - ";
									}
								}
								switch (endDay) {
									case 0:
										output += "Monday:         ";
										break;
									case 1:
										output += "Tuesday:         ";
										break;
									case 2:
										output += "Wednesday:  ";
										break;
									case 3:
										output += "Thursday:       ";
										break;
									case 4:
										output += "Friday:             ";
										break;
									case 5:
										output += "Saturday:        ";
										break;
									case 6:
										output += "Sunday:           ";
										break;
									default:
										output += "Monday:         ";
										break;
								}
								if (endHour >= 12) {
									if (endHour % 12 < 10 && endHour !== 12) {
										output += "0" + (endHour % 12) + ":" + endMinute + " PM\n";
									} else if (endHour === 12) {
										output += (endHour) + ":" + endMinute + " PM\n";
									} else {
										output += (endHour % 12) + ":" + endMinute + " PM\n";
									}
								} else if (endHour === 0) {
									output += "12:" + endMinute + " AM\n";
								} else {
									if (endHour < 10) {
										output += "0" + endHour + ":" + endMinute + " AM\n";
									} else {
										output += endHour + ":" + endMinute + " AM\n";
									}
								}
							}
							let title = "Schedule for **" + command + "**";
							command = command.split(' ');
							command = command.splice(0);
							if ((message.member.roles.find(r => r.name.toLowerCase() === "mod squad") || message.member.roles.find(r => r.name.toLowerCase() === "surrogate team"))) {
								message.delete();
								const embed = new Discord.RichEmbed()
									.setTitle("__" + title + "__")
									.setColor(0x220e41)
									.setURL("https://surrogate.tv/game/" + command)
									.setDescription(output)
									.setThumbnail(image)
									.setFooter("The Office and most of the games are located in Finland so times are in GMT+2 timezone.");
								message.channel.send({embed});
							} else {
								if (message.channel.id !== botSpamID) {
									message.delete();
									
									const embed = new Discord.RichEmbed()
										.setTitle("__" + title + "__")
										.setColor(0x220e41)
										.setURL("https://surrogate.tv/game/" + command)
										.setDescription(output)
										.setThumbnail(image)
										.setFooter("The Office and most of the games are located in Finland so times are in GMT+2 timezone.");
									bot.channels.get(botSpamID).send({embed});
									
								} else {
									const embed = new Discord.RichEmbed()
										.setTitle("__" + title + "__")
										.setColor(0x220e41)
										.setURL("https://surrogate.tv/game/" + command)
										.setDescription(output)
										.setThumbnail(image)
										.setFooter("The Office and most of the games are located in Finland so times are in GMT+2 timezone.");
									bot.channels.get(botSpamID).send({embed});
								}
							}
						}
					});
				logBotActions(message, "!schedule");
				break;
			}
			// !mute <USER> <TIME>
			case 'mute': {
				if ((message.member.roles.find(r => r.name.toLowerCase() === "mod squad") || message.member.roles.find(r => r.name.toLowerCase() === "surrogate team") && args[1] != null && args[2] != null)) {
					let toMute = message.guild.member(message.mentions.users.first());
					let role = message.guild.roles.find(r => r.name === "muted");
					if (!toMute) {
						bot.channels.get(modBotSpamID).send(`Couldn't find user.`);
						return;
					}
					if (toMute.hasPermission("MANAGE_MESSAGES")) {
						bot.channels.get(modBotSpamID).send(`Can't mute that user`);
						return;
					}
					let mutetime = args[2];
					if (!mutetime) {
						bot.channels.get(modBotSpamID).send(`You need to specify a time (3s/3d/3h/3y)`);
						return;
					}
					toMute.addRole(role.id);
					bot.channels.get(modBotSpamID).send(`<@${toMute.id}> has been muted for ${ms(ms(mutetime))} by <@${message.member.user.id}>`);
					let date = getDateObject();
					let day = date.day;
					let month = date.month;
					let year = date.year;
					let minute = date.minute;
					let hour = date.hour;
					let startMute = month + "/" + day + "/" + year + "~" + hour + ":" + minute;
					minute += (ms(mutetime) / 60000);
					hour += Math.floor(minute / 60);
					minute %= 60;
					day += Math.floor(hour / 24);
					hour %= 24;
					let endMute = month + "/" + day + "/" + year + "~" + hour + ":" + minute + "\n";
					let updated = false;
					fs.readFile("./database/mute.dat", 'ascii', function (err, file) {
						if (err) throw err;
						let testData = file.toString().split("\n");
						let toRemove = -1;
						for (let i = 0; i < testData.length; i++) {
							if (testData[i].includes(toMute.id)) {
								toRemove = i;
								updated = true;
								break;
							}
						}
						if (toRemove !== -1) {
							let removeUserData = testData[toRemove];
							let reinsert = "";
							for (let j = 0; j < testData.length; j++) {
								if (toRemove === j || testData[j] === "\n") {
								} else if (j === testData.length - 1) {
									reinsert += testData[j];
								} else {
									reinsert += testData[j] + "\n";
								}
							}
							fs.writeFile("./database/mute.dat", reinsert, (err) => {
								if (err) throw err;
							});
							fs.appendFile("./database/mute.dat", endMute, (err) => {
								if (err) throw err;
							});
						}
					});
					if (!updated) {
						endMute = toMute.id + "|" + endMute;
						fs.appendFile("./database/mute.dat", endMute, (err) => {
							if (err) throw err;
						});
					}
					logBotActions(message, "!mute " + toMute.user.tag + " " + ms(ms(mutetime)));
				}
				break;
			}
			// !unmute <USER>
			case "unmute": {
				if ((message.member.roles.find(r => r.name.toLowerCase() === "mod squad") || message.member.roles.find(r => r.name.toLowerCase() === "surrogate team") && args[1] != null)) {
					let toUnmute = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]));
					let role = message.guild.roles.find(r => r.name === "muted");
					if (!toUnmute) {
						bot.channels.get(modBotSpamID).send("Couldn't find user.");
						return;
					} else if (!toUnmute.roles.find(r => r.name.toLowerCase() === "muted")) {
						bot.channels.get(modBotSpamID).send(`<@${toUnmute} is not muted.`);
						return;
					}
					await(toUnmute.addRole(role.id));
					toUnmute.removeRole(role.id);
					bot.channels.get(modBotSpamID).send(`<@${toUnmute.id}> has been unmuted by <@${message.member.user.id}>`);
					logBotActions(message, "!unmute " + toUnmute.user.tag);
					
					fs.readFile("./database/mute.dat", 'ascii', function (err, file) {
						if (err) throw err;
						
						let testData = file.toString().split("\n");
						let toRemove = -1;
						for (let i = 0; i < testData.length; i++) {
							if (testData[i].includes(toUnmute.id)) {
								toRemove = i;
								break;
							}
						}
						let removeUserData = testData[i];
						let reinsert = "";
						for (let i = 0; i < testData.length; i++) {
							if (toRemove === i || testData[i] === "\n") {
							
							} else {
								reinsert += testData[i] + "\n";
							}
						}
						fs.writeFile("./database/mute.dat", reinsert, (err) => {
							if (err) throw err;
						});
					});
				}
				break;
			}
			// !top <GAME> m(?)
			case "top": {
				let url = "https://g9b1fyald3.execute-api.eu-west-1.amazonaws.com/master/scores?gameId=";
				let scoreType = "All Time";
				let title = " Current Scores";
				let command = "";
				let image = "";
				if (triggerSumoResponse || message.content.toLowerCase().includes("sumobots")) {
					url += "99ca6347-0e10-4465-8fe1-9fee8bc5fb35&order=";
					command = "SumoBots";
					if (args[2] != null && args[2] === "month") {
						if (message.channel.id !== botSpamID) {
							if ((message.member.roles.find(r => r.name.toLowerCase() === "mod squad") || message.member.roles.find(r => r.name.toLowerCase() === "surrogate team"))) {
								bot.channels.get(modBotSpamID).send("<@" + message.member.user.id + "> There are no monthly scores for " + command);
								message.delete();
							} else {
								bot.channels.get(botSpamID).send("<@" + message.member.user.id + "> Please use this channel for bot commands!\nThere are no monthly scores for " + command);
								message.delete();
							}
						} else {
							message.channel.send("<@" + message.member.user.id + "> There are no monthly scores for " + command);
						}
						return;
					}
					image = "https://www.surrogate.tv/img/sumo/logo_sumo.png";
				} else if (triggerKartResponse || message.content.toLowerCase().includes("mariokartlive")) {
					url += "7488f823-4fb2-468f-9100-a092a46d4de4&order=";
					command = "MarioKartLive";
					if (args[2] != null && args[2] === "month") {
						url += "month";
						scoreType = "Monthly";
						title = " Current Scores of the Month";
					}
					image = "https://assets.surrogate.tv/game/7488f823-4fb2-468f-9100-a092a46d4de4/0849495794-Asset22x.png";
				} else if (triggerRaceResponse || message.content.toLowerCase().includes("racerealcars143")) {
					url += "953f2154-9a6e-4602-99c6-265408da6310&order=";
					command = "RaceRealCars143";
					if (args[2] != null && args[2] === "month") {
						url += "month";
						scoreType = "Monthly";
						title = " Current Scores of the Month";
					}
					image = "https://i.imgur.com/XETrUAa.png";
				} else if ((triggerClawResponse && message.channel.id === "706819836071903275") || message.content.toLowerCase().includes("forceclaw")) {
					url += "ca0b4cc3-d25d-463e-b3f6-ecf96427ffe0&order=";
					command = "ForceClaw";
					if (args[2] != null && args[2] === "month") {
						if (message.channel.id !== botSpamID) {
							if ((message.member.roles.find(r => r.name.toLowerCase() === "mod squad") || message.member.roles.find(r => r.name.toLowerCase() === "surrogate team"))) {
								bot.channels.get(modBotSpamID).send("<@" + message.member.user.id + "> There are no monthly scores for " + command);
								message.delete();
							} else {
								bot.channels.get(botSpamID).send("<@" + message.member.user.id + "> Please use this channel for bot commands!\nThere are no monthly scores for " + command);
								message.delete();
							}
						} else {
							message.channel.send("<@" + message.member.user.id + "> There are no monthly scores for " + command);
						}
						return;
					}
					image = "https://assets.surrogate.tv/game/ca0b4cc3-d25d-463e-b3f6-ecf96427ffe0/3458917638-48hreventforceclaw-01.png";
				} else if ((triggerPinballResponse && message.channel.id === "702578486199713872") || message.content.toLowerCase().includes("oktoberfest")) {
					//IMPLEMENT TAKING FROM GOOGLE FORM
					message.delete();
					let today = getDateObject(0);
					if (today.month === 7 || today.month === 8 || (today.month === 9 && today.day <= 7)) {
						fetch("https://docs.google.com/spreadsheets/d/e/2PACX-1vRe979Ap0TpmdEDtPhZ7nwT9bkelIKUzFHf9ed6HiPBf5ZM09nNOAIjxAK1rztDqBffR8Gc6FTecoaA/pub?gid=1385749731&single=true&output=csv", {
							method: 'GET',
						}).then(x => x.text())
							.then(x => {
								// console.log(x);
								let v = x.split(/\n/).map(a => a.split(","));
								while (v.length > 10) {
									v.pop();
								}
								let sym = ["1) ", "2) ", "3) ", "4) ", "5) ", "6) ", "7) ", "8) ", "9) ", "10) "];
								let scores = "";
								v.forEach((a, i) => {scores += "" + sym[i] + " **__" + a[0] + "__**\t" + a[1] + "\n"});
								let title = "__**Oktoberfest** Current Scores__";
								let description = "Here are the Top 10 **Oktoberfest Launch Tournament** players as of " + getDateObject(TIMEZONE_OFFSET_FINLAND).dateString_MD_slash;
								let footer = "Note: Some new top 10 scores may not be verified yet and will not appear here.";
								let image = "https://www.american-pinball.com/s/i/h/pinslide/oktoberfest/oktoberfest-logo-tap_shadow.png";
								const embed = new Discord.RichEmbed()
									.setTitle("__" + title + "__")
									.setColor(0x220e41)
									.setURL("http://proco.me/oktoberfest/")
									.addField(description, scores)
									.setThumbnail(image)
									.setFooter(footer);
								bot.channels.get("702578486199713872").send({embed});
							});
					} else {
						message.channel.send("The **Oktoberfest Launch Tournament** has ended.");
					}
					logBotActions(message, "!top oktoberfest");
					return;
				} else if ((triggerPinballResponse && message.channel.id === "613630308931207198") || message.content.toLowerCase().includes("batman66")) {
					url += "592ac917-14d2-481a-9d37-3b840ad46b19&order=";
					command = "Batman66 Pinball";
					if (args[2] != null && args[2] === "month") {
						url += "month";
						scoreType = "Monthly";
						title = " Current Scores of the Month";
					}
					image = "https://www.surrogate.tv/img/pinball/pinball_logo.png";
				} else {
					if (message.channel.id !== botSpamID) {
						if ((message.member.roles.find(r => r.name.toLowerCase() === "mod squad") || message.member.roles.find(r => r.name.toLowerCase() === "surrogate team"))) {
							bot.channels.get(modBotSpamID).send("<@" + message.member.user.id + "> Can't find that game.");
							message.delete();
						} else {
							bot.channels.get(botSpamID).send("<@" + message.member.user.id + "> Please use this channel for bot commands!\nCan't find that game.");
							message.delete();
						}
					} else {
						message.channel.send("<@" + message.member.user.id + "> Can't find that game.");
					}
					return;
				}
				title = "**" + command + "**" + title;
				const minDay = 1440;
				let {list} = fetch(url, {
					method: 'GET', headers: {
						'Content-Type': 'application/json',
					},
				}).then(response => response.json())
					.then((x) => {
						if (x == null || x.result == null || x.result.Items == null) {
							message.channel.send("There were no scores for " + command + ".");
						} else {
							let description = "";
							if (x.result.Items.length > 10) {
								description = "These are the Top 10 scores for **" + command + "**";
							} else {
								description = "These are the Top " + x.result.Items.length + " scores for **" + command + "**";
							}
							let scores = "";
							for (let i = 0; i < x.result.Items.length && i < 10; i++) {
								if (x.result.Items[i].userObject.userIcon != null) {
									let icon = x.result.Items[i].userObject.userIcon.toLowerCase();
									switch (icon) {
										case "broomsquad": {
											icon = bot.emojis.get("700736528803954769").toString();
											break;
										}
										case "moderator": {
											icon = bot.emojis.get("700736529043161139").toString();
											break;
										}
										case "patreonsupporter": {
											icon = bot.emojis.get("700736949631188993").toString();
											break;
										}
										case "surrogateteam": {
											icon = bot.emojis.get("700737595734491237").toString();
											break;
										}
										case "alphatester": {
											icon = bot.emojis.get("700736528967532564").toString();
											break;
										}
										default: {
											break;
										}
									}
									scores += (i + 1) + ") " + icon + " **__" + x.result.Items[i].userObject.username + "__**:    " + x.result.Items[i].points;
								} else {
									scores += (i + 1) + ") **__" + x.result.Items[i].userObject.username + "__**:    " + x.result.Items[i].points;
								}
								if (i + 1 !== x.result.Items.length && i + 1 !== 10) {
									scores += "\n";
								}
							}
							if ((message.member.roles.find(r => r.name.toLowerCase() === "mod squad") || message.member.roles.find(r => r.name.toLowerCase() === "surrogate team"))) {
								message.delete();
								
								const embed = new Discord.RichEmbed()
									.setTitle("__" + title + "__")
									.setColor(0x220e41)
									.setThumbnail(image)
									.addField(description, scores);
								
								message.channel.send({embed});
							} else {
								if (message.channel.id !== botSpamID) {
									message.delete();
									const embed = new Discord.RichEmbed()
										.setTitle("__" + title + "__")
										.setColor(0x220e41)
										.setThumbnail(image)
										.addField(description, scores)
										.setFooter("Please use this channel for bot commands!");
									bot.channels.get(botSpamID).send({embed})
										.then(bot.channels.get(botSpamID).send("<@" + message.author.id + ">"));
								} else {
									const embed = new Discord.RichEmbed()
										.setTitle("__" + title + "__")
										.setColor(0x220e41)
										.setThumbnail(image)
										.addField(description, scores);
									message.channel.send({embed});
								}
							}
						}
					});
				logBotActions(message, "!top " + command);
				break;
			}
			// !meme
			case "meme": {
				let out = "If you want there to be a `!meme` command, here is what you need to do.\n\t";
				out += "1) Find a safe for work meme API.\n\t";
				out += "2) Make sure it has a random reature or a way to get a random meme.\n\t";
				out += "3) Make sure it gives usable data and has documentation on how that data is formatted (if it doesn't exist, make it yourself)\n\t";
				out += "4) Ping me with the API and how the data is formatted.\n\t";
				out += "5) I will then check to validate the API and data format and if it works, I will implement it. If it doesn't, I will say so.\n";
				out += "Until someone does these steps, I will not go about implementing a `!meme` command.";
				if (message.channel.id !== botSpamID) {
					message.delete();
					bot.channels.get(botSpamID).send("<@" + message.member.user.id + "> Please use this channel for bot commands!\n" + out);
				} else {
					bot.channels.get(botSpamID).send(out);
				}
				logBotActions(message, "!meme info");
				break;
			}
			// !name
			case "name": {
				const alliance = bot.emojis.get("713862601687433236").toString(); //Chad
				const heretics = bot.emojis.get("713862601846554795").toString(); //Hercules
				const mouse = bot.emojis.get("713862041064177735").toString();    //Jerry
				const excel = bot.emojis.get("713862601175728218").toString();    //Kyle
				const ence = bot.emojis.get("713862224271114361").toString();     //Dug
				const empire = bot.emojis.get("713862601779707924").toString();   //Mike
				let title = "__The names of the bots given by the Broom Gods__";
				let description = alliance + "\tChad\n" + empire + "\tMike\n" + mouse + "\tJerry\n" + ence + "\tDug\n" + heretics + "\tHercules\n" + excel + "\tKyle";
				if (triggerSumoResponse) {
					message.delete();
					const embed = new Discord.RichEmbed()
						.setTitle("__" + title + "__")
						.setColor(0x220e41)
						.setDescription(description);
					
					message.channel.send({embed});
				} else if (message.channel.id !== botSpamID) {
					const embed = new Discord.RichEmbed()
						.setTitle("__" + title + "__")
						.setColor(0x220e41)
						.setDescription(description)
						.setFooter("Please use this channel for that command!");
					
					bot.channels.get(botSpamID).send({embed})
						.then(bot.channels.get(botSpamID).send("<@" + message.author.id + ">"));
				} else {
					const embed = new Discord.RichEmbed()
						.setTitle("__" + title + "__")
						.setColor(0x220e41)
						.setDescription(description);
					
					message.channel.send({embed});
				}
				logBotActions(message, "!name");
				break;
			}
			//!connect <USERNAME>
			case "connect": {
				if (args[1] == null) {
					bot.channels.get(botSpamID).send("<@" + message.author.id + ">, You need to supply your Surrogate.TV Username which can be found on your user profile at https://surrogate.tv/user");
				} else {
					args[1]=encodeURI(args[1]);
					const {list} = fetch("https://g9b1fyald3.execute-api.eu-west-1.amazonaws.com/master/users?search=" + args[1], {
						method: 'GET', headers: {
							'Content-Type': 'application/json',
						},
					}).then(response => response.json())
						.then((x) => {
							if (x.status === "failure" || x.result[0] == null) {
								bot.channels.get(botSpamID).send("<@" + message.author.id + ">, I cannot find a user by that name. Names are case sensitive so make sure it is correct.");
							} else {
								let uid = x.result[0].userId;
								fs.exists("./database/connect.dat", (exists) => {
									if (exists) {
										fs.readFile("./database/connect.dat", 'ascii', function (err, file) {
											if (err) throw err;
											let testData = file.toString().split("\n");
											let i;
											let holdD = -1;
											let hold = -2;
											let dIDFound = false;
											let uIDFound = false;
											let userFound = false;
											for (i = 0; i < testData.length; i++) {
												if (!(testData[i] === "\n")) {
													let inHere = testData[i].split("|");
													if (inHere[0] === message.author.id) {
														dIDFound = true;
														holdD = i;
													}
													if (inHere[1] === uid) {
														uIDFound = true;
														hold = i;
													}
													if (inHere[2] === args[1]) {
														userFound = true;
														hold = i;
													}
												}
											}
											if (dIDFound && userFound && (hold === holdD)) {
												bot.channels.get(botSpamID).send("<@" + message.author.id + ">, You have already connected that Surrogate profile with your discord account.");
											} else if ((userFound || uIDFound)) {
												let inHere = testData[hold].split("|");
												bot.channels.get(botSpamID).send("<@" + message.author.id + ">, The Surrogate profile " + args[1] + " has already been connected to discord user <@" + inHere[0] + ">. Please DM Mordecai if you feel this is a mistake");
											} else if (dIDFound) {
												let id = message.author.id;
												fs.exists("./database/connect.dat", (exists) => {
													if (exists) {
														fs.readFile("./database/connect.dat", 'ascii', function (err, file) {
															if (err) throw err;
															let testData = file.toString().split("\n");
															let dIDFound = false;
															let uid = false;
															let userFound = false;
															for (let i = 0; i < testData.length; i++) {
																if (!(testData[i] === "\n")) {
																	var inHere = testData[i].split("|");
																	if (inHere[0] === id) {
																		dIDFound = true;
																		uid = inHere[1];
																		break;
																	}
																}
															}
															const {list} = fetch("https://g9b1fyald3.execute-api.eu-west-1.amazonaws.com/master/users?search=" + args[1], {
																method: 'GET', headers: {
																	'Content-Type': 'application/json',
																},
															}).then(response => response.json())
																.then((x) => {
																	if (x.result[0] == null) {
																		bot.channels.get(botSpamID).send("<@" + message.author.id + ">, I cannot find a user by that name. Names are case sensitive so make sure it is correct.");
																	} else {
																		if (!dIDFound) {
																			bot.channels.get(botSpamID).send("<@" + message.author.id + ">, There is no Surrogate profile associated with you rdiscord account, please DM Mordecai if you feel this is a mistake.");
																		} else if (x.result[0].userId !== uid) {
																			bot.channels.get(botSpamID).send("<@" + message.author.id + ">, That Surrogate profile is not the same one you previously connected with the username of " + inHere[2] + ". Please DM Mordecai if you feel this is a mistake.");
																		} else {
																			testData[i] = id + "|" + uid + "|" + args[1];
																			let insert = "";
																			for (let z = 0; z < testData.length; z++) {
																				if (z + 1 === testData.length) {
																					insert += testData[z];
																					break;
																				}
																				insert += testData[z] + "\n";
																			}
																			fs.writeFile("./database/connect.dat", insert, (err) => {
																				if (err) throw err;
																			});
																			bot.channels.get(botSpamID).send("<@" + message.author.id + ">, Your Surrogate profile has been successfully updated!");
																		}
																	}
																});
														});
													}
												});
											} else {
												fs.appendFile("./database/connect.dat", message.author.id + "|" + uid + "|" + args[1] + "\n", (err) => {
													if (err) throw err;
												});
												bot.channels.get(botSpamID).send("<@" + message.author.id + ">, Your Surrogate profile has been successfully connected to your discord account!");
											}
											
										});
									}
								});
							}
						});
				}
				logBotActions(message, message.content);
				checkLevel(message);
				break;
			}
			//!modupdate <USER> <USERNAME>
			case "modupdate": {
				if ((message.member.roles.find(r => r.name.toLowerCase() === "mod squad") || message.member.roles.find(r => r.name.toLowerCase() === "surrogate team") && args[1] != null) && args[2] != null) {
					let infoID = args[1].substring(3, args[1].length - 1);
					args[1]=encodeURI(args[1]);
					fs.exists("./database/connect.dat", (exists) => {
						if (exists) {
							fs.readFile("./database/connect.dat", 'ascii', function (err, file) {
								if (err) throw err;
								let testData = file.toString().split("\n");
								let dIDFound = false;
								for (var i = 0; i < testData.length; i++) {
									if (!(testData[i] === "\n")) {
										let inHere = testData[i].split("|");
										if (inHere[0] === infoID) {
											dIDFound = true;
											console.log(testData[i]);
											break;
										}
									}
								}
								if (dIDFound) {
									const {list} = fetch("https://g9b1fyald3.execute-api.eu-west-1.amazonaws.com/master/users?search=" + args[2], {
										method: 'GET', headers: {
											'Content-Type': 'application/json',
										},
									}).then(response => response.json())
										.then((x) => {
											if (x.result[0] == null) {
												bot.channels.get(modBotSpamID).send("Unable to find the username " + args[2] + ". The names are case sensitive.");
											} else {
												let uID = false;
												let user = false;
												for (let k = 0; k < testData.length; k++) {
													if (!(testData[k] === "\n")) {
														let inHere = testData[k].split("|");
														if (inHere[1] === x.result[0].userId) {
															uID = true;
														}
														if (inHere[2] === x.result[0].username) {
															user = true;
														}
													}
												}
												if (uID || user) {
													bot.channels.get(modBotSpamID).send("That username is already claimed by another user. Cannot overwrite.");
												} else {
													let insert = "";
													for (let z = 0; z < testData.length; z++) {
														if (z === i) {
															insert += infoID + "|" + x.result[0].userId + "|" + x.result[0].username;
														} else {
															insert += testData[z];
														}
														if (z + 1 !== testData.length) {
															insert += "\n";
														}
													}
													fs.writeFile("./database/connect.dat", insert, (err) => {
														if (err) throw err;
													});
													bot.channels.get(modBotSpamID).send("Successfully updated " + args[1] + "'s connection. ");
												}
											}
										});
								} else {
									bot.channels.get(modBotSpamID).send("Cannot find that user's information in my database. They can connect themselves.");
								}
							});
						}
					});
				}
				logBotActions(message, message.content);
				checkLevel(message);
				break;
			}
			//!modremove <USER>
			case "modremove": {
				if ((message.member.roles.find(r => r.name.toLowerCase() === "mod squad") || message.member.roles.find(r => r.name.toLowerCase() === "surrogate team") && args[1] != null)) {
					let infoID = args[1].substring(3, args[1].length - 1);
					args[1]=encodeURI(args[1]);
					fs.exists("./database/connect.dat", (exists) => {
						if (exists) {
							fs.readFile("./database/connect.dat", 'ascii', function (err, file) {
								if (err) throw err;
								let testData = file.toString().split("\n");
								let dIDFound = false;
								let i = 0;
								for (i = 0; i < testData.length; i++) {
									if (!(testData[i] === "\n")) {
										let inHere = testData[i].split("|");
										if (inHere[0] === infoID) {
											dIDFound = true;
											break;
										}
									}
								}
								if (dIDFound) {
									let insert = "";
									for (let z = 0; z < testData.length; z++) {
										if (z === i) {
											continue;
										} else {
											insert += testData[z];
										}
										if (z + 1 !== testData.length) {
											insert += "\n";
										}
									}
									fs.writeFile("./database/connect.dat", insert, (err) => {
										if (err) throw err;
									});
									bot.channels.get(modBotSpamID).send("Successfully removed " + args[1] + "'s connection. ");
								} else {
									bot.channels.get(modBotSpamID).send("Cannot find that user's information in my database. They don't need to be removed.");
								}
							});
						}
					});
				}
				logBotActions(message, message.content);
				break;
			}
			//!search <USERNAME>
			case "search": {
				fs.exists("./database/connect.dat", (exists) => {
					if (exists && args[1] != null) {
						args[1]=encodeURI(args[1]);
						fs.readFile("./database/connect.dat", 'ascii', function (err, file) {
							if (err) throw err;
							let testData = file.toString().split("\n");
							let user = false;
							let inHere = [];
							for (let i = 0; i < testData.length; i++) {
								if (!(testData[i] === "\n")) {
									inHere = testData[i].split("|");
									if (inHere[2] === args[1]) {
										user = true;
										break;
									}
								}
							}
							const {list} = fetch("https://g9b1fyald3.execute-api.eu-west-1.amazonaws.com/master/users?search=" + args[1], {
								method: 'GET', headers: {
									'Content-Type': 'application/json',
								}, 
							}).then(response => response.json())
								.then((x) => {
									if (x.result[0] == null) {
										bot.channels.get(botSpamID).send("I cannot find that username on the website. ");
									} else {
										let embed = new Discord.RichEmbed()
											.setTitle("User Information")
											.setColor(0x220e41)
											.setDescription("Here is the user description for " + args[1])
											.setThumbnail(x.result[0].profilePicture)
											.setFooter("If nothing shows up, the user has no experience, no icon set, no flag set, and doesn't have the account connected to their discord.");
										
										if (x.result[0].experience != null) {
											embed.addField("The user has this much experience", x.result[0].experience);
										}
										if (x.result[0].userIcon != null) {
											const surrogateTeam = bot.emojis.get("700737595734491237").toString();
											const patreonSupproter = bot.emojis.get("700736949631188993").toString();
											const broomSquad = bot.emojis.get("700736528803954769").toString();
											const alphaTester = bot.emojis.get("700736528967532564").toString();
											const modSquad = bot.emojis.get("700736529043161139").toString();
											if (x.result[0].userIcon === "surrogateTeam") {
												embed.addField("The user has this icon", surrogateTeam);
											} else if (x.result[0].userIcon === "broomSquad") {
												embed.addField("The user has this icon", broomSquad);
											} else if (x.result[0].userIcon === "patreonSupporter") {
												embed.addField("The user has this icon", patreonSupproter);
											} else if (x.result[0].userIcon === "moderator") {
												embed.addField("The user has this icon", modSquad);
											} else if (x.result[0].userIcon === "alphaTester") {
												embed.addField("The user has this icon", alphaTester);
											}
										}
										if (x.result[0].flag != null) {
											embed.addField("The user's flag is", x.result[0].flag);
										}
										if (user) {
											embed.addField("The STV account is connected to the discord to the following user", "<@!" + inHere[0] + ">");
										}
										
										bot.channels.get(botSpamID).send({embed});
									}
								});
							
						});
					}
				});
				logBotActions(message, message.content);
				break;
			}
			case "burr":{
				message.reply("burrrrrrrrrrrr");
				break
			}
			default: {
				break;
			}
		}
		return;
	}
	detection(message, triggerPinballResponse, triggerClawResponse, triggerRaceResponse, triggerSumoResponse, triggerGeneralResponse, triggerSneakResponse, triggerArcadeResponse, triggerCommunityResponse);
});

function detection(message, triggerPinballResponse, triggerClawResponse, triggerRaceResponse, triggerSumoResponse, triggerGeneralResponse, triggerSneakResponse, triggerArcadeResponse, triggerCommunityResponse) {
	//"Refill the machine" for Claw
	if (triggerClawResponse && ((message.content.toLowerCase().includes("filled") || message.content.toLowerCase().includes("refill") || message.content.toLowerCase().includes("restock")) && !message.content.includes("www.")) && !((message.member.roles.find(r => r.name.toLowerCase() === "mod squad") || message.member.roles.find(r => r.name.toLowerCase() === "surrogate team" || message.member.roles.find(r => r.name.toLowerCase() === "alpha testers"))))) {
		const date = getDateObject(TIMEZONE_OFFSET_FINLAND);
		if (date.hour >= 20 || date.hour < 8) {
			let sendOut = "*Beep boop*\nIt is currently **" + date.timeStringAMPM + "** in Finland (Where the games are located).\n";
			let out1 = sendOut + "Between **8:00 PM and 8:00 AM** means it is likely that no one is in the office.\n";
			let out2 = out1 + "*Beep boop*";
			message.channel.send(out2);
			logBotActions(message, "Detected \"refill\" claw");
		}
		return;
	}
	
	if (message.content.toLowerCase().includes(':emergencybutton:')) {
		message.react('🇴')
			.then(() => message.react('🇭'))
			.then(() => message.react('🇳'))
			.then(() => message.react('🅾'))
			.catch(() => console.error('One of the emojis failed to react.'));
		logBotActions(message, "Reacted");
	}
}

function checkLevel(message) {
	fs.exists("./database/connect.dat", (exists) => {
		if (exists) {
			fs.readFile("./database/connect.dat", 'ascii', function (err, file) {
				if (err) throw err;
				let testData = file.toString().split("\n");
				let toSearch = "THISISNOTAUSERANDSHOULDRETURNNULL";
				let dIDFound = false;
				for (let i = 0; i < testData.length; i++) {
					if (!(testData[i] === "\n")) {
						let inHere = testData[i].split("|");
						if (inHere[0] === message.author.id) {
							dIDFound = true;
							toSearch = inHere[2];
							break;
						}
					}
				}
				const {list} = fetch("https://g9b1fyald3.execute-api.eu-west-1.amazonaws.com/master/users?search=" + toSearch, {
					method: 'GET', headers: {
						'Content-Type': 'application/json',
					},
				}).then(response => response.json())
					.then((x) => {
						const starter = message.guild.roles.find(e => e.name === "Starter Robot Ninja");
						const advanced = message.guild.roles.find(e => e.name === "Advanced Robot Ninja");
						const veteran = message.guild.roles.find(e => e.name === "Veteran Robot Ninja");
						const ultimate = message.guild.roles.find(e => e.name === "Ultimate Robot Ninja");
						if (x.result[0] == null) {
							if (message.member.roles.find(r => r.name === "Starter Robot Ninja") || message.member.roles.find(r => r.name === "Advanced Robot Ninja") || message.member.roles.find(r => r.name === "Veteran Robot Ninja") || message.member.roles.find(r => r.name === "Ultimate Robot Ninja")) {
								message.guild.member(message.member).removeRole(starter).catch(console.error);
								message.guild.member(message.member).removeRole(advanced).catch(console.error);
								message.guild.member(message.member).removeRole(veteran).catch(console.error);
								message.guild.member(message.member).removeRole(ultimate).catch(console.error);
								logReactActions(message.member.user, "Taken Tier roles");
							}
						} else {
							if ((x.result[0].experience == null || x.result[0].experience < 25600) && !message.member.roles.find(r => r.name === "Starter Robot Ninja")) {
								message.guild.member(message.member).addRole(starter).catch(console.error);
								message.guild.member(message.member).removeRole(advanced).catch(console.error);
								message.guild.member(message.member).removeRole(veteran).catch(console.error);
								message.guild.member(message.member).removeRole(ultimate).catch(console.error);
								logReactActions(message.member.user, "Given role of \"Starter Robot Ninja\"");
							} else if (x.result[0].experience >= 25600 && x.result[0].experience < 175000 && !message.member.roles.find(r => r.name === "Advanced Robot Ninja")) {
								message.guild.member(message.member).removeRole(starter).catch(console.error);
								message.guild.member(message.member).addRole(advanced).catch(console.error);
								message.guild.member(message.member).removeRole(veteran).catch(console.error);
								message.guild.member(message.member).removeRole(ultimate).catch(console.error);
								logReactActions(message.member.user, "Given role of \"Advanced Robot Ninja\"");
							} else if (x.result[0].experience >= 175000 && x.result[0].experience < 1668000 && !message.member.roles.find(r => r.name === "Veteran Robot Ninja")) {
								message.guild.member(message.member).removeRole(starter).catch(console.error);
								message.guild.member(message.member).removeRole(advanced).catch(console.error);
								message.guild.member(message.member).addRole(veteran).catch(console.error);
								message.guild.member(message.member).removeRole(ultimate).catch(console.error);
								logReactActions(message.member.user, "Given role of \"Veteran Robot Ninja\"");
							} else if (x.result[0].experience >= 1668000 && !message.member.roles.find(r => r.name === "Ultimate Robot Ninja")) {
								message.guild.member(message.member).removeRole(starter).catch(console.error);
								message.guild.member(message.member).removeRole(advanced).catch(console.error);
								message.guild.member(message.member).removeRole(veteran).catch(console.error);
								message.guild.member(message.member).addRole(ultimate).catch(console.error);
								logReactActions(message.member.user, "Given role of \"Ultimate Robot Ninja\"");
							} else if (!message.member.roles.find(r => r.name === "Starter Robot Ninja") && !message.member.roles.find(r => r.name === "Advanced Robot Ninja") && !message.member.roles.find(r => r.name === "Veteran Robot Ninja") && !message.member.roles.find(r => r.name === "Ultimate Robot Ninja")) {
								message.guild.member(message.member).addRole(starter).catch(console.error);
								message.guild.member(message.member).removeRole(advanced).catch(console.error);
								message.guild.member(message.member).removeRole(veteran).catch(console.error);
								message.guild.member(message.member).removeRole(ultimate).catch(console.error);
								logReactActions(message.member.user, "Given role of \"Starter Robot Ninja\"");
							}
						}
					});
			});
		}
	});
}

function getDateObject(timezoneOffset) {
	const date = new Date();
	date.setHours(date.getHours() + timezoneOffset);
	const monthLeadZero = ("0" + (date.getMonth() + 1).toString()).slice(-2);
	const dayLeadZero = ("0" + date.getDate().toString()).slice(-2);
	const hourLeadZero = ("0" + date.getHours().toString()).slice(-2);
	const hourAMPM = (date.getHours() % 12 === 0) ? 12 : (date.getHours() % 12);
	const hourAMPMLeadZero = ("0" + hourAMPM).slice(-2);
	const minuteLeadZero = ("0" + date.getMinutes().toString()).slice(-2);
	const secondLeadZero = ("0" + date.getSeconds().toString()).slice(-2);
	return {
		year: date.getFullYear(),
		month: date.getMonth() + 1,
		month00: monthLeadZero,
		monthName: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][date.getMonth()],
		monthNameShort: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][date.getMonth()],
		day: date.getDate(),
		weekdayNr: (date.getDay() === 0) ? 7 : date.getDay(),
		day00: dayLeadZero,
		dayOrdinal: date.getDate().toString() + ["th", "st", "nd", "rd"][(date.getDate() === 11 || date.getDate() === 12 || (date.getDate() % 10 > 3)) ? 0 : date.getDate() % 10],
		weekday: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][date.getDay()],
		hour: date.getHours(),
		hour00: hourLeadZero,
		minute: date.getMinutes(),
		minute00: minuteLeadZero,
		second: date.getSeconds(),
		second00: secondLeadZero,
		timeValueSeconds: Math.floor(date.valueOf() / 1000),
		
		timeString: hourLeadZero + ":" + minuteLeadZero + ":" + secondLeadZero,
		timeStringAMPM: hourAMPMLeadZero + ":" + minuteLeadZero + ":" + secondLeadZero + " " + ((date.getHours() < 12) ? "AM" : "PM"),
		
		dateString_MDY_dash: monthLeadZero + "-" + dayLeadZero + "-" + date.getFullYear().toString(),
		dateString_YMD_dash: date.getFullYear().toString() + "-" + monthLeadZero + "-" + dayLeadZero,
		dateString_DMY_slash: dayLeadZero + "/" + monthLeadZero + "/" + date.getFullYear().toString(),
		dateString_MDY_noLead:  (date.getMonth() + 1).toString() + "-" +date.getDate().toString() + "-" + date.getFullYear().toString(),
		dateString_MD_slash: (date.getMonth() + 1).toString() + "/" + date.getDate(),
	};
}