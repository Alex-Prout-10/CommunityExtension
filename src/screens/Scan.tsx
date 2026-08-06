type ScanProps = {
    assessRisk: () => number;
    takeQuiz: () => void;
    quizMenu: () => void;
};

// TODO IMPLEMENT SCRAPPER FOR RISK

// interface WebsiteProps {
//   title: string;
//   url: string;
//   links: number;
//   images: number;
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

export default function ScanScreen({ assessRisk, takeQuiz, quizMenu }: ScanProps) {
    const riskScore = assessRisk();
    
    return (
        <>
            <h3>MILE-oh Scan</h3>
            <h4>Risk Score = {riskScore} / 100</h4>

            <p>Test Scan Page</p>

            <button onClick={takeQuiz} >
                Take Quiz
            </button>

            <button onClick={quizMenu} >
                All Quizzes
            </button>
        </>
    );
}
