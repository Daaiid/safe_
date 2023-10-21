# safe_

A HSLU HackSTAIR project in the middle of October 2023.

## Goal
Protecting Twitter users from polarizing, overly negative or hurtful content through sentiment analysis.

## Prerequisites
- Compatible Browser: [Google Chrome](https://www.google.com/chrome/) or [Microsoft Edge](https://www.microsoft.com/en-us/edge/download)
- Twitter account

## Usage

### Variant 1: Hosted API (recommended, only inside HSLU network)


1. Clone this repository
2. Configure your browser to allow insecure content for `twitter.com`
See detailed Instructions for [Google Chrome]() and [Microsoft]()
3. Manage Extensions - turn on developer mode
4. Manage Extensions - "Load unpacked" and browse to `<Repo>/client/addon`


### Variant 2: local API (recommended, only inside HSLU network)

1. go open api_project folder in command line
2. run `pip install -r requirements.txt`
3. run `python -m uvicorn main:app --host 0.0.0.0 --port 8000`

