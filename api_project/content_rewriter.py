import openai
import os
openai.api_key = os.getenv("OPENAI_API_TOKEN")


def rewrite_content(content):
    completition = openai.ChatCompletion.create(
      model="gpt-3.5-turbo",
      messages=[
        {"role": "system", "content": "Rewrite this so that it is a lot less polarising, it should be the same length as the original and have be a maximum length of 280 characters: %s" %content},
      ]
    )
    return completition.choices[0].message.content
