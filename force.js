// const { TKGrid } = require("./astar_tk")

   const squaretable = {} 
    for (let t = 0; t < 10000000; t++) {
        squaretable[`${t}`] = Math.sqrt(t)
        if (t > 999) {
            t += 9
        }
    }
    let video_recorder 
    let recording = 0
    const gamepadAPI = {
        controller: {},
        turbo: true,
        connect: function (evt) {
            if (navigator.getGamepads()[0] != null) {
                gamepadAPI.controller = navigator.getGamepads()[0]
                gamepadAPI.turbo = true;
            } else if (navigator.getGamepads()[1] != null) {
                gamepadAPI.controller = navigator.getGamepads()[0]
                gamepadAPI.turbo = true;
            } else if (navigator.getGamepads()[2] != null) {
                gamepadAPI.controller = navigator.getGamepads()[0]
                gamepadAPI.turbo = true;
            } else if (navigator.getGamepads()[3] != null) {
                gamepadAPI.controller = navigator.getGamepads()[0]
                gamepadAPI.turbo = true;
            }
            for (let i = 0; i < gamepads.length; i++) {
                if (gamepads[i] === null) {
                    continue;
                }
                if (!gamepads[i].connected) {
                    continue;
                }
            }
        },
        disconnect: function (evt) {
            gamepadAPI.turbo = false;
            delete gamepadAPI.controller;
        },
        update: function () {
            gamepadAPI.controller = navigator.getGamepads()[0]
            gamepadAPI.buttonsCache = [];// clear the buttons cache
            for (var k = 0; k < gamepadAPI.buttonsStatus.length; k++) {// move the buttons status from the previous frame to the cache
                gamepadAPI.buttonsCache[k] = gamepadAPI.buttonsStatus[k];
            }
            gamepadAPI.buttonsStatus = [];// clear the buttons status
            var c = gamepadAPI.controller || {}; // get the gamepad object
            var pressed = [];
            if (c.buttons) {
                for (var b = 0, t = c.buttons.length; b < t; b++) {// loop through buttons and push the pressed ones to the array
                    if (c.buttons[b].pressed) {
                        pressed.push(gamepadAPI.buttons[b]);
                    }
                }
            }
            var axes = [];
            if (c.axes) {
                for (var a = 0, x = c.axes.length; a < x; a++) {// loop through axes and push their values to the array
                    axes.push(c.axes[a].toFixed(2));
                }
            }
            gamepadAPI.axesStatus = axes;// assign received values
            gamepadAPI.buttonsStatus = pressed;
            // //console.log(pressed); // return buttons for debugging purposes
            return pressed;
        },
        buttonPressed: function (button, hold) {
            var newPress = false;
            for (var i = 0, s = gamepadAPI.buttonsStatus.length; i < s; i++) {// loop through pressed buttons
                if (gamepadAPI.buttonsStatus[i] == button) {// if we found the button we're looking for...
                    newPress = true;// set the boolean variable to true
                    if (!hold) {// if we want to check the single press
                        for (var j = 0, p = gamepadAPI.buttonsCache.length; j < p; j++) {// loop through the cached states from the previous frame
                            if (gamepadAPI.buttonsCache[j] == button) { // if the button was already pressed, ignore new press
                                newPress = false;
                            }
                        }
                    }
                }
            }
            return newPress;
        },
        buttons: [
            'A', 'B', 'X', 'Y', 'LB', 'RB', 'Left-Trigger', 'Right-Trigger', 'Back', 'Start', 'Axis-Left', 'Axis-Right', 'DPad-Up', 'DPad-Down', 'DPad-Left', 'DPad-Right', "Power"
        ],
        buttonsCache: [],
        buttonsStatus: [],
        axesStatus: []
    };
    let canvas
    let canvas_context
    let keysPressed = {}
    let FLEX_engine
    let TIP_engine = {}
    TIP_engine.x = 10000
    TIP_engine.y = 10000
    let XS_engine
    let YS_engine
    class Point {
        constructor(x, y) {
            this.x = x
            this.y = y
            this.radius = 0
        }
        pointDistance(point) {
            return (new LineOP(this, point, "transparent", 0)).hypotenuse()
        }
    }
    class LineOP {
        constructor(object, target, color, width) {
            this.object = object
            this.target = target
            this.color = color
            this.width = width
        }
        squareDistance() {
            let xdif = this.object.x - this.target.x
            let ydif = this.object.y - this.target.y
            let squareDistance = (xdif * xdif) + (ydif * ydif)
            return squareDistance
        }
        hypotenuse() {
            let xdif = this.object.x - this.target.x
            let ydif = this.object.y - this.target.y
            let hypotenuse = (xdif * xdif) + (ydif * ydif)
            if (hypotenuse < 10000000 - 1) {
                if (hypotenuse > 1000) {
                    return squaretable[`${Math.round(10 * Math.round((hypotenuse * .1)))}`]
                } else {
                    return squaretable[`${Math.round(hypotenuse)}`]
                }
            } else {
                return Math.sqrt(hypotenuse)
            }
        }
        angle() {
            return Math.atan2(this.object.y - this.target.y, this.object.x - this.target.x)
        }
        draw() {
            let linewidthstorage = canvas_context.lineWidth
            canvas_context.strokeStyle = this.color
            canvas_context.lineWidth = this.width
            canvas_context.beginPath()
            canvas_context.moveTo(this.object.x, this.object.y)
            canvas_context.lineTo(this.target.x, this.target.y)
            canvas_context.stroke()
            canvas_context.lineWidth = linewidthstorage
        }
    }
    class Rectangle {
        constructor(x, y, width, height, color, fill = 1, stroke = 0, strokeWidth = 1) {
            this.x = x
            this.y = y
            this.height = height
            this.width = width
            this.color = color
            this.xmom = 0
            this.ymom = 0
            this.stroke = stroke
            this.strokeWidth = strokeWidth
            this.fill = fill
        }
        draw() {
            canvas_context.fillStyle = this.color
            canvas_context.fillRect(this.x, this.y, this.width, this.height)
        }
        move() {
            this.x += this.xmom
            this.y += this.ymom
        }
        isPointInside(point) {
            if (point.x >= this.x) {
                if (point.y >= this.y) {
                    if (point.x <= this.x + this.width) {
                        if (point.y <= this.y + this.height) {
                            return true
                        }
                    }
                }
            }
            return false
        }
        doesPerimeterTouch(point) {
            if (point.x + point.radius >= this.x) {
                if (point.y + point.radius >= this.y) {
                    if (point.x - point.radius <= this.x + this.width) {
                        if (point.y - point.radius <= this.y + this.height) {
                            return true
                        }
                    }
                }
            }
            return false
        }
    }
    class Circle {
        constructor(x, y, radius, color, xmom = 0, ymom = 0, friction = 1, reflect = 0, strokeWidth = 0, strokeColor = "transparent") {
            this.x = x
            this.y = y
            this.radius = radius
            this.color = color
            this.xmom = xmom
            this.ymom = ymom
            this.friction = friction
            this.reflect = reflect
            this.strokeWidth = strokeWidth
            this.strokeColor = strokeColor
            this.dragged = -1
        }
        draw() {
            if(this.dragged==1){
                console.log(2)
                this.x = TIP_engine.x 
                this.y  = TIP_engine.y 
                if(!room.isPointInside(this)){
                    let l = new LineOP(this,room.center)
                    let a = l.angle()
                    this.x-=(l.hypotenuse()/20)*Math.cos(a)
                    this.y-=(l.hypotenuse()/20)*Math.sin(a)
                    if(room.isPointInside(this)){
                        this.dragged*=-1
                    }
                }
            }
            canvas_context.lineWidth = 2
            canvas_context.strokeStyle = "black"
            canvas_context.beginPath();
            if (this.radius > 0) {
                canvas_context.arc(this.x, this.y, this.radius, 0, (Math.PI * 2), true)
                canvas_context.fillStyle = this.color
                canvas_context.fill()
                canvas_context.stroke();
            } else {
                //console.l\og("The circle is below a radius of 0, and has not been drawn. The circle is:", this)
            }
        }
        move() {
            if (this.reflect == 1) {
                if (this.x + this.radius > canvas.width) {
                    if (this.xmom > 0) {
                        this.xmom *= -1
                    }
                }
                if (this.y + this.radius > canvas.height) {
                    if (this.ymom > 0) {
                        this.ymom *= -1
                    }
                }
                if (this.x - this.radius < 0) {
                    if (this.xmom < 0) {
                        this.xmom *= -1
                    }
                }
                if (this.y - this.radius < 0) {
                    if (this.ymom < 0) {
                        this.ymom *= -1
                    }
                }
            }
            this.x += this.xmom
            this.y += this.ymom
        }
        unmove() {
            if (this.reflect == 1) {
                if (this.x + this.radius > canvas.width) {
                    if (this.xmom > 0) {
                        this.xmom *= -1
                    }
                }
                if (this.y + this.radius > canvas.height) {
                    if (this.ymom > 0) {
                        this.ymom *= -1
                    }
                }
                if (this.x - this.radius < 0) {
                    if (this.xmom < 0) {
                        this.xmom *= -1
                    }
                }
                if (this.y - this.radius < 0) {
                    if (this.ymom < 0) {
                        this.ymom *= -1
                    }
                }
            }
            this.x -= this.xmom
            this.y -= this.ymom
        }
        frictiveMove() {
            if (this.reflect == 1) {
                if (this.x + this.radius > canvas.width) {
                    if (this.xmom > 0) {
                        this.xmom *= -1
                    }
                }
                if (this.y + this.radius > canvas.height) {
                    if (this.ymom > 0) {
                        this.ymom *= -1
                    }
                }
                if (this.x - this.radius < 0) {
                    if (this.xmom < 0) {
                        this.xmom *= -1
                    }
                }
                if (this.y - this.radius < 0) {
                    if (this.ymom < 0) {
                        this.ymom *= -1
                    }
                }
            }
            this.x += this.xmom
            this.y += this.ymom
            this.xmom *= this.friction
            this.ymom *= this.friction
        }
        frictiveunMove() {
            if (this.reflect == 1) {
                if (this.x + this.radius > canvas.width) {
                    if (this.xmom > 0) {
                        this.xmom *= -1
                    }
                }
                if (this.y + this.radius > canvas.height) {
                    if (this.ymom > 0) {
                        this.ymom *= -1
                    }
                }
                if (this.x - this.radius < 0) {
                    if (this.xmom < 0) {
                        this.xmom *= -1
                    }
                }
                if (this.y - this.radius < 0) {
                    if (this.ymom < 0) {
                        this.ymom *= -1
                    }
                }
            }
            this.xmom /= this.friction
            this.ymom /= this.friction
            this.x -= this.xmom
            this.y -= this.ymom
        }
        isPointInside(point) {
            this.areaY = point.y - this.y
            this.areaX = point.x - this.x
            if (((this.areaX * this.areaX) + (this.areaY * this.areaY)) <= (this.radius * this.radius)) {
                return true
            }
            return false
        }
        doesPerimeterTouch(point) {
            this.areaY = point.y - this.y
            this.areaX = point.x - this.x
            if (((this.areaX * this.areaX) + (this.areaY * this.areaY)) <= ((this.radius + point.radius) * (this.radius + point.radius))) {
                return true
            }
            return false
        }
    } 
    function setUp(canvas_pass, style = "#888888") {
        canvas = canvas_pass
        canvas_context = canvas.getContext('2d');
        canvas.style.background = style
        window.setInterval(function () {
            main()
        }, 1)
        document.addEventListener('keydown', (event) => {
            // if(event.key  == ' '){
                event.preventDefault()
            // }
            keysPressed[event.key] = true; //adds key to list of pressed
        });
        document.addEventListener('keyup', (event) => {
            delete keysPressed[event.key]; //for removing key from list of pressed
        });
        
        let holdTarget = null;
let holdTimeout = null;
const HOLD_DELAY = 300; // ms to count as a "hold"

window.addEventListener('pointerdown', e => {
    FLEX_engine = canvas.getBoundingClientRect();
    XS_engine = e.clientX - FLEX_engine.left;
    YS_engine = e.clientY - FLEX_engine.top;
    TIP_engine.x = XS_engine - offset.x;
    TIP_engine.y = YS_engine;
    TIP_engine.body = TIP_engine;

    room.check(TIP_engine);
    let l = new LineOP(TIP_engine, TIP_engine);
    let min = 99999999;
    let index = -1;
    for (let t = 0; t < nodes.length; t++) {
        l.target = nodes[t].cap;
        let h = l.hypotenuse();
        if (h <= min && h <= nodes[t].offset.radius) {
            index = t;
            min = h;
        }
    }

    if (index > -1) {
        movedMouse = 1;

        // Reset all node audio
        for (let t = 0; t < nodes.length; t++) {
            nodes[t].content.message.volume = 0;
            nodes[t].content.message.pause();
            nodes[t].content.message.currentTime = 0;
        }

        // Start hold timer
        holdTarget = nodes[index];
        holdTimeout = setTimeout(() => {
            // Trigger addingto on hold
            addingto(holdTarget);
            holdTarget = null; // reset
        }, HOLD_DELAY);
    }
});

window.addEventListener('pointerup', e => {
    if (holdTimeout) {
        clearTimeout(holdTimeout);
        holdTimeout = null;

        // If pointer was released before HOLD_DELAY → treat as quick tap
        if (holdTarget) {
            if (pausedex !== nodes.indexOf(holdTarget)) {
                holdTarget.content.message.volume = 1;
                holdTarget.content.message.play();
                holdTarget.touched = 1;
            }
            pausedex = nodes.indexOf(holdTarget);
            holdTarget = null;
        }
    }
});



        window.addEventListener('pointermove', continued_stimuli);

        window.addEventListener('pointerup', e => {
            //for upclick actions
        })
        function continued_stimuli(e) {
            FLEX_engine = canvas.getBoundingClientRect();
            let ft = new Point(TIP_engine.x, TIP_engine.y)
            XS_engine = e.clientX - FLEX_engine.left;
            YS_engine = e.clientY - FLEX_engine.top;
            TIP_engine.x = XS_engine-offset.x
            TIP_engine.y = YS_engine
            TIP_engine.body = TIP_engine
            let l = new LineOP(ft,TIP_engine)
            if(l.hypotenuse() >1){
            movedMouse = 1
            }
            if(l.hypotenuse() >10){
                startmouse = 5
            }
            if(l.hypotenuse() >50){
                startmouse = 40
            }
            //for moving mouse actions
        }
    }

    Number.prototype.between = function (a, b, inclusive) {
        var min = Math.min(a, b),
            max = Math.max(a, b);
        return inclusive ? this >= min && this <= max : this > min && this < max;
    }

    let setup_canvas = document.getElementById('canvas') //getting canvas from document
    let offcanvas = document.getElementById('offcanvas') //getting canvas from document

    let off_context =  offcanvas.getContext('2d');
    setUp(setup_canvas) // setting up canvas refrences, starting timer. 

    function getRandomColor() { // random color
        var letters = '0123456789ABCDEF';
        var color = '#';
        for (var i = 0; i < 6; i++) {
            color += letters[(Math.floor(Math.random() * 16) + 0)];
        }
        return color;
    }
    let worldcolor = 'olive'
    nodeid = 0
    class Node {
        constructor(type, content){
            this.usercolor = '#88bb00'
            this.touched = 0
            this.ID = nodeid
            nodeid++
            this.body = {}
            this.body.type = type
            this.content = content
            this.body.x = content.x
            this.body.y = content.y
            this.offset = {}
            this.offset.x = 0
            this.offset.y = 0
            this.offset.radius = 12
            this.children = []
            this.type = type
            this.l = new LineOP(this.body, this.body)
            this.cap = {}
            this.cap.x =0 
            this.cap.y =0 
            this.layer = 0
            this.parent = {}
            this.offset.colorball = worldcolor
            this.latentColor = getRandomColor()
            this.unik=Math.random()*3

            this.childing = 0
            // this.parent.cap = new Point(this.body.x+1, this.body.y+1)
        }
        offsetting(){
            if(topnodes.includes(this)){
                return
            }
            
            this.hash = {}
            for(let t = 0;t<nodes.length;t++){
                if(this!=nodes[t]){
                    this.l.object = this.cap
                    this.l.target = nodes[t].cap

                    this.hash[t] = {}
                    this.hash[t].distance = Math.max(this.l.hypotenuse()+1,10)
                    this.hash[t].x = nodes[t].cap.x
                    this.hash[t].y = nodes[t].cap.y
                    this.hash[t].radius = nodes[t].offset.radius
                    this.hash[t].p = nodes.indexOf(nodes[t])
                }
            }

            let keys = Object.keys(this.hash)
            let force = {}
            let force2 = {}

            for(let t = 0;t<keys.length;t++){
                force.x = 0
                force.y = 0
                if(this.hash[keys[t]].distance < this.offset.radius + this.hash[keys[t]].radius){

                    force.x += (this.hash[keys[t]].x-(this.body.x+this.offset.x))/this.hash[keys[t]].distance
                    force.y  += (this.hash[keys[t]].y-(this.body.y+this.offset.y))/this.hash[keys[t]].distance


                    if(this.childos != 1){
                    this.offset.x -= force.x/.6
                    this.offset.y -= force.y/.6
                    }else{

                    this.offset.x -= force.x/5.6
                    this.offset.y -= force.y/5.6
                    }
                }else{
                    if(this.hash[keys[t]].distance < (this.offset.radius + this.hash[keys[t]].radius)*1.1){
                        if(this.hash[keys[t]].distance >( this.offset.radius + this.hash[keys[t]].radius)*.1){

                        
                    force.x += (this.hash[keys[t]].x-(this.body.x+this.offset.x))/this.hash[keys[t]].distance
                    // force.y  += (this.hash[keys[t]].y-(this.body.y+this.offset.y))/this.hash[keys[t]].distance


                    if(this.childos != 1){
                    this.offset.x += force.x/50
                    this.offset.y += force.y/50
                    }else{

                    this.offset.x += force.x/550
                    this.offset.y += force.y/550
                    }
                        }
                    }
                }
            }

            if(!(topnodes.includes(this))){
            for(let t = 0;t<keys.length;t++){
                if(this.hash[keys[t]].p == nodes.indexOf(this.parent)){

                    force2.x = 0
                    force2.y = 0
                    if(this.hash[keys[t]].distance > this.offset.radius*2){
    
                        force2.x -= (this.hash[keys[t]].x-(this.body.x+this.offset.x))/this.hash[keys[t]].distance
                        force2.y  -= (this.hash[keys[t]].y-(this.body.y+this.offset.y))/this.hash[keys[t]].distance
    
    
                        if(this.childos != 1){
                        this.offset.x -= force2.x/2
                        this.offset.y -= force2.y/2
                        }else{

                        this.offset.x -= force2.x/55
                        this.offset.y -= force2.y/55
                        }
                    }
                }
            }
        }
            // console.log(this.hash)

            if(this.touched == 0){

                // this.offset.x -= (Math.random()-.5)*1
                // this.offset.y -=  (Math.random()-.5)*1
                
            }
            // if(topnodes.includes(this)){
                    let l = ( this.cap.y-this.parent.cap.y)


                    if(this.childos != 1){

                        if(l <  Math.min(Math.max(this.offset.radius/1.4, 12),30)*(1.5+this.unik)){

                            this.offset.y+=.4*Math.sqrt(this.layer)
                        }else{
                            this.offset.y-=.2*Math.sqrt(this.layer)
    
                        }
                    }else{
                        if(l <  Math.min(Math.max(this.offset.radius/1.4, 12),30)*(1.5+this.unik)){

                            this.offset.y+=0*Math.sqrt(this.layer)
                        }else{
                            this.offset.y-=0*Math.sqrt(this.layer)
    
                        }

                    }
                    // if(l.hypotenuse() > 60){

                    //     this.offset.x -= (this.cap.x - this.parent.cap.x)/20
                    //     this.offset.y -= (this.cap.y - this.parent.cap.y)/20
                    // }

                for(let t =0 ;t<this.children.length;t++){
                    let l = this.children[t].cap.y-this.cap.y
                    if(l < Math.min(Math.max(this.offset.radius/1.4, 12),30)*(1.5+this.unik)){

                        this.children[t].offset.y+=.4*Math.sqrt(this.children[t].layer)
                    }else{

                        this.children[t].offset.y-=.2*Math.sqrt(this.children[t].layer)
                    }
                //     if(l.hypotenuse() > 60){

                //         this.children[t].offset.x -= (this.children[t].cap.x - this.cap.x)/20
                //         this.children[t].offset.y -= (this.children[t].cap.y - this.cap.y)/20
                //     }
                }

            // }else{

            // }

            // let l = new LineOP(new Point(0,0), new Point(1000,1000), "blue",1)
            // l.object = this.body
            for(let t = 0;t<this.children.length;t++){
                // this.children[t].offset.x += (Math.sign((this.body.x+this.offset.x) - (this.children[t].body.x-this.children[t].offset.x)))*2
                // this.children[t].offset.y += (Math.sign((this.body.y+this.offset.y) - (this.children[t].body.y-this.children[t].offset.y)))*2
                // l.target = new Point(this.children[t].offset.x+this.children[t].body.x, this.children[t].offset.y+this.children[t].body.y)
                // l.draw()
            }

            let radsnap = new LineOP(TIP_engine, this.cap)

            this.checker = new Circle(this.cap.x, this.cap.y, this.offset.radius, 'red')
            
        
            if(this.checker.isPointInside(TIP_engine)){
                for(let t = 0;t<nodes.length;t++){
                    nodes[t].childing = 0
                    childrenset(nodes[t])
                }
                this.childos = 0 //1 for lock mouse
                this.childing = 1
                this.offset.colorball = this.latentColor
                childrenset(this)
                made = 1
            }else{
                if(made <= -2){
                    if(this.childos ==1){
                        this.offset.x -= (this.cap.x-TIP_engine.x)/4
                        this.offset.y -= (this.cap.y-TIP_engine.y)/4
                    }
                    this.childos = 0
                    this.childing = 0
                    // this.offset.colorball = worldcolor
                    childrenset(this)

                }
                
            }
            this.offset.radius *=10
            // this.offset.radius = 12
            this.offset.radius += Math.max(30 + (10-(radsnap.hypotenuse()/1))/10,12)
            if(this.childing==1){
                this.offset.radius+=10
                this.offset.radius /=11
            }else{

            this.offset.radius /=11
            }

        }
    }

    let made = 0
    function childrenset(node){
        for(let t = 0;t<node.children.length;t++){
            console.log('s')
            node.children[t].offset.colorball = node.offset.colorball
            node.children[t].childing = node.childing
            childrenset(node.children[t])
        }
    }
    let circle = new Circle(0,0,1, worldcolor)

        function drawNode(node){
            // node.body.x -= .1
        if(node.type == 0){
            circle.x = node.body.x+node.offset.x
            circle.y = node.body.y+node.offset.y
            circle.radius = node.offset.radius
            circle.color = node.offset.colorball
            // if(keysPressed['g']){

            if(node == addingOn){
                circle.color = '#ffffff'
            }else{
                circle.color  = node.usercolor + (node.touched == 0 ? '':'a0')
            }
                circle.draw()
            // }

            if(keysPressed['f']){
            let r = new Circle(circle.x + 50, circle.y + 50, circle.radius, node.latentColor)
            r.draw()
            }
            node.cap = {}
            node.cap.x = circle.x
            node.cap.y = circle.y
            for(let t = 0;t<node.children.length;t++){
                node.children[t].layer = node.layer+1
                node.children[t].parent = node
                drawNode(node.children[t])
                // let link = new LineOP(node.cap, node.children[t].cap, "blue", 2)
                // link.draw()
            }
        }else{

        }
    }

    function drawNodeD(node){
        if(node.type == 0){
            // console.log(node)
            for(let t = 0;t<node.children.length;t++){
                let link = new LineOP(new Point(node.body.x+node.offset.x, node.body.y+node.offset.y), new Point(node.children[t].body.x+node.children[t].offset.x,node.children[t].body.y+node.children[t].offset.y), node.color, node.offset.radius/4)
                link.draw()
                drawNodeD(node.children[t])
            }
        }else{

        }
    }

    let allaud = []
    let topnodes = []
    let nodes = []
    let aud = new Audio()
    allaud.push(aud)
    aud.src = 'src.wav'
    for(let t =0 ;t<1;t++){
        let nodei = new Node(0, {'message':aud, 'x':500+Math.random(),'y':200})
        nodei.color = `rgb(${t*100}, ${0*100},${0*100})`
    allaud.push(nodei.content.message)

        topnodes.push(nodei)
        nodes.push(nodei)
        // for(let k = 0;k<2;k++){
        //     let n1 = new Node(0, {'message':'child1', 'x':500+Math.random() ,'y': 200+k} )
        // n1.color = `rgb(${t*100}, ${k*100},${0*100})`
        // nodei.children.push(n1)
        //     nodes.push(n1)

        // for(let j = 0;j<2;j++){
        //     let n3 = new Node(0, {'message':'child2', 'x':500+Math.random() ,'y':200+j})
        // n3.color = `rgb(${t*100}, ${k*100},${j*100})`
        //     n1.children.push(n3)
        //     nodes.push(n3)

        //     for(let r = 0;r<2;r++){
        //         let n4 = new Node(0, {'message':'child2', 'x':500+Math.random() ,'y':200+j})
        //         n4.color = `rgb(${r*100}, ${k*100},${j*100})`
        //         n3.children.push(n4)
        //         nodes.push(n4)



        //     for(let q = 0;q<2;q++){
        //         let n5 = new Node(0, {'message':'child2', 'x':500+Math.random() ,'y':200+j})
        //         n5.color = `rgb(${q*100}, ${k*100},${j*100})`
        //         n4.children.push(n5)
        //         nodes.push(n5)
        //     }

        //     }
    


        // }


        // }
    }

    
    // for(let t =0 ;t<1;t++){
    //     let nodei = new Node(0, {'message':'top', 'x':800+Math.random(),'y':200})
    //     nodei.color = `rgb(${t*100}, ${0*100},${0*100})`
    //     topnodes.push(nodei)
    //     nodes.push(nodei)
    //     for(let k = 0;k<1;k++){
    //         let n1 = new Node(0, {'message':'child1', 'x':800+Math.random() ,'y': 200+k} )
    //     n1.color = `rgb(${t*100}, ${k*100},${0*100})`
    //     nodei.children.push(n1)
    //         nodes.push(n1)

    //     for(let j = 0;j<1;j++){
    //         let n3 = new Node(0, {'message':'child2', 'x':800+ (j),'y':200+j})
    //     n3.color = `rgb(${t*100}, ${k*100},${j*100})`
    //         n1.children.push(n3)
    //         nodes.push(n3)

    //         for(let r = 0;r<2;r++){
    //             let n4 = new Node(0, {'message':'child2', 'x':800+ (r-2) ,'y':200+j})
    //             n4.color = `rgb(${r*100}, ${k*100},${j*100})`
    //             n3.children.push(n4)
    //             nodes.push(n4)



    //         for(let q = 0;q<3;q++){
    //             let n5 = new Node(0, {'message':'child2', 'x':800+ (q-2) ,'y':200+j})
    //             n5.color = `rgb(${q*100}, ${k*100},${j*100})`
    //             n4.children.push(n5)
    //             nodes.push(n5)
    //         }

    //         }
    


    //     }


    //     }
    // }
    function pointInPolygon(point, polygon) {
        let inside = false;
        for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
            const xi = polygon[i].x, yi = polygon[i].y;
            const xj = polygon[j].x, yj = polygon[j].y;
    
            const intersect = ((yi > point.y) !== (yj > point.y)) &&
                (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi);
    
            if (intersect) inside = !inside;
        }
        return inside;
    }
    
    class RoomShape {
        constructor(sides){

            this.dots = []
            this.outx = 0
            this.outy = 0
            this.center = new Circle(200, 500, 100, 'red')
            this.da = 0
            for(let t=0;t<12;t++){

                this.outx = Math.cos(this.da)*(40+(Math.sin(this.da*sides)*1))
                this.outy = Math.sin(this.da)*(40+(Math.sin(this.da*sides)*1))
                let point = new Circle(this.center.x + this.outx, this.center.y+this.outy, 7, 'yellow')
                point.r = 100
                point.g = 100
                point.b = 0
                this.dots.push(point)
                this.da += ((Math.PI*2)/12)
            }

            this.points = []
            this.a = 0
            for(let t = 0;t<30;t++){
                this.outx = Math.cos(this.a)*(100+(Math.sin(this.a*sides)*30))
                this.outy = Math.sin(this.a)*(100+(Math.sin(this.a*sides)*30))
                let point = new Point(this.center.x + this.outx, this.center.y+this.outy )
                this.points.push(point)
                this.a += ((Math.PI*2)/30)
            }
        }
        isPointInside(point){
            return pointInPolygon(point, this.points)
        }
        check(point){
            for(let t = 0;t<this.dots.length;t++){
                if(this.dots[t].isPointInside(point)){
                    this.dots[t].dragged*=-1
                }
            }
        }
        draw(){
            if(this.isPointInside(TIP_engine)){
                this.center.color = "olive"
            }else{
                this.center.color = "tan"

            }
            this.center.draw()
            let inll = new LineOP(this.points[0],this.points[this.points.length-1], 'white', 3)
            inll.draw()
            for(let t = 0;t<this.dots.length;t++){
                this.dots[t].color = `rgb(${this.dots[t].r}, ${this.dots[t].g}, ${this.dots[t].b})`
         
                if(Math.random() < .1){
                    let ran = (Math.random()-.5) *25
                    this.dots[t].g += ran
                    this.dots[t].r -= ran
                }
                this.dots[t].r = Math.min(Math.max(this.dots[t].r, 0),255)
                this.dots[t].g = Math.min(Math.max(this.dots[t].g, 0),255)
                this.dots[t].draw()
            }
            for(let t = 0;t<this.points.length-1;t++){
                let inll = new LineOP(this.points[t],this.points[t+1], 'white', 3)
                inll.draw()
                // let dot = new Circle(this.points[t].x, this.points[t].y, 3, 'white')
                // dot.draw()
            }
        }
    }


    let room = new RoomShape(5)
    let pix = canvas_context.getImageData(0,0,1280,720)
    let rect1 = new Rectangle(-1000, 150, 12800, 40, "green")
    function indexer(point, width) {
        const x = Math.floor(point.x);
        const y = Math.floor(point.y);
        return (y * width + x) * 4;
    }
    let movedMouse= 1
    let startmouse= 100 //100

    let offset = {}
    offset.x = 0
    let timespeed = 20
    let timeon = 0
    let addingOn = {}
    let adding = 0
    function addingto(nodeon){
        addingOn=nodeon
        adding = 1
        startRecording()
    }

    let coloron = getRandomColor()
    let pausedex = -1
   async function main() {

        off_context.clearRect(0,0,1280, 1280) 
        off_context.drawImage(canvas,offset.x, 0, 1280,1280, 0, 0,1280,1280)
        canvas_context.clearRect(-1000,-1000,canvas.width*1, canvas.height*1) 
        // timespeed--
        timeon = 0
        if(timespeed<=0){
            timespeed = 20
            canvas_context.translate(-1, 0)
            offset.x-=1
            timeon = 1
            for(let t= 0;t<nodes.length;t++){
                if(nodes[t].childing ==1){

                    if(nodes[t].childos ==1){
                        nodes[t].offset.x -= (nodes[t].cap.x-TIP_engine.x)/2
                        nodes[t].offset.y -= (nodes[t].cap.y-TIP_engine.y)/2
                    }
                }
            }
        }

        if(!(movedMouse == 1 ||startmouse >0)){
        canvas_context.clearRect(-1000,-1000,canvas.width*100, canvas.height*100) 
        canvas_context.drawImage(offcanvas,0, 0, 1280,1280, 0, 0,1280,1280)
        }else if(movedMouse == 1 ||startmouse >0){
        made--
            startmouse--
            movedMouse = 0
        canvas_context.clearRect(-1000,-1000,canvas.width*100, canvas.height*100) 
        rect1.draw()

        for(let t =0;t<topnodes.length;t++){
            drawNodeD(topnodes[t])
        }    
        for(let t =0;t<topnodes.length;t++){
            drawNode(topnodes[t])
        }       
        for(let t =0;t<nodes.length;t++){
                nodes[t].offsetting()
        }
        room.draw()
        if(keysPressed['f']){
            pix = canvas_context.getImageData(0,0,1280,1280) //total canvas pixel data
            let p = new Point(TIP_engine.x, TIP_engine.y) //pointer location for index
            let iinde = indexer(p,1280)  //location of pixel 
            let color = pix.data[iinde]  //red
            let color2 = pix.data[iinde+1] //green
            let color1 = pix.data[iinde+2]  //blue
            worldcolor = `rgb(${color},${color2},${color1})` //indexed to buttons for click check in hash
        }
    }
    if(keysPressed[' ']){

        startmouse = 10;
if(adding == 1){
  const audioResult = await stopRecording();
  if (!audioResult || !audioResult.audioBlob) {
    console.error("sendAudioObject: missing audioBlob", audioResult);
    return;
  }
  
  // Create Audio object for local playback
  const audioBlob = audioResult.audioBlob;
  const url = URL.createObjectURL(audioBlob);
  const audio = new Audio();
  audio.src = url;
  
  // Add error handling for audio
  audio.addEventListener('error', (e) => {
    console.error('Audio loading error:', e);
    URL.revokeObjectURL(url);
  });
  
  // Create node with Audio object for playback
  let nodei = new Node(0, {
    message: {},
    x: addingOn.cap.x + (Math.random() - 0.5),
    y: addingOn.cap.y + 4
  });
  
  // Store the Audio object so .play() will work
  nodei.content.message = audio;
  nodei.messageType = "audio"; // Mark as audio message
  nodei.audioResult = audioResult; // Keep original data if needed
  
  // Send to other clients
  sendAudioObject(addingOn.ID, audioResult);
   
  // Store locally
  allaud.push(audioResult);
  addingOn.children.push(nodei);
  nodes.push(nodei);
  console.log(nodei);
  addingOn = {}
}

    }
}


  let recorder;

  async function startRecording() {
    recorder = await recordAudio();
    console.log("Recording started...");
  }
  async function stopRecording() {
    const result = await recorder.stop();
    console.log("Recording stopped!");
    return result; // ✅ return the full object { audioBlob, audioUrl, audio }
  }
  
  
  // helper that creates the recording object
  async function recordAudio() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    const audioChunks = [];
  
    return new Promise((resolve) => {
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };
  
      mediaRecorder.start();
  
      resolve({
        stop: () =>
          new Promise((res) => {
            mediaRecorder.onstop = () => {
              const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
              const audioUrl = URL.createObjectURL(audioBlob);
              const audio = new Audio(audioUrl);
              res({ audioBlob, audioUrl, audio });
            };
            mediaRecorder.stop();
            stream.getTracks().forEach(track => track.stop());
          })
      });
    });
  }



  // connect to the same WS as your server
  // Dynamic WebSocket URL that works locally and on Heroku
const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
const host = window.location.host; // Gets domain:port automatically
const ws = new WebSocket(`${protocol}//${host}`);

// when connected
ws.onopen = () => {
  console.log("WS connected!");
};

// helper: send object + audio file
// helper: send object + audio file
async function sendAudioObject(id, file) {
    if (!file || !file.audioBlob) {
      console.error("sendAudioObject: missing audioBlob", file);
      return;
    }
  
    try {
      // Convert audio blob to ArrayBuffer
      const audioBuffer = await file.audioBlob.arrayBuffer();
  
      // Convert metadata JSON to Uint8Array
      const metadata = JSON.stringify({ type: "audio", ID: id, usercolor:coloron});
      const encoder = new TextEncoder();
      const metadataBytes = encoder.encode(metadata);
  
      // Create combined buffer: [metadata length (4 bytes)] + [metadata] + [audio]
      const totalLength = 4 + metadataBytes.byteLength + audioBuffer.byteLength;
      const combined = new Uint8Array(totalLength);
  
      // Write metadata length (4 bytes, little-endian)
      const view = new DataView(combined.buffer);
      view.setUint32(0, metadataBytes.byteLength, true);
  
      // Copy metadata and audio into combined buffer
      combined.set(metadataBytes, 4);
      combined.set(new Uint8Array(audioBuffer), 4 + metadataBytes.byteLength);
  
      // Send combined buffer in one call
      ws.send(combined.buffer);
  
      console.log("Audio sent successfully in one message, id:", id);
    } catch (error) {
      console.error("Failed to send audio:", error);
    }
  }
  

  socketize(ws)
  
  function socketize(ws) {
    ws.binaryType = "arraybuffer";
  
    ws.addEventListener("message", async ({ data }) => {
      try {
        if (typeof data === "string") {
          // Handle normal text messages
          const d = JSON.parse(data);
          let node = new Node(0, {
            message: {},
            x: nodes[d.ID].cap.x + (Math.random() - 0.5),
            y: nodes[d.ID].cap.y + 4
          });

          node.usercolor = d.usercolor
          node.content.message = d.audio; // This is text, not audio
          node.messageType = "text";
          nodes[d.ID].children.push(node);
          nodes.push(node);
  
        } else if (data instanceof ArrayBuffer) {
          // Handle combined metadata + audio
          const view = new DataView(data);
          const metadataLength = view.getUint32(0, true); // little-endian
          const metadataBytes = new Uint8Array(data, 4, metadataLength);
          const metadata = JSON.parse(new TextDecoder().decode(metadataBytes));
  
          const audioBytes = data.slice(4 + metadataLength);
          const audioBlob = new Blob([audioBytes], { type: "audio/webm" });
          const url = URL.createObjectURL(audioBlob);
  
          const audio = new Audio();
          audio.src = url;
  
          audio.addEventListener("error", (e) => {
            console.error("Audio loading error:", e);
            URL.revokeObjectURL(url);
          });
  
          audio.addEventListener("loadeddata", () => {
            console.log("Audio loaded and ready");
          });
  
          let node = new Node(0, {
            message: {},
            x: nodes[metadata.ID].cap.x + (Math.random() - 0.5),
            y: nodes[metadata.ID].cap.y + 4
          });
  
          node.usercolor = metadata.usercolor
          node.content.message = audio; // store playable audio
          allaud.push(node.content.message)
          nodes[metadata.ID].children.push(node);
          nodes.push(node);
        }
      } catch (e) {
        console.error("Failed to handle message:", e);
      }
    });
  }
  