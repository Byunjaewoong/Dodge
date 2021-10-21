
stopwatch = document.createElement('p');
stopwatch.id = "stopwatch";
document.body.appendChild(stopwatch);


canvas = document.createElement('canvas');
canvas.id = "canvas";
canvas.width = document.body.clientWidth * window.devicePixelRatio;
canvas.height = document.body.clientHeight * window.devicePixelRatio;
document.body.appendChild(canvas);
ctx = canvas.getContext("2d");


head_img = new Image();
head_img.src = "./whiterock.PNG";
var pixel_x = 92/3;
var pixel_y = 140/3;

//헤드의 현재 위치, 범위 정보 리턴하여 각 파티클에 닿는지 확인하는 루틴필요
//마우스 방향과 현재 위치를 기준으로 벡터 생성하여 속도 정보 혹은 이동 위치 계산필요
//투사체, 헤드의 현재위치는 픽셀값이 아닌 비율로 증가하여야 함

//1번 함수 마우스의 위치를 입력받아, 현재위치와의 차이 벡터를 계산하여 진행방향으로 헤드 그림을 그리고 헤드의 피격범위까지 반환
//2번 함수 투사체 랜덤 생성 - canvas 바깥에서 시작될 위치 생성, 속도 생성, 투사체 크기 생성 및 반환 -> 투사체 스택에 집어 넣는다
//3번 함수 피격 판정 - 포문을 돌면서 프레임마다 헤드의 범위가 투사체에 닿았는지 확인

var globalID = 0;
var outer = Math.sqrt(Math.pow(canvas.width,2)+Math.pow(canvas.height,2));

//head info  px
var head_speed = 7;
var head_size = 92/6;
var head_x = canvas.width/2;
var head_y = canvas.height/2;

//시작 x, y,크기,dx,dy
var bullet_linear = [[0,0,0,0,0]];


var mx = 0;
var my = 0;

var clock = 0;
var gen_counter = 0;
function clocking(){
    clock +=1;
    gen_counter +=1;
}

function sleepy_head(mx,my,speed,head_size){

    var d = distance_P_P(mx,my,head_x,head_y);

    var vx = (mx - head_x)/d;
    var vy = (my - head_y)/d;

    var dx = vx*speed;
    var dy = vy*speed;

    head_x = head_x + dx;
    head_y = head_y + dy;

    ctx.drawImage(head_img, head_x-(pixel_x/2), head_y-(pixel_y/2), pixel_x, pixel_y);

    return {
        x0: head_x,
        y0: head_y,
        r: head_size
    };
}

function gen_linear(){

    //r = Math.random() < 0.5 ?  2*Math.random()+0.1: -2*Math.random()+0.1;

    var outline = Math.sqrt(Math.pow(canvas.width,2)+Math.pow(canvas.height,2));
    var radian = Math.random()*2*Math.PI;

    var radian_end = (Math.random()+0.5)*Math.PI+radian;

    var x = outline*Math.cos(radian)+canvas.width/2;
    var y = outline*Math.sin(radian)+canvas.height/2;

    var x1 = outline*Math.cos(radian_end)+canvas.width/2;
    var y1 = outline*Math.sin(radian_end)+canvas.height/2;


    var d = distance_P_P(x,y,x1,y1);

    var speed = outline / 200;

    var dx = (x1 - x)/d*speed;
    var dy = (y1 - y)/d*speed;

    bullet_linear.push([x,y,10,dx,dy]);

}

function b_linear(a){
    var x = a[0];
    var y = a[1];
    var r = a[2];
    var dx = a[3];
    var dy = a[4];

    x = x + dx;
    y = y + dy;

    ctx.fillStyle = '#999999';
    ctx.beginPath();
    ctx.arc(
        x, //* ratio_w,
        y , //* ratio_h,
        r,
        0 * Math.PI, 2 * Math.PI
    );
    ctx.fill();

    hit_scan(x,y,r);

    a[0] = a[0] + dx;
    a[1] = a[1] + dy;

}

function hit_scan(bullet_x,bullet_y,bullet_r){
    var d = distance_P_P(head_x,head_y,bullet_x,bullet_y,bullet_r);
    if(d < bullet_r + head_size){
        alert("YOU DIED  score : " + clock);

        cancelAnimationFrame(globalID);
    }
    //window.location.reload();
}

function distance_P_P(x1,y1,x2,y2){
    var d = Math.sqrt(Math.pow(x1-x2,2)+Math.pow(y1-y2,2));
    return d;
}

class App {
    constructor(canvas){
        this.canvas = canvas;
        this.ctx = this.canvas.getContext('2d');
    
        this.pixelRatio = window.devicePixelRatio > 1 ? 2 : 1;
    
        window.addEventListener('resize', this.resize.bind(this), false);
        this.resize();
        this.timer = 0;

        globalID = window.requestAnimationFrame(this.animate.bind(this));

    }

    resize(){
        this.stageWidth = document.body.clientWidth;
        this.stageHeight = document.body.clientHeight;
    
        this.canvas.width = this.stageWidth * this.pixelRatio;
        this.canvas.height = this.stageHeight * this.pixelRatio;
        this.ctx.scale(this.pixelRatio, this.pixelRatio);
    }

    animate() {
        window.requestAnimationFrame(this.animate.bind(this));
        this.ctx.clearRect(0,0,this.stageWidth,this.stageHeight);
        document.getElementById('stopwatch').innerHTML = clock;
        clocking();

        console.log(bullet_linear);
        
        if(gen_counter/3>1){
            gen_linear();
            gen_linear();
            gen_counter = 0;
        }

        window.addEventListener("mousemove", (e) => {
            mx = e.clientX;
            my = e.clientY;
        });

        var head_info = sleepy_head(mx,my,head_speed,head_size);
        
        for(var i=1;i<bullet_linear.length;i++){
            b_linear(bullet_linear[i]);
            if(distance_P_P(bullet_linear[i][0],bullet_linear[i][1],canvas.width/2,canvas.height/2)>outer+100){
                bullet_linear.splice((i-1),1);
            }
        }


        
    }    
}

window.onload = () => {
    new App(canvas);
}