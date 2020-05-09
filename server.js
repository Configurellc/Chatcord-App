const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const { userJoin, getCurrentUser, userLeave, getRoomUsers } = require('./utils/users'); 

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Set static folder
app.use(express.static(path.join(__dirname, 'public')))

const botName = 'Chatcord Bot';
//Run when client connects
io.on('connection', socket =>{

    //Join room
    socket.on('joinRoom', ({ username, room}) => {
        const user = userJoin(socket.id, username, room);
        
        socket.join(user.room);
    //welcome new user
    socket.emit('message', formatMessage(botName, 'Welcome to ChatCord'))

    //brodcast when user conncect
    socket.broadcast.to(user.room).emit(
        'message', 
        formatMessage(botName, `${user.username} has joined the chat`));

      //Send users room info
        io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getRoomUsers(user.room)
   
        }); 
    });
    
    //Listen for chatMessage
    socket.on('chatMessage', (msg) => {
        const user = getCurrentUser(socket.id);

       io.to(user.room).emit('message', formatMessage(`${user.username}`, msg));
        
        console.log( msg );
    });

    //runs when client disconnects
    socket.on('disconnect', () => {
        const user = userLeave(socket.id);
        console.log('user', user);
        
        if(user) {
            console.log( 'hello', user.username )
            io.to(user.room).emit('message', formatMessage(botName, `${user.username} has left the chat`))

                //Send users room info
            io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: getRoomUsers(user.room)
            });
        }
   

    });


io.emit()

} )

const PORT = 3000 || process.env.PORT;

server.listen(PORT, () => console.log(`Server running on ${PORT}`));