const {AudioManager} = require('discordaudio');
const discord = require('discord.js');

const client = new discord.Client({intents: [discord.Intents.FLAGS.GUILDS, discord.Intents.FLAGS.GUILD_MESSAGES, discord.Intents.FLAGS.GUILD_VOICE_STATES]});

const config = {
    token: '',
    prefix: 'jp.'
};

const connections = new Map();

const audioManager = new AudioManager();

// uvc = user voice channel

client.once('ready', () => console.log(`${client.user.username} is online!`));

client.on('messageCreate', message => {
    if(message.author.bot || message.channel.type === `DM`) return;

    if(!message.content.startsWith(config.prefix)) return;

    let args = message.content.substring(config.prefix.length).split(" ");

    const vc = connections.get(message.guild.me.voice.channel?.id);

    switch(args[0].toLowerCase()){
        case 'play':
            if(!message.member.voice.channel && !message.guild.me.voice.channel) return message.channel.send({content: `Please join a voice channel in order to play a song!`});
            if(!args[1]) return message.channel.send({content: `Please provide a song`});
            const uvc = message.member.voice.channel || message.guild.me.voice.channel;
            audioManager.play(uvc, args[1], {
                quality: 'high',
                audiotype: 'arbitrary',
                volume: 2
            }).then(queue => {
                connections.set(uvc.id, uvc);
                if(queue === false) message.channel.send({content: `Your song is now playing!`});
                else message.channel.send({content: `Your song has been added to the queue!`});
            }).catch(err => {
                console.log(err);
                message.channel.send({content: `There was an error while trying to connect to the voice channel!`});
            });
            break;
        case 'skip':
            if(!vc) return message.channel.send({content: `There is currently nothing playing!`});
            audioManager.skip(vc).then(() => message.channel.send({content: `Successfully skipped the song!`})).catch(err => {
                console.log(err);
                message.channel.send({content: `There was an error while skipping the song!`});
            });
            break;
        case 'stop':
            if(!vc) return message.channel.send({content: `There is currently nothing playing!`});
            audioManager.stop(vc);
            message.channel.send({content: `Player successfully stopped!`});
            break;
        case 'queue':
            if(!vc) return message.channel.send({content: `There is currently nothing playing!`});
            const queue = audioManager.queue(vc).reduce((text, song, index) => {
                if(song.title) text += `**[${index + 1}]** ${song.title}`;
                else text += `**[${index + 1}]** ${song.url}`;
                return text;
            }, `__**QUEUE**__`);
            const queueEmbed = new discord.MessageEmbed()
            .setColor(`BLURPLE`)
            .setTitle(`Queue`)
            .setDescription(queue);
            message.channel.send({embeds: [queueEmbed]});
            break;
		case 'clear':
			if(!vc) return message.channel.send({content: `There is currently nothing playing!`});
			audioManager.clearqueue(vc)
			break;
		case 'mute':
			message.guild.me.voice.setMute(true, "Muting").then(() => {
			message.channel.send("I have successfully muted myself.");
			});
			break;
		case 'unmute':
			message.guild.me.voice.setMute(false, "Unmuting").then(() => {
			message.channel.send("I have successfully umuted myself.");
			});
			break;
        case 'volume':
            if(!vc) return message.channel.send({content: `There is currently nothing playing!`});
            if(!args[1]) return message.channel.send({content: `Please provide the volume`});
            if(Number(args[1] < 1 || Number(args[1]) > 10)) return message.channel.send({content: `Please provide a volume between 1-10`});
            audioManager.volume(vc, Number(args[1]));
            break;
		case 'help':
			message.channel.send({
				content: `JigglyPuff v1.0!

Prefisso bot: jp.

Il bot dispone dei seguenti comandi:
jp.play
  Mostrami una canzone da cantare (solo link a youtube).
jp.stop
  Per farmi smettere, ma so già che non vorrai.
jp.skip
  Questa ti sta annoiando? Procediamo con la prossima in coda!
jp.queue
  Per sapere quali canzoni ci sono in programma.
jp.volume [num]
  Il valore standard è impostato a 2. Non vuoi sentire i miei acuti, non è vero? Vacci piano
jp.mute | jp.unmute
  Un comando per mutarmi e smutarmi a piacimento.
jp.help
  Mostra quest'utilissimo messaggio.
`
			});
			break;
	};
});

client.login(config.token);
