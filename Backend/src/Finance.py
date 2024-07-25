import sys
import requests
from bs4 import BeautifulSoup

def getHeadlines(query):
    return "These are the latest finance articles"

data_to_pass_back = getHeadlines("Finance News")
print(data_to_pass_back)
sys.stdout.flush()
