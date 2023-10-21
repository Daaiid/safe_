from dotenv import load_dotenv
from langchain.llms import HuggingFaceHub
from huggingface_hub import InferenceClient
import os

load_dotenv()
hugging_token = os.getenv("HUGGINGFACEHUB_API_TOKEN")

from huggingface_hub import InferenceClient

load_dotenv()


# Initialize the InferenceClient with the desired sentiment analysis model
# model_name = "finiteautomata/bertweet-base-sentiment-analysis"
# model_name = "Elytum/tiny-classification-fast-6"
# model_name = "bardsai/twitter-emotion-pl-fast"

client = InferenceClient(token=hugging_token ,model=model_name)

# Input text
trump_tweets = [
    "Fake news media can't handle the truth! They're so biased and dishonest. Sad to see the state of journalism today. #FakeNews #MediaBias",
    "Crooked politicians trying to steal the election! We need to ensure election integrity and protect our democracy. #ElectionIntegrity #StopTheSteal",
    "I've accomplished so much for this great country, and they still can't handle my success. America First, always! #AmericaFirst #Winning",
    "Sleepy Joe Biden is falling asleep in meetings again! We need strong leadership, not someone who can't stay awake. #SleepyJoe #Leadership",
    "The Wall is coming along great, and we're keeping our promise to secure our borders. The fake news won't admit it! #BuildTheWall #SecureBorders",
    "We need to bring back American jobs and stop outsourcing. Let's put America first and make our country great again! #AmericaFirst #Jobs",
    "My supporters are the best, tremendous people! Thank you for standing with me through thick and thin. #MAGA #TrumpSupporters",
    "Radical leftists want to defund the police. We can't let that happen. Law and order must be maintained. #LawAndOrder #BackTheBlue",
    "Fake impeachment witch hunt, they can't accept that I did nothing wrong! Total exoneration. #ImpeachmentHoax #NoCollusion",
    "I've had to fight against the swamp, but we'll drain it and make America great again. Together, we'll win big! #DrainTheSwamp #MAGA",
    "The I speek on stage in florida."
]

# Perform text classification using the InferenceClient
for tweet in trump_tweets:
    results = client.text_classification(tweet)
    print(results)
# Print the classification result
