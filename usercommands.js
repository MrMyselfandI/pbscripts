exports.handleCommand = function(src, command, commandData, tar, channel) {
    // loop indices
    var i, x;
    // temp array
    var ar;
    if (command == "commands" || command == "command") {
        if (commandData === undefined) {
            sys.sendMessage(src, "*** Comandos ***", channel);
            for (x = 0; x < this.help.length; ++x) {
                sys.sendMessage(src, this.help[x], channel);
            }
            sys.sendMessage(src, "*** Outros Comandos ***", channel);
            sys.sendMessage(src, "/commands channel: Para ver os comandos para channels.", channel);
            if (sys.auth(src) > 0 || SESSION.users(src).tempMod) {
                sys.sendMessage(src, "/commands mod: Para ver os comandos de moderador.", channel);
            }
            if (sys.auth(src) > 1 || SESSION.users(src).tempAdmin) {
                sys.sendMessage(src, "/commands admin: Para ver os comandos de administradores.", channel);
            }
            if (sys.auth(src) > 2 || isSuperAdmin(src)) {
                sys.sendMessage(src, "/commands owner: Para ver os comandos de proprietários.", channel);
            }
            var pluginhelps = getplugins("help-string");
            for (var module in pluginhelps) {
                if (pluginhelps.hasOwnProperty(module)) {
                    var help = typeof pluginhelps[module] == "string" ? [pluginhelps[module]] : pluginhelps[module];
                    for (i = 0; i < help.length; ++i)
                        sys.sendMessage(src, "/commands " + help[i], channel);
                }
            }
            return;
        }

        commandData = commandData.toLowerCase();
        if ( (commandData == "mod" && sys.auth(src) > 0 || SESSION.users(src).tempMod)
            || (commandData == "admin" && sys.auth(src) > 1 || SESSION.users(src).tempAdmin)
            || (commandData == "owner" && (sys.auth(src) > 2  || isSuperAdmin(src)))
            || (commandData == "channel") ) {
            sys.sendMessage(src, "", channel);
            sys.sendMessage(src, "*** " + utilities.capitalize(commandData.toLowerCase()) + " commands ***", channel);
            var list = require(commandData+"commands.js").help;
            if (typeof list !== "function") {
                list.forEach(function(help) {
                    sys.sendMessage(src, help, channel);
                });
            } else {
                list(src, channel);
            }
        }
        callplugins("onHelp", src, commandData, channel);

        return;
    }
    if ((command == "me" || command == "rainbow") && !SESSION.channels(channel).muteall) {
        if (SESSION.channels(channel).meoff === true) {
            normalbot.sendMessage(src, "/me foi desligado.", channel);
            return;
        }
        if (commandData === undefined)
            return;
        if (channel == sys.channelId("Trivia") && SESSION.channels(channel).triviaon) {
            sys.sendMessage(src, "±Trivia: Respostas usando \\a, /me não estão permitidas agora..", channel);
            return;
        }
        if (usingBannedWords() || repeatingOneself() || capsName()) {
            sys.stopEvent();
            return;
        }
        if (SESSION.users(src).smute.active) {
            sys.playerIds().forEach(function(id) {
                if (sys.loggedIn(id) && SESSION.users(id).smute.active && sys.isInChannel(src, channel)) {
                    var colour = script.getColor(src);
                    sys.sendHtmlMessage(id, "<font color='"+colour+"'><timestamp/> *** <b>" + utilities.html_escape(sys.name(src)) + "</b> " + commandData + "</font>", channel);
                }
            });
            sys.stopEvent();
            script.afterChatMessage(src, '/'+command+ ' '+commandData,channel);
            return;
        }
        SESSION.channels(channel).beforeMessage(src, "/me " + commandData);
        commandData=utilities.html_escape(commandData);
        var messagetosend = commandData;
        if (typeof CAPSLOCKDAYALLOW != 'undefined' && CAPSLOCKDAYALLOW === true) {
            var date = new Date();
            if ((date.getDate() == 22 && date.getMonth() == 9) || (date.getDate() == 28 && date.getMonth() == 5)) { // October 22nd & June 28th
                messagetosend = messagetosend.toUpperCase();
            }
        }
        if (channel === sys.channelId("Tohjo Falls") && script.reverseTohjo === true) {
            messagetosend = messagetosend.split("").reverse().join("");
        }
        if (command == "me") {
            var colour = script.getColor(src);
            sendChanHtmlAll("<font color='" + colour + "'><timestamp/> *** <b>" + utilities.html_escape(sys.name(src)) + "</b> " + messagetosend + "</font>", channel);
        }
        else if (command == "rainbow" && !script.isOfficialChan(channel)) {
            var auth = 1 <= sys.auth(src) && sys.auth(src) <= 3;
            var colours = ["#F85888", "#F08030", "#F8D030", "#78C850", "#98D8D8", "#A890F0", "#C183C1"];
            var colour = sys.rand(0, colours.length);
            var randColour = function () {
                var returnVal = colours[colour];
                colour = colour + 1;
                if (colour === colours.length) {
                    colour = 0;
                }
                return returnVal;
            };
            var toSend = ["<timestamp/><b>"];
            if (auth) toSend.push("<span style='color:" + randColour() + "'>+</span><i>");
            var name = sys.name(src);
            for (var j = 0; j < name.length; ++j)
                toSend.push("<span style='color:" + randColour() + "'>" + utilities.html_escape(name[j]) + "</span>");
            toSend.push("<span style='color:" + randColour() + "'>:</b></span> ");
            if (auth) toSend.push("</i>");
            toSend.push(messagetosend);
            sendChanHtmlAll(toSend.join(""), channel);
        }
        script.afterChatMessage(src, '/' + command + ' ' + commandData, channel);
        return;
    }
    if (command == "contributors") {
        sys.sendMessage(src, "", channel);
        sys.sendMessage(src, "*** CONTRIBUIDORES ***", channel);
        sys.sendMessage(src, "", channel);
        for (var x in script.contributors.hash) {
            if (script.contributors.hash.hasOwnProperty(x)) {
                sys.sendMessage(src, x + " contribuiu com: " + script.contributors.get(x), channel);
            }
        }
        sys.sendMessage(src, "", channel);
        return;
    }
    if (command == "league") {
        if (!Config.League) return;
        sys.sendMessage(src, "", channel);
        sys.sendMessage(src, "*** LIGA OFICIAL DO SERVIDOR ***", channel);
        sys.sendMessage(src, "", channel);
        ar = Config.League;
        for (x = 0; x < ar.length; ++x) {
            if (ar[x].length > 0) {
                sys.sendHtmlMessage(src, "<span style='font-weight: bold'>" + utilities.html_escape(ar[x][0].toCorrectCase()) + "</span> - " + ar[x][1].format(utilities.html_escape(ar[x][0])) + " " + (sys.id(ar[x][0]) !== undefined ? "<span style='color: green'>(online)</span>" : "<span style='color: red'>(offline)</span>"), channel);
            }
        }
        sys.sendMessage(src, "", channel);
        return;
    }
    if (command == "rules") {
        if (commandData === "mafia") {
            require('mafia.js').showRules(src, channel);
            return;
        }
        var norules = (rules.length-1)/2; //formula for getting the right amount of rules
        if(commandData !== undefined && !isNaN(commandData) && commandData >0 && commandData < norules){
            var num = parseInt(commandData, 10);
            num = (2*num)+1; //gets the right rule from the list since it isn't simply y=x it's y=2x+1
            sys.sendMessage(src, rules[num], channel);
            sys.sendMessage(src, rules[num+1], channel);
            return;
        }
        for (var rule = 0; rule < rules.length; rule++) {
            sys.sendMessage(src, rules[rule], channel);
        }
        return;
    }
    if (command == "players") {
        if (commandData) {
            commandData = commandData.toLowerCase();
        }
        if (["windows", "linux", "android", "mac", "webclient"].indexOf(commandData) !== -1) {
            var android = 0;
            sys.playerIds().forEach(function (id) {
                if (sys.os(id) === commandData) {
                    android += 1;
                }
            });
            countbot.sendMessage(src, "There are  " + android + " " + commandData + " players online", channel);
            return;
        }
        if (commandData == "top" || commandData == "max") {
            countbot.sendMessage(src, "O maior número de jogadores online foi " + sys.getVal("MaxPlayersOnline") + ".", channel);
            return;
        }
        countbot.sendMessage(src, "Possuimos " + sys.numPlayers() + " jogadores online nesse momento.", channel);
        return;
    }
    if (command == "ranking") {
        var announceTier = function(tier) {
            var rank = sys.ranking(sys.name(src), tier);
            if (rank === undefined) {
                rankingbot.sendMessage(src, "Você não está rankeado na tier " + tier + "!", channel);
            } else {
                rankingbot.sendMessage(src, "O seu rank na tier " + tier + " é " + rank + "/" + sys.totalPlayersByTier(tier) + " [" + sys.ladderRating(src, tier) + " pontos / " + sys.ratedBattles(sys.name(src), tier) +" batalhas]!", channel);
            }
        };
        if (commandData !== undefined) {
            if (sys.totalPlayersByTier(commandData) === 0)
                rankingbot.sendMessage(src, commandData + " não é uma tier.", channel);
            else
                announceTier(commandData);
        } else {
            [0,1,2,3,4,5].slice(0, sys.teamCount(src))
                .map(function(i) { return sys.tier(src, i); })
                .filter(function(tier) { return tier !== undefined; })
                .sort()
                .filter(function(tier, index, array) { return tier !== array[index-1]; })
                .forEach(announceTier);
        }
        return;
    }
    if (command == "battlecount") {
        if (!commandData || commandData.indexOf(":") == -1) {
            rankingbot.sendMessage(src, "Forma de usar: /battlecount usuário:tier", channel);
            return;
        }
        var stuff = commandData.split(":");
        var name = stuff[0];
        var tier = utilities.find_tier(stuff[1]);
        var rank = sys.ranking(name, tier);
        if (!tier) {
            rankbot.sendMessage(stuff[1] + " não é uma tier.", channel);
            return;
        }
        if (rank === undefined) {
            rankingbot.sendMessage(src, "Este usuário não está rankeado na tier " + tier + " !", channel);
        } else {
            rankingbot.sendMessage(src, name + " tem, na tier " + tier + " o rank de " + rank + "/" + sys.totalPlayersByTier(tier) + " [" + sys.ratedBattles(name, tier) +" battles]!", channel);
        }
        return;
    }
    if (command == "auth") {
        var DoNotShowIfOffline = ["loseyourself", "oneballjay"];
        var filterByAuth = function(level) { return function(name) { return sys.dbAuth(name) == level; }; };
        var printOnlineOffline = function(name) {
            if (sys.id(name) === undefined) {
                if (DoNotShowIfOffline.indexOf(name) == -1) sys.sendMessage(src, name, channel);
            } else {
                sys.sendHtmlMessage(src, "<timestamp/><font color = " + sys.getColor(sys.id(name)) + "><b>" + name.toCorrectCase() + "</b></font>", channel);
            }
        };
        var authlist = sys.dbAuths().sort();
        sys.sendMessage(src, "", channel);
        switch (commandData) {
            case "owners":
                sys.sendMessage(src, "*** Proprietários ***", channel);
                authlist.filter(filterByAuth(3)).forEach(printOnlineOffline);
                break;
            case "admins":
            case "administrators":
                sys.sendMessage(src, "*** Administradores ***", channel);
                authlist.filter(filterByAuth(2)).forEach(printOnlineOffline);
                break;
            case "mods":
            case "moderators":
                sys.sendMessage(src, "*** Moderadores ***", channel);
                authlist.filter(filterByAuth(1)).forEach(printOnlineOffline);
                break;
            default:
                sys.sendMessage(src, "*** Proprietários ***", channel);
                authlist.filter(filterByAuth(3)).forEach(printOnlineOffline);
                sys.sendMessage(src, '', channel);
                sys.sendMessage(src, "*** Administradores ***", channel);
                authlist.filter(filterByAuth(2)).forEach(printOnlineOffline);
                sys.sendMessage(src, '', channel);
                sys.sendMessage(src, "*** Moderadores ***", channel);
                authlist.filter(filterByAuth(1)).forEach(printOnlineOffline);
        }
        sys.sendMessage(src, '', channel);
        return;
    }
    if (command == "sametier") {
        if (commandData == "on") {
            battlebot.sendMessage(src, "Você agora força o encontro de apenas usuários com a mesma tier que você na ladder.", channel);
            SESSION.users(src).sametier = true;
        } else if (commandData == "off") {
            battlebot.sendMessage(src, "Você agora permite encontrar diferentes tiers na ladder.", channel);
            SESSION.users(src).sametier = false;
        } else {
            battlebot.sendMessage(src, "Atualmente: " + (SESSION.users(src).sametier ? "forçando mesma tier" : "permitindo diferentes tiers") + ". Use /sametier on/off para trocar isso!", channel);
        }
        script.saveKey("forceSameTier", src, SESSION.users(src).sametier * 1);
        return;
    }
    if (command == "idle") {
        if (commandData == "on") {
            battlebot.sendMessage(src, "Você agora está inativo para batalhas.", channel);
            script.saveKey("autoIdle", src, 1);
            sys.changeAway(src, true);
        } else if (commandData == "off") {
            battlebot.sendMessage(src, "Você está agora ativo para batalhas!", channel);
            script.saveKey("autoIdle", src, 0);
            sys.changeAway(src, false);
        } else {
            battlebot.sendMessage(src, "Atualmente " + (sys.away(src) ? "inativo" : "ativo para batalhas") + ". Use /idle on/off para trocar isto.", channel);
        }
        return;
    }
    if (command == "selfkick" || command == "sk") {
        var src_ip = sys.ip(src);
        var players = sys.playerIds();
        var players_length = players.length;
        for (var i = 0; i < players_length; ++i) {
            var current_player = players[i];
            if ((src != current_player) && (src_ip == sys.ip(current_player))) {
                sys.kick(current_player);
                normalbot.sendMessage(src, "Suas alts foram chutadas do servidor.");
            }
        }
        return;
    }
    if (command == "topic") {
        SESSION.channels(channel).setTopic(src, commandData);
        return;
    }
    if (command == "topicadd") {
        if (commandData) {
            if (SESSION.channels(channel).topic.length > 0)
                SESSION.channels(channel).setTopic(src, SESSION.channels(channel).topic + Config.topic_delimiter + commandData);
            else
                SESSION.channels(channel).setTopic(src, commandData);
        }
        return;
    }
    if (command == "removepart") {
        var topic = SESSION.channels(channel).topic;
        topic = topic.split(Config.topic_delimiter);
        if (isNaN(commandData) || commandData > topic.length) {
            return;
        }
        var part = commandData;
        if (part > 0) {
            part = part -1;
        }
        topic.splice(part, 1);
        SESSION.channels(channel).setTopic(src, topic.join(Config.topic_delimiter));
        return;
    }
    if (command == "updatepart") {
        var topic = SESSION.channels(channel).topic;
        topic = topic.split(Config.topic_delimiter);
        var pos = commandData.indexOf(" ");
        if (pos === -1) {
            return;
        }
        if (isNaN(commandData.substring(0, pos)) || commandData.substring(0, pos) - 1 < 0 || commandData.substring(0, pos) - 1 > topic.length - 1) {
            return;
        }
        topic[commandData.substring(0, pos) - 1] = commandData.substr(pos+1);
        SESSION.channels(channel).setTopic(src, topic.join(Config.topic_delimiter));
        return;
    }
    if (command == "uptime") {
        if (typeof(script.startUpTime()) != "string") {
            countbot.sendMessage(src, "Algo de errado ocorreu e o tempo ativo do servidor não pode ser exibido.", channel);
            return;
        }
        countbot.sendMessage(src, "O server está ativo à "+script.startUpTime(), channel);
        return;
    }
    if (command == "topchannels") {
        var cids = sys.channelIds();
        var limit = (commandData && !isNaN(commandData) ? parseInt(commandData, 10) : 10);
        var l = [];
        for (var i = 0; i < cids.length; ++i) {
            l.push([cids[i], sys.playersOfChannel(cids[i]).length]);
        }
        l.sort(function(a,b) { return b[1]-a[1]; });
        var topchans = l.slice(0, limit);
        channelbot.sendMessage(src, "Channels com mais players:", channel);
        for (var i = 0; i < topchans.length; ++i) {
            sys.sendMessage(src, "" + sys.channel(topchans[i][0]) + " com " + topchans[i][1] + " players.", channel);
        }
        return;
    }
    if (command == "resetpass") {
        if (!sys.dbRegistered(sys.name(src))) {
            normalbot.sendMessage(src, "Você não está registrado!", channel);
            return;
        }
        sys.clearPass(sys.name(src));
        normalbot.sendMessage(src, "Sua senha foi excluida! Não esqueça de se registrar novamente.", channel);
        sys.sendNetworkCommand(src, 14); // make the register button active again
        return;
    }
    if (command == "importable") {
        var teamNumber = 0;
        var bind_channel = channel;
        if (!isNaN(commandData) && commandData >= 0 && commandData < sys.teamCount(src)) {
            teamNumber = commandData;
        }
        var team = script.importable(src, teamNumber, true).join("\n");
        var filename = sys.time() + "-" + sys.rand(1000, 10000) + ".txt";
        sys.writeToFile("usage_stats/formatted/team/"+filename, team);
        normalbot.sendMessage(src, "Seu time pode ser encontrado aqui: http://server.pokemon-online.eu/team/" + filename + " Ele será apagado em 24 horas!", channel);
        return;
    }
    if (command == "cjoin") {
        var chan;
        if (sys.existChannel(commandData)) {
            chan = sys.channelId(commandData);
        } else {
            var name = commandData.toLowerCase();
            for (var i = 0; i < script.chanNameBans.length; ++i) {
                var regexp = script.chanNameBans[i];
                if (regexp.test(name)) {
                    sys.sendMessage(src, 'Este tipo de canal está banido do servidor. (Inflingindo regexp: ' + regexp + ')');
                    return;
                }
            }
            chan = sys.createChannel(commandData);
        }
        if (sys.isInChannel(src, chan)) {
            normalbot.sendMessage(src, "Você já está em #" + commandData, channel);
        } else {
            sys.putInChannel(src, chan);
        }
        return;
    }

    if (command == "register") {
        if (!sys.dbRegistered(sys.name(src))) {
            channelbot.sendMessage(src, "Você precisa estar registrado no servidor para registrar um channel!", channel);
            return;
        }
        if (sys.auth(src) < 1 && script.isOfficialChan(channel)) {
            channelbot.sendMessage(src, "Você não tem autoridade suficiente para registrar esse canal!", channel);
            return;
        }
        if (SESSION.channels(channel).register(sys.name(src))) {
            channelbot.sendMessage(src, "Channel registrado com sucesso! Dê uma olhada em /commands channel.", channel);
        } else {
            channelbot.sendMessage(src, "Este channel já está registrado!", channel);
        }
        return;
    }
    if (command == "cauth") {
        if (typeof SESSION.channels(channel).operators != 'object')
            SESSION.channels(channel).operators = [];
        if (typeof SESSION.channels(channel).admins != 'object')
            SESSION.channels(channel).admins = [];
        if (typeof SESSION.channels(channel).masters != 'object')
            SESSION.channels(channel).masters = [];
        if (typeof SESSION.channels(channel).members != 'object')
            SESSION.channels(channel).members = [];
        channelbot.sendMessage(src, "Os membros do channel " + sys.channel(channel) + " são:", channel);
        channelbot.sendMessage(src, "Proprietários: " + SESSION.channels(channel).masters.join(", "), channel);
        channelbot.sendMessage(src, "Administradores: " + SESSION.channels(channel).admins.join(", "), channel);
        channelbot.sendMessage(src, "Moderadores: " + SESSION.channels(channel).operators.join(", "), channel);
        if (SESSION.channels(channel).inviteonly >= 1 || SESSION.channels(channel).members.length >= 1) {
            channelbot.sendMessage(src, "Membros: " + SESSION.channels(channel).members.join(", "), channel);
        }
        return;
    }
    // Tour alerts
    if(command == "touralerts") {
        if(commandData == "on"){
            SESSION.users(src).tiers = script.getKey("touralerts", src).split("*");
            normalbot.sendMessage(src, "Você ligou alertas para torneios!", channel);
            script.saveKey("touralertson", src, "true");
            return;
        }
        if(commandData == "off") {
            delete SESSION.users(src).tiers;
            normalbot.sendMessage(src, "Você desligou os alertas para torneios!", channel);
            script.saveKey("touralertson", src, "false");
            return;
        }
        if(typeof(SESSION.users(src).tiers) == "undefined" || SESSION.users(src).tiers.length === 0){
            normalbot.sendMessage(src, "Você não tem alertas definidos neste momento!", channel);
            return;
        }
        normalbot.sendMessage(src, "Você é alertado sobre torneios das seguintes tiers:", channel);
        var spl = SESSION.users(src).tiers;
        for (var x = 0; x < spl.length; ++x) {
            if (spl[x].length > 0) {
                normalbot.sendMessage(src, spl[x], channel);
            }
        }
        sys.sendMessage(src, "", channel);
        return;
    }

    if(command == "addtouralert") {
        var tier = utilities.find_tier(commandData);
        if (tier === null) {
            normalbot.sendMessage(src, "O server não reconhece a tier " + commandData + " ", channel);
            return;
        }
        if (typeof SESSION.users(src).tiers == "undefined") {
            SESSION.users(src).tiers = [];
        }
        if (typeof SESSION.users(src).tiers == "string") {
            SESSION.users(src).tiers = SESSION.users(src).tiers.split("*");
        }
        SESSION.users(src).tiers.push(tier);
        script.saveKey("touralerts", src, SESSION.users(src).tiers.join("*"));
        normalbot.sendMessage(src, "Você adicionou um alerta para a tier: " + tier + "!", channel);
        return;
    }
    if(command == "removetouralert") {
        if(typeof SESSION.users(src).tiers == "undefined" || SESSION.users(src).tiers.length === 0){
            normalbot.sendMessage(src, "Você não possui alertas definidos neste momento.", channel);
            return;
        }
        var tier = utilities.find_tier(commandData);
        if (tier === null) {
            normalbot.sendMessage(src, "O server não reconhece a tier " + commandData + " ", channel);
            return;
        }
        var idx = -1;
        while ((idx = SESSION.users(src).tiers.indexOf(tier)) != -1) {
            SESSION.users(src).tiers.splice(idx, 1);
        }
        script.saveKey("touralerts", src, SESSION.users(src).tiers.join("*"));
        normalbot.sendMessage(src, "Você removeu um alerta para a tier: " + tier + "!", channel);
        return;
    }
    // The Stupid Coin Game
    if (command == "coin" || command == "flip") {
        coinbot.sendMessage(src, "Você jogou uma moeda. O resultado é " + (Math.random() < 0.5 ? "Coroa" : "Cara") + "!", channel);
        if (!isNonNegative(SESSION.users(src).coins))
            SESSION.users(src).coins = 0;
        SESSION.users(src).coins++;
        return;
    }
    if (command == "throw") {
        if (channel != sys.channelId("Coins")) {
            coinbot.sendMessage(src, "Não venha jogando por aqui!", channel);
            return;
        }
        if (sys.auth(src) === 0 && SESSION.channels(channel).muteall && !SESSION.channels(channel).isChannelOperator(src)) {
            if (SESSION.channels(channel).muteallmessages) {
                sys.sendMessage(src, SESSION.channels(channel).muteallmessage, channel);
            } else {
                coinbot.sendMessage(src, "Respeite os minutos de silêncio!", channel);
            }
            return;
        }

        if (!isNonNegative(SESSION.users(src).coins) || SESSION.users(src).coins < 1) {
            coinbot.sendMessage(src, "Precisa de mais moedas? Use /flip!", channel);
            return;
        }
        if (tar === undefined) {
            if (!isNonNegative(SESSION.global().coins)) SESSION.global().coins = 0;
            coinbot.sendAll("" + sys.name(src) + " jogou " + SESSION.users(src).coins + " moeda(s) na parede!", channel);
            SESSION.global().coins += SESSION.users(src).coins;
        } else if (tar == src) {
            coinbot.sendMessage(src, "De forma alguma...", channel);
            return;
        } else {
            coinbot.sendAll("" + sys.name(src) + " jogou " + SESSION.users(src).coins + " moeda(s) em " + sys.name(tar) + "!", channel);
            if (!isNonNegative(SESSION.users(tar).coins)) SESSION.users(tar).coins = 0;
            SESSION.users(tar).coins += SESSION.users(src).coins;
        }
        SESSION.users(src).coins = 0;
        return;
    }
    if (command == "casino") {
        var bet = parseInt(commandData, 10);
        if (isNaN(bet)) {
            coinbot.sendMessage(src, "Use: /casino [númerodemoedas]!", channel);
            return;
        }
        if (bet < 5) {
            coinbot.sendMessage(src, "O mínimo para aposta é 5 moedas!", channel);
            return;
        }
        if (bet > SESSION.users(src).coins) {
            coinbot.sendMessage(src, "Você não tem moedas suficientes!", channel);
            return;
        }
        coinbot.sendMessage(src, "Você inseriu as moedas dentro do jogo de Frutas!", channel);
        SESSION.users(src).coins -= bet;
        var res = Math.random();

        if (res < 0.8) {
            coinbot.sendMessage(src, "Você perdeu " + bet + " moedas!", channel);
            return;
        }
        if (res < 0.88) {
            coinbot.sendMessage(src, "Parabéns, dobrou! Você ganhou " + 2*bet + " moedas!", channel);
            SESSION.users(src).coins += 2*bet;
            return;
        }
        if (res < 0.93) {
            coinbot.sendMessage(src, "Parabéns, triplicou! You got " + 3*bet + " coins ", channel);
            SESSION.users(src).coins += 3*bet;
            return;
        }
        if (res < 0.964) {
            coinbot.sendMessage(src, "UOW " + 5*bet + " moedas foram conquistadas!", channel);
            SESSION.users(src).coins += 5*bet;
            return;
        }
        if (res < 0.989) {
            coinbot.sendMessage(src, "PARABÉNS " + 10*bet + " moedas foram conquistadas!", channel);
            SESSION.users(src).coins += 10*bet;
            return;
        }
        if (res < 0.999) {
            coinbot.sendMessage(src, "OMG! " + 20*bet + " moedas são agora suas!", channel);
            SESSION.users(src).coins += 20*bet;
            return;
        } else {
            coinbot.sendMessage(src, "GG CASINO " + 50*bet + " moedas são agora sua.", channel);
            SESSION.users(src).coins += 50*bet;
            return;
        }
    }
    if (command == "myalts") {
        var ip = sys.ip(src);
        var alts = [];
        sys.aliases(ip).forEach(function (alias) {
            if (sys.dbRegistered(alias)) {
                alts.push(alias + " (Registrada)");
            }
            else {
                alts.push(alias);
            }
        });
        bot.sendMessage(src, "Suas alts são: " + alts.join(", "), channel);
        return;
    }
    if (command == "seen") {
        if (commandData === undefined) {
            querybot.sendMessage(src, "Por favor dê um nickname.", channel);
            return;
        }
        var lastLogin = sys.dbLastOn(commandData);
        if(lastLogin === undefined){
            querybot.sendMessage(src, "Este usuário não existe.", channel);
            return;
        }
        if(sys.id(commandData)!== undefined){
            querybot.sendMessage(src, commandData + " está online!", channel);
            return;
        }
        var indx = lastLogin.indexOf("T");
        var date,time;
        if (indx !== -1) {
            date = lastLogin.substr(0, indx);
            time = lastLogin.substr(indx + 1);
        } else {
            date = lastLogin;
        }
        var d;
        if (time) {
            var date = date.split("-");
            var time = time.split(":");
            d = new Date(parseInt(date[0], 10), parseInt(date[1], 10)-1, parseInt(date[2], 10), parseInt(time[0], 10), parseInt(time[1], 10), parseInt(time[2], 10));
        } else {
            var parts = date.split("-");
            d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10)-1, parseInt(parts[2], 10));
        }
        querybot.sendMessage(src, commandData + " foi visto pela ultima vez em: "+ d.toUTCString(), channel);
        return;
    }
    if (command == "dwreleased") {
        var poke = sys.pokeNum(commandData);
        if (!poke) {
            normalbot.sendMessage(src, "Pokémon não existe!", channel); return;
        }
        var pokename = sys.pokemon(poke);
        if (pokedex.dwCheck(poke) === false){
            normalbot.sendMessage(src, pokename + ": não tem habilidade do DW!", channel);
            return;
        }
        if (poke in dwpokemons) {
            if (breedingpokemons.indexOf(poke) == -1) {
                normalbot.sendMessage(src, pokename + ": Completamente Distribuido!", channel);
            } else {
                normalbot.sendMessage(src, pokename + ": Distribuido apenas como macho, impossivel de possuir EGG Moves de gerações anteriores!", channel);
            }
        } else {
            normalbot.sendMessage(src, pokename + ": Não foi distribuido!", channel);
        }
        return;
    }
    if (command === "pokemon") {
        if (!commandData) {
            normalbot.sendMessage(src, "Especifique um pokémon!", channel);
            return;
        }
        var pokeId;
        if (isNaN(commandData)) {
            pokeId = sys.pokeNum(commandData);
        }
        else {
            if (commandData < 1 || commandData > 721) {
                normalbot.sendMessage(src, commandData + " não é um número válido!", channel);
                return;
            }
            pokeId = commandData;
        }
        if (!pokeId) {
            normalbot.sendMessage(src, commandData + " não é um Pokémon válido!", channel);
            return;
        }
        var type1 = sys.type(sys.pokeType1(pokeId));
        var type2 = sys.type(sys.pokeType2(pokeId));
        var ability1 = sys.ability(sys.pokeAbility(pokeId, 0));
        var ability2 = sys.ability(sys.pokeAbility(pokeId, 1));
        var ability3 = sys.ability(sys.pokeAbility(pokeId, 2));
        var baseStats = sys.pokeBaseStats(pokeId);
        var stats = ["HP", "Attack", "Defense", "Sp. Atk", "Sp. Def", "Speed"];
        var levels = [5, 50, 100];
        sys.sendHtmlMessage(src, "", channel);
        sys.sendHtmlMessage(src, "<b><font size = 4># " + pokeId % 65536 + " " + sys.pokemon(pokeId) + "</font></b>", channel);
        sys.sendHtmlMessage(src, "<img src='pokemon:num=" + pokeId + "&gen=6'><img src='pokemon:num=" + pokeId + "&shiny=true&gen=6'>", channel);
        sys.sendHtmlMessage(src, "<b>Tipo:</b> " + type1 + (type2 === "???" ? "" : "/" + type2), channel);
        sys.sendHtmlMessage(src, "<b>Habilidades:</b> " + ability1 + (sys.pokemon(pokeId).substr(0, 5) === "Mega " ? "" : (ability2 === "(No Ability)" ? "" : ", " + ability2) + (ability3 === "(No Ability)" ? "" : ", " + ability3 + " (Hidden Ability)")), channel);
        sys.sendHtmlMessage(src, "<b>Altura:</b> " + pokedex.getHeight(pokeId) + " m", channel);
        sys.sendHtmlMessage(src, "<b>Peso:</b> " + pokedex.getWeight(pokeId) + " kg", channel);
        sys.sendHtmlMessage(src, "<b>Base Power de Low Kick/Grass Knot:</b> " + pokedex.weightPower(pokedex.getWeight(pokeId)), channel);
        var table = "<table border = 1 cellpadding = 3>";
        table += "<tr><th rowspan = 2 valign = middle><font size = 5>Stats</font></th><th rowspan = 2 valign = middle>Base</th><th colspan = 3>Level 5</th><th colspan = 3>Level 50</th><th colspan = 3>Level 100</th></tr>";
        table += "<tr><th>Min</th><th>Max</th><th>Max+</th><th>Min</th><th>Max</th><th>Max+</th><th>Min</th><th>Max</th><th>Max+</th>";
        for (var x = 0; x < stats.length; x++) {
            var baseStat = baseStats[x];
            table += "<tr><td valign = middle><b>" + stats[x] + "</b></td><td><center><font size = 4>" + baseStat + "</font></center></td>";
            for (var i = 0; i < levels.length; i++) {
                if (x === 0) {
                    table += "<td valign = middle><center>" + pokedex.calcHP(baseStat, 31, 0, levels[i]) + "</center></td><td valign = middle><center>" + pokedex.calcHP(baseStat, 31, 252, levels[i]) + "</center></td><td valign = middle><center>-</center></td>";
                }
                else {
                    table += "<td valign = middle><center>" + pokedex.calcStat(baseStat, 31, 0, levels[i], 1) + "</center></td><td valign = middle><center>" + pokedex.calcStat(baseStat, 31, 252, levels[i], 1) + "</center></td><td valign = middle><center>" + pokedex.calcStat(baseStat, 31, 252, levels[i], 1.1) + "</center></td>";
                }
            }
            table += "</tr>";
        }
        table += "</table>";
        sys.sendHtmlMessage(src, table, channel);
        return;
    }
    if (command === "move") {
        if (!commandData) {
            normalbot.sendMessage(src, "Especifique um move!", channel);
            return;
        }
        var moveId = sys.moveNum(commandData);
        if (!moveId) {
            normalbot.sendMessage(src, commandData + " não é um move valido!", channel);
            return;
        }
        var type = sys.type(sys.moveType(moveId));
        var category = pokedex.getMoveCategory(moveId);
        var BP = pokedex.getMoveBP(moveId);
        var accuracy = pokedex.getMoveAccuracy(moveId);
        var PP = pokedex.getMovePP(moveId);
        var contact = (pokedex.getMoveContact(moveId) ? "Sim" : "Não");
        sys.sendHtmlMessage(src, "", channel);
        sys.sendHtmlMessage(src, "<b><font size = 4>" + sys.move(moveId) + "</font></b>", channel);
        var table = "<table border = 1 cellpadding = 2>";
        table += "<tr><th>Type</th><th>Categoria</th><th>Power</th><th>Accuracy</th><th>PP (Max)</th><th>Contato</th></tr>";
        table += "<tr><td><center>" + type + "</center></td><td><center>" + category + "</center></td><td><center>" + BP + "</center></td><td><center>" + accuracy + "</center></td><td><center>" + PP + " (" + PP * 8/5 + ")</center></td><td><center>" + contact + "</center></td></tr>";
        table += "</table>";
        sys.sendHtmlMessage(src, table, channel);
        sys.sendHtmlMessage(src, "", channel);
        sys.sendHtmlMessage(src, "<b>Efeito:</b> " + pokedex.getMoveEffect(moveId), channel);
        sys.sendHtmlMessage(src, "", channel);
        return;
    }
    if (command === "ability") {
        sys.stopEvent();
        if (commandData === "") {
            normalbot.sendMessage(src, "Especifique uma habilidade!", channel);
            return;
        }
        var abilityId = sys.abilityNum(commandData);
        if (!abilityId) {
            normalbot.sendMessage(src, commandData + " não é uma habilidade válida!", channel);
            return;
        }
        sys.sendHtmlMessage(src, "", channel);
        sys.sendHtmlMessage(src, "<b><font size = 4>" + sys.ability(abilityId) + "</font></b>", channel);
        sys.sendHtmlMessage(src, "<b>Efeito:</b> " + pokedex.getAbility(abilityId), channel);
        sys.sendHtmlMessage(src, "", channel);
        return;
    }
    if (command === "item") {
        sys.stopEvent();
        if (commandData === "") {
            normalbot.sendMessage(src, "Especifique um item!", channel);
            return;
        }
        var itemId = sys.itemNum(commandData);
        var berryId = itemId - 8000;
        if (!itemId) {
            normalbot.sendMessage(src, commandData + " não é um item válido!", channel);
            return;
        }
        var isBerry = (commandData.toLowerCase().substr(commandData.length - 5) === "berry");
        var flingPower = isBerry ? "10" : pokedex.getFlingPower(itemId);
        var isGSC = false;
        if (itemId >= 9000 || itemId === 1000 || itemId === 1001 || itemId === 304) {
            isGSC = true;
        }
        sys.sendHtmlMessage(src, "", channel);
        sys.sendHtmlMessage(src, "<b><font size = 4>" + sys.item(itemId) + "</font></b>", channel);
        if (!isGSC) {
            sys.sendHtmlMessage(src, "<img src=item:" + itemId + ">", channel);
        }
        sys.sendHtmlMessage(src, "<b>Efeito:</b> " + (isBerry ? pokedex.getBerry(berryId) : pokedex.getItem(itemId)), channel);
        if (!isGSC) {
            if (flingPower !== undefined) {
                sys.sendHtmlMessage(src, "<b>Base Power de Flingr:</b> " + flingPower, channel);
            }
            if (isBerry) {
                sys.sendHtmlMessage(src, "<b>Tipo de Natural Gift:</b> " + pokedex.getBerryType(berryId), channel);
                sys.sendHtmlMessage(src, "<b>Base Power de Natural Gift:</b> " + pokedex.getBerryPower(berryId), channel);
            }
        }
        sys.sendHtmlMessage(src, "", channel);
        return;
    }
    if (command === "nature" || command === "natures") {
        sys.stopEvent();
        if (commandData) {
            var stats = ["Attack", "Defense", "Special Attack", "Special Defense", "Speed"];
            var effect = pokedex.getNatureEffect(commandData);
            var nature = pokedex.natures[effect[0]][effect[1]];
            if (!nature) {
                normalbot.sendMessage(src, commandData + " não é uma nature válida!", channel);
                return;
            }
            var raised = stats[effect[0]];
            var lowered = stats[effect[1]];
            normalbot.sendMessage(src, "" + nature + " nature aumenta " + raised + " e diminui " + lowered + (raised === lowered ? ", é uma nature neutra" : "") + ".", channel);
            return;
        }
        var stats = ["Attack", "Defense", "Sp. Atk", "Sp. Def", "Speed"];
        var table = "<table border = 1 cellpadding = 3>";
        table += "<tr><th rowspan = 2 colspan = 2 valign = middle><font size = 5>Natures</font></th><th colspan = 5 valign = middle><font size = 4>Raises</font></th></tr>";
        table += "<tr>";
        for (var i = 0; i < 5; i++) {
            table += "<th valign = middle>" + stats[i] + "</th>";
        }
        table += "</tr>";
        for (var x = 0; x < 5; x++) {
            table += "<tr>" + (x === 0 ? "<th valign = middle rowspan = 5><font size = 4>Lowers</font></th>" : "") + "<th>" + stats[x] + "</th>";
            for (var y = 0; y < 5; y++) {
                table += "<td><center>" + script.natures[y][x] + "</center></td>";
            }
            table += "</tr>";
        }
        table += "</table>";
        sys.sendHtmlMessage(src, table, channel);
        return;
    }
    if (command === "canlearn") {
        commandData = commandData.split(":");
        if (commandData.length != 2) {
            normalbot.sendMessage(src, "O formato está incorreto! A forma correta de se usar este comando é /canlearn Pokemon:move", channel);
            return;
        }
        var pokeId = sys.pokeNum(commandData[0]);
        var moveId = sys.moveNum(commandData[1]);
        if (!pokeId) {
            if (!moveId) {
                normalbot.sendMessage(src, "Nem o pokémon nem o move espeficicados existem!", channel);
                return;
            }
            normalbot.sendMessage(src, commandData[0] + " não é um Pokémon válido!", channel);
            return;
        }
        if (!moveId) {
            normalbot.sendMessage(src, commandData[1] + " não é um move válido!", channel);
            return;
        }
        moveId = moveId.toString();
        var allMoves = pokedex.getAllMoves(pokeId);
        var canLearn = (allMoves.indexOf(moveId) != -1);
        normalbot.sendMessage(src, sys.pokemon(pokeId) + " " + (canLearn ? "pode" : "não pode") + " aprender " + sys.move(moveId) + ".", channel);
        return;
    }
    if (-crc32(command, crc32(sys.name(src))) == 22 || command == "wall") {
        if (!isNonNegative(SESSION.global().coins)) SESSION.global().coins=0;
        if (!isNonNegative(SESSION.users(src).coins)) SESSION.users(src).coins=1;
        if (SESSION.global().coins < 100) return;
        coinbot.sendAll("" + sys.name(src) + " encontrou " + SESSION.global().coins + " moedas jogadas na parede!", channel);
        SESSION.users(src).coins += SESSION.global().coins;
        SESSION.global().coins = 0;
        return;
    }
    if(command == "shades"){
        if(sys.name(src).toLowerCase() !== "Mr. Perry"){
            return;
        }
        sys.changeName(src, "(⌐■_■)");
        return;
    }
    if (command == "changetier") {
        commandData = commandData.split(":");
        var tier = utilities.find_tier(commandData[0]);
        var team = 0;
        if (commandData[1] && commandData[1] < sys.teamCount(src) -1) {
            team = commandData[1];
        }
        if (tier && tier_checker.has_legal_team_for_tier(src, team, tier)) {
            sys.changeTier(src, team, tier);
            if (tier == "Battle Factory" || tier == "Battle Factory 6v6") {
                require('battlefactory.js').generateTeam(src, team);
            }
            normalbot.sendMessage(src, "Você agora está na tier " + tier, channel);
            return;
        }
        normalbot.sendMessage(src, "Você não pode trocar sua tier para " + commandData[0], channel);
        return;
    }

    if (command == "invitespec") {
        if (tar === undefined) {
            normalbot.sendMessage(src, "Escolha um usuário online para assitir sua batalha!");
            return;
        }
        if (!sys.battling(src)) {
            normalbot.sendMessage(src, "Você não está batalhando neste momento!");
            return;
        }

        /*if (sys.away(tar)) {
            normalbot.sendMessage(src, "Você não pode convidar pessoas inativas para assistir a sua batalha.");
            return;
        }*/

        /*Delay code ripped from Hangman */
        var now = (new Date()).getTime();
        if (now < SESSION.users(src).inviteDelay) {
            normalbot.sendMessage(src, "Espere antes de enviar outro convite!");
            return;
        }
        sys.sendHtmlMessage(tar, "<font color='brown'><timestamp/><b>±PBS:  </b></font><a href='po:watchplayer/"+ sys.name(src) +"'><b>"+utilities.html_escape(sys.name(src))+"</b> convidou você para assitir a atual batalha dele(a)!</a>");
        SESSION.users(src).inviteDelay = (new Date()).getTime() + 10000;
        return;
    }
    if (command == "notice") {
        var notice = sys.getFileContent(Config.dataDir + "notice.html");
        if (notice) {
            sys.sendHtmlMessage(src, notice, channel);
        } else {
            sys.sendMessage(src, "Sem eventos para mostrar neste momento.");
        }
        return;
    }
    return "no command";
};

exports.help =
    [
        "/rules [x]: Mostra as regras do servidor (x é opcional e mostra uma regra específica).",
        "/ranking: Mostra seu ranking na atual tier, ou em uma específica.",
        "/myalts: Mostra suas alts online.",
        "/me [message]: Envia uma mensagem com *** antes do seu nome.",
        "/rainbow [message]: Envia uma mensagem com seu nome em cor de arco-íris.",
        "/selfkick: Chuta do servidor todas as suas alts online com o mesmo IP.",
        "/importable: Cria uma versão importável do seu time no site do Pokémon Online. Pode ser usado com um número, caso queira um time que não o primeiro.",
        "/dwreleased [Pokémon]: Mostra o status da distribuição da Hidden Ability (HA) de um Pokémon do DW.",
        "/pokemon [Pokémon]: Mostra informações básicas de certo Pokémon. Também pode ser especificado por um número da PokéDex.",
        "/move [move]: Mostra informações básicas sobre um move (em inglês)",
        "/ability [ability]: Mostra informações básicas sobre uma habilidade (em inglês).",
        "/item [item]: Mostra informações básicas sobre um item (em inglês).",
        "/nature [nature]: Mostra o efeito de uma nature. Deixe em branco para mostrar todas as natures",
        "/canlearn: Mostra se um pokémon pode aprender certo movimento. O format é /canlearn [Pokémon]:[move].",
        "/resetpass: Limpa sua senha do servidor (lembre-se de se registrar denovo).",
        "/auth [owners/admins/mods]: Mostra autoridades caso especificado nível, ou mostra todas caso nada seja especificado.",
        "/contributors: Lista os contribuidores do servidor.",
        "/uptime: Mostra o tempo que o servidor está online.",
        "/players: Mostra o número de membros online. Aceita um tipo operacional, logo mostra a quantidade de usuários usando x client.",
        "/topchannels: Mostra os canais mais populares.",
        "/idle [on/off]: O torna inativo, o quê automaticamente rejeita todos os challenges, ou desfaz isto.",
        "/sameTier [on/off]: Liga/desliga a auto rejeição de challenges de jogadores em uma tier diferente da sua.",
        "/cjoin [channel]: Te redireciona a um channel do servidor, ou cria um caso este não exista.",
        "/seen [name]: Permite ver a data que um usuário foi visto pela última vez no servidor.",
        "/changetier: Troca a sua tier. O format é /changetier [tier]:[númerodotime]. Time é um número entre 0 e 5 que indica a ordem dos times carregados no teambuilder. O padrão é 0.",
        "/invitespec [name]: Convida um usuário a ver sua batalha.",
        "/notice: Mostra os útlimos eventos do servidor."
    ];
