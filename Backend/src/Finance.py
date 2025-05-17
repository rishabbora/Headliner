#!/usr/bin/env python3
import json
import feedparser
import urllib.parse
import sys
import re

def clean_headline(text: str) -> str:
    # 1) drop headlines with any digit
    if re.search(r'\d', text):
        return ''
    # 2) lowercase
    text = text.lower()
    # 3) remove everything except letters, spaces, periods and commas
    text = re.sub(r'[^a-z\s\.,]', '', text)
    # 4) collapse multiple spaces
    text = re.sub(r'\s+', ' ', text).strip()
    # 5) ensure it ends with exactly one period
    if text and not text.endswith('.'):
        text += '.'
    return text

def getHeadlines(n=10):
    full_query = "Finance News"
    q          = urllib.parse.quote_plus(full_query)
    feed_url   = f"https://news.google.com/rss/search?q={q}&hl=en-US&gl=US&ceid=US:en"
    feed       = feedparser.parse(feed_url)

    cleaned_headlines = []
    links = []

    for entry in feed.entries:
        # strip off " - Source" suffix
        title = entry.title.split(' - ')[0]
        cleaned = clean_headline(title)
        if cleaned:
            cleaned_headlines.append(cleaned)
            links.append(entry.link)
        if len(cleaned_headlines) >= n:
            break

    combined = " ".join(cleaned_headlines)
    return [combined, cleaned_headlines, links]

# run immediately and emit JSON
output = getHeadlines()
print(json.dumps(output, ensure_ascii=False))
sys.stdout.flush()
