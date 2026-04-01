import random
import string


def generate_verification_code():

    verification_code = ''.join(random.choices(
        string.ascii_letters + string.digits, k=12))

    return verification_code
