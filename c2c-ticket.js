//dreambigforum.webds.net/ticket/widget/c2c.js
(function(window, document) {
    'use strict';
    const URL_WIDGET = "//dreambigforum.webds.net/ticket/widget/";
    window.WEBDS_C2C || (window.WEBDS_C2C = {});
    WEBDS_C2C.info = {
        "_name"   :"App от WebDS",
        "_version":"1",
        "_author" :"Roman WEBDS TEAM info@webds.net",
        "_desc"   :"Интеграция https://tickets.karabas.com с CRM"
    };
    var RequestData = {};
    var App = {
        /**
         * Добавление фрейм-виджета
         */
        addIframe :function(){
            $('iframe#app_c2c').remove();
            $('body').append('<iframe hidden class = "hidden"  id="app_c2c" src="'+URL_WIDGET+'"></iframe>');
        },
        /**
         * Отслеживание запросов, сбор данных
         */
        TrackEventRequests : function(){
            var orderdata = {};
            $.ajaxPrefilter(function( options, originalOptions, jqXHR ){
                var originalSuccess = options.success;
                var originalPromise = jqXHR.promise()
                    .then(function(original){
                        //console.log("options",options);
                        return original;
                    })
                    .done(function(){
                        jqXHR.done();
                        //console.log("done");
                    })
                    .fail(function(){
                        jqXHR.fail();
                        //console.log("fail");
                    });

                options.success = function (ResponseData) {
                    console.log("success",options.url);


                    switch(options.url){
                        case '/GetTicketWidgetCartCommand.cmd':{

                            orderdata = {};
                            orderdata['currencyCode']    =  ResponseData.currencyCode;
                            orderdata['orderClearPrice'] =  ResponseData.orderClearPrice;
                            orderdata['items']           =  ResponseData.items;
                            //orderdata['rsign_dt']        =  ResponseData.rsign_dt;
                            //orderdata['rsign']           =  ResponseData.rsign;
                            RequestData['orderdata']        = orderdata;
                            // App.Send2Iframe();
                        }break;
                        case '/ClientLoginCommand.cmd':{
                            try {
                                RequestData['id']        = ResponseData.ClientProfile.id;
                                RequestData['email']     = ResponseData.ClientProfile.email;
                                RequestData['phone']     = ResponseData.ClientProfile.phone;
                                RequestData['fullname']  = ResponseData.ClientProfile.fullName;
                                RequestData['firstname'] = ResponseData.ClientProfile.name;
                                RequestData['lastname']  = ResponseData.ClientProfile.lastName;

                            }catch (e) {
                                console.log("!!! ClientLoginCommand");
                            }

                            // App.Send2Iframe();
                        }break;
                        case '/SavePaymentOptions.cmd':{
                            RequestData['payment_name']= ResponseData.name;
                            RequestData['payment_desc']= ResponseData.description;
                            RequestData['payment_comission_amount']= ResponseData.comissionAmount;
                            //	App.Send2Iframe();
                        }break;
                        case '/GetPaymentFormCommand.cmd':{
                            //console.log("GetPaymentFormCommand",ResponseData);
                            var order = $("div.order-page-sub-header h1").text();
                            RequestData['order_number'] = parseInt(order.replace(/\D+/g,""));
                            RequestData['payment_code']= ResponseData.code;
                            // App.SendC2C();
                            App.Send2Iframe();
                        }break;
                        default:{}
                    }
                    // console.log(JSON.stringify(RequestData));
                    try {
                        if ((typeof (originalSuccess) != 'undefined') && (App.isFunction(originalSuccess))) {
                            originalSuccess(ResponseData);
                        }
                    } catch (e) {}
                };
            });

        },
        /**
         * Отправка данных
         * @constructor
         */
        Send2Iframe:function(){
            var	iframe = document.getElementById('app_c2c');
            var JsonRequestData = JSON.stringify(RequestData);
            iframe.contentWindow.postMessage(JsonRequestData, '*');
        },
        utf8_to_b64 : function (str) {
            return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
                function toSolidBytes(match, p1) {
                    return String.fromCharCode('0x' + p1);
                }));
        },
        b64_to_utf8: function (str) {
            return decodeURIComponent(atob(str).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
        },
    };
    WEBDS_C2C['app'] = App;
    WEBDS_C2C['app'].addIframe();
    WEBDS_C2C['app'].TrackEventRequests();
})(this, document);
