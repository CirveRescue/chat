// index.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const tmi = require('tmi.js');
const { WebcastPushConnection } = require('tiktok-live-connector');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = 3000;

app.use(express.static('public'));

server.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

// Socket.io: enviar mensajes a la web
io.on('connection', (socket) => {
  console.log('Cliente conectado');
});

// =============== TWITCH ==================
const twitchClient = new tmi.Client({
  connection: { reconnect: true },
  channels: ['karpecat'] // ← pon aquí el nombre de tu canal de Twitch
});

twitchClient.connect().then(() => {
  console.log('✅ Conectado al canal de Twitch');
}).catch(err => {
  console.error('❌ Error al conectar a Twitch:', err);
});

twitchClient.on('message', (channel, tags, message, self) => {
  io.emit('chatMessage', {
    platform: 'Twitch',
    user: tags['display-name'],
    message
  });
});

// =============== TIKTOK ==================
const tiktokUsername = 'karpecat'; // ← pon aquí tu usuario de TikTok

let tiktok = new WebcastPushConnection(tiktokUsername);

tiktok.connect().then(() => {
  console.log('Conectado a TikTok Live');
}).catch(err => {
  console.error('Error al conectar a TikTok:', err);
});

tiktok.on('chat', (data) => {
  io.emit('chatMessage', {
    platform: 'TikTok',
    user: data.uniqueId,
    message: data.comment
  });
});
