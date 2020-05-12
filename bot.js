require('dotenv').config();
const Discord=require('discord.js');
const fetch=require('node-fetch');
const querystring=require('querystring');
const ms=require("ms");
const fs = require('fs');
const bot=new Discord.Client();
const TOKEN=process.env.TOKEN;
bot.login(TOKEN);

var clawTrigger=[617010087457718272, 706819836071903275, 616642431219400735, 662301446036783108, 707600524727418900];
var pinballTrigger=[617010087457718272, 613630308931207198, 616642431219400735, 707600524727418900];
var arcadeTrigger=[617010087457718272, 706819836071903275, 613630308931207198, 616642431219400735, 662301446036783108, 707600524727418900];
var raceTrigger=[631131278644740125, 589484542214012963, 631131301302239242, 707600524727418900];
var sumoTrigger=[650048288787005451, 627919045420646401, 650048505380864040, 707600524727418900];
var generalTrigger=[586955337870082082, 589485632984973332, 571600581936939049, 571388780058247185, 631391110966804510, 571390705117954049, 707600524727418900];
var sneakTrigger=[702578486199713872, 631134966163701761, 662642212789551124, 621355376167747594, 707600524727418900];

var testChannelID="707600524727418900";
var surrogateChannelID="0";

//Game Announcements 
async function announcement(game, image, numImage, channel){
    while(true){
        var date=new Date();
        var weekdays=new Array(
            "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
        );
        var day=date.getDay();
        var rand=Math.floor(Math.random()*numImage)+1;
        const minDay=1440;
        var rightDay=false;
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
                    var i; var output=""; 
                    for(i=0; i<x.result.schedule.length; i++){
                        var startTime=x.result.schedule[i].startTime+(3*60);
                        var duration=x.result.schedule[i].duration;
                        var scheduleDay=Math.floor(startTime/minDay);
                        var scheduleHour=Math.floor((startTime-(scheduleDay*minDay))/60);
                        var scheduleMinute=startTime-(scheduleHour*60)-(scheduleDay*minDay);
                        if(scheduleHour>23){
                            var addToDay=Math.floor(scheduleHour/24);
                            scheduleHour%=24;
                            scheduleDay+=addToDay;
                        }
                        if(scheduleDay==((day-1)+7)%7){
                            rightDay=true;
                            break;
                        }
                    }
                    date=new Date();
                    var curHour=(date.getHours()+8)%24;
                    var curMinute=date.getMinutes();
                    if(rightDay&&scheduleHour!=null&&curHour==scheduleHour&&curMinute==(scheduleMinute-15+60)%60){
                        var out="@here **"+game+"** goes live in 15 minutes! You can play here:\nhttps://surrogate.tv/game/"+game.toLowerCase()+"\n";
                        bot.channels.get(channel).send(out, {
                          files: [{
                            attachment: './gifs/'+image+'/'+image+'_'+rand+'.gif',
                            name: image+'.gif'
                          }]
                        });
                        logBotActions(null, game+" Pre-Announcement");
                    }else if(rightDay&&x.result.isOnline&&scheduleHour!=null&&curHour==scheduleHour+1&&curMinute==scheduleMinute){
                        var out="@here **"+game+"** is live and you can start to queue up! You can play here:\nhttps://surrogate.tv/game/"+game.toLowerCase()+"\n";
                        bot.channels.get(channel).send(out, {
                          files: [{
                            attachment: './gifs/'+image+'/'+image+'_'+rand+'.gif',
                            name: image+'.gif'
                          }]
                        });
                        logBotActions(null, game+" Announcement");
                    }else if(rightDay&&scheduleHour!=null&&curHour==scheduleHour&&curMinute==scheduleMinute){
                        logBotActions(null, game+" Announcement happening soon");
                    }
                }
            });
        await Sleep(ms("1m")) //1 minute
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
    }else{
        var out=hours+":"+minutes+":"+seconds+" EST | "+message.member.user.tag+" | "+action;
        console.log(hours+":"+minutes+":"+seconds+" EST | "+message.member.user.tag+" | "+action);
        fs.appendFile("./bot_logs/logs_"+month+"-"+day+"-"+year+".txt", out+"\n", function (err) {
          if (err) throw err;
        }); 
    }
}

async function newDay(){
    var date=new Date();
    var day=date.getDate();
    var month=date.getMonth()+1;
    var year=date.getFullYear();
    while(true){
        date=new Date();
        var checkDay=date.getDate();
        if(checkDay>day){
            bot.destroy();
            fs.appendFile("./bot_logs/logs_"+month+"-"+day+"-"+year+".txt", "Starting a new day and restarting the bot", function (err) {
              if (err) throw err;
            }); 
            console.log("Starting a new day\n\n\n\n\n");
            bot.login(TOKEN);
            break;
        }
        await Sleep(ms("1h"));
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
                            if((removeDate[0]<=month)&&(removeDate[1]<=day)&&(removeDate[2]<=year)&&(removeSpecificTime[0]<=hour)&&(removeSpecificTime[1]<=minute)){
                                surrogateServer.members.forEach(u => {
                                    if(!u.user.bot){
                                        if(remove[0]==u.user.id){
                                            u.removeRole(role.id);
                                            bot.channels.get("593000239841935362").send(`<@${u.user.id}> has been unmuted!`);
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

//Queue data for each game
    //Pinball
        // https://g9b1fyald3.execute-api.eu-west-1.amazonaws.com/master/games/extra/592ac917-14d2-481a-9d37-3b840ad46b19
    //ToiletPaperClaw
        // https://g9b1fyald3.execute-api.eu-west-1.amazonaws.com/master/games/extra/46db6268-bfc3-43ff-ba7d-02ffaf1f2867
    //SumoBots
        // https://g9b1fyald3.execute-api.eu-west-1.amazonaws.com/master/games/extra/953f2154-9a6e-4602-99c6-265408da6310
    //RaceRealCars143
        // https://g9b1fyald3.execute-api.eu-west-1.amazonaws.com/master/games/extra/953f2154-9a6e-4602-99c6-265408da6310
    //ForceClaw
        // https://g9b1fyald3.execute-api.eu-west-1.amazonaws.com/master/games/extra/ca0b4cc3-d25d-463e-b3f6-ecf96427ffe0
    //Path
        // x.result.queueCount

bot.on('ready', () => {
    announcement("SumoBots", "sumo", 9, "627919045420646401");
    announcement("RaceRealCars143", "race", 4, "589484542214012963");
    fs.open("./database/mute.dat", "w", (err)=>{
        if(err) throw err;
    });
    checkToUnmute();
    // announcement("SumoBots", "sumo", 9, "707047722208854101"); //Testing
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

bot.on('message', async message => {
    if(message.author.bot){
        return;
    }

    let testServer=bot.guilds.get("707047722208854098");
    let bromBotServer=bot.guilds.get("664556796576268298");
    let surrogateServer=bot.guilds.get("571388780058247179");

    if(message.member.user.tag=="Mordecai#3257"&&message.content.includes("!test")){
        //some test I want to do
        //707047722208854101
        return;
    }

    //Setup triggers for channels
    var i; 
    var triggerClawResponse=false; var triggerArcadeResponse=false; var triggerRaceResponse=false; 
    var triggerSumoResponse=false; var triggerGeneralResponse=false; var triggerSneakResponse=false;
    var triggerPinballResponse=false;
    for(i=0; i<clawTrigger.length; i++){
        if(clawTrigger[i]==message.channel.id){
            triggerClawResponse=true;
            break;
        }
    }
    for(i=0; i<arcadeTrigger.length; i++){
        if(arcadeTrigger[i]==message.channel.id){
            triggerArcadeResponse=true;
            break;
        }
    }
    for(i=0; i<raceTrigger.length; i++){
        if(raceTrigger[i]==message.channel.id){
            triggerRaceResponse=true;
            break;
        }
    }
    for(i=0; i<sumoTrigger.length; i++){
        if(sumoTrigger[i]==message.channel.id){
            triggerSumoResponse=true;
            break;
        }
    }
    for(i=0; i<generalTrigger.length; i++){
        if(generalTrigger[i]==message.channel.id){
            triggerGeneralResponse=true;
            break;
        }
    }
    for(i=0; i<sneakTrigger.length; i++){
        if(sneakTrigger[i]==message.channel.id){
            triggerSneakResponse=true;
            break;
        }
    }
    for(i=0; i<pinballTrigger.length; i++){
        if(pinballTrigger[i]==message.channel.id){
            triggerPinballResponse=true;
            break;
        }
    }

    //scraper for getting channel info 
    if(message.member.user.tag=="Mordecai#3257"&&message.content.includes("!scrape")){
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
    var detectColon=(message.content.includes(":"));
    if(detectColon){
        var detectLeft=(message.content.substring((message.content.indexOf(":")-3),(message.content.indexOf(":")-2)));
        var detectRight=(message.content.substring((message.content.indexOf(":")+3),(message.content.indexOf(":")+4)));
    }
    if((message.member.roles.find(r=>r.name.toLowerCase()==="mod squad")||
            message.member.roles.find(r=>r.name.toLowerCase()==="surrogate team"))){
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
                if(hours<10&&hours!=0){
                    hours="0"+hours;
                }
                if(minutes<10&&minutes!=0){
                    minutes="0"+minutes;
                }
                if(day<10){
                    day="0"+day;
                }
                if(month<10){
                    month="0"+month;
                }
                var sendOut="*Beep boop*\nThe time is given in GMT+2 (Finland). See what time that is for you here:\nhttps://www.timeanddate.com/worldclock/fixedtime.html?iso="
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
                    if(hours%12<10){
                        var time="0"+(hours%12)+":"+minutes+":"+seconds+" PM";
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
                var timeDate=time+" "+date;
                var sendOut="It is currently **"+timeDate+"** in Finland (Where the games are located)."
                message.channel.send(sendOut);
                logBotActions(message, "!time");
                break;
            // !roll xdy / !roll
            case 'roll':
                if(args[1]!=null&&args[1].includes("d")){
                    var output=0; var outString="`"; var i; 
                    if(isNaN(args[1].substring(0, args[1].indexOf("d")))||
                        isNaN(args[1].substring(args[1].indexOf("d")+1))||
                        args[1].substring(0, args[1].indexOf("d"))>2000000000||
                        args[1].substring(args[1].indexOf("d")+1>2000000000)){
                        message.author.send("\tError: Invalid format");
                        logBotActions(message, "!roll error");
                        console.log(hours+":"+minutes+":"+seconds+" EST | "+message.member.user.tag+" | !roll error");
                    }else{
                        for(i=0; i<args[1].substring(0, args[1].indexOf("d")); i++){
                            output+=roll;
                        }
                        if(outString.length>=2000||outString>2000000000){
                            message.author.send("That was too many roles, try a smaller number!");
                            logBotActions(message, "!roll xdy error");
                            message.delete()
                            return;
                        }
                        message.author.send("Rolling "+args[1]+":\n\tTotal: "+output);
                        logBotActions(message, "!roll xdy");
                    }
                }else if(args[1]!=null){
                    message.author.send("\tError: Invalid format or too big of a number");
                    logBotActions(message, "!roll error");
                }else{
                    var roll=Math.floor(Math.random()*20)+1;
                    message.author.send("Rolling 1d20:\n\tTotal: "+roll);
                    logBotActions(message, "!roll");
                }
                message.delete()
                break;
            // !getHelp
            case 'gethelp':
                if((message.member.roles.find(r=>r.name.toLowerCase()==="mod squad")||
                        message.member.roles.find(r=>r.name.toLowerCase()==="surrogate team"))){
                    var out="Hello, I am the NinjaHelp bot. You have access to the following commands:\n";
                    out+="`!time`\n\tThis command will tell the time and day in Finland\n";
                    out+="`!roll` | `!roll xdy`\n\tThis command will roll a d20 on an unmodified command and will roll **x** number of **y** sided dice on a modified command\n";
                    out+="`(ab:cd)`\n\tThis allows for a timezone converter link to show up at ab:cd time in Finland.\n";
                    out+="`!game`\n\tWhen used in server catagories, it gives a link to the game(s) that catagory represents.\n";
                    out+="`!schedule` | `!schedule GAME_NAME` - Returns the schedule of the game the channel is called in or can direct it to give the schedule of GAME_NAME. The following are the current game names\n\t\t";
                    out+="`SumoBots`, `RaceRealCars143`, `Pinball`, `ForceClaw`, `ToiletPaperClaw`\n";
                    out+="`!mute <USER> <time>`\n\tWill mute <USER> for however long <time> is (time is formated as the following `3m/3h/3y`. Note that if <USER> is already muted, you cannot extend their time till the first expires.\n";
                    out+="`!unmute <USER>`\n\tWill unmute <USER> only if they are already muted. (Useful if bot goes down/changes are made to code)\n";
                    out+="`!top | !top GAME_NAME month(?)`\n\tThis will give the top scores for game catagory or GAME_NAME. When given a name, you can also ask for monthly top scores."
                    message.author.send(out);
                    logBotActions(message, "!getHelp");
                }else{
                    var out="Hello, I am the NinjaHelp bot. You have access to the following commands:\n";
                    out+="`!time`\n\tThis command will tell the time and day in Finland\n";
                    out+="`!roll` | `!roll xdy`\n\tThis command will roll a d20 on an unmodified command and will roll **x** number of **y** sided dice on a modified command\n";
                    out+="`!game`\n\tWhen used in server catagories, it gives a link to the game(s) that catagory represents.\n";
                    out+="`!schedule` | `!schedule GAME_NAME` - Returns the schedule of the game the channel is called in or can direct it to give the schedule of GAME_NAME. The following are the current game names\n\t\t";
                    out+="`SumoBots`, `RaceRealCars143`, `Pinball`, `ForceClaw`, `ToiletPaperClaw`\n";
                    out+="`!top | !top GAME_NAME month(?)`\n\tThis will give the top scores for game catagory or GAME_NAME. When given a name, you can also ask for monthly top scores."
                    message.author.send(out);
                    logBotActions(message, "!getHelp");
                }
                message.delete();
                break;
            // !game GAME_NAME
            case 'game':
                if(triggerSumoResponse){
                    message.reply("Here you go!\nhttps://surrogate.tv/game/sumobots");
                }else if(triggerRaceResponse){
                    message.reply("Here you go!\nhttps://surrogate.tv/game/racerealcars143");
                }else if(triggerPinballResponse&&triggerClawResponse){
                    var out="There are multiple games here. Here are the links!\n";
                    out+="https://surrogate.tv/game/batman66\n";
                    out+="https://surrogate.tv/game/forceclaw\n";
                    out+="https://surrogate.tv/game/toiletpaperclaw";
                    message.reply(out);
                }else if(triggerClawResponse&&706819836071903275==message.channel.id){
                    message.reply("Here you go!\nhttps://surrogate.tv/game/forceclaw");
                }else if(triggerClawResponse&&662301446036783108==message.channel.id){
                    message.reply("Here you go!\nhttps://surrogate.tv/game/toiletpaperclaw");
                }else if(triggerPinballResponse){
                    message.reply("Here you go!\nhttps://surrogate.tv/game/batman66");
                }else if(triggerGeneralResponse){
                    var out="Here are all the links to the current games:\n";
                    out+="https://surrogate.tv/game/sumobots\n";
                    out+="https://surrogate.tv/game/racerealcars143\n";
                    out+="https://surrogate.tv/game/batman66\n";
                    out+="https://surrogate.tv/game/forceclaw\n";
                    out+="https://surrogate.tv/game/toiletpaperclaw";
                    message.reply(out);
                }else{
                    message.delete()
                    return;
                }
                message.delete();
                logBotActions(message, "!game");
                break;
            // !schedule
            case 'schedule':
                var url="https://g9b1fyald3.execute-api.eu-west-1.amazonaws.com/master/games/?shortId=";
                if(triggerSumoResponse||message.content.toLowerCase().includes("sumobots")){
                    url+="sumobots";
                    var command="SumoBots";
                }else if(triggerRaceResponse||message.content.toLowerCase().includes("racerealcars143")){
                    url+="racerealcars143";
                    var command="RaceRealCars143";
                }else if((triggerClawResponse&&706819836071903275==message.channel.id)||message.content.toLowerCase().includes("forceclaw")){
                    url+="forceclaw";
                    var command="ForceClaw";
                }else if((triggerClawResponse&&662301446036783108==message.channel.id)||message.content.toLowerCase().includes("toiletpaperclaw")){
                    url+="toiletpaperclaw";
                    var command="ToiletPaperClaw";
                }else if((triggerPinballResponse&&613630308931207198)||message.content.toLowerCase().includes("pinball")){
                    url+="batman66";
                    var command="Batman66 Pinball";
                }else{
                    message.delete()
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
                                        output+="> Monday:         ";
                                        break;
                                    case 1:
                                        output+="> Tuesday:         ";
                                        break;
                                    case 2:
                                        output+="> Wednesday:  ";
                                        break;
                                    case 3:
                                        output+="> Thursday:       ";
                                        break;
                                    case 4:
                                        output+="> Friday:             ";
                                        break;
                                    case 5:
                                        output+="> Saturday:        ";
                                        break;
                                    case 6:
                                        output+="> Sunday:           ";
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
                            output="Here is the schedule (Finland time GMT+3) for **"+command+"** this week!\n"+output;
                            output+="Link to **"+command+"** can be found here!\nhttps://surrogate.tv/game/";
                            command=command.split(' ');
                            command=command.splice(0);
                            output+=command[0].toLowerCase();
                            if((message.member.roles.find(r=>r.name.toLowerCase()==="mod squad")||
                                message.member.roles.find(r=>r.name.toLowerCase()==="surrogate team"))){
                            message.channel.send(output);
                            }else{
                                message.author.send("That command is currently restricted while my maker works on a better system\n"+output);
                            }
                        }
                    });
                logBotActions(message, "!schedule");
                message.delete()
                break;
            // !mute <USER> <TIME>
            case 'mute':
                if((message.member.roles.find(r=>r.name.toLowerCase()==="mod squad")||
                        message.member.roles.find(r=>r.name.toLowerCase()==="surrogate team")&&
                    args[1]!=null&&args[2]!=null)){
                    let toMute=message.guild.member(message.mentions.users.first());
                    let role = message.guild.roles.find(r => r.name === "muted");
                    if(!toMute){
                        // 593000239841935362
                        bot.channels.get("593000239841935362").send(`Couldn't find user.`);
                        return;
                    }
                    if(toMute.hasPermission("MANAGE_MESSAGES")){
                        // 593000239841935362
                        bot.channels.get("593000239841935362").send(`Can't mute that user`);
                        return;
                    }
                    let mutetime = args[2];
                    if(!mutetime){
                        // 593000239841935362
                        bot.channels.get("593000239841935362").send(`You need to specify a time (3s/3d/3h/3y)`);
                        return;
                    }
                    await(toMute.addRole(role.id));
                    // 593000239841935362
                    bot.channels.get("593000239841935362").send(`<@${toMute.id}> has been muted for ${ms(ms(mutetime))} by <@${message.member.user.id}>`);
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
                            fs.appendFile("./database/mute.dat", toMute.id+"|"+endMute, (err)=>{
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
                        // 593000239841935362
                        bot.channels.get("593000239841935362").send("Couldn't find user.");
                        return;
                    }else if(!toUnmute.roles.find(r=>r.name.toLowerCase()==="muted")){
                        // 593000239841935362
                        bot.channels.get("593000239841935362").send(`<@${toUnmute} is not muted.`);
                        return;
                    }

                    await(toUnmute.addRole(role.id));
                    toUnmute.removeRole(role.id);
                    // 593000239841935362
                    bot.channels.get("593000239841935362").send(`<@${toUnmute.id}> has been unmuted by <@${message.member.user.id}>`);
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
                if(triggerSumoResponse||message.content.toLowerCase().includes("sumobots")){
                    url+="99ca6347-0e10-4465-8fe1-9fee8bc5fb35&order=";
                    var command="SumoBots";
                    if(args[2]!=null&&args[2].toLowerCase().includes("month")){
                        message.channel.send("There are no monthly scores for "+command+".");
                        message.delete()
                        return;
                    }
                }else if(triggerRaceResponse||message.content.toLowerCase().includes("racerealcars143")){
                    url+="953f2154-9a6e-4602-99c6-265408da6310&order=";
                    var command="RaceRealCars143";
                    if(args[2]!=null&&args[2].toLowerCase().includes("month")){
                        url+="month";
                        scoreType="Monthly";
                    }
                }else if((triggerClawResponse&&706819836071903275==message.channel.id)||message.content.toLowerCase().includes("forceclaw")){
                    url+="ca0b4cc3-d25d-463e-b3f6-ecf96427ffe0&order=";
                    var command="ForceClaw";
                    if(args[2]!=null&&args[2].toLowerCase().includes("month")){
                        message.channel.send("There are no monthly scores for "+command+".");
                        message.delete()
                        return;
                    }
                }else if((triggerClawResponse&&662301446036783108==message.channel.id)||message.content.toLowerCase().includes("toiletpaperclaw")){
                    url+="46db6268-bfc3-43ff-ba7d-02ffaf1f2867&order=";
                    var command="ToiletPaperClaw";
                    if(args[2]!=null&&args[2].toLowerCase().includes("month")){
                        message.channel.send("There are no monthly scores for "+command+".");
                        message.delete()
                        return;
                    }
                }else if((triggerPinballResponse&&613630308931207198)||message.content.toLowerCase().includes("pinball")){
                    url+="592ac917-14d2-481a-9d37-3b840ad46b19&order=";
                    var command="Batman66 Pinball";
                    if(args[2]!=null&&args[2].toLowerCase().includes("month")){
                        url+="month";
                        scoreType="Monthly";
                    }
                }else{
                    message.delete()
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
                        if(x==null||x.result==null||x.result.Items==null){
                            message.channel.send("There were no scores for "+command+".");
                        }else{
                            if(x.result.Items.length>10){
                                var scores="Here are the Top 10 "+scoreType+" scores for **"+command+"**:";
                            }else{
                                var scores="Here are the Top "+x.result.Items.length+" "+scoreType+" scores for **"+command+"**:";
                            }
                            var i;
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
                                    scores+="\n\t"+(i+1)+") "+icon+" **__"+x.result.Items[i].userObject.username+"__**:\t"+x.result.Items[i].points;
                                }else{
                                    scores+="\n\t"+(i+1)+") **__"+x.result.Items[i].userObject.username+"__**:\t"+x.result.Items[i].points;
                                }
                            }

                            if((message.member.roles.find(r=>r.name.toLowerCase()==="mod squad")||
                                    message.member.roles.find(r=>r.name.toLowerCase()==="surrogate team"))){
                                message.channel.send(scores);
                            }else{
                                message.author.send("That command is currently restricted while my maker works on a better system\n"+scores);
                            }

                        }
                    });
                logBotActions(message, "!top");
                message.delete()
                break;
        }
        return;
    }

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
});