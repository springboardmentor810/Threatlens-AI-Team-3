import uvicorn
import traceback

class DebugServer(uvicorn.Server):
    def handle_exit(self, sig, frame):
        print("!!! RECEIVED SIGNAL:", sig, "!!!")
        traceback.print_stack(frame)
        super().handle_exit(sig, frame)

if __name__ == "__main__":
    config = uvicorn.Config("app.main:app", host="127.0.0.1", port=8000)
    server = DebugServer(config=config)
    server.run()
