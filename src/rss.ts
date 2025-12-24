import { boolean } from 'drizzle-orm/gel-core';
import { XMLParser } from 'fast-xml-parser';

type RSSFeed = {
  channel: {
    title: string;
    link: string;
    description: string;
    item: RSSItem[];
  };
};

type RSSItem = {
  title: string;
  link: string;
  description: string;
  pubDate: string;
};


export async function fetchFeed(feedURL?: string): Promise<RSSFeed> {
    //fetch data from url
    if(!feedURL ) {
        feedURL = "https://www.wagslane.dev/index.xml";
    };
    const xmlString = await fetchFeedXML(feedURL);
        //parse the data
    const parser = new XMLParser();
    const result = parser.parse(xmlString);


    //verify and build channel field
    verifyChannelField(result);
    const channel = result.rss.channel;
    let rssFeed = buildChannelField(channel);

    //verify and build channel items
    rssFeed = buildChannelItem(rssFeed, channel);
    return rssFeed;
}

export async function fetchFeedXML(url: string): Promise<string> {
    const response = await fetch(url, {
      method: "GET",
      mode: "cors",
      headers: {
        "User-Agent": "gator"
      }
    });
    const xmlString = await response.text();

    return xmlString;
}

function verifyChannelField(result: any): void {
    if (!result.rss.channel) {
        throw new Error("channel field not available");
    };
    
    if (!result.rss.channel.title || !result.rss.channel.link || !result.rss.channel.description) {
        throw new Error ("channel missing required fields");
    };
}

function buildChannelField(channel: any): RSSFeed {
    const title = channel.title;
    const link = channel.link;
    const description = channel.description;
    let rssFeed: RSSFeed = {
        channel: {
            title: title,
            link: link,
            description: description,
            item: []
        }
    };

    return rssFeed;
}

function buildChannelItem(rssFeed: RSSFeed, channel: any): RSSFeed {
    if (!channel.item || !Array.isArray(channel.item)) {
        channel.item = [];
    };
    for (const item of channel.item) {
        if (!item.title || !item.link || !item.description || !item.pubDate) {
            continue; // skip this item
        };
        rssFeed.channel.item.push({
            title: item.title,
            link: item.link,
            description: item.description,
            pubDate: item.pubDate,
        });
    };
    return rssFeed;
}
