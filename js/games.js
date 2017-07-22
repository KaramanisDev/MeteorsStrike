var logs = false;

(function(){
	
	var game = {};

	game.status = 0;
	game.playerName = "";
	game.over = false;
	game.soundVol = true;
	game.fullscreen = false;
	game.overSound = new Howl({
		urls: ['./sounds/gameover.mp3','./sounds/gameover.wav'],
		volume: 0.5
	});
	
	game.mouse = [];
	game.mouse.x = null;
	game.mouse.y = null;
	game.mouse.clicked = false;
	game.mouse.focused = false;
	
	game.keys = [];

	game.buttons = [];
	
	game.images = [];
	game.images.loaded = 0;
	game.images.required = 10;
	game.images.success = false;
	
	game.stats = [];
	game.stats.score = 0;
	game.stats.scprkill = 10;
	game.stats.lifes = 3;
	game.stats.level = 1;
	game.stats.prelevel = 1;
	game.stats.lastkillTime = 0;
	game.stats.lvlSound = new Howl({
		urls: ['./sounds/lvlup.mp3','./sounds/lvlup.wav'],
		volume: 0.5
	});

	game.stars = [];
	game.stars.limit = 200;
	game.stars.speed = 1;

	game.meteors = [];
	game.meteors.sizeMin = 35;
	game.meteors.sizeMax = 70;
	game.meteors.add = false;
	game.meteors.speed = 0.5;
	game.meteors.minSpeed = 1.0;
	game.meteors.maxSpeed = 4.5;
	game.meteors.limit = 10;
	game.meteors.disTime = 15;
	game.meteors.addTime = 70;
	game.meteors.sound = new Howl({
		urls: ['./sounds/explosion1.mp3','./sounds/explosion1.wav'],
		volume: 1.0
	});

	game.boss = [];
	game.boss.reachEnd = false;
	game.boss.size = 150;
	game.boss.lifes = 8;
	game.boss.speed = 0.7;
	game.boss.disTime = 15;
	game.boss.sound = new Howl({
		urls: ['./sounds/explosion2.mp3','./sounds/explosion2.wav'],
		volume: 0.6
	});
	
	game.missiles = [];
	game.missiles.width = 10;
	game.missiles.height = game.missiles.width*2.7;
	game.missiles.disTime = 5;
	game.missiles.speed = 7;
	game.missiles.limit = 3;
	game.missiles.shootTime = 12;
	game.missiles.sound = new Howl({
		urls: ['./sounds/missile1.mp3','./sounds/missile1.wav'],
		volume: 0.1
	});

	game.spaceship = [];
	game.spaceship.width = 55;
	game.spaceship.height = game.spaceship.width*1.3;
	game.spaceship.moved = false;
	game.spaceship.rendered = false;
	game.spaceship.x = 0;
	game.spaceship.y = 0;
	game.spaceship.fc = 0;
	game.spaceship.stepx = 5;
	game.spaceship.stepy = 5;
	game.spaceship.dmged = false;
	game.spaceship.invul = false;
	game.spaceship.defInvulTime = 240;
	game.spaceship.defrPosTime = 15;
	game.spaceship.sound = new Howl({
		urls: ['./sounds/explosion2.mp3','./sounds/explosion2.wav'],
		volume: 0.5
	});
	
	//time counters
	game.meteors.countTime = game.meteors.addTime;
	game.missiles.countTime = game.missiles.shootTime;
	game.spaceship.invulTime = game.spaceship.defInvulTime;
	game.spaceship.rPosTime = game.spaceship.defrPosTime;


	$(document).ready(function(){
		logme('Document Loaded');

		game.canvasBG = document.getElementById('bgcanvas');
		game.ctxBG = game.canvasBG.getContext('2d');

		game.width = game.canvasBG.width;
		game.height = game.canvasBG.height;

		game.canvasMAIN = document.getElementById('maincanvas');
		game.ctxMAIN = game.canvasMAIN.getContext('2d');

		game.loading();

		load_images(['./img/spaceship1.png','./img/spaceship0.png','./img/missile.png','./img/meteor.png','./img/explosion.png','./img/spaceship2.png','./img/spaceship3.png','./img/explosion1.png','./img/boss.png','./img/force.png']);
		
		init_after_img_load();
		//init();
		//logme(init_after_images());
		
		
	});

	$(document).keydown(function(e){
		//alert(e.keyCode);
		game.keys[e.keyCode ? e.keyCode : e.which] = true;
		if (e.keyCode == 8) {
			e.preventDefault();
			$('#canvas').focus();
		}
	});

	$(document).keyup(function(e){
		//var keyCode = e.keyCode ? e.keyCode : e.which;
		delete game.keys[e.keyCode ? e.keyCode : e.which];
		game.spaceship.moved = false;
		//alert(e.keyCode);

		if(e.keyCode == 80 && game.over == false && game.status != 0){
			//P key
			game.pause();
		}
		if(e.keyCode == 77 && game.status != 0){
			//M Key
			game.muteSounds();
		}
		//70 = f
		if(e.keyCode == 67 && game.status != 0){
			// C Key
			game.cinemaMode();
		}
		if((e.keyCode >= 65 && e.keyCode <=90 || e.keyCode >= 48 && e.keyCode <=57) && game.status == 0){
			//A-Z and 0-9 keys
			if(game.playerName.length < 10){
				game.playerName = game.playerName + String.fromCharCode(e.keyCode);
			}
		}
		if (e.keyCode == 8 && game.status == 0) {
			//backspace key
			game.playerName = game.playerName.substring(0, game.playerName.length-1);
		}
		if (e.keyCode == 13 && game.status == 0) {
			//enter key
			if(game.playerName.length > 0){
				game.status = 1;
			}
		}
		
		//if(e.keyCode == 27){
			// ESC Key
		//	game.fullscreen = false;
		//	//logme(game.fullscreen);
		//}
	});
	
	$(document).mousemove(function(e) {
		var pos = getMousePos(game.canvasBG, e);
		game.mouse.x = pos.x;
		game.mouse.y = pos.y;
		//logme('Mouse X:' + game.mouse.x + ' Y:' + game.mouse.y);
	});
	
	$(document).mousedown(function(e) {
		game.mouse.focused = true;
	});
	
	$(document).mouseup(function(e) {
		game.mouse.clicked = true;
		game.mouse.focused = false;
	});
	
	function init(){
		//load scores
		$.post( "submitScore.php", function( data ) {
			$("#scoresColumn").html(data);
		});

		//add buttons
		game.buttons.add('del',415,208,16);
		game.buttons.add('Start Game',120,350,32);
		
		//add Starting Stars
		for(i=0; i<game.stars.limit; i++){
			game.stars.push({
				x: genRND(4,game.width-6),
				y: genRND(88,game.height-4),
				size: genRND(1,2)
			});
		}

		game.spaceship.x = game.width/2-game.spaceship.width/2;
		game.spaceship.y = game.height-game.spaceship.height-50;
		
		//clearInterval(game.loopIntv);
		//game.loopIntv = setInterval(function(){
		//	loop()
		//}, 1000 / 60);
		loop();

		logme('Main Canvas: ' + game.canvasMAIN);
		logme('Main ctx: ' + game.ctxMAIN);

		logme('BG Canvas: ' + game.canvasBG);
		logme('BG ctx: ' + game.ctxBG);

		logme('Images Loaded: ' + game.images.loaded);

		logme('Game Info:');
		logme('Width:' + game.width + ' Height:' + game.height);
		
	}

	function load_images(paths){
		game.images.required = paths.length;
		for(i in paths){
			var img = new Image;
			img.src = paths[i];
			game.images[i] = img;
			game.images[i].onload = function(){
				game.images.loaded++;
			}
		}
		//game.images.success = true;
	}

	function init_after_img_load(){
		if(game.images.loaded >= game.images.required){
			game.images.success = true;
			
			init();
			//return true;
		}else{
			setTimeout(function(){
				init_after_img_load();
			}, 10);
		}
	}

	game.submitScore = (function (){

		var score = game.playerName + ';' + game.stats.score;
		score = utf8_to_b64(score);
		score = strtr(score,'2oAVLSM+@1589764()!*&^$%#rtnpsmlkjihgfedcba','abcdefghijklmspntr#%$^&*!)(4679851@+SMLVAo2'); 
		$.post("submitScore.php",{data: score}).done(function(data) {
			$("#scoresColumn").html(data);
		});
	});

	game.cinemaMode = (function (){
		logme('Cinema Mode');

		var obj = document.documentElement;

		if(obj.requestFullscreen){
			obj.requestFullscreen();
		}else if(obj.msRequestFullscreen){
			obj.msRequestFullscreen();
		}else if(obj.mozRequestFullScreen){
			obj.mozRequestFullScreen();
		}else if(obj.webkitRequestFullscreen){
			obj.webkitRequestFullscreen();
		}else{
			logme('Fullscreen API is not supported');
		}

		game.resize();
	});

	game.resize = (function (){
		//logme('fullscreen: ' + game.fullscreen);

		var mainCanvas = document.getElementById('maincanvas');
		var bgCanvas = document.getElementById('bgcanvas');
		var infoColumn = document.getElementById('infoColumn');
		var scoresColumn = document.getElementById('scoresColumn');
		var gameArea = document.getElementById('gameArea');

	    var newWidth = window.innerWidth;
	    var newHeight = window.innerHeight;
	    
        newWidth = newHeight / 1.4;
        
        if(game.fullscreen == true && checkIfIE() == false){
        	
	        mainCanvas.style.height = newHeight + 'px';
	        mainCanvas.style.width = newWidth + 'px';

	        bgCanvas.style.height = newHeight + 'px';
	        bgCanvas.style.width = newWidth + 'px';

	        infoColumn.style.marginLeft = (newWidth + 210) +'px';
        	gameArea.style.marginLeft = '-' + (newWidth + 420) / 2 + 'px';
		}else{
			mainCanvas.style.height ='700px';
	        mainCanvas.style.width = '500px';

	        bgCanvas.style.height = '700px';
	        bgCanvas.style.width = '500px';

	        infoColumn.style.marginLeft = '710px';
	        scoresColumn.style.marginLeft = '0px';
        	gameArea.style.marginLeft = '-460px';
		}
	});

	game.muteSounds = (function (){
		game.soundVol = !game.soundVol;
		//logme('sound '+game.soundVol);
		if(game.soundVol){
			game.overSound.volume(0.5);
			game.stats.lvlSound.volume(0.5);
			game.meteors.sound.volume(1.0);
			game.boss.sound.volume(0.6);
			game.missiles.sound.volume(0.1);
			game.spaceship.sound.volume(0.5);
			logme('unmute');
		}else{
			game.overSound.volume(0.0);
			game.stats.lvlSound.volume(0.0);
			game.meteors.sound.volume(0.0);
			game.boss.sound.volume(0.0);
			game.missiles.sound.volume(0.0);
			game.spaceship.sound.volume(0.0);
			logme('mute');
		}
	});
	
	game.loading = (function (){
		//Loading text
		game.ctxBG.fillStyle = '#fff';
		game.ctxBG.font = 'bold italic 28pt Calibri';
		textString = 'Loading . . .';
		textXpos = (game.width/2) - (game.ctxBG.measureText(textString).width/2);
     	game.ctxBG.fillText(textString, textXpos, game.height/2);
	});
	
	game.startMenu = (function (){
		clear(game.ctxBG);

		game.ctxBG.strokeStyle = "#ffffff";
		game.ctxBG.strokeRect(2,2,game.width-4,game.height-4);

		game.ctxBG.fillStyle = 'white';
		game.ctxBG.fillRect(2, 2, game.width-4, game.height-4);
		game.ctxBG.clearRect(4,4,game.width-8,game.height-8);

		//gradient color
		var gradient = game.ctxBG.createLinearGradient(0, 0, game.width, 0);
		gradient.addColorStop("0", "grey");
		gradient.addColorStop("0.1", "grey");
		gradient.addColorStop("0.4", "red");
		gradient.addColorStop("0.6", "orange");
		gradient.addColorStop("0.8", "yellow");
		gradient.addColorStop("1", "yellow");
		//game.ctxBG.fillStyle = gradient;
		
		//Meteor Strikes logo
		//game.ctxBG.fillStyle = '#fff';
		game.ctxBG.fillStyle = gradient;
		game.ctxBG.font = 'bold italic 52pt Calibri';
		textString = 'Meteors Strike';
		textXpos = (game.width/2) - (game.ctxBG.measureText(textString).width/2);
     	game.ctxBG.fillText(textString, textXpos, 80);

		game.ctxBG.fillStyle = "white";
		game.ctxBG.font = '28pt Verdana';
		textString = 'PLEASE ENTER';
		textXpos = (game.width/2) - (game.ctxBG.measureText(textString).width/2);
     	game.ctxBG.fillText(textString, textXpos, 180);
		
		game.ctxBG.fillStyle = "white";
		game.ctxBG.font = '20pt Trebuchet MS';
		textString = 'Username:';
     	game.ctxBG.fillText(textString, textXpos, 210);
		
		game.ctxBG.strokeStyle = "white";
		usernameBoxX = textXpos + game.ctxBG.measureText(textString).width + 4;
		game.ctxBG.strokeRect(usernameBoxX,186,168,30);
		
		game.ctxBG.fillStyle = "orange";
		game.ctxBG.font = '20pt Trebuchet MS';
     	game.ctxBG.fillText(game.playerName, usernameBoxX+4, 210);
		
	});

	game.pause = (function (){
		if(game.status == 1){
			logme('game paused');

			game.status = -1;

			//Plasio
			game.ctxMAIN.fillStyle = 'rgba(0,0,0,0.6)';
			game.ctxMAIN.strokeStyle = "red";

			game.ctxMAIN.fillRect(40+107,(game.height-72)/2,235,50);
			game.ctxMAIN.strokeRect(40+107+0.5,(game.height-72)/2+0.5,235,50);

			//paused text
			game.ctxMAIN.fillStyle = 'grey';
			game.ctxMAIN.font = 'bold italic 28pt Calibri';
			textString = 'Game Paused';
	     	game.ctxMAIN.fillText(textString, 40+117, game.height/2);
		}else if(game.status == -1){
			game.status = 1;

			logme('game unpaused');
		}
	});
	
	game.gameOver = (function (){
		game.status = -1;
		game.over = true;

		//Plasio
		game.ctxMAIN.fillStyle = 'rgba(255,255,255,0.4)';
		game.ctxMAIN.strokeStyle = "red";

		game.ctxMAIN.fillRect(30+132,(game.height-72)/2,195,50);
		game.ctxMAIN.strokeRect(30+132+0.5,(game.height-72)/2+0.5,195,50);

		//game over text
		game.ctxMAIN.fillStyle = '#7a0600';
		game.ctxMAIN.font = 'bold italic 28pt Calibri';
		textString = 'Game Over';
		game.ctxMAIN.fillText(textString, 30+142, game.height/2);
	});

	game.updateScore = (function (){
		var n = game.stats.score/100;
		game.stats.level = n - (n - Math.floor(n)) + 1;
		if(game.stats.prelevel != game.stats.level){
			game.stats.lvlSound.play();
			game.stars.speed += 0.2;
			//game.meteors.speed += 0.3;
			if(game.meteors.minSpeed < 6.5){
				game.meteors.minSpeed += 0.3;
			}
			if(game.meteors.maxSpeed < 8.5){
				game.meteors.maxSpeed += 0.3;
			}
			game.meteors.limit += 1;

			if(game.meteors.addTime <= 10){
				game.meteors.addTime = 10;
			}else{
				game.meteors.addTime -= 3;
			}
			if((game.stats.level%10) == 0){
				game.stats.lifes++;
			}
			if((game.stats.level%10) == 0){
				game.missiles.limit += 1;
				if(game.missiles.shootTime > 4){
					game.missiles.shootTime -= 1;
				}
			}
			if((game.stats.level%7) == 0 && game.stats.scprkill > 2){
				game.stats.scprkill -= 2;
			}
			if((game.stats.level%5) == 0){
				game.boss.add();
				logme('Boss Added');
				if(game.boss.lifes < 32){
					game.boss.lifes += 8;
				}
			}
			game.stats.prelevel = game.stats.level;
			
		}
		if (game.stats.lifes <=0 || game.boss.reachEnd == true){
			game.gameOver();
			game.overSound.play();
			game.submitScore();
		}
	});

	game.buttons.add = (function (text,x,y,size){
		//var platos = game.ctxBG.measureText(text).width+8;
		game.buttons.push({
			text: text,
			x: x,
			y: y-size-4,
			width: 100,
			height: size+10,
			size: size,
			status: 'ok'
		});
	});
	
	game.stars.add = (function (){
		game.stars.push({
			x: genRND(4,game.width-6),
			y: 88,
			size: genRND(1,2)
		});
	});

	game.meteors.add = (function (num){
		var size = genRND(game.meteors.sizeMin,game.meteors.sizeMax);
		game.meteors.push({
			x: genRND(4,game.width-game.meteors.sizeMax-6),
			y: 88,
			width: size,
			height: size,
			speed: genRNDwDE(game.meteors.minSpeed,game.meteors.maxSpeed,1),
			exploded: false,
			disTime: game.meteors.disTime
		});
	});

	game.boss.add = (function (num){
		game.boss.push({
			x: game.width/2-game.boss.size/2,
			y: 88,
			width: game.boss.size,
			height: game.boss.size,
			speed: game.boss.speed,
			lifes: game.boss.lifes,
			exploded: false,
			disTime: game.boss.disTime
		});
	});

	game.missiles.add = (function (num){
		game.missiles.push({
			x: game.spaceship.fc,
			y: game.spaceship.y-game.spaceship.height/3,
			width: game.missiles.width,
			height: game.missiles.height,
			exploded: false,
			disTime: game.missiles.disTime
		});
		logme('Missile Fired');
	});

	game.buttons.update = (function (){

		for(i in game.buttons){
			if(hitTestPoint(game.buttons[i],game.mouse)){
				if(game.mouse.clicked == true){
					game.buttons[i].status = 'clicked';
					game.mouse.clicked = false;
				}else if(game.mouse.focused){
					game.buttons[i].status = 'focus';
				}else{
					game.buttons[i].status = 'over';
				}

			}else{
				game.buttons[i].status = 'ok';
			}
		}

		game.mouse.clicked = false;

		if(game.buttons[0].status == 'clicked'){
			game.playerName = game.playerName.substring(0, game.playerName.length-1);
		}
		if(game.buttons[1].status == 'clicked'){
			if (game.playerName.length >0){
				game.status = 1;
			}
		}	
	});
	
	game.stars.update = (function (){
		//update stars

		//add stars
		if(game.stars.length < game.stars.limit){
			game.stars.add();	
		}
		for(i in game.stars){
			//move stars
			game.stars[i].y += game.stars.speed;
			//remove stars
			if(game.stars[i].y >= game.height-8){
				game.stars.splice(i,1);
			}
		}
	});

	game.meteors.update = (function (){
		//update meteors

		//meteor timer
		if(game.meteors.countTime > 0){
			game.meteors.countTime--;

		}
		//logme(game.meteors.countTime);
		//logme(game.meteors.addTime);

		//add meteors
		if(game.meteors.length < game.meteors.limit && game.meteors.countTime <= 0){
			game.meteors.add();
			logme('Meteor added');
			game.meteors.countTime = game.meteors.addTime;
		}
		for(i in game.meteors){
			if(game.meteors.length <= 0){
				break;
			}
			//check if meteor exploded
			if(game.meteors[i].exploded){
				game.meteors[i].disTime--;
			}else{
				//move meteors
				//game.meteors[i].y += game.meteors.speed;
				game.meteors[i].y += game.meteors[i].speed;
				//logme(game.meteors[i].speed);
			}
			//remove meteors
			if(game.meteors[i].y >= game.height-game.meteors[i].height-8 || game.meteors[i].exploded && game.meteors[i].disTime <=0){
				game.meteors.splice(i,1);
			}
		}

		//logme(game.meteors.length);
	});

	game.boss.update = (function (){
		//update boss
		for(i in game.boss){
			if(game.boss.length < 1){
				break;
			}
			//check if life reached 0
			if(game.boss[i].lifes <= 0 && game.boss[i].exploded == false){
				game.boss[i].exploded = true;
				game.stats.score += 100;
			}
			//check if boss exploded
			if(game.boss[i].exploded){
				game.boss[i].disTime--;
			}else{
				//move boss
				game.boss[i].y += game.boss[i].speed;
			}
			//check if boss reached end
			if(game.boss[i].y >= game.height-game.boss[i].height-6){
				game.boss.reachEnd = true;
			}
			//remove boss if killed
			if(game.boss[i].exploded && game.boss[i].disTime <=0){
				game.boss.splice(i,1);
			}
			
		}
	});

	game.missiles.update = (function (){
		//update missiles

		//shoot timer
		if(game.missiles.countTime > 0){
			game.missiles.countTime--;
		}

		for(i in game.missiles){
			if(game.missiles.length <= 0){
				break;
			}
			//move missiles
			game.missiles[i].y -= game.missiles.speed;
			//check if missiles exploded
			if(game.missiles[i].exploded){
				game.missiles[i].disTime--;
				//game.stats.score += 10; 
			}
			//remove missiles
			if(game.missiles[i].y <= 88 || game.missiles[i].exploded && game.missiles[i].disTime <=0){
				game.missiles.splice(i,1);
			}
		}
	});

	game.spaceship.update = (function (){
		//update spaceship

		if(game.spaceship.dmged){
			game.spaceship.invul = true;
			game.spaceship.rPosTime--;
		}
		if(game.spaceship.invulTime <= 0){
			game.spaceship.invul = false;
			game.spaceship.invulTime = game.spaceship.defInvulTime;
		}
		if(game.spaceship.rPosTime <= 0 && game.spaceship.dmged == true){
			game.spaceship.dmged = false;
			game.spaceship.rPosTime = game.spaceship.defrPosTime;
			game.spaceship.x = game.width/2-game.spaceship.width/2;
			game.spaceship.y = game.height-game.spaceship.height-50;
		}

		//logme(game.spaceship.invul);
		//logme(game.spaceship.invulTime);
	});
	
	game.update = (function (){
		//collision detection 
		//check if missile hits meteor
		for(m in game.meteors){
			if(game.meteors.length <= 0){
				break;
			}
			//check if spaceship in invulnerable
			if(!game.spaceship.invul){
			//check if meteor hits spaceship
				if(collision(game.meteors[m],game.spaceship) && game.spaceship.dmged == false){
					game.stats.lifes--;
					game.meteors[m].exploded = true;
					game.spaceship.dmged = true;
					game.spaceship.sound.play();
					logme('colision meteor with spaceship');
				}
			}
			for(p in game.missiles){
				if(game.missiles.length <= 0){
					break;
				}
				if(collision(game.meteors[m],game.missiles[p]) && game.meteors[m].exploded == false){
				//if(hitTestPoint(game.meteors[m],game.missiles[p])){
					game.meteors[m].exploded = true;
					game.missiles[p].exploded = true;
					game.stats.score += game.stats.scprkill; 
					game.meteors.sound.play();
					logme('meteor exploded');
				}
			}
		}

		//check if missile hits boss
		for(m in game.boss){
			if(game.boss.length <= 0){
				break;
			}
			for(p in game.missiles){
				if(game.missiles.length <= 0){
					break;
				}
				if(collision(game.boss[m],game.missiles[p]) && game.boss[m].exploded == false && game.missiles[m].exploded == false){
					game.boss[m].lifes--;
					game.missiles[p].exploded = true; 
					game.boss.sound.play();
					logme('colision missile with boss');
				}
			}
		}

		
		//check if spaceship in invulnerable
		if(!game.spaceship.invul){
			//check if boss hits spaceship
			for(m in game.boss){
				if(game.boss.length <= 0){
					break;
				}
				if(collision(game.boss[m],game.spaceship) && game.spaceship.dmged == false){
					game.stats.lifes--;
					game.spaceship.dmged = true;
					game.spaceship.sound.play();
					logme('colision spaceship with boss');
				}
			}
		}else{
			game.spaceship.invulTime--;
		}

		//keyboard keys for movements
		var tmpx;
		var tmpy;
		if((game.keys[32] || game.keys[70]) && game.missiles.countTime <= 0){
			//spacebar or f key
			if(game.missiles.length < game.missiles.limit){
				game.missiles.add();
				game.missiles.countTime = game.missiles.shootTime;
				game.missiles.sound.play();
			}
		}
		if(game.keys[38] || game.keys[87]){
			//up or w key
			tmpy = game.spaceship.y - game.spaceship.stepy;
			if(tmpy>=88 && !game.spaceship.dmged){
				game.spaceship.y = tmpy;
				game.spaceship.moved = true;
				game.spaceship.rendered = false;
			}
		}
		if(game.keys[40] || game.keys[83]){
			//down or s key
			tmpy = game.spaceship.y + game.spaceship.stepy;
			if(tmpy<=game.height-game.spaceship.height-4 && !game.spaceship.dmged){
				game.spaceship.y = tmpy;
				game.spaceship.moved = false;
				game.spaceship.rendered = false;
			}
		}
		if(game.keys[37] || game.keys[65]){
			//left or a key
			tmpx = game.spaceship.x - game.spaceship.stepx;
			if(tmpx>=4 && !game.spaceship.dmged){
				game.spaceship.x = tmpx;
				game.spaceship.moved = true;
				game.spaceship.rendered = false;
			}
		}
		if(game.keys[39] || game.keys[68]){
			//right or d key
			tmpx = game.spaceship.x + game.spaceship.stepx;
			if(tmpx<=game.width-game.spaceship.width-1 && !game.spaceship.dmged){
				game.spaceship.x = tmpx;
				game.spaceship.moved = true;
				game.spaceship.rendered = false;
			}

		}
	});

	game.buttons.render = (function (){
		for(i in game.buttons){
			var button = game.buttons[i];
			var color = 'white';
			
			if(button.status == 'clicked'){
				color = 'red';
			}else if(button.status == 'focus'){
				color = 'red';
			}else if(button.status == 'over'){
				color = '#3769ff';
			}else{
				color = 'white';
			}
			game.ctxBG.fillStyle  = color;
			game.ctxBG.font = button.size + 'pt Lucida Console';
			game.ctxBG.fillText(button.text, button.x+4, button.y+button.size+4);
			
			game.ctxBG.strokeStyle = color;
			var platos = game.ctxBG.measureText(button.text).width+8;
			button.width = platos;
			game.ctxBG.strokeRect(button.x,button.y,button.width,button.height);
			
		}
	});

	game.stars.render = (function (){
		//render stars
		game.ctxBG.fillStyle = 'white';
		for(i in game.stars){
			var star = game.stars[i];
			game.ctxBG.fillRect(star.x,star.y,star.size,star.size);
		}
	});

	game.meteors.render = (function (){
		//render meteors
		for(i in game.meteors){
			if(game.meteors.length <= 0){
				break;
			}
			var meteor = game.meteors[i];
			var img_id = 3;
			if(meteor.exploded){
			//if(meteor.exploded && meteor.disTime <= meteor.disTime % 3){
				img_id = 4;
			}
			game.ctxMAIN.drawImage(game.images[img_id],meteor.x,meteor.y,meteor.width,meteor.height);
		}
	});

	game.boss.render = (function (){
		//render boss
		
		for(i in game.boss){
			if(game.boss.length <= 0){
				break;
			}
			var boss = game.boss[i];
			var img_id = 8;
			if(boss.exploded){
				img_id = 4;
			}
			game.ctxMAIN.drawImage(game.images[img_id],boss.x,boss.y,boss.width,boss.height);
			
			//boss life
			var lifeWidth = 0;
			if (game.boss.lifes < 32){
				lifeWidth = boss.width / (game.boss.lifes-8);
			}else{
				lifeWidth = boss.width / game.boss.lifes;
			}
			var lifeY = boss.y - 14; 
			
			game.ctxMAIN.fillStyle = 'red';
			game.ctxMAIN.fillRect(boss.x,lifeY,boss.width,10);

			game.ctxMAIN.fillStyle = '#00FF00';
			game.ctxMAIN.fillRect(boss.x,lifeY,lifeWidth * boss.lifes,10);

			game.ctxMAIN.strokeStyle = 'red';
			game.ctxMAIN.strokeRect(boss.x+0.5,lifeY+0.5,boss.width,10);


			//game.ctxBG.fillStyle = '#00FF00';
			//game.ctxBG.font = 'bold 14pt Verdana';
			//textString = boss.lifes;
     		//game.ctxBG.fillText(textString, boss.x, boss.y+5);
		}
	});

	game.missiles.render = (function (){
		//render missiles
		for(i in game.missiles){
			if(game.missiles.length <= 0){
				break;
			}
			var missile = game.missiles[i];
			game.ctxMAIN.drawImage(game.images[2],missile.x,missile.y,missile.width,missile.height);

		}
	});

	game.spaceship.render = (function (){
		//var platosimg = game.spaceship.width;
		//game.ctxMAIN.drawImage(game.images[1],game.width/2.5,200,platosimg,platosimg*1.44);
		var img_id;
		var ship = game.spaceship;

		if(ship.dmged){
			img_id = 7;
		}else if(ship.invul && ship.moved){
			img_id = 6;
		}else if(ship.invul && !ship.moved){
			img_id = 5;
		}else if(!ship.invul && ship.moved){
			img_id = 1;
		}else{
			img_id = 0;
		}

		game.ctxMAIN.drawImage(game.images[img_id],ship.x,ship.y,ship.width,ship.height);
		game.spaceship.fc = ship.x+ship.width/2-game.missiles.width+4;
	});

	game.render = (function (){
		//clear bg and main canvas
		clear(game.ctxBG);
		clear(game.ctxMAIN);

		//render gui and scoreboard
		game.guiRender();
		game.scoreboardRender();

		//if invul show force field icon and counttown
		if(game.spaceship.invul == true && game.over == false){
			game.ctxBG.drawImage(game.images[9],8,8,50,50);

			game.ctxBG.fillStyle = 'black';
			game.ctxBG.font = 'bold 11pt Verdana';
			textString = game.spaceship.invulTime/60;
	     	game.ctxBG.fillText(textString.toFixed(1), (50/2)-5, (50/2)+13);
	     	
		}
	});

	game.guiRender = (function (){
		game.ctxBG.fillStyle = 'white';
		game.ctxBG.fillRect(2, 2, game.width-4, game.height-4);
		game.ctxBG.clearRect(4,4,game.width-8,80);
		game.ctxBG.clearRect(4,86,game.width-8,game.height-90);
	});

	game.scoreboardRender = (function (){
		var textWidth = 0;

		//gradient color
		var gradient = game.ctxBG.createLinearGradient(0, 0, game.width, 0);
		gradient.addColorStop("0", "grey");
		gradient.addColorStop("0.2", "grey");
		gradient.addColorStop("0.4", "red");
		gradient.addColorStop("0.6", "orange");
		gradient.addColorStop("0.8", "yellow");
		gradient.addColorStop("1", "yellow");
		//game.ctxBG.fillStyle = gradient;

		//Meteor Strikes logo
		//game.ctxBG.fillStyle = '#fff';
		game.ctxBG.fillStyle = gradient;
		game.ctxBG.font = 'bold italic 28pt Calibri';
		textString = 'Meteors Strike';
		textX = (game.width/2) - (game.ctxBG.measureText(textString).width/2);
     	game.ctxBG.fillText(textString, textX, 40);

     	//Score
     	game.ctxBG.fillStyle = '#fff';
		game.ctxBG.font = 'bold 12pt Verdana';
		textString = 'Score: ' + game.stats.score;
     	game.ctxBG.fillText(textString, 10, 75);

     	//Level
     	game.ctxBG.fillStyle = '#fff';
		game.ctxBG.font = 'bold 12pt Verdana';
		textString = 'Level: ' + game.stats.level;
		textX = (game.width/2) - (game.ctxBG.measureText(textString).width/2);
     	game.ctxBG.fillText(textString, textX, 75);

     	//Lifes
     	game.ctxBG.fillStyle = '#fff';
		game.ctxBG.font = 'bold 12pt Verdana';
		textString = 'Lifes: ' + game.stats.lifes;
		textX = game.width - game.ctxBG.measureText(textString).width - 8;
     	game.ctxBG.fillText(textString, textX, 75);
	});


	function loop(){
		requestAnimFrame(function(){
			loop();
		});
		

		if(checkIfFullScreen()){
			game.fullscreen = true;
		}else{
			game.fullscreen = false;
		}
		game.resize();
		if(game.status == 0){
			game.startMenu();
			
			game.buttons.update();
			game.buttons.render();
		}
		
		
		//check if not paused
		if(game.status != -1 && game.status != 0){

			game.update();
			game.stars.update();
			game.meteors.update();
			game.boss.update();
			game.missiles.update();
			game.spaceship.update();
			game.updateScore();

			game.render();
			game.stars.render();
			game.meteors.render();
			game.boss.render();
			game.missiles.render();
			game.spaceship.render();

			if(game.over){
				game.gameOver();
			}
		}
		//logme('loop');
	}

	function clear(node) {
		node.clearRect(0, 0, game.width, game.height);
	}

	function hitTestPoint(obj1,obj2){
		var x1 = obj1.x;
		var y1 = obj1.y;
		var w1 = obj1.width;
		var h1 = obj1.height;
		var x2 = obj2.x;
		var y2 = obj2.y;
		//x1, y1 = x and y coordinates of object 1
		//w1, h1 = width and height of object 1
		//x2, y2 = x and y coordinates of object 2 (usually midpt)

		if ((x1 <= x2 && x1+w1 >= x2) && (y1 <= y2 && y1+h1 >= y2)){
		//if((x2 >= x1 && x2 <= x1+w1) && (y2 >= y1 && y2 <= y1+h1)){
			return true;
		}else{
			return false;
		}
	}


	function collision(object1, object2){
		if (object1.x < object2.x + object2.width  && object1.x + object1.width  > object2.x &&
			object1.y < object2.y + object2.height && object1.y + object1.height > object2.y){
				return true;
		}else{
				return false;
		}
	}

	function genRND(min,max){
	    return Math.floor(Math.random()*(max-min+1)+min);
	}
	function genRNDwDE(min,max,dec){
	    return parseFloat((Math.random() * (max - min) + min).toFixed(dec));
	}

	function checkIfFullScreen(){
		if (window.navigator.standalone ||
		   (document.fullScreenElement && document.fullScreenElement !=null) ||
		   (document.mozFullScreen || document.webkitIsFullScreen)){
			return true;
		}else{
			return false;
		}
	}

	function checkIfIE(){
		if (navigator.userAgent.indexOf('MSIE') !== -1 || navigator.appVersion.indexOf('Trident/') > 0) {
		    return true;
		}else{
			return false;
		}
	}

	function getMousePos(canvas, evt) {
        var rect = canvas.getBoundingClientRect();
        return {
          x: evt.clientX - rect.left,
          y: evt.clientY - rect.top
        };
    }


	function utf8_to_b64(str) {
    return window.btoa(unescape(encodeURIComponent(str)));
	}

	function b64_to_utf8(str) {
	    return decodeURIComponent(escape(window.atob(str)));
	}

	function strtr(str, from, to) {
	  var fr = '',
	    i = 0,
	    j = 0,
	    lenStr = 0,
	    lenFrom = 0,
	    tmpStrictForIn = false,
	    fromTypeStr = '',
	    toTypeStr = '',
	    istr = '';
	  var tmpFrom = [];
	  var tmpTo = [];
	  var ret = '';
	  var match = false;

	  // Received replace_pairs?
	  // Convert to normal from->to chars
	  if (typeof from === 'object') {
	    tmpStrictForIn = this.ini_set('phpjs.strictForIn', false); // Not thread-safe; temporarily set to true
	    from = this.krsort(from);
	    this.ini_set('phpjs.strictForIn', tmpStrictForIn);

	    for (fr in from) {
	      if (from.hasOwnProperty(fr)) {
	        tmpFrom.push(fr);
	        tmpTo.push(from[fr]);
	      }
	    }

	    from = tmpFrom;
	    to = tmpTo;
	  }

	  // Walk through subject and replace chars when needed
	  lenStr = str.length;
	  lenFrom = from.length;
	  fromTypeStr = typeof from === 'string';
	  toTypeStr = typeof to === 'string';

	  for (i = 0; i < lenStr; i++) {
	    match = false;
	    if (fromTypeStr) {
	      istr = str.charAt(i);
	      for (j = 0; j < lenFrom; j++) {
	        if (istr == from.charAt(j)) {
	          match = true;
	          break;
	        }
	      }
	    } else {
	      for (j = 0; j < lenFrom; j++) {
	        if (str.substr(i, from[j].length) == from[j]) {
	          match = true;
	          // Fast forward
	          i = (i + from[j].length) - 1;
	          break;
	        }
	      }
	    }
	    if (match) {
	      ret += toTypeStr ? to.charAt(j) : to[j];
	    } else {
	      ret += str.charAt(i);
	    }
	  }

	  return ret;
	}
})();

function logme(text){
	if(logs){
		console.log(text);
	}
}

window.requestAnimFrame = (function(){
	return  window.requestAnimationFrame       || 
	    	window.webkitRequestAnimationFrame || 
			window.mozRequestAnimationFrame    || 
			window.oRequestAnimationFrame      || 
			window.msRequestAnimationFrame     || 
			function(callback, element){
				window.setTimeout(callback, 1000 / 60);
			};
})();