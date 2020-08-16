function Palette(canvasElementId) {
    this.id = "Palette";
    this.canvas = document.getElementById(canvasElementId);
    this.context = this.canvas.getContext('2d');
    let context = this.context;
    context.width = this.canvas.width;
    context.height = this.canvas.height;
   
    function Point(px, py) { this.x = px; this.y = py; }
    this.c = new Point(context.width/2, context.height/2); // Центр кругового интерфейса
    
    this.items = [];
    
    this.in_progress = false;
    
    this.item_1 = new SegmentArray('arr-1', context, this.c.x, this.c.y, 30, 20, -90, 360);
    this.item_1.segments_count = 24;
    this.item_1.segment_angle = 14;
    this.item_1.full_thickness = true;
    this.item_1.background = 'rgba(255, 255, 255, 0)';
    this.item_1.border_color = '';
    this.item_1.segment_border_color = 'none';
    this.item_1.build();
    
    this.item_2 = this.item_1.instanceCopy();
    this.item_2.r_in = 51;
    this.item_2.init_angle = -87;
    this.item_2.build();
    
    this.item_3 = this.item_1.instanceCopy();
    this.item_3.r_in = 72;
    this.item_3.init_angle = -84;
    this.item_3.build();
    
    this.item_4 = this.item_1.instanceCopy();
    this.item_4.r_in = 93;
    this.item_4.init_angle = -81;
    this.item_4.build();
    
    this.item_5 = this.item_1.instanceCopy();
    this.item_5.r_in = 114;
    this.item_5.init_angle = -78;
    this.item_5.build();
    
    this.item_6 = this.item_1.instanceCopy();
    this.item_6.r_in = 135;
    this.item_6.init_angle = -75;
    this.item_6.build();
    
    this.item_7 = this.item_1.instanceCopy();
    this.item_7.r_in = 156;
    this.item_7.init_angle = -72;
    this.item_7.build();
    
    this.items.push(this.item_1);
    this.items.push(this.item_2);
    this.items.push(this.item_3);
    this.items.push(this.item_4);
    this.items.push(this.item_5);
    this.items.push(this.item_6);
    this.items.push(this.item_7);
                
    let items_array = this.items;
    let draw_func = this.draw.bind(this);
      
    addEventListener('segment-changed', function(e) {
        if(items_array.indexOf(e.detail.segment)) { draw_func(); } });
    addEventListener('segment-array-changed', function(e) {
        if(items_array.indexOf(e.detail.level)) { draw_func(); } });
    
    this.setColors();
    
    this.draw();
};

Palette.prototype.setColors = function() {
    let items = this.items;
    
    let colors = [ '#E60012', '#EB6100', '#F39800', '#FCC800', '#FFF100', '#CFDB00',
        '#8FC31F', '#22AC38', '#009944', '#009B6B', '#009E96', '#00A0C1',
        '#00A0E9', '#0086D1', '#0068B7', '#00479D', '#1D2088', '#601986',
        '#920783', '#BE0081', '#E4007F', '#E5006A', '#E5004F', '#E60033'];
        
    for(let i=0; i < items.length; i++) {
        let item = items[i];

        for(let j=0; j < item.segments.length; j++) {
            let hex = colors[j];
            let rgba = rgbaStrFromHex(hex);
            let obj = rgbaStrToObj(rgba);
            let k = (items.length + 0.5 * i) / items.length; // brighness reduction factor
            obj.r *= k;
            obj.g *= k;
            obj.b *= k;
            
            item.segments[j].background = rgbaObjToStr(obj);
            item.segments[j].calc();           
        }
    }
};

Palette.prototype.draw = function() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.item_1.draw();
    this.item_2.draw();
    this.item_3.draw();
    this.item_4.draw();
    this.item_5.draw();
    this.item_6.draw();
    this.item_7.draw();
};