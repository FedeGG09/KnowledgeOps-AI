# email
from email.message import EmailMessage
from email.mime.text import MIMEText
# schemas
from schemas.smtpServerModel import MailBody
# others
from ssl import create_default_context
from smtplib import SMTP_SSL
from decouple import config


def send_email(mail: MailBody):
    message = EmailMessage()
    message['From'] = config('EMAIL_USERNAME')
    message['To'] = mail.to
    message['Subject'] = mail.subject

    ctx = create_default_context()

    EMAIL_HOST = config('EMAIL_HOST')
    EMAIL_PORT = config('EMAIL_PORT')
    EMAIL_USERNAME = config('EMAIL_USERNAME')
    EMAIL_PASSWORD = config('EMAIL_PASSWORD')

    message.attach(MIMEText(mail.body, "html"))
    message.set_content(mail.body)

    try:
        with SMTP_SSL(EMAIL_HOST, EMAIL_PORT, context=ctx) as server:

            server.login(
                user=EMAIL_USERNAME,
                password=EMAIL_PASSWORD
            )
            server.sendmail(
                from_addr=EMAIL_USERNAME,
                to_addrs=mail.to,
                msg=message.as_string()
            )

    except Exception as e:
        print(e)
