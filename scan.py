import os

dir_list = list(os.scandir('./bot_logs/'))
toRemove=[]

for log_file in dir_list:
	file=open(log_file, "r")
	contents=file.readlines()
	if(len(contents)>0 and contents[0]=='Starting a new day and restarting the bot'):
		toRemove.append(file.name)
	file.close()
for x in toRemove:
	os.remove(x)
	print("Removing file: "+ x)