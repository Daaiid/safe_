from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from huggingface_hub import InferenceClient
from dotenv import load_dotenv
import os
import post_validator
import post_validator2
from transformers import pipeline
load_dotenv()
hugging_token = os.getenv("HUGGINGFACEHUB_API_TOKEN")
app = FastAPI()
model_name = "finiteautomata/bertweet-base-sentiment-analysis"
client = InferenceClient(token=hugging_token ,model=model_name)

sentiment_pipeline = pipeline("sentiment-analysis", model="finiteautomata/bertweet-base-sentiment-analysis")


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

    return score, item.hash


@app.post("/ValidatePost2/")
async def validate_post(item: Item):

    score = post_validator2.validate_post(item.content, sentiment_pipeline)

    return score, item.hash

@app.post("/RewritePost/")
async def validate_post(item: Item):

    #implement real

    return "Sample Text"
