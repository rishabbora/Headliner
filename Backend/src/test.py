
import sys
import feedparser
import urllib.parse

def getHeadlines(query, n=10):
  
    full_query = f"{query} news"
    q = urllib.parse.quote_plus(full_query)
    feed_url = f"https://news.google.com/rss/search?q={q}&hl=en-US&gl=US&ceid=US:en"
    
    feed = feedparser.parse(feed_url)
    entries = feed.entries[:n]
    
    headlines_list = [entry.title for entry in entries]
    links_list     = [entry.link  for entry in entries]
    
    sentences = ""
    for h in headlines_list:
        sentences += h + ". "
    combined_string = " ".join(sentences.split())
    
    return [combined_string, headlines_list, links_list]



    



data_to_pass_back = getHeadlines("Finance News")

input = sys.argv[0]
print(sys.argv)
output = data_to_pass_back
print(output)
sys.stdout.flush()
