function Segment(id, context, center_x, center_y, inner_radius, thickness, initial_angle, angle) {    
    this.id = id; // segment identificator as a text string
    this.context = context; // CanvasRenderingContext2D for drawing a segment
    this.cx = center_x; // X coordinate of the segment center
    this.cy = center_y; // Y coordinate of the segment center
    this.r_in = inner_radius; // segment inner radius
    this.thickness = thickness; // segment thickness
    this.r_out = inner_radius + thickness; // segment outer radius
    this.init_angle = initial_angle; // segment initial angle
    this.angle = angle; // segment angle
       
    this.gradient = null;
    this.background = "rgba(200, 200, 200, 1)";
    this.border_width = 1;
    this.border_color = "rgba(100, 100, 100, 0.5)";
    
    this.border_opening_width = '';
    this.border_opening_color = '';
    this.border_outer_width = '';
    this.border_outer_color = '';
    this.border_inner_width = '';
    this.border_inner_color = '';
    this.border_closing_width = '';
    this.border_closing_color = '';

    this.visible = true;
    this.in_progress = false;
    
    this.anim_r_in = 0;
    this.anim_thickness = 0;
    this.anim_r_out = 0;
    this.anim_init_angle = 0;
    this.anim_angle = 0;
    
    this.anim_gradient = null;
    this.anim_background;
    this.anim_border_width;
    this.anim_border_color;
    
    this.anim_border_opening_color;
    this.anim_border_closing_color;
    this.anim_border_outer_color;
    this.anim_border_inner_color;
                
    this.calc();
};

Segment.prototype.calc = function() {    
    if(this.in_progress) {                    
        this.anim_start_a = this.anim_init_angle * Math.PI / 180;
        this.anim_end_a = (this.anim_init_angle + this.anim_angle) * Math.PI / 180;
   
        this.anim_dx1 = this.anim_r_in * Math.cos(this.anim_start_a) + this.cx;
        this.anim_dy1 = this.anim_r_in * Math.sin(this.anim_start_a) + this.cy;
        this.anim_dx2 = this.anim_r_out * Math.cos(this.anim_start_a) + this.cx;
        this.anim_dy2 = this.anim_r_out * Math.sin(this.anim_start_a) + this.cy;
        this.anim_dx3 = this.anim_r_out * Math.cos(this.anim_end_a) + this.cx;
        this.anim_dy3 = this.anim_r_out * Math.sin(this.anim_end_a) + this.cy;
        this.anim_dx4 = this.anim_r_in * Math.cos(this.anim_end_a) + this.cx;
        this.anim_dy4 = this.anim_r_in * Math.sin(this.anim_end_a) + this.cy;
    }
    else {
        this.r_out = this.r_in + this.thickness;
        
        this.start_a = this.init_angle * Math.PI / 180;
        this.end_a = (this.init_angle + this.angle) * Math.PI / 180;
        
        this.dx1 = this.r_in * Math.cos(this.start_a) + this.cx; // First point. X coordinate
        this.dy1 = this.r_in * Math.sin(this.start_a) + this.cy; // First point. Y coordinate
        this.dx2 = this.r_out * Math.cos(this.start_a) + this.cx; // Second point. X coordinate
        this.dy2 = this.r_out * Math.sin(this.start_a) + this.cy; // Second point. Y coordinate
        this.dx3 = this.r_out * Math.cos(this.end_a) + this.cx; // Third point. X coordinate
        this.dy3 = this.r_out * Math.sin(this.end_a) + this.cy; // Third point. Y coordinate
        this.dx4 = this.r_in * Math.cos(this.end_a) + this.cx; // Fourth point. X coordinate
        this.dy4 = this.r_in * Math.sin(this.end_a) + this.cy; // Fourth point. Y coordinate
    }
    
    this.calcBorder();
        
    dispatchEvent(new CustomEvent("segment-changed", { detail : { segment : this } } ));
};
   
Segment.prototype.calcBorder = function() {
    let border_width;
    let border_color;
    
    let border_opening_color;
    let border_closing_color;
    let border_outer_color;
    let border_inner_color;
    
    if(this.in_progress) {        
        border_width = this.anim_border_width;
        border_color = this.anim_border_color;
        
        border_opening_color = this.anim_border_opening_color;
        border_closing_color = this.anim_border_closing_color;
        border_outer_color = this.anim_border_outer_color;
        border_inner_color = this.anim_border_inner_color;
    }
    else {
        border_width = this.border_width;
        border_color = this.border_color;
        
        border_opening_color = this.border_opening_color;
        border_closing_color = this.border_closing_color;
        border_outer_color = this.border_outer_color;
        border_inner_color = this.border_inner_color;
    }    
    
    // Opening Border Style
    if(this.border_opening_width !== '' && this.border_opening_width !== undefined && !isNaN(this.border_opening_width)) {
        this.opening_line_width = this.border_opening_width; }
    else { this.opening_line_width = this.border_width; }         
    if(border_opening_color !== '' && border_opening_color !== undefined) {
        if(border_opening_color === 'none') { this.opening_stroke_style = 'rgba(0, 0, 0, 0)'; }
        else { this.opening_stroke_style = border_opening_color; }
    }
    else { 
        if(this.border_color === 'none') { this.opening_stroke_style = 'rgba(0, 0, 0, 0)'; }
        else { 
            if(this.angle % 360 === 0) { this.opening_stroke_style = 'rgba(0, 0, 0, 0)'; }
            else { this.opening_stroke_style = this.border_color; }
        }
    }        
    
    // Outer Border Style
    if(this.border_outer_width !== '' && this.border_outer_width !== undefined && !isNaN(this.border_outer_width)) {
        this.outer_line_width = this.border_outer_width; }
    else { this.outer_line_width = this.border_width; }           
    if(border_outer_color !== '' && border_outer_color !== undefined) {
        if(border_outer_color === 'none') { this.outer_stroke_style = 'rgba(0, 0, 0, 0)'; }
        else { this.outer_stroke_style = border_outer_color; }
    }
    else {
        if(this.border_color === 'none') { this.outer_stroke_style = 'rgba(0, 0, 0, 0)'; }
        else { this.outer_stroke_style = this.border_color; }
    }
    
    // Inner Border Style
    if(this.border_inner_width !== '' && this.border_inner_width !== undefined && !isNaN(this.border_inner_width)) {
        this.inner_line_width = this.border_inner_width; }
    else { this.inner_line_width = this.border_width; }           
    if(border_inner_color !== '' && border_inner_color !== undefined) {
        if(border_inner_color === 'none') { this.inner_stroke_style = 'rgba(0, 0, 0, 0)'; }
        else { this.inner_stroke_style = border_inner_color; }
    }
    else {
        if(this.border_color === 'none') { this.inner_stroke_style = 'rgba(0, 0, 0, 0)'; }
        else { this.inner_stroke_style = this.border_color; }
    }
        
    // Closing Border Style
    if(this.border_closing_width !== '' && this.border_closing_width !== undefined && !isNaN(this.border_closing_width)) {
        this.closing_line_width = this.border_closing_width; }
    else { this.closing_line_width = this.border_width; }       
    if(border_closing_color !== '' && border_closing_color !== undefined) {
        if(border_closing_color === 'none') { this.closing_stroke_style = 'rgba(0, 0, 0, 0)'; }
        else { this.closing_stroke_style = border_closing_color; }
    }
    else { 
        if(this.border_color === 'none') { this.closing_stroke_style = 'rgba(0, 0, 0, 0)'; }
        else { 
            if(this.angle % 360 === 0) { this.closing_stroke_style = 'rgba(0, 0, 0, 0)'; }
            else { this.closing_stroke_style = this.border_color; }
        }
    }
};
   
Segment.prototype.draw = function() {  
    if(this.visible) {        
        let cx = this.cx, cy = this.cy;
        
        let dx1, dy1, dx2, dy2, dx3, dy3, dx4, dy4;
        let r_in, r_out;
        let start_a, end_a;
        let gradient = null;
        let background = this.background;
        
        if(this.in_progress) {
            dx1 = this.anim_dx1; dy1 = this.anim_dy1;
            dx2 = this.anim_dx2; dy2 = this.anim_dy2;
            dx3 = this.anim_dx3; dy3 = this.anim_dy3;
            dx4 = this.anim_dx4; dy4 = this.anim_dy4;
            r_in = this.anim_r_in; r_out = this.anim_r_out;
            start_a = this.anim_start_a; end_a = this.anim_end_a;
            if((this.anim_gradient !== null) && (this.anim_gradient instanceof SegmentGradient)) { gradient = this.anim_gradient.instanceCopy(); }
            background = this.anim_background;
        }
        else {
            dx1 = this.dx1; dy1 = this.dy1;
            dx2 = this.dx2; dy2 = this.dy2;
            dx3 = this.dx3; dy3 = this.dy3;
            dx4 = this.dx4; dy4 = this.dy4;
            r_in = this.r_in; r_out = this.r_out;
            start_a = this.start_a; end_a = this.end_a;
            if(this.gradient !== null && (this.gradient instanceof SegmentGradient)) { gradient = this.gradient.instanceCopy(); }
            background = this.background;
        }
                                     
        // Draw Fill
        if(gradient !== null && gradient instanceof SegmentGradient && gradient.type === 'conic') {
            let arc_length = Math.floor(gradient.resolution * 2 * Math.PI * r_out);                
            let img_data = gradient.getImageDataByArcLength(arc_length).data;
            let da = Math.abs(end_a - start_a) / arc_length;
                                   
            for(let i = 0; i < arc_length; i++)
            {                  
                let angle;
                
                if(gradient.direction === 'clockwise') { angle = start_a + i * da; }
                else if(gradient.direction === 'anticlockwise') { angle = end_a - i * da; }                
                
                let gx1 = r_in * Math.cos(angle) + cx;
                let gy1 = r_in * Math.sin(angle) + cy;
                let gx2 = r_out * Math.cos(angle) + cx;
                let gy2 = r_out * Math.sin(angle) + cy;                
                               
                let index = i * 4;
                let color = 'rgba(' + img_data[index] + ',' + img_data[index + 1] + ',' + img_data[index + 2] + ',' + (img_data[index + 3] / 255) + ')';
               
                this.context.beginPath();
                this.context.moveTo(gx1, gy1);
                this.context.lineTo(gx2, gy2);                
                this.context.lineWidth = 1 / gradient.resolution;
                this.context.strokeStyle = color;
                this.context.stroke();
                
                this.context.closePath();                
            }           
        }
        else {        
            this.context.moveTo(dx1, dy1);           

            this.context.beginPath();        
            this.context.lineTo(dx2, dy2);                        
            this.context.arc(cx, cy, r_out, start_a, end_a);           
            this.context.arc(cx, cy, r_in, end_a, start_a, true);
            this.context.lineTo(dx1, dy1);              

            if(gradient !== null && gradient instanceof SegmentGradient) {            
                let canvas_gradient;

                if(gradient.type === 'radial') {
                    if(gradient.direction === 'from-center') { canvas_gradient = this.context.createRadialGradient(cx, cy, r_in, cx, cy, r_out); }
                    else if(gradient.direction === 'to-center') { canvas_gradient = this.context.createRadialGradient(cx, cy, r_out, cx, cy, r_in); }
                }
                else if(gradient.type === 'linear') {
                    let x1 = (dx1 + dx4) / 2;
                    let y1 = (dy1 + dy4) / 2;
                    let x2 = r_out * Math.cos((end_a + start_a) / 2) + this.cx;
                    let y2 = r_out * Math.sin((end_a + start_a) / 2) + this.cy;  

                    if(gradient.direction === 'from-center') { canvas_gradient = this.context.createLinearGradient(x1, y1, x2, y2); }
                    else if(gradient.direction === 'to-center') { canvas_gradient = this.context.createLinearGradient(x2, y2, x1, y1); }
                    else if(gradient.direction === 'from-opening') { canvas_gradient = this.context.createLinearGradient(dx2, dy2, dx3, dy3); }
                    else if(gradient.direction === 'from-closing') { canvas_gradient = this.context.createLinearGradient(dx3, dy3, dx2, dy2); }
                }

                gradient.stops.forEach(function(stop) {
                    canvas_gradient.addColorStop(stop.offset, stop.color);
                });

                this.context.fillStyle = canvas_gradient;
            }
            else {
                this.context.fillStyle = background;
            }            
            this.context.fill();        
            this.context.closePath();    
        }
        
        // Draw Borders        
        
        // Draw Opening Border
        this.context.beginPath(); 
        this.context.moveTo(dx1, dy1);            
        this.context.lineTo(dx2, dy2); 
        this.context.lineWidth = this.opening_line_width;
        this.context.strokeStyle = this.opening_stroke_style;
        this.context.stroke();     
        this.context.closePath();
            
        // Draw Outer Border
        this.context.beginPath();
        this.context.arc(cx, cy, r_out, start_a, end_a);
        this.context.lineWidth = this.outer_line_width;
        this.context.strokeStyle = this.outer_stroke_style;
        this.context.stroke();
        this.context.closePath();
        
        // Draw Inner Border
        this.context.beginPath();
        this.context.arc(cx, cy, r_in, end_a, start_a, true);
        this.context.lineWidth = this.inner_line_width;
        this.context.strokeStyle = this.inner_stroke_style;
        this.context.stroke();
        this.context.closePath();
        
        // Draw Closing Border
        this.context.beginPath();
        this.context.moveTo(dx3, dy3);            
        this.context.lineTo(dx4, dy4); 
        this.context.lineWidth = this.closing_line_width;
        this.context.strokeStyle = this.closing_stroke_style;
        this.context.stroke();
        this.context.closePath();
    }           
};
    
Segment.prototype.prepareAnim = function() {
    this.anim_r_in = this.r_in;
    this.anim_thickness = this.thickness;
    this.anim_r_out = this.r_out;
    this.anim_init_angle = this.init_angle;
    this.anim_angle = this.angle;
    
    if(this.gradient) { this.anim_gradient = this.gradient.instanceCopy(); }
    this.anim_background = this.background;
    this.anim_border_width = this.border_width;
    this.anim_border_color = this.border_color;
    
    this.anim_border_opening_color = this.border_opening_color;
    this.anim_border_closing_color = this.border_closing_color;
    this.anim_border_outer_color = this.border_outer_color;
    this.anim_border_inner_color = this.border_inner_color;
};    
    
Segment.prototype.appear = function(direction, duration, delay) {
    this.prepareAnim();
                        
    this.in_progress = true;
    this.calc();
        
    let segment = this;
                
    let start = null;       
    let time = null;
    let fraction = 0;
    let request = null;
       
    function appearAnim() {
        time = Date.now();
        fraction = (time - start) / (duration * 1000);

        let anim_func;
        if(direction === 'from-center') { anim_func = segment.appearFromCenter.bind(segment); }
        else if(direction === 'to-center') { anim_func = segment.appearToCenter.bind(segment); }
        else if(direction === 'from-axis') { anim_func = segment.appearFromAxis.bind(segment); }
        else if(direction === 'clockwise') { anim_func = segment.appearClockwise.bind(segment); }
        else if(direction === 'anticlockwise') { anim_func = segment.appearAnticlockwise.bind(segment); }       
        anim_func(fraction);      
            
        if(fraction > 1) {
            segment.stopAppearance();
            cancelAnimationFrame(request);
            dispatchEvent(new CustomEvent("segment-appeared", { detail : { segment : segment } }));
        }
        else {
            segment.visible = true;
            window.requestAnimFrame(appearAnim);
        }            
    };
        
    request = setTimeout(function() {
        start = Date.now();
        window.requestAnimFrame(appearAnim);
    }, delay * 1000);
};        
        
Segment.prototype.appearFromCenter = function(t) {
    let r = this.r_in + (this.r_out - this.r_in) * t;
    if(r < this.r_out) { this.anim_r_out = r; }
    else { this.anim_r_out = this.r_out; };
    this.calc();
};
    
Segment.prototype.appearToCenter = function(t) {
    let r = this.r_out - (this.r_out - this.r_in) * t;
    if(r > this.r_in) { this.anim_r_in = r; }
    else { this.anim_r_in = this.r_in; }
    this.calc();
};
    
Segment.prototype.appearFromAxis = function(t) {
    let a = (this.angle / 2) * t;
    if(a < this.angle / 2) {
        this.anim_init_angle = this.init_angle + this.angle/2 - a;
        this.anim_angle = a * 2;
    }
    else {
        this.anim_init_angle = this.init_angle;
        this.anim_angle = this.angle;
    }
    this.calc();
};
    
Segment.prototype.appearClockwise = function(t) {
    let a = this.angle * t;
    if(a < this.angle) { this.anim_angle = a; }
    else { this.anim_angle = this.angle; }
    this.calc();
};
    
Segment.prototype.appearAnticlockwise = function(t) {
    let a = this.angle * t;
    if(a < this.angle) {
        this.anim_init_angle = this.init_angle + this.angle - a;
        this.anim_angle = a;
    }
    else {
        this.anim_init_angle = this.init_angle;
        this.anim_angle = this.angle;
    }
    this.calc();
};

Segment.prototype.stopAppearance = function() {
    this.anim_r_in = 0;
    this.anim_r_out = 0;
    this.anim_init_angle = 0;
    this.anim_angle = 0;
    
    this.in_progress = false;
    this.visible = true;
    
    this.calc();
};

Segment.prototype.disappear = function(direction, duration, delay) {   
    this.prepareAnim();
                        
    this.in_progress = true;
    this.calc();
        
    let segment = this;
                
    let start;        
    let time = null;
    let fraction = 0;
    let request = null;
       
    function disappearAnim() {
        time = Date.now();
        fraction = (time - start) / (duration * 1000);

        let anim_func;
        if(direction === 'from-center') { anim_func = segment.disappearFromCenter.bind(segment); }
        else if(direction === 'to-center') { anim_func = segment.disappearToCenter.bind(segment); }
        else if(direction === 'to-axis') { anim_func = segment.disappearToAxis.bind(segment); }
        else if(direction === 'clockwise') { anim_func = segment.disappearClockwise.bind(segment); }
        else if(direction === 'anticlockwise') { anim_func = segment.disappearAnticlockwise.bind(segment); }       
        anim_func(fraction);      
            
        if(fraction > 1) {
            segment.stopDisappearance();
            cancelAnimationFrame(request);
            dispatchEvent(new CustomEvent("segment-disappeared", { detail : { segment : segment } }));
        }
        else {
            segment.visible = true;
            window.requestAnimFrame(disappearAnim);
        }            
    };
        
    request = setTimeout(function() {
        start = Date.now();
        window.requestAnimFrame(disappearAnim);
    }, delay * 1000);
};        
    
Segment.prototype.disappearFromCenter = function(t) {
    let r = this.r_in + (this.r_out - this.r_in) * t;
    if(r < this.r_out) { this.anim_r_in = r; }
    else { this.anim_r_in = this.r_out; };
    this.calc();
};
    
Segment.prototype.disappearToCenter = function(t) {
    let r = this.r_out - (this.r_out - this.r_in) * t;
    if(r > this.r_in) { this.anim_r_out = r; }
    else { this.anim_r_out = this.r_in; }
    this.calc();
};
    
Segment.prototype.disappearToAxis = function(t) {
    let a = (this.angle / 2) * t;
    if(a < this.angle / 2) {
        this.anim_init_angle = this.init_angle + a;
        this.anim_angle = this.angle - a * 2;
    }
    else {
        this.anim_init_angle = this.init_angle;
        this.anim_angle = this.angle;
    }
    this.calc();
};
    
Segment.prototype.disappearClockwise = function(t) {
    let a = this.angle * t;
    if(a < this.angle) { 
        this.anim_init_angle = this.init_angle + a;
        this.anim_angle = this.angle - a;
    }
    else {
        this.anim_init_angle = this.init_angle;
        this.anim_angle = 0;
    }
    this.calc();
};
    
Segment.prototype.disappearAnticlockwise = function(t) {
    let a = this.angle * t;
    if(a < this.angle) {
        this.anim_init_angle = this.init_angle;
        this.anim_angle = this.angle - a;
    }
    else {
        this.anim_init_angle = this.init_angle;
        this.anim_angle = 0;
    }
    this.calc();
};

Segment.prototype.stopDisappearance = function() {
    this.anim_r_in = 0;
    this.anim_r_out = 0;
    this.anim_init_angle = 0;
    this.anim_angle = 0;
    
    this.in_progress = false;
    this.visible = false;
    
    this.calc();
};

Segment.prototype.rotate = function(direction, angle, duration, delay) {       
    this.prepareAnim();
                        
    this.in_progress = true;
    this.calc();
        
    let segment = this;
                
    let start;
    let time = null;
    let fraction = 0;
    let request = null;
       
    function rotateAnim() {
        time = Date.now();
        
        fraction = (time - start) * angle / (duration * 1000);
           
        let anim_func;
        if(direction === 'clockwise') { anim_func = segment.rotateClockwise.bind(segment); }
        else if(direction === 'anticlockwise') { anim_func = segment.rotateAnticlockwise.bind(segment); }
        anim_func(fraction);      
            
        if((time - start) > duration * 1000) { 
            segment.stopRotation();
            cancelAnimationFrame(request);
            dispatchEvent(new CustomEvent("segment-rotated", { detail : { segment : segment } }));
        }
        else {
            segment.visible = true;
            window.requestAnimFrame(rotateAnim);
        }            
    };
        
    request = setTimeout(function() {
        start = Date.now();
        window.requestAnimFrame(rotateAnim); }, delay * 1000);
};

Segment.prototype.rotateClockwise = function(a) {
    this.anim_init_angle = this.init_angle + a;
    this.calc();
};

Segment.prototype.rotateAnticlockwise = function(a) {
    this.anim_init_angle = this.init_angle - a;
    this.calc();
};

Segment.prototype.stopRotation = function() {
    this.r_in = this.anim_r_in;
    this.r_out = this.anim_r_out;
    this.init_angle = this.anim_init_angle;
    this.angle = this.anim_angle;
    
    this.anim_r_in = 0;
    this.anim_r_out = 0;
    this.anim_init_angle = 0;
    this.anim_angle = 0;
        
    this.in_progress = false;
        
    this.calc();
};

Segment.prototype.fadeIn = function(duration, delay) {    
    this.prepareAnim();

    this.calc();
    this.in_progress = true;
        
    let segment = this;
                
    let start;
    let time = null;
    let fraction = 0;
    let request = null;
    
    let bg = rgbaStrToObj(rgbaStrFromColor(this.background));

    let opening_bc = rgbaStrToObj(rgbaStrFromColor(this.opening_stroke_style));
    let closing_bc = rgbaStrToObj(rgbaStrFromColor(this.closing_stroke_style));
    let outer_bc = rgbaStrToObj(rgbaStrFromColor(this.outer_stroke_style));
    let inner_bc = rgbaStrToObj(rgbaStrFromColor(this.inner_stroke_style)); 
        
    let new_bg = Object.assign({}, bg);

    let new_opening_bc = Object.assign({}, opening_bc);
    let new_closing_bc = Object.assign({}, closing_bc);
    let new_outer_bc = Object.assign({}, outer_bc);
    let new_inner_bc = Object.assign({}, inner_bc);
   
    function fadeInAnim() {
        time = Date.now();
        fraction = (time - start) / (duration * 1000);
        
        if(segment.gradient !== null) {
            let new_gr = segment.gradient.instanceCopy();
            new_gr.fade(fraction);
            segment.anim_gradient = new_gr.instanceCopy();
        }
        
        new_bg.a = bg.a * (fraction);
        segment.anim_background = rgbaObjToStr(new_bg);
           
        new_opening_bc.a = opening_bc.a * (fraction);
        segment.anim_border_opening_color = rgbaObjToStr(new_opening_bc);
        
        new_closing_bc.a = closing_bc.a * (fraction);
        segment.anim_border_closing_color = rgbaObjToStr(new_closing_bc);
        
        new_outer_bc.a = outer_bc.a * (fraction);
        segment.anim_border_outer_color = rgbaObjToStr(new_outer_bc);
        
        new_inner_bc.a = inner_bc.a * (fraction);
        segment.anim_border_inner_color = rgbaObjToStr(new_inner_bc);
        
        let calc_func = segment.calc.bind(segment);
        calc_func();
        
        if(fraction > 1) {
            if(this.gradient !== null && (this.gradient instanceof SegmentGradient)) { this.anim_gradient = this.gradient.instanceCopy(); }
            segment.anim_background = segment.background;    
            segment.anim_border_color = segment.border_color;
            segment.stopFadingIn();
            cancelAnimationFrame(request);
            dispatchEvent(new CustomEvent("segment-faded-in", { detail : { segment : segment } }));
        }
        else {
            segment.visible = true;
            window.requestAnimFrame(fadeInAnim);
        }            
    };
        
    request = setTimeout(function() {
        start = Date.now();
        window.requestAnimFrame(fadeInAnim); }, delay * 1000);
};

Segment.prototype.stopFadingIn = function() {
    this.visible = true;
    this.in_progress = false;
    
    this.calc();
};

Segment.prototype.fadeOut = function(duration, delay) {
    this.prepareAnim();
    
    this.in_progress = true;
    this.calc();
        
    let segment = this;
                
    let start;
    let time = null;
    let fraction = 0;
    let request = null;
    
    let bg = rgbaStrToObj(rgbaStrFromColor(this.anim_background));
     
    let opening_bc = rgbaStrToObj(rgbaStrFromColor(this.opening_stroke_style));
    let closing_bc = rgbaStrToObj(rgbaStrFromColor(this.closing_stroke_style));
    let outer_bc = rgbaStrToObj(rgbaStrFromColor(this.outer_stroke_style));
    let inner_bc = rgbaStrToObj(rgbaStrFromColor(this.inner_stroke_style)); 
    
    let new_bg = Object.assign({}, bg);

    let new_opening_bc = Object.assign({}, opening_bc);
    let new_closing_bc = Object.assign({}, closing_bc);
    let new_outer_bc = Object.assign({}, outer_bc);
    let new_inner_bc = Object.assign({}, inner_bc);
    
    function fadeOutAnim() {
        time = Date.now();
        fraction = (time - start) / (duration * 1000);
        
        if(segment.gradient !== null) {
            let new_gr = segment.gradient.instanceCopy();
            new_gr.fade(1 - fraction);
            segment.anim_gradient = new_gr.instanceCopy();
        }
        
        new_bg.a = bg.a * (1 - fraction);
        segment.anim_background = rgbaObjToStr(new_bg);
        
        new_opening_bc.a = opening_bc.a * (1 - fraction);
        segment.anim_border_opening_color = rgbaObjToStr(new_opening_bc);
        
        new_closing_bc.a = closing_bc.a * (1 - fraction);
        segment.anim_border_closing_color = rgbaObjToStr(new_closing_bc);
        
        new_outer_bc.a = outer_bc.a * (1 - fraction);
        segment.anim_border_outer_color = rgbaObjToStr(new_outer_bc);
        
        new_inner_bc.a = inner_bc.a * (1 - fraction);
        segment.anim_border_inner_color = rgbaObjToStr(new_inner_bc);
        
        let calc_func = segment.calc.bind(segment);
        calc_func();
        
        if(fraction > 1) {
            if(this.gradient !== null && (this.gradient instanceof SegmentGradient)) { this.anim_gradient = this.gradient.instanceCopy(); }
            segment.anim_background = segment.background; 
            segment.anim_border_color = segment.border_color;
            segment.stopFadingOut();
            cancelAnimationFrame(request);
            dispatchEvent(new CustomEvent("segment-faded-out", { detail : { segment : segment } }));
        }
        else {
            segment.visible = true;
            window.requestAnimFrame(fadeOutAnim);
        }            
    };
        
    request = setTimeout(function() {
        start = Date.now();
        window.requestAnimFrame(fadeOutAnim); }, delay * 1000);
};       

Segment.prototype.stopFadingOut = function() {
    this.visible = false;
    this.in_progress = false;
    
    this.calc();
};

Segment.prototype.isPointInside = function(x, y) {    
    let init_angle = this.init_angle % 360;
    while(init_angle < 0) { init_angle += 360; }
    
    let px = x - this.cx;
    let py = this.cy - y;
    let r = Math.sqrt(Math.pow(px, 2) + Math.pow(py, 2));
    let a = - (Math.atan2(py, px) * 180 / Math.PI);
    while(a < 0) { a += 360; }
        
    let res = true;
    if(r < this.r_in || r > this.r_out) { res = false; }
    if((a < init_angle && (a + 360) > (init_angle + this.angle)) || a > (init_angle + this.angle)) { res = false; }
      
    return res;
};

Segment.prototype.instanceCopy = function() {
    const copy = new this.constructor();
    const keys = Object.keys(this);
    keys.forEach(key => { copy[key] = this[key]; });
    return copy;
};