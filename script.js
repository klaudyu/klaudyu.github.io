const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;


const img = new Image();
img.src = 'waves.jpg';
/*img.onload = function() {
ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
}*/


function changeSaturation(color, saturation) {
  // Convert color from RGB to HSL color space
  let hsl = rgbToHsl(color.r, color.g, color.b);

  // Adjust saturation value
  hsl[1] = hsl[1]*saturation;

  // Convert color back to RGB color space
  let rgb = hslToRgb(hsl[0], hsl[1], hsl[2]);

  return {
    r: rgb[0],
    g: rgb[1],
    b: rgb[2]
  };
}

// Function to convert RGB color to HSL color
function rgbToHsl(r, g, b) {
  r /= 255, g /= 255, b /= 255;
  let max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max == min) {
    h = s = 0; // achromatic
  } else {
    let d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return [h, s, l];
}

// Function to convert HSL color to RGB color
function hslToRgb(h, s, l) {
  let r, g, b;

  if (s == 0) {
    r = g = b = l; // achromatic
  } else {
    function hue2rgb(p, q, t) {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    }

    let q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    let p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}



function getDistance(x1, y1, x2, y2) {
  const xDistance = x2 - x1;
  const yDistance = y2 - y1;
  return Math.sqrt(Math.pow(xDistance, 2) + Math.pow(yDistance, 2));
}

function distance(ball1,ball2){
	return getDistance(ball1.x,ball1.y,ball2.x,ball2.y)-ball1.radius-ball2.radius;
}


function killBall(ball) {
  const index = balls.indexOf(ball);
  if (index !== -1) {
	ball.relationship.forEach((p)=>{p.relationship=[];});
    balls.splice(index, 1);
  }
}

function resolveCollision(ball1, ball2) {
	const xVelocityDiff = ball1.dx - ball2.dx;
	const yVelocityDiff = ball1.dy - ball2.dy;
	const xDistance = ball2.x - ball1.x;
	const yDistance = ball2.y - ball1.y;
  
	let bounce = 1;
	ball1.relationship.forEach((partner)=>{
	if (ball2 === partner){
		bounce=.4;
		if(Math.random()>.90){
			const ball=ball1.gender?ball2:ball1;
			if (ball.age>15 && ball.age<80){ball.pregnant=true;}
		}
	}
  });
  if (bounce==1){
	  ball1.age+=.01;
	  ball2.age+=.01;
  }


  if (xVelocityDiff * xDistance + yVelocityDiff * yDistance >= 0) {
    const angle = -Math.atan2(ball2.y - ball1.y, ball2.x - ball1.x);

    const m1 = ball1.radius * ball1.radius;
    const m2 = ball2.radius * ball2.radius;

    const u1 = rotate(ball1.dx, ball1.dy, angle);
    const u2 = rotate(ball2.dx, ball2.dy, angle);

    const v1 = {
      x: ((m1 - m2) * u1.x + 2 *bounce* m2 * u2.x) / (m1 + m2),
      y: u1.y,
    };
    const v2 = {
      x: ((m2 - m1) * u2.x + 2 *bounce* m1 * u1.x) / (m1 + m2),
      y: u2.y,
    };

    const finalV1 = rotate(v1.x, v1.y, -angle);
    const finalV2 = rotate(v2.x, v2.y, -angle);

    ball1.dx = finalV1.x
	ball1.dy = finalV1.y;
	ball2.dx = finalV2.x;
	ball2.dy = finalV2.y;
	/*
	const vv1=ball1.dx*ball1.dx+ball1.dy*ball1.dy
	const vv2=ball2.dx*ball2.dx+ball2.dy*ball2.dy
	if (m1*vv1>m2*vv2){
	killBall(ball2);
	ball1.radius+=Math.sqrt(ball2.radius);
	}else{
	killBall(ball1);
	ball2.radius+=Math.sqrt(ball1.radius);
	}*/

      ball1.isShocked = true;
      ball1.shockFrames = 0;
	  ball2.isShocked = true;
      ball2.shockFrames = 0;
	  if (ball1.gender!=ball2.gender && ball1.relationship.length==0 && ball2.relationship.length==0){
		if (ball1.age>15 && ball2.age>15){
			if(Math.pow(ball1.age-ball2.age,2)/100<Math.random()){
				console.log(`${ball1.age} ${ball2.age}`);
			  ball1.relationship.push(ball2);
			  ball2.relationship.push(ball1);
			}
		}
	  }

	}
}

function rotate(dx, dy, angle) {
	return {
	x: dx * Math.cos(angle) - dy * Math.sin(angle),
	y: dx * Math.sin(angle) + dy * Math.cos(angle),
	};
}



class Ball {
  constructor(x, y, dx, dy, radius,age) {
	this.gender= Math.round(Math.random());
	let randomHue;
	if (this.gender){
	 randomHue = 120 + Math.random() * 120;
	}else{
	 randomHue = Math.random() < 0.5 ? Math.random() * 60 : 300 + Math.random() * 60;}

	this.color = `hsl(${randomHue}, 50%, 50%)`;
	console.log(`${this.color}`);
    this.x = x;
    this.y = y;
    this.dx = dx;
    this.dy = dy;
    this.size = radius;
	this.radius=radius;
    this.angle = 0;
    this.rotationSpeed = Math.random() * 0.1 - 0.05; // Random rotation speed between -0.05 and 0.05
	this.isShocked=false;
	this.shockDuration = Math.random()*50+10; // duration of shock effect in frames
    this.shockFrames = 0; // number of frames elapsed since shock effect started
	this.relationship=[];
	this.age=age;
	this.pregnant=false;
	this.pregnancy=0;
 
  }

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();

    // Draw the eyes
    const eyeOffset = this.isShocked ? this.radius * 0 : 0;
    const eyeRadius = this.isShocked ? this.radius * 0.25 : this.radius * 0.15;
	/*if (this.isShocked){
      ctx.beginPath();
      ctx.arc(-this.radius * 0.4, -this.radius * 0.4 - eyeOffset, eyeRadius, 0, Math.PI);
      ctx.lineWidth = this.radius * 0.1;
      ctx.strokeStyle = 'black';
      ctx.stroke();
	  ctx.beginPath();
	  
	  ctx.arc(this.radius * 0.4, -this.radius * 0.4 - eyeOffset, eyeRadius, 0, Math.PI);
      ctx.lineWidth = this.radius * 0.1;
      ctx.strokeStyle = 'black';
      ctx.stroke();
	  
	  }
	  
	else{*/

	/* //hair
	ctx.beginPath();
	ctx.moveTo(0,-this.radius);
	ctx.lineTo(0,-this.radius*(1+this.age/100));
	ctx.strokeStyle = 'black';
	ctx.stroke();
	*/


	ctx.beginPath();
    ctx.arc(-this.radius * 0.4, -this.radius * 0.4 - eyeOffset, eyeRadius, 0, Math.PI * 2);
    ctx.fillStyle = 'white';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(this.radius * 0.4, -this.radius * 0.4 - eyeOffset, eyeRadius, 0, Math.PI * 2);
    ctx.fillStyle = 'white';
    ctx.fill();
      ctx.beginPath();
      ctx.arc(-this.radius * 0.4, -this.radius * 0.4 - eyeOffset, eyeRadius * 0.6, 0, Math.PI * 2);
      ctx.fillStyle = 'black';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(this.radius * 0.4, -this.radius * 0.4 - eyeOffset, eyeRadius * 0.6, 0, Math.PI * 2);
      ctx.fillStyle = 'black';
      ctx.fill();
	//}

    // Draw the mouth
    if (!this.isShocked) {
      ctx.beginPath();
	        ctx.lineWidth = this.radius * 0.1;
      ctx.strokeStyle = 'black';
	  if (!this.pregnant){
		ctx.arc(0, this.radius * 0.1, this.radius * 0.5, Math.PI * 0.2, Math.PI * 0.8);
		ctx.stroke();
	  }else{
		  ctx.arc(0, this.radius * 0.4, this.radius * 0.3, 0, Math.PI);
		  ctx.fill();
	  }

      
    } else {
      ctx.beginPath();
      ctx.arc(0, this.radius * 0.4, this.radius * 0.3, 0, Math.PI * 2);
      ctx.fillStyle = 'black';
      ctx.fill();
    }


    ctx.closePath();
    ctx.restore();

    this.angle += this.rotationSpeed;
  }


  update(balls) {
    for (let i = 0; i <balls.length ; i++) {
      if (this === balls[i]) continue;
      if (getDistance(this.x, this.y, balls[i].x, balls[i].y) < this.radius + balls[i].radius) {
        resolveCollision(this, balls[i]);
      }
    }
	
	if (this.age<20 && Math.random()>.95){
		const angle=Math.random()*2*Math.PI;
		const speed=Math.random()*2+2;
		this.dx=Math.sin(angle)*speed;
		this.dy=Math.cos(angle)*speed;
	}

    if (this.x + this.radius > canvas.width || this.x - this.radius < 0) {
      this.dx = -this.dx;
    }
    if (this.y + this.radius > canvas.height || this.y - this.radius < 0) {
      this.dy = -this.dy;
    }
	
	this.relationship.forEach((partner) => {
		if (distance(partner,this)>20){
			this.dx+=(partner.x-this.x)/1000;
			this.dy+=(partner.y-this.y)/1000;
		}
	});
	this.age+=.01;
	this.radius=Math.sin(this.age/100*1.5+.7)*this.size;
	if (this.age>100){killBall(this);}


	  const matches = this.color.match(/hsl\((\d.+),\s*([\d.]+)%,\s*([\d.]+)%\)/);
	  const hue = parseFloat(matches[1]);
	  const lightness = .5;//parseFloat(matches[3]) / 100;
	  const saturation = 100-this.age;// parseFloat(matches[2]);
	  const newColor = `hsl(${hue}, ${saturation}%, ${lightness * 100}%)`;
	  this.color=newColor;
	if (this.pregnant){
		this.pregnancy+=.01;
		if(this.pregnancy>10){
			const sx=this.dx*3;
			const sy=this.dy*3;
			balls.push(new Ball(this.x, this.y, sx, sy, this.size,1));
			this.pregnancy=0;
			this.pregnant=false;
		}
	}

    this.x += this.dx;
    this.y += this.dy;

    // Handle shock effect
    if (this.isShocked) {
      this.shockFrames++;
      if (this.shockFrames >= this.shockDuration) {
        this.isShocked = false;
      }
    }
	
	
	ctx.strokeStyle = "rgba(0, 0, 0, 0.03)";
	this.relationship.forEach((partner) => {drawLine(this,partner);});
    this.draw();
  }
  

}


  function drawLine(ball1, ball2) {
  ctx.beginPath();
  ctx.moveTo(ball1.x, ball1.y);
  ctx.lineTo(ball2.x, ball2.y);
  ctx.stroke();
	}


const balls = [];
for (let i = 0; i < 100; i++) {
  const radius = Math.random() * 30 + 20;
  const x = Math.random() * (canvas.width - radius * 2) + radius;
  const y = Math.random() * (canvas.height - radius * 2) + radius;
  const dx = (Math.random() - 0.5) * 10;
  const dy = (Math.random() - 0.5) * 10;
  const age=Math.random()*100;
  balls.push(new Ball(x, y, dx, dy, radius,age));
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  balls.forEach((ball) => {
    ball.update(balls);
  });
  requestAnimationFrame(animate);
}


animate();
