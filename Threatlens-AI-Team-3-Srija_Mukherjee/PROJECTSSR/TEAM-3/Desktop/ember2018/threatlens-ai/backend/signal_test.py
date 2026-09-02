import signal
import time
def handler(signum, frame):
    print("!!! GOT SIGNAL:", signum, "!!!")
signal.signal(signal.SIGINT, handler)
print("Waiting for 15 seconds...")
for i in range(15):
    print(i)
    time.sleep(1)
print("Finished without interruption")
