var defaultImgURL = "http://r.photo.store.qq.com/psb?/V13L31cV41nzmD/GfPRm3GCjN8x1R4wjYALzt3151eNhdbPskiZ4VntyFc!/r/dPQAAAAAAAAA";
var defaultOpacity = 0.1;
var opacity = 0.1;
var interval_time = 3;
var orderIndex = 0;       //顺序更换图片时图片地址在数组中的位置
// 图片输入框内容组对象
inputs = new Object();
// 图片对象
input = new Object();

jQuery(document).ready(function ($) {

    var task1 = "";
    var node = document.createElement("div");
    document.querySelector('body').append(node);
    var a = document.getElementsByTagName('div');
    var code = a[a.length - 1];
    code.setAttribute("id", "bac");
    var bac = document.getElementById("bac");
    bac.style.position = "fixed";
    bac.style.width = '100%';
    bac.style.height = '100%';
    bac.style.magin = 'auto';
    bac.style.bottom = 0;
    bac.style.pointerEvents = "none";
    bac.style.zIndex = "99999";

    // 读取本地设置数据
    function getStorage() {
        chrome.storage.sync.get({
            imgURL_storage: "", imgsURL_storage: [], opacity_storage: 0.1, interval_time_storage: 1,
            inputs_count_storage: 1, replacement_mode_storage: "order", inputs_storage: inputs,
        }, function (items) {
            // 输入框对象的key组
            let keys = Object.keys(items.inputs_storage);
            if (keys.length > 0) {
                inputs = items.inputs_storage;
            }
            if (items.opacity_storage != "" && items.opacity_storage != null) {
                opacity = items.opacity_storage;
            }
            if (items.interval_time_storage != "" && items.interval_time_storage != null) {
                interval_time = items.interval_time_storage;
            }
            replacement_mode = items.replacement_mode_storage;
            setBackground();
        });
    }

    // 获取设置数据
    getStorage();

    // 修改背景
    function setBackground() {
        // var img = imgsURL;
        var interval_time_true = 3;
        let keys = Object.keys(inputs);

        // 输入数据(更换壁纸时间)合法性检测
        if (interval_time > 0) {
            interval_time_true = interval_time * 60000;
        } else {
            interval_time_true = 3 * 60000;
        }
        //输入数据（透明度）合法性检测 
        if (opacity >= 0 && opacity <= 1) {
            bac.style.opacity = opacity;
        }
        else {
            bac.style.opacity = defaultOpacity;
        }
        /** 判断应该设置单张背景还是多张轮播*/
        //只有一个图片地址
        if (keys.length === 1) {
            setBackgroundImage(inputs[keys[0]].url);
        }
        else {
            changeBackgroundImage();
            //定时（interval_time_true分钟）更换背景图片
            task1 = setInterval(function () {
                changeBackgroundImage();
                if (replacement_mode === "order") {
                    orderIndex++;
                    if (orderIndex == keys.length) {
                        orderIndex = 0;
                    }
                }
            }, interval_time_true);
        }
    }

    // 更换一张壁纸(顺序or随机)
    function changeBackgroundImage() {
        var Iimg = "";
        var serial_number = "";
        let keys = Object.keys(inputs);
        // 随机更换
        if (replacement_mode === "random") {
            serial_number = Math.floor(Math.random() * keys.length);
        }
        // 顺序更换
        else {
            serial_number = orderIndex;
        }
        Iimg = inputs[keys[serial_number]].url;
        setBackgroundImage(Iimg);
    }

    // 设置单张背景
    function setBackgroundImage(imageURL) {
        bac.style.background = "url(" + imageURL + ")";
        bac.style.backgroundPosition = "50% 50%";
        bac.style.backgroundRepeat = "no-repeat";
    }


    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        if (request.cmd === 'reload') {
            if (task1 !== "") {
                clearInterval(task1);
            }
            getStorage();
        }
        if (request.cmd === 'warn') {
            alert(request.message);
        }
        // sendResponse('我收到了你的消息！');
    });

});


