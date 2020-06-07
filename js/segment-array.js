function SegmentArray(id, context, center_x, center_y, inner_radius, thickness, initial_angle, angle) {    
    this.id = id; // Object identificator
    this.context = context; // CanvasRenderingContext2D for drawing a segment array
    this.cx = center_x; // X coordinate of the base segment center
    this.cy = center_y; // Y coordinate of the base segment center
    this.r_in = inner_radius; // base segment inner radius
    this.thickness = thickness; // initial angle of the base segment
    this.r_out = inner_radius + thickness; // base segment outer radius
    this.init_angle = initial_angle; // initial angle of the base segment
    this.angle = angle; // angle of the base segment
    
    this.gradient = null;
    this.background = "rgba(220, 220, 220, 1)";
    this.border_width = 1;
    this.border_color = "rgba(100, 100, 100, 1)";
    
    this.base_segment = null;
    
    this.proportional = false;
    this.full_thickness = false;
    this.start_with = 'segment';
    
    this.segments = [];
    this.segments_count = 5;
    this.segment_angle = 10;
    this.segment_position = '';
    this.segment_thickness = 0.6 * this.thickness;
    this.segment_r_in = this.r_in + (this.thickness - this.segment_thickness) / 2;
    
    this.segment_gradient = null;
    this.segment_background = 'rgba(180, 180, 180, 1)';
    this.segment_border_width = 1;
    this.segment_border_color = 'rgba(10, 10, 10, 1)';
        
    this.spaces_count = 4;
    this.space_angle = 10;    
    
    this.visible = true;
    this.segments_visible = true;
    this.in_progress = false; //
     
    this.appeared_segments = [];
    this.disappeared_segments = [];
    this.faded_in_segments = [];
    this.faded_out_segments = [];
    
    this.build();
    this.calc();
};

SegmentArray.prototype.build = function() {
    this.segments = [];
    
    this.base_segment = new Segment(this.id + '_base_segment', this.context, this.cx, this.cy, this.r_in, this.thickness, this.init_angle, this.angle);
    this.base_segment.border_width = this.border_width;
    this.base_segment.border_color = this.border_color;
    
    if(this.gradient) { this.base_segment.gradient = this.gradient.instanceCopy(); }
    this.base_segment.background = this.background;
    
    if(this.full_thickness) {
        this.segment_r_in = this.r_in;
        this.segment_thickness = this.thickness;
    }
    else {
        if(this.segment_position === 'inner') { this.segment_r_in = this.r_in; }
        else if(this.segment_position === 'middle') { this.segment_r_in = this.r_in + (this.thickness - this.segment_thickness) / 2; }
        else if(this.segment_position === 'outer') { this.segment_r_in = this.r_out - this.segment_thickness; }
    }
    
    this.base_segment.calc();
    
    if(this.angle === 360) { this.spaces_count = this.segments_count; }
    else {
        if(this.start_with === 'segment') { this.spaces_count = this.segments_count - 1; }
        else { this.spaces_count = this.segments_count + 1; }
    }
       
    if(this.proportional) {
        let a = this.angle / (this.segments_count + this.spaces_count);
        this.segment_angle = a;
        this.space_angle = a;
    }
    else {
        this.space_angle = (this.angle - this.segments_count * this.segment_angle) / this.spaces_count;
    }
    
    let first_angle = this.base_segment.init_angle;
    if(this.start_with === 'space') { first_angle += this.space_angle; }
    
    for(let i=0; i < this.segments_count; i++) {
        let segment = new Segment(this.id + '_s_' + (i+1), this.context, this.cx, this.cy, this.segment_r_in, this.segment_thickness,
            first_angle + (this.segment_angle + this.space_angle) * i, this.segment_angle);
        if(this.segment_gradient) { segment.gradient = this.segment_gradient.instanceCopy(); }
        segment.background = this.segment_background;
        segment.border_width = this.segment_border_width;
        segment.border_color = this.segment_border_color;
        segment.visible = this.segments_visible;
        segment.calc();
        this.segments.push(segment);
    }

    let array = this;
    
    addEventListener("segment-changed", function(e) { 
        if(e.detail.segment === array.base_segment) {
            dispatchEvent(new CustomEvent("segment-array-changed", { detail : { array : array } } ));
        }

        if(array.segments.indexOf(e.detail.segment) >= 0) {
            dispatchEvent(new CustomEvent("segment-array-changed", { detail : { array : array } } ));
        }
    });
};

SegmentArray.prototype.calc = function() {
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
            
    dispatchEvent(new CustomEvent("segment-array-changed", { detail : { array : this } } ));
};

SegmentArray.prototype.draw = function() {
    this.base_segment.draw();
    
    this.segments.forEach(function(segment) {
        segment.draw();
    });
};

SegmentArray.prototype.appear = function(order, lag, direction, duration, delay) {
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

SegmentArray.prototype.checkAppearedSegments = function(segment) {
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
            dispatchEvent(new CustomEvent("segment-array-appeared", { detail : { array : this } }));
        }
    }
};

SegmentArray.prototype.disappear = function(order, lag, direction, duration, delay) {
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

SegmentArray.prototype.checkDisappearedSegments = function(segment) {  
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
            dispatchEvent(new CustomEvent("segment-array-disappeared", { detail : { array : this } }));
        }    
    };
};

SegmentArray.prototype.fadeIn = function(order, lag, duration, delay) {
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

SegmentArray.prototype.checkFadedInSegments = function(segment) {
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
            dispatchEvent(new CustomEvent("segment-array-faded-in", { detail : { array : this } }));
        }
    }
};

SegmentArray.prototype.fadeOut = function(order, lag, duration, delay) {
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

SegmentArray.prototype.checkFadedOutSegments = function(segment) {
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
            dispatchEvent(new CustomEvent("segment-array-faded-out", { detail : { array : this } }));
        }
    }
};

SegmentArray.prototype.instanceCopy = function() {
    const copy = new this.constructor();
    const keys = Object.keys(this);
    keys.forEach(key => { copy[key] = this[key]; });
    return copy;
};