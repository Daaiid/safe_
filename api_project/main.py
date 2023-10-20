from fastapi import FastAPI

app = FastAPI()


@app.post("/ValidatePost/")
async def validate_post(string: post_content):

    #here comes the post_validator

    return item