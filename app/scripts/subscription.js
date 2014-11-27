/**
 * Created by roninx on 17/05/14.
 */
'use strict';

var Subscription = (function () {
    var sock = new SockJS('http://ec2-54-72-181-219.eu-west-1.compute.amazonaws.com:8080/nfo');

    sock.onopen = function () {
        console.log('sockjs: open');
        createSubscriptionInternal('EURUSD');
        createSubscriptionInternal('GBPUSD');
        createSubscriptionInternal('USDJPY');
        createSubscriptionInternal('USDCHF');
    };

    sock.onmessage = function (e) {
//        console.log('sockjs data: ', e.data);
        var tick = JSON.parse(e.data);
        var selectedElem = $(jq(tick.ccyPair + '.SPOT'));
        selectedElem.html(tick.value);
    };

    sock.onclose = function () {
        console.log('sockjs: close');
    };

    sock.onerror = function (e) {
        console.log('sockjs: error: ' + e);
    };

    function createSubscriptionInternal(ccyPairVal) {
        var subscriptionString = JSON.stringify({ccyPair: ccyPairVal});
        console.log('sock: sending subscription json string: ', ccyPairVal);
        sock.send(subscriptionString);
    }

// this functions adds escape sequences to the ids
// see http://learn.jquery.com/using-jquery-core/faq/how-do-i-select-an-element-by-an-id-that-has-characters-used-in-css-notation/
    function jq(myid) {
        return '#' + myid.replace(/(:|\.|\[|\])/g, '\\$1');
    }

    return {
        createSubscription: function (ccyPairVal) {
            createSubscriptionInternal(ccyPairVal);
        }
//        ,
//        init : init
    };

})();
