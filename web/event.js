/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var processTask = null;
var flowTask = null;
var saveTask = null;
var saveFlag = false;

function EventListener(element, delay) {
    this.flag = 0;
    var self = this;
    element.mousedown(function () {
        self.timeout = setTimeout(function () {
            clearTimeout(self.timeout);
            self.flag = 2;
        }, delay);
    });

    element.mouseup(function () {
        clearTimeout(self.timeout);
        if (self.flag > 0) {
            self.flag = 0;
        } else {
            self.flag = 1;
        }
    });

    element.mouseout(function () {
        clearTimeout(self.timeout);
        self.flag = 0;
    });

    EventListener.prototype.isClicked = function () {
        return this.flag === 1;
    };

    EventListener.prototype.isLongPressed = function () {
        return this.flag === 2;
    };

    EventListener.prototype.clear = function () {
        this.flag = 0;
    };

}


function refreshProcess() {
    for (var i = 0; i < 3; i++) {
        tankProcess[i].refreshOpenRatio();
        tankProcess[i].refreshLiquid();
    }
    if (processTask !== null) {
        clearTimeout(processTask);
    }
    processTask = setTimeout("refreshProcess()", DT * 1000);
}

function refreshFlowImages() {
    for (var i = 0; i < 4; i++) {
        flow[i].refreshFlowImage();
    }
    if (flowTask !== null) {
        clearTimeout(flowTask);
    }
    flowTask = setTimeout("refreshFlowImages()", 20);
}

function powerEvent(element) {
    if (isStarted) {
        element.src = "images/head_off.png";
        flow[0].value = 0;
    } else {
        element.src = "images/head_on.png";
        flow[0].value = inputV * INPUT_K;
    }
    isStarted ^= 1;
}

function autoEvent(element) {
    autoFlag ^= 1;
    if (autoFlag) {
        element.innerHTML = "切换手动";
        alert("自动模式！");
    } else {
        element.innerHTML = "切换自动";
        alert("手动模式！");
    }
}

function speedEvent(opt) {
    if (opt) {
        inputV += 1;
    } else {
        inputV -= 1;
    }
    inputV = limit(inputV, 0, INPUT_V_MAX);
    if (isStarted) {
        flow[0].value = inputV * INPUT_K;
    }
    var ratio = inputV / INPUT_V_MAX * 100;
    document.getElementById("speed").innerHTML = "speed: " + ratio.toFixed(1) + " %";
}

function saveEvent(element) {
    saveFlag ^= 1;
    if (saveFlag) {
        element.innerHTML = "停止记录";
        var jsonObj = {};
        jsonObj.id = "start";
        $.ajax({
            type: "post",
            dataType: "text",
            url: "Process", //servlet地址     
            data: jsonObj,
            success: function (msg) {
                alert(msg);
            },
            error: function (data) {
                alert('异常');
            }
        });
        saveTask = setTimeout("saveMessage()", 5000);
    } else {
        element.innerHTML = "开始记录";
    }
}

function saveMessage() {
    if (!saveFlag) {
        clearTimeout(saveTask);
        return;
    }
    var jsonObj = {};
    jsonObj.id = "save";
    var str = "";
    for (var i = 0; i < 3; i++) {
        str += tankProcess[i].liquidRatio.toFixed(1) + " ";
    }
    jsonObj.liquid = str;

    $.ajax({
        type: "post",
        dataType: "text",
        url: "Process", //servlet地址     
        data: jsonObj,
        success: function (msg) {
        },
        error: function (data) {
            alert('异常');
        }
    });
    saveTask = setTimeout("saveMessage()", 5000);
}

function dispEvent() {
    var jsonObj = {};
    jsonObj.id = "disp";

    $.ajax({
        type: "post",
        dataType: "text",
        url: "Process", //servlet地址     
        data: jsonObj,
        success: function (msg) {
        },
        error: function (data) {
            alert('异常');
        }
    });
}

