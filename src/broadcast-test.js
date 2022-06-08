export const bc = new BroadcastChannel('test-channel');


export const sendMessage = (message) => {
    bc.postMessage(JSON.stringify(message));
}

