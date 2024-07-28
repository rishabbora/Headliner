import sys
import requests
from bs4 import BeautifulSoup
import re

def getHeadlines(query):
    def containsBuzz(sentence, buzz_words):
        for word in sentence.split():
            if word in buzz_words:
                return True
        return False
    lettersMap = {"1": 1, "2": 1,"3": 1,"4": 1,"5": 1,"6": 1,"7": 1,"8": 1,"9": 1,"0": 1,"a":1,"b":1,"c":1,"d":1,"e":1,"f":1,"g":1,"h":1,"i":1,"j":1,"k":1,"l":1,"m":1,"n":1,"o":1,"p":1,"q":1,"r":1,"s":1,"t":1,"u":1,"v":1,"w":1,"x":1,"y":1,"z":1}
    buzzWords = {"i", "highlights", "?", "opinion", "we", "why", "follow", "live", "where", "watch", "who", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "."}
    HeadlinesList = []
    titlesList = []
    LinkList = []
    sentences = ""
    for stringz in list(BeautifulSoup(BeautifulSoup(requests.get(("https://www.google.com/search?sca_esv=2f9758b0c88ecc1b&rlz=1C1RXQR_enUS1096US1097&q="+(query.strip()).replace(" ", "+")+"&tbm=nws&source=lnms&fbs=AEQNm0Aa4sjWe7Rqy32pFwRj0UkWtG_mNb-HwafvV8cKK_h1a5eSkyfXNgRC6a9SKsMT7FIVFrTRcgQ9wgg-AOu0QCUSi1WWZ90AVgAx1eSHdTBok9Q2fTSQzWO1OCYJ_rnk6jM6wKaok6LdMg-L5tVvwzQL17iqyux93GS5cIKEZPMonGnLQjkaB_Bow_uNVRWbzZsX5uhtDC0Py26gPer1CWmQNnh_MQ&sa=X&ved=2ahUKEwjz-9nugfuGAxWLH0QIHUFQBMMQ0pQJegQIERAB&biw=1536&bih=695&dpr=1.25")).content, "html.parser").prettify(), 'html.parser').find_all('div')):
        for line in [line.strip() for line in str(stringz).splitlines()]:
            titlesList.append(line) 
    for i in range(0, len(titlesList)-1):
        if (str(titlesList[i])).strip() == '<div class="BNeawe vvjwJb AP7Wnd">' and str(titlesList[i+1]) not in HeadlinesList:
            if not containsBuzz(str(titlesList[i+1]).lower(), buzzWords) and '?' not in str(titlesList[i+1]) and '\'' not in str(titlesList[i+1]):
                htis = titlesList[i-5]
                match = re.search(r'q=(https?://.*?)(?:&amp;|&|$)', htis)
                if match:
                    extracted_url = match.group(1)
                    LinkList.append(extracted_url)
                
                for characters in (str(titlesList[i+1])).lower():
                    if characters not in lettersMap:
                        if characters in {"’":1, "!":1, ":":1, ".":1, "\'":1}:
                            sentences+=""
                        else:
                            sentences += " "
                    else:
                        sentences+=characters
                    if str(titlesList[i+1]) not in HeadlinesList:
                        HeadlinesList.append(str(titlesList[i+1]))
                if sentences[-1] == " ":sentences = sentences[0:len(sentences)-1]
                sentences+= ". "

    HeadlinesList = [headline.replace("‘", "") for headline in HeadlinesList]
    HeadlinesList = [headline.replace("’", "") for headline in HeadlinesList]
    return [' '.join(sentences.split()), HeadlinesList, LinkList]

data_to_pass_back = getHeadlines("Sports News")

input = sys.argv[1]
output = data_to_pass_back
print(output)
sys.stdout.flush()