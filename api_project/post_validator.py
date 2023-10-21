from textblob import TextBlob


def validate_post(content):
    testimonial = TextBlob(content)
    return testimonial.sentiment
