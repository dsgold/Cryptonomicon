const API_KEY = '90c29003b6d8418c3f3a1608d1e5035099cc926f5c3b04281414b6c46655a466';
const tickersHandlers = new Map();
const socket = new WebSocket(
    `wss://streamer.cryptocompare.com/v2?api_key=${API_KEY}`
);
// let BTC_USD;
const AGGREGATE_INDEX = "5";

export {getCoinList, subscribeToTicker, unsubscribeFromTicker}

socket.addEventListener("message", e => {
    const {TYPE: type, FROMSYMBOL: currency, PRICE: newPrice} = JSON.parse(
        e.data
    );

    if (type !== AGGREGATE_INDEX || newPrice === undefined) {
        return;
    }
    const handlers = tickersHandlers.get(currency) ?? [];
    handlers.forEach(fn => fn(newPrice));
});

function sendToWebSocket(message) {
    const stringifiedMessage = JSON.stringify(message);

    if (socket.readyState === WebSocket.OPEN) {
        socket.send(stringifiedMessage);
        return;
    }

    socket.addEventListener(
        "open",
        () => {
            socket.send(stringifiedMessage);
        },
        {once: true}
    );
}

function subscribeToTickerOnWs(tickerFrom, tickerTo) {
    sendToWebSocket({
        action: "SubAdd",
        subs: [`5~CCCAGG~${tickerFrom}~${tickerTo}`]
    });
}

function unsubscribeFromTickerOnWs(ticker) {
    sendToWebSocket({
        action: "SubRemove",
        subs: [`5~CCCAGG~${ticker}~USD`]
    });
}

const getCoinList = () => fetch(`https://min-api.cryptocompare.com/data/all/coinlist?summary=true&api_key=${API_KEY}`).then(r => r.json())

const subscribeToTicker = (ticker, cb) => {
    const subscribers = tickersHandlers.get(ticker) || [];
    tickersHandlers.set(ticker, [...subscribers, cb]);
    subscribeToTickerOnWs(ticker, 'USD');
};

const unsubscribeFromTicker = ticker => {
    tickersHandlers.delete(ticker);
    unsubscribeFromTickerOnWs(ticker);
};
