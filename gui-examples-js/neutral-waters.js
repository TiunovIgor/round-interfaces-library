function NeutralWaters(canvasElementId) {
    this.id = "NeutralWaters";
    this.canvas = document.getElementById(canvasElementId);
    this.context = this.canvas.getContext('2d');
    let context = this.context;
    context.width = this.canvas.width;
    context.height = this.canvas.height;
   
    function Point(px, py) { this.x = px; this.y = py; }
    this.c = new Point(context.width/2, context.height/2);
    
    this.gradient = null;
    this.background = 'rgba(33, 95, 168, 1)';
    this.grid_color = 'rgba(255, 255, 255, 0.5)';
    
    this.ships = [];
    
    this.in_progress = false;
    
    this.ship_1 = new Ship('ship-1', context, 40, 320, 25, 75, 0);
    this.ship_1.src = '../svg/ship-three.svg';
    this.ship_1.build();
    
    this.ship_2 = new Ship('ship-2', context, 320, 40, 15, 60, 160);
    this.ship_2.src = '../svg/ship-one.svg';
    this.ship_2.build();
    
    this.ship_3 = new Ship('ship-3', context, 120, 40, 25, 75, 130);
    this.ship_3.src = '../svg/ship-two.svg';
    this.ship_3.build();
    
    this.ships.push(this.ship_1);
    this.ships.push(this.ship_2);
    this.ships.push(this.ship_3);
    
    this.route_1 = [
        { 'x' : 100, 'y' : 140, 'speed' : 60, 'delay' : 0 },
        { 'x' : 350, 'y' : 160, 'speed' : 80, 'delay' : 0.5 },
        { 'x' : 360, 'y' : 340, 'speed' : 80, 'delay' : 1 },
        { 'x' : 40, 'y' : 320, 'speed' : 50, 'delay' : 0 }
    ];
    
    this.route_2 = [
        { 'x' : 180, 'y' : 80, 'speed' : 70, 'delay' : 0 },
        { 'x' : 290, 'y' : 270, 'speed' : 90, 'delay' : 0 },
        { 'x' : 180, 'y' : 320, 'speed' : 100, 'delay' : 0 },
        { 'x' : 320, 'y' : 40, 'speed' : 60, 'delay' : 0 }
    ];
                    
    let ships = this.ships;
    let draw_func = this.draw.bind(this);
    
    let waters = this;
      
    addEventListener('ship-changed', function(e) {
        if(ships.indexOf(e.detail.ship) >= 0) {
            dispatchEvent(new CustomEvent('disposition-changed', { detail : { waters : waters } }));
        }
    });  
    addEventListener('ship-position-changed', function(e) {
        if(ships.indexOf(e.detail.ship)) {
            dispatchEvent(new CustomEvent('disposition-changed', { detail : { waters : waters } }));
        }
    });
    addEventListener('ship-angle-changed', function(e) {
        if(ships.indexOf(e.detail.ship)) {
            dispatchEvent(new CustomEvent('disposition-changed', { detail : { waters : waters } }));
        }
    });   
    
    addEventListener('disposition-changed', function(e) {
        waters.prepareTargetsForClassicRadar();
        waters.prepareTargetsForModernRadar();
    });
          
    //this.build();
};

NeutralWaters.prototype.draw = function() {
    let context = this.context;
    
    context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // draw background
    context.beginPath();
    context.rect(0, 0, context.width, context.height);
    context.fillStyle = this.background;
    context.fill();
    context.closePath();
    
    // draw grid
    context.beginPath();
    for(let i=0; i < 10; i++) {
        context.moveTo(0, i * 40);
        context.lineTo(context.width, i * 40);
        context.moveTo(i * 40, 0);
        context.lineTo(i * 40, context.height);
    }
    context.lineWidth = 1;
    context.strokeStyle = this.grid_color;
    context.stroke();
    context.closePath();
    
    this.ships.forEach(function(ship) {
        ship.draw();
    });
};

NeutralWaters.prototype.animate = function() {
    this.ship_1.route = this.route_1.slice();
    this.ship_2.route = this.route_2.slice();
        
    this.ship_1.goToRoute();
    this.ship_2.goToRoute();
};

NeutralWaters.prototype.prepareTargetsForClassicRadar = function() {
    let abs_targets = [];    
    let targets = [];
    
    let waters = this;
    let ship_1 = this.ship_1;
    
    // Classic Radar is tuned to Ship-1
    
    this.ships.forEach(function(ship) {
        if(ship.id !== 'ship-1') {
            abs_targets.push( { 'id' : ship.id, 'x' : ship.x, 'y' : ship.y, 'angle' : ship.angle } );
        }
    });
    
    abs_targets.forEach(function(t) {
        let x = t.x - ship_1.x;
        let y = t.y - ship_1.y;
        let a = Math.atan2(y, x) * 180 / Math.PI;
        ship_1.constrainAngle(a);
        let angle = ship_1.angle - a;
        angle = ship_1.constrainAngle(angle);
        let rad = angle * Math.PI / 180;

        let new_x = x * Math.cos(rad) + y * Math.sin(rad);
        let new_y = - x * Math.sin(rad) + y * Math.cos(rad);
                
        targets.push( { 'id' : t.id, 'x' : new_x, 'y' : new_y, 'angle' : angle } );
    });
        
    dispatchEvent(new CustomEvent('targets-for-classic-radar-ready', { detail : { targets : targets } }));
};

NeutralWaters.prototype.prepareTargetsForModernRadar = function() {
    let abs_targets = [];    
    let targets = [];
    let waters = this;
    let ship_2 = this.ship_2;
    
    // Modern Radar is tuned to Ship-2
    
    this.ships.forEach(function(ship) {
        if(ship.id !== 'ship-2') {
            abs_targets.push( { 'id' : ship.id, 'x' : ship.x, 'y' : ship.y, 'angle' : ship.angle } );
        }
    });
    
    abs_targets.forEach(function(t) {
        let x = t.x - ship_2.x;
        let y = t.y - ship_2.y;
        let a = Math.atan2(y, x) * 180 / Math.PI;
        ship_2.constrainAngle(a);
        let angle = ship_2.angle - a;
        angle = ship_2.constrainAngle(angle);
        let rad = angle * Math.PI / 180;

        let new_x = x * Math.cos(rad) + y * Math.sin(rad);
        let new_y = - x * Math.sin(rad) + y * Math.cos(rad);
        
        targets.push( { 'id' : t.id, 'x' : new_x, 'y' : new_y, 'angle' : angle } );
    });
        
    dispatchEvent(new CustomEvent('targets-for-modern-radar-ready', { detail : { targets : targets } }));
};