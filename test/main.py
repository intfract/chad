def output(message):
  print(message)
  return message

def read(path: str):
  with open(path, "r", encoding="utf8") as f:
    return f.read()

def write(path: str, text: str):
  with open(path, "w") as f:
    return f.write(text)

# py
x:int=0
y:str="Hello, world!"
while (x<4):
	x=x+1
	output(x)
	