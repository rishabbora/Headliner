#!/usr/bin/env python3
import json
import feedparser
import urllib.parse
import sys
import re

def clean_headline(text: str) -> str:
    if re.search(r'\d', text):
        return ''
    text = text.lower()
    text = re.sub(r'[^a-z\s\.,]', '', text)
    text = re.sub(r'\s+', ' ', text).strip()
    if text and not text.endswith('.'):
        text += '.'
    return text

def getHeadlines(query: str, n: int = 10):
    if not query.strip():
        return ["", [], []]

    # build RSS URL
    q        = urllib.parse.quote_plus(query)
    feed_url = f"https://news.google.com/rss/search?q={q}&hl=en-US&gl=US&ceid=US:en"
    feed     = feedparser.parse(feed_url)

    cleaned_headlines = []
    links = []

    for entry in feed.entries:
        # drop the " - Source" suffix
        title = entry.title.split(' - ')[0]
        cleaned = clean_headline(title)
        if cleaned:
            cleaned_headlines.append(cleaned)
            links.append(entry.link)
        if len(cleaned_headlines) >= n:
            break

    combined = " ".join(cleaned_headlines)
    return [combined, cleaned_headlines, links]

query = sys.argv[1] if len(sys.argv) > 1 else ""
output = getHeadlines(query)

print(json.dumps(output, ensure_ascii=False))
sys.stdout.flush()
