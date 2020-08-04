const socket = io('/')
const videoGrid = document.getElementById('video-grid')
const myPeer = new Peer({
    host: 'peerjs-server.herokuapp.com',
    secure: true,
    port: 443,
})
const myVid = document.createElement('video')
myVid.muted = true

navigator.mediaDevices.getUserMedia({
    video:true,
    audio:true
}).then(stream=>{
    addVidStream(myVid, stream)

    myPeer.on('call',call=>{
        call.answer(stream)
        const video = document.createElement('video')
        call.on('stream',userVideoStream=>{
            addVidStream(video, userVideoStream)
        })
    })

    socket.on('user-connected', userId=>{
        connectToNewUser(userId,stream)
    })
})

const peers = {}
socket.on('user-disconnected',userId =>{
    console.log(userId)
    if(peers[userId]) peers[userId].close()
})

myPeer.on('open',id => {

    socket.emit('join-room', ROOM_ID,id)
})

socket.on('user-connected', userId =>{
    console.log('user connected ' + userId)
})


function addVidStream(video,stream){
    video.srcObject = stream
    video.addEventListener('loadedmetadata',()=>{
        video.play()
    })
    videoGrid.append(video)
}

function connectToNewUser(userId, stream){
    const call = myPeer.call(userId,stream)
    const video = document.createElement('video')
    call.on('stream',userVideoStream => {
        addVidStream(video,userVideoStream)
    })
    call.on('close',()=>{
        video.remove()
    })

    peers[userId] = call
}