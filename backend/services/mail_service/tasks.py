import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from jinja2 import Environment, FileSystemLoader
from celery_app import app
import os


@app.task(name="mail_service.tasks.send_verification_email")
def send_verification_email(firstName, lastName, email_address, verification_token):
    # verification_link = f"http://buildflow.api/auth/verify-email?token={verification_token}"
    verification_link = f"http://26.190.118.118/verify-email?token={verification_token}"

    # Load and render HTML template
    env = Environment(loader=FileSystemLoader("templates"))
    template = env.get_template("verification_email.html")
    html_content = template.render(
        first_name=firstName, last_name=lastName, verification_link=verification_link
    )

    msg = MIMEMultipart("alternative")
    msg["Subject"] = "Welcome to BuildFlow! Verify Your Email"
    msg["From"] = "TolikOverTCP@yandex.ru"
    msg["To"] = email_address

    # Attach the HTML body
    msg.attach(MIMEText(html_content, "html"))

    try:
        with smtplib.SMTP("mailhog", 1025) as server:
            server.send_message(msg)
        print(f"✅ HTML email sent to {msg['To']}")
    except Exception as e:
        print(f"❌ Failed to send HTML email: {e}")

    # try:
    #     # Connect to the Yandex SMTP server using SSL
    #     with smtplib.SMTP_SSL('smtp.yandex.ru', 465) as server:
    #         server.login('TolikOverTCP', 'twniwobohajbzeat')
    #         server.sendmail("TolikOverTCP@yandex.ru", email_address, msg.as_string())
    #     print("Email sent successfully!")
    # except Exception as e:
    #     print("Error sending email:", e)
