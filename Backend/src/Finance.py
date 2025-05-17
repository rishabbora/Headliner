#!/usr/bin/env python3
import json
import feedparser
import urllib.parse
import sys
import re
import random

def clean_headline(text):
    if re.search(r'\d', text):
        return ''
    text = text.lower()
    text = re.sub(r'[^a-z\s\.,]', '', text)
    text = re.sub(r'\s+', ' ', text).strip()
    if text and not text.endswith('.'):
        text += '.'
    return text

def getHeadlines(n=10):
    full_query = "Finance News"
    q= urllib.parse.quote_plus(full_query)
    feed_url= f"https://news.google.com/rss/search?q={q}&hl=en-US&gl=US&ceid=US:en"
    feed= feedparser.parse(feed_url)


    cleaned_headlines = []
    links = []
    headlines = []

    for entry in feed.entries:
        
        title = entry.title.split(' - ')[0]
        headlines.append(title)
        cleaned = clean_headline(title)
        if cleaned:
            cleaned_headlines.append(cleaned)
            links.append(entry.link)
        if len(cleaned_headlines) >= n:
            break
    
    random.shuffle(cleaned_headlines)

    combined = " ".join(cleaned_headlines)
    return [combined, headlines, links]

output = getHeadlines()
sys.stdout.flush()
