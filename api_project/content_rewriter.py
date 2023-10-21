import openai
import json
openai.api_key = open("key.txt", "r").read()


def rewrite_content(content):
    completition = openai.ChatCompletion.create(
      model="gpt-3.5-turbo",
      messages=[
        {"role": "system", "content": "Rewrite this so that it is a lot less polarising, it should be the same length as the original and have be a maximum length of 280 characters: %s" %content},
      ]
    )
    return completition.choices[0].message.content


print(rewrite_content("They just happened to find 50,000 ballots late last night. The USA is embarrassed by fools. Our Election Process is worse than that of third world countries!"))
