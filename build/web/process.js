/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var isStarted = false;
var autoFlag = true; //自动手动切换标志
var flow = new Array(4);
var tankProcess = new Array(3);
var inputV = 6; //水泵输入电压(V)

var INPUT_V_MAX = 12; //最大输入电压
var INPUT_K = 0.0001; //流量系数
var VALVE_S = 0.002; //阀门横截面积 m^2
var JAR_A = 0.15; //罐子横截面积 m^2
//根据托里拆利公式,流出速度v=√(2gh)
//出水量Q=u*sv=u*s√(2gh)=ku√h  k=s√(2g)
var FLOW_K = VALVE_S * Math.sqrt(2 * 9.8);
var H_MAX = 0.3; //液位高度最大值(m)
var DT = 0.05; //控制周期


function TankProcess(idx) {
    this.idx = idx;
    this.openRatio = 0;//开度
    this.liquidHeight = 0;
    this.liquidRatio = 0;//液位百分比

    var $tank = $("#tank" + idx);
    this.decEvent = new EventListener($tank.find(".dec"), 500);
    this.incEvent = new EventListener($tank.find(".inc"), 500);
    this.$openRatio = $tank.find(".open-ratio");
    this.$liquid = $tank.find(".liquid");


    this.pid = new PID(50, DT, 10, 1, 0);
    this.pid.setIntegralSeparation(10);

    var $pidParams = new Array(3);
    var self = this;
    for (var i = 0; i < 3; i++) {
        $pidParams[i] = $tank.find(".param" + i);
        $pidParams[i].attr("value", this.pid.params[i]);
        (function (i) {
            $pidParams[i].blur(function () {
                if (isNumber(this.value))
                    self.pid.params[i] = this.value;
                this.value = self.pid.params[i];
            });
        })(i);
    }
}

TankProcess.prototype.refreshOpenRatio = function () {
    if (this.decEvent.isClicked()) {
        this.decEvent.clear();
        this.openRatio -= 1;
    } else if (this.decEvent.isLongPressed()) {
        this.openRatio -= 2;
    }
    if (this.incEvent.isClicked()) {
        this.incEvent.clear();
        this.openRatio += 1;
    } else if (this.incEvent.isLongPressed()) {
        this.openRatio += 2;
    }
    if (autoFlag) {
        this.openRatio = -this.pid.calculate(this.liquidRatio);//正反馈
    }
    this.openRatio = limit(this.openRatio, 0, 100);

    this.$openRatio.attr("data-open", "开度 " + this.openRatio.toFixed(1));
    this.$openRatio.append("<style>#tank" + this.idx + " .open-ratio::before{width:" + (this.openRatio * 0.4) + "px}</style>");
};

TankProcess.prototype.refreshLiquid = function () {
    flow[this.idx + 1].value = this.openRatio / 100 * FLOW_K * Math.sqrt(this.liquidHeight); //Q=uk√h
    this.liquidHeight += (flow[this.idx].value - flow[this.idx + 1].value) / JAR_A * DT;
    this.liquidHeight = limit(this.liquidHeight, 0, H_MAX);
    this.liquidRatio = this.liquidHeight / H_MAX * 100;

    var rgb;
    if (this.liquidRatio < 40) {
        rgb = "0,170,0";
    } else if (this.liquidRatio < 80) {
        rgb = "170,170,0";
    } else {
        rgb = "170,0,0";
    }
    this.$liquid.css("background-color", "rgba(" + rgb + ",0.5)");
    this.$liquid.append("<style>#tank" + this.idx + " .liquid::before{background-color:" + "rgba(" + rgb + ",1)}</style>");
    this.$liquid.css("height", (this.liquidRatio * 2 + 40) + "px");
    this.$liquid.attr("data-liquid", "液位 " + this.liquidRatio.toFixed(1));
};


function PID(setpoint, dt, kp, ki, kd) {
    this.params = [kp, ki, kd];
    this.setpoint = setpoint;
    this.dt = dt;
    this.lastError = 0;
    this.integral = 0;
    this.output = 0;
    this.integralLimit = 0;
    this.outputLimit = 0;
    this.integralRange = 0;

    PID.prototype.calculate = function (processValue) {
        var error = this.setpoint - processValue;
        if (this.integralRange !== 0 && Math.abs(error) > this.integralRange) {
            this.integralCoef = 0;
        } else {
            this.integralCoef = 1;
            this.integral += error * this.dt;
        }
        if (this.integralLimit !== 0) {
            this.integral = limit(this.integral, -this.integralLimit, this.integralLimit); //积分限幅	
        }
        this.output = this.params[0] * error + this.integralCoef * this.params[1] * this.integral
                + this.params[2] * (error - this.lastError) / this.dt;
        if (this.outputLimit !== 0) {
            this.output = limit(this.output, -this.outputLimit, this.outputLimit); //输出限幅
        }
        this.lastError = error;
        return this.output;
    };

    PID.prototype.setLimit = function (integralLimit, outputLimit) {
        this.integralLimit = integralLimit;
        this.outputLimit = outputLimit;
    };

    PID.prototype.setIntegralSeparation = function (val) {
        this.integralRange = val;
    };
}

function isNumber(val) {
    return /^(\-|\+)?\d+(\.\d+)?$/.exec(val);
}

function limit(a, min, max) {
    if (a < min)
        return min;
    if (a > max)
        return max;
    return a;
}

function initVar() {
    var i;
    for (i = 0; i < 4; i++) {
        flow[i] = new Flow(i);
    }
    for (i = 0; i < 3; i++) {
        tankProcess[i] = new TankProcess(i);
    }
}

