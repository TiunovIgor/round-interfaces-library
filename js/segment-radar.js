function SegmentRadar(id, context, center_x, center_y, thickness) {    
    this.id = id; // Object identificator
    this.context = context; // CanvasRenderingContext2D for drawing a segment array
    this.cx = center_x; // X coordinate of the base segment center
    this.cy = center_y; // Y coordinate of the base segment center
    this.r_in = 0; // base segment inner radius
    this.thickness = thickness; // initial angle of the base segment
    this.r_out = thickness; // base segment outer radius
    this.init_angle = -90; // initial angle of the base segment
    this.angle = 360; // angle of the base segment
    
    this.grid = null;
    
    this.gradient = null;
    this.background = "black";
    this.border_width = 1;
    this.border_color = "rgba(32, 81, 0, 1)";
    
    this.locator = null;
    this.locator_angle = 40;
    this.locator_period = 5;
    this.locator_gradient = null;
    this.locator_border_width = 1;
    this.locator_border_color = 'none';
    
    this.frame = null; 
    this.frame_gradient = null;
    this.frame_background = "rgba(0, 0, 0, 0)";
    this.frame_border_width = 0;
    this.frame_border_color = 'rgba(50, 50, 50, 1)';
    
    this.factor = 0.2;
    
    this.targets = [];
    
    this.dots = [];
    this.dot_radius = 5;
    this.dot_gradient = null;
    this.dot_background = 'rgba(100, 100, 100, 1)';
    this.dot_border_width = 1;
    this.dot_border_color = 'black';
    
    this.visible = true;
    this.targets_visible = true;
    this.locator_enabled = false;
    this.in_progress = false; //
     
    this.appeared_segments = [];
    this.disappeared_segments = [];
    this.faded_in_segments = [];
    this.faded_out_segments = [];
    
    this.build();
    this.calc();
};

SegmentRadar.prototype.build = function() {
    this.targets = [];
    
    this.grid = new SegmentGrid(this.id + '_grid', this.context, this.cx, this.cy, this.r_in, this.thickness, this.init_angle, this.angle);    
    if(this.gradient) { this.grid.gradient = this.gradient.instanceCopy(); }
    this.grid.background = this.background;
    this.grid.border_width = this.border_width;
    this.grid.border_color = this.border_color;
    this.grid.build();
    this.grid.calc();
    
    this.frame = new Segment(this.id + '-frame', this.context, this.cx, this.cy, this.thickness, this.thickness * 0.1, this.init_angle, this.angle);
    if(this.frame_gradient) { this.frame.gradient = this.frame_gradient.instanceCopy(); }
    this.frame.background = this.frame_background;
    this.frame.border_width = this.frame_border_width;
    this.frame.border_color = this.frame_border_color;
    this.frame.calc();
   
    let locator_thickness = this.thickness - this.border_width;
    
    this.locator = new Segment(this.id + '_locator', this.context, this.cx, this.cy, this.r_in, locator_thickness, this.init_angle, this.locator_angle);
    if(this.locator_gradient) { this.locator.gradient = this.locator_gradient.instanceCopy(); }
    this.locator.background = this.locator_background;
    this.locator.border_width = this.locator_border_width;
    this.locator.border_color = this.locator_border_color;
    this.locator.calc();
    
    let radar = this;
        
    addEventListener("segment-changed", function(e) { 
        if(e.detail.segment === radar.grid || e.detail.segment === radar.frame || e.detail.segment === radar.locator) {
            dispatchEvent(new CustomEvent("segment-radar-changed", { detail : { radar : radar } } ));
        }
    });
    
    addEventListener("segment-dot-changed", function(e) {
        if(radar.dots.indexOf(e.detail.dot) >= 0) {
            dispatchEvent(new CustomEvent("segment-radar-changed", { detail : { radar : radar } } ));
        }
    });
    
    addEventListener('segment-radar-targets-changed', function(e) { 
        if(e.detail.radar === radar) {
            dispatchEvent(new CustomEvent('segment-radar-changed', { detail : { radar : radar } } ));
        }
    });
    
    addEventListener("segment-rotated", function(e) {
        if(e.detail.segment === radar.locator) {
            radar.rotateLocator();
        }
    });
};

SegmentRadar.prototype.calc = function() {
    if(this.in_progress) {
        this.anim_r_out = this.anim_r_in + this.anim_thickness;
        
        this.anim_start_a = this.anim_init_angle * Math.PI / 180;
        this.anim_end_a = (this.anim_init_angle + this.anim_angle) * Math.PI / 180;
   
        this.anim_dx1 = this.anim_r_in * Math.cos(this.anim_start_a) + this.cx; // First point. X coordinate
        this.anim_dy1 = this.anim_r_in * Math.sin(this.anim_start_a) + this.cy; // First point. Y coordinate
        this.anim_dx2 = this.anim_r_out * Math.cos(this.anim_start_a) + this.cx; // Second point. X coordinate
        this.anim_dy2 = this.anim_r_out * Math.sin(this.anim_start_a) + this.cy; // Second point. Y coordinate
        this.anim_dx3 = this.anim_r_out * Math.cos(this.anim_end_a) + this.cx; // Third point. X coordinate
        this.anim_dy3 = this.anim_r_out * Math.sin(this.anim_end_a) + this.cy; // Third point. Y coordinate
        this.anim_dx4 = this.anim_r_in * Math.cos(this.anim_end_a) + this.cx; // Fourth point. X coordinate
        this.anim_dy4 = this.anim_r_in * Math.sin(this.anim_end_a) + this.cy; // Fourth point. Y coordinate
    }
    else {
        this.r_out = this.r_in + this.thickness;
        
        this.start_a = this.init_angle * Math.PI / 180;
        this.end_a = (this.init_angle + this.angle) * Math.PI / 180;
        
        this.dx1 = this.r_in * Math.cos(this.start_a) + this.cx;
        this.dy1 = this.r_in * Math.sin(this.start_a) + this.cy;
        this.dx2 = this.r_out * Math.cos(this.start_a) + this.cx;
        this.dy2 = this.r_out * Math.sin(this.start_a) + this.cy;
        this.dx3 = this.r_out * Math.cos(this.end_a) + this.cx;
        this.dy3 = this.r_out * Math.sin(this.end_a) + this.cy;
        this.dx4 = this.r_in * Math.cos(this.end_a) + this.cx;
        this.dy4 = this.r_in * Math.sin(this.end_a) + this.cy;
    }
            
    dispatchEvent(new CustomEvent("segment-radar-changed", { detail : { array : this } } ));
};

SegmentRadar.prototype.startLocator = function() {
    if(!this.locator_enabled) {
        this.locator_enabled = true;
        this.rotateLocator();
    }   
};

SegmentRadar.prototype.rotateLocator = function() {
    if(this.locator_enabled) {
        this.locator.rotate('clockwise', this.angle, this.locator_period, 0);
    }
};

SegmentRadar.prototype.stopLocator = function() {
    this.locator_enabled = false;
};

SegmentRadar.prototype.targetsToDots = function(targets) {
    let radar = this;
    this.dots = [];
    
    if(targets.length > 0) {
        targets.forEach(function(target) {
            let x = target.x * radar.factor + radar.cx;
            let y = target.y * radar.factor + radar.cy;
            
            let dot = new SegmentDot(target.id, radar.context, x, y, radar.dot_radius);
            if(radar.dot_gradient) { dot.gradient = radar.dot_gradient.instanceCopy(); }
            dot.background = radar.dot_background;
            dot.border_width = radar.dot_border_width;
            dot.border_color = radar.dot_border_color;
            dot.visible = true;
            dot.calc();
            radar.dots.push(dot);
        });
    }   
        
    dispatchEvent(new CustomEvent('segment-radar-targets-changed', { detail : { radar : radar } }));
};

SegmentRadar.prototype.draw = function() {
    this.grid.draw();
    this.frame.draw();
    
    this.dots.forEach(function(dot) {
        dot.draw();
    });
    
    this.locator.draw();
};

SegmentRadar.prototype.instanceCopy = function() {
    const copy = new this.constructor();
    const keys = Object.keys(this);
    keys.forEach(key => { copy[key] = this[key]; });
    return copy;
};