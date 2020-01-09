var imgURL = "";
var defaultImgURL = "http://r.photo.store.qq.com/psb?/V13L31cV41nzmD/GfPRm3GCjN8x1R4wjYALzt3151eNhdbPskiZ4VntyFc!/r/dPQAAAAAAAAA";
var imgsURL = [];
var defaultImgsURL = [];
var defaultOpacity = 0.1;
var opacity = 0.1;
var defaultInterval_time = 3;
var interval_time = 3;
let replacement_mode = "";
let default_replacement_mode = "random";

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
            imgURL_storage: "", imgsURL_storage: [], opacity_storage: 0.1, interval_time_storage: 1, replacement_mode_storage: "order"
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

            let nodes = document.getElementsByName("replacement_mode");
            let nodeLength = nodes.length;
            for (let i = 0; i < nodeLength; i++) {
                if (nodes[i].value == items.replacement_mode_storage) {
                    nodes[i].checked = true;
                }
            }
            document.getElementsByName("replacement_mode").innerHTML = nodes;

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
        let replacement_mode_storage = "";
        let nodes = document.getElementsByName("replacement_mode");
        let ChildLength = nodes.length;
        for (let i = 0; i < ChildLength; i++) {
            if (nodes[i].checked === true) {
                replacement_mode_storage = nodes[i].value;
            }
        }
        // 将设置数据保存到本地
        chrome.storage.sync.set({
                imgURL_storage: imgURL_storage,
                imgsURL_storage: imgsURL_storage.split(","),
                opacity_storage: opacity_storage,
                interval_time_storage: interval_time_storage,
                replacement_mode_storage: replacement_mode_storage,
            },
            function () {
                // $("#success").css("display", "block");
                getStorage();
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

    //选择图片更换模式（顺序or随机）
    $("#replacement_mode").on("click",function () {
        // var replacement_mode = event.target.value;
        // console.log(event.target.value);
        // chrome.storage.sync.set({
        //         replacement_mode:replacement_mode
        //     },
        //     function () {
        //         getStorage();
        //         // 向changeBackground.js发送消息以是新设置得以应用
        //         sendMessageToContentScript({ cmd: "reload" });
        //     });
        sendMessageToContentScript({ cmd: "reload" });
    });

    // 跳转到教程页面
    $("#guide").on("click", function () {
        bg.goToGuidePage();
    });
});

