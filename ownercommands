exports.handleCommand = function(src, command, commandData, tar, channel) {
    if (command == "ipban") {
        var subip;
        var comment;
        var space = commandData.indexOf(' ');
        if (space != -1) {
            subip = commandData.substring(0,space);
            comment = commandData.substring(space+1);
        } else {
            subip = commandData;
            comment = '';
        }
        /* check ip */
        var i = 0;
        var nums = 0;
        var dots = 0;
        var correct = (subip.length > 0); // zero length ip is baaad
        while (i < subip.length) {
            var c = subip[i];
            if (c == '.' && nums > 0 && dots < 3) {
                nums = 0;
                ++dots;
                ++i;
            } else if (c == '.' && nums === 0) {
                correct = false;
                break;
            } else if (/^[0-9]$/.test(c) && nums < 3) {
                ++nums;
                ++i;
            } else {
                correct = false;
                break;
            }
        }
        if (!correct) {
            normalbot.sendMessage(src, "Este endereço de IP parece estranho, você deveria corrigir-lo: " + subip, channel);
            return;
        }
        script.ipbans.add(subip, "Nome: " +sys.name(src) + " Comentário: " + script.rangebans.escapeValue(comment));
        normalbot.sendAll("Banimento de IP adicionado com sucesso ao IP subrange: " + subip + " por "+ sys.name(src),staffchannel);
        return;
    }
    if (command == "ipunban") {
        var subip = commandData;
        if (script.ipbans.get(subip) !== undefined) {
            script.ipbans.remove(subip);
            normalbot.sendMessage(src, "Banimento de IP removido com successo da IP subrange: " + subip, channel);
        } else {
            normalbot.sendMessage(src, "Esse IP não está banido.", channel);
        }
        return;
    }
    if (command == "changerating") {
        var data =  commandData.split(' -- ');
        if (data.length != 3) {
            normalbot.sendMessage(src, "Você precisa de 3 parametros.", channel);
            return;
        }
        var player = data[0];
        var tier = data[1];
        var rating = parseInt(data[2], 10);

        sys.changeRating(player, tier, rating);
        normalbot.sendMessage(src, "Rating de " + player + " na tier " + tier + " foi trocado para " + rating, channel);
        return;
    }
    if (command == "hiddenauth") {
        sys.sendMessage(src, "*** Autoridades Invisíveis ***", channel);
        sys.dbAuths().sort().filter(function(name) { return sys.dbAuth(name) > 3; }).forEach(function(name) {
            sys.sendMessage(src, name + " " + sys.dbAuth(name), channel);
        });
        sys.sendMessage(src, "",channel);
        return;
    }
    if (command == "capslockday") {
        if (commandData == "off") {
            CAPSLOCKDAYALLOW = false;
            normalbot.sendMessage(src, "Você desligou o dia de Caps Lock!!", channel);
        }
        else if (commandData == "on") {
            CAPSLOCKDAYALLOW = true;
            normalbot.sendMessage(src, "Você ligou o dia de Caps Lock!!", channel);
        }
        return;
    }
    if (command == "contributor") {
        var s = commandData.split(":");
        var name = s[0], reason = s[1];
        if (sys.dbIp(name) === undefined) {
            normalbot.sendMessage(src, name + " não pode ser encontrado.", channel);
            return;
        }
        normalbot.sendMessage(src, name + " é agora um contribuidor!", channel);
        script.contributors.add(name, reason);
        return;
    }
    if (command == "contributoroff") {
        var contrib = "";
        for (var x in script.contributors.hash) {
            if (x.toLowerCase() == commandData.toLowerCase())
            contrib = x;
        }
        if (contrib === "") {
            normalbot.sendMessage(src, commandData + " não é um contribuidor.", channel);
            return;
        }
        script.contributors.remove(contrib);
        normalbot.sendMessage(src, commandData + " não é mais um contribuidor!", channel);
        return;
    }
    if (command == "showteam") {
        var teams = [0,1,2,3,4,5].map(function(index) {
            return script.importable(tar, index);
        }, this).filter(function(data) {
            return data.length > 0;
        }).map(function(team) {
            return "<tr><td><pre>" + team.join("<br>") + "</pre></td></tr>";
        }).join("");
        if (teams) {
            sys.sendHtmlMessage(src, "<table border='2'>" + teams + "</table>",channel);
            normalbot.sendAll(sys.name(src) + " acabou de conferir o time do usuário " + sys.name(tar) + ".", staffchannel);
        } else {
            normalbot.sendMessage(src, "Este usuário não possui times com Pokémon válidos!", channel);
        }
        return;
    }
    if (command == "rangeban") {
        var subip;
        var comment;
        var space = commandData.indexOf(' ');
        if (space != -1) {
            subip = commandData.substring(0,space);
            comment = commandData.substring(space+1);
        } else {
            subip = commandData;
            comment = '';
        }
        /* check ip */
        var i = 0;
        var nums = 0;
        var dots = 0;
        var correct = (subip.length > 0); // zero length ip is baaad
        while (i < subip.length) {
            var c = subip[i];
            if (c == '.' && nums > 0 && dots < 3) {
                nums = 0;
                ++dots;
                ++i;
            } else if (c == '.' && nums === 0) {
                correct = false;
                break;
            } else if (/^[0-9]$/.test(c) && nums < 3) {
                ++nums;
                ++i;
            } else {
                correct = false;
                break;
            }
        }
        if (!correct) {
            normalbot.sendMessage(src, "Este endereço de IP parece estranho, você deveria tentar corrigir-lo: " + subip, channel);
            return;
        }

        /* add rangeban */
        script.rangebans.add(subip, script.rangebans.escapeValue(comment) + " --- " + sys.name(src));
        normalbot.sendAll("Rangeban adicionado com sucesso na IP subrange: " + subip, staffchannel);
        /* kick them */
        var players = sys.playerIds();
        var players_length = players.length;
        var names = [];
        for (var i = 0; i < players_length; ++i) {
            var current_player = players[i];
            var ip = sys.ip(current_player);
            if (sys.auth(current_player) > 0) continue;
            if (ip.substr(0, subip.length) == subip) {
                names.push(sys.name(current_player));
                sys.kick(current_player);
                continue;
            }
        }
        if (names.length > 0) {
            sys.sendAll("●PBS: "+names.join(", ") + " foi rangebanned por " + sys.name(src), staffchannel);
        }
        return;
    }
    if (command == "rangeunban") {
        var subip = commandData;
        if (script.rangebans.get(subip) !== undefined) {
            script.rangebans.remove(subip);
            normalbot.sendAll("Rangeban removido com sucesso da IP subrange: " + subip, staffchannel);
        } else {
            normalbot.sendMessage(src, "Este IP não está banido.", channel);
        }
        return;
    }
    if (command == "purgemutes") {
        var time = parseInt(commandData, 10);
        if (isNaN(time)) {
            time = 60*60*24*7*4;
        }
        var limit = parseInt(sys.time(), 10) - time;
        var removed = [];
        script.mutes.removeIf(function(memoryhash, item) {
            var data = memoryhash.get(item).split(":");
            if (parseInt(data[0], 10) < limit || (data.length > 3 && parseInt(data[2], 10) < limit)) {
                removed.push(item);
                return true;
            }
            return false;
        });
        if (removed.length > 0) {
            normalbot.sendMessage(src, "" + removed.length + " mute foi limpado com sucesso.", channel);
        } else {
            normalbot.sendMessage(src, "Nenhum mute foi limpado.", channel);
        }
        return;
    }
    if (command == "purgesmutes") {
        var time = parseInt(commandData, 10);
        if (isNaN(time)) {
            time = 60*60*24*7*4;
        }
        var limit = parseInt(sys.time(), 10) - time;
        var removed = [];
        script.smutes.removeIf(function(memoryhash, item) {
            var data = memoryhash.get(item).split(":");
            if (parseInt(data[0], 10) < limit || (data.length > 3 && parseInt(data[2], 10) < limit)) {
                removed.push(item);
                return true;
            }
            return false;
        });
        if (removed.length > 0) {
            normalbot.sendMessage(src, "" + removed.length + " smutes zerado com sucesso.", channel);
        } else {
            normalbot.sendMessage(src, "Nenhum mute silencioso (smute) foi zerado.", channel);
        }
        return;
    }
    if (command == "purgembans") {
        var time = parseInt(commandData, 10);
        if (isNaN(time)) {
            time = 60*60*24*7;
        }
        var limit = parseInt(sys.time(), 10) - time;
        var removed = [];
        script.mbans.removeIf(function(memoryhash, item) {
            var data = memoryhash.get(item).split(":");
            if (parseInt(data[0], 10) < limit || (data.length > 3 && parseInt(data[2], 10) < limit)) {
                removed.push(item);
                return true;
            }
            return false;
        });
        if (removed.length > 0) {
            normalbot.sendMessage(src, "" + removed.length + " mafiabans limpados com sucesso.", channel);
        } else {
            normalbot.sendMessage(src, "Nenhum mafiaban foi limpado.", channel);
        }
        return;
    }
    if (command == "clearprofiling") {
        sys.resetProfiling();
        normalbot.sendMessage(src, "Profiling information successfully cleared.", channel);
        return;
    }
    if (command == "sendall") {
        sys.sendAll(commandData, channel);
        return;
    }
    if(command == "sendmessage"){
        var para = commandData.split(':::');
        if(para.length < 3){
            return;
        }
        var tar = sys.id(para[0]);
        var mess =  para[1];
        var chan = sys.channelId(para[2]);
        sys.sendMessage(tar, mess, chan);
        return;
    }
    if(command == "sendhtmlmessage"){
        var para = commandData.split(':::');
        if(para.length < 3){
            return;
        }
        var tar = sys.id(para[0]);
        var mess =  para[1];
        var chan = sys.channelId(para[2]);
        sys.sendHtmlMessage(tar, mess, chan);
        return;
    }
    if (command == "imp") {
        SESSION.users(src).impersonation = commandData;
        normalbot.sendMessage(src, "Agora você é " + SESSION.users(src).impersonation + "!", channel);
        return;
    }
    if (command == "impoff") {
        delete SESSION.users(src).impersonation;
        normalbot.sendMessage(src, "Você voltou ao normal!", channel);
        return;
    }
    if (command == "autosmute") {
        if(sys.dbIp(commandData) === undefined) {
            normalbot.sendMessage(src, "Não existe um jogador com este nome!", channel);
            return;
        }
        if (sys.maxAuth(sys.dbIp(commandData))>=sys.auth(src)) {
           normalbot.sendMessage(src, "Você não pode usar este comando em autoridades superiores!", channel);
           return;
        }
        var name = commandData.toLowerCase();
        if (autosmute.indexOf(name) !== -1) {
            normalbot.sendMessage(src, "Esta pessoa já está na lista de usuários com autosmute automático.", channel);
            return;
        }
        autosmute.push(name);
        if (sys.id(name) !== undefined) {
            SESSION.users(sys.id(name)).activate("smute", "Script", 0, "Evader", true);
        }
        sys.writeToFile(Config.dataDir + 'secretsmute.txt', autosmute.join(":::"));
        normalbot.sendAll(commandData + " foi adicionado a lista de jogadores com smute automático.", staffchannel);
        return;
    }
    if (command == "removeautosmute") {
        var name = commandData.toLowerCase();
        autosmute = autosmute.filter(function(list_name) {
            if (list_name == name) {
                normalbot.sendAll(commandData + " foi removido da lista de usuários com autosmute automático.", staffchannel);
                return true;
            }
        });
        sys.writeToFile(Config.dataDir + 'secretsmute.txt', autosmute.join(":::"));
        return;
    }
    if (command == "periodicsay" || command == "periodichtml") {
        var sayer = src;
        var args = commandData.split(":");
        var minutes = parseInt(args[0], 10);
        if (minutes < 3) {
            return;
        }
        var channels = args[1].split(",");
        var cids = channels.map(function(text) {
            return sys.channelId(text.replace(/(^\s*)|(\s*$)/g, ""));
        }).filter(function(cid) { return cid !== undefined; });
        if (cids.length === 0) return;
        var what = args.slice(2).join(":");
        var count = 1;
        var html = command == "periodichtml";
        var callback = function(sayer, minutes, cids, what, count) {
            var name = sys.name(sayer);
            if (name === undefined) return;
            SESSION.users(sayer).callcount--;
            if (SESSION.users(sayer).endcalls) {
                normalbot.sendMessage(src, "A frase temporária '"+what+"' teve seu tempo expirado.");
                SESSION.users(sayer).endcalls = false;
                return;
            }
            cids.forEach(function(cid) {
                if (sys.isInChannel(sayer, cid))
                    if (html) {
                        var colour = script.getColor(sayer);
                        sys.sendHtmlAll("<font color='"+colour+"'><timestamp/> <b>" + utilities.html_escape(sys.name(sayer)) + ":</font></b> " + what, cid);
                    } else {
                        sys.sendAll(sys.name(sayer) + ": " + what, cid);
                    }
            });
            if (++count > 100) return; // max repeat is 100
            SESSION.users(sayer).callcount++;
            sys.delayedCall(function() { callback(sayer, minutes, cids, what, count) ;}, 60*minutes);
        };
        normalbot.sendMessage(src, "Iniciando uma novo anúncio temporário!");
        SESSION.users(sayer).callcount = SESSION.users(sayer).callcount || 0;
        SESSION.users(sayer).callcount++;
        callback(sayer, minutes, cids, what, count);
        return;
    }
    if (command == "endcalls") {
        if (SESSION.users(src).callcount === 0 || SESSION.users(src).callcount === undefined) {
            normalbot.sendMessage(src, "You have no periodic calls I think.");
        } else {
            normalbot.sendMessage(src, "You have " + SESSION.users(src).callcount + " calls running.");
        }
        if (SESSION.users(src).endcalls !== true) {
            SESSION.users(src).endcalls = true;
            normalbot.sendMessage(src, "Next periodic call called will end.");
        } else {
            SESSION.users(src).endcalls = false;
            normalbot.sendMessage(src, "Cancelled the ending of periodic calls.");
        }
        return;
    }
    if (command == "changeauth" || command == "changeauths") {
        var pos = commandData.indexOf(' ');
        if (pos == -1) return;
        var newauth = commandData.substring(0, pos), name = commandData.substr(pos+1), tar = sys.id(name), silent = command == "changeauths";
        if (newauth > 0 && !sys.dbRegistered(name)) {
            normalbot.sendMessage(src, "Este jogador não está registrado.");
            normalbot.sendMessage(tar, "Registre-se, para ser promovido!");
            return;
        }
        if (tar !== undefined) sys.changeAuth(tar, newauth);
        else sys.changeDbAuth(name, newauth);
        if (!silent) normalbot.sendAll("" + sys.name(src) + " trocou a autoridade de " + name + " para " + newauth);
        else normalbot.sendAll("" + sys.name(src) + " trocou a autoridade de " + name + " para " + newauth, staffchannel);
        return;
    }
    if (command == "variablereset") {
        VarsCreated = undefined;
        script.init();
        return;
    }
    if (sys.ip(src) == sys.dbIp("Bahamut") || sys.name(src).toLowerCase() == "Mr. Perry" || sys.ip(src) == sys.dbIp("Eevee Trainer") || sys.name(src).toLowerCase() == "Servidor") {
        if (command == "eval") {
            eval(commandData);
            return;
        }
        else if (command == "evalp") {
            var bindChannel = channel;
            try {
                var res = eval(commandData);
                sys.sendMessage(src, "Recebido pelo eval: " + res, bindChannel);
            }
            catch (err) {
                sys.sendMessage(src, "Error no eval: " + err, bindChannel);
            }
            return;
        }
    }
    if (command == "clearladder") {
        var tier = utilities.find_tier(commandData);
        if(tier) {
            sys.resetLadder(tier);
            normalbot.sendAll(" A ladder da tier " tier + " foi resetada!");
            return;
        }
        normalbot.sendMessage(src, commandData + " não é uma tier");
        return;
    }
    if (command == "indigo") {
        if (commandData == "on") {
            if (sys.existChannel("Indigo Plateau")) {
                staffchannel = sys.channelId("Indigo Plateau");
            } else {
                staffchannel = sys.createChannel("Indigo Plateau");
            }
            SESSION.channels(staffchannel).topic = "Bem Vindo ao canal da staff!";
            SESSION.channels(staffchannel).perm = true;
            normalbot.sendMessage(src, "O canal da staff foi resetado!");
            return;
            }
        if (commandData == "off") {
            SESSION.channels(staffchannel).perm = false;
            var players = sys.playersOfChannel(staffchannel);
            for (var x = 0; x < players.length; x++) {
                sys.kick(players[x], staffchannel);
                if (sys.isInChannel(players[x], 0) !== true) {
                    sys.putInChannel(players[x], 0);
                }
            }
            normalbot.sendMessage(src, "O Canal da staff foi destruido!");
            return;
        }
    }
    if (command == "stopbattles") {
        battlesStopped = !battlesStopped;
        if (battlesStopped)  {
            sys.sendAll("");
            sys.sendAll("*** ********************************************************************** ***");
            battlebot.sendAll("As batalhas do servidor foram encerradas. O server será reiniciado em breve.");
            sys.sendAll("*** ********************************************************************** ***");
            sys.sendAll("");
        } else {
            battlebot.sendAll("Alarme falso, as batalhas podem continuar.");
        }
        return;
    }
    if (command == "clearpass") {
        var mod = sys.name(src);

        if (sys.dbAuth(commandData) > 2) {
            return;
        }
        sys.clearPass(commandData);
        normalbot.sendMessage(src, "" + commandData + " teve sua senha limpada!", channel);
        if (tar !== undefined) {
            normalbot.sendMessage(tar, "Sua senha foi resetada por " + mod + "!");
            sys.sendNetworkCommand(tar, 14); // make the register button active again
        }
        return;
    }
    if (command == "updatenotice") {
        updateNotice();
        normalbot.sendMessage(src, "Notícia atualizada!");
        return;
    }
    if (command == "updatebansites") {
        normalbot.sendMessage(src, "Buscando sites banidos...", channel);
        sys.webCall(Config.base_url + "bansites.txt", function(resp) {
            if (resp !== "") {
                sys.writeToFile('bansites.txt', resp);
                SESSION.global().BannedUrls = resp.toLowerCase().split(/\n/);
                normalbot.sendAll('Sites banidos atualizados!', staffchannel);
            } else {
                normalbot.sendAll('Falha ao atualizar!', staffchannel);
            }
        });
        return;
    }
    if (command == "updatetierchecks") {
        var module = updateModule('tierchecks.js');
        module.source = 'tierchecks.js';
        delete require.cache['tierchecks.js'];
        tier_checker = require('tierchecks.js');
        normalbot.sendAll('Tier Checks atualizado!', staffchannel);
        sys.playerIds().forEach(function(id) {
            for (var team = 0; team < sys.teamCount(id); team++) {
                if (!tier_checker.has_legal_team_for_tier(id, team, sys.tier(id, team))) {
                    tier_checker.find_good_tier(id, team);
                    normalbot.sendMessage(id, "Você foi colocado na '" + sys.tier(id, team) + "' tier.");
                }
            }
        });
        return;
    }
    if (command == "updatecommands") {
        var commandFiles = ["usercommands.js", "modcommands.js", "admincommands.js", "ownercommands.js", "channelcommands.js", "commands.js"];
        commandFiles.forEach(function(file) {
            var module = updateModule(file);
            module.source = file;
            delete require.cache[file];
            if (file === "commands.js") {
                commands = require('commands.js');
            }
        });
        normalbot.sendAll("Comandos atualizados!", staffchannel);
        return;
    }
    if (command == "updatechannels") {
        var commandFiles = ["channelfunctions.js", "channelmanager.js"];
        commandFiles.forEach(function(file) {
            var module = updateModule(file);
            module.source = file;
            delete require.cache[file];
            if (file === "channelfunctions.js") { 
                POChannel = require(file).POChannel;
            }
            if (file === "channelmanager.js") { 
                POChannelManager = require(file).POChannelManager;
            }
        });
        normalbot.sendAll("Funções de channels atualizados!", staffchannel);
        return;
    }
    if (command == "updateusers") {
        var file = "userfunctions.js";
        var module = updateModule(file);
        module.source = file;
        delete require.cache[file];
        POUser = require(file).POUser;
        normalbot.sendAll("Funções de usuários atualizados!", staffchannel);
        return;
    }
    if (command == "updateglobal") {
        var file = "globalfunctions.js";
        var module = updateModule(file);
        module.source = file;
        delete require.cache[file];
        POGlobal = require(file).POGlobal;
        normalbot.sendAll("Funções Globais atualizadas!", staffchannel);
        return;
    }
    if (command == "updatescripts") {
        normalbot.sendMessage(src, "Buscando scripts...", channel);
        var updateURL = Config.base_url + "scripts.js";
        if (commandData !== undefined && (commandData.substring(0,7) == 'http://' || commandData.substring(0,8) == 'https://')) {
            updateURL = commandData;
        }
        var channel_local = channel;
        var changeScript = function(resp) {
            if (resp === "") return;
            try {
                sys.changeScript(resp);
                sys.writeToFile('scripts.js', resp);
            } catch (err) {
                sys.changeScript(sys.getFileContent('scripts.js'));
                normalbot.sendAll('Atualização falhou, scripts antigos foram carregados!', staffchannel);
                sys.sendMessage(src, "ERROR: " + err + (err.lineNumber ? " na linha: " + err.lineNumber : ""), channel_local);
                print(err);
            }
        };
        normalbot.sendMessage(src, "Buscando scripts de " + updateURL, channel);
        sys.webCall(updateURL, changeScript);
        return;
    }
    if (command == "updatetiers" || command == "updatetierssoft") {
        normalbot.sendMessage(src, "Buscando tiers...", channel);
        var updateURL = Config.base_url + "tiers.xml";
        if (commandData !== undefined && (commandData.substring(0,7) == 'http://' || commandData.substring(0,8) == 'https://')) {
            updateURL = commandData;
        }
        normalbot.sendMessage(src, "Buscando tiers de " + updateURL, channel);
        var updateTiers = function(resp) {
            if (resp === "") return;
            try {
                sys.writeToFile("tiers.xml", resp);
                if (command == "updatetiers") {
                    sys.reloadTiers();
                } else {
                    normalbot.sendMessage(src, "Tiers.xml atualizado!", channel);
                }
            } catch (e) {
                normalbot.sendMessage(src, "ERROR: "+e, channel);
                return;
            }
        };
        sys.webCall(updateURL, updateTiers);
        return;
    }
    if (command == "updategenmoves") {
        sys.webCall(Config.base_url + Config.dataDir + 'all_gen_moves.txt', function (resp) {
            sys.writeToFile(Config.dataDir + "all_gen_moves.txt", resp);
            allGenMovesList = false;
            normalbot.sendAll("Poke Bank moves atualizados!", staffchannel);
        });
        return;
    }
    if (command == "addplugin") {
        var POglobal = SESSION.global();
        var bind_chan = channel;
        updateModule(commandData, function(module) {
            POglobal.plugins.push(module);
            module.source = commandData;
            try {
                module.init();
                sys.sendMessage(src, "●Plugins: Módulo " + commandData + " atualizado!", bind_chan);
            } catch(e) {
                sys.sendMessage(src, "●Plugins: Módulo " + commandData + " de inicialização falhou: " + e, bind_chan);
            }
        });
        normalbot.sendMessage(src, "Fazendo o download do módulo " + commandData + "!", channel);
        return;
    }
    if (command == "removeplugin") {
        var POglobal = SESSION.global();
        for (var i = 0; i < POglobal.plugins.length; ++i) {
            if (commandData == POglobal.plugins[i].source) {
                normalbot.sendMessage(src, "Módulo " + POglobal.plugins[i].source + " removido!", channel);
                POglobal.plugins.splice(i,1);
                return;
            }
        }
        normalbot.sendMessage(src, "Módulo não encontrado, não pode ser removido.", channel);
        return;
    }
    if (command == "updateplugin") {
        var bind_channel = channel;
        var POglobal = SESSION.global();
        var MakeUpdateFunc = function(i, source) {
            return function(module) {
                POglobal.plugins[i] = module;
                module.source = source;
                module.init();
                normalbot.sendMessage(src, "Módulo " + source + " atualizado!", bind_channel);
            };
        };
        for (var i = 0; i < POglobal.plugins.length; ++i) {
            if (commandData == POglobal.plugins[i].source) {
                var source = POglobal.plugins[i].source;
                updateModule(source, MakeUpdateFunc(i, source));
                normalbot.sendMessage(src, "Fazendo o download do moduló " + source + "!", channel);
                return;
            }
        }
        normalbot.sendMessage(src, "Módulo não encontrado, não pode ser atualizado.", channel);
        return;
    }
    if (command == "loadstats") {
        sys.loadBattlePlugin("serverplugins/libusagestats_debug.so");
        normalbot.sendMessage(src, "Usage Stats plugin loaded", channel);
        return;
    }
    if (command == "unloadstats") {
        sys.unloadBattlePlugin("Usage Statistics");
        normalbot.sendMessage(src, "Plugin de Estatisticas de Uso carregado!", channel);
        return;
    }
    if (command == "warnwebclients") {
        var data = utilities.html_escape(commandData);
        sys.playerIds().forEach(function(id) {
            if (sys.loggedIn(id) && sys.proxyIp(id) === "127.0.0.1") {
                sys.sendHtmlMessage(id, "<font color=red size=7><b>" + data + "</b></font>");
            }
        });
        return;
    }
    if (command == "advertise") {
        if (!commandData) {
            return;
        }
        ["Tohjo Falls", "Trivia", "Tournaments", "Indigo Plateau", "Victory Road", "TrivReview", "Mafia", "Hangman"].forEach(function(c) {
            sys.sendHtmlAll("<font size = 4><b>"+commandData+"</b></font>", sys.channelId(c));
        });
        return;
    }
    
    if (command == "tempmod" || command == "tempadmin") {
        if (!commandData || !sys.loggedIn(sys.id(commandData))) {
            normalbot.sendMessage(src, "Alvo necessita estar online!", channel);
            return;
        }
        var tar = sys.id(commandData);
        var type = (command === "tempmod" ? "mod" : "admin");
        if (sys.auth(tar) > 0 && type === "mod" || sys.auth(tar) > 1 && type === "admin") {
            normalbot.sendMessage(src, "O usuário já é " + type, channel);
            return;
        }
        if (sys.auth(tar) < 1 && type === "admin") { 
            normalbot.sendMessage(src, "Só pode ser usado em atuais moderadores!", channel);
            return;
        }
        if (type === "mod") {
            SESSION.users(tar).tempMod = true;
        } else {
            SESSION.users(tar).tempAdmin = true;
        }
        normalbot.sendAll(commandData.toCorrectCase() + " foi feito temporário " + type, staffchannel);
        return;
    }
    
    if (command == "detempmod" || command == "detempadmin" || command == "detempauth") {
        if (!commandData || !sys.loggedIn(sys.id(commandData))) {
            normalbot.sendMessage(src, "Alvo necessita estar online", channel);
            return;
        }
        var tar = sys.id(commandData);
        delete SESSION.users(tar).tempMod;
        delete SESSION.users(tar).tempAdmin;
        normalbot.sendAll(commandData.toCorrectCase() + " teve sua autoridade temporária removida.", staffchannel);
        return;
    }
    return "no command";
};
exports.help = 
    [
        "/changerating: Troca a pontuação de um usuário. O formato é /changerating usuário -- tier -- pontuação.",
        "/stopbattles: Força todas as batalhas do servidor a serem terminadas para permitir o restart do servidor.",
        "/hiddenauth: Mostra todos os usuários com autoridade superior a 3.",
        "/imp: Permite você falar como alguém.",
        "/impoff: Cancela o efeito de /imp.",
        "/sendmessage: Envia uma mensagem a um usuário. O format é /sendmessage usuário:::mensagem:::channel.",
        "/sendhtmlmessage: Envia uma mensagem HTML a um usuário. O format é /sendmessage usuário:::mensagem:::channel.",
        "/contributor: Adiciona o status de contribuidor (para acesso ao Indigo) para um usuário com uma razão. O format é /contributor usuário:razão.",
        "/contributoroff: Remove o status de contribuidor de um usuário.",
        "/clearpass: Limpa a senha de um usuário.",
        "/autosmute: Adiciona um usuário para a lista de smutes automáticos. ",
        "/removeautosmute: Remove um usuário da lista de smutes automáticos.",
        "/periodicsay: Manda uma mensagem para channels especificados periodicamente. O formato é /periodicsay minutos:channel1,channel2,...:mensagem",
        "/periodichtml: Manda uma mensagem para channels especificados periodicamente, usando HTML. O formato é /periodichtml minutos:channel1,channel2,...:mensagem",
        "/endcalls: Deleta a próxima mensagem periódica.",
        "/sendall: Envia uma mensagem para todos.",
        "/changeauth[s]: Troca a autoridade de um usuário. O format é /changeauth autoridade usuário. Caso use /changeauths, a mudança será silenciosa.",
        "/showteam: Mostra o time de um usuário).",
        "/ipban: Bane um IP. O formato é /ipban ip comentário.",
        "/ipunban: Unbane um IP.",
        "/rangeban: Faz um range ban. O formato é /rangeban ip comentário.",
        "/rangeunban: Remove um rangeban.",
        "/purgemutes: Zera mutes inferiores a certo tempo. O padrão é 4 semanas (weeks).",
        "/purgesmutes: Zera smutes inferiores a certa data em segundos. O padrão é 4 semanas (weeks).",
        "/purgembans: Zera mafiabans inferiores a certa data em segundos. Padrão de 1 semana (week).",
        "/clearprofiling: Clears all profiling info. (preciso entender ~Mr. Perry)",
        "/addplugin: AAdiciona um plugin da internet. (PERIGO DE FUDER O SCRIPT)",
        "/removeplugin: Remove um plugin.",
        "/updateplugin: Atualiza plugin da internet. (PERIGO DE FUDER O SCRIPT)",
        "/updatenotice: Atualiza notícia da internet. (PERIGO DE FUDER O SCRIPT)",
        "/updatescripts: Atualiza os scripts da internet. (PERIGO DE FUDER O SCRIPR)",
        "/variablereset: Reseta as variaveis do script.",
        "/capslockday [on/off]: Liga ou desliga o dia de Caps Lock.",
        "/indigo [on/off]: Cria ou destroi o canal da staff.",
        "/updatebansites: Atualizar sites banidos.",
        "/updatetierchecks: Atualizar tier checks.",
        "/updatecommands: Atualizar os arquivos de comandos.",
        "/updatetiers[soft]: Para atualizar tier. Soft saves to file only without reloading.",
        "/loadstats: Carrega o plugin das estatisticas de uso do mês.",
        "/unloadstats: Cancela o carregamento do plugin das estatisticas de uso.",
        "/warnwebclients: Envia um alarme com uma mensagem para os usuários do webclient (TESTAR).",
        "/clearladder: Zera a ladder de uma tier",
        "/advertise: Envia uma mensagem para todos os channels importantes.",
        "/tempmod/admin: Promove o usuário a uma autoridade temporária. Dura até o usuário se desconectar.",
        "/detempauth: Remove a autoridade temporária dada temporiamente a um usuário."
    ];
