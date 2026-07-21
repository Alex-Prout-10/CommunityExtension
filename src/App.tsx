import { useState } from 'react'
import './App.css'
import Home from './screens/Home'
import Scan from './screens/Scan'

// interface ScanButtonProps {
//   title: string;
//   disabled: boolean;
//   scan: () => void;
// }

// interface WebsiteProps {
//   title: string;
//   url: string;
//   links: number;
//   images: number;
// }

// interface MascotProps {
//   danger: boolean;
// }

// function Mascot({ danger }: MascotProps) {

//   let dangerMessage = "Website looks all good :)";
//   if(danger) {
//     dangerMessage = "WARNING dangerous website!!";
//   }

//   return ( <div>
//     <p>MIL Helper:</p>
//     <p>{dangerMessage}</p>
//   </div>);
// }

// function ScanButton({ title, disabled, scan }: ScanButtonProps) {
//   return (
//     <button disabled={disabled} onClick={scan}>
//       {title}
//     </button>
//   );
// }

// function CurrWebsite({ title, url, links, images }: WebsiteProps) {
//   return (
//     <div>
//       <p>Website: {title}</p>
//       <p>URL: {url}</p>
//       <p>{links} links and {images} images</p>
//     </div>);
// }

// // Clicking the scan website button and asking the content.ts for the website info
// const handleClick = (): Promise<any> => {
//   return new Promise((resolve, reject) => {
//     chrome.tabs.query(
//       { active: true, currentWindow: true },
//       ([tab]) => {
//         if (!tab.id) {
//           reject("No tab found");
//           return;
//         }

//         chrome.tabs.sendMessage(
//           tab.id,
//           { type: "SCRAPE_SITE" },
//           (response) => {
//             if (chrome.runtime.lastError) {
//               reject(chrome.runtime.lastError.message);
//               return;
//             }

//             resolve(response);
//           }
//         );
//       }
//     );
//   });
// };

function checkDanger() {
  return 10;
}

function App() {
  const [screen, setScreen] = useState("home");

  if (screen === "home") {
    return <Home scanWeb={() => setScreen("scan")} />;
  }

  if (screen === "scan") {
    return <Scan assessRisk={() => checkDanger()} />;
  }

  // const [dangerLevel, setDangerLevel] = useState(false);
  // const [basicInfo, setWebInfo] = useState({
  //   title: "Unknown",
  //   url: "N/A",
  //   links: 0,
  //   images: 0
  // });

  // const scanSite = async () => { 
  //   setDangerLevel(prev => !prev);

  //   const info = await handleClick();
  //   setWebInfo(info);
  // };

  // return (
  //   <div className="pop-up">
  //     <h4>Safe Scan</h4>
  //     <CurrWebsite 
  //     title={basicInfo.title} 
  //     url={basicInfo.url}
  //     links={basicInfo.links}
  //     images={basicInfo.images}/>
  //     <ScanButton 
  //     title="Scan Page" 
  //     disabled={false} 
  //     scan={scanSite}
  //     />
  //     <Mascot danger={dangerLevel}/>
  //   </div>
  // )
}


export default App
