import asyncio
import imaplib
import email
from email.header import decode_header
import httpx
import os
import tempfile
import time
from app.config import settings
from app.core.logging import get_logger
from app.core.database import AsyncSessionLocal
from app.models.communication import Communication
from app.services.email_classifier import classify_email, generate_vendor_reply

logger = get_logger(__name__)

# Wait slightly for the backend server to boot up
API_UPLOAD_URL = "http://localhost:8000/api/v1/invoices/intake/document"
API_LOGIN_URL = "http://localhost:8000/api/v1/auth/login"

async def get_auth_token():
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(API_LOGIN_URL, json={"email": "sarah@zampify.ai", "password": "admin123"})
            if resp.status_code == 200:
                return resp.json()["data"]["access_token"]
            logger.error(f"Failed to authenticate script: {resp.text}")
    except Exception as e:
        logger.error(f"Auth error: {str(e)}")
    return None

def clean_subject(subject):
    if not subject:
        return ""
    decoded_list = decode_header(subject)
    res = ""
    for decoded_string, charset in decoded_list:
        if isinstance(decoded_string, bytes):
            charset = charset or "utf-8"
            res += decoded_string.decode(charset, errors="ignore")
        else:
            res += decoded_string
    # Strip emojis/special characters that Windows charmap might choke on
    return res.encode('ascii', errors='ignore').decode('ascii')

async def process_email(msg, mail, num):
    """Extracts PDF attachments and uploads them to the API."""
    subject = clean_subject(msg.get("Subject"))
    sender = msg.get("From")
    
    # Extract body
    body = ""
    if msg.is_multipart():
        for part in msg.walk():
            if part.get_content_type() == "text/plain":
                body += part.get_payload(decode=True).decode(errors="ignore")
    else:
        body = msg.get_payload(decode=True).decode(errors="ignore")
        
    logger.info(f"Processing Email: {subject} from {sender}")
    
    classification = await classify_email(subject, body)
    intent = classification.get("intent", "INVOICE_SUBMISSION")
    logger.info(f"Email Intent Classified: {intent} - {classification.get('reason')}")
    
    async with AsyncSessionLocal() as db:
        if intent == "MALICIOUS":
            comm = Communication(
                email_subject=subject,
                email_body=body,
                classification="spam",
            )
            db.add(comm)
            await db.commit()
            logger.warning(f"Malicious email moved to spam.")
            mail.store(num, '+FLAGS', '\\Seen')
            return
            
        elif intent == "VENDOR_QUERY":
            reply = await generate_vendor_reply(subject, body)
            comm = Communication(
                email_subject=subject,
                email_body=body,
                classification="sent_reply",
                response_body=reply
            )
            db.add(comm)
            await db.commit()
            logger.info(f"Generated auto-reply for vendor query.")
            mail.store(num, '+FLAGS', '\\Seen')
            return
            
        elif intent == "AMBIGUOUS":
            logger.info(f"Ambiguous email ignored.")
            mail.store(num, '+FLAGS', '\\Seen')
            return
            
    # If INVOICE_SUBMISSION, proceed with processing attachments
    has_pdf = False
    
    # Process attachments
    for part in msg.walk():
        if part.get_content_maintype() == 'multipart':
            continue
        if part.get('Content-Disposition') is None:
            continue
            
        filename = part.get_filename()
        if filename and filename.lower().endswith('.pdf'):
            has_pdf = True
            filepath = os.path.join(tempfile.gettempdir(), filename)
            
            with open(filepath, "wb") as f:
                f.write(part.get_payload(decode=True))
                
            logger.info(f"Downloaded attachment: {filename}")
            
            # Upload to FastAPI
            try:
                token = await get_auth_token()
                headers = {"Authorization": f"Bearer {token}"} if token else {}
                async with httpx.AsyncClient(timeout=30.0) as client:
                    with open(filepath, "rb") as f:
                        files = {"file": (filename, f, "application/pdf")}
                        logger.info(f"Uploading {filename} to {API_UPLOAD_URL}")
                        response = await client.post(API_UPLOAD_URL, files=files, headers=headers)
                        
                    if response.status_code == 202:
                        logger.info(f"Successfully uploaded {filename}. ID: {response.json()['data']['invoice_id']}")
                    else:
                        logger.error(f"Failed to upload {filename}: {response.text}")
            except Exception as e:
                logger.error(f"Error calling API for {filename}: {str(e)}")
            finally:
                if os.path.exists(filepath):
                    os.remove(filepath)
    
    # Mark as read if processed successfully
    if has_pdf:
        mail.store(num, '+FLAGS', '\\Seen')
        logger.info(f"Marked email {num} as Seen.")
    else:
        logger.warning(f"No PDF attachments found in email {num}.")
        # Optionally mark as seen anyway so we don't keep polling it
        mail.store(num, '+FLAGS', '\\Seen')

async def poll_inbox():
    """Connects to IMAP and polls for UNSEEN emails with attachments."""
    if not settings.IMAP_USERNAME or not settings.IMAP_PASSWORD:
        logger.warning("IMAP_USERNAME or IMAP_PASSWORD not set. Email ingestion disabled.")
        return

    logger.info(f"Connecting to IMAP Server: {settings.IMAP_SERVER}:{settings.IMAP_PORT}")
    try:
        mail = imaplib.IMAP4_SSL(settings.IMAP_SERVER, settings.IMAP_PORT)
        mail.login(settings.IMAP_USERNAME, settings.IMAP_PASSWORD)
    except Exception as e:
        logger.error(f"Failed to connect to IMAP: {str(e)}")
        return

    mail.select("inbox")
    
    logger.info("Listening for new emails...")
    while True:
        try:
            # Refresh mailbox state to see newly arrived emails
            mail.select("inbox")
            # Search for unread emails
            status, messages = mail.search(None, "UNSEEN")
            if status == "OK" and messages[0]:
                for num in messages[0].split():
                    # Fetch email body
                    res, msg_data = mail.fetch(num, "(RFC822)")
                    for response_part in msg_data:
                        if isinstance(response_part, tuple):
                            msg = email.message_from_bytes(response_part[1])
                            await process_email(msg, mail, num)
                            
        except Exception as e:
            logger.error(f"Error during IMAP polling: {str(e)}")
            # Attempt to reconnect
            try:
                mail = imaplib.IMAP4_SSL(settings.IMAP_SERVER, settings.IMAP_PORT)
                mail.login(settings.IMAP_USERNAME, settings.IMAP_PASSWORD)
                mail.select("inbox")
            except:
                pass
                
        await asyncio.sleep(10)  # Poll every 10 seconds

if __name__ == "__main__":
    asyncio.run(poll_inbox())
