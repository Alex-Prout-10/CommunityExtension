import './App.css'

console.log("Content Script loaded.");

function scrapeSite() {
    const title = document.title;
    const url = document.URL;
    const links = document.links.length;
    const images = document.images.length;
    const webInfo = [title, url, links, images];

    return webInfo;
}

// function getHTMLheaders() {
//   const h1s = document.querySelectorAll("h1");
//   console.log("~~~~H1 HTML Elements~~~~");
//   for (const header of h1s) {
//     console.log(header);
//   }

//   const h2s = document.querySelectorAll("h2");
//   console.log("~~~~H2 HTML Elements~~~~");
//   for (const header of h2s) {
//     console.log(header);
//   }

//   const h3s = document.querySelectorAll("h3");
//   console.log("~~~~H3 HTML Elements~~~~");
//   for (const header of h3s) {
//     console.log(header);
//   }
// }

function highlightLinks() {
  const links = document.querySelectorAll("a");
  for (const link of links) {
    link.classList.add("highlight-link");
  }
}

highlightLinks();

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