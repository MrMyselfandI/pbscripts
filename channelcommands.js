exports.handleCommand = function(src, command, commandData, tar, channel) {
    var poChannel = SESSION.channels(channel);
    if (poChannel.operators === undefined)
        poChannel.operators = [];
        
    if (command == "passcauth") {
        var oldname = sys.name(src);
        var action = commandData.split("*");
        var newname = action[0];
        var position = action[1].toLowerCase();
        if (sys.id(newname) === undefined) {
            channelbot.sendMessage(src, "Seu alvo não está online.", channel);
            return;
        }
        if (!sys.dbRegistered(newname)) {
            channelbot.sendMessage(src, "Este nickname não está registrado, logo não pode receber autoridade!", channel);
            return;
        }
        if (sys.ip(sys.id(newname)) !== sys.ip(src)) {
            channelbot.sendMessage(src, "Ambos nicknames necessitam ser do mesmo IP!", channel);
            return;
        }
        if (poChannel.isChannelMember(src) && position === "member") {
            if (poChannel.members.indexOf(newname) > -1) {
                channelbot.sendMessage(src, newname + " já é membro deste canal!", channel);
                return;
            }
            poChannel.members.splice(poChannel.members.indexOf(oldname),1);
            poChannel.members.push(newname);
            channelbot.sendAll(sys.name(src) + " transferiu sua conta membra deste canal para " + newname + "!", channel);
            return;
        }
        if (poChannel.isChannelOperator(src) && (position === "op" || position === "mod")) {
            if (poChannel.operators.indexOf(newname) > -1) {
                channelbot.sendMessage(src, newname + " já é moderador deste canal!", channel);
                return;
            }
            poChannel.operators.splice(poChannel.operators.indexOf(oldname),1);
            poChannel.operators.push(newname);
            channelbot.sendAll(sys.name(src) + " transferiu sua autoridade para " + newname + "!", channel);
            return;
        }
        if (poChannel.isChannelAdmin(src) && position === "admin") {
            if (poChannel.admins.indexOf(newname) > -1) {
                channelbot.sendMessage(src, newname + " já é administrador deste canal!", channel);
                return;
            }
            poChannel.admins.splice(poChannel.admins.indexOf(oldname),1);
            poChannel.admins.push(newname);
            channelbot.sendAll(sys.name(src) + " transferiu sua autoridade para " + newname + "!", channel);
            return;
        }
        if (poChannel.isChannelOwner(src) && position === "owner") {
            if (poChannel.masters.indexOf(newname) > -1) {
                channelbot.sendMessage(src, newname + " já é proprietário deste canal!", channel);
                return;
            }
            poChannel.masters.splice(poChannel.masters.indexOf(oldname),1);
            poChannel.masters.push(newname);
            channelbot.sendAll(sys.name(src) + " transferiu sua autoridade para " + newname + "!", channel);
            return;
        }
        channelbot.sendMessage(src, "Você não tem autoridade suficiente para utilizar este comando.", channel);
        return;
    }
    
    if (!poChannel.isChannelOperator(src)) {
        return "no command";
    }
    
    if (command == "lt" || command == "lovetap") {
        if (tar === undefined) {
            normalbot.sendMessage(src, "Escolha um alvo online!", channel);
            return;
        }
        var colour = script.getColor(src);
        sendChanHtmlAll("<font color='"+colour+"'><timestamp/> *** <b>" + utilities.html_escape(sys.name(src)) + "</b> dá tapinhas de amor em " + commandData + ".</font>", channel);
        sys.kick(tar, channel);
        return;
    }
    if (command == "ck" || command == "chankick") {
        if (tar === undefined || !sys.isInChannel(tar, channel)) {
            normalbot.sendMessage(src, "Escolha um alvo online", channel);
            return;
        }
        normalbot.sendAll(sys.name(src) + " chutou "+commandData+" deste canal!", channel);
        sys.kick(tar, channel);
        return;
    }
    if (command == "invite") {
        if (tar === undefined) {
            channelbot.sendMessage(src, "Escolha um alvo válido para ser convidado!", channel);
            return;
        }
        if (sys.isInChannel(tar, channel) && SESSION.channels(channel).canJoin(tar) == "allowed") {
            channelbot.sendMessage(src, "Seu alvo já está aqui!", channel);
            return;
        }
        if (SESSION.channels(channel).canJoin(tar) == "banned") {
            channelbot.sendMessage(src, "Seu alvo está banido deste canal!", channel);
            return;
        }
        var now = (new Date()).getTime();
        if (now < SESSION.users(src).inviteDelay) {
            channelbot.sendMessage(src, "Espere um pouco antes de enviar outro convite!");
            return;
        }
        if (!sys.isInChannel(tar, channel)) {
            channelbot.sendMessage(tar, "" + sys.name(src) + " gostaria que você entrasse em #" + sys.channel(channel) + "!");
        }
        var guardedChans = [staffchannel, sachannel, watchchannel, revchan];
        if ((sys.auth(tar) < SESSION.channels(channel).inviteonly || guardedChans.indexOf(channel) !== -1) && SESSION.channels(channel).canJoin(tar) != "allowed") {
            poChannel.issueAuth(src, commandData, "member");
        } else {
            channelbot.sendMessage(src, "Seu alvo foi convidado.", channel);
        }
        SESSION.users(src).inviteDelay = (new Date()).getTime() + 8000;
        return;
    }
    if (command == "member") {
        poChannel.issueAuth(src, commandData, "member");
        return;
    }
    if (command == "deinvite" || command == "demember") {
        poChannel.takeAuth(src, commandData, "member");
        if (tar !== undefined) {
            if (sys.isInChannel(tar, channel) && command == "deinvite") {
                sys.kick(tar, channel);
                channelbot.sendAll("E "+commandData+" se foi...", channel);
            }
        }
        return;
    }
    if (command == "cmeon") {
        script.meon(src, sys.channel(channel));
        return;
    }
    if (command == "cmeoff") {
        /*if (channel === 0 || channel == tourchannel) {
            normalbot.sendMessage(src, "/me não pode ser desligado aqui.", channel);
            return;
        }*/
        script.meoff(src, sys.channel(channel));
        return;
    }
    if (command == "csilence") {
        if (typeof(commandData) == "undefined") {
            return;
        }
        script.silence(src, commandData, sys.channel(channel));
        return;
    }
    if (command == "csilenceoff") {
        script.silenceoff(src, sys.channel(channel));
        return;
    }
    if (command == "cmute") {
        var tmp = commandData.split(":",3);
        var tarname = tmp[0];
        var time = 0;
        var reason = "";
        if (tmp.length >= 2) {
            reason = tmp[1];
            if (tmp.length >= 3) {
                time = getSeconds(tmp[2]);
                if (isNaN(time)) {
                    time = 0;
                }
            }
        }
        if (sys.dbIp(tarname) === undefined) {
            normalbot.sendMessage(src, "Este usuário não existe.", channel);
            return;
        }
        poChannel.mute(src, tarname, {'tempo': time, 'motivo': reason});
        return;
    }
    if (command == "cunmute") {
        poChannel.unmute(src, commandData);
        return;
    }
    if (command == "cmutes") {
        var cmutelist = poChannel.getReadableList("mutelist");
        if (cmutelist !== "") {
            sys.sendHtmlMessage(src, cmutelist, channel);
        }
        else {
            channelbot.sendMessage(src, "Ninguém está silenciado neste canal.", channel);
        }
        return;
    }
    if (command == "cbans") {
        var cbanlist = poChannel.getReadableList("banlist");
        if (cbanlist !== "") {
            sys.sendHtmlMessage(src, cbanlist, channel);
        }
        else {
            channelbot.sendMessage(src, "Ninguém está banido neste canal.", channel);
        }
        return;
    }

    if (!poChannel.isChannelAdmin(src)) {
        return "no command";
    }

    if (command == "op") {
        poChannel.issueAuth(src, commandData, "mod");
        return;
    }
    if (command == "deop") {
        poChannel.takeAuth(src, commandData, "mod");
        return;
    }
    if (command == "inviteonly") {
        if (commandData === undefined) {
            channelbot.sendMessage(src,poChannel.inviteonly === 0 ? "Este channel é público!" : "Este channel só pode ser adentrado por membros convidados ou autoridade superior a "+poChannel.inviteonly, channel);
            return;
        }
        var value = -1;
        if (commandData == "off") {
            value = 0;
        }
        else if (commandData == "on") {
            value = 3;
        }
        else {
            value = parseInt(commandData,10);
        }
        var message = poChannel.changeParameter(src, "invitelevel", value);
        normalbot.sendAll(message, channel);
        return;
    }
    if (command == "ctoggleflood") {
        poChannel.ignoreflood = !poChannel.ignoreflood;
        channelbot.sendMessage(src, "Agora " + (poChannel.ignoreflood ? "" : "dis") + "permite flood excessivo.", channel);
        return;
    }
    if (command == "ctoggleswear") {
        poChannel.allowSwear = !poChannel.allowSwear;
        channelbot.sendAll(sys.name(src) + " " + (poChannel.allowSwear ? "" : "dis") + "permitiu que se xingue!", poChannel.id);
        return;
    }
    if (command == "ctogglecaps") {
        poChannel.ignorecaps = !poChannel.ignorecaps;
        channelbot.sendMessage(src, "Now " + (poChannel.ignorecaps ? "" : "dis") + "permitiu o abuso de CAPS Lock.", channel);
        return;
    }
    if (command == "cban") {
        var tmp = commandData.split(":",3);
        var tarname = tmp[0];
        var time = 0;
        var reason = "";
        if (tmp.length >= 2) {
            reason = tmp[1];
            if (tmp.length >= 3) {
                time = getSeconds(tmp[2]);
                if (isNaN(time)) {
                    time = 0;
                }
            }
        }
        if (sys.dbIp(tarname) === undefined) {
            normalbot.sendMessage(src, "Este usuário não existe.", channel);
            return;
        }
        poChannel.ban(src, tarname, {'tempo': time, 'motivo': reason});
        return;
    }
    if (command == "cunban") {
        poChannel.unban(src, commandData);
        return;
    }
    // auth 2 can deregister channel for administration purposes
    if (!poChannel.isChannelOwner(src) && sys.auth(src) < 2) {
        return "no command";
    }
    if (command == "deregister") {
        if (commandData === undefined) {
            poChannel.takeAuth(src, sys.name(src), "owner");
        }
        else {
            poChannel.takeAuth(src, commandData, "owner");
        }
        return;
    }
    if (!poChannel.isChannelOwner(src)) {
        return "no command";
    }
    if (command == "admin") {
        poChannel.issueAuth(src, commandData, "admin");
        return;
    }
    if (command == "deadmin") {
        poChannel.takeAuth(src, commandData, "admin");
        return;
    }
    if (command == "owner") {
        poChannel.issueAuth(src, commandData, "owner");
        return;
    }
    if (command == "deowner") {
        poChannel.takeAuth(src, commandData, "owner");
        return;
    }
    return "no command";
};
exports.help = function(src, channel) {
    var poChannel = SESSION.channels(channel);
    sys.sendMessage(src, "/cauth: Mostra os membros do canal.", channel);
    sys.sendMessage(src, "/register: Registra o canal que você está atualmente, caso este não esteje registrado.", channel);
    if (poChannel.isChannelMember(src) || poChannel.isChannelOperator(src) || poChannel.isChannelAdmin(src) || poChannel.isChannelOwner(src)) {
        sys.sendMessage(src, "*** Comandos para membros do channel ***", channel);
        sys.sendMessage(src, "/passcauth [name]*[position]: Passa sua autoridade/nickname convidado para outro nickname. O novo nickname necessita estar registrado e compartilhar o mesmo IP. Posições válidas: mod (ou op), admin e owner.", channel);
    }
    if (poChannel.isChannelOperator(src) || poChannel.isChannelAdmin(src) || poChannel.isChannelOwner(src)) {
        sys.sendMessage(src, "*** Comandos para moderadores do channel ***", channel);
        sys.sendMessage(src, "/topic [topico]: Muda o tópico de um channel. Só funciona se você tiver autoridade nele. Mostra o tópico atual caso nenhum texto seja específicado.", channel);
        sys.sendMessage(src, "/topicadd [mensagem]: Usa o sepadador de partes do tópico ' | ' e adiciona sua mensagem ao fim do tópico.", channel);
        sys.sendMessage(src, "/removepart [número]: Remove a parte do tópico específicada por um número", channel);
        sys.sendMessage(src, "/updatepart [número] [mensagem]: Muda certa parte do tópico para a específicada em mensagem.", channel);
        sys.sendMessage(src, "/ck: Chuta um usuário do channel.", channel);
        sys.sendMessage(src, "/member: Faz de um usuário membro.", channel);
        sys.sendMessage(src, "/demember: Retira os status de membro de um usuário.", channel);
        sys.sendMessage(src, "/invite: Faz um usuário membro e envia um convite a ele para se juntar ao channel.", channel);
        sys.sendMessage(src, "/deinvite: Chuta o usuário do servidor e remove o status de membro dele.", channel);
        sys.sendMessage(src, "/cmeon: Liga o comando /me neste channel.", channel);
        sys.sendMessage(src, "/cmeoff: Desliga o comando /me neste channel.", channel);
        sys.sendMessage(src, "/csilence: Faz com que usuários sem autoridade sejam silencianos no canal por certo tempo.", channel);
        sys.sendMessage(src, "/csilenceoff: Permite que usuários voltem a falar no canal.", channel);
        sys.sendMessage(src, "/cmute: Silencia alguém neste channel (motivo e tempo são opcionais). o format é usuário:motivo:tempo", channel);
        sys.sendMessage(src, "/cunmute: Cancela o silêncio de alguém neste channel.", channel);
        sys.sendMessage(src, "/cmutes: Lista os usuários silenciados deste channel.", channel);
        sys.sendMessage(src, "/cbans: Lista os usuários banidos deste channel.", channel);
    }
    if (poChannel.isChannelAdmin(src) || poChannel.isChannelOwner(src)) {
        sys.sendMessage(src, "*** Comandos para administradores do channel ***", channel);
        sys.sendMessage(src, "/op: Dá a certo usuário cargo de moderador neste channel.", channel);
        sys.sendMessage(src, "/deop: Retira o cargo de moderador de um usuário.", channel);
        sys.sendMessage(src, "/inviteonly [on/off/level]: Faz o channel inviteonly [apenas para membros convidados] ou público.", channel);
        sys.sendMessage(src, "/ctogglecaps: Liga/desliga [on/off] o bot de prevenção de caps no channel.", channel);
        sys.sendMessage(src, "/ctoggleflood: Liga/desliga [on/off] o bot de prevenção de flood no channel. Efeitos de OA [Overactive] ainda podem ocorrer.", channel);
        sys.sendMessage(src, "/ctoggleswear: Liga/desliga [on/off] o bot de prevenção de xingamentos.", channel);
        sys.sendMessage(src, "/cban: Bane um usuário deste channel (motivo e tempo são opcionais). O format é usuáro:motivo:tempo", channel);
        sys.sendMessage(src, "/cunban: Desbane um usuário deste channel.", channel);
        sys.sendMessage(src, "/enabletours: Permite que torneios ocorram neste canal.", channel);
        sys.sendMessage(src, "/disabletours: Não permite que torneios ocorram neste canal.", channel);
        if (sys.auth(src) >= 2) {
            sys.sendMessage(src, "/deregister: Remove o status de proprietário do channel de um usuário.", channel);
        }
    }
    if (poChannel.isChannelOwner(src)) {
        sys.sendMessage(src, "*** Comandos para proprietários do channel ***", channel);
        sys.sendMessage(src, "/admin: Torna um usuário administrador do channel.", channel);
        sys.sendMessage(src, "/deadmin: Remove os poderes de administrador do channel de um usuário.", channel);
        sys.sendMessage(src, "/owner: Torna um usuário proprietário do channel.", channel);
        sys.sendMessage(src, "/deowner: Remove os poderes de proprietário do channel de um usuário.", channel);
    }
    if (SESSION.global().permaTours.indexOf(channel) > -1) {
        sys.sendMessage(src, "*** Comandos para torneios ***", channel);
        sys.sendMessage(src, "/join: Para se inscrever em um torneio.", channel);
        sys.sendMessage(src, "/unjoin: Para cancelar a inscrição em um torneio.", channel);
        sys.sendMessage(src, "/viewround: Mostra as chaves do atual torneio.", channel);
        sys.sendMessage(src, "/viewqueue: Mostra a lista de espera de torneios.", channel);
        sys.sendMessage(src, "/touralerts [on/off]: Liga/desliga alerta de tiers para torneios (Mostra lista completa caso nada seja especificado)", channel);
        sys.sendMessage(src, "/addtouralert: Adiciona um alerta para uma tier.", channel);
        sys.sendMessage(src, "/removetouralert: Remove o alerta para certa tier.", channel);
        if (poChannel.isChannelOperator(src) || poChannel.isChannelAdmin(src) || poChannel.isChannelOwner(src)) {
            sys.sendMessage(src, "*** Comandos para administradores de torneios do channel ***", channel);
            sys.sendMessage(src, "/tour: Inicia um torneio no channel. O formato é /tour tier:número:tipo. Tipo é opcional e pode ser determinado em Singles, Doubles ou Triples.", channel);
            sys.sendMessage(src, "/queue: Adiciona um torneio para a lista de espera. O formato é is /queue tier:número:tipo.", channel);
            sys.sendMessage(src, "/endtour: Cancela o torneio atual.", channel);
            sys.sendMessage(src, "/dq: Desqualifica alguém do torneio.", channel);
            sys.sendMessage(src, "/push: Adiciona um usuário no torneio.", channel);
            sys.sendMessage(src, "/changecount: Muda o número de participantes do torneio durante a fase de inscrições.", channel);
            sys.sendMessage(src, "/sub: Substitui um usuário por outro no torneio. O formato é /sub usuário1:usuário2", channel);
            sys.sendMessage(src, "/cancelBattle: Cancela o resultado de uma batalha (necessita estar em andamento!) para que esta seja re-feita.", channel);
            sys.sendMessage(src, "/rmqueue: Remove uma tier da lista de espera.", channel);
        }
    }
};
