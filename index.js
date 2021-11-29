// Load .env
require('dotenv').config()

// DEBUG .env VARIABLES
/*
console.log(process.env.DISCORD_TOKEN)
console.log(process.env.DISCORD_PREFIX)
*/

// Require needed modules
const { AudioManager } = require('discordaudio');
const discord = require('discord.js');
const client = new discord.Client({intents: [discord.Intents.FLAGS.GUILDS, discord.Intents.FLAGS.GUILD_MESSAGES, discord.Intents.FLAGS.GUILD_VOICE_STATES]});

const connections = new Map();
const audioManager = new AudioManager();

client.once('ready', () => console.log(`${client.user.username} is online!`));
client.on('messageCreate', message => {
  // Ignore commands on Direct Messages
  if(message.author.bot || message.channel.type === `DM`) return;
  // Ignore commands that do not start with DISCORD_PREFIX
  if(!message.content.startsWith(process.env.DISCORD_PREFIX)) return;
  // Get bot command
  let args = message.content.substring(process.env.DISCORD_PREFIX.length).split(" ");
  // Get voiceChannel from the message, channel can be undefined
  const voiceChannel = connections.get(message.guild.me.voice.channel?.id);

  switch(args[0].toLowerCase()){
      case 'play':
          console.log('Play action received.');
          url = args[1]
          console.log('URL received: ' + url);
          const userVoiceChannel = message.guild.me.voice.channel || message.member.voice.channel
          audioManager.play(userVoiceChannel, url, {
            volume: 2,
            quality: 'high',
            audiotype: 'arbitrary'
          }).then(queue => {
            if(queue === false) message.channel.send('Playing the song immediatly.');
            else message.channel.send('The song has been added to the queue.');
          }).catch(err => {
            console.log(err);
            message.channel.send('There was an error while trying to connect to the voice channel.');
          });
          // Set up the loop
          audioManager.loop(userVoiceChannel, audioManager.looptypes.queueloop);
          break;
      case 'stop':
          console.log('Stop action received.');
          audioManager.stop(voiceChannel);
          break;
      case 'skip':
          console.log('Skip action received.');
          audioManager.skip(voiceChannel).then(() => console.log(`Skipped song!`)).catch(console.log);
          break;
      case 'queue':
          console.log('Queue action received.');
          const queue = audioManager.queue(voiceChannel).reduce((text, song, index) => {
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
          console.log('Clear action received.');
          audioManager.clearqueue(voiceChannel);
          break;
      case 'pause':
          console.log('Mute action received.');
          audioManager.pause(voiceChannel);
          break;
      case 'resume':
          console.log('Unmute action received.');
          audioManager.resume(voiceChannel);
          break;
      case 'volume':
          console.log('Volume action received.');
          break;
    };
});

client.login(process.env.DISCORD_TOKEN);
