

import json
import feedparser
import urllib.parse
import sys
import re
import random

def clean_headline(text: str) -> str:
    if re.search(r'\d', text):
        return ''
    text = text.lower()
    text = re.sub(r'[^a-z\s\.,]', '', text)
    text = re.sub(r'\s+', ' ', text).strip()
    if text and not text.endswith('.'):
        text += '.'
    return text

def getHeadlines(n=10):
    choices = ["Sports News", "US News", "International News", "Foreign Policy News", "Stock Market News", "Sports News"]
    full_query = random.choice(choices)
    q= urllib.parse.quote_plus(full_query)
    feed_url= f"https://news.google.com/rss/search?q={q}&hl=en-US&gl=US&ceid=US:en"
    feed= feedparser.parse(feed_url)

    cleaned_headlines = []
    links = []

    for entry in feed.entries:
        title = entry.title.split(' - ')[0]
        cleaned = clean_headline(title)
        if cleaned:
            cleaned_headlines.append(cleaned)
            links.append(entry.link)
        if len(cleaned_headlines) >= n:
            break

    combined = " ".join(cleaned_headlines)
    return [combined, cleaned_headlines, links]

output = getHeadlines()
print(json.dumps(output, ensure_ascii=False))
sys.stdout.flush()
