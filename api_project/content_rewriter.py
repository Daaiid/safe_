import openai
import os

key = os.getenv("OPENAI_API_TOKEN")

openai.api_key = key

def rewrite_content(content):
    if(key != None):
        completition = openai.ChatCompletion.create(
          model="gpt-3.5-turbo",
          messages=[
            {"role": "system", "content": "Rewrite this so that it is a lot less polarising, it should be the same length as the original and have be a maximum length of 280 characters: %s" %content},
          ]
        )
        return completition.choices[0].message.content
    else:
        return "This text has been removed, no OpenAi API key present"
