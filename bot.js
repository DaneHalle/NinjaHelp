require('dotenv').config();
const Discord=require('discord.js');
const fetch = require('node-fetch');
const querystring = require('querystring');
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

var sumoRemote=false;
var raceRemote=false;
var pinballRemote=false;
var clawRemote=false;

bot.on('ready', () => {
  console.info(`We are up and running as ${bot.user.tag}`);
  console.info(`=======================================`);
});

bot.on('message', async message => {
    if(message.author.bot){
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
                today=new Date();
                var hours=today.getHours();
                var minutes=today.getMinutes();
                var seconds=today.getSeconds();
                if(hours<10&&hours!=0){
                    hours="0"+hours;
                }
                if(minutes<10&&minutes!=0){
                    minutes="0"+minutes;
                }
                if(seconds<10&&seconds!=0){
                    seconds="0"+seconds;
                } 
                console.log(hours+":"+minutes+":"+seconds+" EST | "+message.member.user.tag+" | Link");
            }
        }
    }
    if(message.content.substring(0, 1) == '!') {
        var args=message.content.substring(1).split(' ');
        var cmd=args[0];
       
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
                today=new Date();
                var hours=today.getHours();
                var minutes=today.getMinutes();
                var seconds=today.getSeconds();
                if(hours<10&&hours!=0){
                    hours="0"+hours;
                }
                if(minutes<10&&minutes!=0){
                    minutes="0"+minutes;
                }
                if(seconds<10&&seconds!=0){
                    seconds="0"+seconds;
                } 
                console.log(hours+":"+minutes+":"+seconds+" EST | "+message.member.user.tag+" | !time");
                break;
            // !roll xdy / !roll
            case 'roll':
                if(args[1]!=null&&args[1].includes("d")){
                    var output=0; var outString="`"; var i; 
                    if(isNaN(args[1].substring(0, args[1].indexOf("d")))||
                        isNaN(args[1].substring(args[1].indexOf("d")+1))){
                        message.channel.send("\tError: Invalid format");
                        today=new Date();
                        var hours=today.getHours();
                        var minutes=today.getMinutes();
                        var seconds=today.getSeconds();
                        if(hours<10&&hours!=0){
                            hours="0"+hours;
                        }
                        if(minutes<10&&minutes!=0){
                            minutes="0"+minutes;
                        }
                        if(seconds<10&&seconds!=0){
                            seconds="0"+seconds;
                        } 
                        console.log(hours+":"+minutes+":"+seconds+" EST | "+message.member.user.tag+" | !roll error");
                    }else{
                        for(i=0; i<args[1].substring(0, args[1].indexOf("d")); i++){
                            var roll=Math.floor(Math.random()*args[1].substring(args[1].indexOf("d")+1))+1;
                            output+=roll;
                            if(outString=="`"){
                                outString+=roll;
                            }else{
                                outString+=", "+roll;
                            }
                        }
                        message.channel.send("Rolling "+args[1]+":\n\t"+outString+"`\n\tTotal: "+output);
                        today=new Date();
                        var hours=today.getHours();
                        var minutes=today.getMinutes();
                        var seconds=today.getSeconds();
                        if(hours<10&&hours!=0){
                            hours="0"+hours;
                        }
                        if(minutes<10&&minutes!=0){
                            minutes="0"+minutes;
                        }
                        if(seconds<10&&seconds!=0){
                            seconds="0"+seconds;
                        } 
                        console.log(hours+":"+minutes+":"+seconds+" EST | "+message.member.user.tag+" | !roll xdy");
                    }
                }else if(args[1]!=null){
                    message.channel.send("\tError: Invalid format");
                    today=new Date();
                    var hours=today.getHours();
                    var minutes=today.getMinutes();
                    var seconds=today.getSeconds();
                    if(hours<10&&hours!=0){
                        hours="0"+hours;
                    }
                    if(minutes<10&&minutes!=0){
                        minutes="0"+minutes;
                    }
                    if(seconds<10&&seconds!=0){
                        seconds="0"+seconds;
                    } 
                    console.log(hours+":"+minutes+":"+seconds+" EST | "+message.member.user.tag+" | !roll error");
                }else{
                    var roll=Math.floor(Math.random()*20)+1;
                    message.channel.send("Rolling 1d20:\n\tTotal: "+roll);
                    today=new Date();
                    var hours=today.getHours();
                    var minutes=today.getMinutes();
                    var seconds=today.getSeconds();
                    if(hours<10&&hours!=0){
                        hours="0"+hours;
                    }
                    if(minutes<10&&minutes!=0){
                        minutes="0"+minutes;
                    }
                    if(seconds<10&&seconds!=0){
                        seconds="0"+seconds;
                    } 
                    console.log(hours+":"+minutes+":"+seconds+" EST | "+message.member.user.tag+" | !roll");
                }
                break;
            // !remote GAME
            case 'remote':
                if((message.member.roles.find(r=>r.name.toLowerCase()==="mod squad")||
                        message.member.roles.find(r=>r.name.toLowerCase()==="surrogate team"))){
                    if(args[1]!=null&&args[1].toLowerCase().includes("sumobots")){
                        if(sumoRemote){
                            sumoRemote=false;
                            message.channel.send("Switching **off** remote hosting for SumoBots.");
                            today=new Date();
                            var hours=today.getHours();
                            var minutes=today.getMinutes();
                            var seconds=today.getSeconds();
                            if(hours<10&&hours!=0){
                                hours="0"+hours;
                            }
                            if(minutes<10&&minutes!=0){
                                minutes="0"+minutes;
                            }
                            if(seconds<10&&seconds!=0){
                                seconds="0"+seconds;
                            } 
                            console.log(hours+":"+minutes+":"+seconds+" EST | "+message.member.user.tag+" | !remote SumoBots to false");
                        }else{
                            sumoRemote=true;
                            message.channel.send("Switching **on** remote hosting for SumoBots.");
                            today=new Date();
                            var hours=today.getHours();
                            var minutes=today.getMinutes();
                            var seconds=today.getSeconds();
                            if(hours<10&&hours!=0){
                                hours="0"+hours;
                            }
                            if(minutes<10&&minutes!=0){
                                minutes="0"+minutes;
                            }
                            if(seconds<10&&seconds!=0){
                                seconds="0"+seconds;
                            } 
                            console.log(hours+":"+minutes+":"+seconds+" EST | "+message.member.user.tag+" | !remote SumoBots to true");
                        }
                    }else if(args[1]!=null&&args[1].toLowerCase().includes("realracing")){
                        if(raceRemote){
                            raceRemote=false;
                            message.channel.send("Switching **off** remote hosting for RealRacing.");
                            today=new Date();
                            var hours=today.getHours();
                            var minutes=today.getMinutes();
                            var seconds=today.getSeconds();
                            if(hours<10&&hours!=0){
                                hours="0"+hours;
                            }
                            if(minutes<10&&minutes!=0){
                                minutes="0"+minutes;
                            }
                            if(seconds<10&&seconds!=0){
                                seconds="0"+seconds;
                            } 
                            console.log(hours+":"+minutes+":"+seconds+" EST | "+message.member.user.tag+" | !remote RealRacing to false");
                        }else{
                            raceRemote=true;
                            message.channel.send("Switching **on** remote hosting for RealRacing.");
                            today=new Date();
                            var hours=today.getHours();
                            var minutes=today.getMinutes();
                            var seconds=today.getSeconds();
                            if(hours<10&&hours!=0){
                                hours="0"+hours;
                            }
                            if(minutes<10&&minutes!=0){
                                minutes="0"+minutes;
                            }
                            if(seconds<10&&seconds!=0){
                                seconds="0"+seconds;
                            } 
                            console.log(hours+":"+minutes+":"+seconds+" EST | "+message.member.user.tag+" | !remote RealRacing to true");
                        }
                    }else if(args[1]!=null&&args[1].toLowerCase().includes("pinball")){
                        if(pinballRemote){
                            pinballRemote=false;
                            message.channel.send("Switching **off** remote hosting for Pinball.");
                            today=new Date();
                            var hours=today.getHours();
                            var minutes=today.getMinutes();
                            var seconds=today.getSeconds();
                            if(hours<10&&hours!=0){
                                hours="0"+hours;
                            }
                            if(minutes<10&&minutes!=0){
                                minutes="0"+minutes;
                            }
                            if(seconds<10&&seconds!=0){
                                seconds="0"+seconds;
                            } 
                            console.log(hours+":"+minutes+":"+seconds+" EST | "+message.member.user.tag+" | !remote Pinball to false");
                        }else{
                            pinballRemote=true;
                            message.channel.send("Switching **on** remote hosting for Pinball.");
                            today=new Date();
                            var hours=today.getHours();
                            var minutes=today.getMinutes();
                            var seconds=today.getSeconds();
                            if(hours<10&&hours!=0){
                                hours="0"+hours;
                            }
                            if(minutes<10&&minutes!=0){
                                minutes="0"+minutes;
                            }
                            if(seconds<10&&seconds!=0){
                                seconds="0"+seconds;
                            } 
                            console.log(hours+":"+minutes+":"+seconds+" EST | "+message.member.user.tag+" | !remote Pinball to true");
                        }
                    }else if(args[1]!=null&&args[1].toLowerCase().includes("claw")){
                        if(clawRemote){
                            clawRemote=false;
                            message.channel.send("Switching **off** remote hosting for ClawGame.");
                            today=new Date();
                            var hours=today.getHours();
                            var minutes=today.getMinutes();
                            var seconds=today.getSeconds();
                            if(hours<10&&hours!=0){
                                hours="0"+hours;
                            }
                            if(minutes<10&&minutes!=0){
                                minutes="0"+minutes;
                            }
                            if(seconds<10&&seconds!=0){
                                seconds="0"+seconds;
                            } 
                            console.log(hours+":"+minutes+":"+seconds+" EST | "+message.member.user.tag+" | !remote ClawGame to false");
                        }else{
                            clawRemote=true;
                            message.channel.send("Switching **on** remote hosting for ClawGame.");
                            today=new Date();
                            var hours=today.getHours();
                            var minutes=today.getMinutes();
                            var seconds=today.getSeconds();
                            if(hours<10&&hours!=0){
                                hours="0"+hours;
                            }
                            if(minutes<10&&minutes!=0){
                                minutes="0"+minutes;
                            }
                            if(seconds<10&&seconds!=0){
                                seconds="0"+seconds;
                            } 
                            console.log(hours+":"+minutes+":"+seconds+" EST | "+message.member.user.tag+" | !remote ClawGame to true");
                        }
                    }
                }
                break;
            // !status GAME
            case 'status':
                if((message.member.roles.find(r=>r.name.toLowerCase()==="mod squad")||
                        message.member.roles.find(r=>r.name.toLowerCase()==="surrogate team"))){
                    if(args[1]!=null&&args[1].toLowerCase().includes("sumobots")){
                        if(sumoRemote){
                            message.channel.send("SumoBots remote is **on**.");
                        }else{
                            message.channel.send("SumoBots remote is **off**.");
                        }
                        today=new Date();
                        var hours=today.getHours();
                        var minutes=today.getMinutes();
                        var seconds=today.getSeconds();
                        if(hours<10&&hours!=0){
                            hours="0"+hours;
                        }
                        if(minutes<10&&minutes!=0){
                            minutes="0"+minutes;
                        }
                        if(seconds<10&&seconds!=0){
                            seconds="0"+seconds;
                        } 
                        console.log(hours+":"+minutes+":"+seconds+" EST | "+message.member.user.tag+" | !status SumoBots");
                    }else if(args[1]!=null&&args[1].toLowerCase().includes("pinball")){
                        if(pinballRemote){
                            message.channel.send("Pinball remote is **on**.");
                        }else{
                            message.channel.send("Pinball remote is **off**.");
                        }
                        today=new Date();
                        var hours=today.getHours();
                        var minutes=today.getMinutes();
                        var seconds=today.getSeconds();
                        if(hours<10&&hours!=0){
                            hours="0"+hours;
                        }
                        if(minutes<10&&minutes!=0){
                            minutes="0"+minutes;
                        }
                        if(seconds<10&&seconds!=0){
                            seconds="0"+seconds;
                        } 
                        console.log(hours+":"+minutes+":"+seconds+" EST | "+message.member.user.tag+" | !status Pinball");
                    }else if(args[1]!=null&&args[1].toLowerCase().includes("realracing")){
                        if(raceRemote){
                            message.channel.send("RealRacing remote is **on**.");
                        }else{
                            message.channel.send("RealRacing remote is **off**.");
                        }
                        today=new Date();
                        var hours=today.getHours();
                        var minutes=today.getMinutes();
                        var seconds=today.getSeconds();
                        if(hours<10&&hours!=0){
                            hours="0"+hours;
                        }
                        if(minutes<10&&minutes!=0){
                            minutes="0"+minutes;
                        }
                        if(seconds<10&&seconds!=0){
                            seconds="0"+seconds;
                        } 
                        console.log(hours+":"+minutes+":"+seconds+" EST | "+message.member.user.tag+" | !status RealRacing");
                    }else if(args[1]!=null&&args[1].toLowerCase().includes("claw")){
                        if(clawRemote){
                            message.channel.send("Claw remote is **on**.");
                        }else{
                            message.channel.send("Claw remote is **off**.");
                        }
                        today=new Date();
                        var hours=today.getHours();
                        var minutes=today.getMinutes();
                        var seconds=today.getSeconds();
                        if(hours<10&&hours!=0){
                            hours="0"+hours;
                        }
                        if(minutes<10&&minutes!=0){
                            minutes="0"+minutes;
                        }
                        if(seconds<10&&seconds!=0){
                            seconds="0"+seconds;
                        } 
                        console.log(hours+":"+minutes+":"+seconds+" EST | "+message.member.user.tag+" | !status Claw");
                    }
                }
                break;
            // !getHelp
            case 'getHelp':
                if((message.member.roles.find(r=>r.name.toLowerCase()==="mod squad")||
                        message.member.roles.find(r=>r.name.toLowerCase()==="surrogate team"))){
                    var out="Hello, I am the NinjaHelp bot. You have access to the following commands:\n\n";
                    out+="`!time`\n\tThis command will tell the time and day in Finland\n\n";
                    out+="`!roll` | `!roll xdy`\n\tThis command will roll a d20 on an unmodified command and will roll **x** number of **y** sided dice on a modified command\n\n";
                    out+="`!remote GAME_NAME`\n\tThis command will toggle the remote status of the given game. This will impact help triggers for that game. The following games are supported:\n\t\t";
                    out+="`SumoBots`\n\t\t`Pinball`\n\t\t`RealRacing`\n\t\t`Claw`\n\n";
                    out+="`!status GAME_NAME`\n\tThis will give the bot's known status of the given game. This supports the same games as `!remote`\n\n";
                    out+="`(ab:cd)`\n\tThis allows for a timezone converter link to show up at ab:cd time in Finland.\n\n";
                    out+="`!game`\n\tWhen used in server catagories, it gives a link to the game(s) that catagory represents.\n\n";
                    out+="`!schedule` | `!schedule GAME_NAME` - When used in server catagories, it gives the scheule and link to the game. When used with GAME_NAME, it will return the schedule for that game.";
                    message.channel.send(out);
                }
                today=new Date();
                var hours=today.getHours();
                var minutes=today.getMinutes();
                var seconds=today.getSeconds();
                if(hours<10&&hours!=0){
                    hours="0"+hours;
                }
                if(minutes<10&&minutes!=0){
                    minutes="0"+minutes;
                }
                if(seconds<10&&seconds!=0){
                    seconds="0"+seconds;
                } 
                console.log(hours+":"+minutes+":"+seconds+" EST | "+message.member.user.tag+" | !getHelp");
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
                    return;
                }
                today=new Date();
                var hours=today.getHours();
                var minutes=today.getMinutes();
                var seconds=today.getSeconds();
                if(hours<10&&hours!=0){
                    hours="0"+hours;
                }
                if(minutes<10&&minutes!=0){
                    minutes="0"+minutes;
                }
                if(seconds<10&&seconds!=0){
                    seconds="0"+seconds;
                } 
                console.log(hours+":"+minutes+":"+seconds+" EST | "+message.member.user.tag+" | !game");
                break;
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
                    return;
                }

                const minDay=1440;
                const {list}=fetch(url, {
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
                                var startMinute="00";
                                if((startTime-day*minDay)%60!=2*(startTime-day*minDay)%60){
                                    startMinute="30";
                                }
                                if(startHour>23){
                                    var addToDay=Math.floor(startHour/24);
                                    startHour%=24;
                                    day+=addToDay;
                                }
                                var endHour=Math.floor((endTime-day*minDay)/60);
                                var endMinute="00";
                                var endDay=day;
                                if((endTime-day*minDay)%60!=2*(endTime-day*minDay)%60){
                                    endMinute="30";
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
                            message.channel.send(output);
                        }
                    });
                    
                today=new Date();
                var hours=today.getHours();
                var minutes=today.getMinutes();
                var seconds=today.getSeconds();
                if(hours<10&&hours!=0){
                    hours="0"+hours;
                }
                if(minutes<10&&minutes!=0){
                    minutes="0"+minutes;
                }
                if(seconds<10&&seconds!=0){
                    seconds="0"+seconds;
                } 
                console.log(hours+":"+minutes+":"+seconds+" EST | "+message.member.user.tag+" | !schedule");

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
            today=new Date();
            var hours=today.getHours();
            var minutes=today.getMinutes();
            var seconds=today.getSeconds();
            if(hours<10&&hours!=0){
                hours="0"+hours;
            }
            if(minutes<10&&minutes!=0){
                minutes="0"+minutes;
            }
            if(seconds<10&&seconds!=0){
                seconds="0"+seconds;
            } 
            console.log(hours+":"+minutes+":"+seconds+" EST | "+message.member.user.tag+" | Detected \"refill\" claw");
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
        today=new Date();
        var hours=today.getHours();
        var minutes=today.getMinutes();
        var seconds=today.getSeconds();
        if(hours<10&&hours!=0){
            hours="0"+hours;
        }
        if(minutes<10&&minutes!=0){
            minutes="0"+minutes;
        }
        if(seconds<10&&seconds!=0){
            seconds="0"+seconds;
        } 
        console.log(hours+":"+minutes+":"+seconds+" EST | "+message.member.user.tag+" | Detected \"how to play\" Sumo");
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
        today=new Date();
        var hours=today.getHours();
        var minutes=today.getMinutes();
        var seconds=today.getSeconds();
        if(hours<10&&hours!=0){
            hours="0"+hours;
        }
        if(minutes<10&&minutes!=0){
            minutes="0"+minutes;
        }
        if(seconds<10&&seconds!=0){
            seconds="0"+seconds;
        } 
        console.log(hours+":"+minutes+":"+seconds+" EST | "+message.member.user.tag+" | Detected \"how to play\" RealRacing");
        return;
    }

    //"How do I play" for Pinball
    if(triggerPinballResponse&&
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
        out+="2. When your game starts use the left and right [CTRL] buttons to use the flippers and use [SPACEBAR] to launch the ball. ";
        out+="You have 3 balls per game with the players taking turns.";
        message.channel.send(out);
        today=new Date();
        var hours=today.getHours();
        var minutes=today.getMinutes();
        var seconds=today.getSeconds();
        if(hours<10&&hours!=0){
            hours="0"+hours;
        }
        if(minutes<10&&minutes!=0){
            minutes="0"+minutes;
        }
        if(seconds<10&&seconds!=0){
            seconds="0"+seconds;
        } 
        console.log(hours+":"+minutes+":"+seconds+" EST | "+message.member.user.tag+" | Detected \"how to play\" Pinball");
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
        today=new Date();
        var hours=today.getHours();
        var minutes=today.getMinutes();
        var seconds=today.getSeconds();
        if(hours<10&&hours!=0){
            hours="0"+hours;
        }
        if(minutes<10&&minutes!=0){
            minutes="0"+minutes;
        }
        if(seconds<10&&seconds!=0){
            seconds="0"+seconds;
        } 
        console.log(hours+":"+minutes+":"+seconds+" EST | "+message.member.user.tag+" | Detected \"ball stuck\" Pinball");
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
        today=new Date();
        var hours=today.getHours();
        var minutes=today.getMinutes();
        var seconds=today.getSeconds();
        if(hours<10&&hours!=0){
            hours="0"+hours;
        }
        if(minutes<10&&minutes!=0){
            minutes="0"+minutes;
        }
        if(seconds<10&&seconds!=0){
            seconds="0"+seconds;
        } 
        console.log(hours+":"+minutes+":"+seconds+" EST | "+message.member.user.tag+" | Detected \"AFK check\" Pinball");
        return;
    }
    //"Two balls" Pinball
    if(triggerPinballResponse&&
        message.content.toLowerCase().includes("two")&&
        message.content.toLowerCase().includes("ball")&&
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
        today=new Date();
        var hours=today.getHours();
        var minutes=today.getMinutes();
        var seconds=today.getSeconds();
        if(hours<10&&hours!=0){
            hours="0"+hours;
        }
        if(minutes<10&&minutes!=0){
            minutes="0"+minutes;
        }
        if(seconds<10&&seconds!=0){
            seconds="0"+seconds;
        } 
        console.log(hours+":"+minutes+":"+seconds+" EST | "+message.member.user.tag+" | Detected \"two balls\" Pinball");
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
        today=new Date();
        var hours=today.getHours();
        var minutes=today.getMinutes();
        var seconds=today.getSeconds();
        if(hours<10&&hours!=0){
            hours="0"+hours;
        }
        if(minutes<10&&minutes!=0){
            minutes="0"+minutes;
        }
        if(seconds<10&&seconds!=0){
            seconds="0"+seconds;
        } 
        console.log(hours+":"+minutes+":"+seconds+" EST | "+message.member.user.tag+" | Detected \"how to queue\"");
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
        today=new Date();
        var hours=today.getHours();
        var minutes=today.getMinutes();
        var seconds=today.getSeconds();
        if(hours<10&&hours!=0){
            hours="0"+hours;
        }
        if(minutes<10&&minutes!=0){
            minutes="0"+minutes;
        }
        if(seconds<10&&seconds!=0){
            seconds="0"+seconds;
        } 
        console.log(hours+":"+minutes+":"+seconds+" EST | "+message.member.user.tag+" | Detected \"how to leave queue\"");
        return;
    }
});