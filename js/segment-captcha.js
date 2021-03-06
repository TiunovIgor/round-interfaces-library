function SegmentCaptcha(id, context, center_x, center_y, inner_radius, thickness) {    
    this.id = id; // Object identificator
    this.context = context; // CanvasRenderingContext2D for drawing a segment array
    this.cx = center_x; // X coordinate of the base segment center
    this.cy = center_y; // Y coordinate of the base segment center
    this.r_in = inner_radius; // base segment inner radius
    this.thickness = thickness; // initial angle of the base segment
    this.r_out = inner_radius + thickness; // base segment outer radius
           
    this.base_segment = null;
    this.base_segment_gradient = null;
    this.base_segment_background = "rgba(150, 150, 150, 1)";
    this.base_segment_border_width = 1;
    this.base_segment_border_color = "rgba(10, 10, 10, 1)";
    this.base_segment_position = 'inner'; // valid values: 'inner' or 'outer'
    
    this.segments = [];
    
    this.segments_count = 4;
    this.segment_break = 10; // break of ring in degrees
    this.segment_gradient = null;
    this.segment_background = 'rgba(220, 220, 220, 1)';
    this.segment_border_width = 1;
    this.segment_border_color = 'rgba(50, 50, 50, 1)';
    
    this.space_thickness = 7;
        
    this.active_segment = null;
    this.precision = 10;
    
    this.proportional = false;    
     
    this.visible = true;
    this.segments_visible = true;
    this.in_progress = false;
    
    this.sx = 0;
    this.sy = 0;
    this.sa = 0;
         
    this.build();
    this.calc();
};

SegmentCaptcha.prototype.build = function() {
    this.segments = [];
    
    let base_init_angle = Math.floor(Math.random() * 360);
    let segment_angle = 360 - this.segment_break;
       
    let spaces_count = this.segments_count - 1;
    let segment_thickness;
    
    if(this.proportional) {
        segment_thickness = this.thickness / (this.segments_count + spaces_count);
        this.space_thickness = segment_thickness;
    }
    else { segment_thickness = (this.thickness - spaces_count * this.space_thickness) / this.segments_count; }
    
    let base_r_in;
    let first_r_in;
    
    if(this.base_segment_position === 'outer') {
        base_r_in = (this.r_in + this.thickness) - segment_thickness;
        first_r_in = this.r_in;
    }
    else if(this.base_segment_position === 'inner') {
        base_r_in = this.r_in;
        first_r_in = this.r_in + this.space_thickness + segment_thickness;
    }
    
    this.base_segment = new Segment(this.id + '_base_segment', this.context, this.cx, this.cy, base_r_in, segment_thickness, base_init_angle, segment_angle);
    this.base_segment.background = this.base_segment_background;
    this.base_segment.border_width = this.base_segment_border_width;
    this.base_segment.border_color = this.base_segment_border_color;
    
    if(this.base_segment_gradient) { this.base_segment.gradient = this.base_segment_gradient.instanceCopy(); }
    this.base_segment.calc();
   
    for(let i=0; i < this.segments_count - 1; i++) {
        let segment_r_in = first_r_in + i * (segment_thickness + this.space_thickness);
        let new_init_angle = Math.floor(Math.random() * 360);
        
        let segment = new Segment(this.id + '_s_' + (i+1), this.context, this.cx, this.cy, segment_r_in, segment_thickness, new_init_angle, segment_angle);
        
        if(this.segment_gradient) { segment.gradient = this.segment_gradient.instanceCopy(); }
        segment.background = this.segment_background;
        segment.border_width = this.segment_border_width;
        segment.border_color = this.segment_border_color;
        segment.visible = this.segments_visible;
        segment.calc();
        this.segments.push(segment);
    }

    let captcha = this;
    
    addEventListener("segment-changed", function(e) { 
        if(e.detail.segment === captcha.base_segment) {
            dispatchEvent(new CustomEvent("segment-captcha-changed", { detail : { captcha : captcha } } ));
        }

        if(captcha.segments.indexOf(e.detail.segment) >= 0) {
            dispatchEvent(new CustomEvent("segment-captcha-changed", { detail : { captcha : captcha } } ));
        }
    });
        
    this.context.canvas.addEventListener('mousedown', function(e) {
        captcha.catchSegment(e);        
        captcha.sx = e.offsetX - captcha.cx;
        captcha.sy = e.offsetY - captcha.cy;
        //captcha.sa = Math.atan(captcha.sy / captcha.sx) * 180 / Math.PI;
    });
    
    this.context.canvas.addEventListener('mousemove', function(e) {
        captcha.rotateSegmentByMouseMovement(e);
    });
    
    this.context.canvas.addEventListener('wheel', function(e) {
        captcha.rotateSegmentByMouseWheel(e);
    });
    
    this.context.canvas.addEventListener('mouseup', function(e) {
        captcha.releaseSegment();
    });
    
    this.context.canvas.addEventListener('mouseout', function(e) {
        captcha.releaseSegment();
    });
};

SegmentCaptcha.prototype.calc = function() {
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
            
    dispatchEvent(new CustomEvent("segment-captcha-changed", { detail : { captcha : this } } ));
};

SegmentCaptcha.prototype.draw = function() {
    this.base_segment.draw();
    
    this.segments.forEach(function(segment) {
        segment.draw();
    });
};

SegmentCaptcha.prototype.catchSegment = function(e) {
    let captcha = this;
    
    this.segments.forEach(function(segment) {
        if(segment.isPointInside(e.offsetX, e.offsetY)) {
            captcha.active_segment = segment;
        }
    });
};

SegmentCaptcha.prototype.rotateSegmentByMouseMovement = function(e) {
    if(this.active_segment) {       
        let x1 = this.sx;
        let y1 = this.sy;
        let x2 = e.offsetX - this.cx;
        let y2 = e.offsetY - this.cy;
        
        let a = Math.atan( (x1 * y2 - y1 * x2) / (x1 * x2 + y1 * y2) ) * 180 / Math.PI;
                
        this.active_segment.init_angle += a;
        this.active_segment.calc();        
        
        this.sx = x2;
        this.sy = y2;
    }
    
    dispatchEvent(new CustomEvent("segment-captcha-changed", { detail : { captcha : this } } ));
};

SegmentCaptcha.prototype.rotateSegmentByMouseWheel = function(e) {
    if(this.active_segment) {
        this.active_segment.init_angle += e.deltaY / 360;
        this.active_segment.calc();
    }
    
    dispatchEvent(new CustomEvent("segment-captcha-changed", { detail : { captcha : this } } ));
};

SegmentCaptcha.prototype.releaseSegment = function() {
    if(this.active_segment) {
        let init_angle = this.active_segment.init_angle % 360;
        while(init_angle < 0) { init_angle += 360; }
        this.active_segment.init_angle = init_angle;
        this.active_segment.calc();

        this.checkCaptcha();
    }    
    
    this.active_segment = null;
};

SegmentCaptcha.prototype.checkCaptcha = function() {
    let captcha = this;
    let res = true;
    
    this.segments.forEach(function(segment) {
        let pos = Math.abs(segment.init_angle - captcha.base_segment.init_angle);
        
        if(pos > captcha.precision) {
            res = false;
        }
        else {
            segment.init_angle = captcha.base_segment.init_angle;
            segment.calc();
        }
    });
    
    if(res) {
        dispatchEvent(new CustomEvent("segment-captcha-unlocked", { detail : { captcha : captcha } } ));
    }
};

SegmentCaptcha.prototype.appear = function(order, lag, direction, duration, delay) {
    this.in_progress = true;
    
    this.appeared_segments = [];
    
    let check_func = this.checkAppearedSegments.bind(this);
    
    let seg_arr = this;
    let segments = this.segments;   
        
    let segment_duration = duration;
    let lag_array = [];
    
    for(let i=0; i < segments.length; i++) {
        if(order === 'together') {
            lag_array[i] = 0;
        }
        else if(order === 'one-by-one-clockwise') {
            segment_duration = (duration - lag * (segments.length - 1)) / segments.length;
            lag_array[i] = i * (segment_duration + lag);
        }
        else if(order === 'one-by-one-anticlockwise') {
            segment_duration = (duration -lag * (segments.length - 1)) / segments.length;
            lag_array[i] = (segments.length - 1 - i) * (segment_duration + lag);
        }
    }
    
    setTimeout(function() {
        segments.forEach(function callback(value, index, array) {
            value.appear(direction, segment_duration, lag_array[index]);

            addEventListener("segment-appeared", function(e) {
                if(segments.indexOf(e.detail.segment) >= 0) {
                    check_func(e.detail.segment);
                }
            });
        });
    }, delay * 1000);
};

SegmentCaptcha.prototype.checkAppearedSegments = function(segment) {
    if(this.segments.indexOf(segment) < 0) {
        return;
    }
    else {    
        if(this.appeared_segments.indexOf(segment) < 0) {
            this.appeared_segments.push(segment);
        }

        let appeared = true;
        let array = this;

        this.segments.forEach(function(seg) {
            if(array.appeared_segments.indexOf(seg) < 0) {
                appeared = false;
            }
        });    
        
        if(appeared) {
            this.segments_visible = true;
            this.appeared_segments = [];
            this.in_progress = false;
            dispatchEvent(new CustomEvent("segment-array-appeared", { detail : { captcha : this } }));
        }
    }
};

SegmentCaptcha.prototype.disappear = function(order, lag, direction, duration, delay) {
    this.in_progress = true;
    
    this.disappeared_segments = [];
    
    let check_func = this.checkDisappearedSegments.bind(this);
    
    let seg_arr = this;
    let segments = this.segments;   
        
    let segment_duration = duration;
    let lag_array = [];
    
    for(let i=0; i < segments.length; i++) {
        if(order === 'together') {
            lag_array[i] = 0;
        }
        else if(order === 'one-by-one-clockwise') {
            segment_duration = (duration - lag * (segments.length - 1)) / segments.length;
            lag_array[i] = i * (segment_duration + lag);
        }
        else if(order === 'one-by-one-anticlockwise') {
            segment_duration = (duration -lag * (segments.length - 1)) / segments.length;
            lag_array[i] = (segments.length - 1 - i) * (segment_duration + lag);
        }
    }
    
    setTimeout(function() {
        segments.forEach(function callback(value, index, array) {
            value.disappear(direction, segment_duration, lag_array[index]);

            addEventListener("segment-disappeared", function(e) {
                if(segments.indexOf(e.detail.segment) >= 0) {
                    check_func(e.detail.segment);
                }
            });
        });
    }, delay * 1000);
};

SegmentCaptcha.prototype.checkDisappearedSegments = function(segment) {  
    if(this.segments.indexOf(segment) < 0) {
        return;
    }
    else {  
        if(this.disappeared_segments.indexOf(segment) < 0) {
            this.disappeared_segments.push(segment);
        }

        let disappeared = true;
        let array = this;

        this.segments.forEach(function(seg) {
            if(array.disappeared_segments.indexOf(seg) < 0) {
                disappeared = false;
            }
        });    

        if(disappeared) {    
            this.segments_visible = false;
            this.disappeared_segments.length = 0;
            this.in_progress = false;
            dispatchEvent(new CustomEvent("segment-array-disappeared", { detail : { captcha : this } }));
        }    
    };
};

SegmentCaptcha.prototype.fadeIn = function(order, lag, duration, delay) {
    this.in_progress = true;
    
    this.faded_in_segments = [];
    
    let check_func = this.checkFadedInSegments.bind(this);
    
    let seg_arr = this;
    let segments = this.segments;   
        
    let segment_duration = duration;
    let lag_array = [];
    
    for(let i=0; i < segments.length; i++) {
        if(order === 'together') {
            lag_array[i] = 0;
        }
        else if(order === 'one-by-one-clockwise') {
            segment_duration = (duration - lag * (segments.length - 1)) / segments.length;
            lag_array[i] = i * (segment_duration + lag);
        }
        else if(order === 'one-by-one-anticlockwise') {
            segment_duration = (duration -lag * (segments.length - 1)) / segments.length;
            lag_array[i] = (segments.length - 1 - i) * (segment_duration + lag);
        }
    }
    
    setTimeout(function() {
        segments.forEach(function callback(value, index, array) {
            value.fadeIn(segment_duration, lag_array[index]);

            addEventListener("segment-faded-in", function(e) {
                if(segments.indexOf(e.detail.segment) >= 0) {
                    check_func(e.detail.segment);
                }
            });
        });
    }, delay * 1000);
};

SegmentCaptcha.prototype.checkFadedInSegments = function(segment) {
    if(this.segments.indexOf(segment) < 0) {
        return;
    }
    else {    
        if(this.faded_in_segments.indexOf(segment) < 0) {
            this.faded_in_segments.push(segment);
        }

        let faded_in = true;
        let array = this;

        this.segments.forEach(function(seg) {
            if(array.faded_in_segments.indexOf(seg) < 0) {
                faded_in = false;
            }
        });    

        if(faded_in) {
            this.segments_visible = true;
            this.faded_in_segments = [];
            this.in_progress = false;
            dispatchEvent(new CustomEvent("segment-array-faded-in", { detail : { captcha : this } }));
        }
    }
};

SegmentCaptcha.prototype.fadeOut = function(order, lag, duration, delay) {
    this.in_progress = true;
    
    this.faded_out_segments = [];
    
    let check_func = this.checkFadedOutSegments.bind(this);
    
    let seg_arr = this;
    let segments = this.segments;   
        
    let segment_duration = duration;
    let lag_array = [];
    
    for(let i=0; i < segments.length; i++) {
        if(order === 'together') {
            lag_array[i] = 0;
        }
        else if(order === 'one-by-one-clockwise') {
            segment_duration = (duration - lag * (segments.length - 1)) / segments.length;
            lag_array[i] = i * (segment_duration + lag);
        }
        else if(order === 'one-by-one-anticlockwise') {
            segment_duration = (duration -lag * (segments.length - 1)) / segments.length;
            lag_array[i] = (segments.length - 1 - i) * (segment_duration + lag);
        }
    }
    
    setTimeout(function() {
        segments.forEach(function callback(value, index, array) {
            value.fadeOut(segment_duration, lag_array[index]);

            addEventListener("segment-faded-out", function(e) {
                if(segments.indexOf(e.detail.segment) >= 0) {
                    check_func(e.detail.segment);
                }
            });
        });
    }, delay * 1000);
};

SegmentCaptcha.prototype.checkFadedOutSegments = function(segment) {
    if(this.segments.indexOf(segment) < 0) {
        return;
    }
    else {    
        if(this.faded_out_segments.indexOf(segment) < 0) {
            this.faded_out_segments.push(segment);
        }

        let faded_out = true;
        let array = this;

        this.segments.forEach(function(seg) {
            if(array.faded_out_segments.indexOf(seg) < 0) {
                faded_out = false;
            }
        });    

        if(faded_out) {
            this.segments_visible = false;
            this.faded_out_segments = [];
            this.in_progress = false;
            dispatchEvent(new CustomEvent("segment-array-faded-out", { detail : { captcha : this } }));
        }
    }
};

SegmentCaptcha.prototype.instanceCopy = function() {
    const copy = new this.constructor();
    const keys = Object.keys(this);
    keys.forEach(key => { copy[key] = this[key]; });
    return copy;
};