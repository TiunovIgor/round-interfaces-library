function SegmentScale(id, context, center_x, center_y, inner_radius, thickness, initial_angle, angle) {    
    this.id = id; // Object identificator
    this.context = context; // CanvasRenderingContext2D for drawing a segment scale
    this.cx = center_x; // X coordinate of the base segment center
    this.cy = center_y; // Y coordinate of the base segment center
    this.r_in = inner_radius; // base segment inner radius
    this.thickness = thickness; // base segment thickness
    this.r_out = inner_radius + thickness; // base segment outer radius
    this.init_angle = initial_angle; // base segment initial radius
    this.angle = angle; // base segment angle
    
    this.gradient = null;
    this.background = "rgba(200, 200, 200, 1)";
    this.border_width = 1;
    this.border_color = "rgba(100, 100, 100, 1)";
    
    this.base_segment = null;
        
    this.levels = [];
    this.divisions = [];
    this.marks = [];
    this.signs = [];
    
    this.min_value;
    this.max_value;
    
    this.mark_position = '';
    this.mark_r_in = this.r_in;
    
    this.sign_position = '';
    this.sign_r_in = this.r_in + 15;
    this.sign_font = '10pt Arial';
    this.sign_text_color = 'black';
    this.sign_text_border_width = 0;
    this.sign_text_border_color = 'rgba(0, 0, 0, 0)';
    this.sign_text_direction = 'vertical'; // vertical, clockwise, anticlockwise, from_center, to_center
    
    this.visible = true;
    this.marks_visible = true;
    this.signs_visible = true;
    this.in_progress = false;
     
    this.appeared_marks = [];
    this.disappeared_marks = [];
    this.faded_in_marks = [];
    this.faded_out_marks = [];
    
    this.build();
    this.calc();
};

SegmentScale.prototype.build = function() {
    this.divisions = [];
    this.marks = [];
    this.signs = [];
    
    this.base_segment = new Segment(this.id + '_base_segment', this.context, this.cx, this.cy, this.r_in, this.thickness, this.init_angle, this.angle);
    
    if(this.gradient) { this.base_segment.gradient = this.gradient.instanceCopy(); }
    this.base_segment.background = this.background;
    this.base_segment.border_width = this.border_width;
    this.base_segment.border_color = this.border_color;
    
    this.base_segment.calc();
    
    for(let i=0; i < this.levels.length; i++) {
        let level = this.levels[i];
        let divisions_count = level.divisions_count;

        for(let j=i-1; j >= 0; j--) {
            let prev_level = this.levels[j];
            divisions_count *= prev_level.divisions_count;
        }
               
        let division_angle = this.angle / divisions_count;
        let subdivision = { 'divisions_count' : divisions_count, 'division_angle' : division_angle };
        
        this.divisions.push(subdivision);
    }
       
    for(let i=0; i < this.levels.length; i++) {
        let level = this.levels[i];
        let subdivision = this.divisions[i];
        
        let mark_r_in = this.mark_r_in;
        let mark_length = level.mark_length;
                
        if(this.mark_position === 'inner') { mark_r_in = this.r_in; }
        else if(this.mark_position === 'middle') { mark_r_in = this.r_in + (this.thickness - mark_length) / 2; }
        else if(this.mark_position === 'outer') { mark_r_in = this.r_out - mark_length; }
        
        // Signs
        let signs = null;
        let signs_array = null;
        let text_options = null;

        let sign_r_in = this.sign_r_in;
        
        if(level.hasOwnProperty('signs')) {
            signs = level.signs;
            
            if(signs.hasOwnProperty('signs_array')) {
                signs_array = signs.signs_array;
            }
            
            if(signs.hasOwnProperty('text_options')) {
                text_options = signs.text_options;
            }
        }
                
        let k = 0;
        
        for(let j=0; j <= subdivision.divisions_count; j++) {
            if(i !== 0) {
                if((j === subdivision.divisions_count) && (i !== 0 || this.angle !== 360)) continue;
                if(j % level.divisions_count === 0) continue;
            }         
            else {
                if(this.angle === 360 && j === 0) continue;
            }
            
            let angle = this.init_angle + subdivision.division_angle * j;                
            let mark = new SegmentScaleMark(this.id + '_m_' + (i+1) + '_' + (j), this.context, this.cx, this.cy, mark_r_in, mark_length, angle);
            mark.width = level.mark_width;
            mark.color = level.mark_color;
            mark.visible = this.marks_visible;
            mark.calc();
            this.marks.push(mark);

            if(signs_array !== null) {
                if(typeof signs_array[k] !== 'undefined') {
                    let sign = new SegmentScaleSign(this.id + '_s_' + (i+1) + '_' + (k), this.context, this.cx, this.cy, sign_r_in, signs_array[k], angle);
                    if(typeof text_options !== 'undefined') {
                        if(typeof text_options.hasOwnProperty('font')) { sign.font = text_options.font; }
                        if(typeof text_options.hasOwnProperty('color')) { sign.text_color = text_options.color; }
                        if(typeof text_options.hasOwnProperty('border_width')) { sign.text_border_width = text_options.border_width; }
                        if(typeof text_options.hasOwnProperty('border_color')) { sign.text_border_color = text_options.border_color; }
                        if(typeof text_options.hasOwnProperty('direction')) { sign.text_direction = text_options.direction; }
                    }
                    sign.calc();
                    this.signs.push(sign);
                    
                    k++;
                }
            }
        }       
    }
            
    let scale = this;
        
    addEventListener("segment-changed", function(e) { 
        if(e.detail.segment === scale.base_segment) {
            dispatchEvent(new CustomEvent("segment-scale-changed", { detail : { scale : scale } } ));
        }
    });

    addEventListener("segment-scale-mark-changed", function(e) {
        if(scale.marks.indexOf(e.detail.mark) >= 0) {
            dispatchEvent(new CustomEvent("segment-scale-changed", { detail : { scale : scale } } ));
        }
    });
    
    addEventListener("segment-scale-sign-changed", function(e) {
        if(scale.signs.indexOf(e.detail.sign) >= 0) {
            dispatchEvent(new CustomEvent("segment-scale-changed", { detail : { scale : scale } } ));
        }
    });
};

SegmentScale.prototype.calc = function() {
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
            
    dispatchEvent(new CustomEvent("segment-scale-changed", { detail : { scale : this } } ));
};

SegmentScale.prototype.draw = function() {
    this.base_segment.draw();
    
    this.marks.forEach(function(mark) {
        mark.draw();
    });
    
    this.signs.forEach(function(sign) {
        sign.draw();
    });
};

SegmentScale.prototype.sortMarksByAngle = function(marks) {   
    function compareByAngle(a, b) {
        if(a.angle > b.angle) { return 1; }
        if(a.angle < b.angle) { return -1; }
        if(a.angle === b.angle) { return 0; }
    }
    return marks.sort(compareByAngle);
};

SegmentScale.prototype.appear = function(order, lag, direction, duration, delay) {
    this.in_progress = true;
    
    this.appeared_marks = [];
    
    let check_func = this.checkAppearedMarks.bind(this);
    
    let marks = this.marks.concat();
    if(order.startsWith('one-by-one')) { this.sortMarksByAngle(marks); }
            
    let mark_duration = duration;
    let lag_array = [];
    
    for(let i=0; i < marks.length; i++) {
        if(order === 'together') {
            lag_array[i] = 0;
        }
        else if((order === 'one-by-one-clockwise') || (order === 'level-by-level-clockwise')) {
            mark_duration = (duration - lag * (marks.length - 1)) / marks.length;
            lag_array[i] = i * (mark_duration + lag);
        }
        else if((order === 'one-by-one-anticlockwise') || (order === 'level-by-level-anticlockwise')) {
            mark_duration = (duration - lag * (marks.length - 1)) / marks.length;
            lag_array[i] = (marks.length - 1 - i) * (mark_duration + lag);
        }
    }
    
    setTimeout(function() {
        marks.forEach(function callback(value, index, array) {
            value.appear(direction, mark_duration, lag_array[index]);

            addEventListener("segment-scale-mark-appeared", function(e) {
                if(marks.indexOf(e.detail.mark) >= 0) {
                    check_func(e.detail.mark);
                }
            });
        });
    }, delay * 1000);
};

SegmentScale.prototype.checkAppearedMarks = function(mark) {
    if(this.marks.indexOf(mark) < 0) {
        return;
    }
    else {  
        if(this.appeared_marks.indexOf(mark) < 0) {
            this.appeared_marks.push(mark);
        }

        let appeared = true;
        let scale = this;

        this.marks.forEach(function(m) {
            if(scale.appeared_marks.indexOf(m) < 0) {
                appeared = false;
            }
        });    

        if(appeared) {    
            this.marks_visible = true;
            this.appeared_marks = [];
            this.in_progress = false;
            dispatchEvent(new CustomEvent("segment-scale-appeared", { detail : { scale : this } }));
        }    
    };
};

SegmentScale.prototype.disappear = function(order, lag, direction, duration, delay) {
    this.in_progress = true;
    
    this.disappeared_marks = [];
    
    let check_func = this.checkDisappearedMarks.bind(this);
    
    let marks = this.marks.concat();
    if(order.startsWith('one-by-one')) { this.sortMarksByAngle(marks); }
                    
    let mark_duration = duration;
    let lag_array = [];
    
    for(let i=0; i < marks.length; i++) {
        if(order === 'together') {
            lag_array[i] = 0;
        }
        else if((order === 'one-by-one-clockwise') || (order === 'level-by-level-clockwise')) {
            mark_duration = (duration - lag * (marks.length - 1)) / marks.length;
            lag_array[i] = i * (mark_duration + lag);
        }
        else if((order === 'one-by-one-anticlockwise') || (order === 'level-by-level-anticlockwise')) {
            mark_duration = (duration - lag * (marks.length - 1)) / marks.length;
            lag_array[i] = (marks.length - 1 - i) * (mark_duration + lag);
        }
    }
    
    setTimeout(function() {
        marks.forEach(function callback(value, index, array) {
            value.disappear(direction, mark_duration, lag_array[index]);

            addEventListener("segment-scale-mark-disappeared", function(e) {
                if(marks.indexOf(e.detail.mark) >= 0) {
                    check_func(e.detail.mark);
                }
            });
        });
    }, delay * 1000);
};

SegmentScale.prototype.checkDisappearedMarks = function(mark) {  
    if(this.marks.indexOf(mark) < 0) {
        return;
    }
    else {  
        if(this.disappeared_marks.indexOf(mark) < 0) {
            this.disappeared_marks.push(mark);
        }

        let disappeared = true;
        let scale = this;

        this.marks.forEach(function(m) {
            if(scale.disappeared_marks.indexOf(m) < 0) {
                disappeared = false;
            }
        });    

        if(disappeared) {    
            this.marks_visible = false;
            this.disappeared_marks.length = 0;
            this.in_progress = false;
            dispatchEvent(new CustomEvent("segment-scale-disappeared", { detail : { scale : this } }));
        }    
    };
};

SegmentScale.prototype.fadeIn = function(order, lag, duration, delay) {
    this.in_progress = true;
    
    this.faded_in_marks = [];
    
    let check_func = this.checkFadedInMarks.bind(this);
    
    let marks = this.marks.concat();
    if(order.startsWith('one-by-one')) { this.sortMarksByAngle(marks); }
        
    let mark_duration = duration;
    let lag_array = [];
    
    for(let i=0; i < marks.length; i++) {
        if(order === 'together') {
            lag_array[i] = 0;
        }
        else if((order === 'one-by-one-clockwise') || (order === 'level-by-level-clockwise')) {
            mark_duration = (duration - lag * (marks.length - 1)) / marks.length;
            lag_array[i] = i * (mark_duration + lag);
        }
        else if((order === 'one-by-one-anticlockwise') || (order === 'level-by-level-anticlockwise')) {
            mark_duration = (duration - lag * (marks.length - 1)) / marks.length;
            lag_array[i] = (marks.length - 1 - i) * (mark_duration + lag);
        }
    }
    
    setTimeout(function() {
        marks.forEach(function callback(value, index, array) {
            value.fadeIn(mark_duration, lag_array[index]);

            addEventListener("segment-scale-mark-faded-in", function(e) {
                if(marks.indexOf(e.detail.mark) >= 0) {
                    check_func(e.detail.mark);
                }
            });
        });
    }, delay * 1000);
};

SegmentScale.prototype.checkFadedInMarks = function(mark) {
    if(this.marks.indexOf(mark) < 0) {
        return;
    }
    else {    
        if(this.faded_in_marks.indexOf(mark) < 0) {
            this.faded_in_marks.push(mark);
        }

        let faded_in = true;
        let scale = this;

        this.marks.forEach(function(m) {
            if(scale.faded_in_marks.indexOf(m) < 0) {
                faded_in = false;
            }
        });    

        if(faded_in) {
            this.marks_visible = true;
            this.faded_in_marks = [];
            this.in_progress = false;
            dispatchEvent(new CustomEvent("segment-scale-faded-in", { detail : { scale : this } }));
        }
    }
};

SegmentScale.prototype.fadeOut = function(order, lag, duration, delay) {
    this.in_progress = true;
    
    this.faded_out_marks = [];
    
    let check_func = this.checkFadedOutMarks.bind(this);
    
    let marks = this.marks.concat();
    if(order.startsWith('one-by-one')) { this.sortMarksByAngle(marks); }
        
    let mark_duration = duration;
    let lag_array = [];
    
    for(let i=0; i < marks.length; i++) {
        if(order === 'together') {
            lag_array[i] = 0;
        }
        else if((order === 'one-by-one-clockwise') || (order === 'level-by-level-clockwise')) {
            mark_duration = (duration - lag * (marks.length - 1)) / marks.length;
            lag_array[i] = i * (mark_duration + lag);
        }
        else if((order === 'one-by-one-anticlockwise') || (order === 'level-by-level-anticlockwise')) {
            mark_duration = (duration - lag * (marks.length - 1)) / marks.length;
            lag_array[i] = (marks.length - 1 - i) * (mark_duration + lag);
        }
    }
    
    setTimeout(function() {
        marks.forEach(function callback(value, index, array) {
            value.fadeOut(mark_duration, lag_array[index]);

            addEventListener("segment-scale-mark-faded-out", function(e) {
                if(marks.indexOf(e.detail.mark) >= 0) {
                    check_func(e.detail.mark);
                }
            });
        });
    }, delay * 1000);
};

SegmentScale.prototype.checkFadedOutMarks = function(mark) {
    if(this.marks.indexOf(mark) < 0) {
        return;
    }
    else {    
        if(this.faded_out_marks.indexOf(mark) < 0) {
            this.faded_out_marks.push(mark);
        }

        let faded_out = true;
        let scale = this;

        this.marks.forEach(function(d) {
            if(scale.faded_out_marks.indexOf(d) < 0) {
                faded_out = false;
            }
        });    

        if(faded_out) {
            this.marks_visible = false;
            this.faded_out_marks = [];
            this.in_progress = false;
            dispatchEvent(new CustomEvent("segment-scale-faded-out", { detail : { scale : this } }));
        }
    }
};

SegmentScale.prototype.instanceCopy = function() {
    const copy = new this.constructor();
    const keys = Object.keys(this);
    keys.forEach(key => { copy[key] = this[key]; });
    return copy;
};