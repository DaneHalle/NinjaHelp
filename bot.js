global.crypto = require('crypto')
require('dotenv').config();
const Discord = require('discord.js');
const fetch = require('node-fetch');
const ms = require("ms");
const fs = require('fs');
const WebSocket = require('ws');
let request = require(`request`);
const Amplify = require('@aws-amplify/core');
const Auth = require('@aws-amplify/auth');
const API = require('@aws-amplify/api');
const bot = new Discord.Client();
const TOKEN = process.env.TOKEN;
const hiddenURL = ""+process.env.URL;
const email = ""+process.env.EMAIL;
const pass = ""+process.env.PASSWORD;

// Bad word checking :)
const whiteListWords = ['balls', 'whole'];

const Filter = require('bad-words');
const filter = new Filter();
filter.removeWords(...whiteListWords);
const swearjar = require('swearjar-extended');
const { containsProfanity } = require("@therohitdas/profanityjs");
const Profanity = require('profanity-js');
const profanity = new Profanity();
profanity.removeWords(...whiteListWords);

bot.login(TOKEN);

const TIMEZONE_OFFSET_GMT = 4;
const TIMEZONE_OFFSET_FINLAND = 7;

const battlingTrigger = ["627919045420646401", "707600524727418900"];
const pinballTrigger = ["613630308931207198", "707600524727418900"];
const raceTrigger = ["589484542214012963", "707600524727418900"];
const clawTrigger = ["7797123960092885052", "707600524727418900"];
const exploreTrigger = ["745957132049973291", "707600524727418900"];
const gameTrigger = ["768112471860576297", "707600524727418900"];
const wePlayTrigger = ["790994604316164096", "707600524727418900"];
const otherTrigger = ["751846589039116360", "707600524727418900"];

const generalTrigger = ["586955337870082082", "795319689202368542", "571390705117954049", "733026266881589358", "571600581936939049", "589485632984973332", "571388780058247185", "707600524727418900"];

const feedbackTrigger = ["782941911127293974", "782942076433727601"];
const discussionTrigger = ["782942398119542804"];
const issuesTrigger = ["782942236123201590", "782942301248028673"];
const botSpamID = "710104643996352633";
const modBotSpamID = "593000239841935362";
const testChannelID = "707600524727418900";

const categories = [
    {
        "id": "5d7f6eab-cbc7-4db6-9803-25e8a9c99ebe",
        "name": "Claw",
        "ping": "<@&744956886339682354>",
        "channel": "797123960092885052",
    },
    {
        "id": "9d04068c-8e3c-455c-98fd-bba5ea905daa",
        "name": "Racing",
        "ping": "<@&744956844233064449>",
        "channel": "589484542214012963",
    },
    {
        "id": "b5b6b966-cc16-4db1-b18d-6545bda1407c",
        "name": "WePlay",
        "ping": "<@&810898512748609546>",
        "channel": "790994604316164096",
    },
    {
        "id": "c5d4fb68-94bf-41a5-bd82-8120bee957b5",
        "name": "GameConsoles",
        "ping": "<@&768263821739032578>",
        "channel": "768112471860576297",
    },
    {
        "id": "41addbbf-bcbf-42f0-acdb-3d190965fee3",
        "name": "Pinball",
        "ping": "<@&744956868870537276>",
        "channel": "613630308931207198",
    },
    {
        "id": "7f048d16-acc0-4c32-a6a4-552a17761d70",
        "name": "Other",
        "ping": "<@&770311273585573889>",
        "channel": "751846589039116360",
    },
    {
        "id": "aca57801-006d-4f1b-bcbb-66822424d1ae",
        "name": "Battling",
        "ping": "<@&744956818073190471>",
        "channel": "627919045420646401",
    },
    {
        "id": "325d1761-5fa5-497c-b345-e4e674ccb0b4",
        "name": "Explore",
        "ping": "<@&745984587422760980>",
        "channel": "745957132049973291",
    },
    {
        "id": "5763a3e7-595d-4f35-b085-1ab1635419d4",
        "name": "HostInteract",
        "ping": "<@&831149364927397930>",
        "channel": "831079141478105118",
    },
];

var times=0;

var gameObject=[];
var curAnnounce=[];

// var storedMessages=[];

//Game Announcements
async function announcement(shortId, dir) {
    console.log("Starting Announcements for "+shortId+" with image path "+dir);
    while (true) {
        if (curAnnounce.indexOf(shortId) == -1) {
            console.log("Ending Announcments for "+shortId);
            break;
        }
        const {list} = fetch("https://g9b1fyald3.execute-api.eu-west-1.amazonaws.com/master/games/?shortId=" + shortId, {
            method: 'GET', headers: {
                'Content-Type': 'application/json',
            },
        }).then(response => response.json())
            .then((x) => {
                if (x == null || x.result == null || x.result.schedule == null) {
                    let scheduleHour = null;
                } else {
                    let cindex = categories.findIndex(c => c.id === x.result.categoryId);
                    let at = categories[cindex].ping;
                    var files = fs.readdirSync('./imgs/'+dir+'/');
                    let rand = Math.floor(Math.random() * files.length);
                    let chosenFile = files[rand];

                    const date = getDateObject(TIMEZONE_OFFSET_GMT);
                    let output = "";
                    let adjustedMinute = date.minute + date.hour * 60 +(date.weekdayNr-1) * 1440;
                    let nearestStartTime = x.result.schedule.findIndex(z => Math.abs(adjustedMinute - z.startTime) < 20);
                    if (!(nearestStartTime === -1)) {
                        let startTime = x.result.schedule[nearestStartTime].startTime;
                        if (startTime - adjustedMinute === 15 ) {
                            let out = at + " **" + x.result.title + "** goes live in 15 minutes! You can play here:\nhttps://surrogate.tv/game/" + shortId.toLowerCase() + "\n";
                            bot.channels.cache.get(categories[cindex].channel).send(out, {
                                files: [{
                                    attachment: './imgs/'+dir+'/'+chosenFile,
                                }],
                            })
                                .then(bot.channels.cache.get(categories[cindex].channel).send("**NOTE** Notifications for games have been changed to a role based system. You can get a role by reacting to the message in <#745097595692515380>"));
                            logBotActions(null, shortId + " Pre-Announcement");
                        } else if (startTime - adjustedMinute === 0 ) {
                            let out = at + " **" + x.result.title + "** is live and you can start to queue up! You can play here:\nhttps://surrogate.tv/game/" + shortId.toLowerCase() + "\n";
                            bot.channels.cache.get(categories[cindex].channel).send(out, {
                                files: [{
                                    attachment: './imgs/'+dir+'/'+chosenFile,
                                }],
                            })
                                .then(bot.channels.cache.get(categories[cindex].channel).send("**NOTE** Notifications for games have been changed to a role based system. You can get a role by reacting to the message in <#745097595692515380>"));
                            logBotActions(null, shortId + " Announcement");
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
	} else if (message === "WEBSITE HELP") {
		let out = date.timeString + " EST | WEBSITE HELP | " + action;
		console.log(out);
		fs.appendFile("./bot_logs/logs_" + date.dateString_MDY_noLead + ".txt", out + "\n", function (err) {
			if (err) throw err;
		});

	} else if (message === "RIGGED MACHINE") {
		let out = date.timeString + " EST | RIGGED MACHINE | " + action;
		console.log(out);
		fs.appendFile("./bot_logs/logs_" + date.dateString_MDY_noLead + ".txt", out + "\n", function (err) {
			if (err) throw err;
		});

	}  else if (message === "SWEAR JAR") {
		let out = date.timeString + " EST | SWEAR JAR | " + action;
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
		var checkDate = getDateObject(0);
		if (checkDate.day > startingDate.day || checkDate.month > startingDate.month || checkDate.year > startingDate.year) {
			fs.appendFile("./bot_logs/logs_" + startingDate.dateString_MDY_noLead + ".txt", "Starting a new day and restarting the bot", function (err) {
				if (err) throw err;
			});
			console.log("Starting a new day\n\n\n\n\n");

			bot.channels.cache.get("841634463917015060").send("New Day of swears");
					
			startingDate=checkDate;
			if (checkDate.weekday === "Tuesday") {
				bot.channels.cache.get("800698068084457493").send("<@&800698382355660801> \n Are you good to host Mario Kart Live this week for your normal sessions?");
			}
			if (checkDate.weekday === "Wednesday") {
				bot.channels.cache.get("800698090629103616").send("<@&800698182845464609>  \n Are you good to host SumoBots this weekend for your normal sessions?");
			}
			fs.open("./bot_logs/logs_" + checkDate.dateString_MDY_noLead + ".txt", 'a', function (err, file) {
				if (err) throw err;
			});

			gameObject=[];

			fs.readFile("./database/gameIdShort.dat", 'ascii', function (err, file) {
				if (err) throw err;
				let totalData = file.toString().split("\n");
				for (let i = 0; i < totalData.length; i++) {
					if (totalData[i].length != 0) {
						let dat = totalData[i].split("\r")[0].split("|");
						let gid = gameObject.findIndex(z => z.uuid === dat[0]);
						if (gid == -1) {
							url="https://g9b1fyald3.execute-api.eu-west-1.amazonaws.com/master/games/?shortId="+dat[1];
							let {list} = fetch(url, {
								method: 'GET', headers: {
									'Content-Type': 'application/json',
								},
							}).then(response => response.json())
								.then((x) => {
									try{
										gameObject.push({
											"uuid":dat[0], 
											"shortId": x.result.shortId,
											"public": x.result.privacySetting === "public",
											"threshold": 0,
											"category": x.result.categoryId,
										});
									} catch (e) {
									}
								});
						}
					}
				}

			});
		}
		await Sleep(ms("1m"));
	}
}

async function checkToUnmute() {
	let testServer = bot.guilds.cache.get("707047722208854098");
	let bromBotServer = bot.guilds.cache.get("664556796576268298");
	let surrogateServer = bot.guilds.cache.get("571388780058247179");
	let role = surrogateServer.roles.cache.find(r => r.name === "muted");
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
											u.roles.remove(role.id);
											bot.channels.cache.get(modBotSpamID).send(`<@${u.user.id}> has been unmuted!`);
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

bot.on('raw', packet => {
    if (!['MESSAGE_REACTION_ADD', 'MESSAGE_REACTION_REMOVE'].includes(packet.t)) return;
    const channel = bot.channels.cache.get(packet.d.channel_id);
    if (channel.messages.cache.has(packet.d.message_id)) return;
    channel.messages.fetch(packet.d.message_id).then(message => {
        const emoji = packet.d.emoji.id ? `${packet.d.emoji.name}:${packet.d.emoji.id}` : packet.d.emoji.name;
        const reaction = message.reactions.cache.get(emoji);
        if (!reaction) return;
        if (reaction) reaction.users.set(packet.d.user_id, bot.users.cache.get(packet.d.user_id));
        if (packet.t === 'MESSAGE_REACTION_ADD') {
            bot.emit('messageReactionAdd', reaction, bot.users.cache.get(packet.d.user_id));
        }
        if (packet.t === 'MESSAGE_REACTION_REMOVE') {
            bot.emit('messageReactionRemove', reaction, bot.users.cache.get(packet.d.user_id));
        }
    });
});

bot.on('messageReactionAdd', async (reaction, user) => {
	const emoji = ["Battling", "Pinball", "Racing", "ClawGames", "Explore", "GameConsoles", "WePlay", "Other", "SpecialEvents", "HostInteract"];
	const role  = ["Battling", "Pinball", "Racing", "ClawGames", "Explore", "GameConsoles", "WePlay", "Other", "SpecialEvents", "HostInteract"];
	const femoji = ['✅'];
	const frole = ["feedback"];
	if (user && !user.bot && reaction.message.channel.guild && reaction.message.content === "" && reaction.message.id === "811257817792905226") { //CHANGE AFTER GEN
		for (let o in emoji) {
			if (reaction.emoji.name === emoji[o]) {
				let i = reaction.message.guild.roles.cache.find(e => e.name === role[o]);
				await reaction.message.guild.member(user).roles.add(i).catch(console.error);
				console.log("Given " + user.tag + " role of \"" + i.name + "\"");
				logReactActions(user, "Given role of \"" + i.name + "\"");
			}
		}
		// console.log(`${reaction.message.author.tag}'s message "${reaction.message.content}" gained a reaction from ${user.tag}`);
		// console.log(`${reaction.count} user(s) have given the same reaction to this message!`);
	}
	if (user && !user.bot && reaction.message.channel.guild && reaction.message.id === "783756498395725835") { //CHANGE AFTER GEN
		for (let o in femoji) {
			if (reaction.emoji.name === femoji[o]) {
				let i = reaction.message.guild.roles.cache.find(e => e.name === frole[o]);
				await reaction.message.guild.member(user).roles.add(i).catch(console.error);
				console.log("Given " + user.tag + " role of \"" + i.name + "\"");
				logReactActions(user, "Given role of \"" + i.name + "\"");
			}
		}
		// console.log(`${reaction.message.author.tag}'s message "${reaction.message.content}" gained a reaction from ${user.tag}`);
		// console.log(`${reaction.count} user(s) have given the same reaction to this message!`);
	}
});

bot.on('messageReactionRemove', async (reaction, user) => {
	const emoji = ["Battling", "Pinball", "Racing", "ClawGames", "Explore", "GameConsoles", "WePlay", "Other", "SpecialEvents", "HostInteract"];
	const role  = ["Battling", "Pinball", "Racing", "ClawGames", "Explore", "GameConsoles", "WePlay", "Other", "SpecialEvents", "HostInteract"];
	const femoji = ['✅'];
	const frole = ["feedback"];
	if (user && !user.bot && reaction.message.channel.guild && reaction.message.content === "" && reaction.message.id === "811257817792905226") { //CHANGE AFTER GEN
		for (let o in emoji) {
			if (reaction.emoji.name === emoji[o]) {
				let i = reaction.message.guild.roles.cache.find(e => e.name === role[o]);
				await reaction.message.guild.member(user).roles.remove(i).catch(console.error);
				console.log("Taken " + user.tag + "'s' role of \"" + i.name + "\"");
				logReactActions(user, "Taken role of \"" + i.name + "\"");
			}
		}
		// console.log(`${reaction.message.author.tag}'s message "${reaction.message.content}" lost a reaction from ${user.tag}`);
		// console.log(`${reaction.count} user(s) have given the same reaction to this message!`);
	}
	if (user && !user.bot && reaction.message.channel.guild && reaction.message.id === "783756498395725835") { //CHANGE AFTER GEN
		for (let o in femoji) {
			if (reaction.emoji.name === femoji[o]) {
				let i = reaction.message.guild.roles.cache.find(e => e.name === frole[o]);
				await reaction.message.guild.member(user).roles.remove(i).catch(console.error);
				console.log("Taken " + user.tag + "'s' role of \"" + i.name + "\"");
				logReactActions(user, "Taken role of \"" + i.name + "\"");
			}
		}
		// console.log(`${reaction.message.author.tag}'s message "${reaction.message.content}" lost a reaction from ${user.tag}`);
		// console.log(`${reaction.count} user(s) have given the same reaction to this message!`);
	}
});

bot.once('ready', async () => {
    fs.exists("./database/announce.dat", (exists) => {
        if (!exists) {
            fs.open("./database/announce.dat", "w+", (err) => {
                if (err) throw err;
            });
        } else {
            fs.readFile("./database/announce.dat", "ascii", function (err, file) {
                let totalData = file.toString().split("\n");
                for (let i = 0; i < totalData.length; i++) {
                    if (totalData[i].length != 0) {
                        let dat = totalData[i].split("\r")[0].split("|");
                        curAnnounce.push(dat[0]);
                        announcement(dat[0], dat[1]);
                    }
                }
            });
        }
    });

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

	fs.readFile("./database/gameIdShort.dat", 'ascii', function (err, file) {
		if (err) throw err;
		let totalData = file.toString().split("\n");
		for (let i = 0; i < totalData.length; i++) {
			if (totalData[i].length != 0) {
				let dat = totalData[i].split("\r")[0].split("|");
				let gid = gameObject.findIndex(z => z.uuid === dat[0]);
				if (gid == -1) {
					url="https://g9b1fyald3.execute-api.eu-west-1.amazonaws.com/master/games/?shortId="+dat[1];
					let {list} = fetch(url, {
						method: 'GET', headers: {
							'Content-Type': 'application/json',
						},
					}).then(response => response.json())
						.then((x) => {
							try{
								gameObject.push({
									"uuid":dat[0], 
									"shortId": x.result.shortId,
									"public": x.result.privacySetting === "public",
									"threshold": 0,
									"category": x.result.categoryId,
								});
							} catch (e) {
							}
						});
				}
			}
		}

	});


	//Sign in for NinjaHelp Surrogate Account. 

	await Amplify.default.configure(
	  {
	    Auth: {
	      mandatorySignIn: true,
	      region: 'eu-west-1',
	      userPoolId: 'eu-west-1_QXXmJLzeq',
	      identityPoolId: 'eu-west-1:ee88318e-0a8e-402d-906d-763c933f0482',
	      userPoolWebClientId: 'u6gie8rc4jvvgusmpo3k7thtv',
	    },
	    API: {
	      endpoints: [
	        {
	          name: 'surrogateApi',
	          endpoint:
	            'https://g9b1fyald3.execute-api.eu-west-1.amazonaws.com/master',
	          region: 'eu-west-1',
	        },
	      ],
	    },
	  });

	await Auth.default.signIn(email, pass)
	  .then(success => console.log('successful sign in'))
	  .catch(err => console.log(err));

	connect();

	bot.user.setActivity("Surrogate.tv", {type: "WATCHING", url: "https://www.surrogate.tv"});
	const date = getDateObject(0);
	let info = "We are up and running as " + bot.user.tag + " at " + date.timeStringAMPM + " EST\n";
	info += "=======================================================";
	console.info(info);
});

bot.on('message', message => {
	if (message.author.bot || message.author.id === "381655612335063040" || message.guild.id == null || !((message.guild.id === ("707047722208854098") || message.guild.id === ("664556796576268298") || message.guild.id === ("571388780058247179")))) {
		if (message.guild.id === ("800697435986198579")) {
			if (message.content.substring(0, 1) === '!') {
				message.reply("No");
			}
		}
		return;
	}
	
	let testServer = bot.guilds.cache.get("707047722208854098");
	let broomBotServer = bot.guilds.cache.get("664556796576268298");
	let surrogateServer = bot.guilds.cache.get("571388780058247179");
	
	checkLevel(message);

	//Setup triggers for channels
	let triggerBattlingResponse = false;
	let triggerPinballResponse = false;
	let triggerRaceResponse = false;
	let triggerClawResponse = false;
	let triggerExploreResponse = false;
	let triggerGameResponse = false;
	let triggerWePlayResponse = false;
	let triggerOtherResponse  = false;
	let triggerGeneralResponse = false;
	let triggerFeedbackResponse = false;
	let triggerDiscussionResponse = false;
	let triggerIssuesResposne = false;
	let maxCheck = Math.max(battlingTrigger.length, pinballTrigger.length, raceTrigger.length, clawTrigger.length, exploreTrigger.length, gameTrigger.length, wePlayTrigger.length, otherTrigger.length, generalTrigger.length, feedbackTrigger.length, discussionTrigger.length, issuesTrigger.length);
	for (let i = 0; i < maxCheck; i++) {
		if (battlingTrigger[i] != null && battlingTrigger[i] === message.channel.id) {
			triggerBattlingResponse = true;
		}
		if (pinballTrigger[i] != null && pinballTrigger[i] === message.channel.id) {
			triggerPinballResponse = true;
		}
		if (raceTrigger[i] && raceTrigger[i] === message.channel.id) {
			triggerRaceResponse = true;
		}
		if (clawTrigger[i] != null && clawTrigger[i] === message.channel.id) {
			triggerClawResponse = true;
		}
		if (exploreTrigger[i] != null && exploreTrigger[i] === message.channel.id) {
			triggerExploreResponse = true;
		}
		if (gameTrigger[i] != null && gameTrigger[i] === message.channel.id) {
			triggerGameResponse = true;
		}
		if (wePlayTrigger[i] != null && wePlayTrigger[i] === message.channel.id) {
			triggerWePlayResponse = true;
		}
		if (otherTrigger[i] != null && otherTrigger[i] === message.channel.id) {
			triggerOtherResponse = true;
		}
		if (generalTrigger[i] != null && generalTrigger[i] === message.channel.id) {
			triggerGeneralResponse = true;
		}
		if (feedbackTrigger[i] != null && feedbackTrigger[i] === message.channel.id) {
			triggerFeedbackResponse = true;
		}
		if (issuesTrigger[i] != null && issuesTrigger[i] === message.channel.id) {
			triggerIssuesResposne = true;
		}
		if (discussionTrigger[i] != null && discussionTrigger[i] === message.channel.id) {
			triggerDiscussionResponse = true;
		}
	}
	
	if (message.member.user.tag === "Mordecai#3257" && message.content.includes("!test")) {
		//some test I want to do
		//707047722208854101
		
		let args = message.content.substring(1).split(' ');
		let cmd = args[0].toLowerCase();

		var checkDate = getDateObject(0);

		if (checkDate.weekday === "Tuesday") {
			bot.channels.cache.get("800698068084457493").send("<@&800698382355660801> \n Are you good to host Mario Kart Live this week for your normal sessions?");
		}
		if (checkDate.weekday === "Thursday") {
			bot.channels.cache.get("800698090629103616").send("<@&800698182845464609>  \n Are you good to host SumoBots this weekend for your normal sessions?");
		}
		return;
	}
	
	if (message.member.user.tag === "Mordecai#3257" && message.content.includes("!gen")) {
		message.delete();
		
		const battling = bot.emojis.cache.get("811185294011006996").toString();
		const pinball = bot.emojis.cache.get("810972920867717190").toString();
		const racing = bot.emojis.cache.get("811256590106755074").toString();
		const claw = bot.emojis.cache.get("744963655443021846").toString();
		const explore = bot.emojis.cache.get("810965118753570817").toString();
		const consoles = bot.emojis.cache.get("810968692652507167").toString();
		const wePlay = bot.emojis.cache.get("810959560968896564").toString();
		const other = bot.emojis.cache.get("810972965247516722").toString();
		const specialEvent = bot.emojis.cache.get("810967907193847860").toString();
		const hostInteract = bot.emojis.cache.get("831148257152991243").toString();
		
		const embed = new Discord.MessageEmbed()
			.setTitle("Notification Subsciption")
			.setColor(0x220e41)
			.setDescription("React on this post to receive a role which will enable you to receive notifications about a specific game!")
			.addField(battling + " Battling Games " + battling, "Get notified of any Battling game news and when SumoBots is about to go live.")
			.addField(pinball + " Pinball Games " + pinball, "Get notified of any Pinball game news and when a game goes offline or online for maitenance. Receive information about tournaments. ")
			.addField(racing + " Racing Games " + racing, "Get notified of any Racing game news and when RRC143 is about to go live.")
			.addField(claw + " Claw Games " + claw, "Get notified of any Claw Game news or related events.")
			.addField(explore + " Explore Games " + explore, "Get notified of any Explore game news or related events.")
			.addField(consoles + " Game Console Games " + consoles, "Get notified of any Game Console game news and when MarioKartLive is about to go live.")
			.addField(wePlay + " We Play Games " + wePlay, "Get notified of any We Play game news or related events.")
			.addField(other + " Other Games " + other, "Get notified of any Other game news.")
			.addField(specialEvent + " Special Events " + specialEvent, "Get notified of any Special Events happening within the community.")
			.addField(hostInteract + " Host Interact Games " + hostInteract, "Get notified of any Host Interact games.")
			.addField("All of these fields will also be notified of any behind the scenes related content through this way for a given game.", "⠀")
			.setFooter("To disable notification, un-react. If it appears that you haven't reacted, just react and un-react to disable them.");
		
		// bot.channels.cache.get("745097595692515380").send({embed}).then(sentEmbed => {
		//     sentEmbed.react("811185294011006996")
		//         .then(() => sentEmbed.react("810972920867717190"))
		//         .then(() => sentEmbed.react("811256590106755074"))
		//         .then(() => sentEmbed.react("744963655443021846"))
		//         .then(() => sentEmbed.react("810965118753570817"))
		//         .then(() => sentEmbed.react("810968692652507167"))
		//         .then(() => sentEmbed.react("810959560968896564"))
		//         .then(() => sentEmbed.react("810972965247516722")
		//         .then(() => sentEmbed.react("810967907193847860")));
		// });

        // bot.channels.cache.get("745097595692515380").messages.fetch("811257817792905226")
        //   .then(msg => {
        //     msg.edit(embed).then(sentEmbed => {
        //     	// console.log(sentEmbed)
        //     	sentEmbed.react("831148257152991243");
        //     	// 	.then(() => sentEmbed.react("770308616800043048"));
        //     });
        //   })
        //   .catch(console.error);
		
		logReactActions(message.member.user, "Edited embed");
		
		return;
	}
	
	// if (message.member.user.tag === "Mordecai#3257" && message.content.includes("!react")) {
 //        message.channel.messages.fetch("783756498395725835")
 //          .then(msg => {
 //            msg.react('✅');
 //          })
 //          .catch(console.error);
	// }

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
	if ((message.member.roles.cache.find(r => r.name.toLowerCase() === "mod squad") || message.member.roles.cache.find(r => r.name.toLowerCase() === "surrogate team"))) {
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
				let sendOut = "*Beep boop*\nThe time is given in GMT+3 (Finland). See what time that is for you here:\nhttps://www.timeanddate.com/worldclock/fixedtime.html?iso=" + year + "" + month + "" + day + "T" + hours + "" + minutes + "&p1=101\n*Beep boop*";
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
				let sendOut = "It is currently **" + date.timeStringAMPM + " " + date.dateString_DMY_slash + "** in Finland (Where most of the games are located).";
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
							bot.channels.cache.get(botSpamID).send("<@" + message.member.user.id + "> Please use this channel for bot commands!\n\tError: Invalid format");
						} else {
							bot.channels.cache.get(botSpamID).send("\tError: Invalid format");
						}
						logBotActions(message, "!roll error");
					} else {
						for (let i = 0; i < args[1].substring(0, args[1].indexOf("d")); i++) {
							let roll = Math.floor(Math.random() * args[1].substring(args[1].indexOf("d") + 1)) + 1;
							output += roll;
							if (output > 2000000000) {
								if (message.channel.id !== botSpamID) {
									message.delete();
									bot.channels.cache.get(botSpamID).send("<@" + message.member.user.id + "> Please use this channel for bot commands!\nThat was too many roles, try a smaller number!");
								} else {
									bot.channels.cache.get(botSpamID).send("That was too many roles, try a smaller number!");
								}
								logBotActions(message, "!roll xdy error");
								return;
							}
						}
						if (message.channel.id !== botSpamID) {
							message.delete();
							bot.channels.cache.get(botSpamID).send("<@" + message.member.user.id + "> Please use this channel for bot commands!\nRolling " + args[1] + ":\n\tTotal: " + output);
						} else {
							bot.channels.cache.get(botSpamID).send("Rolling " + args[1] + ":\n\tTotal: " + output);
						}
						logBotActions(message, "!roll xdy");
					}
				} else if (args[1] != null) {
					if (message.channel.id !== botSpamID) {
						message.delete();
						bot.channels.cache.get(botSpamID).send("<@" + message.member.user.id + "> Please use this channel for bot commands!\n\tError: Invalid format or too big of a number");
					} else {
						bot.channels.cache.get(botSpamID).send("\tError: Invalid format or too big of a number");
					}
					logBotActions(message, "!roll error");
				} else {
					let roll = Math.floor(Math.random() * 20) + 1;
					if (message.channel.id !== botSpamID) {
						message.delete();
						bot.channels.cache.get(botSpamID).send("<@" + message.member.user.id + "> Please use this channel for bot commands!\nRolling 1d20:\n\tTotal: " + roll);
					} else {
						bot.channels.cache.get(botSpamID).send("Rolling 1d20:\n\tTotal: " + roll);
					}
					logBotActions(message, "!roll");
				}
				break;
			}
			// !getHelp
			case 'help':
			case 'gethelp': {
				if (message.channel.id === modBotSpamID && (message.member.roles.cache.find(r => r.name.toLowerCase() === "mod squad") || message.member.roles.cache.find(r => r.name.toLowerCase() === "surrogate team"))) {
					const embed = new Discord.MessageEmbed()
						.setTitle("Hello, I am the NinjaHelp bot")
						.setColor(0x220e41)
						.setDescription("You have access to the following commands")
						.addField("`!time`", "Will tell the current time and day in Finland")
						.addField("`!roll` | `!roll xdy`", "Will roll a d20 on an unmodified command or will roll **x** number of **y** sided dice on a modified command")
						.addField("`!game` | `!game <CATEGORY>`", "Will give the links to the public games of the current category or given category.")
						.addField("`!schedule <GAME>`", "Will give the schedule of the game specified")
						.addField("`!top <GAME>`", "Will give the top players of the game specified")
						.addField("`!mute <USER> <TIME>`", "Will mute the <USER> for <TIME> (See ms library for time options)")
						.addField("`!unmute <USER>`", "If <USER> is muted, will unmute them and remove them from the database")
						.addField("`(ab:cd)`", "When you have a time formated as such, it will paste a Timezone conversion link to that time in Finland")
						.addField("`!name`", "Gives the SumoBots that have names other than their esports team")
						.addField("`!online`", "Gives all games that are currently online and public")
						.addField("`!connect <USERNAME>`", "Connect your Discord account to your Surrogate.TV (STV) account. `<USERNAME>` should be your STV username. Should you change your STV username at any point, just type the command with the new username.")
						.addField("`!modupdate <DISCORD_USER_@> <USERNAME>`", "Force update `<DISCORD_USER_@>`'s connection to discord with STV account associated with `<USERNAME>`")
						.addField("`!modremove <DISCORD_USER_@>`", "Remove the connection associated with `<DISCORD_USER_@>`")
						.addField("`!search <USERNAME>`", "Get information on the STV account associated with `<USERNAME>.")
						.setFooter("These commands are for Mod Squad and Surrogate Team");
					bot.channels.cache.get(modBotSpamID).send({embed});
				} else {
					const embed = new Discord.MessageEmbed()
						.setTitle("Hello, I am the NinjaHelp bot")
						.setColor(0x220e41)
						.setDescription("You have access to the following commands")
						.addField("`!time`", "Will tell the current time and day in Finland")
						.addField("`!roll` | `!roll xdy`", "Will roll a d20 on an unmodified command or will roll **x** number of **y** sided dice on a modified command")
						.addField("`!game` | `!game <CATEGORY>`", "Will give the links to the public games of the current category or given category.")
						.addField("`!schedule <GAME>`", "Will give the schedule of the game specified")
						.addField("`!top <GAME>`", "Will give the top players of the game specified")
						.addField("`!name`", "Gives the SumoBots that have names other than their esports team")
						.addField("`!online`", "Gives all games that are currently online and public")
						.addField("`!connect <USERNAME>`", "Connect your Discord account to your Surrogate.TV (STV) account. `<USERNAME>` should be your STV username. Should you change your STV username at any point, just type the command with the new username.")
						.addField("`!search <USERNAME>`", "Get information on the STV account associated with `<USERNAME>`.")
						.setFooter("These commands are for everyone");
					bot.channels.cache.get(botSpamID).send({embed});
				}
				message.delete();
				logBotActions(message, "!help");
				break;
			}
			// !game <GAME>
			case 'games':
			case 'game': {

				let url = "https://g9b1fyald3.execute-api.eu-west-1.amazonaws.com/master/games/ids?category=";
				let out = "Here you go!\n";

				if (triggerBattlingResponse || message.content.toLowerCase() === "!game battling" || message.content.toLowerCase() === "!games battling") {
					url += "aca57801-006d-4f1b-bcbb-66822424d1ae";
				} else if (triggerPinballResponse || message.content.toLowerCase() === "!game pinball" || message.content.toLowerCase() === "!games pinball") {
					url += "41addbbf-bcbf-42f0-acdb-3d190965fee3";
				} else if (triggerRaceResponse || message.content.toLowerCase() === "!game racing" || message.content.toLowerCase() === "!games racing") {
					url += "9d04068c-8e3c-455c-98fd-bba5ea905daa";
				} else if (triggerClawResponse || message.content.toLowerCase() === "!game claw" || message.content.toLowerCase() === "!games claw") {
					url += "5d7f6eab-cbc7-4db6-9803-25e8a9c99ebe";
				} else if (triggerExploreResponse || message.content.toLowerCase() === "!game explore" || message.content.toLowerCase() === "!games explore") {
					url += "325d1761-5fa5-497c-b345-e4e674ccb0b4";
				} else if (triggerGameResponse || message.content.toLowerCase() === "!game console" || message.content.toLowerCase() === "!games console") {
					url += "c5d4fb68-94bf-41a5-bd82-8120bee957b5";
				} else if (triggerWePlayResponse || message.content.toLowerCase() === "!game weplay" || message.content.toLowerCase() === "!games weplay") {
					url += "b5b6b966-cc16-4db1-b18d-6545bda1407c";
				} else if (triggerOtherResponse || message.content.toLowerCase() === "!game other" || message.content.toLowerCase() === "!games other") {
					url += "7f048d16-acc0-4c32-a6a4-552a17761d70";
				} else {
					return;
				}

				let {list} = fetch(url, {
					method: 'GET', headers: {
						'Content-Type': 'application/json',
					},
				}).then(response => response.json())
					.then((x) => {
						let i = 0;
						for (i = 0; i < x.result.length; i++) {
							let gindex = gameObject.findIndex(z => z.uuid === x.result[i]);
							if (gindex != -1 && gameObject[gindex].public) {
								out += "https://surrogate.tv/game/"+gameObject[gindex].shortId+"\n";
							}
						}
						message.reply(out);
					});

				logBotActions(message, "!game");
				break;
			}
			// !schedule
			case 'schedule': {
				let url = "https://g9b1fyald3.execute-api.eu-west-1.amazonaws.com/master/games/?shortId=";
				let command = "";
				let image = "";
				let soloTitle = "";
				const minDay = 1440;

				const {list} = fetch("https://g9b1fyald3.execute-api.eu-west-1.amazonaws.com/master/games/?shortId=" + args[1], {
		            method: 'GET', headers: {
		                'Content-Type': 'application/json',
		            },
		        }).then(response => response.json())
		            .then((x) => {
		                if (x == null || x.result == null) {
		                	// Check if in bot spam or not and send "game not found or game not public" message
	                		if ((message.member.roles.cache.find(r => r.name.toLowerCase() === "mod squad") || message.member.roles.cache.find(r => r.name.toLowerCase() === "surrogate team") || message.member.roles.cache.find(r => r.name.toLowerCase() === "game host")) || message.member.roles.cache.find(r => r.name.toLowerCase() === "game creators")) {
								message.delete();
								bot.channels.cache.get(modBotSpamID).send("<@" + message.author.id + "> , I was unable to find information on that game. Either that shortID does not exist or the game isn't public. The shortID is case sensitive.")
							} else {
								if (message.channel.id !== botSpamID) {
									message.delete();
									bot.channels.cache.get(botSpamID).send("<@" + message.author.id + "> , Please use this channel for bot commands.\nI was unable to find information on that game. Either that shortID does not exist or the game isn't public. The shortID is case sensitive.")
								} else {
									bot.channels.cache.get(botSpamID).send("<@" + message.author.id + "> , I was unable to find information on that game. Either that shortID does not exist or the game isn't public. The shortID is case sensitive.")
								}
							}
		                } else {
		                	if (x.result.privacySetting != "public") {
			                	// Check if in bot spam or not and send "game not found or game not public" message
		                		if ((message.member.roles.cache.find(r => r.name.toLowerCase() === "mod squad") || message.member.roles.cache.find(r => r.name.toLowerCase() === "surrogate team") || message.member.roles.cache.find(r => r.name.toLowerCase() === "game host")) || message.member.roles.cache.find(r => r.name.toLowerCase() === "game creators")) {
									message.delete();
									bot.channels.cache.get(modBotSpamID).send("<@" + message.author.id + "> , I was unable to find information on that game. Either that shortID does not exist or the game isn't public. The shortID is case sensitive.")
								} else {
									if (message.channel.id !== botSpamID) {
										message.delete();
										bot.channels.cache.get(botSpamID).send("<@" + message.author.id + "> , Please use this channel for bot commands.\nI was unable to find information on that game. Either that shortID does not exist or the game isn't public. The shortID is case sensitive.")
									} else {
										bot.channels.cache.get(botSpamID).send("<@" + message.author.id + "> , I was unable to find information on that game. Either that shortID does not exist or the game isn't public. The shortID is case sensitive.")
									}
								}
		                	} else {
			                	if (x.result.gamePageLogo != null) {
				                	if (x.result.gamePageLogo.includes("http")) {
				                		image = x.result.gamePageLogo;
				                	} else {
				                		image = "https://www.surrogate.tv"+x.result.gamePageLogo;
				                	}
				                } else {
				                	image = "https://www.surrogate.tv/img/profilepictures/sumo_profilepic.png";
				                }
	
				                command = x.result.shortId;
				                soloTitle = x.result.title;
	
				                if (x.result.schedule == null) {
									message.channel.send("There is no schedule for " + soloTitle + ".");
								} else {
									let output = "";
									x.result.schedule.sort((a, b) => a.startTime - b.startTime)
									for (let i = 0; i < x.result.schedule.length; i++) {
										let startTime = x.result.schedule[i].startTime + (3 * 60);
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
									let title = "Schedule for **" + soloTitle + "**";
									command = command.split(' ');
									command = command.splice(0);
									if ((message.member.roles.cache.find(r => r.name.toLowerCase() === "mod squad") || message.member.roles.cache.find(r => r.name.toLowerCase() === "surrogate team") || message.member.roles.cache.find(r => r.name.toLowerCase() === "game host") || message.member.roles.cache.find(r => r.name.toLowerCase() === "game creators"))) {
										message.delete();
										const embed = new Discord.MessageEmbed()
											.setTitle("__" + title + "__")
											.setColor(0x220e41)
											.setURL("https://surrogate.tv/game/" + command)
											.setDescription(output)
											.setThumbnail(image)
											.setFooter("The Office and most of the games are located in Finland so times are in GMT+3 timezone.");
										message.channel.send({embed});
									} else {
										if (message.channel.id !== botSpamID) {
											message.delete();
											
											const embed = new Discord.MessageEmbed()
												.setTitle("__" + title + "__")
												.setColor(0x220e41)
												.setURL("https://surrogate.tv/game/" + command)
												.setDescription(output)
												.setThumbnail(image)
												.setFooter("The Office and most of the games are located in Finland so times are in GMT+3 timezone.");
											bot.channels.cache.get(botSpamID).send({embed});
											
										} else {
											const embed = new Discord.MessageEmbed()
												.setTitle("__" + title + "__")
												.setColor(0x220e41)
												.setURL("https://surrogate.tv/game/" + command)
												.setDescription(output)
												.setThumbnail(image)
												.setFooter("The Office and most of the games are located in Finland so times are in GMT+3 timezone.");
											bot.channels.cache.get(botSpamID).send({embed});
										}
									}
								}
	
							}
		                }
						logBotActions(message, "!schedule");
		            });
				break;
			}
			// !mute <USER> <TIME>
			case 'mute': {
				if ((message.member.roles.cache.find(r => r.name.toLowerCase() === "mod squad") || message.member.roles.cache.find(r => r.name.toLowerCase() === "surrogate team") && args[1] != null && args[2] != null)) {
					let toMute = message.guild.member(message.mentions.users.first());
					let role = message.guild.roles.cache.find(r => r.name === "muted");
					if (!toMute) {
						bot.channels.cache.get(modBotSpamID).send(`Couldn't find user.`);
						return;
					}
					if (toMute.hasPermission("MANAGE_MESSAGES")) {
						bot.channels.cache.get(modBotSpamID).send(`Can't mute that user`);
						return;
					}
					let mutetime = args[2];
					if (!mutetime) {
						bot.channels.cache.get(modBotSpamID).send(`You need to specify a time (3s/3d/3h/3y)`);
						return;
					}
					toMute.roles.add(role.id);
					bot.channels.cache.get(modBotSpamID).send(`<@${toMute.id}> has been muted for ${ms(ms(mutetime))} by <@${message.member.user.id}>`);
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
				if ((message.member.roles.cache.find(r => r.name.toLowerCase() === "mod squad") || message.member.roles.cache.find(r => r.name.toLowerCase() === "surrogate team") && args[1] != null)) {
					let toUnmute = message.guild.member(message.mentions.users.first() || message.guild.members.cache.get(args[0]));
					let role = message.guild.roles.cache.find(r => r.name === "muted");
					if (!toUnmute) {
						bot.channels.cache.get(modBotSpamID).send("Couldn't find user.");
						return;
					} else if (!toUnmute.roles.cache.find(r => r.name.toLowerCase() === "muted")) {
						bot.channels.cache.get(modBotSpamID).send(`<@${toUnmute} is not muted.`);
						return;
					}
					await(toUnmute.roles.remove(role.id));
					toUnmute.roles.remove(role.id);
					bot.channels.cache.get(modBotSpamID).send(`<@${toUnmute.id}> has been unmuted by <@${message.member.user.id}>`);
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
				let soloTitle = ""
				let command = "";
				let image = "";

				const {list} = fetch("https://g9b1fyald3.execute-api.eu-west-1.amazonaws.com/master/games/?shortId=" + args[1], {
		            method: 'GET', headers: {
		                'Content-Type': 'application/json',
		            },
		        }).then(response => response.json())
		            .then((x) => {
		                if (x == null || x.result == null) {
		                	// Check if in bot spam or not and send "game not found or game not public" message
	                		if ((message.member.roles.cache.find(r => r.name.toLowerCase() === "mod squad") || message.member.roles.cache.find(r => r.name.toLowerCase() === "surrogate team") || message.member.roles.cache.find(r => r.name.toLowerCase() === "game host")) || message.member.roles.cache.find(r => r.name.toLowerCase() === "game creators")) {
								message.delete();
								bot.channels.cache.get(modBotSpamID).send("<@" + message.author.id + "> , I was unable to find information on that game. Either that shortID does not exist or the game isn't public. The shortID is case sensitive.")
							} else {
								if (message.channel.id !== botSpamID) {
									message.delete();
									bot.channels.cache.get(botSpamID).send("<@" + message.author.id + "> , Please use this channel for bot commands.\nI was unable to find information on that game. Either that shortID does not exist or the game isn't public. The shortID is case sensitive.")
								} else {
									bot.channels.cache.get(botSpamID).send("<@" + message.author.id + "> , I was unable to find information on that game. Either that shortID does not exist or the game isn't public. The shortID is case sensitive.")
								}
							}
		                } else {
		                	if (x.result.privacySetting != "public") {
			                	// Check if in bot spam or not and send "game not found or game not public" message
		                		if ((message.member.roles.cache.find(r => r.name.toLowerCase() === "mod squad") || message.member.roles.cache.find(r => r.name.toLowerCase() === "surrogate team") || message.member.roles.cache.find(r => r.name.toLowerCase() === "game host")) || message.member.roles.cache.find(r => r.name.toLowerCase() === "game creators")) {
									message.delete();
									bot.channels.cache.get(modBotSpamID).send("<@" + message.author.id + "> , I was unable to find information on that game. Either that shortID does not exist or the game isn't public. The shortID is case sensitive.")
								} else {
									if (message.channel.id !== botSpamID) {
										message.delete();
										bot.channels.cache.get(botSpamID).send("<@" + message.author.id + "> , Please use this channel for bot commands.\nI was unable to find information on that game. Either that shortID does not exist or the game isn't public. The shortID is case sensitive.")
									} else {
										bot.channels.cache.get(botSpamID).send("<@" + message.author.id + "> , I was unable to find information on that game. Either that shortID does not exist or the game isn't public. The shortID is case sensitive.")
									}
								}
		                	} else {
			                	if (x.result.gamePageLogo != null) {
				                	if (x.result.gamePageLogo.includes("http")) {
				                		image = x.result.gamePageLogo;
				                	} else {
				                		image = "https://www.surrogate.tv"+x.result.gamePageLogo;
				                	}
				                } else {
				                	image = "https://www.surrogate.tv/img/profilepictures/sumo_profilepic.png";
				                }
	
				                url += x.result.uuid+"&order=";
				                command = x.result.shortId;
				                soloTitle = x.result.title;
	
				                title = "**" + soloTitle + "**" + title;
	
				                const minDay = 1440;
								let {listScore} = fetch(url, {
									method: 'GET', headers: {
										'Content-Type': 'application/json',
									},
								}).then(response => response.json())
									.then((s) => {
										if (s == null || s.result == null || s.result.Items == null) {
											message.channel.send("There were no scores for " + command + ".");
										} else {
											let description = "";
											if (s.result.Items.length > 10) {
												description = "These are the Top 10 scores for **" + command + "**";
											} else {
												description = "These are the Top " + s.result.Items.length + " scores for **" + command + "**";
											}
											let scores = "";
											for (let i = 0; i < s.result.Items.length && i < 10; i++) {
												if (s.result.Items[i].userObject.userIcon != null) {
													let icon = s.result.Items[i].userObject.userIcon.toLowerCase();
													switch (icon) {
														case "broomsquad": {
															icon = bot.emojis.cache.get("700736528803954769").toString();
															break;
														}
														case "moderator": {
															icon = bot.emojis.cache.get("700736529043161139").toString();
															break;
														}
														case "patreonsupporter": {
															icon = bot.emojis.cache.get("700736949631188993").toString();
															break;
														}
														case "surrogateteam": {
															icon = bot.emojis.cache.get("700737595734491237").toString();
															break;
														}
														case "alphatester": {
															icon = bot.emojis.cache.get("700736528967532564").toString();
															break;
														}
														case "creator": {
															icon = bot.emojis.cache.get("827147154321702933").toString();
															break;
														}
														default: {
															break;
														}
													}
													scores += (i + 1) + ") " + icon + " **__" + s.result.Items[i].userObject.username + "__**:    " 
													if (x.result.scoreType == "timestamp") {
														scores += Math.floor((s.result.Items[i].points/(1000*60))%60) + ":" + ((Math.floor((s.result.Items[i].points/1000)%60).toString().length<2) ? "0" + Math.floor((s.result.Items[i].points/1000)%60) : Math.floor((s.result.Items[i].points/1000)%60))  + ":" + ((Math.floor((((s.result.Items[i].points/1000)%60)%1)*1000).toString().length<3) ? ((("0" + Math.floor((((s.result.Items[i].points/1000)%60)%1)*1000)).length<3) ? ("00" + Math.floor((((s.result.Items[i].points/1000)%60)%1)*1000)) : "0" + Math.floor((((s.result.Items[i].points/1000)%60)%1)*1000)) : Math.floor((((s.result.Items[i].points/1000)%60)%1)*1000));
													} else {
														scores += s.result.Items[i].points;
													}
												} else {
													scores += (i + 1) + ") **__" + s.result.Items[i].userObject.username + "__**:    " 
													if (x.result.scoreType == "timestamp") {
														scores += Math.floor((s.result.Items[i].points/(1000*60))%60) + ":" + ((Math.floor((s.result.Items[i].points/1000)%60).toString().length<2) ? "0" + Math.floor((s.result.Items[i].points/1000)%60) : Math.floor((s.result.Items[i].points/1000)%60))  + ":" + ((Math.floor((((s.result.Items[i].points/1000)%60)%1)*1000).toString().length<3) ? ((("0" + Math.floor((((s.result.Items[i].points/1000)%60)%1)*1000)).length<3) ? ("00" + Math.floor((((s.result.Items[i].points/1000)%60)%1)*1000)) : "0" + Math.floor((((s.result.Items[i].points/1000)%60)%1)*1000)) : Math.floor((((s.result.Items[i].points/1000)%60)%1)*1000));
													} else {
														scores += s.result.Items[i].points;
													}
												}
												if (i + 1 !== s.result.Items.length && i + 1 !== 10) {
													scores += "\n";
												}
											}
											if ((message.member.roles.cache.find(r => r.name.toLowerCase() === "mod squad") || message.member.roles.cache.find(r => r.name.toLowerCase() === "surrogate team") || message.member.roles.cache.find(r => r.name.toLowerCase() === "game host")) || message.member.roles.cache.find(r => r.name.toLowerCase() === "game creators")) {
												message.delete();
	
												let curCat = categories.findIndex(z => z.channel === message.channel.id);
												if (curCat == -1 || categories[curCat].id != x.result.categoryId) {
													if (message.channel.id == botSpamID) {
														const embed = new Discord.MessageEmbed()
															.setTitle("__" + title + "__")
															.setColor(0x220e41)
															.setThumbnail(image)
															.addField(description, scores);
														bot.channels.cache.get(botSpamID).send({embed})
													} else if (message.channel.id == modBotSpamID) {
														const embed = new Discord.MessageEmbed()
															.setTitle("__" + title + "__")
															.setColor(0x220e41)
															.setThumbnail(image)
															.addField(description, scores);
														bot.channels.cache.get(modBotSpamID).send({embed})
													} else {
														const embed = new Discord.MessageEmbed()
															.setTitle("__" + title + "__")
															.setColor(0x220e41)
															.setThumbnail(image)
															.addField(description, scores);
														bot.channels.cache.get(botSpamID).send({embed})
															.then(bot.channels.cache.get(botSpamID).send("<@" + message.author.id + ">"));
													}
												} else {
													const embed = new Discord.MessageEmbed()
														.setTitle("__" + title + "__")
														.setColor(0x220e41)
														.setThumbnail(image)
														.addField(description, scores);
													
													message.channel.send({embed});
												}
											} else {
												if (message.channel.id !== botSpamID) {
													message.delete();
													const embed = new Discord.MessageEmbed()
														.setTitle("__" + title + "__")
														.setColor(0x220e41)
														.setThumbnail(image)
														.addField(description, scores)
														.setFooter("Please use this channel for bot commands!");
													bot.channels.cache.get(botSpamID).send({embed})
														.then(bot.channels.cache.get(botSpamID).send("<@" + message.author.id + ">"));
												} else {
													const embed = new Discord.MessageEmbed()
														.setTitle("__" + title + "__")
														.setColor(0x220e41)
														.setThumbnail(image)
														.addField(description, scores);
													message.channel.send({embed});
												}
											}
										}
									});
							}
		                }
						logBotActions(message, "!top " + command);
		            });
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
					bot.channels.cache.get(botSpamID).send("<@" + message.member.user.id + "> Please use this channel for bot commands!\n" + out);
				} else {
					bot.channels.cache.get(botSpamID).send(out);
				}
				logBotActions(message, "!meme info");
				break;
			}
			// !name
			case "name": {
				const alliance = bot.emojis.cache.get("713862601687433236").toString(); //Chad
				const heretics = bot.emojis.cache.get("713862601846554795").toString(); //Hercules
				const mouse = bot.emojis.cache.get("713862041064177735").toString();    //Jerry
				const excel = bot.emojis.cache.get("713862601175728218").toString();    //Kyle
				const ence = bot.emojis.cache.get("713862224271114361").toString();     //Dug
				const empire = bot.emojis.cache.get("713862601779707924").toString();   //Mike
				let title = "__The names of the bots given by the Broom Gods__";
				let description = alliance + "\tChad\n" + empire + "\tMike\n" + mouse + "\tJerry\n" + ence + "\tDug\n" + heretics + "\tHercules\n" + excel + "\tKyle";
				if (triggerBattlingResponse) {
					message.delete();
					const embed = new Discord.MessageEmbed()
						.setTitle("__" + title + "__")
						.setColor(0x220e41)
						.setDescription(description);
					
					message.channel.send({embed});
				} else if (message.channel.id !== botSpamID) {
					const embed = new Discord.MessageEmbed()
						.setTitle("__" + title + "__")
						.setColor(0x220e41)
						.setDescription(description)
						.setFooter("Please use this channel for that command!");
					
					bot.channels.cache.get(botSpamID).send({embed})
						.then(bot.channels.cache.get(botSpamID).send("<@" + message.author.id + ">"));
				} else {
					const embed = new Discord.MessageEmbed()
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
					bot.channels.cache.get(botSpamID).send("<@" + message.author.id + ">, You need to supply your Surrogate.TV Username which can be found on your user profile at https://surrogate.tv/user");
				} else {
					args[1]=encodeURI(args[1]);
					const {list} = fetch("https://g9b1fyald3.execute-api.eu-west-1.amazonaws.com/master/users?search=" + args[1], {
						method: 'GET', headers: {
							'Content-Type': 'application/json',
						},
					}).then(response => response.json())
						.then((x) => {
							if (x.status === "failure" || x.result[0] == null) {
								bot.channels.cache.get(botSpamID).send("<@" + message.author.id + ">, I cannot find a user by that name. Names are case sensitive so make sure it is correct.");
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
												bot.channels.cache.get(botSpamID).send("<@" + message.author.id + ">, You have already connected that Surrogate profile with your discord account.");
											} else if ((userFound || uIDFound)) {
												let inHere = testData[hold].split("|");
												bot.channels.cache.get(botSpamID).send("<@" + message.author.id + ">, The Surrogate profile " + args[1] + " has already been connected to discord user <@" + inHere[0] + ">. Please DM Mordecai if you feel this is a mistake");
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
																		bot.channels.cache.get(botSpamID).send("<@" + message.author.id + ">, I cannot find a user by that name. Names are case sensitive so make sure it is correct.");
																	} else {
																		if (!dIDFound) {
																			bot.channels.cache.get(botSpamID).send("<@" + message.author.id + ">, There is no Surrogate profile associated with you rdiscord account, please DM Mordecai if you feel this is a mistake.");
																		} else if (x.result[0].userId !== uid) {
																			bot.channels.cache.get(botSpamID).send("<@" + message.author.id + ">, That Surrogate profile is not the same one you previously connected with the username of " + inHere[2] + ". Please DM Mordecai if you feel this is a mistake.");
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
																			bot.channels.cache.get(botSpamID).send("<@" + message.author.id + ">, Your Surrogate profile has been successfully updated!");
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
												bot.channels.cache.get(botSpamID).send("<@" + message.author.id + ">, Your Surrogate profile has been successfully connected to your discord account!");
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
				if ((message.member.roles.cache.find(r => r.name.toLowerCase() === "mod squad") || message.member.roles.cache.find(r => r.name.toLowerCase() === "surrogate team") && args[1] != null) && args[2] != null) {
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
												bot.channels.cache.get(modBotSpamID).send("Unable to find the username " + args[2] + ". The names are case sensitive.");
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
													bot.channels.cache.get(modBotSpamID).send("That username is already claimed by another user. Cannot overwrite.");
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
													bot.channels.cache.get(modBotSpamID).send("Successfully updated " + args[1] + "'s connection. ");
												}
											}
										});
								} else {
									bot.channels.cache.get(modBotSpamID).send("Cannot find that user's information in my database. They can connect themselves.");
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
				if ((message.member.roles.cache.find(r => r.name.toLowerCase() === "mod squad") || message.member.roles.cache.find(r => r.name.toLowerCase() === "surrogate team") && args[1] != null)) {
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
									bot.channels.cache.get(modBotSpamID).send("Successfully removed " + args[1] + "'s connection. ");
								} else {
									bot.channels.cache.get(modBotSpamID).send("Cannot find that user's information in my database. They don't need to be removed.");
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
										if (message.channel.id === botSpamID){
											bot.channels.cache.get(botSpamID).send("I cannot find that username on the website. ");
										} else if (message.channel.id === modBotSpamID){
											bot.channels.cache.get(modBotSpamID).send("I cannot find that username on the website. ");
										}
									} else {
										let embed = new Discord.MessageEmbed()
											.setTitle("User Information")
											.setColor(0x220e41)
											.setDescription("Here is the user description for " + args[1])
											.setThumbnail(x.result[0].profilePicture)
											.setFooter("If nothing shows up, the user has no experience, no icon set, no flag set, and doesn't have the account connected to their discord.");
										
										if (x.result[0].experience != null) {
											embed.addField("The user has this much experience", x.result[0].experience);
										}
										if (x.result[0].userIcon != null) {
											const surrogateTeam = bot.emojis.cache.get("700737595734491237").toString();
											const patreonSupproter = bot.emojis.cache.get("700736949631188993").toString();
											const broomSquad = bot.emojis.cache.get("700736528803954769").toString();
											const alphaTester = bot.emojis.cache.get("700736528967532564").toString();
											const modSquad = bot.emojis.cache.get("700736529043161139").toString();
											const gameCreator = bot.emojis.cache.get("827147154321702933").toString();
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
											} else if (x.result[0].userIcon === "creator") {
												embed.addField("The user has this icon", gameCreator);
											}
										}
										if (x.result[0].flag != null) {
											embed.addField("The user's flag is", x.result[0].flag);
										}
										if (user) {
											embed.addField("The STV account is connected to the discord to the following user", "<@!" + inHere[0] + ">");
										}
										
										if (message.channel.id === botSpamID){
											bot.channels.cache.get(botSpamID).send({embed});
										} else if (message.channel.id === modBotSpamID){
											bot.channels.cache.get(modBotSpamID).send({embed});
										}
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
            case "announcestart": {
                if (message.channel.id === modBotSpamID) {
                    if (args[1] == null || args[2] == null) {
                        message.reply("Not enough arguments, use command as `!announcestart <shortID> <image_path>` with an image/gif attatched");
                        return;
                    }
                    if (args[2].indexOf(".") != -1 || args[2].indexOf("/") != -1 || args[2].indexOf("\\") != -1) {
                        message.reply("Invalid image path");
                        return;
                    }
                    if (curAnnounce.indexOf(args[1]) != -1) {
                        message.reply("Announcements already enabled for this game ID. To add images, use `!add <image_path>` with an image/gif attatched. To disable, use `!announcestop <shortID>`");
                        return;
                    }
                    var dir = './imgs/'+args[2];

                    if(message.attachments.first()){
                        if (!fs.existsSync(dir)) {
                            fs.mkdirSync(dir);
                        } else {
                            message.reply("An image path of that name already exists. Please choose a new one.");
                            return;
                        }
                
                        fs.readdir(dir, (err, files) => {
                            message.attachments.forEach(a => {
                                let name = dir+'/'+args[2]+"_"+files.length+""+a.name.substring(a.name.indexOf('.'));
                                request.get(a.url)
                                    .on('error', console.error)
                                    .pipe(fs.createWriteStream(name));
                            })
                        });
                        fs.appendFile('./database/announce.dat', args[1]+"|"+args[2]+"\n", function (err) {
                          if (err) throw err;
                        });

                        curAnnounce.push(args[1]);
                        announcement(args[1], args[2]);
                        message.reply("Starting announcements for "+args[1]+" with image path "+args[2]);
                    } else {
                        message.reply("You need to supply some media to go along with the announcement");
                        return;
                    }
                }
                logBotActions(message, message.content);
                break;
            }
            case "announcepause": {
                if (message.channel.id === modBotSpamID) {
                    if (args[1] == null) {
                        message.reply("Not enough arguments, use commands as `!announcepause <shortID>`");
                        return;
                    }
                    if (curAnnounce.indexOf(args[1]) == -1) {
                        message.reply("Game ID already not being announced");
                        return;
                    }
                    curAnnounce.splice(curAnnounce.indexOf(args[1]),curAnnounce.indexOf(args[1])+1);
                    message.reply("Stopping announcements for "+args[1]);
                }
                logBotActions(message, message.content);
                break;
            }
            case "announceunpause": {
                if (message.channel.id === modBotSpamID) {
                    if (args[1] == null || args[2] == null) {
                        message.reply("Not enough arguments, use commands as `!announceunpause <shortID> <image_path>`");
                        return;
                    }
                    if (curAnnounce.indexOf(args[1]) != -1) {
                        message.reply("Game ID already being announced");
                        return;
                    }
                    curAnnounce.push(args[1]);
                    announcement(args[1], args[2]);
                    message.reply("Restarting announcements for "+args[1]);
                }
                logBotActions(message, message.content);
                break;
            }
            case "announcestop": {
                if (message.channel.id === modBotSpamID) {
                    if (args[1] == null) {
                        message.reply("Not enough arguments, use command as `!announcestop <shortID>`");
                        return;
                    }
                    if (curAnnounce.indexOf(args[1]) == -1) {
                        message.reply("Announcments already turned off for that game ID!");
                        return;
                    }
                    curAnnounce.splice(curAnnounce.indexOf(args[1]),1);
                    fs.readFile("./database/announce.dat", "ascii", function (err, file) {
                        let totalData = file.toString().split("\n");
                        let rm = -1;
                        for (let i = 0; i < totalData.length; i++) {
                            if (totalData[i].includes(args[1])) {
                                rm = i; 
		                        let imPath = "./imgs/"+totalData[i].split("\r")[0].split("|")[1];
		                        fs.rm(imPath, { recursive: true , force: true}, (err) => {
		                            if (err) {
		                                throw err;
		                            }
		                        });
                                break;
                            }
                        }
                        totalData.splice(rm, 1);
                        if (totalData.length > 0) {
                            fs.writeFileSync("./database/announce.dat", totalData.join("\n"));
                        } else {
                            fs.writeFileSync("./database/announce.dat", "");
                        }
                    });
                    message.reply("Disabling announcement notifications for "+args[1]);
                }
                logBotActions(message, message.content);
                break;
            }
            case "add": {
                if (message.channel.id === modBotSpamID) {
                    if (args[1] == null) {
                        message.reply("You need to provide the image path you set when setting up the announcement");
                        return;
                    }

                    var dir = './imgs/'+args[1];

                    if(message.attachments.first()){
                        if (!fs.existsSync(dir)) {
                            message.reply("An image path of that name doesn't exist yet. Please choose a new one.");
                            return;
                        } 
                
                        fs.readdir(dir, (err, files) => {
                            message.attachments.forEach(a => {
                                let name = dir+'/'+args[1]+"_"+files.length+""+a.name.substring(a.name.indexOf('.'));
                                request.get(a.url)
                                    .on('error', console.error)
                                    .pipe(fs.createWriteStream(name));
                            })
                        });
                        message.reply("Added image to "+args[1]);
                    } else {
                        message.reply("You need to supply some media");
                        return;
                    }
                }
                logBotActions(message, message.content);
                break;
            }
			case "announcestatus": {
                if (message.channel.id === modBotSpamID) {
                    if (args[1] == null) {
                        message.reply("Not enough arguments, use command as `!announcestatus <shortID>`");
                        return;
                    }
                    fs.readFile("./database/announce.dat", "ascii", function (err, file) {
                        let totalData = file.toString().split("\n");
                        let loc = -1;
                        for (let i = 0; i < totalData.length; i++) {
                        	if (totalData[i].includes(args[1])) {
                                loc = i; 
                                break;
                            }
                        }
                        if (loc == -1) {
                        	message.reply("No announcements running or setup for that game. ")
                        } else {
		                    if (curAnnounce.indexOf(args[1]) == -1) {
		                        let imPath = totalData[loc].split("\r")[0].split("|")[1];
		                        message.reply("Announcements are currently paused for **"+args[1]+"** with image path **"+imPath+"**");
		                    } else {
		                        let imPath = totalData[loc].split("\r")[0].split("|")[1];
		                    	message.reply("Announcements are running for **"+args[1]+"** with image path **"+imPath+"**");
		                    }
		                }
                    });
                }
                logBotActions(message, message.content);
                break;
            }
			case "announceaudit": {
                if (message.channel.id === modBotSpamID) {
                    if (args[1] != null) {
                        message.reply("Too many arguments. None are needed for this command.`");
                        return;
                    }
                    fs.readFile("./database/announce.dat", "ascii", function (err, file) {
                        let totalData = file.toString();
                        message.reply("Here is an audit of the games currently running announcements\n`shortID|imagePath`\n\n```"+totalData+"```")
                    });
                }
                logBotActions(message, message.content);
                break;
            }
			case 'announcehelp': {
				if (message.channel.id === modBotSpamID) {
					const embed = new Discord.MessageEmbed()
						.setTitle("Hello, I am the NinjaHelp bot")
						.setColor(0x220e41)
						.setDescription("Here are the commands related to announcements")
						.addField("`!announcestart <shortID> <new_image_path>`", "NOTE: Requires an attatched image/gif to work. Will enable announcements for the given shortID. The attatched image will be saved in the new_image_path.")
						.addField("`!announcepause <shortID>`", "Pause announcements being given for the shortID if they were enabled previously")
						.addField("`!announceunpause <shortID> <image_path>`", "Unpause announcements for the given shortID and image_path.")
						.addField("`!announcestop <shortID>`", "Will disable announcements from being done for the given shortID. Will delete any images previously uploaded.")
						.addField("`!announcestatus <shortID>`", "Get the curent announcement status for a specified shortID. Will give the imagePath if possible.")
						.addField("`!announceaudit`", "Provides an audit of all the shortIDs and imagePaths currently setup.")
						.addField("`!add <image_path>`", "NOTE: Requires an attatched image/gif to work. Will add the included attatchment to image_path to be randomly pulled from when announcements happen.")
						.setFooter("These commands are for Mod Squad, Surrogate Team, and Game Creators");
					bot.channels.cache.get(modBotSpamID).send({embed});
				}
				break;
			}
			case 'online': {
				if (message.channel.id != botSpamID) {
					message.delete();
				} else {
					let onlineGames = "";
					var games = [];
					var promises = [];

					let i = 0;
					let j = 0;
						for (i=0; i < categories.length; i++) {
							promises.push(new Promise((resolve, reject) => {
								let {listGames} = fetch("https://g9b1fyald3.execute-api.eu-west-1.amazonaws.com/master/games/listGames", {
									method: 'POST', headers: {
										'Content-Type': 'application/json',
									}, 
									body: JSON.stringify("{\"categoryId\": \""+categories[i].id+"\",\"limit\":50}")
								}).then(response => response.json())
									.then((lg) => {
										resolve(lg.result.gameIds)
									});
							}))
						}
						Promise.all(promises).then(res => {
							var a = '{"games":['
							for (i=0; i<res[0].length; i++){
								a+='"'+res[0][i]+'"'
								if (!(i+1==res[0].length)) {
									a+=','
								}
							}
							a+=']}'
							let {getGames} = fetch("https://g9b1fyald3.execute-api.eu-west-1.amazonaws.com/master/getGames", {
								method: 'POST', headers: {
									'Content-Type': 'application/json',
								}, 
								body: a
							}).then(response => response.json())
								.then((gg) => {


									let sortGG = gg.result.sort(function(a,b) {
										if (a.shortId<b.shortId) {
											return -1
										} 
										if (a.shortId>b.shortId) {
											return 1
										}
										return 0
									})
									let z = 0
									for (z=0; z<sortGG.length; z++) {
										if (sortGG[z].isOnline) {
											onlineGames+="\nhttps://surrogate.tv/game/"+sortGG[z].shortId
										}
									}
									message.reply(onlineGames)
								});			
								
						})
				}
				logBotActions(message, message.content)
				break;
			}
			default: {
				break;
			}
		}
		return;
	}



	detection(message, triggerBattlingResponse, triggerPinballResponse, triggerRaceResponse, triggerClawResponse, triggerExploreResponse, triggerGameResponse, triggerWePlayResponse, triggerOtherResponse, triggerGeneralResponse, triggerFeedbackResponse, triggerDiscussionResponse, triggerIssuesResposne);
});

function detection(message, triggerBattlingResponse, triggerPinballResponse, triggerRaceResponse, triggerClawResponse, triggerExploreResponse, triggerGameResponse, triggerWePlayResponse, triggerOtherResponse, triggerGeneralResponse, triggerFeedbackResponse, triggerDiscussionResponse, triggerIssuesResposne) {
	//"Refill the machine" for Claw
	if (triggerClawResponse && ((message.content.toLowerCase().includes("filled") || message.content.toLowerCase().includes("refill") || message.content.toLowerCase().includes("restock")) && !message.content.includes("www.")) && !((message.member.roles.cache.find(r => r.name.toLowerCase() === "mod squad") || message.member.roles.cache.find(r => r.name.toLowerCase() === "surrogate team" || message.member.roles.cache.find(r => r.name.toLowerCase() === "alpha testers"))))) {
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

	if (triggerFeedbackResponse) {
		message.react('👍')
			.then(() => message.react('👎'))
			.catch(() => console.error('One of the emojis failed to react.'));
	}

	if (triggerIssuesResposne) {
		message.react('🟥')
			.then(() => message.react('🟧'))
			.catch(() => console.error('One of the emojis failed to react.'));
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
						const starter = message.guild.roles.cache.find(e => e.name === "Starter Robot Ninja");
						const advanced = message.guild.roles.cache.find(e => e.name === "Advanced Robot Ninja");
						const veteran = message.guild.roles.cache.find(e => e.name === "Veteran Robot Ninja");
						const ultimate = message.guild.roles.cache.find(e => e.name === "Ultimate Robot Ninja");
						if (x.result[0] == null) {
							if (message.member.roles.cache.find(r => r.name === "Starter Robot Ninja") || message.member.roles.cache.find(r => r.name === "Advanced Robot Ninja") || message.member.roles.cache.find(r => r.name === "Veteran Robot Ninja") || message.member.roles.cache.find(r => r.name === "Ultimate Robot Ninja")) {
								message.guild.member(message.member).roles.remove(starter).catch(console.error);
								message.guild.member(message.member).roles.remove(advanced).catch(console.error);
								message.guild.member(message.member).roles.remove(veteran).catch(console.error);
								message.guild.member(message.member).roles.remove(ultimate).catch(console.error);
								logReactActions(message.member.user, "Taken Tier roles");
							}
						} else {
							if ((x.result[0].experience == null || x.result[0].experience < 25600) && !message.member.roles.cache.find(r => r.name === "Starter Robot Ninja")) {
								message.guild.member(message.member).roles.add(starter).catch(console.error);
								message.guild.member(message.member).roles.remove(advanced).catch(console.error);
								message.guild.member(message.member).roles.remove(veteran).catch(console.error);
								message.guild.member(message.member).roles.remove(ultimate).catch(console.error);
								logReactActions(message.member.user, "Given role of \"Starter Robot Ninja\"");
							} else if (x.result[0].experience >= 25600 && x.result[0].experience < 175000 && !message.member.roles.cache.find(r => r.name === "Advanced Robot Ninja")) {
								message.guild.member(message.member).roles.remove(starter).catch(console.error);
								message.guild.member(message.member).roles.add(advanced).catch(console.error);
								message.guild.member(message.member).roles.remove(veteran).catch(console.error);
								message.guild.member(message.member).roles.remove(ultimate).catch(console.error);
								logReactActions(message.member.user, "Given role of \"Advanced Robot Ninja\"");
							} else if (x.result[0].experience >= 175000 && x.result[0].experience < 1668000 && !message.member.roles.cache.find(r => r.name === "Veteran Robot Ninja")) {
								message.guild.member(message.member).roles.remove(starter).catch(console.error);
								message.guild.member(message.member).roles.remove(advanced).catch(console.error);
								message.guild.member(message.member).roles.add(veteran).catch(console.error);
								message.guild.member(message.member).roles.remove(ultimate).catch(console.error);
								logReactActions(message.member.user, "Given role of \"Veteran Robot Ninja\"");
							} else if (x.result[0].experience >= 1668000 && !message.member.roles.cache.find(r => r.name === "Ultimate Robot Ninja")) {
								message.guild.member(message.member).roles.remove(starter).catch(console.error);
								message.guild.member(message.member).roles.remove(advanced).catch(console.error);
								message.guild.member(message.member).roles.remove(veteran).catch(console.error);
								message.guild.member(message.member).roles.add(ultimate).catch(console.error);
								logReactActions(message.member.user, "Given role of \"Ultimate Robot Ninja\"");
							} else if (!message.member.roles.cache.find(r => r.name === "Starter Robot Ninja") && !message.member.roles.cache.find(r => r.name === "Advanced Robot Ninja") && !message.member.roles.cache.find(r => r.name === "Veteran Robot Ninja") && !message.member.roles.cache.find(r => r.name === "Ultimate Robot Ninja")) {
								message.guild.member(message.member).roles.add(starter).catch(console.error);
								message.guild.member(message.member).roles.remove(advanced).catch(console.error);
								message.guild.member(message.member).roles.remove(veteran).catch(console.error);
								message.guild.member(message.member).roles.remove(ultimate).catch(console.error);
								logReactActions(message.member.user, "Given role of \"Starter Robot Ninja\"");
							}
						}
					});
			});
		}
	});
}

function wait(ms){
    var start = new Date().getTime();
    var end = start;
    while(end < start + ms) {
      end = new Date().getTime();
   }
 }

function connect(){
	var socket = new WebSocket('wss://broker.surrogate.tv/socket.io/?EIO=3&transport=websocket');
	// ws.reconnectInterval = 60000

	socket.on('connecting', function() {
		console.log('WebSocket Client Connecting');
	});

	socket.on('open', function (event) {
		// console.log("WebSocket sending opening messages")
		for (let i = 0; i < gameObject.length; i++) {
			var sub = '424["subscribe","/chat/'+gameObject[i].uuid+'"]';
			socket.send(sub);
		}
	});

	socket.on('message', function (data) {
		str = data.replace(/\r?\n|\r/g, "");
		if(!str.includes('[{"status":"ok"}]') && str!='40' && str.substring(0,1)!='0' && str!="3"){
			var today = getDateObject(TIMEZONE_OFFSET_GMT);
			var dateTime = today.dateString_YMD_dash+' '+today.timeString
			var obj = JSON.parse(str.substring(48, str.length-1));
			if(obj.type=="chatMessage"){

				//Some sort of command system within the chat
				//	!help <what you need help with>
				//	!mod - pings mod
				//	!admin - pings admin (only during "work" hours)
				// 	Some other commands?
				//	Some detection for profanity 
				//Would be better if we can get the bot to respond in chat as well

				let gindex = gameObject.findIndex(x => x.uuid === str.substring(10,46));

				var toStoreObject = {
					"time": dateTime,
					"game": gameObject[gindex].shortId,
					"username": obj.username,
					"message": obj.message,
					"userId": obj.userId,
				};

				if (obj.message.toLowerCase().startsWith("!help") && toStoreObject.username!="NinjaHelp") {
					// Some sort of detection 
					sendMessageToWebsite(gameObject[gindex].uuid, "I am a work in progress currently so can't help you. Sorry!");

				}

				if (filter.isProfane(obj.message) || swearjar.profane(obj.message) || containsProfanity(obj.message, true) || profanity.isProfane(obj.message)) {
					if (swearjar.profane(obj.message)) {
						var report = "```\n"+JSON.stringify(swearjar.words(obj.message))+"\n```";
						bot.channels.cache.get("841634463917015060").send("User `"+obj.username+"` said `"+obj.message+"` on \nhttps://surrogate.tv/game/"+gameObject[gindex].shortId+"\n\nScorecard:"+report);
					
					} else {
						bot.channels.cache.get("841634463917015060").send("User `"+obj.username+"` said `"+obj.message+"` on \nhttps://surrogate.tv/game/"+gameObject[gindex].shortId);
					}
					logBotActions("SWEAR JAR", "A swear has been said by "+obj.username);
				}

				fetch(hiddenURL, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify(toStoreObject)
				}).then(response => response.text());

				if (obj.message.toLowerCase().startsWith("!mod")) {
					bot.channels.cache.get(modBotSpamID).send("<@&668877680095264780> | User `"+obj.username+"` has requested a mod on game: \nhttps://surrogate.tv/game/"+gameObject[gindex].shortId);
					sendMessageToWebsite(gameObject[gindex].uuid, "I have pinged the Moderators on the discord. One should respond if available.");
					logBotActions("WEBSITE HELP", "Mod requested on a game");
				} else if (obj.message.toLowerCase().startsWith("!mordecai")) {
					var date = new Date();
					var hrs = date.getHours();
					if (hrs >= 23 || hrs <= 8) {
						sendMessageToWebsite(gameObject[gindex].uuid, "Mordecai is currently sleeping. Please refrain from requesting him between 23:00-08:00 EST.");
						logBotActions("WEBSITE HELP", "Mordecai requested on a game during off hours");
					} else {
						bot.channels.cache.get("776894942274125826").send("<@152200419043442688>  | User `"+obj.username+"` has requested you on game: \nhttps://surrogate.tv/game/"+gameObject[gindex].shortId);
						sendMessageToWebsite(gameObject[gindex].uuid, "I have pinged Mordecai on the discord. He should respond soon.");
						logBotActions("WEBSITE HELP", "Mordecai requested on a game");
					}
				} else if ((obj.message.toLowerCase().includes(" rigged ") || obj.message.toLowerCase().startsWith("rigged") || obj.message.toLowerCase().endsWith(" rigged") || obj.message.toLowerCase().startsWith("rig ") || obj.message.toLowerCase().endsWith(" rig") || obj.message.toLowerCase().includes(" rig ")) && gameObject[gindex].shortId.toLowerCase().includes("claw")) {
					sendMessageToWebsite(gameObject[gindex].uuid, "(Robot Ninja Auto Help) Operators can set the claw strength on Claw Machines to limit the amount of prizes won. Some modern claw machines (but not this one) have even more settings to control how many prizes are won. This claw machine is set up so that not all but a fair amount of grabs will win a prize. The difficulty mostly comes from the unusual shapes of the prizes.");
					logBotActions("RIGGED MACHINE", "Rigged on Claw Machine");
				}

				if (obj.message.toLowerCase().includes("help") && !obj.message.toLowerCase().includes("helping") && !obj.message.toLowerCase().includes("!test") && !obj.message.toLowerCase().includes("!help") && obj.role == null) {
					gameObject[gindex].threshold++;
					console.log(gameObject[gindex].threshold)
				}
				if (gameObject[gindex].threshold >= 1 && !gameObject[gindex].public && toStoreObject.username!="NinjaHelp") {
					// fetch(hiddenURL+"?user="+obj.username+"&limit=5&game="+toStoreObject.game, {
					// 	method: 'GET',
					// 	headers: {
					// 		'Content-Type': 'application/json'
					// 	},
					// }).then(response => response.json())
					// 	.then((x) => {
					// 		var out="<@&774839010844999731> | User `"+obj.username+"` has requested help on the private game:\nhttps://surrogate.tv/game/"+gameObject[gindex].shortId+"\nHere are the past 5 (if they exist) messages from them in the chat:\n>>> ";
					// 		for (let i = 0; i < x.length; i++) {
					// 			out+=x[i].time+" |\t"+x[i].message+"\n";
					// 		}
					// 		bot.channels.cache.get(modBotSpamID).send(out);
					// 	});
					// logBotActions("WEBSITE HELP", "Help Requested on private game");
					gameObject[gindex].threshold=-4;
				} else if (gameObject[gindex].threshold >= 2 && gameObject[gindex].public && toStoreObject.username!="NinjaHelp") {
					fetch(hiddenURL+"?user="+obj.username+"&limit=5&game="+toStoreObject.game, {
						method: 'GET',
						headers: {
							'Content-Type': 'application/json'
						},
					}).then(response => response.json())
						.then((x) => {
							var out="<@&774839010844999731> | User `"+obj.username+"` has requested help on the public game:\nhttps://surrogate.tv/game/"+gameObject[gindex].shortId+"\nHere are the past 5 (if they exist) messages from them in the chat:\n>>> ";
							for (let i = 0; i < x.length; i++) {
								out+=x[i].time+" |\t"+x[i].message+"\n";
							}
							bot.channels.cache.get(modBotSpamID).send(out);
						});
					logBotActions("WEBSITE HELP", "Help Requested on public game");
					gameObject[gindex].threshold=-4;
				}
			}
		}
	});

	socket.on('close', function(e) {
		console.log("Connection closed because "+e)
		setTimeout(function() {
			connect();
		}, 500);
	});

	socket.on('error', function() {
		console.log('WebSocket error');
	});
	  
		function tick() {
			//get the mins of the current time
			var mins = new Date().getMinutes();

			if (mins == "00") {
				socket.close()
			}

			times++;

			if(times%10==0){
				for (let i = 0; i < gameObject.length; i++) {
					if (gameObject[i].threshold > 0) {
						gameObject[i].threshold--;
					} else if (gameObject[i].threshold < 0) {
						gameObject[i].threshold++;
					}
				}
				times=0;
			}
			socket.send("2")
		}
	    
	    setInterval(tick, 6000);
}

async function sendMessageToWebsite(gameId, message) {
  await API.default.post('surrogateApi', '/chatMessage', {
      body: { gameId: gameId, message: message },
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