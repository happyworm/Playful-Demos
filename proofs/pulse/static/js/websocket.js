var dataSocket = new WebSocket("ws://immense-lake-7450.herokuapp.com/echo");

dataSocket.onopen = function(){
	console.log("websocket open!");
}

dataSocket.onmessage =  function(e){
	var data = JSON.parse(e.data);

	if (data.id === "ICA"){
		camera.cardiac(data.array, data.bufferWindow);
	}

}

function sendData(data){
	dataSocket.send(data);
}

dataSocket.onclose = function(){
	console.log('closed');
}