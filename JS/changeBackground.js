var imgURL = "";
var defaultImgURL = "http://r.photo.store.qq.com/psb?/V13L31cV41nzmD/GfPRm3GCjN8x1R4wjYALzt3151eNhdbPskiZ4VntyFc!/r/dPQAAAAAAAAA";
var imgsURL = [];
var defaultOpacity = 0.1;
var opacity = 0.1;
var interval_time = 3;

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
            imgURL_storage: "", imgsURL_storage: [], opacity_storage: 0.1, interval_time_storage: 1
        }, function (items) {
            if (items.imgURL_storage != 0) {
                imgURL = items.imgURL_storage;
            }
            else {
                imgURL = "";
            }
            if (items.opacity_storage != "" && items.opacity_storage != null) {
                opacity = items.opacity_storage;
            }
            if (items.interval_time_storage != "" && items.interval_time_storage != null) {
                interval_time = items.interval_time_storage;
            }
            if (items.imgsURL_storage != "" && items.imgsURL_storage != null && items.imgsURL_storage != 0) {
                imgsURL = items.imgsURL_storage;
            }
            else {
                imgsURL = [];
            }
            setBackground();
        });
    }

    // 获取设置数据
    getStorage();

    // 修改背景
    function setBackground() {
        var img = imgsURL;
        var interval_time_true = 3;
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
        // 判断应该设置单张背景还是多张轮播
        if (imgURL === "" || imgURL === null) {
            if (img.length === 0) {
                setBackgroundImage(defaultImgURL);
            }
            else {
                changeBackgroundImage();
                //定时（interval_time_true分钟）更换背景图片
                task1 = setInterval(function () {
                    changeBackgroundImage();
                }, interval_time_true);
            }
        }
        else {
            setBackgroundImage(imgURL);
        }

        // 随机更换一张壁纸
        function changeBackgroundImage() {
            var serial_number = Math.floor(Math.random() * img.length);
            var Iimg = img[serial_number];
            //右下角背景
            bac.style.background = "url(" + Iimg + ")";
            bac.style.backgroundPosition = "50% 50%";
            bac.style.backgroundRepeat = "no-repeat";
        }

        // 设置单张背景
        function setBackgroundImage(imageURL) {
            bac.style.background = "url(" + imageURL + ")";
            bac.style.backgroundPosition = "50% 50%";
            bac.style.backgroundRepeat = "no-repeat";
        }

    }

  
    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        if (request.cmd === 'reload') {
            if (task1 != "") {
                clearInterval(task1);
            }
            getStorage();
        }
        // if (request.cmd === 'guide') {
        //     goToGuidePage();
        // }
        // sendResponse('我收到了你的消息！');
    });

});


