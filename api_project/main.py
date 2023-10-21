from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

import post_validator

app = FastAPI()

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class Item(BaseModel):
    content: str
    hash: int
    
@app.post("/ValidatePost/")
async def validate_post(item: Item):

    score = post_validator.validate_post(item.content)

    return (score, item.hash)
