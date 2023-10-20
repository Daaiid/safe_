from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
app = FastAPI()

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

#TODO Adapt so we receive a body instead of query params
@app.post("/ValidatePost/")
async def validate_post(content, hash):

    #TODO implement validator

    return hash