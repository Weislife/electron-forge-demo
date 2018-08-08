layui.define(['jquery', 'layer', 'flow', 'form', 'utils'], function (exports) {
    const $ = layui.jquery
        , layer = layui.layer
        , flow = layui.flow
        , form = layui.form
        , utils = layui.utils;

    let cpLock = true;
    $('.wallet_webview #transfer_dialog input[name="transfer_dialog_amount"]').off().on({
        compositionstart: function () {//中文输入开始
            cpLock = false;
        },
        compositionend: function () {//中文输入结束
            cpLock = true;
        },
        input: function () {//input框中的值发生变化
            if (cpLock) {
                this.value = this.value.replace(/[^0-9.]/g, '');
            }

            if ($.trim(this.value).indexOf('.') > -1 && ($.trim(this.value).length - $.trim(this.value).indexOf('.')) > 5) {
                this.value = this.value.substring(0, $.trim(this.value).indexOf('.') + 5);
            }
        }
    });

    $('.wallet_webview #transfer').click(function () {
        $('.wallet_webview #transfer_dialog input[type="text"]').val('');
        $('.wallet_webview #transfer_dialog input[type="password"]').val('');

        const transfer_dialog = layer.open({
            id: 'transfer_dialog_id',
            type: 1,
            title: '转账',
            shade: 0,
            area: ['550px', '400px'],
            offset: [(utils.get_screen_width_height().height - 60 - 55 * 2 - 400) / 2 + 60 + 'px',
                (utils.get_screen_width_height().width - 300 - 550) / 2 + 300 + 'px'],
            content: $('#transfer_dialog')
        });

        //转账
        form.on('submit(transfer_filter)', async function (data) {
            const to_account = $.trim(data.field.transfer_dialog_to_account);
            const amount = $.trim(data.field.transfer_dialog_amount);
            const wallet_password = $.trim(data.field.transfer_dialog_wallet_password);

            if (!to_account) {
                utils.layer_msg('transfer_dialog_id', {msg: '必填项不能为空'});
                $('input[name="transfer_dialog_to_account"]').focus();
                return false;
            }

            if (!amount) {
                utils.layer_msg('transfer_dialog_id', {msg: '必填项不能为空'});
                $('input[name="transfer_dialog_amount"]').focus();
                return false;
            }

            if (!wallet_password) {
                utils.layer_msg('transfer_dialog_id', {msg: '必填项不能为空'});
                $('input[name="transfer_dialog_wallet_password"]').focus();
                return false;
            }

            const account_reg = /(^[a-z1-5.]{1,11}[a-z1-5]$)|(^[a-z1-5.]{12}[a-j1-5]$)/;
            if (!account_reg.test(to_account)) {
                utils.layer_msg('transfer_dialog_id', {msg: '收款人钱包账户格式不对'});
                $('input[name="transfer_dialog_to_account"]').focus();
                return false;
            }

            const my_account = $('.wallet_webview #wallet_account_name').text();
            if (to_account === my_account) {
                utils.layer_msg('transfer_dialog_id', {msg: '不能转账给自己'});
                return false;
            }

            const reg = /^[+]{0,1}(\d+)$|^[+]{0,1}(\d+\.\d+)$/;
            if (!reg.test(amount) || amount === 0) {
                utils.layer_msg('transfer_dialog_id', {msg: '转账金额必须为正数'});
                return false;
            }

            if (amount.toString().indexOf('.') > -1) {
                const arr = amount.toString().split('.');
                if (arr[1].length > 4) {
                    $('input[name="transfer_dialog_amount"]').focus();
                    utils.layer_msg('transfer_dialog_id', {msg: '转账金额小数点后最多只能有4位小数'});
                    return false;
                }
            }

            utils.layer_msg('transfer_dialog_id', {msg: '转账成功'});
            setTimeout(function () {
                layer.close(transfer_dialog);
                $('.wallet_webview #transfer_dialog input[type="text"]').val('');
                $('.wallet_webview #transfer_dialog input[type="password"]').val('');
            }, 3000);

            return false;
        });
    });

});
