var dataSheets = [
    [
        ['1d', 0.0735, '1'],
        ['1w', 0.0735, '1'],
        ['2w', 0.0735, '1'],
        ['1m', 0.08, '1'],
        ['2m', 0.0735, '1'],
        ['3m', 0.0735, '1'],
        ['6m', 0.0735, '0'],
        ['9m', 0.0735, '0'],
        ['12m', 0.0735, '0']

    ],
    [
        ['1x4', 0.0935, '1'],
        ['2x5', 0.0931, '1'],
        ['3x6', 0.0932, '1'],
        ['4x7', 0.0933, '1'],
        ['5x8', 0.0937, '1'],
        ['6x9', 0.0933, '1'],
        ['9x12', 0.0933, '1'],
        ['12x15', 0.0933, '1'],
        ['15x18', 0.0433, '1'],
        ['18x21', 0.0833, '1'],
        ['21x24', 0.0733, '0']

    ],
    [
        ['1y', 0.074, '0'],
        ['18m', 0.074, '0'],
        ['2y', 0.074, '1'],
        ['3y', 0.08, '1'],
        ['4y', 0.076, '1'],
        ['5y', 0.078, '1'],
        ['7y', 0.08, '1'],
        ['10y', 0.082, '1'],
        ['12y', 0.084, '1'],
        ['15y', 0.086, '1'],
        ['20y', 0.088, '1'],
        ['25y', 0.088, '1'],
        ['30y', 0.09, '1']
    ]
];

var dataHeaders = [
    ['Cash', 'EndDate', 'Rate', 'Use'],
    ['FRA', 'StartDate', 'Rate', 'Use'],
    ['Swaps', 'EndDate', 'Rate', 'Use']
];

var masterObjName = 'ZAR';

var defaultHeaderSheetData = [
    ['Type','Collection','',''],
    ['Name','ZAR','',''],
    ['Type','IRCurve','',''],
    ['Name','3mJIBAR','',''],
    ['Currency','ZAR','',''],
    ['Index','3mJIBAR','',''],
    ['Date','41751','',''],
    ['BuildMethod','Zeros','',''],
    ['InterpMethod','Linear','','']
];

var _QCSERVER = 'ec2-54-72-181-219.eu-west-1.compute.amazonaws.com/QuantCloud';

var _QCCREATEOBJECTENDPOINT = 'http://' + _QCSERVER + '/REST/QCCreateObject';
var _QCCALCOBJECTENDPOINT = 'ws://' + _QCSERVER + '/WS/QCCalcObject';
var _QCCALCOBJECT_ZARSPOTSWAP_REQUESTID = 30;
var _QCCALCOBJECT_ZARFORWARDS_REQUESTID = 31;

var _QCCALCOBJECT_REQUESTZARCURVE_VALUES_ID = 10;
var _QCCALCOBJECT_REQUESTZARFX_VALUES_ID = 11;
var _QCCALCOBJECT_UPDATEZARCURVE_OBJECT_ID = 12;

var createObjId = masterObjName;


var zarcurve_instr = [
    '1d',
    '1w',
    '1m',
    '2m',
    '3m',
    '6m',
    '9m',
    '12m',
    '1x4',
    '2x5',
    '3x6',
    '4x7',
    '5x8',
    '6x9',
    '9x12',
    '12x15',
    '15x18',
    '18x21',
    '21x24',
    '1y',
    '18m',
    '2y',
    '3y',
    '4y',
    '5y',
    '7y',
    '10y',
    '12y',
    '15y',
    '20y',
    '25y',
    '30y'
];

var zarforwards_instr = [
    '0d',
    '1y',
    '2y',
    '3y',
    '4y',
    '5y',
    '6y',
    '7y',
    '8y',
    '9y',
    '10y',
    '12y',
    '15y'
];

$(document).ready(function () {
    'use strict';
    setupWs();

    addOverrideInputEventHandlers();
});

function setupWs() {
    var ws = new WebSocket(_QCCALCOBJECTENDPOINT);

    ws.onopen = function () {
        console.log('Websocket open, sending requests...');

        var swap = createCalcSwapReq(masterObjName);
        console.log('Swap send over socket: ' + swap);
        ws.send(swap);

        var fwd = createCalcForwardReq(masterObjName);
        console.log('Fwd send over socket: ' + fwd);
        ws.send(fwd);

        var fwdMatrix = createForwardMatrixReq(masterObjName);
        console.log('Fwd matrix send over socket: ' + fwdMatrix);
        ws.send(fwdMatrix);

        var values = createInitialValuesReq(masterObjName);
        console.log('Initial values request send over socket: ' + values);
        ws.send(values);
    };

    ws.onclose = function () {
        console.log('Websocket closed');
    };

    ws.onerror = function (evt) {
        console.log('Websocket error: ' + evt.message);
    };

    ws.onmessage = function (evt) {
        var data = evt.data;
        console.log('Data received via WebSocket: ' + JSON.stringify(data));

        var servermsg = data;
        var json;
        if (servermsg.charAt(0) === '{') {
            json = $.parseJSON(servermsg);

            $.each(json, function (key, value) {
                if (value === 'updateobject') {
                    if (key === masterObjName) {
                        zarCalcObject(ws);
                    }
                } else {
                    // update rates displayed in table
                    if (value !== '') {
                        $(jq(key)).text(formatFloatToPercent(value));
                    }
                    // update the dataArray
                    setDataSheetValue(key.substring(key.indexOf('.') + 1, key.length), value)
                }
            });
        } else {
            // strip out the request id
            var index = servermsg.indexOf(',');
            var requestid = parseInt(servermsg.substring(1, index));
            servermsg = '[' + servermsg.substring(index + 1);

            json = $.parseJSON(servermsg);

            if (requestid === _QCCALCOBJECT_REQUESTZARCURVE_VALUES_ID)
                zarDisplayCurve(json);
            else if (requestid === _QCCALCOBJECT_UPDATEZARCURVE_OBJECT_ID)
                zarDisplayForwards(json);
            else if (requestid === _QCCALCOBJECT_ZARSPOTSWAP_REQUESTID)
                renderSpotSwapChart(json);
            else if (requestid === _QCCALCOBJECT_ZARFORWARDS_REQUESTID)
                renderFwdChart(json);
        }
    };
}

function formatFloatToPercent(number) {
    return (number * 100).toFixed(3);
}

function formatPercentToFloat(number, digits) {
    if (!digits) {
        digits = 3;
    }
    return (number / 100).toFixed(digits);
}

function setDataSheetValue(tenor, value) {
    for (var k = 0; k < dataSheets.length; k++) {
        for (var l = 0; l < dataSheets[k].length; l++) {
            if (tenor === dataSheets[k][l][0]) {
                dataSheets[k][l][1] = value;
            }
        }
    }
}

function createForwardMatrixReq() {
    var i, j;
    var json;

    // update forward swap matrix
    json = '[' + _QCCALCOBJECT_UPDATEZARCURVE_OBJECT_ID + ',';
    for (i = 0; i < zarforwards_instr.length; i++) {
        for (j = 1; j < zarforwards_instr.length; j++) {
            json += '[\'' + masterObjName + '\',\'swap\',\'' + zarforwards_instr[i] + '\',\'' + zarforwards_instr[j] + '\']';

            if (!(j === zarforwards_instr.length - 1 && i === zarforwards_instr.length - 1))
                json += ',';
        }
    }
    json += ']';

    return json;
}

function zarCalcObject(ws) {
    var objname = createObjId;

    var calcSwapReq = createCalcSwapReq(objname);
    console.log('calc swap req over ws: ' + calcSwapReq);
    // send socket request for spot rates
    ws.send(calcSwapReq);

    var calcFwdReq = createCalcForwardReq(objname);
    console.log('calc fwd req over ws: ' + calcFwdReq);
    // send socket request for forward rates
    ws.send(calcFwdReq);

    var calcFwdMatrixReq = createForwardMatrixReq();
    console.log('calc fwd matrix req over ws: ' + calcFwdMatrixReq);
    ws.send(calcFwdMatrixReq);
}

function addOverrideInputEventHandlers() {
    $('.qc-input').each(function () {
        $(this).keydown(function (e) {
            if (e.which === 13) {
                var inputs = $(this).closest('ul').find('.qc-input');
                inputs.eq(inputs.index(this) + 1).focus();
                var data = createParameterArrayFromSourceArrays(dataSheets, dataHeaders);
                sendCreateObject(data);
            }
        });
    });
}

// this functions adds escape sequences to the ids
// see http://learn.jquery.com/using-jquery-core/faq/how-do-i-select-an-element-by-an-id-that-has-characters-used-in-css-notation/
function jq(myid) {
    return '#' + myid.replace(/(:|\.|\[|\])/g, '\\$1');
}

function sendCreateObject(data) {
    console.log('sending create obj: ' + JSON.stringify(data));
    $.post(_QCCREATEOBJECTENDPOINT, JSON.stringify(data), function (data) {
        console.log('create object response: ' + data);
        createObjId = data[1][0];
        console.log('create object id: ' + createObjId);
    }, 'json');
}


function createParameterArrayFromSourceArrays(dataArray, dataHeaderArray) {
    var data = [];
    var i, j, row;
    var productName = masterObjName;
    // add header data
    for (i = 0; i < defaultHeaderSheetData.length; i++) {
        row = defaultHeaderSheetData[i];
        data.push(row);
    }

    // add data
    for (j = 0; j < dataArray.length; j++) {
        // push header
        data.push(dataHeaderArray[j]);

        // push tenors and rates
        for (i = 0; i < dataArray[j].length; i++) {
            row = [];
            row[0] = '';
            row[1] = dataArray[j][i][0];
            row[2] = dataArray[j][i][1].toString();
            row[3] = dataArray[j][i][2];

            // check if there is an overwrite and use it
            var compositeName = jq(productName + '.' + dataArray[j][i][0]);
            var firstSibling = $(compositeName).next();
            var overwriteVal = firstSibling.find('input').val();
            if (overwriteVal) {
                console.log('overWrite ' + compositeName + ' with: ' + overwriteVal);
                row[2] = formatPercentToFloat(overwriteVal, 10);
            }
            var useIt = firstSibling.next().find('input').prop('checked');
            if (!useIt) {
                row[3] = '0';
            }
            data.push(row);
        }
    }

    return data;
}

function createCalcSwapReq(objName) {
    var swap = '[' + _QCCALCOBJECT_ZARSPOTSWAP_REQUESTID + ',';
    for (var i = 2; i < 31; i++) {
        swap += '[\'' + objName + '\',\'swap\',\'' + i + 'y\']';
        if (i < 30) {
            swap += ',';
        }
    }
    swap += ']';
    return swap;
}

function createCalcForwardReq(objName) {
    var fwd = '[' + _QCCALCOBJECT_ZARFORWARDS_REQUESTID + ',';
    for (var i = 0; i < 360; i = i + 3) {
        fwd += '[\'' + objName + '\',\'forward\',\'' + i + 'm\',\'3m\']';
        if (i < 357) {
            fwd += ',';
        }
    }
    fwd += ']';
    return fwd;
}

function createInitialValuesReq(objName) {
    var i;
    var json;

    // register live curve values
    json = '[' + _QCCALCOBJECT_REQUESTZARCURVE_VALUES_ID + ',';
    for (i = 0; i < zarcurve_instr.length; i++) {
        json += '[\'' + objName + '.' + zarcurve_instr[i] + '\' ]';

        if (i < zarcurve_instr.length - 1)
            json += ',';
    }
    json += ']';
    return json;
}

function updateValue(objectname, value) {
    switch (objectname) {
        // curve
        // forwards
        default:
            $(jq(objectname)).html(formatFloatToPercent(value));
            break;
    }
}

function renderSpotSwapChart(json) {

    var swaprates = [];
    for (var i = 0; i < json.length; i++) {
        swaprates[i] = json[i][1];
    }

    $('#firstRates').highcharts({
        title: {
            text: 'Spot Swap Rates',
            x: -20 //center
        },
        subtitle: {
            text: 'Source: QuantCloud.com',
            x: -20
        },
        yAxis: {
            title: {
                text: 'Spot Swap Rate (%)'
            },
            plotLines: [
                {
                    value: 0,
                    width: 1,
                    color: '#808080'
                }
            ]
        },
        tooltip: {
            valueSuffix: '%'
        },
        legend: {
            layout: 'vertical',
            align: 'right',
            verticalAlign: 'middle',
            borderWidth: 0
        },
        plotOptions: {
            line: {
                animation: false,
                marker: {
                    enabled: false
                }
            }
        },
        series: [
            {
                name: 'Spot Swap Rates',
                data: swaprates
            }
        ]
    });
}

function renderFwdChart(json) {
    var forwardRates = [];
    for (var i = 0; i < json.length; i++) {
        forwardRates[i] = json[i][1];
    }

    $('#thirdRates').highcharts({
        title: {
            text: '3M Forward Rates',
            x: -20 //center
        },
        subtitle: {
            text: 'Source: QuantCloud.com',
            x: -20
        },
        yAxis: {
            title: {
                text: 'Forward Rates (%)'
            },
            plotLines: [
                {
                    value: 0,
                    width: 1,
                    color: '#808080'
                }
            ]
        },
        tooltip: {
            valueSuffix: '%'
        },
        legend: {
            layout: 'vertical',
            align: 'right',
            verticalAlign: 'middle',
            borderWidth: 0
        },
        plotOptions: {
            line: {
                animation: false,
                marker: {
                    enabled: false
                }
            }
        },
        series: [
            {
                name: '3M Forward Rates',
                data: forwardRates
            }
        ]
    });
}

function zarDisplayCurve(json_rates) {
    var i;

    for (i = 0; i < json_rates.length; i++) {
        if (json_rates[i][0] === 1)
            updateValue(masterObjName + '.' + zarcurve_instr[i], json_rates[i][1]);
    }
}

// the matrix
function zarDisplayForwards(json) {
    var r, c, i;

    for (r = 0, c = 1, i = 0; i < json.length; i++) {
        if (json[i][0] === 1)
            updateValue(masterObjName + '.' + zarforwards_instr[r] + zarforwards_instr[c], json[i][1]);

        c++;
        if (c === zarforwards_instr.length) {
            r++;
            c = 1;
        }
    }
}
