import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)

def send_notification_email(recipient: str, invoice_number: str, action: str, reason: str, notes: str):
    """
    Sends a notification email to the vendor using the IMAP credentials in .env via SMTP.
    """
    if not settings.IMAP_USERNAME or not settings.IMAP_PASSWORD:
        logger.warning("SMTP credentials not configured. Skipping email send.")
        return

    sender = settings.IMAP_USERNAME
    subject = f"Invoice {invoice_number} Update - Zampify AI"

    # Construct HTML body
    action_color = "#3b82f6" # blue for investigating
    if action == "approved":
        action_color = "#10b981" # green
    elif action == "rejected":
        action_color = "#ef4444" # red
    elif action == "escalated":
        action_color = "#f59e0b" # amber

    html_content = f"""
    <html>
    <body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
        <h2 style="color: {action_color};">Update on Invoice {invoice_number}</h2>
        <p>Your invoice has been marked as <strong>{action.upper()}</strong>.</p>
    """
    if reason:
        html_content += f"<p><strong>Reason:</strong> {reason}</p>"
    if notes:
        html_content += f"<p><strong>Additional Notes:</strong> {notes}</p>"

    html_content += """
        <br/>
        <p>Best regards,<br/>The Zampify AI AP Team</p>
    </body>
    </html>
    """

    msg = MIMEMultipart()
    msg['From'] = f"Zampify AI AP Team <{sender}>"
    msg['To'] = recipient
    msg['Subject'] = subject

    msg.attach(MIMEText(html_content, 'html'))

    try:
        logger.info(f"Connecting to SMTP server {settings.SMTP_SERVER}:{settings.SMTP_PORT}...")
        server = smtplib.SMTP(settings.SMTP_SERVER, settings.SMTP_PORT)
        server.starttls()
        server.login(settings.IMAP_USERNAME, settings.IMAP_PASSWORD)
        server.send_message(msg)
        server.quit()
        logger.info(f"Successfully sent {action} email to {recipient} for invoice {invoice_number}")
    except Exception as e:
        logger.error(f"Failed to send email to {recipient}: {e}")
        raise
