def validate_post(content, pipeline):
    cut_content=content[:280]
    print(cut_content)
    result = pipeline(cut_content)
    return result[0]