def validate_post(content, pipeline):
    result = pipeline(content)
    return result[0]