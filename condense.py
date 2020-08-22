import os
import glob

file=open("master.log", "a+")
i=0; 
for x in sorted(glob.glob(os.path.join( './bot_logs/*.txt'))):
	opened_file=open(x, "r")
	if(i==0):
		file.write("====="+opened_file.name.split('\\')[1]+"=====\n"+opened_file.read()+"\n")
		i=1
	else: 
		file.write("====="+opened_file.name.split('\\')[1]+"=====\n"+opened_file.read()+"\n\n")

file.close()