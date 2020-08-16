function SegmentArrayProgressBar(id, context, center_x, center_y, inner_radius, thickness, initial_angle = -90, angle = 360) {    
    this.id = id; // Object identificator
    this.context = context; // CanvasRenderingContext2D for drawing a segment array
    this.cx = center_x; // X coordinate of the base segment center
    this.cy = center_y; // Y coordinate of the base segment center
    this.r_in = inner_radius; // base segment inner radius
    this.thickness = thickness; // initial angle of the base segment
    this.r_out = inner_radius + thickness; // base segment outer radius
    this.init_angle = initial_angle; // initial angle of the base segment
    this.angle = angle;
    
    if((this.angle %= 360) === 0) { this.angle = 360; }
    else if(this.angle > 360) { this.angle = 360; }
    else if(this.angle < 0) { while(this.angle < 0) { this.angle += 360; }; }

    this.min_value = 0;
    this.max_value = 100;
    this.value = 0;
    this.speed = 0.2; // value change animation speed
        
    this.font_family = 'Open Sans';
    this.font_size = '30px';
    this.font;
    this.text_color = 'black';
    this.text_border_width = 1;
    this.text_border_color = 'rgba(0,0,0,0)';
    this.units = '%';   
    
    this.base_segment = null;
    
    this.gradient = null;
    this.background = "rgba(250, 250, 250, 1)";
    this.border_width = 1;
    this.border_color = "rgba(100, 100, 100, 1)";
    
    this.proportional = false;
    this.full_thickness = false;
    this.start_with = 'segment';
    
    this.segments = [];
    this.segments_count = 36;
    this.segment_angle = 7;
    this.segment_position = '';
    this.segment_thickness = 0.6 * this.thickness;
    this.segment_r_in = this.r_in + (this.thickness - this.segment_thickness) / 2;
    
    this.segment_gradient = null;
    this.segment_background = 'rgba(220, 220, 220, 1)';
    this.segment_border_width = 1;
    this.segment_border_color = 'rgba(10, 10, 10, 1)';
    
    this.active_segment_gradient = null;
    this.active_segment_background = 'rgba(100, 100, 100, 1)';
    this.active_segment_border_width = 1;
    this.active_segment_border_color = 'rgba(10, 10, 10, 1)';
        
    this.spaces_count = 100;
    this.space_angle = 3;    
    
    this.visible = true;
    this.segments_visible = true;
    this.in_progress = false; //
    
    this.anim_value = this.value;
     
    this.appeared_segments = [];
    this.disappeared_segments = [];
    this.faded_in_segments = [];
    this.faded_out_segments = [];
    
    this.build();
    this.calc();
};

SegmentArrayProgressBar.prototype.build = function() {
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
    
    this.active_index = this.valueToActiveIndex(this.value);
    
    let progress_bar = this;
    
    addEventListener("segment-changed", function(e) { 
        if(e.detail.segment === progress_bar.base_segment) {
            dispatchEvent(new CustomEvent("segment-array-progress-bar-changed", { detail : { progress_bar : progress_bar } } ));
        }

        if(progress_bar.segments.indexOf(e.detail.segment) >= 0) {
            dispatchEvent(new CustomEvent("segment-array-progress-bar-changed", { detail : { progress_bar : progress_bar } } ));
        }
    });
};

SegmentArrayProgressBar.prototype.calc = function() {
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
    
    let progress_bar = this;
    
    this.segments.forEach(function callback(value, index, array) {
        if(index < progress_bar.active_index) {
            if(progress_bar.active_segment_gradient) { value.gradient = progress_bar.active_segment_gradient.instanceCopy(); }
            value.background = progress_bar.active_segment_background;
            value.border_width = progress_bar.active_segment_border_width;
            value.border_color = progress_bar.active_segment_border_color;
        }
        else {
            if(progress_bar.segment_gradient) { value.gradient = progress_bar.segment_gradient.instanceCopy(); }
            value.background = progress_bar.segment_background;
            value.border_width = progress_bar.segment_border_width;
            value.border_color = progress_bar.segment_border_color;
        }
    });
            
    dispatchEvent(new CustomEvent("segment-array-progress-bar-changed", { detail : { progress_bar : this } } ));
};

SegmentArrayProgressBar.prototype.draw = function() {
    this.base_segment.draw();
    
    this.segments.forEach(function(segment) {
        segment.draw();
    });
    
    let font = this.font;
    
    if(this.font === undefined || this.font === null || this.font === '') {
        font = this.font_size + ' ' + this.font_family;
    }
    
    this.context.font = font;
    this.context.fillStyle = this.text_color;
    this.context.lineWidth = this.text_border_width;
    this.context.strokeStyle = this.text_border_color;
    
    this.context.textAlign = "center";
    this.context.textBaseline = 'middle';

    let text;

    if(this.in_progress) { text = '' + this.anim_value + this.units; }
    else { text = '' + this.value + this.units; }
    
    this.context.fillText(text, this.cx, this.cy);
    this.context.strokeText(text, this.cx, this.cy);
};

SegmentArrayProgressBar.prototype.valueToActiveIndex = function(value = this.value) {
    let ind = this.segments_count * (value - this.min_value) / (this.max_value - this.min_value);
    ind = Math.floor(ind);
    return ind;
};

SegmentArrayProgressBar.prototype.changeValue = function(new_value, speed = this.speed, delay = 0) {
    let progress_bar = this;
    
    if(speed <= 0) {
        this.value = new_value;
        this.calc();
        dispatchEvent(new CustomEvent("segment-array-progress-bar-value-changed", { detail : { progress_bar : progress_bar } }));
        return;
    }
    
    this.anim_value = this.value;
    let old_value = this.value;
    
    let old_index = this.valueToActiveIndex(old_value);
    let new_index = this.valueToActiveIndex(new_value);
                                      
    this.in_progress = true;
    this.calc();        
                
    let start = null;       
    let time = null;
    let fraction = 0;
    let request = null;
       
    function changeValueAnim() {
        time = Date.now();
        fraction = (time - start) / (speed * 1000);
        
        let v = fraction * (new_value - old_value);
        let ind = fraction * (new_index - old_index);
                
        if(fraction <= 1) {
            progress_bar.anim_value = parseInt((old_value + v).toFixed());
            progress_bar.active_index = parseInt((old_index + ind).toFixed());
            progress_bar.calc();
        }
        
        if(fraction > 1) {
            progress_bar.value = parseInt(new_value.toFixed(0));
            progress_bar.in_progress = false;
            progress_bar.calc();
            cancelAnimationFrame(request);
            dispatchEvent(new CustomEvent("segment-array-progress-bar-value-changed", { detail : { progress_bar : progress_bar } }));
        }
        else {
            progress_bar.segments_visible = true;
            window.requestAnimFrame(changeValueAnim);
        }            
    };
        
    request = setTimeout(function() {
        start = Date.now();
        window.requestAnimFrame(changeValueAnim);
    }, delay * 1000);
};

SegmentArrayProgressBar.prototype.appear = function(order, lag, direction, duration, delay) {
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

SegmentArrayProgressBar.prototype.checkAppearedSegments = function(segment) {
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
            dispatchEvent(new CustomEvent("segment-array-appeared", { detail : { progress_bar : this } }));
        }
    }
};

SegmentArrayProgressBar.prototype.disappear = function(order, lag, direction, duration, delay) {
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

SegmentArrayProgressBar.prototype.checkDisappearedSegments = function(segment) {  
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
            dispatchEvent(new CustomEvent("segment-array-disappeared", { detail : { progress_bar : this } }));
        }    
    };
};

SegmentArrayProgressBar.prototype.fadeIn = function(order, lag, duration, delay) {
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

SegmentArrayProgressBar.prototype.checkFadedInSegments = function(segment) {
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
            dispatchEvent(new CustomEvent("segment-array-faded-in", { detail : { progress_bar : this } }));
        }
    }
};

SegmentArrayProgressBar.prototype.fadeOut = function(order, lag, duration, delay) {
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

SegmentArrayProgressBar.prototype.checkFadedOutSegments = function(segment) {
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
            dispatchEvent(new CustomEvent("segment-array-faded-out", { detail : { progress_bar : this } }));
        }
    }
};

SegmentArrayProgressBar.prototype.instanceCopy = function() {
    const copy = new this.constructor();
    const keys = Object.keys(this);
    keys.forEach(key => { copy[key] = this[key]; });
    return copy;
};