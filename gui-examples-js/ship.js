function Ship(id, context, x, y, width, height, angle) {
    this.id = id;
    this.context = context;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.angle = angle;
    
    this.constrainAngle();
    
    function Point(px, py) { this.x = px; this.y = py; }
    
    this.src = '../svg/ship-one.svg';
    this.image = new Image();
    this.image_angle = -90;
    
    this.route = null;
    this.speed = 0;

    this.visible = true;   
    this.in_progress = false;
    
    this.build();
};

Ship.prototype.build = function() { 
    let ship = this;
    
    this.image.onload = function() {
        ship.draw();
    };
    
    this.image.src = this.src;
    
    this.constrainAngle();
    
    addEventListener('ship-arrived', function(e) {
        if(e.detail.ship === ship) {
            ship.updateRoute(e.detail.x, e.detail.y);
        }
    });
};

Ship.prototype.calc = function() {
    dispatchEvent(new CustomEvent("ship-changed", { detail : { ship : this } }));
};

Ship.prototype.draw = function() {
    this.context.save();
    this.context.translate(this.x, this.y);
    this.context.rotate((this.angle - this.image_angle) * Math.PI / 180);
    this.context.drawImage(this.image, -this.width / 2, -this.height / 2, this.width, this.height);
    this.context.restore();   
};

Ship.prototype.rotate = function(angle, duration, delay) {
    let ship = this;
                           
    this.in_progress = true;
                       
    let start;
    let time = null;
    let fraction = 0;
    let request = null;
    
    let init_a = ship.angle;
       
    function rotateAnim() {
        time = Date.now();
        
        fraction = (time - start) / (duration * 1000);
                    
        if((time - start) > duration * 1000) { 
            ship.angle = ship.constrainAngle(init_a + angle);
            cancelAnimationFrame(request);
            dispatchEvent(new CustomEvent("ship-rotated", { detail : { ship : ship } }));
        }
        else {
            ship.visible = true;            
            let da = fraction * angle;
            ship.angle = init_a + da;
            ship.calc();           
            
            window.requestAnimFrame(rotateAnim);
        }            
    };
        
    request = setTimeout(function() {
        start = Date.now();
        window.requestAnimFrame(rotateAnim); }, delay * 1000);
};

Ship.prototype.move = function(x, y, duration, delay) {
    let ship = this;
                           
    this.in_progress = true;
                       
    let start;
    let time = null;
    let fraction = 0;
    let request = null;
    
    let init_x = ship.x;
    let init_y = ship.y;
    let dist_x = x - ship.x;
    let dist_y = y - ship.y;
       
    function moveAnim() {
        time = Date.now();
        
        fraction = (time - start) / (duration * 1000);
                            
        if((time - start) > duration * 1000) { 
            ship.x = x;
            ship.y = y;
            cancelAnimationFrame(request);
            
            dispatchEvent(new CustomEvent("ship-arrived", { detail : { ship : ship, x : x, y : y } }));
        }
        else {
            ship.visible = true;
            let dx = dist_x * fraction;
            let dy = dist_y * fraction;                 
            ship.x = init_x + dx;
            ship.y = init_y + dy;
            ship.calc();
            
            window.requestAnimFrame(moveAnim);
        }            
    };
        
    request = setTimeout(function() {
        start = Date.now();
        window.requestAnimFrame(moveAnim); }, delay * 1000);
};

Ship.prototype.minimalAngle = function(old_angle, new_angle) {
    let o = this.constrainAngle(old_angle);
    let n = this.constrainAngle(new_angle);
       
    let min;   
       
    if(Math.abs(n - o) > 180) {
        if(n > o) { min = n - 360 - o; }
        else { min = 360 - o + n; }
    }
    else {
        min = n - o;
    }
          
    return min;    
};

Ship.prototype.constrainAngle = function(a = null) {
    if(a === null) {
        while(this.angle < 0) { this.angle += 360; }
        this.angle %= 360;
    }
    else {
        while(a < 0) { a += 360; }
        a %= 360;
        return a;
    }
};

Ship.prototype.calcCourse = function(x, y, speed) {
    let ship = this;
        
    let distance = Math.sqrt(Math.pow(x - ship.x, 2) + Math.pow(y - ship.y, 2));
    let time = distance / speed;
    
    let new_angle = Math.atan2(y - ship.y, x - ship.x) * 180 / Math.PI;
    let angle = this.minimalAngle(ship.angle, new_angle);
    
    let course = { 'distance' : distance, 'time' : time, 'angle' : angle };
    return course;
};

Ship.prototype.goTo = function(x, y, speed, delay) {
    let ship = this;    
    
    let course = ship.calcCourse(x, y, speed);
        
    function move_func(e) {
        if(e.detail.ship === ship) {
            removeEventListener('ship-rotated', move_func);
            ship.move(x, y, course.time, delay);
        }
    }
        
    addEventListener('ship-rotated', move_func);
            
    ship.rotate(course.angle, 1, 0);
};

Ship.prototype.updateRoute = function(x, y) {
    let ship = this;
    
    if(ship.route !== null && ship.route.length !== 0) {
        let dist = this.route[0];
        
        if(dist.x === x && dist.y === y) {
            ship.route.shift();
            ship.goToRoute();
        }
    }    
};

Ship.prototype.goToRoute = function() {
    let ship = this;
    
    if(ship.route !== null && ship.route.length !== 0) {
        let dist = this.route[0];
        
        this.goTo(dist.x, dist.y, dist.speed, dist.delay);       
    }
    else {        
        dispatchEvent(new CustomEvent('ship-route-completed', { detail : { ship : ship } }));
    }
};