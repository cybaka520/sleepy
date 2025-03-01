// ==UserScript==
// @name         页面标题上报脚本
// @namespace    sleepy
// @version      2025.3.1
// @description  获取页面标题并上报到指定 API (包括浏览器名称) / 请在安装脚本后手动编辑下面的配置
// @author       nuym
// @author       wyf9
// @match        *://*/*
// @grant        GM_xmlhttpRequest
// @connect      sleepy.wyf9.top
// @homepage     https://github.com/wyf9/sleepy
// @source       https://github.com/wyf9/sleepy/raw/refs/heads/main/client/browser-script.user.js
// ==/UserScript==

(function () {
    'use strict';

    // 参数配置开始
    const API_URL = 'https://sleepy.wyf9.top/device/set'; // 你的完整 API 地址，以 `/device/set` 结尾
    const SECRET = '绝对猜不出来的密码'; // 你的 secret
    const ID = '114514'; // 你的设备 id
    const SHOW_NAME = ''; // 你的设备名称，如为空值即使用浏览器名称
    const NO_TITLE = 'url'; // 定义页面没有标题时的返回，url: 页面的完整 url 地址 / host: 域名 / 其他: 对应值
    // [!!!] 请将第 10 行 `@connect` 处的域名改为你的服务域名，如此处就应为 sleepy.wyf9.top
    // 参数配置结束

    // 替换了 secret 的日志
    function log(msg) {
        console.log(msg.replace(SECRET, '[REPLACED]'));
    }
    function error(msg) {
        console.error(msg.replace(SECRET, '[REPLACED]'));
    }

    // 获取浏览器名称
    function getBrowserName() {
        // return "MyBrowser"; // 如需自定义浏览器名称可取消注释本行
        var userAgent = navigator.userAgent;

        if (userAgent.includes("Edg")) {
            return "Edge";
        } else if (userAgent.includes("Chrome") && !userAgent.includes("Edg")) {
            return "Chrome";
        } else if (userAgent.includes("Firefox")) {
            return "Firefox";
        } else if (userAgent.includes("Safari") && !userAgent.includes("Chrome")) {
            return "Safari";
        } else if (userAgent.includes("Opera") || userAgent.includes("OPR")) {
            return "Opera";
        } else {
            return "Unknown Browser"; // 欢迎 Issue / PR 添加
        }
    }

    // 发送请求函数
    function sendRequest(using) {
        // 获取当前网页
        var appName;
        if (document.title == '') { // 如没有标题
            if (NO_TITLE == 'url') {
                appName = window.location.href; // 使用 url
            } else if (NO_TITLE == 'host') {
                appName = window.location.hostname; // 使用域名
            } else {
                appName = NO_TITLE; // 使用自定义提示
            }
        } else {
            appName = document.title;
        }
        log(`App name: ${appName}`);

        if (!SHOW_NAME) {
            // 如 SHOW_NAME 为空，使用浏览器名称
            SHOW_NAME = getBrowserName();
        }

        // 构造 API URL
        var apiUrl = `${API_URL}?secret=${encodeURIComponent(SECRET)}&id=${encodeURIComponent(ID)}&show_name=${encodeURIComponent(SHOW_NAME)}&using=${using}&app_name=${encodeURIComponent(appName)}`;

        // 使用 GM_xmlhttpRequest 发送请求 (还是先用 get 吧)
        GM_xmlhttpRequest({
            method: 'GET',
            url: apiUrl,
            onload: (response) => {
                log(`API Response: ${response.responseText}`);
                if (response.status === 200) {
                    log(`API 请求成功: ${apiUrl}`);
                } else {
                    error(`API 请求失败: ${response.status} ${response.statusText}`);
                }
            },
            onerror: (errInfo) => {
                error(`API 请求出错: ${errInfo}`);
            }
        });
    }

    // 页面加载完成时发送请求
    window.addEventListener('DOMContentLoaded', () => {
        sendRequest(using = true);
    });
    // 监听页面聚焦事件发送请求
    window.addEventListener('focus', () => {
        sendRequest(using = true);
    });
    // 监听页面关闭事件发送请求
    window.addEventListener('unload', function() {
        sendRequest(using = false);
    });    
})();
