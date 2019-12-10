var imgURL = "";
var defaultImgURL = "http://r.photo.store.qq.com/psb?/V13L31cV41nzmD/GfPRm3GCjN8x1R4wjYALzt3151eNhdbPskiZ4VntyFc!/r/dPQAAAAAAAAA";
var imgsURL = [];
var defaultImgsURL = [];
var defaultOpacity = 0.1;
var opacity = 0.1;
var defaultInterval_time = 3;
var interval_time = 3;

var bg = chrome.extension.getBackgroundPage();

// 给ContentScript发消息
function sendMessageToContentScript(message) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, message, function (response) {
            // if (callback) callback(response);
        });
    });
}

// 多语言支持
function localizeHtmlPage() {
    var objects = document.getElementsByTagName('html');
    for (var j = 0; j < objects.length; j++) {
        var obj = objects[j];

        var valStrH = obj.innerHTML.toString();
        var valNewH = valStrH.replace(/__MSG_(\w+)__/g, function (match, v1) {
            return v1 ? chrome.i18n.getMessage(v1) : "";
        });

        if (valNewH != valStrH) {
            obj.innerHTML = valNewH;
        }
    }
}

jQuery(document).ready(function ($) {
    // 读取本地设置数据
    function getStorage() {
        chrome.storage.sync.get({
            imgURL_storage: "", imgsURL_storage: defaultImgsURL, opacity_storage: defaultOpacity, interval_time_storage: defaultInterval_time
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
            $("#image").val(imgURL);
            if (items.imgsURL_storage != "" && items.imgsURL_storage != null) {
                imgsURL = items.imgsURL_storage;
                $("#images").val(imgsURL.join(","));
            }
            else {
                imgsURL = "";
                $("#images").val(imgsURL);
            }
            $("#setting_opacity").val(opacity);
            $("#interval_time").val(interval_time);
        });
    }

    // 获取设置数据
    getStorage();

    // 根据浏览器语言修改显示语言
    localizeHtmlPage();


    // 保存设置数据
    $("#setting_btn").on("click", function () {
        var imgURL_storage = $("#image").val();
        var imgsURL_storage = $("#images").val();
        var opacity_storage = $("#setting_opacity").val();
        var interval_time_storage = $("#interval_time").val();
        // 将设置数据保存到本地
        chrome.storage.sync.set({
            imgURL_storage: imgURL_storage,
            imgsURL_storage: imgsURL_storage.split(","),
            opacity_storage: opacity_storage,
            interval_time_storage: interval_time_storage
        },
            function () {
                getStorage();
                // changeBackground.js发送消息以是新设置得以应用
                sendMessageToContentScript({ cmd: "reload" });
            });
    });

    // 恢复默认设置
    $("#default_setting_btn").on("click", function () {
        $("#image").val("");
        // 将设置数据保存到本地
        chrome.storage.sync.set({
            imgURL_storage: 0,
            imgsURL_storage: 0,
            opacity_storage: defaultOpacity,
            interval_time_storage: defaultInterval_time
        },
            function () {
                getStorage();
                // 向changeBackground.js发送消息以是新设置得以应用
                sendMessageToContentScript({ cmd: "reload" });
            });
    });

    // 跳转到教程页面
    $("#guide").on("click", function () {
        bg.goToGuidePage();
    });
});

