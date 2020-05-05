require('dotenv').config();
const Discord = require('discord.js');
const bot = new Discord.Client();
const TOKEN = process.env.TOKEN;

bot.login(TOKEN);

bot.on('ready', () => {
  console.info(`Logged in as ${bot.user.tag}!`);
});

bot.on('message', message => {
    if (message.author.bot){
        return;
    }

    var detectColon=(message.content.includes(":"));
    if(detectColon){
        var detectLeft=(message.content.substring((message.content.indexOf(":")-3),(message.content.indexOf(":")-2)));
        var detectRight=(message.content.substring((message.content.indexOf(":")+3),(message.content.indexOf(":")+4)));
    }

    if((message.member.roles.find(r => r.name.toLowerCase() === "mod squad")||message.member.roles.find(r => r.name.toLowerCase() === "surrogate team"))){
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
                var sendOut="*Beep boop*\nThe time is given in GMT+2 (Finland). See what time that is for you here:\nhttps://www.timeanddate.com/worldclock/fixedtime.html?iso="+year+""+month+""+day+"T"+hours+""+minutes+"&p1=101\n*Beep boop*";
                message.channel.send(sendOut);
                console.log(message.member.user.tag+" called for a link");
            }
        }
    }
    if(message.content.substring(0, 1) == '!') {
        var args = message.content.substring(1).split(' ');
        var cmd = args[0];
       
        args = args.splice(1);
        switch(cmd) {
            // !ping
            case 'ping':
                message.channel.send("Pong!");
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
                console.log(message.member.user.tag+" called for !time");
                break;
         }
     }else if((message.content.toLowerCase().includes("filled")||message.content.toLowerCase().includes("refill")||message.content.toLowerCase().includes("restock"))&&!message.content.includes("tenor")&&!((message.member.roles.find(r => r.name.toLowerCase() === "Mod Squad")||message.member.roles.find(r => r.name.toLowerCase() === "Surrogate Team"||message.member.roles.find(r => r.name.toLowerCase() === "Alpha Testers"))))){
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
        var timeDate=time+" on "+date;

        if(hours>=20||hours<=8){
            var sendOut="*Beep boop*\nIt is currently **"+timeDate+"** in Finland (Where the games are located).\n";
            var out1=sendOut+"It is currently between **8:00 PM and 8:00 AM** so it is likely that no one is in the office.\n";
            var out2=out1+"*Beep boop*";
            message.channel.send(out2);
            console.log(message.member.user.tag+"'s meassage detected between 8PM to 8AM.");
        }else{
            var sendOut="*Beep boop*\nIt is currently **"+timeDate+"** in Finland (Where the games are located) right now.\n";
            var out2=sendOut+"*Beep boop*";
            // message.channel.send(out2);
        }
     }
});