import './App.css'

console.log("Content Script loaded.");

function detectDarkMode(): boolean {
  // Check site theme first
  const html = document.documentElement;

  if (
    html.classList.contains("dark") ||
    html.classList.contains("dark-mode")
  ) {
    return true;
  }

  // Fall back to background color
  const bg = window.getComputedStyle(document.body).backgroundColor;

  const rgb = bg.match(/\d+/g);

  if (!rgb) return false;

  const [r, g, b] = rgb.map(Number);

  const brightness =
    (r * 299 + g * 587 + b * 114) / 1000;

  return brightness < 128;
}

// Grabbing basic info from the site
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

let isDark = detectDarkMode();

// Helper function to create a warning block HTML element
function createWarning(link: HTMLAnchorElement) {
  const warning = document.createElement("div");
  warning.textContent = "⚠️ This link may be unsafe.";

  if (isDark) {
    warning.style.background = "#3f3b3b";
  } else {
    warning.style.background = "#ffe4e4";
  }
  
  warning.style.border = "2px solid purple";
  warning.style.padding = "8px";
  warning.style.marginBottom = "4px";
  warning.style.maxWidth = "125px";

  link.parentNode?.insertBefore(warning, link);
}

// Looks at the list above for any links containing these words 
// and creates a warning there in the page
const susWords = ["click here", "gift card", "password", "urgent", "information", "reset", "secure"];
function highlightSusLinks() {
  const links = document.querySelectorAll("a");
  for (const link of links) {
    for (const word of susWords) {
      if (link.text.includes(word)) {
        link.classList.add("highlight-link");
        createWarning(link);
        console.log("found sus link: ", link.text);
        break;
      }
    }
  }
}

highlightSusLinks();

function showMascot() {
  const img = document.createElement("img");

  let whichMILEoh = "MILE-oh_lightmode.jpg";

  if (isDark) {
    whichMILEoh = "MILE-oh_darkmode.jpg"
  } 

  img.src = chrome.runtime.getURL(whichMILEoh);
  img.alt = "Safe Scan Mascot";

  img.style.position = "fixed";
  img.style.bottom = "20px";
  img.style.right = "20px";
  img.style.width = "150px";
  img.style.zIndex = "999999";

  document.body.appendChild(img);
}

showMascot();

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