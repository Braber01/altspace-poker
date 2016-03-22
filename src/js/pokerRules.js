var numArray = [2, 3, 4, 5, 6, 7, 8, 9, 10, "jack", "queen", "king", "ace"];

var suitArray = ["clubs", "diamonds", "hearts", "spades"];




function card(number, suit){
	this.number = number;
	this.suit = suit;
  this.image = document.createElement( 'img' );
  this.image.src = this.filename();
  this.movementTween = {
    position: new THREE.Vector3(0, 0, 0),
    rotation: new THREE.Vector3(0, 0, 0)
  };
  this.geom;// = null;
}

card.prototype.friendlynumber = function(){
	return numArray[this.number];
}

card.prototype.texturePrefix = "http://foxgamestudios.com/wp-content/uploads/2016/02/";

card.prototype.filename = function(){
	return this.texturePrefix+numArray[this.number]+"_of_"+this.suit+".png";
}





function deck(){
	this.perfectDeck = [];		//deck of cards in perfect order;
	this.shuffledDeck = [];
	for(var i=0; i<numArray.length; i++){
		for(var j=0; j<suitArray.length; j++){
			this.perfectDeck.push(new card(i, suitArray[j]));
		}
	}
}

deck.prototype.shuffle = function(){
	this.shuffledDeck = this.perfectDeck.slice(0);
	var tempCard;		//Fisher-Yates algorithm for randomness
	for(var i=this.shuffledDeck.length - 1; i > 0; i--){
		var j = Math.floor(Math.random() * (i+1));
		tempCard = this.shuffledDeck[i];
		this.shuffledDeck[i] = this.shuffledDeck[j];
		this.shuffledDeck[j] = tempCard;
	}
}

deck.prototype.dealTo = function(players, numCards){
	if(typeof(players.length) == "undefined"){
		players = [players];
	}
	for(var i=0; i<numCards; i++){
		var thiscard = this.shuffledDeck.pop();
		for(var j=0; j<players.length; j++){
			players[j].cards.push(thiscard);
		}
	}
}

deck.prototype.getCard = function(theCard, large){
  large = large || false;
    console.log(theCard, large);

  //console.log(theCard, (theCard instanceof card));
  
  var thisCard;
  if(theCard instanceof card){
    thisCard = theCard;
  }else{
    for(var i=0; i<this.perfectDeck.length; i++){
        if(this.perfectDeck[i].number === theCard.number && this.perfectDeck[i].suit === theCard.suit){
          thisCard = this.perfectDeck[i];
          break;
        }
    }
  }
  
  if(typeof thisCard.geom === 'undefined' || thisCard.geom.userData.large !== large){
    
    sim.scene.remove(thisCard.geom);
    delete thisCard.geom;
    
    createCardGeom(thisCard, large);
    thisCard.geom.userData.large = large;
  }
  if(large){
    thisCard.geom.scale.set(1.5, 1.5, 1.5);
    thisCard.geom.position.set(i*0.1, thisCard.geom.position.y, i*0.1);
    thisCard.geom.rotation.set(0, Math.PI/4, 0);
    toggleVisible(thisCard.geom, true);
    thisCard.movementTween.rotation.copy(thisCard.geom.rotation);
    thisCard.movementTween.position.copy(thisCard.geom.position);
  }else{
    thisCard.geom.position.set(0, tableOffset.y - cardTemplate.height/2 + 10, 0);
    thisCard.geom.rotation.set(Math.PI/2, 0, 0);
    thisCard.geom.scale.set(1, 1, 1);
    toggleVisible(thisCard.geom, true);
  }
  return thisCard;
}


function ruleset(){
	this.handRanking = [];
}

ruleset.prototype.judge = function(cards){
	var hand = {
		name: "",
		value: -1,
	};
	for(var i=0; i<this.handRanking.length; i++){
		if(this.handRanking[i].isHand(cards)){
			hand.name = this.handRanking[i].name;
			hand.value = this.handRanking.length - i;
			break;
		}
	}
	return hand;
}

var mainRules = new ruleset();
mainRules.handRanking = [
	{
		name: "Straight Flush",
		isHand: function(cards){
			return isStraight(cards) && isFlush(cards);
		}
	},
	{
		name: "Four of a kind",
		isHand: function(cards){
			return hasMultiples(cards, 4);
		}
	},
	{
		name: "Full House",
		isHand: function(cards){
			var sortedCards = [];
			for(var i=0; i<cards.length; i++){
				if(typeof(sortedCards[cards[i].number]) == "undefined"){
					sortedCards[cards[i].number] = 0;
				}
				sortedCards[cards[i].number]++;
			}
			
			var findPair = false;
			var findTrips = false;
			
			sortedCards.forEach(function(number){
				if(parseInt(number) === 2){
					findPair = true;
				}else if(parseInt(number) === 3){
					findTrips = true;
				}
			});
			return findPair && findTrips;
		}
	},		
	{
		name: "Flush",
		isHand: function(cards){
			return isFlush(cards);
			
		}
	},		
	{
		name: "Straight",
		isHand: function(cards){
			return isStraight(cards);
		}
	},		
	{
		name: "Three of a kind",
		isHand: function(cards){
			return hasMultiples(cards, 3);
		}
	},	
	{
		name: "Two pair",
		isHand: function(cards){
			var sortedCards = [];
			for(var i=0; i<cards.length; i++){
				if(typeof(sortedCards[cards[i].number]) == "undefined"){
					sortedCards[cards[i].number] = 0;
				}
				sortedCards[cards[i].number]++;
			}
			
			var findThem = 0;
			
			sortedCards.forEach(function(number){
				if(parseInt(number) === 2){
					findThem++;
					return;
				}
			});
			return findThem === 2;
		}
	},	
	{
		name: "One pair",
		isHand: function(cards){
			return hasMultiples(cards, 2);
		}
	},	
	{
		name: "High card",
		isHand: function(cards){
			return true;
		}
	},	
]

function hasMultiples(cards, numberOfMultiples){
	if(numberOfMultiples <= 1){
		return true;
	}
	var sortedCards = [];
	for(var i=0; i<cards.length; i++){
		if(typeof(sortedCards[cards[i].number]) == "undefined"){
			sortedCards[cards[i].number] = 0;
		}
		sortedCards[cards[i].number]++;
	}
	
	var findThem = false;
	
	sortedCards.forEach(function(number){
		if(parseInt(number) === parseInt(numberOfMultiples)){
			findThem = true;
			return;
		}
	})
	
	return findThem;
}

function isFlush(cards){
      if(cards.length < 5){
				return false;
			}
			var suits = {};
			for(var i=1; i<cards.length; i++){
				if(typeof suits[cards[i].suit] === "undefined"){
					suits[cards[i].suit] = 0;
				}else{
          suits[cards[i].suit]++;
        }
			}
      var isFlush = false;
  
      for(var propertyName in suits) {
        if(suits.hasOwnProperty(propertyName) && suits[propertyName]>=5){
          isFlush = true;
        }
      }
			return isFlush;
}

function isStraight(cards){
	var theseCards = cards.slice(0);
	theseCards.sort(function(card1, card2){
		if(card1.number === card2.number){
			return 0;
		}else{
			return card1.number > card2.number;
		}
	});
	var offset = theseCards[0].number;
	for(var i=offset; i<theseCards.length+offset; i++){
		if(theseCards[i-offset].number != i){
			return false;
		}
	}
	return true;
}


function game(){
	this.players = [];
  this.dealingOrder = [];
  this.bettingOrder = [];
  this.dealer = 0;
  this.better = 0;
	this.deck = {};
  this.step = -1;
  this.judge = mainRules;
  
  this.sharedCards = {
    cards:[]
  };
  this.bettingPot = 0;
}

game.prototype.start = function(){
  this.step = 1;
  this.dealer = 0;
  this.better = 0;
  for(var i=0; i<this.players.length; i++){
    if(this.players[i].state === 0){    //they're  waiting
      this.players[i].state = 2;
    }
  }
  console.log("starting game", this);
  this.runStep();
}

game.prototype.resetBetters = function(){
  var bettingOrder = [];
  for(var i=0; i<this.dealingOrder.length; i++){
    if(this.dealingOrder[i].state >= 1 && this.dealingOrder[i].state <= 3){    //they're still in the game, but waiting
      bettingOrder.push(i);
    }
  }
  this.bettingOrder = bettingOrder;
}

game.prototype.resetDealers = function(){
  console.log('reseting dealers'); 
  this.dealer = 0;
  switch(this.players.length){
    case 3:
      this.dealingOrder[0] = this.players[0];
      this.dealingOrder[1] = this.players[2];
      this.dealingOrder[2] = this.players[1];
      break;
    case 4:
      this.dealingOrder[0] = this.players[0];
      this.dealingOrder[1] = this.players[2];
      this.dealingOrder[2] = this.players[1];
      this.dealingOrder[3] = this.players[3];
      break;
    default:
      this.dealingOrder = this.players;
      break;
  }
}

game.prototype.rotateDealers = function(){
  this.dealingOrder.unshift(this.dealingOrder.pop());
  this.resetBetters();
}

game.prototype.runStep = function(){
  this.resetBetters();
  this.logic.steps[this.step].exec(this);
  //console.log('sending step', this.step);
  //theGame.syncInstance.update(getSafeGameObj());
}

game.prototype.setStep = function(theStep){
  console.log('recieving a game step update');
  this.step = theStep;
  this.runStep();
}

game.prototype.nextBet = function(){
  //sets the state of the current player back to 'wait' (2) and sets state of next player to 'bet' (3)
  
  //if we only have one player left, they win
  //if we have multiple players left
  if(this.bettingOrder.length === 1 && (this.step !== this.logic.steps.length - 2)){ 
      //take to judging
      this.step = this.logic.steps.length - 2;
      sendUpdate({}, "Going straight to judging");
      this.runStep();
      return;
  }  
  if(this.dealingOrder[this.bettingOrder[this.better]].state !== 4){
    this.dealingOrder[this.bettingOrder[this.better]].state = 2;
  }
  this.better++;
  this.startBetting();

} 

game.prototype.startBetting = function(){
  if(this.better === this.bettingOrder.length){
    this.step++;
    this.better = 0;
    //sendUpdate({}, "done betting, next step");
    this.runStep();
  }else if(this.dealingOrder[this.bettingOrder[this.better]].state !== 3){
    this.dealingOrder[this.bettingOrder[this.better]].state = 3;
    sendUpdate({}, this.dealingOrder[this.bettingOrder[this.better]].spot +" is now betting");
  }
}

var betStep = function(game){
        game.betCube.visible = true;
        game.resetBetters(); 
				if(game.dealingOrder[game.bettingOrder[game.better]].state !== 3){
					game.dealingOrder[game.bettingOrder[game.better]].state = 3;
          sendUpdate({}, game.dealingOrder[game.bettingOrder[game.better]].spot +" is starting the betting");
				}
}

var texasHoldEm = {
	steps: [
    {   //0
      exec: function(game){
        game.resetDealers();
        game.deck.shuffle();
        //game.rotateDealers();
        game.start();
      }
    },
		{   //1
			exec: function(game){
						//deal 2 to players
            document.querySelector("svg .playerCount").style.display = "none";
            game.startGameButton.visible = false;
            
            //game.rotateDealers();
            for(var i=0; i<game.players.length; i++){
              if(game.players[i].state > -1 && game.players[i].cards.length === 0){
                game.deck.dealTo(game.players[i], 2);
                game.players[i].state = 1;    //player animates their own cards 
              }
            }
            sendUpdate({}, "dealing first cards"); 
        
            //takes about 5s to get the cards
            window.setTimeout(function(){
              if(game.step !== 2){
                game.step = 2;
                sendUpdate({}, "start betting round 1");
                game.runStep();
              }
            }, 5000);
            
			}
		},
		{ //2
			exec: betStep
		},
		{ //3
			exec: function(game){
      game.betCube.visible = false;
            //make a show of discarding a card
			var dealTo = [];
			/*for(var i=0; i<game.bettingOrder.length; i++){
				dealTo.push(game.dealingOrder[game.bettingOrder[i]]);
			}*/
			dealTo.push(game.sharedCards);
      if(game.sharedCards.cards.length === 0){
		      game.deck.dealTo(dealTo, 3);
          sendUpdate({}, "Dealing the flop");
      }
           for(var i=0; i<game.sharedCards.cards.length; i++){ 
               game.sharedCards.cards[i] = game.deck.getCard(game.sharedCards.cards[i], true);
               
               var toPlayerTween = new TWEEN.Tween(game.sharedCards.cards[i].movementTween.position).to({x:(-100-(cardTemplate.width+5)*i), y: 0, z: (100+(cardTemplate.width+5)*i)}, 2000);
               toPlayerTween.onUpdate((function(card){
                  return function(value1){
                      //move the cards to the player
                    card.geom.position.copy(card.movementTween.position);
                  }
                }(game.sharedCards.cards[i])));
               toPlayerTween.start();
            }
        
        
            window.setTimeout(function(){
              if(game.step != 4){
                game.step = 4;
                sendUpdate({}, "start betting round 2");
                game.runStep();
              }
            }, 2000); 
			}
		},
		{ //4
			exec: betStep
		},
		{ //5
			exec: function(game){
				game.betCube.visible = false;
				var dealTo = [];
				/*for(var i=0; i<game.bettingOrder.length; i++){
				dealTo.push(game.dealingOrder[game.bettingOrder[i]]);
			}*/
				dealTo.push(game.sharedCards);
        if(game.sharedCards.cards.length === 3){
				      game.deck.dealTo(dealTo, 1);
              sendUpdate({}, "Dealing the turn");

        }
              game.sharedCards.cards[3] = game.deck.getCard(game.sharedCards.cards[3], true);
              
               var toPlayerTween = new TWEEN.Tween(game.sharedCards.cards[3].movementTween.position).to({x:(-100-(cardTemplate.width+5)*3), y: 0, z: (100+(cardTemplate.width+5)*3)}, 2000);
               toPlayerTween.onUpdate((function(card){
                  return function(value1){
                      //move the cards to the player
                    card.geom.position.copy(card.movementTween.position);
                  }
                }(game.sharedCards.cards[3])));
               toPlayerTween.start();
            window.setTimeout(function(){
              if(game.step != 6){
                game.step = 6;
                sendUpdate({}, "start betting round 3");
                game.runStep();
              }
            }, 2000); 
			}
		},
		{ //6
			exec: betStep
		},
		{ //7
			exec: function(game){
            game.betCube.visible = false;
			var dealTo = [];
			/*for(var i=0; i<game.bettingOrder.length; i++){
				dealTo.push(game.dealingOrder[game.bettingOrder[i]]);
			}*/
			dealTo.push(game.sharedCards);
      if(game.sharedCards.cards.length === 4){
			  game.deck.dealTo(dealTo, 1);
        sendUpdate({}, "Dealing the river");
      }
       game.sharedCards.cards[4] = game.deck.getCard(game.sharedCards.cards[4], true);
       
               var toPlayerTween = new TWEEN.Tween(game.sharedCards.cards[4].movementTween.position).to({x:(-100-(cardTemplate.width+5)*4), y: 0, z: (100+(cardTemplate.width+5)*4)}, 2000);
               toPlayerTween.onUpdate((function(card){
                  return function(value1){
                      //move the cards to the player
                    card.geom.position.copy(card.movementTween.position);
                  }
                }(game.sharedCards.cards[4])));
               toPlayerTween.start();
          window.setTimeout(function(){
            if(game.step !== 8){
              game.step = 8;
              sendUpdate({}, "start betting round 4");
              game.runStep();
            }
            }, 2000); 
			}
		},
		{ //8
			exec: betStep
		},
		{ //9
			exec: function(game){
        
            game.betCube.visible = false;
            var highestHand = {value:-2};
            var winningPlayer;
            for(var i=0; i<game.bettingOrder.length; i++){
              if(game.judge.judge(game.dealingOrder[game.bettingOrder[i]].cards).value > highestHand.value){
                highestHand = game.judge.judge(game.dealingOrder[game.bettingOrder[i]].cards);
                winningPlayer = game.dealingOrder[game.bettingOrder[i]];
              }
            }
            console.log(winningPlayer, "wins with", highestHand);
            winningPlayer.win(game.bettingPot, highestHand);
						window.setTimeout(function(){
              if(game.step !== 10){
                game.step = 10;
                sendUpdate({}, "judging cards");
                game.runStep();
              }
            }, 3000);
			}
		},
    { //10
      exec: function(game){
        game.winCube.visible = false;
        game.cardsToDeck();
        for(var i=0; i<game.players.length; i++){
          //go through every player, if they have no money, they need to leave
          //broke-ass punks
          
          if(game.players[i].money === 0 && game.players[i].state !== -1){
            game.players[i].state = -1;
          }else if(game.players[i].state === 4){
            game.players[i].state = 0;
          }
        }
        window.setTimeout(function(){
          //game.rotateDealers(); 
          if(game.step !== 0){
            game.step = 0;
            sendUpdate({}, "Next hand");
            game.runStep();
          }
        }, 2000);
      }
    }
	]
}


function toggleVisible(object, visible){
      object.visible = visible;
      for(var i = 0, max = object.children.length; i<max ;i++){
         toggleVisible(object.children[i], visible);
      }
}




