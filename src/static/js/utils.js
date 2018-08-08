layui.define(['jquery', 'layer'], function (exports) {
    const $ = layui.jquery
        , layer = layui.layer;

    let exports_obj = {};

    exports_obj.containChinaChar = function (str) {
        if (str.match(/[\u4e00-\u9fa5]/g) || str.match(/[\uff00-\uffff]/g)) {//中文 或 全角
            return true;
        }

        return false;
    };

    exports_obj.node_module_path = require('electron').remote.require('path');

    exports_obj.config = require('electron').remote.require(exports_obj.node_module_path.join(__dirname, '../../config'));

    exports_obj.getQueryString = function (name) {
        const reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
        const r = window.location.search.substr(1).match(reg);
        if (r != null) return unescape(r[2]);
        return null;
    };

    exports_obj.layer_msg = function (id, data) {
        const offset = $('#' + id).offset();
        const pt = offset.top;//获取弹出层的top
        const pl = offset.left;//获取弹出层的left
        const ph = $('#' + id).height();//获取弹出层的高度
        const pw = $('#' + id).width();//获取弹出层的宽度
        const index = layer.msg(data.msg, {id: 'layer-msg-id'});//给layer弹出层定义id
        const pph = Number($('#layer-msg-id').height()) + 24;//layer弹出层的高度，layer默认的padding-top:12px;padding-bottom:12px;所以此处加上24
        const ppw = Number($('#layer-msg-id').width()) + 50;//layer弹出层的宽度，layer默认的padding-left:25px;padding-right:25px;所以此处加上50
        $('.layui-layer-msg').css('display', 'none');
        const ppt = (pt + ph / 2 - pph / 2 - 30) + 'px';
        const ppl = (pl + pw / 2 - ppw / 2) + 'px';
        layer.msg(index, {content: data.msg, offset: [data.height || ppt, ppl]});
    };

    exports_obj.get_screen_width_height = function () {
        const screenSize = require('electron').remote.screen.getPrimaryDisplay().workAreaSize;
        return screenSize;
    };

    exports_obj.createAndDownloadFile = function (fileName, content) {
        const aTag = document.createElement('a');
        const blob = new Blob([content]);
        aTag.download = fileName;
        aTag.href = URL.createObjectURL(blob);
        aTag.click();
        URL.revokeObjectURL(blob);
    };

    exports('utils', Object.assign({}, exports_obj));
});
