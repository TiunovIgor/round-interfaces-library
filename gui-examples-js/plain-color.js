function PlainColor(canvasElementId) {
    this.id = "PlainColor";
    this.canvas = document.getElementById(canvasElementId);
    this.context = this.canvas.getContext('2d');
    let context = this.context;
    context.width = this.canvas.width;
    context.height = this.canvas.height;
   
    function Point(px, py) { this.x = px; this.y = py; }
    this.c = new Point(context.width/2, context.height/2);
    
    this.items = [];
    this.animated_items = [];

    this.in_progress = false;    
    
    this.item_1 = new SegmentArray('item-1', context, this.c.x, this.c.y, 65, 25, -90, 360);
    this.item_1.segments_count = 35;
    this.item_1.segment_thickness = 17;
    this.item_1.segment_position = 'middle';
    this.item_1.segment_angle = 3;
    this.item_1.start_with = 'segment';
    this.item_1.background = 'rgba(0, 0, 0, 1)';
    this.item_1.segment_background = 'rgba(255, 0, 0, 1)';
    this.item_1.segment_border_width = 1;
    this.item_1.segment_border_color = 'none';
    this.item_1.build();
    
    this.item_2 = new Segment('item-2', context, this.c.x, this.c.y, 100, 20, 90, 180);
    this.item_2.background = 'rgba(200, 200, 200, 1)';
    this.item_2.border_width = 1;
    this.item_2.border_color = 'rgba(0, 0, 0, 1)';
    this.item_2.visible = true;
    this.item_2.calc();
    
    this.item_3 = new SegmentLevel('item-3', context, this.c.x, this.c.y, 100);
    
    this.item_3_1 = new Segment('item-3-1', context, this.c.x, this.c.y, 100, 50, 10, 70);
    this.item_3_1.background = 'rgba(200, 200, 200, 1)';
    this.item_3_1.border_width = 1;
    this.item_3_1.border_color = 'rgba(100, 100, 100, 1)';
    this.item_3_1.calc();
    
    this.item_3_2 = new Segment('item-3-2', context, this.c.x, this.c.y, 115, 20, 20, 50);
    this.item_3_2.background = 'rgba(250, 250, 250, 1)';
    this.item_3_2.border_width = 1;
    this.item_3_2.border_color = 'rgba(100, 100, 100, 1)';
    this.item_3_2.calc();
    
    this.item_3_3_1 = new Segment('item-3-3-1', context, this.c.x, this.c.y, 150, 40, 10, 10);
    this.item_3_3_1.background = 'rgba(230, 230, 230, 1)';
    this.item_3_3_1.border_width = 1;
    this.item_3_3_1.border_color = 'rgba(100, 100, 100, 1)';
    this.item_3_3_1.calc();
    
    this.item_3_3_2 = this.item_3_3_1.instanceCopy();
    this.item_3_3_2.id = 'item-3-2-2';
    this.item_3_3_2.init_angle = 30;
    this.item_3_3_2.calc();
    
    this.item_3_3_3 = this.item_3_3_1.instanceCopy();
    this.item_3_3_3.id = 'item-3-3-3';
    this.item_3_3_3.init_angle = 50;
    this.item_3_3_3.calc();
    
    this.item_3_3_4 = this.item_3_3_1.instanceCopy();
    this.item_3_3_4.id = 'item-3-3-4';
    this.item_3_3_4.init_angle = 70;
    this.item_3_3_4.calc();
    
    this.item_3.addSegment(this.item_3_1);
    this.item_3.addSegment(this.item_3_2);
    this.item_3.addSegment(this.item_3_3_1);
    this.item_3.addSegment(this.item_3_3_2);
    this.item_3.addSegment(this.item_3_3_3);
    this.item_3.addSegment(this.item_3_3_4);
    
    this.item_4 = new SegmentDotsArray('item-4', context, this.c.x, this.c.y, 130, 30, 180, 180);
    this.item_4.dots_count = 13;
    this.item_4.dot_radius = 5;
    this.item_4.base_radius = 145;
    this.item_4.start_with = 'space';
    this.item_4.proportional = true;
    this.item_4.background = 'rgba(255, 0, 0, 1)';
    this.item_4.dot_background = 'rgba(0, 0, 0, 0.8)';
    this.item_4.dot_border_width = 1;
    this.item_4.dot_border_color = 'rgba(0, 0, 0, 1)';
    this.item_4.dot_visible = true;
    this.item_4.build();
    
    this.item_5 = new SegmentScale('item-5', context, this.c.x, this.c.y, 165, 30, 110, 230);
    this.item_5.background = 'rgba(200, 200, 200, 1)';
    this.item_5.levels = [
        { 'divisions_count' : 10, 'mark_length' : 25, 'mark_width' : 3, 'mark_color' : 'rgba(0, 0, 0, 1)' },
        { 'divisions_count' : 2, 'mark_length' : 20, 'mark_width' : 2, 'mark_color' : 'rgba(50, 50, 50, 1)' },
        { 'divisions_count' : 5, 'mark_length' : 15, 'mark_width' : 1, 'mark_color' : 'rgba(100, 100, 100, 1)' }
    ];
    this.item_5.mark_position = 'outer';
    this.item_5.mark_visible = true;
    this.item_5.build();
        
    this.items.push(this.item_1);
    this.items.push(this.item_2);
    this.items.push(this.item_3);
    this.items.push(this.item_4);
    this.items.push(this.item_5);
       
    let interface = this;
    let items_array = this.items;
    let draw_func = this.draw.bind(this);
    
    addEventListener('segment-changed', function(e) {
        if(items_array.indexOf(e.detail.segment)) { draw_func(); } });
    addEventListener('segment-array-changed', function(e) {
        if(items_array.indexOf(e.detail.array)) { draw_func(); } });
    addEventListener('segment-dots-array-changed', function(e) {
        if(items_array.indexOf(e.detail.array)) { draw_func(); } });
    addEventListener('segment-scale-changed', function(e) {
        if(items_array.indexOf(e.detail.scale)) { draw_func(); } });
    
    addEventListener('item-animation-finished', function(e) {
        if(items_array.indexOf(e.detail.item)) { console.log('event ' + e.detail.item.id); interface.checkAnimatedItems(e.detail.item); }
    });
    
    this.draw();
};

PlainColor.prototype.draw = function() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.item_1.draw();
    this.item_2.draw();
    this.item_3.draw();
    this.item_4.draw();
    this.item_5.draw();
};

PlainColor.prototype.animate = function() {   
    if(this.in_progress) {
        return;
    }
    else {        
        this.in_progress = true;
        /*
        let item_1 = this.item_1;
        
        if(item_1.segments_visible) { item_1.fadeOut('together', 0, 3, 0); }
        addEventListener('segment-array-faded-out', function(e) {
            if(e.detail.array === item_1) { e.detail.array.fadeIn('one-by-one-clockwise', 0, 5, 0); }
        });
        addEventListener('segment-array-faded-in', function(e) {
            if(e.detail.array === item_1) {
                dispatchEvent(new CustomEvent("item-animation-finished", { detail : { item : item_1 } }));
            }
        });
        
        let item_2 = this.item_2;

        let direction = 'clockwise';
        let count_2 = 0;

        item_2.disappear('anticlockwise', 2, 0);
        addEventListener('segment-disappeared', function(e) {
            if(e.detail.segment === item_2) { e.detail.segment.appear('clockwise', 1, 1); } });
        addEventListener('segment-appeared', function(e) { 
            if(e.detail.segment === item_2) { e.detail.segment.rotate(direction, 90, 2, 0); } });
        addEventListener('segment-rotated', function(e) {
            if(e.detail.segment === item_2) {
                count_2++;
                if(direction === 'clockwise') { direction = 'anticlockwise'; }
                else { direction = 'clockwise'; }

                if(count_2 < 8) { e.detail.segment.rotate(direction, 90, 2, 0); }
                else { dispatchEvent(new CustomEvent("item-animation-finished", { detail : { item : item_2 } })); }
            }
        });
        */
       
        let item_4 = this.item_4;
    
        let count_4 = 0;

        item_4.fadeOut('one-by-one-anticlockwise', 0, 1, 0);    
        addEventListener('segment-dots-array-faded-out', function(e) {
            if((e.detail.array === item_4) && (count_4 < 9)) {
                e.detail.array.fadeIn('together', 0, 1, 0);
                count_4++;
            }
            else {
                dispatchEvent(new CustomEvent("item-animation-finished", { detail : { item : item_4 } }));
            }
        });
        addEventListener('segment-dots-array-faded-in', function(e) {
            if((e.detail.array === item_4) && (count_4 < 9)) {
                e.detail.array.fadeOut('together', 0, 1, 0);
                count_4++;
            }
            else {
                dispatchEvent(new CustomEvent("item-animation-finished", { detail : { item : item_4 } }));
            }
        });    
        
        let item_5 = this.item_5;
    
        item_5.disappear('one-by-one-anticlockwise', 0, 'from-center', 9, 0);
        addEventListener('segment-scale-disappeared', function(e) {
            if(e.detail.scale === item_5) {
                e.detail.scale.appear('together', 0, 'to-center', 2, 2);
            }
        });
        addEventListener('segment-scale-appeared', function(e) {
            if(e.detail.scale === item_5) {
                dispatchEvent(new CustomEvent("item-animation-finished", { detail : { item : item_5 } }));
            }
        });
    }
};
    
PlainColor.prototype.checkAnimatedItems = function(item) {
    if(this.items.indexOf(item) < 0) {
        return;
    }
    else {    
        if(this.animated_items.indexOf(item) < 0) {
            this.animated_items.push(item);
        }

        let animated = true;
        let arr = this;

        this.items.forEach(function(i) {
            if(arr.animated_items.indexOf(i) < 0) {
                //if((i.id === 'item-1') || (i.id === 'item-2') || (i.id === 'item-4') || (i.id === 'item-5')) { 
                if((i.id === 'item-4') || (i.id === 'item-5')){
                    console.log(i.id);
                    animated = false;
                }
            }
        });    
        
        if(animated) {
            this.animated_items = [];
            this.in_progress = false;
            dispatchEvent(new CustomEvent("plain-color-animation-finished", { detail : { array : this } }));
        }
    }
};