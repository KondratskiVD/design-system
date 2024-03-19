function createTest() {
    $("#submit").addClass("disabled");
    $("#save").addClass("disabled");
    var params = [[], {}, {}, {}]
    params[0].push({"name": "test_name", "default": $('#test_name').val(), "description": "Name of the test", "type": "", "action": ""})
    params[0].push({"name": "env_type", "default": $('#test_env').val(), "description": "Env type (tag for filtering)", "type": "", "action": ""})
    params[0].push({"name": "test_type", "default": $('#test_type').val(), "description": "Test type (tag for filtering)", "type": "", "action": ""})
    $("#backend_test_params").bootstrapTable('getData').forEach((param) => {
        params[0].push(param)
    })

    $("#extCard .row").slice(1,).each(function(_,item){
        var inp = $(item).find('input[type=text]')
        params[3][inp[0].value] = inp[1].value
    })
    var compile = $('#compile').is(":checked")
    event.preventDefault();

    var data = new FormData();
    git_settings = {}
    if ($('#repo').val() != '' || $('#repo_https').val() != '') {
        git_settings["repo"] = $('#repo').val() != '' ? $('#repo').val() : $('#repo_https').val()
        git_settings["protocol"] = $('#repo').val() != '' ? 'ssh' : 'https'
        git_settings["repo_user"] = $('#repo_user').val()
        git_settings["repo_pass"] = $('#repo_pass').val()
        git_settings["repo_key"] = $('#repo_key').val()
        git_settings["repo_branch"] = $('#repo_branch').val() ? $('#repo_branch').val() : $('#repo_branch_https').val()
        data.append('git', JSON.stringify(git_settings));
    } else if ($('#file')[0].files[0] != undefined) {
        data.append('file', $('#file')[0].files[0], $('#file')[0].files[0].name);
    }  else if ($('#local_file').val() != '') {
        data.append('local_path', $('#local_file').val());
    }


    data.append('name', $('#test_name').val());
    data.append('parallel', $('#backend_parallel').val());
    data.append('region', $('#backend_region option:selected').text());
    data.append('entrypoint', $('#entrypoint').val());
    data.append('runner', $('#runner').val());
    data.append('reporting', JSON.stringify({}));
    data.append('compile', compile);
    data.append('emails', $('#emails').val());
    data.append('params', JSON.stringify(params[0]));
    data.append('env_vars', JSON.stringify(params[1]));
    data.append('customization', JSON.stringify(params[2]));
    data.append('cc_env_vars', JSON.stringify(params[3]));

    $.ajax({
            url: window.url_prefix + `/api/v1/backend/${getSelectedProjectId()}`,
            data: data,
            cache: false,
            contentType: false,
            processData: false,
            method: 'POST',
            success: function(data){
                $("#createTestModal").modal('hide');
            }
        }
    );
}

function addCSVSplit(id, key="", is_header="") {
    $(`#${id}`).append(`<div class="d-flex flex-row">
    <div class="flex-fill">
        <input type="text" class="form-control form-control-alternative" placeholder="File Path" value="${key}">
    </div>
    <div class="flex-fill m-auto pl-3">
        <div class="form-check">
          <input class="form-check-input" type="checkbox" value="">
          <label class="form-check-label">Ignore first line</label>
        </div>
    </div>
    <div class="m-auto">
        <button type="button" class="btn btn-32 btn-action" onclick="removeParam(event)"><i class="fas fa-minus"></i></button>
    </div>
</div>`)
}


function addDNSOverride(id, key="", value="") {
    $(`#${id}`).append(`<div class="row mt-2">
    <div class="col-6 ml-0">
        <input type="text" class="form-control" placeholder="hostname.company.com" value="${key}">
    </div>
    <div class="col">
        <input type="text" class="form-control" placeholder="0.0.0.0" value="${value}">
    </div>
    <div class="col-xs pt-1 text-right">
        <button type="button" class="btn btn-nooutline-secondary mr-2" onclick="removeParam(event)"><i class="fas fa-minus"></i></button>
    </div>
</div>`)
}

function backendLgFormatter(value, row, index) {
    if (row.job_type === "perfmeter") {
        return '<img src="' + window.url_prefix + '/design-system/static/assets/ico/jmeter.png" width="20">'
    } else if (row.job_type === "perfgun") {
        return '<img src="' + window.url_prefix + '/design-system/static/assets/ico/gatling.png" width="20">'
    } else {
        return value
    }
}

function thresholdsActionFormatter(value, row, index) {
    var id = row['id'];
    return `
    <div class="d-flex justify-content-end">
        <button type="button" class="btn btn-24 btn-action" onclick="showEditThreshold('${id}')"><i class="fas fa-cog"></i></button>
        <button type="button" class="btn btn-24 btn-action" onclick="deleteThreshold('`+id+`')"><i class="fas fa-trash-alt"></i></button>
    </div>
    `
}

function ruleFormatter(value, row, index) {
    let comparisonMap = new Map([
        ["gte", ">="],
        ["lte", "<="],
        ["lt", "<"],
        ["gt", ">"],
        ["eq", "=="]
    ]);
    comparison = comparisonMap.get(row.comparison)
    return row.aggregation + "(" + row.target + ") " + comparison
}

function createLinkToTest(value, row, index) {
    const searchParams = new URLSearchParams(location.search);
    searchParams.set('module', 'Result');
    searchParams.set('page', 'list');
    searchParams.set('project_id', getSelectedProjectId());
    searchParams.set('result_test_id', row.id);
    searchParams.set('test_id', row.test_uid);
    return `<a class="test form-control-label" href="?${searchParams.toString()}" role="button">${row.name}</a>`
}

function backendTestActionFormatter(value, row, index) {
    return `
    <div class="d-flex justify-content-end">
        <button type="button" class="btn btn-24 btn-action" onclick="runTestModal('${row.id}')" data-toggle="tooltip" data-placement="top" title="Run Test"><i class="fas fa-play"></i></button>
        <button type="button" class="btn btn-24 btn-action" onclick="editTest('${row.id}')"><i class="fas fa-cog"></i></button>
        <button type="button" class="btn btn-24 btn-action"><i class="fas fa-share-alt"></i></button>
        <button type="button" class="btn btn-24 btn-action" onclick="deleteTests('${row.id}')"><i class="fas fa-trash-alt"></i></button>
    </div>
    `
}

function reportsStatusFormatter(value, row, index) {
    switch (value.toLowerCase()) {
        case 'error':
            return `<div style="color: var(--red)"><i class="fas fa-exclamation-circle error"></i> ${value}</div>`
        case 'failed':
            return `<div style="color: var(--red)"><i class="fas fa-exclamation-circle error"></i> ${value}</div>`
        case 'success':
            return `<div style="color: var(--green)"><i class="fas fa-exclamation-circle error"></i> ${value}</div>`
        case 'cancelled':
        case 'canceled':
            return `<div style="color: var(--gray)"><i class="fas fa-times-circle"></i> ${value}</div>`
        case 'finished':
            return `<div style="color: var(--info)"><i class="fas fa-check-circle"></i> ${value}</div>`
        case 'in progress':
            return `<div style="color: var(--basic)"><i class="fas fa-spinner fa-spin fa-secondary"></i> ${value}</div>`
        case 'post processing':
            return `<div style="color: var(--basic)"><i class="fas fa-spinner fa-spin fa-secondary"></i> ${value}</div>`
        case 'pending...':
            return `<div style="color: var(--basic)"><i class="fas fa-spinner fa-spin fa-secondary"></i> ${value}</div>`
        case 'preparing...':
            return `<div style="color: var(--basic)"><i class="fas fa-spinner fa-spin fa-secondary"></i> ${value}</div>`
        default:
            return value
    }
}

function copyToClipboard(text) {
    var dummy = document.createElement("textarea");
    document.body.appendChild(dummy);
    dummy.value = text;
    dummy.select();
    document.execCommand("copy");
    document.body.removeChild(dummy);
}


$("#tests-list").on("post-body.bs.table", function(data) {
    $('[data-toggle="tooltip"]').tooltip()
})

function cellStyle(value, row, index) {
    return {css: {"min-width": "165px"}}
}

function nameStyle(value, row, index) {
    return {css: {"max-width": "140px", "overflow": "hidden", "text-overflow": "ellipsis", "white-space": "nowrap"}}
}

function runTestModal(test_id) {
    $("#runTestModal").modal('show');
    var test_data = $('#tests-list').bootstrapTable('getRowByUniqueId', test_id);
    $('#runner_test_params').bootstrapTable('removeAll')
    test_data.params.forEach((param) => {
        $('#runner_test_params').bootstrapTable('append', param)
    })
    $('#run_test').removeAttr('onclick');
    $('#run_test').attr('onClick', `runTest("${test_data.test_uid}")`);
    $('#runner_region').val(test_data.region)
    $('#runner_parallel').val(test_data.parallel)
}

function editTest(test_id) {
    $("#createTestModal").modal('show');
    var test_data = $('#tests-list').bootstrapTable('getRowByUniqueId', test_id);
    $('#backend_test_params').bootstrapTable('removeAll')
    test_data.params.forEach((param) => {
        if (param['name'] == 'test_name') {
            $('#test_name').val(param['default']);
            $("#test_name").prop("disabled", true);
        } else if (param['name'] == 'test_type') {
            $('#test_type').val(param['default']);
        } else if (param['name'] == 'env_type') {
            $('#test_env').val(param['default']);
        } else {
            $('#backend_test_params').bootstrapTable('append', param)
        }
    })
    $('#submit').removeAttr('onclick');
    $('#submit').attr('onClick', `updateTest("${test_data.test_uid}")`);
    $('#save').removeAttr('onclick');
    $('#save').attr('onClick', `updateTest("${test_data.test_uid}")`);
    $("#testrunners").hide();
    $("#compileTests").hide();
    $("#fileUpload").hide();
    $("#entrypoint").val(test_data.entrypoint);
    $("#entrypoint").prop("disabled", true);
    $('#backend_region').val(test_data.region);
    $('#backend_parallel').val(test_data.parallel);
    if (test_data.git != null && test_data.git.hasOwnProperty("repo")) {
        $("#nav-file-tab").prop("disabled", true);
        if (test_data.git.protocol == "https") {
            $("#nav-git-tab").prop("disabled", true);
            $('a[href="#nav-git-https"]').click();
            $("#repo_https").val(test_data.git.repo);
            $("#repo_branch_https").val(test_data.git.repo_branch);
            $("#repo_user").val(test_data.git.repo_user);
            $("#repo_pass").val(test_data.git.repo_pass);
        } else {
            $("#nav-git-https-tab").prop("disabled", true);
            $('a[href="#nav-git"]').click();
            $("#repo").val(test_data.git.repo);
            $("#repo_branch").val(test_data.git.repo_branch);
            $("#repo_key").val(test_data.git.repo_key);
        }
    } else {
        $("#nav-git-tab").prop("disabled", true);
        $("#nav-git-https-tab").prop("disabled", true);
        $('a[href="#nav-file"]').click();
    }
}

function updateTest(test_id) {
    $("#submit").addClass("disabled");
    $("#save").addClass("disabled");
    var params = [[], {}, {}, {}]
    params[0].push({"name": "test_name", "default": $('#test_name').val(), "description": "Name of the test", "type": "", "action": ""})
    params[0].push({"name": "env_type", "default": $('#test_env').val(), "description": "Env type (tag for filtering)", "type": "", "action": ""})
    params[0].push({"name": "test_type", "default": $('#test_type').val(), "description": "Test type (tag for filtering)", "type": "", "action": ""})
    $("#backend_test_params").bootstrapTable('getData').forEach((param) => {
        params[0].push(param)
    })

    $("#extCard .row").slice(1,).each(function(_,item){
        var inp = $(item).find('input[type=text]')
        params[3][inp[0].value] = inp[1].value
    })

    var data = {}
    git_settings = {}
    if ($('#repo').val() != '' || $('#repo_https').val() != '') {
        git_settings["repo"] = $('#repo').val() != '' ? $('#repo').val() : $('#repo_https').val()
        git_settings["protocol"] = $('#repo').val() != '' ? 'ssh' : 'https'
        git_settings["repo_user"] = $('#repo_user').val()
        git_settings["repo_pass"] = $('#repo_pass').val()
        git_settings["repo_key"] = $('#repo_key').val()
        git_settings["repo_branch"] = $('#repo_branch').val() ? $('#repo_branch').val() : $('#repo_branch_https').val()
        data['git'] = JSON.stringify(git_settings);
    }

    data['name'] = $('#test_name').val();
    data['parallel'] = $('#backend_parallel').val();
    data['region'] = $('#backend_region option:selected').text();
    data['entrypoint'] = $('#entrypoint').val();
    data['reporting'] = JSON.stringify({});
    data['emails'] = $('#emails').val();
    data['params'] = JSON.stringify(params[0]);
    data['env_vars'] = JSON.stringify(params[1]);
    data['customization'] = JSON.stringify(params[2]);
    data['cc_env_vars'] = JSON.stringify(params[3]);

    $.ajax({
            url: window.url_prefix + `/api/v1/tests/${getSelectedProjectId()}/backend/${test_id}`,
            data: JSON.stringify(data),
            cache: false,
            contentType: 'application/json',
            method: 'PUT',
            success: function(data){
                $("#createTestModal").modal('hide');
            }
        }
    );
}

function deleteTests(id) {
    var tests = window.url_prefix + `/api/v1/backend/${getSelectedProjectId()}?`;
    if (id == undefined){
        $("#tests-list").bootstrapTable('getSelections').forEach(item => {
            tests += "id[]=" + item["id"] + "&"
        });
    } else {
        tests += `id[]=${id}&`
    }
    $.ajax({
        url: tests.substring(0, tests.length - 1),
        type: 'DELETE',
        success: function (result) {
            $("#tests-list").bootstrapTable('refresh');
        }
    });
}

function deleteReports() {
    var reports = window.url_prefix + `/api/v1/reports/${getSelectedProjectId()}?`;
    $("#results-list").bootstrapTable('getSelections').forEach(item => {
        reports += "id[]=" + item["id"] + "&"
    });
    $.ajax({
        url: reports.substring(0, reports.length - 1),
        type: 'DELETE',
        success: function (result) {
            $("#results-list").bootstrapTable('refresh');
        }
    });
}

function refreshTable(tableID) {
    $(`#${tableID}`).bootstrapTable('refresh');
}

function runTest(test_id) {
    var params = []
    $("#runner_test_params").bootstrapTable('getData').forEach((param) => {
        params.push(param)
    })
    $("#nav-test-params .test_param").each(function() {
        if ($(this).children()[0].innerText !== "" && $(this).children()[1].value !== "") {
            params[$(this).children()[0].innerText] = $(this).children()[1].value;
        }
    });
    var env_vars = {}
    $("#nav-runner-env-vars .env_vars").each(function() {
        if ($(this).children()[0].innerText !== "" && $(this).children()[1].value !== "") {
            env_vars[$(this).children()[0].innerText] = $(this).children()[1].value;
        }
    });
    var cc_env_vars = {}
    $("#nav-cc-env-vars .cc_env_vars").each(function() {
        if ($(this).children()[0].innerText !== "" && $(this).children()[1].value !== "") {
            cc_env_vars[$(this).children()[0].innerText] = $(this).children()[1].value;
        }
    });
    var data = {
        'params': JSON.stringify(params),
        'env_vars': JSON.stringify(env_vars),
        'cc_env_vars': JSON.stringify(cc_env_vars),
        'parallel': $('#runTest_parallel').val(),
        'region': $('#runTest_region').val()
    }
    $.ajax({
        url: window.url_prefix + `/api/v1/tests/${getSelectedProjectId()}/backend/${test_id}`,
        data: JSON.stringify(data),
        contentType: 'application/json',
        type: 'POST',
        success: function (result) {
            $("#runTestModal").modal('hide');
            $("#results-list").bootstrapTable('refresh')
        }
    });
}


function setParams(){
    build_id = document.querySelector("[property~=build_id][content]").content;
    testId = document.querySelector("[property~=test_id][content]").content;
    lg_type = document.querySelector("[property~=lg_type][content]").content;
    test_name = document.querySelector("[property~=test_name][content]").content;
    environment = document.querySelector("[property~=environment][content]").content;
//    samplerType = $("#sampler").val().toUpperCase();
    // TODO set correct samplerType and statusType
    samplerType = "REQUEST"
    // statusType = $("#status").val().toLowerCase();
    statusType = "ok"
    aggregator = "auto";
}


function fillSummaryTable(){
    dataErrorTable.forEach((item) => {
        $('#summary_table').bootstrapTable('append', item)
    })
}

function loadRequestData(url, y_label) {
    if ( ! $("#preset").is(":visible") ) {
        $("#preset").show();
        $("#analytics").hide();
        if(analyticsLine!=null){
            analyticsLine.destroy();
        }
    }

    const lineChartData = dataChart; // mock from file.json
    if(window.presetLine!=null){
        window.presetLine.destroy();
    }
    drawCanvas(y_label, lineChartData);
    document.getElementById('chartjs-custom-legend').innerHTML = window.presetLine.generateLegend();
}

function switchSampler() {
    samplerType = $("#sampler").val().toUpperCase();
    resizeChart();
}

function switchStatus() {
    statusType = $("#status").val().toLowerCase();
    resizeChart();
}

function switchAggregator() {
    aggregator = $("#aggregator").val();
    resizeChart();
}

function selectOrUnselectRequests() {
    if ($('#all_checkbox').is(":checked")) {
        $('.custom-checkbox_multicolor').each(function(i, ch) {
            if (ch.id != "all_checkbox") {
                $('#' + ch.id).prop('checked', true);
                updateHiddenProperty(false);
            }
        });
    } else {
        $('.custom-checkbox_multicolor').each(function(i, ch) {
            if (ch.id != "all_checkbox") {
                $('#' + ch.id).prop('checked', false);
                updateHiddenProperty(true);
            }
        });
    }
}

function updateHiddenProperty(hidden) {
    var ci = window.presetLine;
    for (let index = 1; index < ci.data.datasets.length; ++index) {
        var curr = ci.data.datasets[index]._meta;
        curr = Object.values(curr)[0]
        curr.hidden = hidden
    }
    ci.update();
}

updateChart = function(e, datasetIndex) {
    $('#all_checkbox').prop('checked', false);
    var index = datasetIndex;
    var ci = e.view.presetLine;
    var curr = ci.data.datasets[index]._meta;
    curr = Object.values(curr)[0]
    curr.hidden = !curr.hidden
    ci.update();
};


function drawCanvas(y_label, data) {
    const presetsContext=document.getElementById("chart-requests").getContext("2d");
    window.presetLine = Chart.Line(presetsContext, {
        data,
        options: {
            responsive: true,
            hoverMode: 'index',
            stacked: false,
            legendCallback: function (chart) {
                var legendHtml = [];
                for (var i=0; i<chart.data.datasets.length; i++) {
                    if (chart.data.datasets[i].label != "Active Users") {
                        var cb = '<div class="d-flex mb-3">';
                        cb += '<label class="mb-0 w-100 d-flex align-items-center custom-checkbox custom-checkbox__multicolor">'
                        cb += '<input class="mx-2" type="checkbox" checked="true" style="--cbx-color: ' + chart.data.datasets[i].backgroundColor + ';" '
                        cb += 'onclick="updateChart(event, ' + '\'' + chart.legend.legendItems[i].datasetIndex + '\'' + ')"/>';
                        cb += '<span class="custom-chart-legend-span"></span>'
                        cb += chart.data.datasets[i].label;
                        cb += '</label></div>'
                        legendHtml.push(cb);
                    }
                }
                return legendHtml.join("");
            },
            legend: {
                display: false,
                position: 'right',
                labels: {
                    fontSize: 10,
                    usePointStyle: false
                }
            },
            title:{
                display: false,
            },
            scales: {
                xAxes: [{
                    gridLines: {
                        display:false
                    }
                }],
                yAxes: [{
                    type: "linear", // only linear but allow scale type registration. This allows extensions to exist solely for log scale for instance
                    display: true,
                    position: "left",
                    scaleLabel: {
                        display: true,
                        labelString: y_label
                    },
                    id: "response_time",
                    gridLines: {
                        borderDash: [2, 1],
                        color: "#D3D3D3"
                    },
                    ticks: {
                        beginAtZero: true,
                        maxTicksLimit: 10
                    },
                }, {
                    type: "linear", // only linear but allow scale type registration. This allows extensions to exist solely for log scale for instance
                    display: true,
                    position: "right",
                    gridLines: {
                        display:false
                    },
                    ticks: {
                        beginAtZero: true,
                        maxTicksLimit: 10
                    },
                    id: "active_users",
                }],
            }
        }
    });
}

function fillErrorTable() {
    var start_time = $("#start_time").html()
    var end_time = $("#end_time").html()
    test_name = document.querySelector("[property~=test_name][content]").content;
    $('#errors').bootstrapTable('refreshOptions', {url: window.url_prefix + `/api/v1/chart/errors/table?test_name=${test_name}&start_time=${start_time}&end_time=${end_time}&low_value=${low_value}&high_value=${high_value}`})
}

function resizeChart() {
    console.log('resizeChart')
    if ( $("#analytics").is(":visible") ){
        analyticsData = null;
        analyticsLine.destroy();
        analyticsCanvas();
        recalculateAnalytics();
    }
    ["RT", "AR", "HT", "AN"].forEach( item => {
        if ($(`#${item}`).hasClass( "active" )) {
            $(`#${item}`).trigger( "click" );
        }
    });
    fillErrorTable();
}



function detailFormatter(index, row) {
    var html = []
    html.push('<div style="padding-left: 30px"><p>Method: ' + row['Method'] + '</p>')
    html.push('<p>Request Params: ' + row['Request params'] + '</p>')
    html.push('<p>Headers: ' + row['Headers'] + '</p>')
    html.push('<p>Response body:</p></div>')
    return html.join('')
}

function showConfig() {
    //TODO
    console.log("show test config")
}

function rerunTest() {
    //TODO
    console.log("rerun test with the same config")
}

function setBaseline() {
    var data = {
        test_name: test_name,
        env: environment,
        build_id: build_id
    };

    $.ajax({
        url: window.url_prefix + `/api/v1/baseline/${getSelectedProjectId()}`,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(data)
    });
}

function compareWithBaseline() {
    console.log("here")
    $.get(
        window.url_prefix + `/api/v1/baseline/${getSelectedProjectId()}`,
        {
            test_name: test_name,
            env: environment
        }, function( data ) {
            if (data['baseline'].length != 0) {
                var baseline_id = data['report_id']
                const queryString = window.location.search;
                const urlParams = new URLSearchParams(queryString);
                var report_id = urlParams.get('result_test_id');
                if (report_id == baseline_id) {
                    console.log("Current test is Baseline")
                    $("#compare_with_baseline").html('Current test is Baseline');
                } else {
                    // TODO add comparison page
                    //var url = window.location.origin + "/report/compare?id[]=" + baseline_id + "&id[]=" + report_id;
                    //window.location.href = url;
                    console.log("Compare two reports")
                    $("#compare_with_baseline").html('Compare two reports');
                }

            } else {
                console.log("Baseline is not set yet")
                $("#compare_with_baseline").html('Baseline is not set yet');
            }
        }
    );
}

function setThresholds() {
    //TODO
    console.log("set current report results as threshold")
}

function downloadReport() {
    //TODO
    console.log("download test report")
}

function shareTestReport() {
    //TODO
    console.log("share test report")
}

function stopTest() {
    data = {"test_status": {"status": "Canceled", "percentage": 100, "description": "Test was canceled"}}
    $.ajax({
        url: window.url_prefix + `/api/v1/reports/${getSelectedProjectId()}/${testId}/status`,
        data: JSON.stringify(data),
        contentType: 'application/json',
        type: 'PUT',
        success: function (result) {
            document.location.reload();
        }
    });
}
