const getDadJoke = () => {
  fetch('https://icanhazdadjoke.com/', {
    headers: {
      Accept: 'application/json'
    }
  })
  .then(function(response) {
    return response.json();
  })
  .then(function(myJson) {
    document.getElementById('content-dadJoke-back').innerHTML = JSON.stringify(myJson.joke);
  });
}

function revealJoke(event){
	var element = event.currentTarget;
	if (element.className === "card") {
    if(element.style.transform == "rotateY(180deg)") {
      element.style.transform = "rotateY(0deg)";
    }
    else {
      element.style.transform = "rotateY(180deg)";
      getDadJoke()
    }
  }
};
