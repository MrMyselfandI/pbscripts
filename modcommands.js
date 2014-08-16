exports.handleCommand = function(src, command, commandData, tar, channel) {
    if (command == "channelusers") {
       if (commandData === undefined) {
           normalbot.sendMessage(src, "Cite o nome de um channel!", channel);
           return;
       }
       var chanid;
       var isbot;
       if (commandData[0] == "~") {
           chanid = sys.channelId(commandData.substring(1));
           isbot = true;
       } else {
           chanid = sys.channelId(commandData);
           isbot = false;
       }
       if (chanid === undefined) {
           channelbot.sendMessage(src, "Este channel não existe!", channel);
           return;
       }
       var chanName = sys.channel(chanid);
       var players = sys.playersOfChannel(chanid);
       var objectList = [];
       var names = [];
       for (var i = 0; i < players.length; ++i) {
            var name = sys.name(players[i]);
            if (isbot)
            objectList.push({'id': players[i], 'name': name});
                else
            names.push(name);
       }
       if (isbot) {
           var channelData = {'type': 'ChannelUsers', 'channel-id': chanid, 'channel-name': chanName, 'players': objectList};
           sys.sendMessage(src, ":"+JSON.stringify(channelData), channel);
       } else {
           channelbot.sendMessage(src, "Usuários do channel #" + chanName + " são: " + names.join(", "), channel);
       }
       return;
    }
    if (command == "onrange") {
        var subip = commandData;
        var players = sys.playerIds();
        var players_length = players.length;
        var names = [];
        for (var i = 0; i < players_length; ++i) {
            var current_player = players[i];
            if (!sys.loggedIn(current_player)) continue;
            var ip = sys.ip(current_player);
            if (ip.substr(0, subip.length) == subip) {
                names.push(current_player);
            }
        }
        // Tell about what is found.
        if (names.length > 0) {
            var msgs = [];
            for (var i = 0; i < names.length; i++) {
                msgs.push(sys.name(names[i]) + " (" + sys.ip(names[i]) + ")");
            }
            sys.sendMessage(src,"Usuários na linha de alcance (range) " + subip + " são: " + msgs.join(", "), channel);
        } else {
            sys.sendMessage(src,"Nada interessante por aqui!",channel);
        }
        return;
    }
    if (command == "onos") {
        commandData = commandData.toLowerCase();
        if (["windows", "linux", "android", "mac", "webclient"].indexOf(commandData) !== -1) {
            var output = sys.playerIds().filter(function (id) {
                return sys.os(id) === commandData;
            }).map(sys.name);
            querybot.sendMessage(src, "Jogadores usando o sistema " + commandData + " são: " + output.join(", "), channel);
            return;
        }
        normalbot.sendMessage(src, commandData + " não é um sistema válido!", channel);
        return;
    }
    if (command == "tier") {
        if (tar === undefined){
            querybot.sendChanMessage(src,"Usuário não online.");
            return;
        }
        var count = sys.teamCount(tar), tiers = [];
        for (var i = 0; i < count; ++i) {
            var ctier = sys.tier(tar, i);
            if (tiers.indexOf(ctier) == -1)
            tiers.push(ctier);
        }
        querybot.sendMessage(src,sys.name(tar)+" está na tier "+(tiers.length <= 1?"":"s")+": "+tiers.join(", "), channel);
        return;
    }
    if (command == "perm") {
        if (channel == staffchannel || channel === 0) {
            channelbot.sendMessage(src, "Você não pode fazer isto aqui.", channel);
            return;
        }

        SESSION.channels(channel).perm = (commandData.toLowerCase() == 'on');
        SESSION.global().channelManager.update(channel);
        channelbot.sendAll("" + sys.name(src) + (SESSION.channels(channel).perm ? " fez este channel permanente." : " tornou este channel temporário denovo."), channel);
        return;
    }
    if (command == "silence") {
        if (typeof(commandData) == "undefined") {
            return;
        }
        var minutes;
        var chanName;
        var space = commandData.indexOf(' ');
        if (space != -1) {
            minutes = commandData.substring(0,space);
            chanName = commandData.substring(space+1);
        } else {
            minutes = commandData;
            chanName = sys.channel(channel);
        }
        script.silence(src, minutes, chanName);
        return;
    }
    if (command == "silenceoff") {
        var chanName;
        if (commandData === undefined) {
            chanName = sys.channel(channel);
        } else {    
            chanName = commandData;
        }
        script.silenceoff(src, chanName);
        return;
    }
    if (command == "k") {
        if (tar === undefined) {
            normalbot.sendMessage(src, "Usuário não está online.", channel);
            return;
        }
        normalbot.sendAll("" + commandData + " foi chutado(a) do servidor por " + nonFlashing(sys.name(src)) + "! [Channel: " + sys.channel(channel) + "]");
        sys.kick(tar);
        var authname = sys.name(src).toLowerCase();
        script.authStats[authname] =  script.authStats[authname] || {};
        script.authStats[authname].latestKick = [commandData, parseInt(sys.time(), 10)];
        return;
    }

    if (command == "mute") {
        script.issueBan("mute", src, tar, commandData);
        return;
    }
    if (command == "banlist") {
        var list=sys.banList();
        list.sort();
        var nbr_banned=5;
        var max_message_length = 30000;
        var table_header = '<table border="1" cellpadding="5" cellspacing="0"><tr><td colspan='+nbr_banned+'><center><strong>Lista de Banidos</strong></center></td></tr><tr>';
        var table_footer = '</tr></table>';
        var table=table_header;
        var j=0;
        var line = '';
        for (var i=0; i<list.length; ++i){
            if (typeof commandData == 'undefined' || list[i].toLowerCase().indexOf(commandData.toLowerCase()) != -1){
                ++j;
                line += '<td>'+list[i]+'</td>';
                if(j == nbr_banned &&  i+1 != list.length){
                    if (table.length + line.length + table_footer.length > max_message_length) {
                        if (table.length + table_footer.length <= max_message_length)
                            sys.sendHtmlMessage(src, table + table_footer, channel);
                        table = table_header;
                    }
                    table += line + '</tr><tr>';
                    line = '';
                    j=0;
                }
            }
        }
        table += table_footer;
        sys.sendHtmlMessage(src, table.replace('</tr><tr></tr></table>', '</tr></table>'),channel);
        return;

    }
    if (command == "mutelist" || command == "smutelist" || command == "mafiabans" || command == "hangmanmutes" || command == "hangmanbans") {
        script.banList(src, command, commandData);
        return;
    }
    if (command == "rangebans") {
        var TABLE_HEADER, TABLE_LINE, TABLE_END;
        if (!commandData || commandData.indexOf('-text') == -1) {
           TABLE_HEADER = '<table border="1" cellpadding="5" cellspacing="0"><tr><td colspan="2"><center><strong>Banidos por Range (range ban)</strong></center></td></tr><tr><th>Sub-endereço de IP</th><th>Comentário</th><th>By</th></tr>';
           TABLE_LINE = '<tr><td>{0}</td><td>{1}</td><td>{2}</td></tr>';
           TABLE_END = '</table>';
        } else {
           TABLE_HEADER = 'Range banned: IP subaddress, Command on rangeban';
           TABLE_LINE = ' || {0} / {1}';
           TABLE_END = '';
        }
        try {
        var table = TABLE_HEADER;
        var tmp = [];
        for (var key in script.rangebans.hash) {
            if (script.rangebans.hash.hasOwnProperty(key)) {
                var comment = script.rangebans.get(key).split(" --- ");
                tmp.push([key, comment[0], comment[1]]);
            }
        }
        tmp.sort(function(a,b) { return a[0] < b[0] ? -1 : 1; });
        for (var row = 0; row < tmp.length; ++row) {
            table += TABLE_LINE.format(tmp[row][0], tmp[row][1], tmp[row][2] ? tmp[row][2] : "");
        }
        table += TABLE_END;
        sys.sendHtmlMessage(src, table, channel);
        } catch (e) { sys.sendMessage(src, e, channel); }
        return;
    }
    if (command == "profiling") {
        sys.profileDump().split("\n").forEach(function(string) {sys.sendMessage(src, string, channel);});
        return;
    }
    if (command == "ipbans") {
        var TABLE_HEADER, TABLE_LINE, TABLE_END;
        if (!commandData || commandData.indexOf('-text') == -1) {
           TABLE_HEADER = '<table border="1" cellpadding="5" cellspacing="0"><tr><td colspan="2"><center><strong>Banidos por IP</strong></center></td></tr><tr><th>Sub-endereço de IP</th><th>Comentário</th></tr>';
           TABLE_LINE = '<tr><td>{0}</td><td>{1}</td></tr>';
           TABLE_END = '</table>';
        } else {
           TABLE_HEADER = 'Ip Banned: IP subaddress, Command on ipban';
           TABLE_LINE = ' || {0} / {1}';
           TABLE_END = '';
        }
        try {
        var table = TABLE_HEADER;
        var tmp = [];
        for (var key in script.ipbans.hash) {
            if (script.ipbans.hash.hasOwnProperty(key)) {
                tmp.push([key, script.ipbans.get(key)]);
            }
        }
        tmp.sort(function(a,b) { return a[0] < b[0] ? -1 : 1; });
        for (var row = 0; row < tmp.length; ++row) {
            table += TABLE_LINE.format(tmp[row][0], tmp[row][1]);
        }
        table += TABLE_END;
        sys.sendHtmlMessage(src, table, channel);
        } catch (e) { sys.sendMessage(src, e, channel); }
        return;
    }
    if (command == "autosmutelist") {
        sys.sendMessage(src, "*** LISTA DE USUÁRIOS MUTADOS SILENCIOSAMENTE (smute) ***", channel);
        for (var x = 0; x < autosmute.length; x++) {
            sys.sendMessage(src, autosmute[x], channel);
        }
        return;
    }
    if (command == "namebans") {
        var table = '';
        table += '<table border="1" cellpadding="5" cellspacing="0"><tr><td colspan="2"><center><strong>Palavras banidas</strong></center></td></tr>';
        for (var i = 0; i < nameBans.length; i+=5) {
            table += '<tr>';
            for (var j = 0; j < 5 && i+j < nameBans.length; ++j) {
                table += '<td>'+nameBans[i+j].toString()+'</td>';
            }
            table += '</tr>';
        }
        table += '</table>';
        sys.sendHtmlMessage(src, table, channel);
        return;
    }
    if (command == "channamebans" || command == "channelnamebans") {
        var table = '';
        table += '<table border="1" cellpadding="5" cellspacing="0"><tr><td colspan="2"><center><strong>Palavras banidas</strong></center></td></tr>';
        for (var i = 0; i < script.chanNameBans.length; i+=5) {
            table += '<tr>';
            for (var j = 0; j < 5 && i+j < script.chanNameBans.length; ++j) {
                table += '<td>'+script.chanNameBans[i+j].toString()+'</td>';
            }
            table += '</tr>';
        }
        table += '</table>';
        sys.sendHtmlMessage(src, table, channel);
        return;
    }
    if (command == "namewarns") {
        var table = '';
        table += '<table border="1" cellpadding="5" cellspacing="0"><tr><td colspan="2"><center><strong>Palaras com avisos de restrição de uso</strong></center></td></tr>';
        for (var i = 0; i < nameWarns.length; i+=5) {
            table += '<tr>';
            for (var j = 0; j < 5 && i+j < nameWarns.length; ++j) {
                table += '<td>'+nameWarns[i+j].toString()+'</td>';
            }
            table += '</tr>';
        }
        table += '</table>';
        sys.sendHtmlMessage(src, table, channel);
        return;
    }
    if (command == "unmute") {
        script.unban("mute", src, tar, commandData);
        return;
    }
    if (command == "battlehistory") {
        if (tar === undefined) {
            querybot.sendMessage(src, "Forma de usar: /battleHistory nick. Funciona apenas em usuários online.", channel);
            return;
        }
        var hist = SESSION.users(tar).battlehistory;
        if (!hist) {
            querybot.sendMessage(src, "Este usuário não batalhou após conectar-se ao servidor.", channel);
            return;
        }
        var res = [];
        for (var i = 0; i < hist.length; ++i) {
             res.push("Batalha contra <b>" + hist[i][0] + "</b>, Resultado <b>" + hist[i][1] + "</b>" + (hist[i][2] == "forfeit" ? " <i>por forfeit</i>" : "") + (hist[i][3] ? " (<b>ranqueada</b>)" : "") + (hist[i][4] ? " Tier: " + hist[i][4] + "." : "."));
        }
        sys.sendHtmlMessage(src, res.join("<br>"), channel);
        return;
    }
    if (command == "userinfo" || command == "whois" || command == "whereis") {
        var bindChannel = channel;
        if (commandData === undefined) {
            querybot.sendMessage(src, "Forneça o nome de um usuário.", channel);
            return;
        }
        var name = commandData;
        var isbot = false;
        if (commandData[0] == "~") {
            name = commandData.substring(1);
            tar = sys.id(name);
            isbot = true;
        }
        var lastLogin = sys.dbLastOn(name);
        if (lastLogin === undefined) {
            querybot.sendMessage(src, "Este usuário não existe.", channel);
            return;
        }

        var registered = sys.dbRegistered(name);
        var contribution = script.contributors.hash.hasOwnProperty(name) ? script.contributors.get(name) : "no";
        var authLevel;
        var ip;
        var online;
        var channels = [];
        if (tar !== undefined) {
            name = sys.name(tar); // fixes case
            authLevel = sys.auth(tar);
            ip = sys.ip(tar);
            online = true;
            var chans = sys.channelsOfPlayer(tar);
            for (var i = 0; i < chans.length; ++i) {
                channels.push("#"+sys.channel(chans[i]));
            }
        } else {
            authLevel = sys.dbAuth(name);
            ip = sys.dbIp(name);
            online = false;
        }
        var isBanned = sys.banned(ip);
        var nameBanned = script.nameIsInappropriate(name);
        var rangeBanned = script.isRangeBanned(ip);
        var tempBanned = script.isTempBanned(ip);
        var ipBanned = script.isIpBanned(ip);
        var isSmuted = script.smutes.get(ip);
        var bans = [];
        if (isBanned && !tempBanned) bans.push("ban permanente");
        if (nameBanned) bans.push("name ban");
        if (rangeBanned) bans.push("range ban");
        if (tempBanned) bans.push("ban temporário");
        if (ipBanned) bans.push("ip ban");
        if (isSmuted) bans.push("smuted");

        if (isbot) {
            var userJson = {
                'Typo': 'UserInfo',
                'ID': tar ? tar : -1,
                'Nickname': name,
                'Autoridade': authLevel,
                'Contribuidor': contribution,
                'IP': ip + (tar ? " (" + SESSION.users(tar).hostname + ")" : ""),
                'Online?': online,
                'Registrado': registered,
                'última vez online': lastLogin,
                'Channels' : channels,
                'Banido?' : bans, 
                'Client' : tar ? sys.os(tar) : "Unknown"
            };
            sys.sendMessage(src, "UserInfo: "+JSON.stringify(userJson), channel);
        } else if (command == "userinfo") {
            querybot.sendMessage(src, "Username: " + name + " ~ autoridade: " + authLevel + " ~ Contribuidor: " + contribution + " ~ IP: " + ip + " ~ Online: " + (online ? "sim" : "não") + " ~ Registrado: " + (registered ? "sim" : "não") + " ~ última vez online: " + lastLogin + " ~ Banido: " + (isBanned ? "sim" : "não"), channel);
        } else if (command == "whois" || command == "whereis") {
            var whois = function(resp) {
                /* May have dced, this being an async call */
                online = sys.loggedIn(tar);
                var authName = function() {
                    switch (authLevel) {
                    case 3: return "Proprietário";
                    case 2: return "Administrador";
                    case 1: return "Moderador";
                    default: return contribution != "não" ? "contribuidor" : "usuáro";
                    }
                }();
                var ipInfo = "";
                if (resp !== undefined) {
                    resp = JSON.parse(resp);
                    var countryName = resp.countryName;
                    var countryTag =  resp.countryCode;
                    var regionName = resp.regionName;
                    var cityName = resp.cityName;
                    if (countryName !== "" && countryName !== "-") {
                        ipInfo += "País: " + countryName + " (" + countryTag + "), ";
                    }
                    if (regionName !== "" && regionName !== "-") {
                        ipInfo += "Região: " + regionName + ", ";
                    }
                    if(cityName !== "" && cityName !== "-"){
                        ipInfo += "Cidade: " + cityName;
                    }
                }
                var logintime = false;
                if (online) logintime = SESSION.users(tar).logintime;
                var data = [
                    "Usuário: " + name + " @ " + ip,
                    "Autoridade: " + authName,
                    "Online: " + (online ? "sim" : "não"),
                    "Registrado?: " + (registered ? "sim" : "não"),
                    "Última vez Online: " + (online && logintime ? new Date(logintime*1000).toUTCString() : lastLogin),
                    bans.length > 0 ? "Bans: " + bans.join(", ") : "Banido?: none",
                    ipInfo !== ""  ? "Informações do IP: " + ipInfo : ""
                ];
                if (online) {
                    if (SESSION.users(tar).hostname != ip)
                        data[0] += " (" + SESSION.users(tar).hostname + ")";
                    data.push("Inativo (Idle) por: " + getTimeString(parseInt(sys.time(), 10) - SESSION.users(tar).lastline.time));
                    data.push("Channels: " + channels.join(", "));
                    data.push("Nicks durante a atual sessão: " + (online && SESSION.users(tar).namehistory ? SESSION.users(tar).namehistory.map(function(e){return e[0];}).join(", ") : name));
                    data.push("Tipo do Client: " + utilities.capitalize(sys.os(tar)));
                }
                if (authLevel > 0) {
                    var stats = script.authStats[name.toLowerCase()] || {};
                    for (var key in stats) {
                        if (stats.hasOwnProperty(key)) {
                            data.push("Latest " + key.substr(6).toLowerCase() + ": " + stats[key][0] + " on " + new Date(stats[key][1]*1000).toUTCString());
                        }
                    }
                }
                if (sys.isInChannel(src, bindChannel)) {
                    for (var j = 0; j < data.length; ++j) {
                        sys.sendMessage(src, data[j], bindChannel);
                    }
                }
            };
            if (command === "whereis") {
                var ipApi = sys.getFileContent(Config.dataDir+'ipApi.txt');
                sys.webCall('http://api.ipinfodb.com/v3/ip-city/?key=' + ipApi + '&ip='+ ip + '&format=json', whois);
            } else {
                whois();
            }
        }
        return;
    }
    if (command == "aliases") {
        var max_message_length = 30000;
        var uid = sys.id(commandData);
        var ip = commandData;
        if (uid !== undefined) {
            ip = sys.ip(uid);
        } else if (sys.dbIp(commandData) !== undefined) {
            ip = sys.dbIp(commandData);
        }
        if (!ip) {
            querybot.sendMessage(src, "Cite um usuário/IP conhecido pelo servidor.", channel);
            return;
        }
        var myAuth = sys.auth(src);
        var allowedToAlias = function(target) {
            return !(myAuth < 3 && sys.dbAuth(target) > myAuth);
        };

        /* Higher auth: don't give the alias list */
        if (!allowedToAlias(commandData)) {
            querybot.sendMessage(src, "Você não pode ver as alts de uma autoridade superior a você.: " + commandData, channel);
            return;
        }

        var smessage = "As alts do IP " + ip + " são: ";
        var prefix = "";
        sys.aliases(ip).map(function(name) {
            return [sys.dbLastOn(name), name];
        }).sort().forEach(function(alias_tuple) {
            var last_login = alias_tuple[0],
                alias = alias_tuple[1];
            if (!allowedToAlias(alias)) {
                return;
            }
            var status = (sys.id(alias) !== undefined) ? "online" : "última vez online: " + last_login;
            smessage = smessage + alias + " ("+status+"), ";
            if (smessage.length > max_message_length) {
                querybot.sendMessage(src, prefix + smessage + " ...", channel);
                prefix = "... ";
                smessage = "";
            }
        });
        querybot.sendMessage(src, prefix + smessage, channel);
        return;
    }
   if (command == "tempban") {
        var tmp = commandData.split(":");
        if (tmp.length === 0) {
            normalbot.sendMessage(src, "Forma de usar: /tempban nome:minutos.", channel);
            return;
        }
        
        var target_name = tmp[0];
        if (tmp[1] === undefined || isNaN(tmp[1][0])) {
            var minutes = 86400;
        } else {
            var minutes = getSeconds(tmp[1]);
        }
        tar = sys.id(target_name);
        var minutes = parseInt(minutes, 10);
        if (sys.auth(src) < 2 && minutes > 86400) {
            normalbot.sendMessage(src, "Não pode banir por mais de 1 dia!", channel);
            return;
        }
        var ip = sys.dbIp(target_name);
        if (ip === undefined) {
            normalbot.sendMessage(src, "Usuário não existe!", channel);
            return;
        }
        if (sys.maxAuth(ip)>=sys.auth(src)) {
           normalbot.sendMessage(src, "Não se pode fazer isso numa auth superior/igual a sua!", channel);
           return;
        }
        if (sys.banned(ip)) {
            normalbot.sendMessage(src, "Este usuário já está banido!", channel);
            return;
        }
        normalbot.sendAll("Alvo: " + target_name + ", IP: " + ip, staffchannel);
        sys.sendHtmlAll('<b><font color=red>' + target_name + ' foi banido por ' + nonFlashing(sys.name(src)) + ' por ' + getTimeString(minutes) + '!</font></b>');
        sys.tempBan(target_name, parseInt(minutes/60, 10));
        script.kickAll(ip);
        var authname = sys.name(src);
        script.authStats[authname] = script.authStats[authname] || {};
        script.authStats[authname].latestTempBan = [target_name, parseInt(sys.time(), 10)];
        return;
    }
    if (command == "tempunban") {
        var ip = sys.dbIp(commandData);
        if (ip === undefined) {
            normalbot.sendMessage(src, "Usuário não existe!", channel);
            return;
        }
        if (sys.dbTempBanTime(commandData) > 86400 && sys.auth(src) < 2) {
            normalbot.sendMessage(src, "Você não pode desbanir pessoas que foram banidas por mais de 1 dia!", channel);
            return;
        }
        normalbot.sendAll(sys.name(src) + " desbaniu " + commandData, staffchannel);
        sys.unban(commandData);
        return;
    }
    if (command == "checkbantime") {
        var ip = sys.dbIp(commandData);
        if (ip === undefined) {
            normalbot.sendMessage(src, "Este usuário não existe!", channel);
            return;
        }
        if (sys.dbTempBanTime(commandData) > 2000000000) { //it returns a high number if the person is either not banned or permantly banned
            normalbot.sendMessage(src, "Este usuário não está sobre um ban temporário!", channel);
            return;
        }
        normalbot.sendMessage(src, commandData + " está banido por outros " + getTimeString(sys.dbTempBanTime(commandData)), channel);
        return;
    }
    if (command == "passauth" || command == "passauths") {
        if (tar === undefined) {
            normalbot.sendMessage(src, "O alvo está offline.", channel);
            return;
        }
        if (sys.ip(src) == sys.ip(tar) && sys.auth(tar) === 0) {
            // fine
        }
        else {
            if (sys.auth(src) !== 0 || !SESSION.users(src).megauser) {
                normalbot.sendMessage(src, "Você necessita de autoridade para poder passar-la para outro nick.", channel);
                return;
            }
            if (!SESSION.users(tar).megauser || sys.auth(tar) > 0) {
                normalbot.sendMessage(src, "O alvo necessita ter o mesmo IP que você.", channel);
                return;
            }
        }
        if (!sys.dbRegistered(sys.name(tar))) {
            normalbot.sendMessage(src, "O usuário selecionado precisa estar registrado.", channel);
            return;
        }
        var current = sys.auth(src);
        sys.changeAuth(src, 0);
        sys.changeAuth(tar, current);
        if (command == "passauth")
            normalbot.sendAll(sys.name(src) + " passou a sua autoridade para " + sys.name(tar) + "!", staffchannel);
        return;
    }
    if (command == "smute") {
        script.issueBan("smute", src, tar, commandData);
        return;
    }
    if (command == "sunmute") {
        script.unban("smute", src, tar, commandData);
        return;
    }
    return "no command";
};
exports.help = 
    [
        "/k: Chuta um usuário do servidor.",
        "/mute: Silencia alguém. O format é /mute nome:razão:tempo. O tempo é opcional e por padrão 1 dia.",
        "/unmute: Retira o mute de alguém.",
        "/smute: Silencia um usuário secretamente. Este comando não funciona em autoridades. Mesmo formato que /mute, porém o padrão é definido para permanente (usar-lo em ban evaders até a presença de um admin).",
        "/sunmute: Cancela o /smute de alguém.",
        "/silence: Previne jogadores sem autoridade de falar em um canal. O formato é /silence minutos channel. Vai afetar o channel em que o comando foi usado caso algum não seja especificado.",
        "/silenceoff: Remove o /silence. Vai afetar o channel em que o comando foi usado caso algum não seja especificado.",
        "/perm [on/off]: Torna o channel onde este comando foi usado permanente ou não (channels permanentes se mantém na lista mesmo sem usuários).",
        "/userinfo: Mostra informações básicas sobre um usuário.",
        "/whois: Mostra informações detalhadas sobre um usuário.",
        "/aliases: Mostra as alts usadas por certo usuário.",
        "/tempban: Bane um usuário por 24 horas ou mais. O format é /tempban nome:tempo O tempo é opcional e por padrão 1 dia.",
        "/tempunban: Bane um usuário que foi banido temporiamente (/unban não funciona neste caso).",
        "/checkbantime: Mosra por quanto tempo um usuário ainda está banido.",
        "/passauth: Passa sua autoridade para uma conta SUA online.",
        "/passauths: Passa sua autoridade silenciosamente.",
        "/banlist: Procura na lista de banidos por uma palavra, ou mostra a lista completa caso nada seja especificado.",
        "/mutelist: Procura na lista de usuários silenciados por uma palavra, ou mostra a lista completa caso nada seja especificado.",
        "/smutelist: Procura na lista de usuários silenciados secretamente por uma palavra, ou mostra a lista completa caso nada seja especificado.",
        "/rangebans: Mostra a lista de range bans.",
        "/ipbans: Mostra a lista de IPs banidos.",
        "/profiling: Shows the profiling dump. (TESTAR)",
        "/autosmutelist: Mostra a lista de usuários silenciados secretamente automaticamente.",
        "/namebans: Mostra a lista de palavras banidas em nicknames.",
        "/namewarns: Mostra a lista de palavras com aviso de restrição de uso em nicknames",
        "/channelnamebans: Mostra a lista de palavras banidas de nomes de canais.",
        "/onrange: To view who is on an IP range. (TESTAR)",
        "/onos: Mostra os usuários em certo client (Pode lagar o server!)",
        "/tier: Informa a tier de um usuário.",
        "/battlehistory: Ver o histórico de batalha recente de um usuário.",
        "/channelusers: Mostrar usuários de um channel.",
	"/whereis: Mostra a localidade/IP de um usuário."
    ];
