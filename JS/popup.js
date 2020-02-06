// 默认图片地址
var defaultImgURL = "http://r.photo.store.qq.com/psb?/V13L31cV41nzmD/GfPRm3GCjN8x1R4wjYALzt3151eNhdbPskiZ4VntyFc!/r/dPQAAAAAAAAA";
// 默认透明度
var defaultOpacity = 0.1;
// 透明度
var opacity = 0.1;
// 默认图片切换间隔时间
var defaultInterval_time = 3;
// 图片切换间隔时间
var interval_time = 3;
// 图片切换方式
let replacement_mode = "order";
// 默认图片切换方式
let default_replacement_mode = "order";
// 图片输入框的数量
let inputs_count = 1;
// 图片输入框内容组对象
inputs = new Object();
// 图片对象
input = new Object();

input.url = defaultImgURL;
inputs.image0 = input;

// backgroundPage
var bg = chrome.extension.getBackgroundPage();

/**给ContentScript发消息 */
function sendMessageToContentScript(message) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, message, function (response) {
            // if (callback) callback(response);
        });
    });
}

/**多语言支持 */
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

/**将输入框数量存入localstorage */
function setInputsCountToLocalStroage(inputs_count_storage) {
    chrome.storage.sync.set({
        inputs_count_storage: inputs_count_storage
    },
        function () {
        });
}

/**删除输入框 */
function deleteEvent(e) {
    if (Object.keys(inputs).length === 1) {
        sendMessageToContentScript({ cmd: "warn", message: chrome.i18n.getMessage("delete_tip") });
        // alert(chrome.i18n.getMessage("delete_tip"));
    }
    else {
        let key = e.path[1].id;
        e.path[2].removeChild(e.path[1]);
        inputs_count--;
        delete inputs[e.path[1].id];
        setInputsCountToLocalStroage(inputs_count);
        chrome.storage.sync.set({
            inputs_storage: inputs
        },
            function () {
            });
    }
}

jQuery(document).ready(function ($) {
    /**读取本地设置数据 */
    function getStorage() {
        chrome.storage.sync.get({
            opacity_storage: 0.1, interval_time_storage: 1,
            inputs_count_storage: 1, replacement_mode_storage: "order", inputs_storage: inputs,
        }, function (items) {

            // 输入框对象的key组
            let keys = Object.keys(items.inputs_storage);
            if (keys.length > 0) {
                inputs = items.inputs_storage;
            }
            if (items.inputs_count_storage >= 1) {
                inputs_count = items.inputs_count_storage;
            }
            if (items.opacity_storage != "" && items.opacity_storage != null) {
                opacity = items.opacity_storage;
            }
            if (items.interval_time_storage != "" && items.interval_time_storage != null) {
                interval_time = items.interval_time_storage;
            }
            $("#setting_opacity").val(opacity);
            $("#interval_time").val(interval_time);

            // 图片更换模式
            let nodes = document.getElementsByName("replacement_mode");
            let nodeLength = nodes.length;
            for (let i = 0; i < nodeLength; i++) {
                if (nodes[i].value == items.replacement_mode_storage) {
                    nodes[i].checked = true;
                }
            }
            document.getElementsByName("replacement_mode").innerHTML = nodes;

            // 更新图片输入框
            for (let i = 0; i < keys.length; i++) {
                let element = document.createElement("div");
                element.innerHTML = "<input type='text' value='" + inputs[keys[i]].url + "'><img src='/IMAGES/sub.png' alt='delete' class='delete'>"
                element.className = "image";
                element.setAttribute("id", "image" + i);
                document.getElementById("images").insertBefore(element, document.getElementById("add"));
                element.lastChild.addEventListener("click", function (e) {
                    deleteEvent(e);
                });
            }
        });

    }

    // 获取设置数据
    getStorage();

    // 根据浏览器语言修改显示语言
    localizeHtmlPage();

    /**增加一个地址输入框 */
    $("#add").on("click", function () {
        inputs_count++;
        let element = document.createElement("div");
        element.innerHTML = "<input type='text'><img src='/IMAGES/sub.png' alt='delete' class='delete'>"
        element.className = "image";
        element.setAttribute("id", "image" + inputs_count - 1);
        document.getElementById("images").insertBefore(element, document.getElementById("add"));
        element.lastChild.addEventListener("click", function (e) {
            deleteEvent(e);
        });
        setInputsCountToLocalStroage(inputs_count);
    });

    /**保存设置数据 */
    $("#setting_btn").on("click", function () {

        let hasEmpty = false;

        var opacity_storage = $("#setting_opacity").val();
        var interval_time_storage = $("#interval_time").val();
        let replacement_mode_storage = "";
        let nodes = document.getElementsByName("replacement_mode");
        let ChildLength = nodes.length;
        // 判断图片更换方式
        for (let i = 0; i < ChildLength; i++) {
            if (nodes[i].checked === true) {
                replacement_mode_storage = nodes[i].value;
            }
        }

        // 所有图片输入框的信息
        let imagesInfo = document.getElementsByClassName("image");
        for (let i = 0; i < imagesInfo.length; i++) {
            if (imagesInfo[i].firstChild.value == "" || imagesInfo[i].firstChild.value == null) {
                alert("有输入框为空，请输入内容或删除多余输入框");
                hasEmpty = true;
                break;
            }
            else {
                input_local = new Object();
                input_local.url = imagesInfo[i].firstChild.value;
                inputs["image" + i] = input_local;
                delete input_local;
            }
        }
        // 没有空输入框，保存数据
        if (hasEmpty === false) {
            // 将设置数据保存到本地
            chrome.storage.sync.set({
                opacity_storage: opacity_storage,
                interval_time_storage: interval_time_storage,
                replacement_mode_storage: replacement_mode_storage,
                inputs_storage: inputs,
            },
                function () {
                    sendMessageToContentScript({ cmd: "reload" });
                });
        }
        else {
            input = [];
        }
    });

    /**恢复默认设置 */
    $("#default_setting_btn").on("click", function () {
        // 清空inputs的属性
        Object.keys(inputs).forEach(key => {
            delete inputs[key];
        });
        // 输入框恢复默认
        document.getElementById("images").innerHTML = "<img src='/IMAGES/add.png' alt='add' id='add'>";
        // 初始化inputs
        inputs.image0 = input;
        // 将设置数据保存到本地
        chrome.storage.sync.set({
            inputs_storage: inputs,
            inputs_count_storage: 1,
            opacity_storage: defaultOpacity,
            interval_time_storage: defaultInterval_time
        },
            function () {
                getStorage();
                // 向changeBackground.js发送消息以是新设置得以应用
                sendMessageToContentScript({ cmd: "reload" });
            });
    });

    /** 跳转到教程页面 */
    $("#guide").on("click", function () {
        bg.goToGuidePage();
    });
});

