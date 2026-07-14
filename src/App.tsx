import { useState } from 'react'
import './App.css'

interface ScanButtonProps {
  title: string;
  disabled: boolean;
  scan: () => void;
}

interface MascotProps {
  danger: boolean;
}

function Mascot({ danger }: MascotProps) {

  let dangerMessage = "Website looks all good :)";
  if(danger) {
    dangerMessage = "WARNING dangerous website!!";
  }

  return ( <div>
    <p>MIL Helper:</p>
    <p>{dangerMessage}</p>
  </div>);
}

function ScanButton({ title, disabled, scan }: ScanButtonProps) {
  return (
    <button disabled={disabled} onClick={scan}>
      {title}
    </button>
  );
}

function CurrWebsite({ title }: { title:string }) {
  return <p>Website: {title}</p>
}

function handleClick() {
  chrome.tabs.query(
    { active: true, currentWindow: true },
    ([tab]) => {
      if (!tab.id) return;

      console.log("Sending message");
      chrome.tabs.sendMessage(
        tab.id,
        { type: "SCRAPE_SITE" },
        (response) => {

          if (chrome.runtime.lastError) {
            console.error(
              "Message error:",
              chrome.runtime.lastError.message
            );
            return;
          }
          
          console.log("Recieved response...");
          console.log("Response: ", response);
        }
      );
    }
  );
}

function App() {

  const [dangerLevel, setDangerLevel] = useState(false);
  const scanSite = () => { 
    setDangerLevel(prev => !prev);
    handleClick();
  };

  return (
    <div className="pop-up">
      <h4>Safe Scan</h4>
      <CurrWebsite title="google.com" />
      <ScanButton 
      title="Scan Page" 
      disabled={false} 
      scan={scanSite}
      />
      <Mascot danger={dangerLevel}/>
    </div>
  )
}


export default App
