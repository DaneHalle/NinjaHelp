require('dotenv').config();
const Discord=require('discord.js');
const bot=new Discord.Client();
const TOKEN=process.env.TOKEN;
bot.login(TOKEN);

bot.on('ready', () => {
  console.info(`We are up and running as ${bot.user.tag}!`);
  console.info(`======================================`);
});

bot.on('message', message => {
    if(message.author.bot){
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
            case 'roll':
                if(args[1]!=null&&args[1].includes("d")){
                    var output=0; var outString="`"; var i; 
                    if(isNaN(args[1].substring(0, args[1].indexOf("d")))||isNaN(args[1].substring(args[1].indexOf("d")+1))){
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
         }
     }else if(((message.content.toLowerCase().includes("filled")||message.content.toLowerCase().includes("refill")||message.content.toLowerCase().includes("restock"))&&!message.content.includes("tenor"))&&!((message.member.roles.find(r => r.name.toLowerCase() === "mod squad")||message.member.roles.find(r => r.name.toLowerCase() === "surrogate team"||message.member.roles.find(r => r.name.toLowerCase() === "alpha testers"))))){
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
            console.log(hours+":"+minutes+":"+seconds+" EST | "+message.member.user.tag+" | Detected");
        }else{
            var sendOut="*Beep boop*\nIt is currently **"+timeDate+"** in Finland (Where the games are located) right now.\n";
            var out2=sendOut+"*Beep boop*";
            // message.channel.send(out2);
        }
     }
});