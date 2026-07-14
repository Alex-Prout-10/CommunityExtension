console.log("Content Script loaded.");

function scrapeSite() {
    const title = document.title;
    const url = document.URL;
    const links = document.links.length;
    const images = document.images.length;
    const webInfo = [title, url, links, images];

    return webInfo;
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  console.log("Message received:", message);
  
  if (message.type === "SCRAPE_SITE") {
    
    const result = scrapeSite();

    const basicInfo = {
      title: result[0],
      url: result[1],
      links: result[2],
      images: result[3]
    };

    console.log("Sending response", basicInfo);
    sendResponse(basicInfo);
  }

  return true;
});