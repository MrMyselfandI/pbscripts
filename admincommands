exports.handleCommand = function(src, command, commandData, tar, channel) {
    if (command == "memorydump") {
        sys.sendMessage(src, sys.memoryDump(), channel);
        return;
    }
    if (command == "togglerainbow") {
        if (commandData === "off") {
            SESSION.global().allowRainbow = false;
            normalbot.sendMessage(src, "Você desligou o comando /rainbow!", channel);
            return;
        }
        SESSION.global().allowRainbow = true;
        normalbot.sendMessage(src, "Você ligou o comando /rainbow!!", channel);
        return;
    }
    if (command == "indigoinvite") {

        if (channel != staffchannel && channel != sachannel) {
            normalbot.sendMessage(src, "Não pode usar este comando nesse canal.", channel);
            return;
        }
        if (tar === undefined) {
            normalbot.sendMessage(src, "Seu alvo não está online.", channel);
            return;
        }
        if (SESSION.users(tar).megauser || SESSION.users(tar).contributions || sys.auth(tar) > 0) {
            normalbot.sendMessage(src, "Este usuário já possuí acesso ao Indigo.", channel);
            return;
        }
        SESSION.channels(channel).issueAuth(src, commandData, "member");
        normalbot.sendAll("" + sys.name(src) + " convocou " + sys.name(tar) + " para este canal!", channel);
        sys.putInChannel(tar, channel);
        normalbot.sendMessage(tar, "" + sys.name(src) + " convocou você a este channel!", channel);
        return;
    }
    if (command == "indigodeinvite") {
        var count = 0;
        var players = sys.playerIds();
        var players_length = players.length;
        for (var i = 0; i < players_length; ++i) {
            var current_player = players[i];
            if (sys.isInChannel(current_player, staffchannel) && !script.canJoinStaffChannel(current_player)) {
                sys.kick(current_player, staffchannel);
                SESSION.channels(channel).takeAuth(src, sys.name(current_player), "member");
                count = 1;
            }
        }
        normalbot.sendAll("" + count + " foi/foram chutados do canal.", staffchannel);
        return;
    }
    if (command == "destroychan") {
        var ch = commandData;
        var chid = sys.channelId(ch);
        if(sys.existChannel(ch) !== true) {
            normalbot.sendMessage(src, "Não existe um canal por este nome!", channel);
            return;
        }
        if (chid === 0 || chid == staffchannel ||  chid == tourchannel || SESSION.channels(chid).perm) {
            normalbot.sendMessage(src, "Este canal não pode ser destruido!", channel);
            return;
        }
        var channelDataFile = SESSION.global().channelManager.dataFileFor(chid);
        sys.writeToFile(channelDataFile, "");
        sys.playersOfChannel(chid).forEach(function(player) {
            sys.kick(player, chid);
            if (sys.channelsOfPlayer(player).length < 1 && !sys.isInChannel(player, 0)) {
                sys.putInChannel(player, 0);
            }
        });
        return;
    }
    if (command == "ban") {
        if(sys.dbIp(commandData) === undefined) {
            normalbot.sendMessage(src, "Não existe um jogador com este nick!", channel);
            return;
        }
        if (sys.maxAuth(sys.ip(tar))>=sys.auth(src)) {
           normalbot.sendMessage(src, "Você não pode banir um usuário com maior/mesma autoridade que você!", channel);
           return;
        }

        var ip = sys.dbIp(commandData);
        if(sys.maxAuth(ip)>=sys.auth(src)) {
           normalbot.sendMessage(src, "Você não pode banir um usuário com maior/mesma autoridade que você!", channel);
           return;
        }
        if(sys.banned(ip) && !script.isTempBanned(ip)) {
            normalbot.sendMessage(src, "Este usuário já está banido", channel);
            return;
        }
        
        if (script.isTempBanned(ip)) {
            sys.unban(commandData); //needed as at the moment bans don't overwrite tempbans
        }
        normalbot.sendAll("Alvo: " + commandData + ", IP: " + ip, staffchannel);
        sendChanHtmlAll('<b><font color=red>' + commandData + ' foi banido por ' + nonFlashing(sys.name(src)) + '!</font></b>',-1);
        sys.ban(commandData);
        script.kickAll(ip);
        sys.appendToFile('bans.txt', sys.name(src) + ' baniu ' + commandData + "\n");
        var authname = sys.name(src).toLowerCase();
        script.authStats[authname] =  script.authStats[authname] || {};
        script.authStats[authname].latestBan = [commandData, parseInt(sys.time(), 10)];
        return;
    }
    if (command == "unban") {
        if(sys.dbIp(commandData) === undefined) {
            normalbot.sendMessage(src, "Não existe um jogador com este nick!", channel);
            return;
        }
        var banlist=sys.banList();
        for(var a in banlist) {
            if(sys.dbIp(commandData) == sys.dbIp(banlist[a])) {
                sys.unban(commandData);
                normalbot.sendMessage(src, "Você desbaniu " + commandData + "!", channel);
                sys.appendToFile('bans.txt', sys.name(src) + ' desbaniu ' + commandData + "\n");
                return;
            }
        }
        normalbot.sendMessage(src, "Este usuário não está banido!", channel);
        return;
    }

    if (command == "nameban") {
        if (commandData === undefined) {
            normalbot.sendMessage(src, "Você não pode banir nicks vazios.", channel);
            return;
        }
        var regex;
        try {
            regex = new RegExp(commandData.toLowerCase()); // incase sensitive
        } catch (e) {
            normalbot.sendMessage(src, "A expressão '" +commandData + "' falhou. (" + e + ")", channel);
        }
        nameBans.push(regex);
        var serialized = {nameBans: []};
        for (var i = 0; i < nameBans.length; ++i) {
            serialized.nameBans.push(nameBans[i].source);
        }
        sys.writeToFile(Config.dataDir+"nameBans.json", JSON.stringify(serialized));
        normalbot.sendMessage(src, "Você baniu: " + regex.toString(), channel);
        return;
    }
    if (command == "nameunban") {
        var unban = false;
        nameBans = nameBans.filter(function(name) {
            if (name.toString() == commandData) {
                var toDelete = nameBans.indexOf(name.toString());
                normalbot.sendMessage(src, "Você desbaniu: " + name.toString(), channel);
                unban = true;
                return false;
            }
            return true;
        });
        if (!unban) {
            normalbot.sendMessage(src, "Nenhum resultado.", channel);
        } else {
            var serialized = {nameBans: []};
            for (var i = 0; i < nameBans.length; ++i) {
                serialized.nameBans.push(nameBans[i].source);
            }
            sys.writeToFile(Config.dataDir+"nameBans.json", JSON.stringify(serialized));
        }
        return;
    }
    if (command == "channameban" || command == "channelnameban") {
        if (commandData === undefined) {
            normalbot.sendMessage(src, "Você não pode banir nomes vazios.", channel);
            return;
        }
        var regex;
        try {
            regex = new RegExp(commandData.toLowerCase()); // incase sensitive
        } catch (e) {
            normalbot.sendMessage(src, "Su expressão '" +commandData + "' falhou. (" + e + ")", channel);
        }
        script.chanNameBans.push(regex);
        var serialized = {chanNameBans: []};
        for (var i = 0; i < script.chanNameBans.length; ++i) {
            serialized.chanNameBans.push(script.chanNameBans[i].source);
        }
        sys.writeToFile(Config.dataDir+"chanNameBans.json", JSON.stringify(serialized));
        normalbot.sendMessage(src, "Você baniu: " + regex.toString(), channel);
        return;
    }
    if (command == "channameunban" || command == "channelnameunban") {
        var unban = false;
        script.chanNameBans = script.chanNameBans.filter(function(name) {
            if (name.toString() == commandData) {
                var toDelete = script.chanNameBans.indexOf(name.toString());
                normalbot.sendMessage(src, "Vcê desbaniu: " + name.toString(), channel);
                unban = true;
                return false;
            }
            return true;
        });
        if (!unban) {
            normalbot.sendMessage(src, "Nenhum resultado", channel);
        } else {
            var serialized = {chanNameBans: []};
            for (var i = 0; i < script.chanNameBans.length; ++i) {
                serialized.chanNameBans.push(script.chanNameBans[i].source);
            }
            sys.writeToFile(Config.dataDir+"chanNameBans.json", JSON.stringify(serialized));
        }
        return;
    }
    if (command == "namewarn") {
        if (commandData === undefined) {
            normalbot.sendMessage(src, "Você não pode colocar um warning num nick vazio..", channel);
            return;
        }
        var regex;
        try {
            regex = new RegExp(commandData.toLowerCase()); // incase sensitive
        } catch (e) {
            normalbot.sendMessage(src, "Sua expressão '" +commandData + "' falhou. (" + e + ")", channel);
        }
        nameWarns.push(regex);
        var serialized = {nameWarns: []};
        for (var i = 0; i < nameWarns.length; ++i) {
            serialized.nameWarns.push(nameWarns[i].source);
        }
        sys.writeToFile(Config.dataDir+"nameWarns.json", JSON.stringify(serialized));
        normalbot.sendMessage(src, "Você determinou um aviso no nick: " + regex.toString(), channel);
        return;
    }
    if (command == "nameunwarn") {
        var unwarn = false;
        nameWarns = nameWarns.filter(function(name) {
            if (name.toString() == commandData) {
                var toDelete = nameWarns.indexOf(name.toString());
                normalbot.sendMessage(src, "Você revomeu o aviso do nick: " + name.toString(), channel);
                unwarn = true;
                return false;
            }
            return true;
        });
        if (!unwarn)
            normalbot.sendMessage(src, "Nenhum resultado", channel);
        else
            sys.writeToFile(Config.dataDir+"nameWarns.json", JSON.stringify(nameWarns));
        return;
    }
    // hack, for allowing some subset of the owner commands for super admins
    if (isSuperAdmin(src)) {
       if (["changeauth"].indexOf(command) != -1) {
           normalbot.sendMessage(src, "Você não pode usar este comando.", channel);
           return;
       }
       return require("ownercommands.js").handleCommand(src, command, commandData, tar, channel);
    }
   
    if (command == "cookieban" || command == "cookiemute") {
        if (!commandData) {
            return;
        }
        if (!sys.loggedIn(sys.id(commandData))) {
            normalbot.sendMessage(src, "Usuário não conectado.", channel);
            return;
        }
        var tar = sys.id(commandData);
        if (sys.os(tar) !== "android" && sys.version(tar) < 2402 || sys.os(tar) === "android" && sys.version(tar) < 37) {
            //probably won't work well on windows/linux/etc anyways...
            normalbot.sendMessage(src, "Cookies não vão funcionar neste usuário", channel);
            return;
        }
        if (command == "cookiemute") {
            SESSION.users(sys.id(commandData)).activate("smute", Config.kickbot, 0, "Cookie", true);
            kickbot.sendAll(commandData + " foi mutado silenciosamente por cookie", staffchannel);
        }
        var type = (command === "cookieban" ? "banned" : "muted");
        sys.setCookie(sys.id(commandData), type + " " + commandData.toCorrectCase());
        normalbot.sendAll(commandData.toCorrectCase() + " foi cookie " + type, staffchannel);
        return;
    }
    if (command == "cookieunban" || command ==  "cookieunmute") {
        if (!commandData) {
            return;
        }
        if (commandData == "cookieunmute" && sys.loggedIn(sys.id(commandData))) {
            script.unban("smute", Config.kickbot, tar, commandData);
            sys.removeCookie(sys.id(commandData));
            return;
        }
        var type = (command === "cookieunban" ? "unbanned" : "unmuted");
        script.namesToUnban.add(commandData.toLowerCase(), true);
        normalbot.sendAll(commandData.toCorrectCase() + " foi cookie " + type, staffchannel);
        return;
    }

    return "no command";
};
exports.help = 
    [
        "/ban: Bane um usuário.",
        "/unban: Desbane um usuário.",
        "/togglerainbow [on/off]: Ativa/Desativa o comando /rainbow.",
        "/memorydump: Mostra o estado da memória.",
        "/nameban: Bane uma palavra (regexp ban) em nicknames de usuários.",
        "/nameunban: Desbane uma palavra (regexp ban) em nicknames de usuários.",
        "/channelnameban: Bane uma palavra (regexp ban) em nomes de channels.",
        "/channelnameunban: Desbane uma palavra (regexp ban) em nomes de channels.",
        "/namewarn: Adds a regexp namewarning",
        "/nameunwarn: Removes a regexp namewarning",
        "/destroychan: Destroy a channel (official channels are protected).",
        "/indigoinvite: Convoca algum usuário ao canal da staff (use com cuidado).",
        "/indigodeinvite: Retira o convite de um usuário ao canal da staff.",
        "/cookieban: Bane um usuário online por cookie (android users).",
        "/cookiemute: Coloca um usuário ativo na lista de mutes silenciosos por cookie.",
        "/cookieunban/mute: Cancela um cookieban/mute. Vai ter efeito na próxima vez que o usuário logar no servidor."
    ];
