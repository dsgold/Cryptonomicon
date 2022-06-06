const bc = new BroadcastChannel('test-channel');


export const sendMessage = (tickers) => {
    bc.postMessage(tickers);
}

export const subscribeToBroadcast = () => {
    bc.addEventListener('message', e => {
        return e.data
    })
}
