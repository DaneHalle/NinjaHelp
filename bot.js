require('dotenv').config();
const Discord=require('discord.js');
const fetch=require('node-fetch');
const ms=require("ms");
const fs=require('fs');
const bot=new Discord.Client();
const TOKEN=process.env.TOKEN;
bot.login(TOKEN);

var clawTrigger=[706819836071903275, 662301446036783108, 707600524727418900];
var pinballTrigger=[613630308931207198, 702578486199713872, 707600524727418900];
var arcadeTrigger=clawTrigger.concat(pinballTrigger);
var raceTrigger=[589484542214012963, 707600524727418900];
var sumoTrigger=[627919045420646401, 707600524727418900];
var generalTrigger=[586955337870082082, 571390705117954049, 571600581936939049, 631391110966804510, 589485632984973332, 571388780058247185, 710104643996352633, 707600524727418900];
var sneakTrigger=[631134966163701761, 662642212789551124, 707600524727418900];
var botSpamID="710104643996352633"; 
var modBotSpamID="593000239841935362";

var testChannelID="707600524727418900";
var surrogateChannelID="0";

//Game Announcements 
async function announcement(game, image, numImage, channel){
    while(true){
        var date=new Date();
        var weekdays=new Array(
            "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
        );
        var day=(date.getDay()+6)%7;
        const minDay=1440;
        var rightDay=false;

        var at="";
        if(game.toLowerCase().includes("sumobots")){
            at="<@&744956818073190471>";
        }else if(game.toLowerCase().includes("racerealcars143")){
            at="<@&744956844233064449>";
        }

        const {list}=fetch("https://g9b1fyald3.execute-api.eu-west-1.amazonaws.com/master/games/?shortId="+game.toLowerCase(), {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
        }).then(response => response.json())
            .then((x) => {
                if(x==null||x.result==null||x.result.schedule==null){
                    var scheduleHour=null;
                }else{
                    date=new Date();
                    var i; var output=""; 
                    var curHour=(date.getHours()+4);
                    if(curHour>23){
                        day++;
                        curHour%=24;
                    }
                    var curMinute=date.getMinutes();
                    var adjustedMinute=curMinute+curHour*60+day*minDay;
                    x.result.schedule.sort((a,b) => a.startTime - b.startTime)
                    for(i=0; i<x.result.schedule.length; i++){
                        var startTime=x.result.schedule[i].startTime;
                        if(Math.abs(adjustedMinute-startTime)<20){
                            rightDay=true;
                            break;
                        }
                    }
                    var rand=Math.floor(Math.random()*numImage)+1;

                    if(startTime-adjustedMinute==15&&rightDay){
                        var out=at+" **"+game+"** goes live in 15 minutes! You can play here:\nhttps://surrogate.tv/game/"+game.toLowerCase()+"\n";
                        bot.channels.get(channel).send(out, {
                          files: [{
                            attachment: './gifs/'+image+'/'+image+'_'+rand+'.gif',
                            name: image+'.gif'
                          }]
                        });
                        bot.channels.get(channel).send("**NOTE** Notifications for games are being changed to a role based system. You can get a role by reacting to the message in <#745097595692515380>")
                        logBotActions(null, game+" Pre-Announcement");
                        return;
                    }else if(startTime-adjustedMinute==0&&rightDay){
                        var out=at+" **"+game+"** is live and you can start to queue up! You can play here:\nhttps://surrogate.tv/game/"+game.toLowerCase()+"\n";
                        bot.channels.get(channel).send(out, {
                          files: [{
                            attachment: './gifs/'+image+'/'+image+'_'+rand+'.gif',
                            name: image+'.gif'
                          }]
                        });
                        bot.channels.get(channel).send("**NOTE** Notifications for games are being changed to a role based system. You can get a role by reacting to the message in <#745097595692515380>")
                        logBotActions(null, game+" Announcement");
                        return;
                    }
                }
            });
        await Sleep(60000) //1 minute
    }
}

function Sleep(milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
}

function logBotActions(message, action){
    today=new Date();
    var hours=today.getHours();
    var minutes=today.getMinutes();
    var seconds=today.getSeconds();
    var day=today.getDate();
    var month=today.getMonth()+1;
    var year=today.getFullYear();
    if(hours<10&&hours!=0){
        hours="0"+hours;
    }
    if(minutes<10&&minutes!=0){
        minutes="0"+minutes;
    }
    if(seconds<10&&seconds!=0){
        seconds="0"+seconds;
    } 
    if(message==null){
        var out=hours+":"+minutes+":"+seconds+" EST | AUTO ANNOUNCE | "+action;
        console.log(out);
        fs.appendFile("./bot_logs/logs_"+month+"-"+day+"-"+year+".txt", out+"\n", function (err) {
          if (err) throw err;
        }); 
    }else if(message=="AUTO UNMUTE"){
        var out=hours+":"+minutes+":"+seconds+" EST | AUTO UNMUTE | "+action;
        console.log(out);
        fs.appendFile("./bot_logs/logs_"+month+"-"+day+"-"+year+".txt", out+"\n", function (err) {
          if (err) throw err;
        }); 
    }else if(message=="ERROR"){
        var out=hours+":"+minutes+":"+seconds+" EST | ERROR | "+action;
        console.log(out);
        fs.appendFile("./bot_logs/logs_"+month+"-"+day+"-"+year+".txt", out+"\n", function (err) {
          if (err) throw err;
        }); 
    }else{
        var out=hours+":"+minutes+":"+seconds+" EST | "+message.member.user.tag+" | "+action;
        console.log(hours+":"+minutes+":"+seconds+" EST | "+message.member.user.tag+" | "+action);
        // if(message.author.id!="120618883219587072"){//Damn you Grimberg
            fs.appendFile("./bot_logs/logs_"+month+"-"+day+"-"+year+".txt", out+"\n", function (err) {
              if (err) throw err;
            }); 
        // }
    }
}

function logReactActions(user, event){
    today=new Date();
    var hours=today.getHours();
    var minutes=today.getMinutes();
    var seconds=today.getSeconds();
    var day=today.getDate();
    var month=today.getMonth()+1;
    var year=today.getFullYear();
    if(hours<10&&hours!=0){
        hours="0"+hours;
    }
    if(minutes<10&&minutes!=0){
        minutes="0"+minutes;
    }
    if(seconds<10&&seconds!=0){
        seconds="0"+seconds;
    } 
    console.log(hours+":"+minutes+":"+seconds+" EST | "+user.tag+" | "+event);
    fs.appendFile("./bot_logs/logs_"+month+"-"+day+"-"+year+".txt", hours+":"+minutes+":"+seconds+" EST | "+user.tag+" | "+event+"\n", function (err) {
      if (err) throw err;
    }); 
}

async function newDay(){
    var date=new Date();
    var day=date.getDate();
    var month=date.getMonth()+1;
    var year=date.getFullYear();
    while(true){
        date=new Date();
        var checkDay=date.getDate();
        var checkMonth=date.getMonth()+1;
        var checkYear=date.getFullYear();
        if(checkDay>day||checkMonth>month||checkYear>year){
            if(checkMonth==7||checkMonth==8){
                fetch("https://docs.google.com/spreadsheets/d/e/2PACX-1vRe979Ap0TpmdEDtPhZ7nwT9bkelIKUzFHf9ed6HiPBf5ZM09nNOAIjxAK1rztDqBffR8Gc6FTecoaA/pub?gid=1385749731&single=true&output=csv", {
                method: 'GET',
            }).then(x => x.text())
                .then(x => {
                    var date=new Date();
                    var day=date.getDate();
                    var month=date.getMonth()+1;
                    var insert=day+"/"+month;
                    console.log(x);
                    let v = x.split(/\n/).map(a => a.split(","));
                    while(v.length>10){
                        v.pop();
                    }
                    let sym = ["1) ","2) ","3) ","4) ","5) ","6) ","7) ","8) ","9) ","10) "];
                    var scores = "";
                    v.forEach((a,i) => {scores += "" + sym[i] + " **__" + a[0] + "__**\t" + a[1] + "\n"});

                    var title="__**Oktoberfest** Current Scores__";
                    var description="Here are the Top 10 **Oktoberfest Launch Tournament** players as of "+insert;
                    var footer="Note: Some new top 10 scores may not be verified yet and will not appear here.";
                    var image="https://www.american-pinball.com/s/i/h/pinslide/oktoberfest/oktoberfest-logo-tap_shadow.png";
                    const embed = new Discord.RichEmbed()
                      .setTitle("__"+title+"__")
                      .setColor(0x220e41)
                      .setURL("http://proco.me/oktoberfest/")
                      .addField(description , scores)
                      .setThumbnail(image)
                      .setFooter(footer);

                    bot.channels.get("702578486199713872").send({embed});
                });
            }
            // bot.destroy();
            fs.appendFile("./bot_logs/logs_"+month+"-"+day+"-"+year+".txt", "Starting a new day and restarting the bot", function (err) {
              if (err) throw err;
            }); 
            console.log("Starting a new day\n\n\n\n\n");
            // bot.login(TOKEN);
            day=checkDay;
            month=checkMonth;
            year=checkYear;
            fs.open("./bot_logs/logs_"+month+"-"+day+"-"+year+".txt", 'a', function (err, file) {
              if (err) throw err;
            });
        }
        await Sleep(ms("1m"));
    }
}

async function checkToUnmute(){
    let testServer=bot.guilds.get("707047722208854098");
    let bromBotServer=bot.guilds.get("664556796576268298");
    let surrogateServer=bot.guilds.get("571388780058247179");
    let role = surrogateServer.roles.find(r => r.name === "muted");
    while(true){
        date=new Date();
        var date=new Date();
        var day=date.getDate();
        var month=date.getMonth()+1;
        var year=date.getFullYear();
        var hour=date.getHours();
        var minute=date.getMinutes();
        var tempHour=hour+day*24;
        var tempMin=minute+tempHour*60;
        fs.exists("./database/mute.dat", (exists)=>{
            if(exists){
                fs.readFile("./database/mute.dat", 'ascii', function (err, file) {
                    if (err) throw err;
                    var testData=file.toString().split("\n");
                    var i;
                    for(i=0; i<testData.length; i++){
                        if(!testData[i]=="\n"){
                            var removeUserLine=testData[i];
                            var remove=removeUserLine.split("|");
                            var removeTime=remove[1].split("~");
                            var removeDate=removeTime[0].split("/");
                            var removeSpecificTime=removeTime[1].split(":");
                            var success=false;
                            var removeHour=parseInt(removeSpecificTime[0])+(parseInt(removeDate[1])*24);
                            var removeMin=parseInt(removeSpecificTime[1])+(parseInt(removeHour)*60);
                            if(removeMin<=tempMin){
                                surrogateServer.members.forEach(u => {
                                    if(!u.user.bot){
                                        if(remove[0]==u.user.id){
                                            u.removeRole(role.id);
                                            bot.channels.get(modBotSpamID).send(`<@${u.user.id}> has been unmuted!`);
                                            logBotActions("AUTO UNMUTE", u.user.tag+" unmuted automatically");
                                            success=true;
                                        }
                                    }
                                });
                            }
                            if(success){
                                var reinsert="";
                                var j;
                                for(j=0; j<testData.length; j++){
                                    if(i==j||testData[j]=="\n"){
                                    }else if(j<testData.length-1){
                                        reinsert+=testData[j];
                                    }else{
                                        reinsert+=testData[j]+"\n";
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
    MESSAGE_REACTION_ADD: 'messageReactionAdd',
    MESSAGE_REACTION_REMOVE: 'messageReactionRemove',
};

bot.on('raw', async event => {
    if (!events.hasOwnProperty(event.t)) return;

    const { d: data } = event;
    const user = bot.users.get(data.user_id);
    const channel = bot.channels.get(data.channel_id) || await user.createDM();

    if (channel.messages.has(data.message_id)) return;

    const message = await channel.fetchMessage(data.message_id);

    const emojiKey = (data.emoji.id) ? `${data.emoji.name}:${data.emoji.id}` : data.emoji.name;
    const reaction = message.reactions.get(emojiKey);

    bot.emit(events[event.t], reaction, user);
});

bot.on('messageReactionAdd', (reaction, user) => {

    let emoji=["SumoBots", "RRC", "Pinball" , "ClawGames"];
    let role=["SumoBots", "RRC", "Pinball" , "ClawGames"]


    if (user && !user.bot && reaction.message.channel.guild && reaction.message.content=="" && reaction.message.id==745098642377146461){ //CHANGE AFTER GEN
        let i;
        for (let o in emoji){
            if (reaction.emoji.name == emoji[o]) {
                i = reaction.message.guild.roles.find(e => e.name == role[o]);
                reaction.message.guild.member(user).addRole(i).catch(console.error)
                console.log("Given "+user.tag+" role of \""+i.name+"\"");
                logReactActions(user, "Given role of \""+i.name+"\"")
            }
        }
        console.log(`${reaction.message.author.tag}'s message "${reaction.message.content}" gained a reaction from ${user.tag}`);
        console.log(`${reaction.count} user(s) have given the same reaction to this message!`);
    }
});

bot.on('messageReactionRemove', (reaction, user) => {
    let emoji=["SumoBots", "RRC", "Pinball" , "ClawGames"];
    let role=["SumoBots", "RRC", "Pinball" , "ClawGames"]

    if (user && !user.bot && reaction.message.channel.guild && reaction.message.content=="" && reaction.message.id==745098642377146461){ //CHANGE AFTER GEN
        let i;
        for (let o in emoji){
            if (reaction.emoji.name == emoji[o]) {
                i = reaction.message.guild.roles.find(e => e.name == role[o]);
                reaction.message.guild.member(user).removeRole(i).catch(console.error)
                console.log("Taken "+user.tag+"'s' role of \""+i.name+"\"");
                logReactActions(user, "Taken role of \""+i.name+"\"")
            }
        }
        console.log(`${reaction.message.author.tag}'s message "${reaction.message.content}" lost a reaction from ${user.tag}`);
        console.log(`${reaction.count} user(s) have given the same reaction to this message!`);
    }  
});

bot.once('ready', () => {
    announcement("SumoBots", "sumo", 10, "627919045420646401");
    announcement("RaceRealCars143", "race", 4, "589484542214012963");
    // announcement("SumoBots", "sumo", 10, "707047722208854101"); //Testing
    // announcement("SumoBots", "sumo", 10, "700390885984043188"); //Broom Bot
    fs.open("./database/mute.dat", "w", (err)=>{
        if(err) throw err;
    });
    checkToUnmute();
    bot.user.setActivity("Surrogate.tv", { type: "WATCHING", url: "https://www.surrogate.tv" });
    newDay();
    var today=new Date();
    var day=today.getDate();
    var month=today.getMonth()+1;
    var year=today.getFullYear();
    var hours=today.getHours();
    var minutes=today.getMinutes();
    var seconds=today.getSeconds();
    if(hours<10){
        hours="0"+hours;
    }
    if(minutes<10){
        minutes="0"+minutes;
    }
    if(seconds<10){
        seconds="0"+seconds;
    }
    fs.open("./bot_logs/logs_"+month+"-"+day+"-"+year+".txt", 'a', function (err, file) {
      if (err) throw err;
    });
    var info="We are up and running as "+bot.user.tag+" at "+hours+":"+minutes+":"+seconds+" EST\n";
    info+="=======================================================";
    console.info(info);
});

bot.on('message',  message => {
    if(message.author.bot||message.author.id=="381655612335063040"||!(message.guild.id==("707047722208854098")||message.guild.id==("664556796576268298")||message.guild.id==("571388780058247179"))){
        return;
    }

    let testServer=bot.guilds.get("707047722208854098");
    let broomBotServer=bot.guilds.get("664556796576268298");
    let surrogateServer=bot.guilds.get("571388780058247179");

     //Setup triggers for channels
    var i; 
    var triggerClawResponse=false; var triggerArcadeResponse=false; var triggerRaceResponse=false; 
    var triggerSumoResponse=false; var triggerGeneralResponse=false; var triggerSneakResponse=false;
    var triggerPinballResponse=false;
    var maxCheck=Math.max(clawTrigger.length, arcadeTrigger.length, raceTrigger.length, sumoTrigger.length, generalTrigger.length, sneakTrigger.length, pinballTrigger.length);
    for(i=0; i<maxCheck; i++){
        if(clawTrigger[i]!=null&&clawTrigger[i]==message.channel.id){
            triggerClawResponse=true;
        }
        if(pinballTrigger[i]!=null&&pinballTrigger[i]==message.channel.id){
            triggerPinballResponse=true;
        }
        if(arcadeTrigger[i]!=null&&arcadeTrigger[i]==message.channel.id){
            triggerArcadeResponse=true;
        }
        if(raceTrigger[i]&&raceTrigger[i]==message.channel.id){
            triggerRaceResponse=true;
        }
        if(sumoTrigger[i]!=null&&sumoTrigger[i]==message.channel.id){
            triggerSumoResponse=true;
        }
        if(generalTrigger[i]!=null&&generalTrigger[i]==message.channel.id){
            triggerGeneralResponse=true;
        }
        if(sneakTrigger[i]!=null&&sneakTrigger[i]==message.channel.id){
            triggerSneakResponse=true;
        }
    }

    if(message.member.user.tag=="Mordecai#3257"&&message.content.includes("!test")){
        //some test I want to do
        //707047722208854101

        var args=message.content.substring(1).split(' ');
        var cmd=args[0].toLowerCase();
        
        return;
    }

    if(message.member.user.tag=="Mordecai#3257" && message.content.includes("!gen")){
        message.delete();

        const sumo=bot.emojis.get("744962246848807002").toString(); 
        const rrc=bot.emojis.get("744960028427157565").toString(); 
        const pin=bot.emojis.get("744965333151907970").toString(); 
        const claw=bot.emojis.get("744963655443021846").toString(); 

        const embed = new Discord.RichEmbed()
          .setTitle("Notification Subsciption")
          .setColor(0x220e41)
          .setDescription("React on this post to receive a role which will enable you to receive notifications about a specific game!")
          .addField(sumo+" SumoBots "+sumo, "Get notified when the game is about to be online and for information about the tournament.")
          .addField(rrc+" RaceRealCars143 "+rrc, "Get notified when the game is about to be online.")
          .addField(pin+" Pinball Games "+pin, "Get notified when a game goes offline or online for maitenance. Recieve information about tournaments. ")
          .addField(claw+" Claw Games "+claw, "Get notified of any Claw Game related events")
          .addField("All of these fields will also be notified of any behind the scenes related content through this way for a given game.", "⠀")
          .setFooter("To disable notification, un-react. If it appears that you haven't reacted, just react and un-react to disable them.");

          bot.channels.get("745097595692515380").send({embed}).then(sentEmbed => {
            sentEmbed.react("744962246848807002")                   
                .then(() => sentEmbed.react("744960028427157565"))  
                .then(() => sentEmbed.react("744965333151907970"))  
                .then(() => sentEmbed.react("744963655443021846")); 
          });

          logReactActions(message.member.user, "Generated embed");

          return;
    }

    //scraper for getting channel info 
    if(message.member.user.tag=="Mordecai#3257"&&message.content.startsWith("!scrape")){
        console.log("ID: "+message.channel.id);
        console.log("Type: "+message.channel.type);
        console.log("Guild_ID: "+message.channel.guild_id);
        console.log("Position: "+message.channel.position);
        console.log("permissio_overwrites: "+message.channel.permission_overwrites);
        console.log("name: "+message.channel.name);
        console.log("topic: "+message.channel.topic);
        console.log("nsfw: "+message.channel.nsfw);
        console.log("last_message_id: "+message.channel.last_message_id);
        console.log("bitrate: "+message.channel.bitrate);
        console.log("user_limit: "+message.channel.user_limit);
        console.log("rate_limit_per_user: "+message.channel.rate_limit_per_user);
        console.log("recipients: "+message.channel.recipients);
        console.log("icon: "+message.channel.icon);
        console.log("owner_id: "+message.channel.owner_id);
        console.log("application_id: "+message.channel.application_id);
        console.log("parent_id: "+message.channel.parent_id);
        console.log("last_pin_timestamp: "+message.channel.last_pin_timestamp);
        console.log("=========================================");
        return;
    }

    //(12:34) command
    if((message.member.roles.find(r=>r.name.toLowerCase()==="mod squad")||
            message.member.roles.find(r=>r.name.toLowerCase()==="surrogate team"))){
        var detectColon=(message.content.includes(":"));
        if(detectColon){
            var detectLeft=(message.content.substring((message.content.indexOf(":")-3),(message.content.indexOf(":")-2)));
            var detectRight=(message.content.substring((message.content.indexOf(":")+3),(message.content.indexOf(":")+4)));
        }
        if(detectLeft=="("&&detectRight==")"){
            today=new Date();
            var day=today.getDate();
            var month=today.getMonth()+1;
            var year=today.getFullYear();
            var hours=message.content.substring((message.content.indexOf(":")-2),message.content.indexOf(":"));
            var minutes=message.content.substring(message.content.indexOf(":")+1, message.content.indexOf(":")+3);
            if(minutes>59){
                hours++;
            }
            if(hours>23){
                day++;
            }
            minutes%=60;
            hours%=24;
            if(!(isNaN(minutes)||isNaN(hours))){
                if(hours<10){
                    hours="0"+hours;
                }
                if(minutes<10){
                    minutes="0"+minutes;
                }
                if(day<10){
                    day="0"+day;
                }
                if(month<10){
                    month="0"+month;
                }
                var sendOut="*Beep boop*\nThe time is given in GMT+3 (Finland). See what time that is for you here:\nhttps://www.timeanddate.com/worldclock/fixedtime.html?iso="
                                +year+""+month+""+day+"T"+hours+""+minutes+"&p1=101\n*Beep boop*";
                message.channel.send(sendOut);
                logBotActions(message, "Link")
            }
        }
    }
    if(message.content.substring(0, 1) == '!') {
        var args=message.content.substring(1).split(' ');
        var cmd=args[0].toLowerCase();
        // args=args.splice(1);
        switch(cmd){
            // !ping
            case 'ping':
                if(message.member.user.tag=="Mordecai#3257"){
                    message.channel.send("Pong!");
                }
                break;
            // !time
            case 'time':
                today=new Date();
                var day=today.getDate();
                var month=today.getMonth()+1;
                var year=today.getFullYear();

                var hours=today.getHours()+7;
                var minutes=today.getMinutes();
                var seconds=today.getSeconds();
                if(hours>23){
                    day++;
                    hours%=24;
                }
                if(minutes<10){
                    minutes="0"+minutes;
                }
                if(seconds<10){
                    seconds="0"+seconds;
                }  
                if(day<10){
                    day="0"+day;
                }
                if(month<10){
                    month="0"+month;
                }

                if(hours>=12){
                    var time="0"+(hours%12)+":"+minutes+":"+seconds+" PM";
                    if(hours%12==0){
                        var time=(hours)+":"+minutes+":"+seconds+" PM";
                    }
                }else if(hours==0){
                    var time="12:"+minutes+":"+seconds+" AM";
                }else{
                    if(hours<10){
                        var time="0"+hours+":"+minutes+":"+seconds+" AM";
                    }else{
                        var time=hours+":"+minutes+":"+seconds+" AM";
                    }
                }
                var date=day+"/"+month+"/"+year;
                var timeDate=time+" "+date;
                var sendOut="It is currently **"+timeDate+"** in Finland (Where the games are located)."
                message.channel.send(sendOut);
                logBotActions(message, "!time");
                break;
            // !roll xdy / !roll
            case 'roll':
                if(args[1]!=null&&args[1].includes("d")){
                    var output=0; var i; 
                    if(isNaN(args[1].substring(0, args[1].indexOf("d")))||
                        isNaN(args[1].substring(args[1].indexOf("d")+1))||
                        args[1].substring(0, args[1].indexOf("d")).toLowerCase().includes("e")||
                        args[1].substring(args[1].indexOf("d")+1).toLowerCase().includes("e")||
                        args[1].substring(0, args[1].indexOf("d"))>2000000000||
                        args[1].substring(args[1].indexOf("d")+1)>2000000000){
                        if(message.channel.id!=botSpamID){
                            message.delete();
                            bot.channels.get(botSpamID).send("<@"+message.member.user.id+"> Please use this channel for bot commands!\n\tError: Invalid format");
                        }else{
                            bot.channels.get(botSpamID).send("\tError: Invalid format");
                        }
                        logBotActions(message, "!roll error");
                    }else{
                        for(i=0; i<args[1].substring(0, args[1].indexOf("d")); i++){
                            var roll=Math.floor(Math.random()*args[1].substring(args[1].indexOf("d")+1))+1;
                            output+=roll;
                            if(output>2000000000){
                                if(message.channel.id!=botSpamID){
                                    message.delete();
                                    bot.channels.get(botSpamID).send("<@"+message.member.user.id+"> Please use this channel for bot commands!\nThat was too many roles, try a smaller number!");
                                }else{
                                    bot.channels.get(botSpamID).send("That was too many roles, try a smaller number!");
                                }
                                logBotActions(message, "!roll xdy error");
                                return;
                            }
                        }
                        if(message.channel.id!=botSpamID){
                            message.delete();
                            bot.channels.get(botSpamID).send("<@"+message.member.user.id+"> Please use this channel for bot commands!\nRolling "+args[1]+":\n\tTotal: "+output);
                        }else{
                            bot.channels.get(botSpamID).send("Rolling "+args[1]+":\n\tTotal: "+output);
                        }
                        logBotActions(message, "!roll xdy");
                    }
                }else if(args[1]!=null){
                    if(message.channel.id!=botSpamID){
                        message.delete();
                        bot.channels.get(botSpamID).send("<@"+message.member.user.id+"> Please use this channel for bot commands!\n\tError: Invalid format or too big of a number");
                    }else{
                        bot.channels.get(botSpamID).send("\tError: Invalid format or too big of a number");
                    }
                    logBotActions(message, "!roll error");
                }else{
                    var roll=Math.floor(Math.random()*20)+1;
                    if(message.channel.id!=botSpamID){
                        message.delete();
                        bot.channels.get(botSpamID).send("<@"+message.member.user.id+"> Please use this channel for bot commands!\nRolling 1d20:\n\tTotal: "+roll);
                    }else{
                        bot.channels.get(botSpamID).send("Rolling 1d20:\n\tTotal: "+roll);
                    }
                    logBotActions(message, "!roll");
                }
                break;
            // !getHelp
            case 'gethelp':
                if((message.member.roles.find(r=>r.name.toLowerCase()==="mod squad")||
                        message.member.roles.find(r=>r.name.toLowerCase()==="surrogate team"))){
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
                        .setFooter("These commands are for Mod Squad and Surrogate Team");
                    bot.channels.get(modBotSpamID).send({embed})
                }else{
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
                        .setFooter("These commands are for everyone");
                    bot.channels.get(botSpamID).send({embed})
                }
                message.delete();
                logBotActions(message, "!getHelp");
                break;
            // !game <GAME>
            case 'game':
                if(triggerSumoResponse){
                    message.reply("Here you go!\nhttps://surrogate.tv/game/sumobots");
                    message.delete()
                }else if(triggerRaceResponse){
                    message.reply("Here you go!\nhttps://surrogate.tv/game/racerealcars143");
                    message.delete()
                }else if(triggerPinballResponse){
                    var out="There are multiple games here. Here are the links!\n";
                    out+="https://surrogate.tv/game/batman66\n";
                    out+="https://surrogate.tv/game/oktoberfest\n";
                    message.reply(out);
                    message.delete()
                }else if(triggerClawResponse){
                    var out="There are multiple games here. Here are the links!\n";
                    out+="https://surrogate.tv/game/forceclaw\n";
                    out+="https://surrogate.tv/game/toiletpaperclaw\n";
                    message.reply(out);
                    message.delete()
                }else if(triggerGeneralResponse){
                    var out="Here are all the links to the current games:\n";
                    out+="https://surrogate.tv/game/sumobots\n";
                    out+="https://surrogate.tv/game/racerealcars143\n";
                    out+="https://surrogate.tv/game/batman66\n";
                    out+="https://surrogate.tv/game/oktoberfest\n";
                    // out+="https://surrogate.tv/game/forceclaw\n";
                    // out+="https://surrogate.tv/game/toiletpaperclaw";
                    message.reply(out);
                    message.delete()
                }else{
                    return;
                }
                logBotActions(message, "!game");
                break;
            // !schedule
            case 'schedule':
                var url="https://g9b1fyald3.execute-api.eu-west-1.amazonaws.com/master/games/?shortId=";
                if(triggerSumoResponse||message.content.toLowerCase().includes("sumobots")){
                    url+="sumobots";
                    var command="SumoBots";
                    var image="https://www.surrogate.tv/img/sumo/logo_sumo.png";
                }else if(triggerRaceResponse||message.content.toLowerCase().includes("racerealcars143")){
                    url+="racerealcars143";
                    var command="RaceRealCars143";
                    var image="https://i.imgur.com/XETrUAa.png";
                }else if((triggerClawResponse&&706819836071903275==message.channel.id)||message.content.toLowerCase().includes("forceclaw")){
                    url+="forceclaw";
                    var command="ForceClaw";
                    var image="https://assets.surrogate.tv/game/ca0b4cc3-d25d-463e-b3f6-ecf96427ffe0/3458917638-48hreventforceclaw-01.png";
                }else if((triggerClawResponse&&662301446036783108==message.channel.id)||message.content.toLowerCase().includes("toiletpaperclaw")){
                    url+="toiletpaperclaw";
                    var command="ToiletPaperClaw";
                }else if((triggerPinballResponse&&613630308931207198)||message.content.toLowerCase().includes("batman66")){
                    url+="batman66";
                    var command="Batman66 Pinball";
                    var image="https://www.surrogate.tv/img/pinball/pinball_logo.png";
                }else if((triggerPinballResponse&&702578486199713872)||message.content.toLowerCase().includes("oktoberfest")){
                    url+="oktoberfest";
                    var command="Oktoberfest Pinball";
                    var image="https://www.american-pinball.com/s/i/h/pinslide/oktoberfest/oktoberfest-logo-tap_shadow.png";
                }else{
                    if(message.channel.id!=botSpamID){
                        if((message.member.roles.find(r=>r.name.toLowerCase()==="mod squad")||
                            message.member.roles.find(r=>r.name.toLowerCase()==="surrogate team"))){
                            bot.channels.get(modBotSpamID).send("<@"+message.member.user.id+"> Can't find that game");
                            message.delete();
                        }else{
                            bot.channels.get(botSpamID).send("<@"+message.member.user.id+"> Please use this channel for bot commands!\nCan't find that game. Try a different one.");
                            message.delete();
                        }
                    }else{
                        bot.channels.get(botSpamID).send("<@"+message.member.user.id+"> Can't find that game. Try a different one.");
                    }
                    return;
                }
                var minDay=1440;
                var {list}=fetch(url, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                }).then(response => response.json())
                    .then((x) => {
                        if(x.result.schedule==null){
                            message.channel.send("There is no schedule for "+command+".");
                        }else{
                            var i; var output=""; 
                            x.result.schedule.sort((a,b) => a.startTime - b.startTime)
                            for(i=0; i<x.result.schedule.length; i++){
                                var startTime=x.result.schedule[i].startTime+(3*60);
                                var duration=x.result.schedule[i].duration;
                                var endTime=startTime+duration;
                                var day=Math.floor(startTime/minDay);
                                var startHour=Math.floor((startTime-(day*minDay))/60);
                                var startMinute=startTime-(startHour*60)-(day*minDay);
                                if(startMinute<=0){
                                    startMinute="0"+startMinute;
                                }
                                if(startHour>23){
                                    var addToDay=Math.floor(startHour/24);
                                    startHour%=24;
                                    day+=addToDay;
                                }
                                var endHour=Math.floor((endTime-day*minDay)/60);
                                var endMinute=(startTime+duration)%60;
                                var endDay=day;
                                if(endMinute<=0){
                                    endMinute="0"+endMinute;
                                }
                                if(endHour>23||endHour<=0){
                                    var addToDay=Math.floor(endHour/24);
                                    if(endHour<0){
                                        endHour=0;
                                        addToDay=3;//Don't talk about it
                                    }
                                    endHour%=24;
                                    endDay+=addToDay;
                                }
                                switch(day){
                                    case 0:
                                        output+="Monday:         ";
                                        break;
                                    case 1:
                                        output+="Tuesday:         ";
                                        break;
                                    case 2:
                                        output+="Wednesday:  ";
                                        break;
                                    case 3:
                                        output+="Thursday:       ";
                                        break;
                                    case 4:
                                        output+="Friday:             ";
                                        break;
                                    case 5:
                                        output+="Saturday:        ";
                                        break;
                                    case 6:
                                        output+="Sunday:           ";
                                        break;
                                    default:
                                        break;
                                }
                                if(startHour>=12){
                                    if(startHour%12<10&&startHour!=12){
                                        output+="0"+(startHour%12)+":"+startMinute+" PM - ";
                                    }else if(startHour==12){
                                        output+=(startHour)+":"+startMinute+" PM - ";
                                    }else{
                                        output+=(startHour%12)+":"+startMinute+" PM - ";
                                    }
                                }else if(startHour==0){
                                    output+="12:"+startMinute+" AM - ";
                                }else{
                                    if(startHour<10){
                                        output+="0"+startHour+":"+startMinute+" AM - ";
                                    }else{
                                        output+=startHour+":"+startMinute+" AM - ";
                                    }
                                }
                                switch(endDay){
                                    case 0:
                                        output+="Monday:         ";
                                        break;
                                    case 1:
                                        output+="Tuesday:         ";
                                        break;
                                    case 2:
                                        output+="Wednesday:  ";
                                        break;
                                    case 3:
                                        output+="Thursday:       ";
                                        break;
                                    case 4:
                                        output+="Friday:             ";
                                        break;
                                    case 5:
                                        output+="Saturday:        ";
                                        break;
                                    case 6:
                                        output+="Sunday:           ";
                                        break;
                                    default:
                                        output+="Monday:         ";
                                        break;
                                }
                                if(endHour>=12){
                                    if(endHour%12<10&&endHour!=12){
                                        output+="0"+(endHour%12)+":"+endMinute+" PM\n";
                                    }else if(endHour==12){
                                        output+=(endHour)+":"+endMinute+" PM\n";
                                    }else{
                                        output+=(endHour%12)+":"+endMinute+" PM\n";
                                    }
                                }else if(endHour==0){
                                    output+="12:"+endMinute+" AM\n";
                                }else{
                                    if(endHour<10){
                                        output+="0"+endHour+":"+endMinute+" AM\n";
                                    }else{
                                        output+=endHour+":"+endMinute+" AM\n";
                                    }
                                }
                            }
                            var title="Schedule for **"+command+"**"

                            // output="Here is the schedule (Finland time GMT+3) for **"+command+"** this week!\n"+output;
                            // output+="Link to **"+command+"** can be found here!\nhttps://surrogate.tv/game/";
                            command=command.split(' ');
                            command=command.splice(0);
                            // output+=command[0].toLowerCase();
                            if((message.member.roles.find(r=>r.name.toLowerCase()==="mod squad")||
                                message.member.roles.find(r=>r.name.toLowerCase()==="surrogate team"))){
                                message.delete();

                                const embed = new Discord.RichEmbed()
                                  .setTitle("__"+title+"__")
                                  .setColor(0x220e41)
                                  .setURL("https://surrogate.tv/game/"+command)
                                  .setDescription(output)
                                  .setThumbnail(image)
                                  .setFooter("The Office and most of the games are located in Finland so times are in GMT+3 timezone.");

                                message.channel.send({embed});
                            }else{
                                if(message.channel.id!=botSpamID){
                                    message.delete();

                                    const embed = new Discord.RichEmbed()
                                      .setTitle("__"+title+"__")
                                      .setColor(0x220e41)
                                      .setURL("https://surrogate.tv/game/"+command)
                                      .setDescription(output)
                                      .setThumbnail(image)
                                      .setFooter("The Office and most of the games are located in Finland so times are in GMT+3 timezone.");

                                    bot.channels.get(botSpamID).send({embed});

                                }else{

                                    const embed = new Discord.RichEmbed()
                                      .setTitle("__"+title+"__")
                                      .setColor(0x220e41)
                                      .setURL("https://surrogate.tv/game/"+command)
                                      .setDescription(output)
                                      .setThumbnail(image)
                                      .setFooter("The Office and most of the games are located in Finland so times are in GMT+3 timezone.");
                                    
                                    bot.channels.get(botSpamID).send({embed});
                                }
                            }
                        }
                    });
                logBotActions(message, "!schedule");
                break;
            // !mute <USER> <TIME>
            case 'mute':
                if((message.member.roles.find(r=>r.name.toLowerCase()==="mod squad")||
                        message.member.roles.find(r=>r.name.toLowerCase()==="surrogate team")&&
                    args[1]!=null&&args[2]!=null)){
                    let toMute=message.guild.member(message.mentions.users.first());
                    let role = message.guild.roles.find(r => r.name === "muted");
                    if(!toMute){
                        bot.channels.get(modBotSpamID).send(`Couldn't find user.`);
                        return;
                    }
                    if(toMute.hasPermission("MANAGE_MESSAGES")){
                        bot.channels.get(modBotSpamID).send(`Can't mute that user`);
                        return;
                    }
                    let mutetime = args[2];
                    if(!mutetime){
                        bot.channels.get(modBotSpamID).send(`You need to specify a time (3s/3d/3h/3y)`);
                        return;
                    }
                    // await(toMute.addRole(role.id));
                    toMute.addRole(role.id);
                    bot.channels.get(modBotSpamID).send(`<@${toMute.id}> has been muted for ${ms(ms(mutetime))} by <@${message.member.user.id}>`);
                    var date=new Date();
                    var day=date.getDate();
                    var month=date.getMonth()+1;
                    var year=date.getFullYear();
                    var minute=date.getMinutes();
                    var hour=date.getHours();
                    var startMute=month+"/"+day+"/"+year+"~"+hour+":"+minute;
                    minute+=(ms(mutetime)/60000);
                    hour+=Math.floor(minute/60);
                    minute%=60;
                    day+=Math.floor(hour/24);
                    hour%=24;
                    var endMute=month+"/"+day+"/"+year+"~"+hour+":"+minute+"\n";
                    var updated=false;
                    fs.readFile("./database/mute.dat", 'ascii', function (err, file) {
                        if (err) throw err;
                        var testData=file.toString().split("\n");
                        var toRemove=-1;
                        var i;
                        for(i=0; i<testData.length; i++){
                            if(testData[i].includes(toMute.id)){
                                toRemove=i;
                                updated=true;
                                break;
                            }
                        }
                        if(toRemove!=-1){

                            var removeUserData=testData[toRemove];
                            var reinsert="";
                            var j;
                            for(j=0; j<testData.length; j++){
                                if(toRemove==j||testData[j]=="\n"){
                                }else if(j==testData.length-1){
                                    reinsert+=testData[j];
                                }else{
                                    reinsert+=testData[j]+"\n";
                                }
                            }
                            fs.writeFile("./database/mute.dat", reinsert, (err)=>{
                                if(err) throw err;
                            });
                            fs.appendFile("./database/mute.dat", endMute, (err)=>{
                                if(err) throw err;
                            });
                        }
                    });
                    if(!updated){
                        endMute=toMute.id+"|"+endMute;
                        fs.appendFile("./database/mute.dat", endMute, (err)=>{
                            if(err) throw err;
                        });
                    }
                    logBotActions(message, "!mute "+toMute.user.tag+" "+ms(ms(mutetime)));
                }
                break;
            // !unmute <USER>
            case "unmute":
                if((message.member.roles.find(r=>r.name.toLowerCase()==="mod squad")||
                        message.member.roles.find(r=>r.name.toLowerCase()==="surrogate team")&&
                    args[1]!=null)){
                    let toUnmute=message.guild.member(message.mentions.users.first()||message.guild.members.get(args[0]));
                    let role = message.guild.roles.find(r=>r.name==="muted");
                    if(!toUnmute){
                        bot.channels.get(modBotSpamID).send("Couldn't find user.");
                        return;
                    }else if(!toUnmute.roles.find(r=>r.name.toLowerCase()==="muted")){
                        bot.channels.get(modBotSpamID).send(`<@${toUnmute} is not muted.`);
                        return;
                    }

                    await(toUnmute.addRole(role.id));
                    toUnmute.removeRole(role.id);
                    bot.channels.get(modBotSpamID).send(`<@${toUnmute.id}> has been unmuted by <@${message.member.user.id}>`);
                    logBotActions(message, "!unmute "+toUnmute.user.tag);

                    fs.readFile("./database/mute.dat", 'ascii', function (err, file) {
                        if (err) throw err;

                        var testData=file.toString().split("\n");
                        var toRemove=-1;
                        var i;
                        for(i=0; i<testData.length; i++){
                            if(testData[i].includes(toUnmute.id)){
                                toRemove=i;
                                break;
                            }
                        }
                        var removeUserData=testData[i];
                        var reinsert="";
                        var i;
                        for(i=0; i<testData.length; i++){
                            if(toRemove==i||testData[i]==="\n"){

                            }else{
                                reinsert+=testData[i]+"\n";
                            }
                        }
                        fs.writeFile("./database/mute.dat", reinsert, (err) => {
                            if (err) throw err;
                        });
                    });
                }
                break;
            // !top <GAME> month(?)
            case "top":
                var url="https://g9b1fyald3.execute-api.eu-west-1.amazonaws.com/master/scores?gameId=";
                var scoreType="All Time";
                var title=" Current Scores";
                if(triggerSumoResponse||message.content.toLowerCase().includes("sumobots")){
                    url+="99ca6347-0e10-4465-8fe1-9fee8bc5fb35&order=";
                    var command="SumoBots";
                    if(args[2]!=null&&args[2]==="m"){
                        if(message.channel.id!=botSpamID){
                            if((message.member.roles.find(r=>r.name.toLowerCase()==="mod squad")||
                                message.member.roles.find(r=>r.name.toLowerCase()==="surrogate team"))){
                                bot.channels.get(modBotSpamID).send("<@"+message.member.user.id+"> There are no monthly scores for "+command);
                                message.delete();
                            }else{
                                bot.channels.get(botSpamID).send("<@"+message.member.user.id+"> Please use this channel for bot commands!\nThere are no monthly scores for "+command);
                                message.delete();
                            }
                        }else{
                            message.channel.send("<@"+message.member.user.id+"> There are no monthly scores for "+command);
                        }
                        return;
                    }
                    var image="https://www.surrogate.tv/img/sumo/logo_sumo.png";
                }else if(triggerRaceResponse||message.content.toLowerCase().includes("racerealcars143")){
                    url+="953f2154-9a6e-4602-99c6-265408da6310&order=";
                    var command="RaceRealCars143";
                    if(args[2]!=null&&args[2]==="m"){
                        url+="month";
                        scoreType="Monthly";
                        title=" Current Scores of the Month";
                    }
                    var image="https://i.imgur.com/XETrUAa.png";
                }else if((triggerClawResponse&&706819836071903275==message.channel.id)||message.content.toLowerCase().includes("forceclaw")){
                    url+="ca0b4cc3-d25d-463e-b3f6-ecf96427ffe0&order=";
                    var command="ForceClaw";
                    if(args[2]!=null&&args[2]==="m"){
                        if(message.channel.id!=botSpamID){
                            if((message.member.roles.find(r=>r.name.toLowerCase()==="mod squad")||
                                message.member.roles.find(r=>r.name.toLowerCase()==="surrogate team"))){
                                bot.channels.get(modBotSpamID).send("<@"+message.member.user.id+"> There are no monthly scores for "+command);
                                message.delete();
                            }else{
                                bot.channels.get(botSpamID).send("<@"+message.member.user.id+"> Please use this channel for bot commands!\nThere are no monthly scores for "+command);
                                message.delete();
                            }
                        }else{
                            message.channel.send("<@"+message.member.user.id+"> There are no monthly scores for "+command);
                        }
                        return;
                    }
                    var image="https://assets.surrogate.tv/game/ca0b4cc3-d25d-463e-b3f6-ecf96427ffe0/3458917638-48hreventforceclaw-01.png"; 
                }else if((triggerClawResponse&&662301446036783108==message.channel.id)||message.content.toLowerCase().includes("toiletpaperclaw")){
                    url+="46db6268-bfc3-43ff-ba7d-02ffaf1f2867&order=";
                    var command="ToiletPaperClaw";
                    if(args[2]!=null&&args[2]==="m"){
                        if(message.channel.id!=botSpamID){
                            if((message.member.roles.find(r=>r.name.toLowerCase()==="mod squad")||
                                message.member.roles.find(r=>r.name.toLowerCase()==="surrogate team"))){
                                bot.channels.get(modBotSpamID).send("<@"+message.member.user.id+"> There are no monthly scores for "+command);
                                message.delete();
                            }else{
                                bot.channels.get(botSpamID).send("<@"+message.member.user.id+"> Please use this channel for bot commands!\nThere are no monthly scores for "+command);
                                message.delete();
                            }
                        }else{
                            message.channel.send("<@"+message.member.user.id+"> There are no monthly scores for "+command);
                        }
                        return;
                    }
                }else if((triggerPinballResponse&&702578486199713872==message.channel.id)||message.content.toLowerCase().includes("oktoberfest")){
                    //IMPLEMENT TAKING FROM GOOGLE FORM 
                    message.delete();
                    var today=new Date();
                    var checkMonth=today.getMonth()+1;
                    if(checkMonth==7||checkMonth==8){
                        fetch("https://docs.google.com/spreadsheets/d/e/2PACX-1vRe979Ap0TpmdEDtPhZ7nwT9bkelIKUzFHf9ed6HiPBf5ZM09nNOAIjxAK1rztDqBffR8Gc6FTecoaA/pub?gid=1385749731&single=true&output=csv", {
                            method: 'GET',
                        }).then(x => x.text())
                            .then(x => {
                                var date=new Date();
                                var day=date.getDate();
                                var month=date.getMonth()+1;
                                var insert=day+"/"+month;
                                console.log(x);
                                let v = x.split(/\n/).map(a => a.split(","));
                                while(v.length>10){
                                    v.pop();
                                }
                                let sym = ["1) ","2) ","3) ","4) ","5) ","6) ","7) ","8) ","9) ","10) "];
                                var scores = "";
                                v.forEach((a,i) => {scores += "" + sym[i] + " **__" + a[0] + "__**\t" + a[1] + "\n"});

                                var title="__**Oktoberfest** Current Scores__";
                                var description="Here are the Top 10 **Oktoberfest Launch Tournament** players as of "+insert;
                                var footer="Note: Some new top 10 scores may not be verified yet and will not appear here.";
                                var image="https://www.american-pinball.com/s/i/h/pinslide/oktoberfest/oktoberfest-logo-tap_shadow.png";
                                const embed = new Discord.RichEmbed()
                                  .setTitle("__"+title+"__")
                                  .setColor(0x220e41)
                                  .setURL("http://proco.me/oktoberfest/")
                                  .addField(description , scores)
                                  .setThumbnail(image)
                                  .setFooter(footer);

                                bot.channels.get("702578486199713872").send({embed});
                            });
                    }
                    logBotActions(message, "!top oktoberfest");
                    return;
                }else if((triggerPinballResponse&&613630308931207198==message.channel.id)||message.content.toLowerCase().includes("batman66")){
                    url+="592ac917-14d2-481a-9d37-3b840ad46b19&order=";
                    var command="Batman66 Pinball";
                    if(args[2]!=null&&args[2]==="m"){
                        url+="month";
                        scoreType="Monthly";
                        title=" Current Scores of the Month";
                    }
                    var image="https://www.surrogate.tv/img/pinball/pinball_logo.png";
                }else{
                    if(message.channel.id!=botSpamID){
                        if((message.member.roles.find(r=>r.name.toLowerCase()==="mod squad")||
                            message.member.roles.find(r=>r.name.toLowerCase()==="surrogate team"))){
                            bot.channels.get(modBotSpamID).send("<@"+message.member.user.id+"> Can't find that game.");
                            message.delete();
                        }else{
                            bot.channels.get(botSpamID).send("<@"+message.member.user.id+"> Please use this channel for bot commands!\nCan't find that game.");
                            message.delete();
                        }
                    }else{
                        message.channel.send("<@"+message.member.user.id+"> Can't find that game.");
                    }
                    return;
                }
                title="**"+command+"**"+title;
                var minDay=1440;
                var {list}=fetch(url, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                }).then(response => response.json())
                    .then((x) => {
                        if(x==null||x.result==null||x.result.Items==null){
                            message.channel.send("There were no scores for "+command+".");
                        }else{
                            if(x.result.Items.length>10){
                                var description="These are the Top 10 scores for **"+command+"**";
                            }else{
                                var description="These are the Top "+x.result.Items.length+" scores for **"+command+"**";
                            }
                            var i; var scores="";
                            for(i=0; i<x.result.Items.length&&i<10; i++){
                                if(x.result.Items[i].userObject.userIcon!=null){
                                    var icon=x.result.Items[i].userObject.userIcon.toLowerCase();
                                    switch(icon){
                                        case "broomsquad":
                                            icon=bot.emojis.get("700736528803954769").toString();
                                            break;
                                        case "moderator":
                                            icon=bot.emojis.get("700736529043161139").toString();
                                            break;
                                        case "patreonsupporter":
                                            icon=bot.emojis.get("700736949631188993").toString();
                                            break;
                                        case "surrogateteam":
                                            icon=bot.emojis.get("700737595734491237").toString();
                                            break;
                                        case "alphatester":
                                            icon=bot.emojis.get("700736528967532564").toString();
                                            break;
                                    }
                                    scores+=(i+1)+") "+icon+" **__"+x.result.Items[i].userObject.username+"__**:    "+x.result.Items[i].points;
                                }else{
                                    scores+=(i+1)+") **__"+x.result.Items[i].userObject.username+"__**:    "+x.result.Items[i].points;
                                }
                                if(i+1!=x.result.Items.length && i+1!=10){
                                    scores+="\n"
                                }
                            }

                            if((message.member.roles.find(r=>r.name.toLowerCase()==="mod squad")||
                                    message.member.roles.find(r=>r.name.toLowerCase()==="surrogate team"))){
                                message.delete();

                                const embed = new Discord.RichEmbed()
                                  .setTitle("__"+title+"__")
                                  .setColor(0x220e41)
                                  .setThumbnail(image)
                                  .addField( description , scores);

                                message.channel.send({embed});
                            }else{
                                if(message.channel.id!=botSpamID){
                                    message.delete();
                                    const embed = new Discord.RichEmbed()
                                      .setTitle("__"+title+"__")
                                      .setColor(0x220e41)
                                      .setThumbnail(image)
                                      .addField( description , scores)
                                      .setFooter("<@"+message.member.user.id+"> Please use this channel for bot commands!");

                                    bot.channels.get(botSpamID).send({embed});
                                }else{
                                    const embed = new Discord.RichEmbed()
                                      .setTitle("__"+title+"__")
                                      .setColor(0x220e41)
                                      .setThumbnail(image)
                                      .addField( description , scores);

                                    message.channel.send({embed});
                                }
                            }
                        }
                    });
                logBotActions(message, "!top "+command);
                break;
            // !meme
            case "meme":
                var out="If you want there to be a `!meme` command, here is what you need to do.\n\t";
                out+="1) Find a safe for work meme API.\n\t";
                out+="2) Make sure it has a random reature or a way to get a random meme.\n\t";
                out+="3) Make sure it gives usable data and has documentation on how that data is formatted (if it doesn't exist, make it yourself)\n\t";
                out+="4) Ping me with the API and how the data is formatted.\n\t";
                out+="5) I will then check to validate the API and data format and if it works, I will implement it. If it doesn't, I will say so.\n";
                out+="Until someone does these steps, I will not go about implementing a `!meme` command.";
                if(message.channel.id!=botSpamID){
                    message.delete();
                    bot.channels.get(botSpamID).send("<@"+message.member.user.id+"> Please use this channel for bot commands!\n"+out);
                }else{
                    bot.channels.get(botSpamID).send(out);
                }
                logBotActions(message, "!meme info");
                break;
            // !name
            case "name":
                var alliance=bot.emojis.get("713862601687433236").toString(); //Chad
                var heretics=bot.emojis.get("713862601846554795").toString(); //Hercules
                var mouse=bot.emojis.get("713862041064177735").toString();    //Jerry
                var excel=bot.emojis.get("713862601175728218").toString();    //Kyle
                var ence=bot.emojis.get("713862224271114361").toString();     //Dug
                var empire=bot.emojis.get("713862601779707924").toString();   //Mike
                var title="__The names of the bots given by the Broom Gods__";
                var description=alliance+"\tChad\n"+empire+"\tMike\n"+mouse+"\tJerry\n"+ence+"\tDug\n"+heretics+"\tHercules\n"+excel+"\tKyle";
                if(triggerSumoResponse){
                    message.delete();
                    const embed = new Discord.RichEmbed()
                      .setTitle("__"+title+"__")
                      .setColor(0x220e41)
                      .setDescription(description);

                    message.channel.send({embed});
                }else if(message.channel.id!=botSpamID){
                    const embed = new Discord.RichEmbed()
                      .setTitle("__"+title+"__")
                      .setColor(0x220e41)
                      .setDescription(description)
                      .setFooter("<@"+message.member.user.id+"> Please use this channel for that command!");

                    bot.channels.get(botSpamID).send({embed});
                }else{
                    const embed = new Discord.RichEmbed()
                      .setTitle("__"+title+"__")
                      .setColor(0x220e41)
                      .setDescription(description);

                    message.channel.send({embed});
                }
                logBotActions(message, "!name");
            default:
                break;
        }
        return;
    }
    detection(message, triggerPinballResponse, triggerClawResponse, triggerRaceResponse, triggerSumoResponse, triggerGeneralResponse, triggerSneakResponse, triggerArcadeResponse);
});

function detection(message, triggerPinballResponse, triggerClawResponse, triggerRaceResponse, triggerSumoResponse, triggerGeneralResponse, triggerSneakResponse, triggerArcadeResponse){
    //"Refill the machine" for Claw
    if(triggerClawResponse&&
        ((message.content.toLowerCase().includes("filled")||
            message.content.toLowerCase().includes("refill")||
            message.content.toLowerCase().includes("restock"))&&
            !message.content.includes("www."))&&
        !((message.member.roles.find(r=>r.name.toLowerCase()==="mod squad")||
            message.member.roles.find(r=>r.name.toLowerCase()==="surrogate team"||
            message.member.roles.find(r=>r.name.toLowerCase()==="alpha testers"))))){
        today=new Date();
        var day=today.getDate();
        var month=today.getMonth()+1;
        var year=today.getFullYear();
        var hours=today.getHours()+7;
        var minutes=today.getMinutes();
        var seconds=today.getSeconds();
        if(hours>23){
            day++;
            hours%=24;
        }
        if(minutes<10){
            minutes="0"+minutes;
        }
        if(seconds<10){
            seconds="0"+seconds;
        }  
        if(day<10){
            day="0"+day;
        }
        if(month<10){
            month="0"+month;
        }
        if(hours>=12){
            if(hours%12<10&&hours!=12){
                var time="0"+(hours%12)+":"+minutes+":"+seconds+" PM";
            }else if(hours==12){
                output+=(hours)+":"+minutes+" PM - ";
            }else{
                var time=(hours%12)+":"+minutes+":"+seconds+" PM";
            }
        }else if(hours==0){
            var time="12:"+minutes+":"+seconds+" AM";
        }else{
            if(hours<10){
                var time="0"+hours+":"+minutes+":"+seconds+" AM";
            }else{
                var time=hours+":"+minutes+":"+seconds+" AM";
            }
        }
        var date=day+"/"+month+"/"+year;
        var timeDate=time+" on "+date;
        if(hours>=20||hours<8){
            var sendOut="*Beep boop*\nIt is currently **"+timeDate+"** in Finland (Where the games are located).\n";
            var out1=sendOut+"Between **8:00 PM and 8:00 AM** means it is likely that no one is in the office.\n";
            var out2=out1+"*Beep boop*";
            message.channel.send(out2);
            logBotActions(message, "Detected \"refill\" claw");
        }
        return;
    }

    //"How do I play" for Sumo
    if(triggerSumoResponse&&
        message.content.toLowerCase().includes("how")&&
        message.content.toLowerCase().includes("play")&&
        !((message.member.roles.find(r=>r.name.toLowerCase()==="mod squad")||
            message.member.roles.find(r=>r.name.toLowerCase()==="surrogate team"||
            message.member.roles.find(r=>r.name.toLowerCase()==="alpha testers")||
            message.member.roles.find(r=>r.name.toLowerCase()==="patreon suppporter")||
            message.member.roles.find(r=>r.name.toLowerCase()==="verified players")||
            message.member.roles.find(r=>r.name.toLowerCase()==="broom squad"))))){
        var out="*(Robot Ninja Auto Help)*\n";
        out+="**How to play SumoBots:**\n\t";
        out+="1. Join the queue by clicking the \"Click Here to Play Next\" button in the top right corner.\n\t";
        out+="2. When your game starts use [WASD] or the arrow keys to drive around.\n\t";
        out+="3. Knock others into the holes of the arena and be the last one standing.";
        message.channel.send(out);
        logBotActions(message, "Detected \"how to play\" Sumo");
        return;
    }

    //"How do I play" for RealRacing
    if(triggerRaceResponse&&
        message.content.toLowerCase().includes("how")&&
        message.content.toLowerCase().includes("play")&&
        !((message.member.roles.find(r=>r.name.toLowerCase()==="mod squad")||
            message.member.roles.find(r=>r.name.toLowerCase()==="surrogate team"||
            message.member.roles.find(r=>r.name.toLowerCase()==="alpha testers")||
            message.member.roles.find(r=>r.name.toLowerCase()==="patreon suppporter")||
            message.member.roles.find(r=>r.name.toLowerCase()==="verified players")||
            message.member.roles.find(r=>r.name.toLowerCase()==="broom squad"))))){
        var out="*(Robot Ninja Auto Help)*\n";
        out+="**How to play RRC:**\n\t";
        out+="1. Join the queue by clicking the \"Click Here to Play Next\" button in the top right corner.\n\t";
        out+="2. When your game starts use [WASD] or the arrow keys to drive around.\n\t";
        out+="3. Drive to the start / finish line during the warm up phase.\n\t";
        out+="4. After the race starts, complete 4 laps to finish the race.";
        message.channel.send(out);
        logBotActions(message, "Detected \"how to play\" RealRacing");
        return;
    }

    //"How do I play" for Pinball
    if(triggerPinballResponse&&
        message.content.toLowerCase().includes("how")&&
        (message.content.toLowerCase().includes("play")&&
            !message.content.toLowerCase("player"))&&
        !((message.member.roles.find(r=>r.name.toLowerCase()==="mod squad")||
            message.member.roles.find(r=>r.name.toLowerCase()==="surrogate team"||
            message.member.roles.find(r=>r.name.toLowerCase()==="alpha testers")||
            message.member.roles.find(r=>r.name.toLowerCase()==="patreon suppporter")||
            message.member.roles.find(r=>r.name.toLowerCase()==="verified players")||
            message.member.roles.find(r=>r.name.toLowerCase()==="broom squad"))))){
        var out="*(Robot Ninja Auto Help)*\n";
        out+="**How to play RRC:**\n\t";
        out+="1. Join the queue by clicking the \"Click Here to Play Next\" button in the top right corner.\n\t";
        out+="2. When your game starts use the left and right [CTRL] buttons to use the flippers and use [SPACEBAR] to launch the ball. ";
        out+="You have 3 balls per game with the players taking turns.";
        message.channel.send(out);
        logBotActions(message, "Detected \"how to play\" Pinball");
        return;
    }
    //"Ball stuck" for Pinball
    if(triggerPinballResponse&&
        !message.channel.id=="702578486199713872"&&
        message.content.toLowerCase().includes("ball")&&
        message.content.toLowerCase().includes("stuck")&&
        !((message.member.roles.find(r=>r.name.toLowerCase()==="mod squad")||
            message.member.roles.find(r=>r.name.toLowerCase()==="surrogate team"||
            message.member.roles.find(r=>r.name.toLowerCase()==="alpha testers")||
            message.member.roles.find(r=>r.name.toLowerCase()==="patreon suppporter")||
            message.member.roles.find(r=>r.name.toLowerCase()==="verified players")||
            message.member.roles.find(r=>r.name.toLowerCase()==="broom squad"))))){
        var out="*(Robot Ninja Auto Help)*\n";
        out+="**What if a ball gets stuck:**\n\t";
        out+="If a ball gets stuck somewhere, for example inside the Turntable, ";
        out+="the machine tries to free it by firing all coils. ";
        out+="Be ready to catch your ball when it returns! ";
        out+="If the machine can’t find the ball after two tries, ";
        out+="it will say “Missing Pinball” and the next player continues.";
        message.channel.send(out);
        logBotActions(message, "Detected \"ball stuck\" Pinball");
        return;
    }
    //"Why AFK check" Pinball
    if(triggerPinballResponse&&
        message.content.toLowerCase().includes("afk")&&
        !((message.member.roles.find(r=>r.name.toLowerCase()==="mod squad")||
            message.member.roles.find(r=>r.name.toLowerCase()==="surrogate team"||
            message.member.roles.find(r=>r.name.toLowerCase()==="alpha testers")||
            message.member.roles.find(r=>r.name.toLowerCase()==="patreon suppporter")||
            message.member.roles.find(r=>r.name.toLowerCase()==="verified players")||
            message.member.roles.find(r=>r.name.toLowerCase()==="broom squad"))))){
        var out="*(Robot Ninja Auto Help)*\n";
        out+="**Why is there an AFK check:**\n\t";
        out+="The AFK check was added because after a popular post we had 30 players in the queue, ";
        out+="but many weren’t playing when it was their turn because of the long wait times. ";
        out+="The AFK check ensures that only players who are ready to play are put in the game.";
        message.channel.send(out);
        logBotActions(message, "Detected \"AFK check\" Pinball");
        return;
    }
    //"Two balls" Pinball
    if(triggerPinballResponse&&
        !message.channel.id=="702578486199713872"&&
        message.content.toLowerCase().includes("two")&&
        message.content.toLowerCase().includes("ball")&&
        !message.content.toLowerCase().includes("flipper")&&
        !((message.member.roles.find(r=>r.name.toLowerCase()==="mod squad")||
            message.member.roles.find(r=>r.name.toLowerCase()==="surrogate team"||
            message.member.roles.find(r=>r.name.toLowerCase()==="alpha testers")||
            message.member.roles.find(r=>r.name.toLowerCase()==="patreon suppporter")||
            message.member.roles.find(r=>r.name.toLowerCase()==="verified players")||
            message.member.roles.find(r=>r.name.toLowerCase()==="broom squad"))))){
        var out="*(Robot Ninja Auto Help)*\n";
        out+="**Why are two balls launched:**\n\t";
        out+="For some unknown reason and very rarely, the machine launches two balls. ";
        out+="Sometimes it will fix itself if one of the balls drains during ball save. ";
        out+="Sometimes it will be fixed for the next player. And in the worst case, it will last the whole game. ";
        out+="There is nothing we can do about it. Just play another game afterwards.";
        message.channel.send(out);
        logBotActions(message, "Detected \"two balls\" Pinball");
        return;
    }

    //"How do I queue up" for all
    if(message.content.toLowerCase().includes("how")&&
        message.content.toLowerCase().includes("queue")&&
        (message.content.toLowerCase().includes("join")||
            message.content.toLowerCase().includes("up"))&&
        !((message.member.roles.find(r=>r.name.toLowerCase()==="mod squad")||
            message.member.roles.find(r=>r.name.toLowerCase()==="surrogate team"||
            message.member.roles.find(r=>r.name.toLowerCase()==="alpha testers")||
            message.member.roles.find(r=>r.name.toLowerCase()==="patreon suppporter")||
            message.member.roles.find(r=>r.name.toLowerCase()==="verified players")||
            message.member.roles.find(r=>r.name.toLowerCase()==="broom squad"))))){
        var out="*(Robot Ninja Auto Help)*\n";
        out+="**How to join the queue in SumoBots:**\n\t";
        out+="Join the queue by clicking the \"Click Here to Play Next\" button in the top right corner. ";
        out+="You can leave the queue (only before the game starts) by clicking on the ";
        out+="[X] button in the same location.";
        message.channel.send(out);
        logBotActions(message, "Detected \"how to queue\"");
        return;
    }
    //"How do I leave queue" for all
    if(message.content.toLowerCase().includes("how")&&
        message.content.toLowerCase().includes("queue")&&
        message.content.toLowerCase().includes("leave")&&
        !((message.member.roles.find(r=>r.name.toLowerCase()==="mod squad")||
            message.member.roles.find(r=>r.name.toLowerCase()==="surrogate team"||
            message.member.roles.find(r=>r.name.toLowerCase()==="alpha testers")||
            message.member.roles.find(r=>r.name.toLowerCase()==="patreon suppporter")||
            message.member.roles.find(r=>r.name.toLowerCase()==="verified players")||
            message.member.roles.find(r=>r.name.toLowerCase()==="broom squad"))))){
        var out="*(Robot Ninja Auto Help)*\n";
        out+="**How to leave the queue in SumoBots:**\n\t";
        out+="You can leave the queue (only before the game starts) by clicking on the [X] button in the queue ";
        out+="info above the chat. If you leave the queue during the game then your game will just end.";
        message.channel.send(out);
        logBotActions(message, "Detected \"how to leave queue\"");
        return;
    }

    if(message.content.toLowerCase().includes(':emergencybutton:')){
        message.react('🇴')
            .then(() => message.react('🇭'))
            .then(() => message.react('🇳'))
            .then(() => message.react('🅾'))
            .catch(() => console.error('One of the emojis failed to react.'));
        logBotActions(message, "Reacted");
        return;
    }
}