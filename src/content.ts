console.log("Content Script loaded.");

function scrapeSite() {
    const title = document.title;
    const url = document.URL;
    const links = document.links.length;
    const images = document.images.length;
    const webInfo = [title, url, links, images];

    return webInfo;
}

// Listens for scan button click and sends basic info about the current website
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  
  if (message.type === "SCRAPE_SITE") {
    
    const result = scrapeSite();

    const basicInfo = {
      title: result[0],
      url: result[1],
      links: result[2],
      images: result[3]
    };

    sendResponse(basicInfo);
  }

  return true;
});