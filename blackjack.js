/*jshint "laxbreak":true,"shadow":true,"undef":true,"evil":true,"trailing":true,"proto":true,"withstmt":true*/
/*global print, sys, Config, cleanFile, require, module*/
/*TODO: Add split (Top priority)
        Limit /end
        Add currency maybe?
        Add a way to edit config
        Maybe a basic auth system (not sure if really needed)
        Auto end game after x amount of time, in case of AFK-ers
 */
//imported functions from main scripts and other plugins. Variables from here are prefixed with "mainScripts"
var mainScripts = {
    cleanFile: cleanFile,
    dataDir: Config.dataDir,
    Bot: require("bot.js").Bot
};

//blackjack global defines
var blackjackbot, deck, blackjackchan;

var config = {
    bot: "PBSBot", //name of channel bot
    channel: "Blackjack", //channel Blackjack to be played in
    hitlimit: 16, //Upper limit dealer can hit on
    owner: "Bahamut", //default channel owner
    deckNumber: 2 //amount of decks to use
};

var blackJack = {
    phase: "",
    players: {},
    time: -1
};

//blackjack functions

function step() {
    if (isNaN(blackJack.time) || blackJack.time === -1) {
        return;
    }
    if (blackJack.time === 0) {
        startRound();
        blackJack.time = -1;
        return;
    }
    blackJack.time = blackJack.time - 1;
}

function init() {
    config = getConfig();
    blackjackbot = new mainScripts.Bot(config.bot);
    blackjackchan = sys.channelId(config.channel);
    deck = [];
    for (var x = 0; x < config.deckNumber; ++x) {
        deck = deck.concat(createDeck());
    }
}

function handleCommand(src, commandLine, channel) {
    if (channel !== blackjackchan) {
        return false;
    }
    var returnVal = false;
    try {
        testCommand(src, commandLine, channel);
        returnVal = true;
    }
    catch (e) {
        if (e === "Este comando não existe") {
            returnVal = false;
        }
        else {
            blackjackbot.sendMessage(src, e, channel);
            returnVal = true;
        }
    }
    return returnVal;
}

function testCommand(src, commandLine, channel) {
    var index = commandLine.indexOf(' ');
    var command, commandData;
    if (index !== -1) {
        command = commandLine.substr(0, index);
        commandData = commandLine.substr(index + 1);
    }
    else {
        command = commandLine;
    }
    if (command === "start") {
        startGame();
        return;
    }
    if (command === "join") {
        joinGame(src);
        return;
    }
    if (command === "hit") {
        hit(src);
        return;
    }
    if (command === "stand" || command === "stay") {
        stand(src);
        return;
    }
    if (command === "end") {
        endGame();
        return;
    }
    if (command === "check") {
        checkCards(src);
        return;
    }
    throw "Comando não existe.";
}

function onHelp(src, commandData, channel) {
    if (commandData === "blackjack") {
        sys.sendMessage(src, "/start: Inicia uma nova partida.", channel);
        sys.sendMessage(src, "/join: Se junte a uma partida em andamento.", channel);
        sys.sendMessage(src, "/hit: Puxa uma carta.", channel);
        sys.sendMessage(src, "/stand: Permanece com o número atual.", channel);
        sys.sendMessage(src, "/check: Confere as cartas que você tem.", channel);
        sys.sendMessage(src, "/end: Termina a partida em andamento.", channel);
    }
}

function sendBotAll(message, channel) {
    if (channel === undefined) {
        channel = blackjackchan;
    }
    blackjackbot.sendAll(message, channel);
}

function createDeck() {
    var tempdeck = [];
    var cards = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
    var suits = ["♠", "♣", "♦", "♥"];
    for (var a = 0; a < 4; a++) {
        for (var b = 0; b < 13; b++) {
            tempdeck.push(cards[b] + suits[a]);
        }
    }
    return shuffle(tempdeck);
}

function shuffle(tempdeck) {
    var decklength = tempdeck.length;
    for (var i = 0; i < 4; i++) {
        for (var j = 0; j < decklength; j++) {
            var k = sys.rand(0, decklength);
            var temp = tempdeck[j];
            tempdeck[j] = tempdeck[k];
            tempdeck[k] = temp;
        }
    }
    return tempdeck;
}

function getConfig() {
    mainScripts.cleanFile(mainScripts.dataDir + "blackjack.json");
    var configFile = sys.getFileContent(mainScripts.dataDir + "blackjack.json");
    if (configFile === "") {
        return config;
    }
    try {
        return JSON.parse(configFile);
    }
    catch (e) {
        print("Erro na configuração:" + e);
        return config;
    }
}

function getCard() {
    var card = deck[0];
    deck.push(deck.shift());
    return card;
}

function checkTotal(cards) {
    var fcards = ["J", "Q", "K"];
    var ace = 0;
    var total = 0;
    for (var y = 0; y < cards.length; y++) {
        var cardadd;
        if (cards[y][1] == "0") {
            cardadd = cards[y][0] + cards[y][1];
        }
        else {
            cardadd = cards[y][0];
        }
        if (fcards.indexOf(cardadd) !== -1) {
            cardadd = 10;
        }
        if (cardadd == "A") {
            ace = ace + 1;
            cardadd = 11;
        }
        total = total + parseInt(cardadd, 10);
    }
    while (ace > 0 && total > 21) {
        ace = ace - 1;
        total = total - 10;
    }
    return total;
}

function checkCards(src) {
    if (blackJack.phase !== "playing") {
        throw "Espere até que a partida se inicie.";
    }
    if (!blackJack.players.hasOwnProperty(src)) {
        throw "Você não está inscrito nesse jogo!";
    }
    var player = blackJack.players[src];
    if (player.out) {
        throw "Você já está permanecendo com " + player.total;
    }
    blackjackbot.sendMessage(src, "Suas cartas são: " + player.cards + ". Total: " + player.total + ".", blackjackchan);
}

function startGame() {
    if (blackJack.phase !== "") {
        throw "A partida já se iniciou!";
    }
    sendBotAll("Uma nova partida de 21 foi iniciada!");
    sendBotAll("Você tem 30 segundos para se inscrever!");
    blackJack.phase = "joining";
    blackJack.time = 30;
}

function joinGame(src) {
    if (blackJack.phase !== "joining") {
        throw "Você não pode se inscrever agora!";
    }
    if (blackJack.players.hasOwnProperty(src)) {
        throw "Você já se inscreveu!";
    }
    blackJack.players[src] = {
        name: sys.name(src),
        cards: [],
        out: false,
        total: 0,
        type: "normal"
    };
    sendBotAll(sys.name(src) + " se juntou a partida!");
}

function startRound() {
    if (blackJack.phase !== "joining") {
        return;
    }
    if (Object.keys(blackJack.players).length < 1) {
        sendBotAll("Número de jogadores insuficientes.");
        endGame();
        return;
    }
    blackJack.phase = "playing";
    var dealer = blackJack.players.dealer = {
        cards: [],
        out: false,
        total: 0,
        type: "normal"
    };
    dealer.cards.push(getCard());
    dealer.total = checkTotal(dealer.cards);
    sys.sendAll("", blackjackchan);
    sendBotAll("Professor Oak tem um " + dealer.cards + " mostrando.");
    sys.sendAll("", blackjackchan);
    for (var x in blackJack.players) {
        if (blackJack.players.hasOwnProperty(x) && x !== "dealer") {
            var player = blackJack.players[x];
            var name = player.name;
            player.cards.push(getCard(), getCard());
            var cards = player.cards;
            player.total = checkTotal(cards);
            sendBotAll(name + " tem as cartas: " + cards + ". Total: " + player.total + ".");
            if (player.total == 21) {
                sendBotAll(name + " conseguiu 21!");
                player.type = "blackjack";
                player.out = true;
                checkGame();
            }
        }
    }
}

function checkGame() {
    var over = true;
    for (var x in blackJack.players) {
        if (blackJack.players.hasOwnProperty(x) && x !== "dealer") {
            if (blackJack.players[x].out === false) {
                over = false;
            }
        }
    }
    if (over === true) {
        dealerTurn();
    }
}

function dealerTurn() {
    var dealer = blackJack.players.dealer;
    if (dealer.out === true) {
        endRound();
        return;
    }
    if (dealer.total === 21 && dealer.cards.length === 2) {
        sendBotAll("Oak conseguiu 21!");
        dealer.type = "blackjack";
        dealer.out = true;
    }
    if (dealer.total > config.hitlimit && dealer.total < 22) {
        sendBotAll("Oak permanece com: " + dealer.total);
        dealer.out = true;
    }
    if (dealer.total > 21) {
        sendBotAll("Oak explodiu!");
        dealer.out = true;
    }
    if (dealer.total <= config.hitlimit) {
        var card = getCard();
        dealer.cards.push(card);
        dealer.total = checkTotal(dealer.cards);
        sendBotAll("Professor Oak puxou um " + card + ". Ele agora possui " + dealer.cards + " com um total de " + dealer.total + "!");
    }
    dealerTurn();
}

function hit(src) {
    if (blackJack.phase !== "playing") {
        throw "Espere até que a partida se inicie.";
    }
    if (!blackJack.players.hasOwnProperty(src)) {
        throw "Você não está inscrito nesse jogo!";
    }
    var player = blackJack.players[src];
    if (player.out) {
        throw "Você já está permanecendo com " + player.total;
    }
    var card = getCard();
    player.cards.push(card);
    player.total = checkTotal(player.cards);
    sendBotAll(player.name + " puxou um " + card + ". Ele(a) agora possui " + player.cards + " com um total de " + player.total + "!");
    checkStatus(src);
}

function stand(src) {
    if (blackJack.phase !== "playing") {
        throw "Espere até que a partida se inicie.";
    }
    if (!blackJack.players.hasOwnProperty(src)) {
        throw "Você não está inscrito nesse jogo!";
    }
    var player = blackJack.players[src];
    if (player.out) {
        throw "Você já está ficando em " + player.total;
    }
    sendBotAll(player.name + " decidiu por permanecer com " + player.total + " (" + player.cards + ")");
    player.out = true;
    checkGame();
}

function checkStatus(src) {
    var player = blackJack.players[src];
    if (player.cards.length === 5 && player.total < 22) {
        sendBotAll(player.name + " conseguiu um streak de 5 cardas!");
        player.out = true;
        player.total = 21;
        player.type = "5 card";
        checkGame();
    }
    else if (player.total == 21) {
        sendBotAll(player.name + " permanece com " + player.total + " (" + player.cards + ")");
        player.out = true;
        checkGame();
    }
    else if (player.total > 21) {
        sendBotAll(player.name + " explodiu!");
        player.out = true;
        checkGame();
    }
}

function endRound() {
    var player, x;
    var dealer = blackJack.players.dealer;
    var winners = [];
    var breakEven = [];
    var losers = [];
    if (dealer.total > 21) {
        for (x in blackJack.players) {
            if (blackJack.players.hasOwnProperty(x) && x !== "dealer") {
                player = blackJack.players[x];
                if (player.total < 22) {
                    winners.push(player);
                }
                else {
                    losers.push(player);
                }
            }
        }
    }
    else {
        for (x in blackJack.players) {
            if (blackJack.players.hasOwnProperty(x) && x !== "dealer") {
                player = blackJack.players[x];
                if (player.total > 21) {
                    losers.push(player);
                }
                else if (player.total > dealer.total) {
                    winners.push(player);
                }
                else if (player.type === "5 cartas" && dealer.type !== "21") {
                    winners.push(player);
                }
                else if (player.type === "21" && dealer.type !== "21") {
                    winners.push(player);
                }
                else if (player.type === "21" && dealer.type === "21") {
                    breakEven.push(player);
                }
                else if (player.total === dealer.total && player.type === "normal" && dealer.type === "normal") {
                    breakEven.push(player);
                }
                else {
                    losers.push(player);
                }
            }
        }
    }
    showResults(winners, breakEven, losers);
    endGame();
}

function showResults(winners, breakEven, losers) {
    var wOutput = [];
    var beOutput = [];
    var lOutput = [];
    winners.sort(sortResults);
    breakEven.sort(sortResults);
    losers.sort(sortResults);
    for (var x = 0; x < winners.length; x++) {
        wOutput.push(winners[x].name + " com " + (winners[x].type === "normal" ? winners[x].total : winners[x].type) + " (" + winners[x].cards + ")");
    }
    for (var y = 0; y < breakEven.length; y++) {
        beOutput.push(breakEven[y].name + " com " + breakEven[y].total + " (" + breakEven[y].cards + ")");
    }
    for (var z = 0; z < losers.length; z++) {
        lOutput.push(losers[z].name + " com " + losers[z].total + " (" + losers[z].cards + ")");
    }
    sys.sendAll("", blackjackchan);
    if (wOutput.length) {
        sendBotAll("Vencedores: " + wOutput.join(","));
    }
    if (beOutput.length) {
        sendBotAll("Empatados: " + beOutput.join(","));
    }
    if (lOutput.length) {
        sendBotAll("Perdedores: " + lOutput.join(","));
    }
}

function sortResults(a, b) {
    if (a.total > b.total) {
        return 1;
    }
    else if (a.type === "21" && b.type === "normal") {
        return 1;
    }
    else if (a.type === "21" && b.type === "5 cartas") {
        return 1;
    }
    else if (a.type === "5 cartas" && b.type === "normal") {
        return 1;
    }
    else if (a.type === "21" && b.type === "21") {
        return 0;
    }
    else if (a.type === "5 cartas" && b.type === "5 cartas") {
        return 0;
    }
    else if (a.total === b.total && b.type === "normal") {
        return 0;
    }
    else {
        return -1;
    }
}

function endGame() {
    if (blackJack.phase === "") {
        throw "Não existe uma partida em andamento.";
    }
    blackJack.phase = "";
    blackJack.players = {};
    sendBotAll("A partida foi encerrada!");
    shuffle(deck);
    blackJack.time = -1;
}

//exports to main script
module.exports = {
    init: init,
    handleCommand: handleCommand,
    onHelp: onHelp,
    stepEvent: step,
    "help-string": ["blackjack: Para conhecer os comandos para jogar 21 no channel #Blackjack"]
};
