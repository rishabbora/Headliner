
import feedparser
import urllib.parse
import sys
import re
import random
import json

def clean_headline(text):
    if re.search(r'\d', text):
        return ''
    text = text.lower()
    text = re.sub(r'[^a-z\s\.,]', '', text)
    text = re.sub(r'\s+', ' ', text).strip()
    if text and not text.endswith('.'):
        text += '.'
    return text

def getHeadlines(query, n=10):
    if not query.strip():
        return ["", [], []]
    q= urllib.parse.quote_plus(query)
    feed_url= f"https://news.google.com/rss/search?q={q}&hl=en-US&gl=US&ceid=US:en"
    feed= feedparser.parse(feed_url)
    cleaned_headlines = []
    links = []
    headlines = []
    for entry in feed.entries:
        title = entry.title.split(' - ')[0]
        headlines.append(title)
    
    random.shuffle(headlines)
    finalHeadlines = []

    for headline in headlines:
        cleaned = clean_headline(headline)
        if cleaned:
            finalHeadlines.append(headline)
            cleaned_headlines.append(cleaned)
            links.append(entry.link)
        if len(cleaned_headlines) >= n:
            break

    combined = " ".join(cleaned_headlines)
    return [combined, finalHeadlines, links]

query = sys.argv[1] if len(sys.argv) > 1 else ""
output = getHeadlines(query)

print(json.dumps(output, ensure_ascii=False))
sys.stdout.flush()
