def validate_post(content, client):
    result = client.text_classification(content)
    return result[0]