/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

function Flow(i) {
    this.value = 0;//流量值
    this.referPos = 0;//图像绘制参考坐标
    this.timeTick = 0;
    this.lenTick = 0;
    this.$flow = $("#flow" + i);
    this.$right = this.$flow.find(".right");
    this.$down = this.$flow.find(".down");
    this.$up = this.$flow.find(".up");
}

Flow.prototype.updateFlowImage = function () {
    this.$flow.attr("data-flow", "流量 " + (this.value * Math.pow(10, 6)).toFixed(0) + " cm³/s");
    this.$right.css("background-positionX", this.referPos + "px");
    this.$down.css("background-positionY", this.referPos + "px");
    this.$up.css("background-positionY", -this.referPos + "px");
    if (++this.referPos >= 1000)
        this.referPos = 0;
};

Flow.prototype.isTimeSatisfied = function () {
    if (++this.timeTick >= this.lenTick) {
        this.timeTick = 0;
        var interval = Math.round(0.001 / this.value);
        this.lenTick = interval > 100 ? 100 : interval;
        return true;
    }
    return false;
};

Flow.prototype.refreshFlowImage = function () {
    if (this.value > 0) {
        if (this.isTimeSatisfied())
            this.updateFlowImage();//更新图像
        this.$flow.css("visibility", "visible");
    } else {
        this.$flow.css("visibility", "hidden");
    }
};
