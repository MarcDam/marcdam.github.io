#!/bin/bash/python3

import os

f = open("menu.html", 'r')
menu = f.read()
f.close()



for i in os.listdir("html"):
  if ".html" in i:
    f = open("html/" + i, "r")
    html = f.read()
    f.close()
    
    html = html.split("\n")
    
    index = html.index("    <!-- menu -->")
    
    html[index] = menu
    
    html = "\n".join(html)
    
    f = open(i, 'w')
    f.write(html)
    f.close()
    

