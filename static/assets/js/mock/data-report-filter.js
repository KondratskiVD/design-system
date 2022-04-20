const tableColumns = [
    {
        title: 'ID',
        field: 'id',
        checkbox: true
    }, {
        title: 'test name',
        field: 'name',
        sortable: true,
    }, {
        title: 'scan type',
        field: 'scan_type',
        sortable: true,
    }, {
        title: 'scanner',
        field: 'scanner',
        sortable: true,
    }, {
        title: 'description',
        field: 'description',
        sortable: true,
        class: 'w-100',
    }, {
        title: 'severity',
        field: 'severity',
        formatter: 'formatterSeverity',
        sortable: true,
    }, {
        title: 'status',
        field: 'status',
        formatter: 'dataTypeFormatter',
        sortable: true,
    }
]

const tableData = [
    {
        name: 'George',
        scan_type: 'Monkey',
        scanner: 'OWASP ZAP',
        description: 'Lorem ipsum dolor sit amet',
        severity: 'critical',
        status: 'valid'
    },
    {
        name: 'Jeffrey',
        scan_type: 'Giraffe',
        scanner: 'OWASP ZAP',
        description: 'Lorem ipsum dolor sit amet',
        severity: 'medium',
        status: 'valid'
    },
    {
        name: 'Alice',
        scan_type: 'Giraffe',
        scanner: 'Qualys',
        description: 'Lorem ipsum dolor sit amet',
        severity: 'low',
        status: 'ignore'
    },
    {
        name: 'Alice',
        scan_type: 'Tiger',
        scanner: 'Qualys',
        description: 'Lorem ipsum dolor sit amet',
        severity: 'low',
        status: 'valid'
    },
    {
        name: 'Jeffrey',
        scan_type: 'Giraffe',
        scanner: 'OWASP ZAP',
        description: 'Lorem ipsum dolor sit amet',
        severity: 'medium',
        status: 'valid'
    },
    {
        name: 'George',
        scan_type: 'Monkey',
        scanner: 'OWASP ZAP',
        description: 'Lorem ipsum dolor sit amet',
        severity: 'low',
        status: 'valid'
    },
]

const tableColumnsUpdated = [
    {
    title: 'ID',
    field: 'id',
    checkbox: true
    }, {
        title: 'test name',
        field: 'name',
        sortable: true,
    }, {
        title: 'scan type',
        field: 'scan_type',
        sortable: true,
    }
]

const tableDataUpdated = [
    {name: 'George', scan_type: 'Monkey'},
    {name: 'Jeffrey', scan_type: 'Giraffe'},
    {name: 'Alice', scan_type: 'Giraffe'},
]

let filtersData = [
    {
        id: 1,
        title: 'First',
        options: [
            {
                id: 1,
                column: 'Description',
                operator: 'Relish',
                title: 'knowlege',
            },
            {
                id: 2,
                column: 'Ketchup',
                operator: 'Mustard',
                title: 'Lorem ipsum',
            }
        ]
    },
    {
        id: 2,
        title: 'User filter 2',
        options: [
            {
                id: 2,
                column: 'Description',
                operator: 'Ketchup',
                title: 'knowlege',
            }
        ]
    },
    {
        id: 3,
        title: 'Two',
        options: [
            {
                id: 3,
                column: '',
                operator: '',
                title: 'knowlege',
            }
        ]
    }
]