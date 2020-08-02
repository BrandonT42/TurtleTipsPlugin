import * as Database from "./database";
import * as Backend from "./backend";

// The host name of the current tab
export let Host:string;

// Whether or not the current tab's host is eligible for tips
export let Eligible:boolean = false;

// The current tab's host's public spend key
export let PublicKey:string = undefined;

// Initializes tab monitor
export async function Init() {
    chrome.browserAction.setBadgeBackgroundColor({color: "#2d836d"});
    chrome.tabs.onActivated.addListener(OnTabUpdated);
};

// Resets eligibility
function Reset() {
    Eligible = false;
    PublicKey = undefined;
    chrome.browserAction.setBadgeText({text:""});
}

// When tabs are update
async function OnTabUpdated(TabInfo:any) {
    chrome.tabs.get(TabInfo.tabId, async Tab => {
        // Check if tab has url (new tab does not, for instance)
        if (!Tab.url) {
            Reset();
            return;
        }

        // Get tab host name
        let Url = new URL(Tab.url);
        Host = Url.hostname;

        // Check if host is stored in database
        let HostInfo = await Database.GetHost(Host);
        if (HostInfo) {
            // Update host information
            Eligible = true;
            PublicKey = HostInfo.PublicKey;
            chrome.browserAction.setBadgeText({text:"✓"});
            return;
        }

        // Otherwise, reset
        else Reset();
    });
}