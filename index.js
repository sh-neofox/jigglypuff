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
  // Get voiceChannel from the message
  const userVoiceChannel = message.member.voice.channel
  // Message Sent -> GuildMember -> VoiceState -> channel
  console.log('Jigglypuff risulta collegato nel canale ' + message.member.voice.channel.name + ', con ID ' + message.member.voice.channel.id)

  switch(args[0].toLowerCase()){
      case 'play':
          const defaultVolume = 2;
          const defaultQuality = 'high';
          const defaultAudioType = 'arbitrary';
          const logPlayCommand = new discord.MessageEmbed()
            .setColor('GOLD')
            .setTitle('__Play Command Debug__')
            .setDescription('*URL*: ' + args[1]
            + '\n' + '*Volume* : ' + defaultVolume
            + '\n' + '*Quality* : ' + defaultQuality
            + '\n' + '*AudioType* : ' + defaultAudioType
            + '\n' + '*Channel* : ' + message.member.voice.channel.name
            + '\n' + '*Channel ID* : ' + message.member.voice.channel.id
          );
          message.channel.send({embeds: [logPlayCommand]});
          audioManager.play(userVoiceChannel, args[1], {
            volume: defaultVolume,
            quality: defaultQuality,
            audiotype: defaultAudioType
          }).then(queue => {
            if(queue === false) message.channel.send('Playing the song immediatly.');
            else message.channel.send('The song has been added to the queue.');
          }).catch(err => {
            console.log(err);
            message.channel.send('There was an error while trying to connect to the voice channel.');
          });
          // Set up the loop
          audioManager.loop(userVoiceChannel, audioManager.looptypes.queueloop);
          console.log(client.voiceClient);
          break;
      case 'stop':
          console.log('Stop action received.');
          audioManager.stop(userVoiceChannel);
          break;
      case 'skip':
          console.log('Skip action received.');
          audioManager.skip(userVoiceChannel).then(() => console.log(`Skipped song!`)).catch(console.log);
          break;
      case 'queue':
          console.log('Queue action received.');
          const queue = audioManager.queue(userVoiceChannel).reduce((text, song, index) => {
                if(song.title) text +="\n" + `**[${index + 1}]** ${song.title}`;
                else text += "\n" + `**[${index + 1}]** ${song.url}`;
                return text;
            }, `__**LIST**__`);
            const queueEmbed = new discord.MessageEmbed()
            .setColor(`LUMINOUS_VIVID_PINK`)
            .setTitle(`Queue`)
            .setDescription(queue);
            message.channel.send({embeds: [queueEmbed]});
          break;
      case 'clear':
          console.log('Clear action received.');
          audioManager.clearqueue(userVoiceChannel);
          break;
      case 'pause':
          console.log('Mute action received.');
          audioManager.pause(userVoiceChannel);
          break;
      case 'resume':
          console.log('Unmute action received.');
          audioManager.resume(userVoiceChannel);
          break;
      case 'volume':
          console.log('Volume action received.');
          break;
    };
});

client.login(process.env.DISCORD_TOKEN);
