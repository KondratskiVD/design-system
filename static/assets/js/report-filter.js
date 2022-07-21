const StatusFilter = {
    props: ['activeTab'],
    mounted() {
        $('a[data-toggle="pill"]').on('shown.bs.tab', (e) => {
            const activeTab = $(e.target).attr('aria-controls');
            this.$emit('select-tab', activeTab)
        })
    },
    watch: {
        activeTab: {
            handler: function (newVal) {
                if (newVal === 'all') {
                    $('a[aria-controls="all"]').tab('show');
                }
            },
        }
    },
    template: `
        <div>
            <ul class="custom-tabs nav nav-pills mr-3" id="pills-tab" role="tablist">
                <li class="nav-item" role="presentation">
                    <a class="active" id="pills-home-tab" data-toggle="pill" href="#pills-home" role="tab" aria-controls="all" aria-selected="true">ALL</a>
                </li>
                <li class="nav-item" role="presentation">
                    <a class="" id="pills-profile-tab" data-toggle="pill" href="#pills-profile" role="tab" aria-controls="valid" aria-selected="false">VALID</a>
                </li>
                <li class="nav-item" role="presentation">
                    <a class="" id="pills-setting-tab" data-toggle="pill" href="#pills-setting" role="tab" aria-controls="false_positive" aria-selected="false">FALSE POSITIVES</a>
                </li>
                <li class="nav-item" role="presentation">
                    <a class="" id="pills-ignored-tab" data-toggle="pill" href="#pills-ignored" role="tab" aria-controls="ignored" aria-selected="false">IGNORED</a>
                </li>
            </ul>
        </div>
    `
}

const ChooseFilter = {
    props: ['filters', 'loadingFilters', 'loadingDelete', 'selectedFilter'],
    data() {
        return {
            deletingId: null,
        }
    },
    methods: {
        deleteFilter(filter) {
          this.deletingId = filter.id;
          this.$emit('delete-filter', filter)
      }
    },
    template: `
        <div class="dropdown_action">
            <button class="btn btn-secondary btn-icon"
                    role="button"
                    id="dropdownMenuLink"
                    data-toggle="dropdown"
                    aria-expanded="false">
                <i v-if="loadingFilters" class="preview-loader"></i>
                <i v-else class="fas fa-filter"></i>
            </button>

            <ul class="dropdown-menu dropdown-menu-right close-outside" aria-labelledby="dropdownMenuLink">
                <li class="dropdown-item dropdown-menu_item d-flex align-items-center justify-content-between" 
                    @click="$emit('create-filter')">Create new</li>
                <li v-for="filter in filters" 
                    class="dropdown-item dropdown-menu_item d-flex align-items-center justify-content-between"
                    @click="$emit('select-filter', filter)"
                    >
                    <label
                        class="mb-0 w-100 d-flex align-items-center justify-content-between">
                        <span class="d-inline-block">{{ filter.title }}</span>
                        <img v-if="selectedFilter && filter.id === selectedFilter.id" src="/design-system/static/assets/ico/check.svg" class="ml-3">
                    </label>
                    <div class="pl-2">
                        <button
                            class="btn btn-default btn-xs btn-table btn-icon__xs" @click.stop="deleteFilter(filter)">
                            <i v-if="loadingDelete && deletingId === filter.id" class="preview-loader"></i>
                            <i v-else class="fas fa-trash"></i>
                        </button>
                    </div>
                </li>
            </ul>
        </div>
    `
}

const modalSaveFilter = {
    props: ['loading'],
    data() {
        return {
            saveClicked: false,
            filterTitle: '',
        }
    },
    computed: {
        hasError() {
            return this.isShortName() && this.saveClicked;
        }
    },
    methods: {
        isShortName() {
            return this.filterTitle.length < 3;
        },
        saveNewFilter() {
            this.saveClicked = true;
            if (!this.hasError) this.$emit('save-new-filter', this.filterTitle)
        }
    },
    template: `
        <div class="modal-component">
            <div class="modal-card">
                <p class="font-bold font-h3 mb-4">Create filter</p>
                <div class="custom-input" :class="{'invalid-input': hasError}">
                    <input
                        type="text"
                        v-model="filterTitle"
                        placeholder="Text">
                    <span class="input_error-msg">Filter name less then 3 letters</span>
                    <div class="d-flex justify-content-end mt-4">
                        <button type="button" class="btn btn-secondary mr-2" @click="$emit('open-modal')">Cencel</button>
                        <button
                            :disabled="hasError"
                            class="btn btn-basic mr-2 d-flex align-items-center"
                            type="submit"
                            @click="saveNewFilter"
                        >Save <i v-if="loading" class="preview-loader__white ml-2"></i></button>
                    </div>
                </div>
            </div>
        </div>
    `
}

const ReportFilter = {
    props: [
        'selectedFilter',
        'loadingSave',
        'loadingApply'
    ],
    data() {
        return {
            editableFilter: {},
            isValidFilter: true,
            applyClicked: false,
            canSave: false,
        }
    },
    mounted() {
        this.editableFilter = deepClone(this.selectedFilter);
        this.renderSelect();
        const event = new Event('vue_init')
        document.dispatchEvent(event);
    },
    watch: {
        editableFilter: {
            handler: function () {
                this.$nextTick(() => {
                    const arr = []
                    $('.table-filter > tbody > tr').each(function (index, element) {
                        $(element).find('td.cell-input > div').each(function (index, cell) {
                            arr.push(cell.getAttribute('data-valid'));
                        })
                    })
                    this.isValidFilter = arr.every(elem => elem === 'true')
                });
            },
            deep: true
        }
    },
    computed: {
        computedTitle() {
            return this.editableFilter.title || 'New Filter'
        }
    },
    methods: {
        renderSelect() {
            this.$nextTick(() => {
                $('.selectpicker').selectpicker('render');
            });
        },
        addOption() {
            this.editableFilter.options.push({
                id: Math.round(Math.random() * 1000),
                column: '',
                operator: '',
                title: '',
            })
            this.renderSelect();
        },
        removeOption(optionId) {
            this.editableFilter.options = this.editableFilter.options.filter(elem => elem.id !== optionId);
        },
        removeFilter() {
            this.$emit('remove-filter');
        },
        resetFilter() {
            this.editableFilter = deepClone(this.selectedFilter);
            this.renderSelect();
        },
        saveAs() {
            this.$emit('open-modal');
            this.$emit('update-curent-filter', this.editableFilter)
        },
        save() {
            this.$emit('save', this.editableFilter)
        },
        hasError(value) {
            return value.length > 0;
        },
        showError(value) {
            return this.applyClicked ? value.length > 0 : true;
        },
        apply() {
            this.applyClicked = true;
            if(this.isValidFilter) {
                this.$emit('apply', this.editableFilter)
            }
        }
    },
    template: `
        <div class="report-filter bg-gray-000 p-20 mt-24">
            <div class="d-flex justify-content-between mb-2">
                <p class="font-h5 font-bold">{{ computedTitle }}</p>
                <a class="notification-close" @click="removeFilter"></a>
            </div>
            <table class="w-100 table-filter mb-3" id="table-filter">
                <thead>
                    <tr class="font-h6">
                        <th style="min-width: 175px">Column</th>
                        <th style="min-width: 175px">Operator</th>
                        <th>Data</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="option in editableFilter.options" :key="option.id">
                        <td class="pr-2 pb-2 cell-input">
                            <div class="select-validation" :class="{'invalid-select': !showError(option.column)}"
                                :data-valid="hasError(option.column)">
                                <select class="selectpicker bootstrap-select__b"
                                    v-model="option.column"
                                    data-style="btn">
                                    <option>Mustard</option>
                                    <option>Ketchup</option>
                                    <option>Relish</option>
                                    <option>Description</option>
                                </select>
                                <span class="select_error-msg">Column is required!</span>
                            </div>
                        </td>
                        <td class="pr-2 pb-2 cell-input">
                            <div class="select-validation" :class="{'invalid-select': !showError(option.operator)}"
                                :data-valid="hasError(option.operator)">
                                <select class="selectpicker bootstrap-select__b"
                                    v-model="option.operator"
                                    data-style="btn">
                                    <option>Mustard</option>
                                    <option>Ketchup</option>
                                    <option>Relish</option>
                                    <option>Description</option>
                                </select>
                                <span class="select_error-msg">Operator is required!</span>
                            </div>
                        </td>
                        <td class="w-100 pb-2 cell-input">
                            <div class="custom-input" :class="{'invalid-input': !showError(option.title)}"
                                :data-valid="hasError(option.title)">
                                <input
                                    type="text"
                                    v-model="option.title"
                                    placeholder="Some data">
                                <span class="input_error-msg">Data is required!</span>
                            </div>
                        </td>
                        <td class="cell-icon">
                            <div class="d-flex justify-content-end table-action align-items-center pl-2 pt-2">
                                <button 
                                    v-if="editableFilter.options.length > 1"
                                    type="button" class="btn btn-24 btn__purple"
                                    @click="removeOption(option.id)"><i class="fas fa-minus"></i>
                                 </button>
                                <button type="button" class="btn btn-24 btn__purple" @click="addOption"><i class="fas fa-plus"></i></button>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
            <div class="d-flex justify-content-start">
                <button class="btn btn-basic mr-2 d-flex align-items-center"
                    type="button"
                    @click="apply">Apply
                        <i v-if="loadingApply" class="preview-loader__white ml-2"></i>
                    </button>
                <button v-if="this.editableFilter.id"
                    type="button"
                    class="btn btn-secondary mr-2"
                    @click="resetFilter">Reset</button>
                <button v-if="this.editableFilter.id" 
                    :class="{'btn-secondary': loadingSave}"
                    :disabled="!isValidFilter"
                    @click="save"
                    class="btn btn-default d-flex align-items-center"
                    >Save <i v-if="loadingSave" class="preview-loader ml-2"></i>
                </button>
                <button class="btn btn-default" @click="saveAs" :disabled="!isValidFilter">Save as...</button>
            </div>
        </div>
    `
}

const FilterComponent = {
    components: {
        'report-filter': ReportFilter,
        'choose-filter': ChooseFilter,
        'modal-save-filter': modalSaveFilter,
        'status-filter': StatusFilter
    },
    data() {
        return {
            showModal: false,
            filtersName: [],
            loadingSave: false,
            loadingSaveAs: false,
            loadingApply: false,
            filters: null,
            selectedFilter: null,
            loadingFilters: false,
            loadingDelete: false,
            updatedFilter: null,
            tableData,
            showFilter: false,
            activeTab: 'all',
            loadingTable: false,
        }
    },
    async mounted() {
        this.loadingTable = true;
        this.fetchFilters();
        this.fetchTableData();

        const event = new Event('vue_init');
        document.dispatchEvent(event);
    },
    methods: {
        initTable({ columns, data }) {
            this.tableData = data;
            const tableOptions = {
                columns,
                data: this.tableData,
                theadClasses: 'thead-light'
            }
            $('#table').bootstrapTable(tableOptions)
        },
        fetchTableData() {
            this.loadingTable = true;
            $('#table').bootstrapTable('destroy');
            setTimeout(() => {
                apiFetchTable.then(res => {
                    this.initTable(res);
                }).finally(() => {
                    this.loadingTable = false
                })
            }, 700)
        },
        fetchFilters() {
            this.loadingFilters = true;
            apiFetchFilters.then(res => {
                this.filters = res;
            }).finally(() => {
                this.loadingFilters = false;
            })
        },
        updateTable(filterSetting) {
            this.activeTab = 'all'
            this.loadingApply = true;
            this.loadingTable = true;
            $('#table').bootstrapTable('destroy');
            setTimeout(() => {
                console.log('SETTING FOR SERVER:', filterSetting.options)
                apiFetchTable.then(response => {
                    const {columns, data} = response;
                    const tableOptions = {
                        columns,
                        data,
                        theadClasses: 'thead-light'
                    }
                    this.loadingTable = false;
                    $('#table').bootstrapTable(tableOptions);
                    $('.selectpicker').selectpicker('render');
                }).finally(() => {
                    this.loadingApply = false;
                })
            }, 500)
        },
        createFilter() {
            this.showFilter = true;
            this.selectedFilter = {
                id: null,
                title: '',
                options: [
                    {
                        id: Math.round(Math.random() * 1000),
                        column: '',
                        operator: '',
                        title: '',
                    }
                ]
            }
        },
        selectFilter(filter) {
            this.showFilter = true;
            this.selectedFilter = filter;
        },
        setFilters(filters) {
            this.filtersName = filters.map(filter => filter.title);
        },
        openModal() {
            this.showModal = !this.showModal;
        },
        saveFilterAs(createdFilter) {
            this.filters.push(createdFilter);
            this.openModal();
        },
        saveFilter(currentFilter) {
            this.loadingSave = true;
            setTimeout(() => {
                apiSaveFilter(currentFilter).then(response => {
                    this.selectFilter(response.data);
                    showNotify('SUCCESS', response.message);
                    this.fetchFilters();
                }).catch(error => {
                    showNotify('ERROR', error);
                }).finally(() => {
                    this.loadingSave = false;
                })
            }, 500)
        },
        saveNewFilter(filterName) {
            this.loadingSaveAs = true;
            setTimeout(() => {
                apiSaveAsFilter(this.updatedFilter, filterName).then(response => {
                    this.selectFilter(response.data);
                    showNotify('SUCCESS', response.message);
                    this.openModal();
                    this.fetchFilters();
                }).catch(error => {
                    showNotify('ERROR', error);
                }).finally(() => {
                    this.loadingSaveAs = false;
                })
            }, 500)
        },
        updateCurentFilter(updatedFilter) {
            this.updatedFilter = deepClone(updatedFilter);
        },
        deleteFilter(filter) {
            this.loadingDelete= true;
            setTimeout(() => {
                apiDeleteFilter(filter).then((response) => {
                    showNotify('SUCCESS', response.message);
                    this.fetchFilters();
                }).finally(() => {
                    this.loadingDelete = false;
                })
            }, 500);
        },
        removeFilter() {
            this.selectedFilter = null;
            this.showFilter = false;
        },
        selectTab(tab) {
            this.removeFilter();
            this.activeTab = tab;
            this.loadingTable = true;
            $('#table').bootstrapTable('destroy');
            setTimeout(() => {
                apiTabFilter(tab).then(response => {
                    const { data, columns} = response.data;
                    const tableOptions = {
                        columns,
                        data,
                        theadClasses: 'thead-light'
                    }
                    this.loadingTable = false;
                    $('#table').bootstrapTable(tableOptions);
                    $('.selectpicker').selectpicker('render');
                }).finally(() => {
                    this.loadingApply = false;
                })
            }, 500)
        }
    },
    template: `
        <div class="pt-4">
                    <modal-save-filter
                        v-if="showModal"
                        @save-filter-as="saveFilterAs"
                        @open-modal="openModal"
                        @save-new-filter="saveNewFilter"
                        :loading="loadingSaveAs"
                    ></modal-save-filter>
                    <div class="d-flex justify-content-end pb-4">
                        <status-filter
                            :active-tab="activeTab"
                            @select-tab="selectTab"
                        ></status-filter>
                        <choose-filter
                            :filters="filters"
                            :loading-filters="loadingFilters"
                            :loading-delete="loadingDelete"
                            :selected-filter="selectedFilter"
                            @select-filter="selectFilter"
                            @create-filter="createFilter"
                            @delete-filter="deleteFilter"
                        ></choose-filter>
                    </div>
                    <report-filter
                        @remove-filter="removeFilter"
                        v-if="showFilter"
                        :key="selectedFilter"
                        :selected-filter="selectedFilter"
                        @open-modal="openModal"
                        @update-curent-filter="updateCurentFilter"
                        @save="saveFilter"
                        :loading-save="loadingSave"
                        :loading-apply="loadingApply"
                        @apply="updateTable"
                    ></report-filter>
                    <div v-if="loadingTable" class="d-flex align-items-center justify-content-center" style="height: 270px">
                        <i class="preview-loader"></i>
                    </div>
                    <table
                        id="table"
                        class="table table-border mt-4"
                        data-pagination="true"
                        data-page-list="[5, 10, 15]"
                        data-pagination-pre-text="<img src='/design-system/static/assets/ico/arrow_left.svg'>"
                        data-pagination-next-text="<img src='/design-system/static/assets/ico/arrow_right.svg'>"
                        data-page-size=5>
                    </table>
                </div>
    `
}

register_component('filter-component', FilterComponent)
